## 为什么我们需要异步IO?

### 用户体验

在浏览器中，Javascript的处理与UI渲染公用一个单线程，所以在Javascript执行的时候，UI渲染会处于堵塞的状态，这无疑会带来极差的用户体验；所以前端会通过一些异步的手段来获取数据，防止对UI渲染进行阻塞，但是前端获取数据同样取决于后端的反馈。

如果后端的处理是同步的，那么一个数据的返回就必然需要等待之前的数据返回，比如:

```javascript
returnData1(); // 消耗时间M
returnData2(); // 消耗时间N
```

这是两个同步函数，那么后端返回所有数据就需要M+N的时间，如果用异步的话

```javascript
function asyncReturnData1() {
	return ...; // 消耗时间M
} 

function asyncReturnData2() {
    return ...; // 消耗时间N
}
```

后者的数据返回不必等待前者执行完毕，那么后端返回所有数据所需要的时间为Max(M, N)，随着函数的增加以及分布式的应用，同步和异步的差距将更加明显；所以异步极大的提高了后端的相应资源速度，**IO是昂贵的，异步IO是更昂贵的**

### 资源分配

异步IO使得IO在被调用的过程中不会阻塞线程，而是将原来需要用来等待的这段时间处理其他的业务

## 同步/异步IO与阻塞/非阻塞IO

从实际效果而言，异步和非阻塞都达到了并行IO的目的。但是对于计算机内核IO而言，同步/异步和阻塞/非阻塞是两回事

### 阻塞IO

调用阻塞IO后，需要等待IO执行结束才能返回结果；它的一个特点是，一定要等到系统内核层面完成所有操作后，调用才结束

> 比如读取磁盘上的一个文件，系统内核在完成磁盘寻道，读取数据，赋值数据到内存中之后这个调用那个才结束

### 非阻塞IO

非阻塞IO调用后会立即返回(不携带数据)，若想获取数据，需要通文件描述符再次获取

> 文件描述符类似应用程序与系统内核之间的凭证，如果要进行IO调用，需要先打开文件描述符

非阻塞IO也有一些问题，因为它实际上并没有完成完整的IO操作就返回了(没有携带数据)，所以我们需要重复查询之前的调用是否完成，这个操作叫做**轮询**

> 阻塞IO造成CPU等待时间浪费，非阻塞IO需要轮询确认是否完全完成数据获取

## Node的异步IO

### 事件循环

Node的Event Loop分为6个阶段

1. timers：执行setTimeout() 和 setInterval()中到期的callback。
2. I/O callbacks：上一轮循环中有少数的I/Ocallback会被延迟到这一轮的这一阶段执行
3. idle, prepare：队列的移动，仅内部使用
4. poll：最为重要的阶段，执行I/O callback，在适当的条件下会阻塞在这个阶段
5. check：执行setImmediate的callback
6. close callbacks：执行close事件的callback，例如socket.on("close",func)

在浏览器中，每次一个MacroTask执行完毕后，就会去清空MicroTask队列。但是在Node中，在每个阶段完成后，MicroTask队列就会被执行，这就导致**同样的代码在不同的上下文环境下会出现不同的结果**。

举个例子

```javascript
setTimeout(()=>{
    console.log('timer1')

    Promise.resolve().then(function() {
        console.log('promise1')
    })
}, 0)

setTimeout(()=>{
    console.log('timer2')

    Promise.resolve().then(function() {
        console.log('promise2')
    })
}, 0)



浏览器输出：			Node输出:
time1				time1
promise1			time2
time2				promise1
promise2			promise2
```

+ 在浏览器中，setTimeout为MacroTask，所以先取出第一个setTimeout，打印`timer1`并将then回调放入MicroTask，然后去清空MicroTask打印`promise1`，接下来取出第二个setTimeou进行重复操作
+ 在Node中，在timers阶段执行两个setTimeout回调，打印`timer1`和`timer2`，timers阶段结束后清空MicroTask，打印`promise1`和`promise2`

### 观察者

Tick中如何判断是否有事件需要处理？负责这个任务的就是观察者，没个事件循环中有一个或者多个观察者，而判断是否有事件要处理的过程就是向这些观察者询问是否有要处理的事件

> Node中，事件主要来源于网络请求，文件IO等，这些事件对应的观察者有文件IO观察者，网络IO观察者等

### 请求对象

从`Javascript`发起调用到内核执行完IO操作的过渡过程中，存在一种中间产物**请求对象**，加入我们调用`fs.open`函数，从Javascript调用Node的核心模块，核心模块调用`C++`内建模块，内建模块通过`libuv`进行系统调用，这是Node里经典的调用方式

`libuv`作为封装层，有两个平台的实现，在这里实际上是调用了`uv_fs_open()`函数，在这个调用过程中我们创建了一个叫做`FSReqWrap`的请求对象，这个对象中包含了Javascript层传入的参数和当前方法，而回调函数则被设置在这个对象的`oncomplete_sym`属性上

```javascript
req_wrap -> object_ -> Set(oncomplete_sym, callback);
```

对象包装完后，会调用`QueueUserWorkItem()`方法将`FSReqWrap`推入到线程池中等待执行

```javascript
QueueUserWorkItem(&uv_fs_thread_proc,
                  	req,
                 	WT_EXECUTEDEFAULT);
```

`uv_fs_thread_proc`是要执行方法的引用，`req`是方法执行需要的参数，`WT_EXECUTEDEFAULT`是执行的标志，当线程池中有可用线程的时候，我们会调用`uv_fs_thread_proc`，这个函数会根据传入参数的类型调用对应的底层函数

### 执行回调

封装好请求对象并推入线程池中等待执行时异步IO的第一部分，剩下的第二部分是执行回调

当线程池中的IO调用完成时，会将结果存储到`res->result`上，并且同时通知IOCP调用完成并提交执行状态，将线程归还给线程池。

在事件循环的每次Tick中，会调用IOCP中相关的方法来检查线程池中是否有执行完成的请求，若果有则将请求对象加入到IO观察者的队列中，然后将其当做事件进行处理

IO观察者会取出请求对象的`result`属性作为参数，传递给`oncomplete_sym`(之前被设置的回调函数)进行调用执行，**异步IO**流程结束

### 小结

实际上，在Node中，除了Javascript是单线程外，Node自身实际上是多线程的，只是IO线程使用的CPU较少，并且除了用户代码无法并行执行外，所有的IO则是可以并行起来的

## 非IO的异步API

- setTimeout
- setInterval
- setImmediate
- process.nextTick

### 定时器

setTimeout和setInterval与浏览器中表现一致，它们的实现原理与异步IO类似，不过不需要IO线程池的参与。每次调用这两个函数的时候，所创建的定时器会被插入到定时器观察者内部的一个红黑树中，每次Tick执行时，还会从红黑树中迭代取出定时器对象，检查是否超过定时时间，如果超过则形成一个事件，立即执行其回调函数

> 定时器并不总是准确，因为其每次检测是在新的Tick中，如果某次Tick花费较长的时间(尽管时间循环很快)，那么下次执行时也许已经超过了定时时间

### process.nextTick

```javascript
process.nextTick = function(callback) {
    if (process._exiting) return;
    
    if (tickDepth >= process.maxTickDepth)
        maxTickWarn();
    
    var tock = { callback: callback };
    if (process.domain) tock.domain = process.domain;
    nextTickQueue.push(tock);
    if (nextTickQueue.length) {
        process._needTickCallback();
    }
}
```

每次调用`process.nextTick`时，只会将回调函数放入队列中，在下一次Tick时取出执行

定时器中红黑树操作时间复杂度为O(lg(n))，而nextTick时间复杂度为O(1)，相比较process.nextTick在某些方面更高效

### setImmediate

该方法与`process.nextTick`十分类似，都是将回调函数延时执行，但是两者的优先级不同，因为时间循环中的观察者检查是有先后顺序的，`process.nextTick`属于idle观察者，`setImmediate`属于check观察者，在每次Tick中，idle观察者 > IO观察者 > check观察者

在实现上，`process.nextTick`回调函数保存在数组中，而`setImmediate`保存在链表中

在行为中，`process.nextTick`每次循环中会将数组中的回调函数全部执行，但是`setImmediate`只会执行链表中的一个回调函数，这样是为了保证每次循环能够尽快的执行结束，防止CPU占用过多阻塞后续IO调用

```javascript
process.nextTick(() => {
    console.log('nextTick1');
});
process.nextTick(() => {
    console.log('nextTick2');
});
setImmediate(() => {
    console.log('setImmediate1');
    process.nextTick(() => {
        console.log('nextTick3');
    });
});
setImmediate(() => {
    console.log('setImmediate2');
});
console.log('pass');
```

运行结果应该为:

```
pass
nextTick1
nextTick2
setImmediate1
nextTick3
setImmediate2
```
