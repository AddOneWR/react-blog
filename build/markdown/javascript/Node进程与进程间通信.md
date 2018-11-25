# Node进程与进程间通信

## 起步

Node是在V8引擎上构建的，这就导致Javascript运行在单个进程的单个线程上，它带来了好处是：程序状态单一，在没有多线程的情况下没有锁，线程同步的问题，系统在调度时候较少的上下文切换，很好的提高CPU的使用率。

但是这也存在着一些问题：

- 如何充分利用多核CPU
- 如何保证进程的健壮性和稳定性

但其实Node并不是单线程的，它还有一定的I/O线程，这些线程由底层的libuv处理，这对我们Javascript开发者是透明的，只有遇到C++扩展开发时候才会关注到，但是Javascript是一直运行在V8上的，是单线程。

## 多进程架构

Node中提供了`child_process`模块和`child_process.fork()`函数来实现进程的复制。

```javascript
// worker.js

const http = require('http');
http.createServer(function(req, res) {
    res.end('Hello');
}).listen(Math.random((1 + Math.random()) * 1000), '127.0.0.1'); // 监听不同端口
```

```javascript
const fork = require('child_process').fork;
const cpus = require('os').cpus();
for (let i = 0 ; i < cpus.length ; i++) {
    fork('./worker.js');
}
```

> 上述代码根据CPU数量复制出对应Node进程数

比较著名的是Master-Worker模式，又称主从模式。主进程不负责具体的业务处理，而是负责调度或者管理工作进程，它是趋于稳定的。

Node通过事件驱动的方式在单线程上解决了大并发的问题，启动多个进程只是为了充分将CPU资源利用起来，而不是为了解决并发问题。

[![FkQ6Wn.md.png](https://s1.ax1x.com/2018/11/25/FkQ6Wn.md.png)](https://imgchr.com/i/FkQ6Wn)

> 主线程为Master，下面的工作进程为Worker

## 进程间通信

在上文的Master-Worker模式中，实现主线程管理和调度工作进程的功能，需要主进程和工作进程之间的通信。对于child_process模块，创建好了子进程，然后父子进程通信是十分容易的。

在前端浏览器中，渲染和Javascript公用一个线程，他们之间的矛盾就不提了，为了解决这些问题，HTML5提出了`WebWorker API`。

```javascript
const worker = new Worker('worker.js');
worker.onmessage = function(event) {
    ...
}
    
// worker.js
while(true) {
    ...
    postMessage('...')
}
```

主线程与工作线程之间通过`onmessage`和`postMessage`进行通信。send方法实现父子进程发送数据，message事件实现收听发来的数据。

```javascript
// parent.js
const cp = require('child_process');
const n = cp.fork(__dirname + '/sub.js');

n.on('message', function(m) {
    console.log('parent got message: ' + m);
})

n.send({hello: 'world'});
```

```javascript
// sub.js

process.on('message', function(m) {
    console.log('child got message: ' + m);
})

process.send({foo: 'bar'});
```

为了进行父子进程通信，他们之间会创建IPC通道，通过IPC通道他们才能通过message和send()传递信息

## IPC

IPC全称为Inter-Process Communication，即进程间通信。实现进程间通信的技术有很多，如明明观点，socker，共享内存，消息队列等。Node中实现IPC通道的是管道(pipe)，这是个抽象侧面的称呼，具体细节实现由libuv提供，在window下由命名管道(named pipe)实现，*nix系统则采用Unix Domain Socket实现。

![Fk8ZTO.png](https://s1.ax1x.com/2018/11/25/Fk8ZTO.png)

父进程在创建子进程前，会创建IPC通道并监听他，然后才创建子进程，并且通过环境变量(NODE_CHANNEL_FD)告诉子进程这个IPC通道的文件描述符(文件间访问的凭证)，子进程启动时根据文件描述符去链接这个IPC通道完成父子进程连接。

![Fk8mkD.png](https://s1.ax1x.com/2018/11/25/Fk8mkD.png)

由于IPC通道是由命名管道或者Domain Socket创建的，他们与网络socket行为类似，属于双向通信。不同的是它们在系统内核中完成通信，而不经过实际的网络层，十分高效。在Node中，IPC通道被抽象成Stream对象，在调用send()时发送数据，接收到消息会通过message触发给应用层。

> 只有启动的子进程是Node进程时其才会根据环境变量去创建IPC通道，对于其他子进程无法实现进程间通信，除非其他进程按约定去链接这个已经创建好的IPC通道

### 句柄传递

如果我们想让多个进程监听同一个端口会如何？正常情况下，端口同时只能被一个进程占用。

我们可以让每个进程监听不同的端口，然后让主进程监听主端口，然后将接收到的请求代理到不同端口的进程上

[![Fk8THK.md.png](https://s1.ax1x.com/2018/11/25/Fk8THK.md.png)](https://imgchr.com/i/Fk8THK)

通过代理，可以避免端口不能重复监听的问题，甚至可以在代理进程上做适当的负载均衡。但是每当进程接收到一个连接，就会用掉一个文件描述符。在代理过程中：客户端--->代理进程，代理进程--->工作进程，一共用掉了2个文件描述符。因为系统中的文件描述符是有限的，这种方法影响了系统的扩展能力。

所以为了解决上述问题，Node中添加了发送句柄的功能，send()除了发送数据，还可以发送句柄，第二个可选参数为句柄: 

send(message, [sendHandle])

句柄是一种可以用来标识资源的引用，内部包含了指向对象的文件描述符。通过句柄，可以抛弃代理方案，使主进程接收到socket请求后，将其直接直接发送给工作进程，而不是重新与工作进程之间建立新的socket连接来转发数据

```javascript
// parent.js

const child = require('child_process').fork('child.js');
const server = require('net').createServer();
server.on('connection', function(socket) {
    socket.end('handle by parent\n');
})
server.listen(1337, function() {
    child.send('server', server); // 发送server
})
```

```javascript
// child.js

process.on('message', function(m, server) {
    if(m === 'server') {
        server.on('connection', function(socket) {
            socket.end('handled by child\n');
        })
    }
})
```

执行`node parent.js`开启服务器，然后使用执行`curl "http://127.0.0.1:1337"`，可以发现parent和child交替随处理请求，我们也可以在`server.listen`中send多个server给多个子进程

>  是否可以将服务器句柄发送给子进程后，就关闭服务器的监听，让子进程处理呢？

```javascript
// parent.js

server.listen(1337, function() {
    child.send('server', server); // 发送server
    server.close(); // 关闭
})
```

```javascript
// child.js

const http = require('http');
const server = http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('handled by child, pid is' + process.pid + '\n');
})

process.on('message', function(m, tcp) {
    if(m === 'server') {
        tcp.on('connection', function(socket) {
            socket.emit('connection', socket);
        })
    }
})
```

之后主进程就不会处理请求了，过程如图：

[![FkNKy9.md.png](https://s1.ax1x.com/2018/11/25/FkNKy9.md.png)](https://imgchr.com/i/FkNKy9)

发送完句柄后：

[![FkNle1.md.png](https://s1.ax1x.com/2018/11/25/FkNle1.md.png)](https://imgchr.com/i/FkNle1)

我们发现多个子进程可以同时监听相同端口了

### 端口共同监听

我们独立启动的进程中，TCP服务器端socket套接字的文件描述符不同，导致监听到相同端口时会抛出异常。

Node底层对每个端口监听都设置了SO_REUSEADDR，其含义是不同进程可以就相同的网卡和端口进行监听。

由于独立启动的进程互相之间并不知道文件描述符，所以监听相同端口时就会失败。但对于send()发送的句柄还原出来的服务而言，他们的文件描述符是相同的，所以监听相同的端口不会引起异常。

多个应用监听相同端口时，文件描述符同一时间只能被某个进程所用。换言之就是网络请求向服务器端发送时，只有一个幸运的进程能够抢到连接，也就是说这些进程服务是**抢占式**的
