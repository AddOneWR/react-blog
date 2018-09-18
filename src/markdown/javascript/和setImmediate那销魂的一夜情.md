## 背景

Rex大佬看完我的那篇[一道简单面试题理解JS事件机制（+1白话讲解)](https://addonedn.github.io/2018/03/14/%E4%B8%80%E9%81%93%E7%AE%80%E5%8D%95%E9%9D%A2%E8%AF%95%E9%A2%98%E7%90%86%E8%A7%A3JS%E4%BA%8B%E4%BB%B6%E6%9C%BA%E5%88%B6%EF%BC%88-1%E7%99%BD%E8%AF%9D%E8%AE%B2%E8%A7%A3/)后推荐我加上setImmediate这个东东.. 于是这篇博客应运而生~

## 简介

This method is used to break up long running operations and run a callback function immediately after the browser has completed other operations such as events and display updates.

> 如果看不懂这段话...那么这篇文章可能不适合你

## 渐进

先来个简单的Node.js的Event loop

```
   ┌───────────────────────┐
┌─>│        timers         │
│  └──────────┬────────────┘
│  ┌──────────┴────────────┐
│  │     I/O callbacks     │
│  └──────────┬────────────┘
│  ┌──────────┴────────────┐
│  │     idle, prepare     │
│  └──────────┬────────────┘      ┌───────────────┐
│  ┌──────────┴────────────┐      │   incoming:   │
│  │         poll          │<─────┤  connections, │
│  └──────────┬────────────┘      │   data, etc.  │
│  ┌──────────┴────────────┐      └───────────────┘
│  │        check          │
│  └──────────┬────────────┘
│  ┌──────────┴────────────┐
└──┤    close callbacks    │
   └───────────────────────┘
```

> Event loop的基础知识这里不再讲解.. 想了解的可以看我上面提到的那篇博文

+ timers: 这个阶段执行setTimeout()和setInterval()设定的回调。
+ I/O callbacks: 执行几乎所有的回调，除了close回调，timer的回调，和setImmediate()的回调。
+ idle, prepare: 仅内部使用。
+ poll: 获取新的I/O事件；node会在适当条件下阻塞在这里。
+ check: 执行setImmediate()设定的回调。
+ close callbacks: 执行比如socket.on('close', ...)的回调。

## 例子

```JavaScript
setTimeout(function timeout () {
  console.log('timeout');
},0);

setImmediate(function immediate () {
  console.log('immediate');
});
```

> setTimeout(fn, 0)几乎等价于setTimeout(fn, 1)

结果如何?

答案是**不确定**，因为不能确定进行到`timers`的时候1ms是否已经过去，如果没过去那就执行`check`中的`setImmediate`了

另外如果在一些特定的上下文中执行，比如`fs.readFile`，该函数的回调执行是在`poll`阶段，那么接下来就一定会先执行`check`中的`setImmediate`

+ 多次调用 `setImmediate` 则把回调都放入队列，在 `check` 阶段都会执行
+ `setImmediate` 回调里调用`setImmediate` ，则放到下次 `event loop`


> 未完待续








