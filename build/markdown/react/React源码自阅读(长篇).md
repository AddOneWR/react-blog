## 背景

准备有时间写一个类`react`的框架，所以先读一下`react`的源码

## 开始

这里先自己用parcel简单搭建了一个React环境又随便写了点组件

### 组件

```Javascript
import React, { Component } from 'react';

import MyNav from '../components/MyNav'

class MainContainer extends Component {

  componentDidMount(){
    console.log(<MyNav></MyNav>)
  }

  render() {
    return (
      <div>
        <MyNav></MyNav>
      </div>
    );
  }
}

export default MainContainer;
```

这里随便写了一个`Js`, 然后打印了一下`MyNav`组件

![react1-1](http://p5sf6v0wz.bkt.clouddn.com/react1-1.png
)

很明显这是一个`Js`对象而不是`Dom`

如果在里面嵌套一个子元素...

`console.log(<MyNav><div>Hello</div></MyNav>)`


![react1-2](http://p5sf6v0wz.bkt.clouddn.com/react1-2.png)

我们会发现在`props`里多了一个`children`成员，同样也是一个`JS`对象

如果再多嵌套一下的话(这里写的好看点)

```Javascript
console.log(
  <MyNav>
    <div>
      Hello
      <span>React</span>
    </div>
  </MyNav>
)
```

![react1-3](http://p5sf6v0wz.bkt.clouddn.com/react1-3.png)

可以看到这里会在`props`里面无限的套下去，同时如果一个元素内嵌了多个子元素的话，这些子元素在`props`的`children`里会以数组的方式存在

> 在这里不禁唱起：套马滴汉子你威武雄壮~

那我们不如就顺着这个问题深入，先看一下`React.js` 

```Javascript
const React = {
  ...... //省略

  Component,
  createElement: __DEV__ ? createElementWithValidation : createElement,

  ...... //省略
}
```
我们先看一下`Component`

```Javascript
/* 
  node_modules/react/cjs/react.development.js
*/

function Component(props, context, updater) {
  this.props = props;
  this.context = context;
  this.refs = emptyObject;
  // We initialize the default updater but the real one gets injected by the
  // renderer.
  this.updater = updater || ReactNoopUpdateQueue;
}
```

> 组件`extends`的`Components`就是继承的这玩意

这里没什么好说的，一个构造函数，重点是看看那个`children`到底是怎么个回事

然后看一哈`createElement`

```Javascript
/* 
  node_modules/react/cjs/react.development.js
*/

function createElement(type, config, children) {
  var propName;

  // Reserved names are extracted
  var props = {};

  var key = null;
  var ref = null;
  var self = null;
  var source = null;

  ..... // 省略

  // Children can be more than one argument, and those are transferred onto
  // the newly allocated props object.
  var childrenLength = arguments.length - 2;
  if (childrenLength === 1) {
    props.children = children;
  } else if (childrenLength > 1) {
    var childArray = Array(childrenLength);
    for (var i = 0; i < childrenLength; i++) {
      childArray[i] = arguments[i + 2];
    }
    {
      if (Object.freeze) {
        Object.freeze(childArray);
      }
    }
    props.children = childArray;
  }

  ...... //省略

  return ReactElement(type, key, ref, self, source, ReactCurrentOwner.current, props);
}
```

东西都在这里，代码也很容易理解，这里初始化了一堆东西（你可以很清晰的看到`children`的处理方式)，最后用`ReactElement`这个工厂函数返回一个`React`元素

> `Object.freeze`这里就不讲了 有兴趣的去百度一哈

那么问题来了..`Component`是继承来的，那这个`createElement`是什么时候执行的呢?

常规思路是在`render`里, 那就去看一下

```Javascript
var ReactMount = {

  /**入口render方法
   * @param {ReactElement} nextElement 要插入到DOM中的组件
   * @param {DOMElement} container 要插入到的容器
   * @param {?function} callback 回调
   * @return {ReactComponent} Component instance rendered in `container`.返回ReactComponent
   */
  render: function (nextElement, container, callback) {
    return ReactMount._renderSubtreeIntoContainer(
      null,
      nextElement,
      container,
      callback,
    );
  },

  ......
  /**
   * 将ReactElement插入DOM中，并返回ReactElement对应的ReactComponent。
   * ReactElement是React元素在内存中的表示形式，可以理解为一个数据类，包含type，key，refs，props等成员变量
   * ReactComponent是React元素的操作类，包含mountComponent(), updateComponent()等很多操作组件的方法
   */
   /* 
    parentComponent: 当前组件的父组件
    nextElement: 要插入的组件
    container: 要插入的容器
    callback: 回调函数
   */
  _renderSubtreeIntoContainer: function (
    parentComponent,
    nextElement,
    container,
    callback,
  ) {
    callback = callback === undefined ? null : callback;

    var nextWrappedElement = React.createElement(TopLevelWrapper, {
      child: nextElement,
    });
  }

  ......
}
```

在`render`里可以看到用`React`的成员方法`createElement`创建了一个元素返回给了`nextWrappedElement`

我们跟踪一下`nextWrappedElement`

```Javascript
// 获取要插入到的容器的前一次的ReactComponent，这是为了做DOM diff
var prevComponent = getTopLevelWrapperInContainer(container);

if (prevComponent) {
  var prevWrappedElement = prevComponent._currentElement;
  var prevElement = prevWrappedElement.props.child;

  // shouldUpdateReactComponent方法判断是否需要更新,它只对同一DOM层级，type相同，key(如果有)相同的组件做DOM diff，
  if (shouldUpdateReactComponent(prevElement, nextElement)) {
    var publicInst = prevComponent._renderedComponent.getPublicInstance();
    var updatedCallback =
      callback &&
      function () {
        validateCallback(callback);
        callback.call(publicInst);
      };
    ReactMount._updateRootComponent(
      prevComponent,
      nextWrappedElement,
      nextContext,
      container,
      updatedCallback,
    );
    return publicInst;
  } else {
    //直接unmount
    ReactMount.unmountComponentAtNode(container);
  }
  // 对于ReactDOM.render()调用，prevComponent为null
  var reactRootElement = getReactRootElementInContainer(container);
  var containerHasReactMarkup =
    reactRootElement && !!internalGetID(reactRootElement);
  var containerHasNonRootReactChild = hasNonRootReactChild(container);

  var shouldReuseMarkup =
    containerHasReactMarkup &&
    !prevComponent &&
    !containerHasNonRootReactChild;

  var component = ReactMount._renderNewRootComponent(
    nextWrappedElement,
    container,
    shouldReuseMarkup,
    nextContext,
    callback,
  )._renderedComponent.getPublicInstance();
  return component;
}
```

简单梳理一下这个函数: 先拿到前一次的`ReactComponent`做`dom diff`，然后`shouldUpdateReactComponent`判断一下是否需要更新，如果需要的话就`diff`之后`_updateRootComponent`，否则直接卸载；然后调用`_renderNewRootComponent`渲染新的组件，这两个函数都有上文提到的`nextWrappedElement`作为参数

> 到这里问题差不多就解决啦，不过我决定弄个图来直观的表现一哈

![react-component](http://p5sf6v0wz.bkt.clouddn.com/react-component.png
)

至于`instantiateReactComponent`创建的四种组件感觉没什么深入的必要，这里就不讨论了

### 事务

上面组件那一节讨论的`Component`下面还有几行代码

```Javascript
Component.prototype.setState = function(partialState, callback) {
    this.updater.enqueueSetState(this, partialState);
    if (callback) {
      this.updater.enqueueCallback(this, callback, 'setState');
    } 
};
```

这里传入两个参数，分别为新的`state`和回调函数，这里的`updater`是在`Component`中定义的`this.updater = updater || ReactNoopUpdateQueue`

这里我们看一下`enqueueSetState`是啥

```Javascript
enqueueSetState: function(publicInstance, partialState){ 
  var internalInstance = getInternalInstanceReadyForUpdate(
    publicInstance,
    'setState' 
  );
  
  if (!internalInstance) { 
    return;
  }
  
  // 更新队列合并操作
  var queue = internalInstance._pendingStateQueue || (internalInstance._pendingStateQueue = []);
  
  queue.push(partialState);
  enqueueUpdate(internalInstance); 
}
```

`getInternalInstanceReadyForUpdate`获取了当前组件并赋给了`internalInstance`，然后判断`internalInstance`的`_pendingStateQueue`(state更新队列)是否为空，若为空则初始化为数组，然后将`partialState`即新的`state`推入，然后调用`enqueueUpdate`

```Javascript
function enqueueUpdate(component) {

  if (!batchingStrategy.isBatchingUpdates) {
    batchingStrategy.batchedUpdates(enqueueUpdate, component);
    return; 
  }

  dirtyComponents.push(component); 
}
```

当`batchingStrategy.isBatchingUpdates`为`false`，即不处于更新状态的时候，调用`batchedUpdates`对组件进行更新，否则将组件推入`dirtyComponents`中

但是让我们先看一下`batchingStrategy`是个啥..

```Javascript
var ReactDefaultBatchingStrategy = { 
  isBatchingUpdates: false,
  
  batchedUpdates: function(callback, a, b, c, d, e) {
    var alreadyBatchingUpdates = ReactDefaultBatchingStrategy.isBatchingUpdates;
    ReactDefaultBatchingStrategy.isBatchingUpdates = true;
    
    if (alreadyBatchingUpdates) { 
        callback(a, b, c, d, e);
    } else {
        transaction.perform(callback, null, a, b, c, d, e);
    } 
  },
}
```

这里初始状态为`false`，在`batchedUpdates`中拿到此时`ReactDefaultBatchingStrategy`的`isBatchingUpdates`赋给`alreadyBatchingUpdates`，然后将其设置为`true`;如果`alreadyBatchingUpdates`为`true`则直接执行回调函数，否则进行`transaction.perform`

#### Transaction
上面都是铺垫，这里就进入真正的事务里了~ 先放一张官方源码的解析图

![react-transaction](http://p5sf6v0wz.bkt.clouddn.com/react-transaction.png)

事务就是把方法用`wrapper`封装起来，再通过事务的`perform`方法进行调用，从图里可以看出在执行被包裹的方法前后分别执行`initialize`和`close`，一组`initialize`和`close`方法称为一个`wrapper`，事务支持多个`wrapper`叠加

上文的`perform(callback)`即`perform(enqueueUpdate)`，这里再放一张网上随便偷来的流程图帮助理解

![](http://p5sf6v0wz.bkt.clouddn.com/react-setState-preform.png)

我们看一下上文的两个`wrapper`

```Javascript
var RESET_BATCHED_UPDATES = {
  initialize: emptyFunction,
  close: function(){
    ReactDefaultBatchingStrategy.isBatchingUpdates = false
  }
}

var FLUSH_BATCHED_UPDATES = {
  initialize: emptyFunction,
  close: function(){
    ReactUpdates.flushBatchedUpdates.bind(ReactUpdates)
  }
}
```

`RESET_BATCHED_UPDATES`即是一个`wrapper`，从图可以看出它应该是用来修改`isBatchingUpdates`的值，需要更新的时候设置为更新，更新结束后恢复状态，这样不仅可以节省渲染，还能防止`enqueueUpdate`的递归调用导致死循环

> 那么在`dirtyComponents`中是如何进行组件更新的呢?

这里涉及到另一个`wrapper`即`FLUSH_BATCHED_UPDATES`，我们看一下`flushBatchedUpdates`

```Javascript
var flushBatchedUpdates = function() {
  while(dirtyComponents.length || asapEnqueued){
    if(dirtyComponents.length){
      var transaction = ReactUpdatesFlushTransaction.getPooled()
      transaction.perform(runBatchedUpdates,null,transaction)
      ReactUpdatesFlushTransaction.release(transaction)
    }
    ......
  }
}
```

`flushBatchedUpdates`遍历了`dirtyComponents`，然后用事务执行`runBatchedUpdates`方法

搜了一下，这个函数主要执行以下两步

+ 一是通过执行`updateComponent`方法来更新组件
+ 二是若`setState`方法传入了回调函数则将回调函数存入`callbackQueue`队列

先看一下`updateComponent`源码

![](http://p5sf6v0wz.bkt.clouddn.com/react-updateComponent.png)

能看到两个比较重要的函数名`componentWillReceiveProps`和`shouldComponentUpdate`，但是根据`nextState`让我们先看一下`_processPendingState`这个函数

![](http://p5sf6v0wz.bkt.clouddn.com/processPendingState.png)

理解一下:
+ 更新队列为`null`则直接返回原来`state`
+ 若队列不为`null`则返回(大于`1`则合并)

在`updateComponent`中，如果`shouldUpdate`为`true`,则执行`_performComponentUpdate`

![](http://p5sf6v0wz.bkt.clouddn.com/performComponentUpdate.png)

这里能看到`componentWillUpdate`这个生命周期函数，没什么深入的必要，我们看看上文中最后的更新函数`_updateRenderedComponent`

![](http://p5sf6v0wz.bkt.clouddn.com/updateRenderedComponent.png)

拿到新旧组件信息后传给`shouldUpdateReactComponent`，根据返回值`true or false`决定是更新旧组件还是卸载旧组件挂载新组件

![](http://p5sf6v0wz.bkt.clouddn.com/reactSetState.png)
