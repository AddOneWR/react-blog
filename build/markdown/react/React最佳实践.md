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

`this`不指向组件本身，与组件实例相关的`setState`等方法以及生命周期方法都无法使用，推荐使用React16.8新增的`Hooks`

如果一个组件不包含任何状态或函数，可以将其改写为无状态函数式组件

```jsx
const Button = ({ text }) => <button>{text}</button>;

export default Button;
```

## 可复用组件

假设组件从API路径加载一个消息集合，并在屏幕上显示列表

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

**List组件**: 通用List组件，循环渲染另一个子组件

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

假如我们要渲染类似的列表，但是数据是从props中获取的...

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

## 高阶组件

就是个函数，接收组件作为参数，对其进行增强后返回。

假设我们有个需求，需要为每个组件添加相同的className。

```jsx
const withClassName = Component => props => (
	<Component {...props}  className='wrapper-class' />
)
```

这个函数接收一个组件作为参数，然后返回一个函数，这个函数接收props并添加到之前的组件上将其渲染，并且在上面添加了相同的className，接下来使用这个函数。

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

同样高阶组件也可以返回一个Class

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

## Context

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

Render Props的思想和函数子组件类似，只不过函数子组件是父组件获取数据，传递给子组件并调用子组件的渲染方法；而Render Props是子组件获取数据，然后调用父组件的渲染方法。

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
