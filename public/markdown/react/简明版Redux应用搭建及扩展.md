# 简明版Redux应用搭建及扩展

正好这周末群内分享没人参加，我干脆就把分享的时间用来整理这篇文章好了，本文不会涉及 Redux 的相关概念，面向群众：（有一点基础 or 上了多年班可以上手现有仓库） but 但是不会从零搭建 Redux 仓库的人。

## 初始化

### 添加Redux依赖

在你的 React 项目中执行

```node
npm install --save redux react-redux
```

## 目录结构

```
├── src                           
│   ├── components
│   │   ├── component
│   │   │   ├── index.js
│   │   │   ├── connector.js
│   │   │   ├── Component.js
│   │   ├── ....
│   │   ├── ....
│   │
│   ├── redux 
│   │   ├── actions
│   │   ├── reducers
│   │   ├── selectors
│   │   └── actionTypes.js
│   │   └── store.js
│   │
│   ├── constants.js
│   ├── index.js
│   ├── App.js
```

## 开始搭建 Redux 基本环境

下面所有使用的组件名或文件名请根据自己的项目自行修改

### 创建 store

**src/redux/store.js**

```javascript
import { createStore } from "redux";
import rootReducer from "./reducers";

export default createStore(rootReducer);
```

然后挂载，挂载后就不用管 store 了。

**src/index.js**

```javascript
import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import store from "./redux/store";
import App from "./App";

const root = document.getElementById("root");
ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  root
);
```

### 创建 reducer

**src/redux/reducers/index.js**

```javascript
import { combineReducers } from "redux";
import reducerA from "./reducerA";
import reducerB from "./reducerB";

export default combineReducers({ reducerA, reducerB });
```

**src/redux/reducers/reducerA.js**

case 中对数据进行自定义处理然后返回

```javascript
import { TYPES_A, TYPES_B } from "../actionTypes";

const initialState = {
  list: []
};

export default function(state = initialState, action) {
  switch (action.type) {
    case TYPES_A: {
      const { name, age, ... } = action.payload;
      return {
        ...state,
        ...,
      }
    }
    case TYPES_B: {
      ...
    }
  }
}
```

### 创建 action

**src/redux/actions/actionsA**

这东西被触发后会发到上面定义的 reducer，触发相应的 case

```javascript
import { TYPES_A, TYPES_B } from "../actionTypes";

export const typesAction = (name, age) =>({
  type: TYPES_A,
  payload: {
    name,
    age,
    ...
  }
})
```

### 创建 selector

**src/redux/selectors/selector.js**

在这里对你的数据进行过滤处理等操作

```javascript
const getList = store =>
  store.map(item => item);

export const selectList = store => ({
  list: getList(store)
})
```

### 定义 actionTypes

**src/redux/actionTypes.js**

```javascript
export const TYPES_A = "TYPES_A";
export const TYPES_B = "TYPES_B";
```

## 编写组件

**src/components/component-a/index.js**

```javascript
import ComponentA from './connector';

export default ComponentA;
```

**src/components/component-a/connector.js**

```javascript
import { connect } from "react-redux";
import { typesAction } from "../../redux/actions/todoActions";
import { selectList } from "../../redux/selectors/selector";
import ComponentA from './ComponentA';

const mapDispatchToProps = {
  typesAction,
}

const mapStateToProps = state => ({
  list: selectList(state)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ComponentA);
```

**src/components/component-a/ComponentA.js**

可以在 props 中拿到 connect 进来的方法和属性

```javascript
const { list, typesAction } = this.props;
```

## 扩展

### reselect

假如你的 mapStateToProps 是这样的

```javascript
const mapStateToProps = state => {
  const { a, b, c, d } = state;
  return {
    d,
    fab: f(a, b),
    gac: g(a, c),
    xabc: x(a, b, c)
  }
}
```

这样每次 a, b, c 甚至是不相干的 d 发生变化，都会触发无效运算，并且一旦你的状态更复杂，不相干变量增多，那么带来的性能损耗是显然的。

当你 store 中的数据需要进行复杂的运算时，可以使用 reselect 来优化性能（你不必像下面这样把 selector 写在 connector 里，而是单独分出去，比如上面的 selectors 文件夹）

```javascript
import { createSelector } from 'reselect';

fSelector = createSelector(
    a => state.a,
    b => state.b,
    (a, b) => f(a, b)
)
gSelector = createSelector(
    a => state.a,
    c => state.c,
    (a, c) => g(a, c)
)
xSelector =  createSelector(
    a => state.a,
    b => state.b,
    c => state.c,
    (a, b, c) => x(a, b, c)
)

const mapStateToProps = state => {
  const { a, b, c, d } = state;
  return {
    d,
    fab: fSelector(state),
    gac: gSelector(state),
    xabc: xSelector(state)
  }
}

```

createSelector 来创建一个记忆 selector，你不必记住那么多概念，你传入的前面几项都会按顺序作为最后一项函数的参数，这个函数你自己定义并将值返回。当你前几项的**值没有发生改变的话，它是不会进行计算的，你也可以把它理解为缓存**，更多的用法去看[文档](https://github.com/reduxjs/reselect)

### react-loadable

虽然这个东西可能和 Redux 没什么关系，但是我还是想提一下。

这个东西用法很简单，你可以把它用到你的 index.js 中：

```javascript
import Loadable from 'react-loadable';

export const ComponentA = Loadable({
  loader: () => import('./connector'),
  loading: () => null,
});
```

很简单，当你的组件还没有被访问时，你不想引入并加载它，那么你可以使用 react-loadable，loading 参数允许你传入未加载时的样式，它可以像参数名一样是一个 Loading 组件。当然你也可以调用 preload 来预加载，更多的用法去看[文档](https://github.com/jamiebuilds/react-loadable)

最重要的一点是，它可以有效的帮助你 Code Splitting（按需引入）。

### redux-thunk

这是个用来解决 redux 中异步问题的中间件，它将异步问题放在了 action 级别进行解决，而不必放在你的 components 中

比如你如果有类似这样的代码，方法很简单你调用 handleShowToast 并传入字符串，会在窗口中展示你的 toast 并在 3s 后关闭。这其中的 id 又来区分不同的 toast，reducer 中的逻辑我们暂且不管。 

```jsx
let id = 0;
export function handleShowToast(content) {
  const toastId = id++;
  store.dispatch(showToast(toastId, content));

  setTimeout(() => {
    store.dispatch(hideToast(toastId));
  }, 3000)
}

// components
handleShowToast('test');
```

```javascript
// actions
function showToast = (toastId, content) => ({
  type: 'SHOW_TOAST',
  payload: {
    id,
    content,
  }
})

function hideToast = (toastId) => ({
  type: 'HIDE_TOAST',
  payload: { id }
})
```

它可能有这样的缺点：

- handleShowToast 它无法 connect 进 props 因为它并不返回 redux action
- 需要传入 dispatch
- ...

可以改为

```javascript
import { createStore, applyMiddleware } from 'redux'
import reducer from './reducer'
import thunk from 'redux-thunk'

const store = createStore(
  reducer,
  applyMiddleware(thunk),
);

export default store;
```

```javascript
// actions
export function handleShowToast(content) {
  return (dispatch, getState) => {
    const toastId = id++;
    store.dispatch(showToast(toastId, content))

    setTimeout(() => {
      store.dispatch(hideToast(toastId))
    }, 3000)
  }
}

// connector
const mapDispatchToProps = {
  handleShowToast,
}

connect(null, mapDispatchToProps)(Component);

// component
this.props.handleShowToast('test');
```

当 redux-thunk 发现 dispatch 一个函数后，它会传给这个函数一个 dispatch 参数并拦截，防止其被传递到 reducer 中；另外你也可以在 thunk 中读取状态，它会将 getState 作为第二参数传入。

### redux-saga

这是一个用来管理应用程序 Side Effect 的中间件，与 redux-thunk 类似，或者你可以用它来取代 redux-thunk。

例子我们沿用上文的 showToast，如果我们改用 redux-saga 的话，你的代码应该是这样的：

```javascript
// index.js
import { createStore, applyMiddleware } from 'redux'
import createSagaMiddleware from 'redux-saga'
import reducer from './reducers'
import toastSaga from './sagas'

const sagaMiddleware = createSagaMiddleware();
const store = createStore(
  reducer,
  applyMiddleware(sagaMiddleware)
)

sagaMiddleware.run(toastSaga);
```

```javascript
// saga.js
import { call, put, takeEvery, takeLatest } from 'redux-saga/effects';
import { 
  SHOW_TOAST,
  SHOW_TOAST_SUCCESSED, 
  SHOW_TOAST_FAILED 
} from '.../actionTypes';
import Api from '..';

function* toastSaga() {
  // 或者使用 takeLatest，区别是 takeLatest 不允许并发 
  yield takeEvery(SHOW_TOAST, setToastSage);
}

function* setToastSage(action) {
  try {
    const { toastId, content } = action.payload;
    const res = yield.call(Api.showToast, toastId, content);
    yield put({ type: SHOW_TOAST_SUCCESSED, res });
  } catch (e) {
    yield put({type: SHOW_TOAST_FAILED, msg: e.msg});
  }
}

// components
dispatch(showToast(toastId, content));
```

这里只写了 showToast的逻辑，因为两者没差，更多的内容去看[文档](https://redux-saga-in-chinese.js.org/)。

### redux-dynamic-modules

你的 redux 可能过大，但你有时只需要其中的一些功能，所以我们需要一种类似按需加载的能力来节省你的性能。

redux-dynamic-modules 是一个可以动态加载 reducer 代码的库，给 redux store 加上可以热插拔 reducer/saga 的能力，并且提供了 DynamicModuleLoader 让 redux 逻辑可以和 React 组件耦合。也就是可以做到**在 React 组件加载的时候把 reducer 加载进 store，在组件 unmount 的时候把 reducer 也卸载掉**。

当我们使用 react-loadable 时，虽然可以对你的组件按需加载，但是 redux 还是会被打包进来，所以如果使用了 DynamicModuleLoader 就可以将 redux 打包进对应的 loadable 组件中，好处多多。

有一个官方的例子：

- Id：每个 module 唯一的标识
- reducerMap: 每个 module 注册的 reducer
- initialActions: module 被挂载的时候所执行的 actions
- finalActions: module 被卸载的时候所执行的 actions

```javascript
export function getUsersModule() {
    return {
        id: "todo-module",
        reducerMap: {
            todoState: todoReducer,
        },
        initialActions: [TodoActions.initializeTodos()],
        finalActions: [TodoActions.disposeTodos()],
    };
}
```

当 NewUserDialog 被渲染的时候，module 会被添加到 store 中，当组件卸载的时候，module 会被从 store 中移除。

```jsx
import { DynamicModuleLoader } from "redux-dynamic-modules";
import { getUsersModule } from "./getUsersModule";

export class NewUserDialog extends React.Component {
    public render() {
        return (
            <DynamicModuleLoader modules={[getUsersModule()]}>
                <User />
            </DynamicModuleLoader>
        );
    }
}
```

更多的细节想了解的话去看[文档](https://redux-dynamic-modules.js.org/#/reference/Modules)。
