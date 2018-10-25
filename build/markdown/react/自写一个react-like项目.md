## 背景

之前自学了一阵子`React`源码([文章](https://addonedn.github.io/2018/04/18/React%E6%BA%90%E7%A0%81%E9%98%85%E8%AF%BB-1%E7%99%BD%E8%AF%9D/))，感觉自己对`Component`和`setState`,所以这里决定写一个`React-Like`项目加深一下对`React`的理解

## 开始

> 项目使用了`transform-react-jsx`来进行`JSX`和`JS`的转换

### 组件

既然是写`React`，那就先定义一下`React`基本结构

```Javascript
// src/react/index.js
import Component from './Component.js'
import createElement from './CreateReactElement.js'

const React = {
    Component,
    createElement
}

export default React;
```

其中`Component`为基本组件作为父类,`createElement`来创建组件

```Javascript
// src/react/Component.js
import { enqueueSetState } from './StateQueue'

class Component {
  constructor(props){
    this.isComponent = true // 是否为组件
    this.isReplace = false // 是否是更新的组件
    this.props = props
    this.state = {}
  }

  setState(partialState){
    enqueueSetState(partialState, this)
  }
}

export default Component;
```

这里进行了一些基本的初始化, 还定义了`setState`方法，其中调用了`enqueueSetState`(后话)进行组件更新

```Javascript
// src/react/CreateReactElement.js

function createElement(tag, attrs, children){

  var props = {}
  var attrs = attrs || {}

  const childrenLength = arguments.length - 2;
  
  if (childrenLength === 1) {
    props.children = children;
  } else if (childrenLength > 1) {
    var childArray = Array(childrenLength);
    for (let i = 0; i < childrenLength; i++) {
      childArray[i] = arguments[i + 2];
    }
    props.children = childArray;
  }

  return {
    tag,
    attrs,
    props,
    key: attrs.key || null
  }
}

export default createElement;
```

这里同样进行一些初始化操作，但是对传进来的`children`进行了特殊的处理，利用`arguments`获得`children`长度，之后决定是转化成数组还是直接写到`porps`上去，最后将所有属性作为对象返回，当用户创建`React`对象时会自动调用这个函数

### 渲染

同样我们先定义一个`ReactDom`对象

```Javascript
// src/react-dom/index.js

import render from './Render'

const ReactDOM = {
  render: ( nextElement, container ) => {
      return render( nextElement, container );
  }
}

export default ReactDOM;
```

在这里定义了一个大名鼎鼎的`render`函数，传入两个参数分别为当前的元素和要插入的容器，然后调用`Render`文件中的`render`方法

```Javascript
// src/react-dom/Render.js

import {
  createComponent,
  setComponentProps
} from './Diff'
import setAttribute from './Dom'

/**入口render方法
 * @param {ReactElement} nextElement 要插入到DOM中的组件
 * @param {DOMElement} container 要插入到的容器
 */
export function render(nextElement, container){

  if(nextElement == null || container == null) return;

  if(nextElement.isComponent){
    const component = nextElement;

    if (component._container) {
      if (component.componentWillUpdate){
        component.componentWillUpdate();
      } else if (component.componentWillMount) {
        component.componentWillMount();
      }
    }

    component._container = container;

    nextElement = component.render()
  }

  const type = typeof nextElement

  if(type === 'string' || type === 'number'){
    let textNode = document.createTextNode(nextElement);
    return container.appendChild(textNode);
  }

  if(typeof nextElement.tag === 'function'){
    let component = createComponent(nextElement.tag, nextElement.attrs)
    setComponentProps(component,nextElement.attrs, container)
    return render(component.base, container);
  }

  const dom = document.createElement(nextElement.tag)

  if(nextElement.attrs){
    Object.keys(nextElement.attrs).map(key => {
      setAttribute(key, nextElement.attrs[key], dom)
    })
  }

  if(nextElement.props){
    if(typeof nextElement.props.children == 'object'){
      nextElement.props.children.forEach(item => {
        render(item, dom)
      })
    }else{
      render(nextElement.props.children, dom)
    }
  }

  if(nextElement._component){
    if(nextElement._component.isReplace){
      var arr = Array.from(nextElement._component.parentNode.childNodes)
      arr.map((item,index) => {
        if(isSameDom(item,dom)){
          return container.replaceChild(dom, nextElement._component.parentNode.children[index])
        }
      })
    }
  }
  return container.appendChild(dom)
}

function isSameDom(item, dom){
  return (item.nodeName == dom.nodeName && item.nodeType == dom.nodeType && item.nextSibling == dom.nextSibling)
}

export default render;
```

代码比较长，我们这里分段分析一下

```Javascript
const type = typeof nextElement

if(type === 'string' || type === 'number'){
  let textNode = document.createTextNode(nextElement);
  return container.appendChild(textNode);
}
```

如果元素类型为`string`或`number`则直接创建`TextNode`并直接`append`到`container`中里

```Javascript
if(typeof nextElement.tag === 'function'){
  let component = createComponent(nextElement.tag, nextElement.attrs)
  setComponentProps(component,nextElement.attrs, container)
  return render(component.base, container);
}
```

如果元素的`tag`类型为`function`即为`React`组件，则调用`Diff`中的方法来创建组件(后话)

```Javascript
const dom = document.createElement(nextElement.tag)

if(nextElement.attrs){
  Object.keys(nextElement.attrs).map(key => {
    setAttribute(key, nextElement.attrs[key], dom)
  })
}
```

如果都不是的话即为普通元素，则直接调用`document.createElement`创建`Dom`，之后遍历`attrs`调用`setAttribute`来设置属性，`Object.keys`将对象转化成数组方便遍历，接下来我们看一下`setAttribute`方法

```Javascript
function setAttribute(key, value, dom){
  if(key === 'className'){
    key = 'class'
  }

  if(typeof value === 'function'){
    dom[key.toLowerCase()] = value || '';
  }else if(key === 'style'){
    if(typeof value === 'string'){
      dom.style.cssText = value || '';
    }else if(typeof value === 'object'){
      for (let name in value) {
        dom.style[name] = typeof value[name] === 'number' ? value[name] + 'px' : value[name];
      }
    }
  }else{
    if(value){
      dom.setAttribute(key, value);
    }else{
      dom.removeAttribute(key, value);
    }
  }
}

export default setAttribute;
```

+ 先将`className`转化为`class`
+ 若绑定的类型为`function`则转化成小写后写入`dom`属性
+ 若`key`为`style`，则分类讨论，若属性为`string`则写入`cssText`，若为`object`则判断其是否为`number`，若是则自动在后面添加`px`，然后写入`style`
+ 若为其他则直接调用原生`setAttribute`方法
+ 若属性值为空则在`dom`上删除该属性

```Javascript
if(nextElement.props){
  if(typeof nextElement.props.children == 'object'){
    nextElement.props.children.forEach(item => {
      render(item, dom)
    })
  }else{
    render(nextElement.props.children, dom)
  }
}
```

顺着`render`往下看，这里遍历元素的子元素递归渲染

```Javascript
if(nextElement._component){
  if(nextElement._component.isReplace){
    var arr = Array.from(nextElement._component.parentNode.childNodes)
    arr.map((item,index) => {
      if(isSameDom(item,dom)){
        return container.replaceChild(dom, nextElement._component.parentNode.children[index])
      }
    })
  }
}
return container.appendChild(dom)
```

最后判断两次`render`的组件是否为同一个，若为同一个则调用`replaceChild`方法进行替换，否则`appendChild`到容器中

回到上面`nextElement.tag === 'function'`中，其中有两个函数`createComponent`和`setComponentProps`

```Javascript
// src/react-dom/Diff.js

export function createComponent(component, props){
  let instance;
  if(component.prototype && component.prototype.render){
    instance = new component(props)
  }else{
    instance = new component(props)
    instance.constructor = component
    instance.render = function() {
      return this.constructor(props)
    }
  }

  return instance;
}
```

第一个`if`判断是不是`class`创建的组件，若是则直接`new`一个，若不是则为函数返回组件，调整一下`constructor`以及`render`方法，然后将新组件返回

```Javascript
// src/react-dom/Diff.js

export function setComponentProps(component, props, container){
  if (!component.base){
    if (component.componentWillMount) 
      component.componentWillMount();
	}else if(component.componentWillReceiveProps){
		component.componentWillReceiveProps(props);
  }
  
  component.props = props;
  component.parentNode = container

  renderComponent(component, container)
}
```

首先判断组件的`base`是否存在，若存在则判断是否为初次挂载，否则判断是否为接受新的`props`，然后将`props`即`render`中的`attrs`和`container`作为成员添加到`component`上，`parentNode`用来定位父元素方便更新，然后调用`renderComponent`进行组件挂载或者更新

```Javascript
// src/react-dom/Diff.js

export function renderComponent(component, container){
  let base;

  if ( component.base && component.componentWillUpdate ) {
    component.componentWillUpdate();
  }

  base = component.render()

  if (component.base) {
    if (component.componentDidUpdate){
      component.componentDidUpdate();
    }
  }else if(component.componentDidMount) {
    component.componentDidMount();
  }

  component.base = base;
  base._component = component;

  if(!container){
    component.isReplace = true
    render(base, component.parentNode)
  }
}
```

`base`为`createComponent`中的`component`渲染后结果，然后进行一下简单的生命周期判断，最后判断`container`是否为空，若为空则为更新组件，把`component.parentNode`作为`container`传回`render`

### State更新

在文章开始提到过，`Component`中的`setState`方法调用了`enqueueSetState`

```Javascript
// src/react/StateQueue.js

const batchingUpdates = [] // 需要更新的状态
const dirtyComponent = [] // 需要更新的组件
var isbatchingUpdates = false // 是否处于更新状态

function callbackQueue(fn){
  return Promise.resolve().then(fn);
}

export function enqueueSetState(partialState, component){
  if(!isbatchingUpdates){
    callbackQueue(flushBatchedUpdates)
  }

  isbatchingUpdates = true

  batchingUpdates.push({
    partialState,
    component
  })

  if(!dirtyComponent.some(item => item === component)){
    dirtyComponent.push(component)
  }
}
```

`isbatchingUpdates`判断事务是否处于更新状态(初始值为`false`)，若不为更新则调用`callbackQueue`来执行`flushBatchedUpdates`函数来更新组件，然后设置更新状态为`true`，将当前状态和组件添加到`batchingUpdates`中，最后判断`dirtyComponent`中是否有当前组件，若无则添加进去

> `callbackQueue`使用了`Promise`来达到延时模拟`setState`的功能

```Javascript
// src/react/StateQueue.js

function flushBatchedUpdates(){
  let queueItem, componentItem;
  while(queueItem = batchingUpdates.shift()){
    const { partialState, component } = queueItem;

    if(!component.prevState){
      component.prevState = Object.assign({}, partialState)
    }

    if(typeof partialState == 'function'){
      Object.assign(component.state, partialState(component.prevState, component.props))
    }else{
      Object.assign(component.state, partialState)
    }

    component.prevState = component.state
  }

  while(componentItem = dirtyComponent.shift()){
    renderComponent(componentItem)
  }

  isbatchingUpdates = false
}
```

遍历`batchingUpdates`数组排头(`shift`自查)，获取其中组件和状态，判断组件的前一个状态，若无之前的状态，则将空对象和当前状态合并设为该组件的初始状态，若💰一状态为`function`，则调用该函数并将返回值和之前状态合并，若不为函数则直接合并，然后设置组件的上一状态为其之前的状态，最后遍历`dirtyComponent`更新组件，完成后设置`isbatchingUpdates`为`false`

至此，基本功能完成

代码请移步[GitHub仓库](https://github.com/AddOneDn/react-like)