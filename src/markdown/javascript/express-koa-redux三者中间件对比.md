这三者对各自的中间件有着不同的实现，作者本人对此也比较好奇，在这里小小的研究一下源码，探究三者之间的异同

# 什么是中间件

在我看来，中间件就是在你的代码运行中进行一些修改的工具。比如你想喝水，那么喝水之前你将水净化就可以理解为是一次中间件的执行。他不是插件，独立于程序之外，而更像是在你的代码中表现一种类似连接的功能

# Koa 与 Express 中间件概述

这两者都是`Node`层面的，这里我们根据官方文档来对比

## Express

```javascript
var app = express();

// 没有挂载路径的中间件，应用的每个请求都会执行该中间件
app.use(function (req, res, next) {
  console.log('Time:', Date.now());
  next();
});

// 挂载至 /user/:id 的中间件，任何指向 /user/:id 的请求都会执行它
app.use('/user/:id', function (req, res, next) {
  console.log('Request Type:', req.method);
  next();
});

// 路由和句柄函数(中间件系统)，处理指向 /user/:id 的 GET 请求
app.get('/user/:id', function (req, res, next) {
  res.send('USER');
});
```

可以看到`express`的中间件是使用`next`进行线性调用的，一个接着一个的执行，是一种尾递归的调用(后文会讲)。然后在最后一个中间件中进行对`response`的处理(习惯)

## Koa

```javascript
const Koa = require('koa');
const app = new Koa();

// x-response-time

app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  ctx.set('X-Response-Time', `${ms}ms`);
});

// logger

app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  console.log(`${ctx.method} ${ctx.url} - ${ms}`);
});

// response

app.use(async ctx => {
  ctx.body = 'Hello World';
});

app.listen(3000);
```

从代码中的`await`可以看出，`koa`的中间件绝对不是线性的，因为一旦使用了`await`，代码就会停止当前中间件的执行转而去执行`await`后面的代码，这里`next`表示下一个中间件。所以这是一个支持`generator`的洋葱圈模型(后文会讲)

![koa洋葱圈](https://user-gold-cdn.xitu.io/2018/9/13/165d21b34c3f3768?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

# Koa 与 Express 中间件源码进一步解析

上面提到，`express`的中间件是尾递归调用，而`koa`的中间件因为使用了`await`所以是支持`generator`的洋葱圈模型，这里以此展开来分析代码

## Express

我们直接进入[application.js](https://github.com/expressjs/express/blob/master/lib/application.js)中观察中间件处理

```javascript
app.handle = function(req, res, callback) {
  var stack = this.stack;
  var idx = 0;
  function next(err) {
    if (idx >= stack.length) {
      callback('err') 
      return;
    }
    var mid;
    while(idx < stack.length) {
      mid = stack[idx++];
      mid(req, res, next);
    }
  }
  next()
}
```

这里`next`方法不断取出`stack`中的中间件并且将自己传递给中间件作为参数，这样中间件只需要调用`next`方法就能不断传递到下一个中间件。在函数的末尾递归调用了`next`方法，所以称为尾递归调用

## Koa

`Koa`对中间件的处理是在一个独立的包`koa-compose`中

```javascript
'use strict'

module.exports = compose

function compose (middleware) {

  return function (context, next) {
    let index = -1
    return dispatch(0)
    function dispatch (i) {
      index = i
      let fn = middleware[i]
      if (i === middleware.length) fn = next
      if (!fn) return Promise.resolve()
      try {
        return Promise.resolve(fn(context, dispatch.bind(null, i + 1)));
      } catch (err) {
        return Promise.reject(err)
      }
    }
  }
}
```

`Koa`中使用了`Promise`来支持异步，这里不停调用`dispatch.bind(null, i + 1)`传递下一个中间件，一个一个中间件向里执行，直到最后一个中间件执行完`resolve`掉，然后不断向前`resolve`中间件，直到第一个中间件被`resolve`。我们可以发现，相应的处理并不在中间件中而是在其`resolve`后

# Redux

对于`redux`的基础`createStore`，`reducer`，`dispatch`等就不解释了，这里直接看`applyMiddleware`的代码

```javascript
import compose from './compose'

export default function applyMiddleware(...middlewares) {
  return createStore => (...args) => {
    const store = createStore(...args)
    let dispatch = () => {
      throw new Error(
        `Dispatching while constructing your middleware is not allowed. ` +
          `Other middleware would not be applied to this dispatch.`
      )
    }

    const middlewareAPI = {
      getState: store.getState,
      dispatch: (...args) => dispatch(...args)
    }
    const chain = middlewares.map(middleware => middleware(middlewareAPI))
    dispatch = compose(...chain)(store.dispatch)

    return {
      ...store,
      dispatch
    }
  }
}
```

这里还是比较好理解的，`middlewareAPI`中包含两个`api`，一个是`store`的`getState`；另一个是覆写的`dispath`，这是一个外部变量，最终指向覆写后的`dispach`，对于`compose`的作用是`compose(f, g, h)` 返回 `() => f(g(h(..args)))`

那么 `dispatch = compose(...chain)(store.dispatch)`即原生的 `store.dispatch` 传入最后一个“中间件”，返回一个新的 dispatch , 再向外传递到前一个中间件，直至返回最终的 dispatch, 当覆写后的dispatch 调用时，每个“中间件“的执行又是从外向内的”洋葱圈“模型






