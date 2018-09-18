## 背景
自己对React方面还没有一个系统的整理，并且自己ReactNative方面比较薄弱，毕竟平时很少用ReactNative进行开发，接触的相关项目也比较少，所以在这里对React的一些知识点进行一些总结，顺便提一下ReactNative方面的知识

## 开始

以下内容基本为个人理解，如有错误欢迎指出

### ReactNative相比于原生App的优势和劣势
**优势**
+ 节省编译时间，开发效率快
+ 学习成本极低(对于我)
+ 组件化
+ 热更新

**劣势**
+ 不太稳定
+ 内存占用较高

### React的生命周期

详情可以看我写的这篇[React生命周期简明宝典](https://addonedn.github.io/2018/03/16/React%E7%94%9F%E5%91%BD%E5%91%A8%E6%9C%9F%E7%AE%80%E6%98%8E%E5%AE%9D%E5%85%B8/)

### 关于setState

> setState() schedules an update to a component’s state object. When state changes, the component responds by re-rendering

一个简化的setState调用图
![setState](http://p5sf6v0wz.bkt.clouddn.com/setState.png
)

> 首先，setState是异步执行的

> setState() does not always immediately update the component. It may batch or defer the update until later. This makes reading this.state right after calling setState() a potential pitfall. Instead, use componentDidUpdate or a setState callback (setState(updater, callback)), either of which are guaranteed to fire after the update has been applied. If you need to set the state based on the previous state, read about the updater argument below.setState() does not always immediately update the component. It may batch or defer the update until later. This makes reading this.state right after calling setState() a potential pitfall. Instead, use componentDidUpdate or a setState callback (setState(updater, callback)), either of which are guaranteed to fire after the update has been applied. If you need to set the state based on the previous state, read about the updater argument below.

这里意思大概就是setState并不总是立即生效..可能会有延迟，但是你可以用componentDidUpdate或者回调函数来解决这个问题

至于setState为什么是异步的，深入的话涉及到React的事务机制，比较高级，本人能力有限这里就不误人子弟了，有兴趣的同学可以去自学一波

如果你写代码的时候发现你set的data并没有立即生效，那么它们很可能被batch update了

> setState并不负责更新数据，它只是把state和callback放入_pendingStateQueue和_pendingCallback中，并且把要更新的组件放入dirtyComponents序列

再来个详细一点的图
![setStateX](http://p5sf6v0wz.bkt.clouddn.com/setStateX.png
)

本人目前只能理解到这里了...这个知识点就先到这了

### 关于state(状态)和props(属性)

#### state
React 把组件看成是一个状态机（State Machines）。通过与用户的交互，实现不同状态，然后渲染 UI，让用户界面和数据保持一致，在React里只需要更新state，然后根据新的state进行渲染。state 的主要作用是用于组件保存、控制、修改自己的可变状态，是一个局部的、只能被组件自身控制的数据源

+ 初始值来源于getInitalState（constructor)
+ 只能在组件内部进行setState
+ 代表组件内部自身的状态，只能在自身组件中存在

#### props
组件中的props是一种父级向子级传递数据的方式，作用是让使用该组件的父组件可以传入参数来配置该组件。它是外部传进来的配置参数，组件内部无法控制也无法修改，除非外部传入的props发生改变

**尽量减少react组件的state，来降低组件的复杂性以及维护的难度**

### Ref

React 支持一种非常特殊的属性 Ref ，你可以用来绑定到 render() 输出的任何组件上

这个特殊的属性允许你引用 render() 返回的相应的支撑实例（ backing instance ）。这样就可以确保在任何时间总是拿到正确的实例

例如:

```JavaScript
var MyComponent = React.createClass({
  handleClick: function() {
    // 使用原生的 DOM API 获取焦点
    this.refs.myInput.focus();
  },
  render: function() {
    //  当组件插入到 DOM 后，ref 属性添加一个组件的引用于到 this.refs
    return (
      <div>
        <input type="text" ref="myInput" />
        <input
          type="button"
          value="点我输入框获取焦点"
          onClick={this.handleClick}
        />
      </div>
    );
  }
});
 
ReactDOM.render(
  <MyComponent />,
  document.getElementById('example')
);
```

### Context

在某些场景下，你想在整个组件树中传递数据，但却不想手动地在每一层传递属性。你可以直接在 React 中使用`context` API解决上述问题

> 绝大多数应用不需要使用`context`，这只是一个实验性的API，很有可能在未来的React版本中移除

这里有个官方的`context`[例子](https://reactjs.org/docs/context.html)，代码比较长我就不搬运了

### React事件

React有一套自己的事件系统，一般来说元素绑定事件都要用到[React提供的事件接口](https://reactjs.org/docs/handling-events.html)

React的事件其实是做了一层事件代理(事件委托)，使用一个统一的事件监听器，当事件发生的时候，在映射里找到真正的处理函数并调用，简化了事件处理和回收机制，提升了效率。

> 如果你打印一下这个事件，就会发现是一个Proxy对象

如果在React中绑定了原生事件，组件卸载的时候记得解绑，避免内存泄漏

**所以尽量避免在React中使用混合事件和Dom事件**

### 高阶组件(HOC)
高阶组件（HOC）是React开发中的特有名词，一个函数返回一个React组件，指的就是一个React组包裹着另一个React组件。可以理解为一个生产React组件的工厂

> 一句话概括：接受一个组件作为参数，返回一个组件的函数

有两种类型的HOC:
+ Props Proxy（pp） HOC对被包裹组件`WrappedComponent`的props进行操作
+ Inherbitance Inversion（ii）HOC继承被包裹组件`WrappedComponent`

例子:
```JavaScript
// Target 是一个组件，它作为参数传给了Hoc这个函数
function Hoc(Target) {
  class Wrap extends Component {
    render() {
      return (
          <div className='wrap'>
            <Target />
          </div>
      );
    }
  }
  return Wrap;
}
```



> 本文随时间更新
