# React渲染流程整理

## 挂载

首先import了React对象，这个对象上有一些属性和方法，比如Component, createElement, createClass，然后extends了上面的Component类。这个Component上有一些属性，比如props，refs，context，原型上有一些方法，比如setState等。

然后render方法调用了react上的createElement方法生成对应的js对象，生成后会继续进行挂载操作。

在render挂载的过程中会调用`getTopLevelWrapperInContainer`判断当前容器内有没有组件，如果有则更新，若没有则卸载container。最后不管怎样都会调用`_renderNewRootComponent`方法挂载到真实DOM上。

在`_renderNewRootComponent`方法中，会调用`instantiateReactComponent`包装方法，根据传入的js对象来判断其类型，进行不同的操作:

- 数字和字符串：ReactTextComponent
- React组件(object && type !== string)：ReactCompositeComponent
- 虚拟DOM(object && type === string)：ReactDOMComponent
- Null/undefined：ReactEmptyComponent

> 在这个包装过程中会封装组件`mountComponet`方法

包装完成后调用batchedUpdates，batchedUpdates会调用batchedMountComponentIntoNode，会以事务的形式调用`mountComponentIntoNode`，这里会递归调用`mountComponent`方法。

`mountComponent`方法我局的是react源码里很核心的地方，它会递归的调用自己来获取Js对象对应的DOM，不过不同的封装对象处理的方式是不同的:

- React组件:  递归的调用自己身上的方法，比如element->instance->instance.mountComponent->instance->render->element…直到最后的子节点
- 虚拟DOM：递归调用传入子元素(`mountChildren`方法)

获得组件对应的HTML并返回记为变量markup，然后调用setInnerHtml方法将其设置为container的innerHtml，完成DOM的插入，这个过程中还会调用`precacheNode`方法将处理好的组件对象存储在缓存中，提高结构更新的速度。

## 生命周期

生命周期会在`mountComponent`中进行触发。

### 没有生命周期的三种组件

1. ReactEmptyComponent

相关参数设置为null，没有生命周期，只有组件的挂载和卸载，最后返回形如`<!-->`的HTML，也就是空。

1. ReactTextComponent

逻辑大致相同，最后通过参数拼接

1. ReactDomComponent

逻辑大致相同，根据不同的标签进行识别和处理

### ReactCompositeComponent

处理props，进行相应的赋值->根据render的有无，判断是有状态组件还是无状态组件->处理state->执行ComponentWillMount->执行render获取HTML->执行ComponentDidMount->对子组件重复调用

## 事务与更新

setState方法传入两个参数`partialState`和`callBack`，前者是新的state值，后者是回调函数(会在state更新完成后执行)。

对于setState，在不同的事件中触发会有不同的过程和效果。

1. setState在**合成事件和钩子函数**中是“异步”的，在**原生事件和setTimeout**中都是同步。
2. setState的“异步”并不是说内部由异步代码实现，对于其本身执行的过程和代码都是同步的，只是在合成事件和钩子函数中你调用获取state的时候，state还没有更新，导致你在合成事件和钩子函数中没法立即获得更新后的值，导致了感觉上的“异步”(但是你可以使用第二个参数的回调函数拿到更新的结果)
3. setState的批量更新优化也是建立在“异步”的情况之上，setState会执行类似Object.assign的操作，对于同样的值进行覆盖，不同的值进行合并，在原生事件和setTimeout上不会批量更新。

下面先贴一下requestWork这个函数的部分逻辑

```javascript
function requestWork(root, expirationTime) {
  addRootToSchedule(root, expirationTime);

  if (isRendering) {
    // Prevent reentrancy. Remaining work will be scheduled at the end of
    // the currently rendering batch.
    return;
  }

  if (isBatchingUpdates) {
    // Flush work at the end of the batch.
    if (isUnbatchingUpdates) {
      // ...unless we're inside unbatchedUpdates, in which case we should
      // flush it now.
      nextFlushedRoot = root;
      nextFlushedExpirationTime = Sync;
      performWorkOnRoot(root, Sync, false);
    }
    
    return;
  }

  // TODO: Get rid of Sync and use current time?
  if (expirationTime === Sync) {
    performSyncWork();
  } else {
    scheduleCallbackWithExpiration(expirationTime);
  }
}
```



### 合成事件

首先会执行一系列的对合成事件的处理，之后会进行setState的处理，其中会进入到`requestWork`函数，其中有不同的分支，有isBatchingUpdates和isUnbatchingUpdates两个变量，初始值都为false，但是在之前的方法`interactiveUpdates`中将`isBatchingUpdates`设为true，所以合成分支进入第二个if，但是isUnbatchingUpdates仍然为false，所以return。

return回到外面包裹的函数中，这个函数里有try和catch，你在合成事件中调用的方法(比如打印state)都是在try中执行的，而真正更新state的方法`performSyncWork`是在finally中，所以导致了“异步”。

### 生命周期

生命周期中调用，isRendering为true，直接在第一个分支return回去，处理与合成事件类似，在执行完componentDidMount后才去commitUpdateQueue更新

### 原生事件

原生事件中不需要走合成事件的一系列处理，直接进入第三个if执行performSyncWork更新state，不会被return，所以可以同步拿到更新后的state。

### setTimeout

setTimout的执行场景是你决定的，你可以在合成事件执行，也可以在生命周期中执行，但是你总能同步拿到最新的state。

比如：你在合成事件中执行，在try中调用setTimeout，但是因为异步的原因回调没有执行，所以finally会先执行，isBatchingUpdates变为false，之后再去执行setState，然后就会走和原生事件一样的流程。

### 事务

```
 *                       wrappers (injected at creation time)
 *                                      +        +
 *                                      |        |
 *                    +-----------------|--------|--------------+
 *                    |                 v        |              |
 *                    |      +---------------+   |              |
 *                    |   +--|    wrapper1   |---|----+         |
 *                    |   |  +---------------+   v    |         |
 *                    |   |          +-------------+  |         |
 *                    |   |     +----|   wrapper2  |--------+   |
 *                    |   |     |    +-------------+  |     |   |
 *                    |   |     |                     |     |   |
 *                    |   v     v                     v     v   | wrapper
 *                    | +---+ +---+   +---------+   +---+ +---+ | invariants
 * perform(anyMethod) | |   | |   |   |         |   |   | |   | | maintained
 * +----------------->|-|---|-|---|-->|anyMethod|---|---|-|---|-|-------->
 *                    | |   | |   |   |         |   |   | |   | |
 *                    | |   | |   |   |         |   |   | |   | |
 *                    | |   | |   |   |         |   |   | |   | |
 *                    | +---+ +---+   +---------+   +---+ +---+ |
 *                    |  initialize                    close    |
 *                    +-----------------------------------------+

```

每个方法都被任意个wrapper包裹，必须调用perform进行调用，在被包裹方法前后执行initialize()和close()

```javascript
function method(){
    console.log('111')
};
transaction.perform(method);
//执行initialize方法
//输出'111'
//执行close方法
```

在触发setState之后，进入事务RESET_BATCHED_UPDATES，负责更新组件的状态，在RESET_BATCHED_UPDATES.close()中，会遍历dirtyComponents，在这个过程中会：

1. 执行updateComponent方法来更新组件
2. 若setState传入了回调函数则将回调函数存入callbackQueue队列

在updateComponent方法中执行了`componentWillReceiveProps`和`shouldComponentUpdate`方法，而在他们之前执行了`_processPendingState`方法，在这个方法中：

1. 如果更新队列为null，返回原来的state
2. 如果更新队列有一个更新，返回更新值
3. 如果更新队列有多个更新，通过for循环将他们合并

![AnKUf0.png](https://s2.ax1x.com/2019/03/18/AnKUf0.png)
