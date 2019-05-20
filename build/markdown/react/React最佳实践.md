# React最佳实践

## 入门基础

### 样式

小驼峰

```jsx
<div style={{ backgroundColor: 'red' }} />
```

### 对象展开

```jsx
const foo = { id: 'bar' };
return <div {...foo} /> --> <div id='bar' />
```

### 多属性书写

一行一属性，同时缩进一个层级，保持结尾括号和开始标签对齐

```jsx
<button
  foo='bar'
  id='btn'
  onClick={this.onClick}
/>
```

### 条件语句

```jsx
<div>
  {isLoading && <Loading />}
</div>

<div>
  {isLoggedIn ? <LogoutButton /> : <LoginButton />}
</div>
```

对于条件较为复杂的判断，可以使用辅助函数

```jsx
canShowSecretData() {
  const { dataIsReady, isAdmin, userHasPermissions } = this.props;
  return dataIsReady && (isAdmin || userHasPermissions);
}

<div>
	{this.canShowSecretData() && <SecretData />}
</div>
```

或者使用`getter`方法来取代函数

```jsx
get canShowSecretData() {
  const { dataIsReady, isAdmin, userHasPermissions } = this.props;
  return dataIsReady && (isAdmin || userHasPermissions);
}

<div>
	{this.canShowSecretData && <SecretData />}
</div>
```

同样可以用于计算属性(也可使用`getter`)

```jsx
getPrice() {
  const { currency, value } = this.props;
  return `${currency}${value}`;
}

<div>{this.getPrice()}</div>
```

### 循环

将数组的每一项转成元素

```jsx
<ul>
	{users.map(user => <li>{user.name}</li>)}
</ul>
```

### This绑定

```jsx
class Button extends Component {
  handleClick = index => {
    ...    
  }

  render() {
    return <button onClick={this.handleClick.bind(this, index)} />
  }
}

  // 每次渲染会触发箭头函数，若传递给子组件，子组件每次更新会接受新的prop导致渲染性能低下
class Button extends Component {
  handleClick(index){
    ...    
  }

  render() {
    return <button onClick={() => this.handleClick(index)} />
  }
}

```

## 无状态函数式组件

this 不指向组件本身，与组件实例相关的 setState 等方法以及生命周期方法都无法使用，推荐使用React16.8新增的 Hooks.

如果一个组件不包含任何状态或函数，可以将其改写为无状态函数式组件

```jsx
const Button = ({ text }) => <button>{text}</button>;

export default Button;

```

## 可复用组件

假设组件从 API 路径加载一个消息集合，并在屏幕上显示列表

**PostList主控组件**: 入口组件

```jsx
class PostList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      posts: []
    }
  }

  // 获取数据
  componentDidMount() {
    Posts
      .fetch()
      .then(posts => {
        this.setState({ posts });
      });
  }

  render() {
    const { posts } = this.state;
    return (
      <List
        collection={posts}
        textKey='excerpt'
        titleKey='title'
       />
    )
  }
}

```

**List组件**: 通用 List 组件，循环渲染另一个子组件

```jsx
const List = ({ collection, textKey, titleKey }) => (
	<ul>
    {collection.map(item =>
    	<Item
        key={item.id}
        text={item.textKey}
        title={item.titleKey}
      />
    )}
  </ul>
)

List.propTypes = {
  collection: React.PropTypes.array,
  textKey: React.PropTypes.string,
  titleKey: React.PropTypes.string
}

```

**Item组件**: 渲染内容

```jsx
const Item = ({ text, title }) => (
	<li>
  	<h1>{title}</h1>
    {text && <p>{text}</p>}
  </li>
)

Item.propTypes = {
  text: React.PropTypes.string,
  title: React.PropTypes.string
}

```

假如我们要渲染类似的列表，但是数据是从 props 中获取的...

```jsx
const UserList = ({ users }) => (
	<List
    collection={users}
    textKey='user'
    titleKey='userName'
  />
)

```

## 容器组件与表现组件

可以简单的理解为，容器组件获取并传递数据，表现组件展示收到的数据，这里将数据的逻辑与表现分离成两个组件。

假如我们又一个组件利用地理位置API获取用户定位，并在浏览器页面上显示经纬度。

**容器组件GeolocationContainer**:

```jsx
class GeolocationContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      latitude: null,
      longitude: null
    }
  }
  
  componentDidMount() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(this.handleSuccess);
    }
  }
  
  handleSuccess = ({ coords }) => {
    this.setState({
      latitude: coords.latitude,
      longitude: coords.longitude
    })
  }
  
  render() {
    return <Geolocation {...this.state} />
  }
}

```

**表现组件Geolacation**:

```jsx
const Geolacation = ({ latitude, longitude }) => (
	<div>
  	{latitude && <div>Latitude: {latitude}</div>}
    {longitude && <div>Latitude: {longitude}</div>}
  </div>
)

Geolacation.propTypes = {
  latitude: React.PropTypes.number,
  longitude: React.PropTypes.number
}

```

## HOC

就是个函数，接收组件作为参数，对其进行增强后返回。

假设我们有个需求，需要为每个组件添加相同的 className。

```jsx
const withClassName = Component => props => (
	<Component {...props}  className='wrapper-class' />
)

```

这个函数接收一个组件作为参数，然后返回一个函数，这个函数接收 props 并添加到之前的组件上将其渲染，并且在上面添加了相同的 className ，接下来使用这个函数。

```jsx
const MyComponent = ({ className }) => (
	<div className={className} />
)

const MyComponentWithClassName = withClassName(MyComponent);

/* 即
const MyComponentWithClassName = props => (
	<MyComponent {...props}  className='wrapper-class' />
)
*/

```

同样高阶组件也可以返回一个 Class

```jsx
const withInnerWidth = Component => (
  class extends React.Component {
    constructor(...)
    
    ... // 写法同正常class
    
    render() {
  		return <Component {...this.props} {...this.state} />
  	}
  }
)

```

反向继承

```jsx
function iiHOC(WrappedComponent) {
  return class Enhancer extends WrappedComponent {
    render() {
      if (this.props.loggedIn) {
        // WrappedComponent.render()
        return super.render()
      } else {
        return null
      }
    }
  }
}

```

## 函数子组件

父组件渲染方法触发子函数，子函数执行渲染元素

```jsx
const FunctionAsChild = ({ children }) = children('World');

<FunctionAsChild>
	{name => <div>Hello, {name}</div>}
</FunctionAsChild>

```

我们可以像高阶组件一样应用它，实现逻辑和表现分离

```jsx
<Fetch url='...'>
	{data => <List data={data} />}
</Fetch>

```

## Render Props

Render Props 的思想和函数子组件类似，只不过函数子组件是父组件获取数据，传递给子组件并调用子组件的渲染方法；而 Render Props 是子组件获取数据，然后调用父组件的渲染方法。

```jsx
const App = () => (
  <ChildRenderer render={name => <div>Hello, {name}</div>}
);

```

```jsx
Class ChildRenderer extends Component {
	static propTypes = {
    render: PropTypes.func.isRequired
  }
  
  state = {
    name: ''
  }
  
  ComponentDidMount() {
    fetch()
    	.then(name => this.setState({ name }));
  }
  render() {
    return (
    	<div className='child-wrapper'>
      	{this.props.render(this.state.name)}
      </div>
    )
  }
}

```

## Context

用来上下文跨层级传递数据。原来的 Context 不推荐使用(为什么自己查)，这里讲讲最新的 Context (虽然也不新了)。

```jsx
// 创建context实例
const DataContext = React.createContext({
  name: 'Tom',
  age: 20
});

class App extends Component {
  render() {
    return (
    	<DataContext.Provider value={{ name: 'Bob', age: 20}}>
      	<Family />
      </DataContext.Provider>
    )
  }
}

```

```jsx
// 子组件
const Family = () => <Person />

```

```jsx
// 孙组件
class Person extends Component {
  <DataContext.Consumer>
    {context => (
      <p>Hello, My name is {context.name}, I'm {context.age} years old.</p>
    )}
  </DataContext.Consumer>
}

```

这是最基础的用法，你可以结合 HOC ，Render Props 等等灵活使用

## Ref

```jsx
handleClick() {
	this.element.focus();
}

render() {
  return (
 		<form>
    	<input type="text" ref={element => (this.element = element)} />
      <button onClick={this.handleClick}>Button</button>
    </form>
  )
}

```

ref 上的回调函数会在组件挂载时被调用，元素参数表示输入的 DOM 实例；卸载组件时也会调用这个回调，并传入 null 来释放内存。回调函数要做的事情就是保存元素对象的引用，方便以后使用。

或者

```jsx
class A {
  ref = React.createRef();

	render() {
    return (
    	<div ref={this.ref}></div>
    );
  }
}

```

一般情况下尽量避免使用 ref ，因为它们让代码更偏向命令式，可读性和可维护性都变差了。

## 传送门

Portals 提供了一种非常棒的方法允许你将子节点渲染到父组件以外的 DOM 节点

```jsx
import React from 'react';
import { createPortal } from 'react-dom';

class Dialog extends React.Component {
  constructor(props) {
    super(props);

    const doc = window.document;
    this.node = doc.createElement('div');
    doc.body.appendChild(this.node);
  }

  render() {
    return createPortal(
      <div class="dialog">
        {this.props.children}
      </div>,  //塞进传送门的JSX
      this.node  //传送门的另一端DOM node
    );
  }

  componentWillUnmount() {
    window.document.body.removeChild(this.node);
  }
}

```

## Hooks

### useState

```jsx
import { useState } from 'react';

function Example() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}

```

其中 useState 声明状态变量。参数为当前状态的初始值，函数返回一个数组，第 0 项为当前状态，第 1 项为改变状态的函数。

对于多个状态值，可以多次调用：

```jsx
function ExampleWithManyStates() {
  const [age, setAge] = useState(20);
  const [name, setName] = useState('Tom');
  const [gender, setGender] = useState('male');

```

> 注意的是 react 根据 useState 的出现顺序来对其各自进行处理，所以不要将 useState 放在 ifelse 等会改变其执行顺序的语句中。

### useEffect

```jsx
function Example() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    document.title = `You clicked ${count} times`;
  });

```

- React 每次渲染(包括首次)都会调用一遍 useEffect 中的函数
- 异步执行，不会阻碍浏览器更新视图(不同于 componentDidMount 和 componentDidUpdate)

副作用解绑：

```jsx
useEffect(() => {
  document.addEventListener(...);
  
  return function() {
    document.removeEventListener(...);
  }
});

```

在 useEffect 中返回一个函数，该函数在组件的**下一次渲染**后执行(ComponentWillUncount 只会在组件销毁前执行一次)。

> 为什么要设计成每次渲染后执行？
>
> 如果不这样，注册后，假如注册的对象发生变化，就需要在 Update 函数中对这个对象进行解绑与重新注册。
>
> **可以非常简单的理解为等同于 Update 这个过程**

如何过滤副作用函数？

```jsx
useEffect(() => {
  document.title = `You clicked ${count} times`;
}, [count]); // 只有当count的值发生变化时才会执行

```

如果传入空数组 `[]` 则只会在首次渲染时执行。

其他Hooks：[Hook API 索引](https://react.docschina.org/docs/hooks-reference.html)

