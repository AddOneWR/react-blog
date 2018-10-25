## 介绍
React的生命周期是我们掌握React工作过程所必须掌握的知识，同时也是部分公司的面试考点

## 概要
React严格定义了组件的生命周期，其主要经历了如下三个过程

+ **装载过程(Mount)**: 组件第一次在DOM树中渲染的过程
+ **更新过程(Update)**: 组件重新渲染的过程
+ **卸载过程(Unmount)**: 组件从DOM中删除的过程

## 装载过程

组件第一次被渲染的时候，依次调用的函数为：

+ constructor
+ getInitialState
+ getDefaultProps
+ componentWillMount
+ render
+ componentDidMount

### 1. constructor

ES6中每个类的构造函数，要创建一个组件的实例就要调用相应的构造函数。
但是并不是每个组件都要定义自己的构造函数，比如无状态的React组件。一个组件调用构造函数，往往是为了两个目的：
+ 初始化state
+ 绑定成员函数的this环境

### getInitialState和getDefaultProps

getInitialState：该函数返回值用来初始化state
getDefaultProps: 该函数返回值用来初始化props

这两者只有用React.createClass方法创造的组件类才会发生作用，并且React.createClass已经被Fb官方废弃，所以这里不细讲了

### 2. componentWillMount
这个函数没什么存在感，因为在这个时候没有任何渲染出来的结果，调用setState修改状态也不会触发重新渲染，并且在这里做的事情完全可以提前到constructor中去做

### 3. render

可以说React组件中最重要的函数，因为React组件的父类React.Component类对除render之外的生命周期函数都有默认实现

> render并不做渲染工作，只是返回一个JSX描述的结构，最终由React库根据返回对象决定如何渲染

render应该是一个纯函数，完全根据state和props来决定返回结果，而不产生副作用，所以render中调用setState是错的，因为纯函数不应该引起状态的改变

### 4. componentDidMount

> componentDidMount并不是在render调用后立即调用，其调用的时候render返回的JSX已经渲染了

componentWillMount可以在服务端和浏览器端调用，但是componentDidMount只能在浏览器端调用(因为"装载"过程是不可能在服务端完成的)

异步请求数据一般都在该函数内进行。

## 更新过程

更新过程会依次调用以下生命周期函数：
+ componentWillReceiveProps
+ shouldComponentUpdate
+ componentWillUpdate
+ render
+ componentDidUpdate

> 更新过程并不总是执行所有函数

### 1. componentWillReceiveProps

只要是父组件的render函数被调用，在render里渲染的子组件就会经历更新过程，**不管父组件传递给子组件的props有没有改变**，都会触发componentWillReceiveProps。
> 注意通过setState触发的更新过程不会调用这个函数，不然岂不是死循环了?

### 2. shouldComponentUpdate

应该是除了render之外最重要的函数了。它决定了一个组件什么时候需不需要渲染。
render和shouldComponentUpdate是React中唯二需要有返回值的函数，shouldComponentUpdate返回一个布尔值，告诉React是否需要继续更新，若为true则继续，为false则停止更新，不会触发之后的重新渲染。

### 3. componentWillUpdate
即将render时执行，初始化render时不执行。在这里同样不能setState，
这个函数调用之后，就会把nextProps和nextState分别设置到rops和state中，紧接着调用render

### 4. render
同上

### 5. componentDidUpdate

组件更新完成后执行，初始化render时不执行

## 卸载过程

卸载过程只有一个函数componentWillUnmount，当react组件要从DOM树上删除前，该函数会被调用，所以这个函数适合做一些清理工作。

> eg: 在componentDidMount中用非react方法创建的DOM元素，如果不处理可能会发生内存泄漏，因此可以在该函数中将其清理干净


## 总结

React的生命周期函数并没有想象中的那么复杂


> 参考于《深入理解React》
