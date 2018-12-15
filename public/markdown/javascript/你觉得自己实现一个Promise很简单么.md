# 你觉得自己实现一个Promise很简单？

## Promise是什么?

没什么好解释的。。放一个[MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise)

# 开始

我们先简单的写一个使用Promise的例子，test函数返回一个Promise，其中是一个延时器延时500ms后resolve，在外部调用then方法来执行resolve。

```javascript
function test() {
  return new Promise(function(resolve){
    setTimeout(() => {
      resolve('promise finish');
    }, 500);
  });
}

test().then(res => console.log(res));
```

## 初步分析

我们的Promise接收一个函数，这个函数会立即执行，当外部调用then的时候传入一个回调函数并传入resolve的值，很容易写出下面的代码

```javascript
function Promise(fn) {
    let callback = null;
    
    this.then = function(cb) {
        callback = cb;
    }
    
    function resolve(value) {
        callback(value);
    }
    
    fn(resolve);
}
```

这段代码运行没有问题，但是将例子中的resolve放到setTimeout外面就会出现问题

```
TypeError: callback is not a function
```

原因是从Promise声明到then的执行全部为同步代码，当执行resolve时callback还没有被then绑定。但是当其放在setTimeout里面时，执行时本次事件循环已经结束，callback已被绑定。

那只要将resolve中对callback的调用改成异步即可，这能完美解决刚才的问题...。

```javascript
function resolve(value) {
    setTimeout(function(){
    	callback(value);
    }, 0)
}
```

但是如果then也是异步调用的话…他们同时在异步队列中，但是resolve却在then的前面..这又会出现同样的问题

## 添加状态

一个 Promise有以下几种状态:

- **pending:** 初始状态，既不是成功，也不是失败状态
- **fulfilled:** 意味着操作成功完成
- **rejected:** 意味着操作失败

`pending` 状态的 Promise 对象可能触发`fulfilled` 状态并传递一个值给相应的状态处理方法，也可能触发失败状态（`rejected`）并传递失败信息。当其中任一种情况出现时，Promise 对象的 `then` 方法绑定的处理方法（`handlers`）就会被调用（`then`方法包含两个参数：`onfulfilled` 和 `onrejected`，它们都是 Function 类型。当Promise状态为`fulfilled`时，调用 `then` 的 `onfulfilled` 方法，当Promise状态为`rejected`时，调用 `then` 的 `onrejected` 方法）

现在对原来的代码添加状态及其变更

```javascript
const PENDING = 'pending';
const FULFILL = 'fulfill';
const REJECT = 'reject';

function Promise(fn) {
  let state = PENDING; // 初始化状态
  let value = undefined; // 保存resolve值
  let deferred = null; // 保存异步回调函数

  function resolve(newValue) {
    console.log('resolve');
    state = FULFILL; // PENDING ---> FULFILL
    value = newValue; // 保存值

    if(deferred.length > 0) {
      handle(deferred); // 调用回调函数
    }
  }

  function handle(onfulfilled) {
    console.log('handle');
    if(state === PENDING) {
      deferred = onfulfilled;
      return;
    }

    onfulfilled(value);
  }

  this.then = function(callback) {
    console.log('then');
    handle(callback);
  };
	
  fn(resolve);
}
```

```javascript
function test() {
  return new Promise(function(resolve){
    console.log('fn start');
    setTimeout(() => {
      resolve('promise finish');
    }, 500);
  });
}
```

用上面的例子测试，那么流程是：

1. 声明Promise，此时fn传入，resolve放入异步队列执行
2. 继续同步代码，遇到then，并传入callback
3. 将callback作为参数调用handle
4. 此时Promise状态为PENDING，无法fulfilled，将回调函数赋值给deferred并返回
5. 500ms后取出resolve事件，修改状态为FULFILL并获取新值并保保存，然后判断deferred是否存在，若存在则调用handle
6. 回到handle，此时状态已经改变，调用onfulfilled(即传入then中的函数)并传入最后resolve获得的值
7. 结束

过程瞬间就复杂了很多，如果把resolve放到setTimeout外面，这边的的流程在4时就会结束，因为为同步代码，resolve会在then之前执行，也就意味着状态提前改变。

我们对then进行异步调用进行测试，发现没有问题

```javascript
let func = test();

setTimeout(() => {
  func.then(res => console.log(res));
}, 500);

/*
go
fn start
500ms...
resolve
then
handle
promise finish
/*
```

## 链式调用

### 多次调用

这可是Promise的一大特色，我们测试一下

```javascript
test().then(res => console.log(res + '1'))
  .then(res => console.log(res + '2'))
  .then(res => console.log(res + '3'))
```

用脚想想都不行好吧！！又没有返回Promise，不过这个一会再提，我们先完成多次调用

```javascript
func.then(res => console.log(res + '1'));
func.then(res => console.log(res + '2'));
func.then(res => console.log(res + '3'));

/*
go
fn start
then
handle
then
handle
then
handle
resolve
handle
promise finish3
*/
```

因为resolve是异步的，所以在这之前then和handle执行了多次，每次都会覆盖onfulfilled函数，导致最后只有一次最终输出，如果resolve是同步的，那么结果就应该分3次输出。

那么我们只要对延时函数维护一个数组就可以了...关于最后函数的调用，我们只需要修改handle函数即可

```javascript
function handle(onfulfilled) {
    if(state === PENDING) {
      deferred.push(onfulfilled); // 异步函数，推入数组
      return;
    }

    if(onfulfilled instanceof Array) {
      while(onfulfilled.length > 0) onfulfilled.shift()(value); // 清空队列
    } else {
      onfulfilled(value); // 非异步，直接执行
    }
  }
}
```

再次执行，可以发现promise finish从1到3一起打印出来。

### 链式调用实现

只有Promise才可以调用then，所以我们只需要让函数总是返回一个Promise即可，而返回的地方应该在handle函数里面，返回的内容应该是可供下一个then继续调用的handle函数，其中包含着这次的结果。

初步设想

```javascript
function handle(onfulfilled) {
    if(state === PENDING) {
        deferred.push(onfulfilled);
        return;
    }

    if(onfulfilled instanceof Array) {
        while(onfulfilled.length > 0) res = onfulfilled.shift()(value); //对于多次调用只取最后一个值
    } else {
        res = onfulfilled(value);
    }

    return res;
}

this.then = function(callback) {
    let res = handle(callback); // 获取当前then返回值
    return new Promise(function(resolve) {
      resolve(res);
    })
};
```

这个代码只能处理同步的handle…，因为异步的handle是在resolve中调用的而不是在then中，所以只能改变代码架构，修改Promise的返回值

```javascript
function handle(handler) {
    if(state === PENDING) {
        deferred = handler;
        return;
    }

    if(!handler.callback) {
        handler.resolve(value);
        return;
    }

    res = handler.callback(value);
    handler.resolve(res);
}

this.then = function(callback) {
    return new Promise(function(resolve) {
        handle({
            callback: callback,
            resolve: resolve
        });
    });
};

fn(resolve);
```

这里只看handle和then即可，在then中返回了Promise，其函数中是一个handle并且传入了一个对象，其中的callback和resolve都是上一次的引用，然后我们在handle中调用上一次的回调函数以及resolve方法。我们在这里举一个例子来梳理一下流程。

```javascript
function test() {
  return new Promise(function(resolve){
    setTimeout(() => {
      resolve('promise finish');
    }, 500);
  });
}

let func = test();

func.then(res => {
  console.log(res + ' first');
  return res + ' first';
})
  .then(res => console.log(res + ' second'))
```

针对于这个例子，我们的流程是：

1. test执行，返回一个Promise，此时setTimeout作为fn传入后，直接到Promise的最下面执行`fn(resolve)`

1. resolve为异步函数，放入异步队列，此时Promise执行完毕，同步代码继续，遇到下面func.then，即调用Promise中的then方法，`res => console.log(res + 'frist'); ...`作为callback传入

1. 在then方法中返回一个Promise，fn内为一个handle函数的执行，参数为上次的callback和resolve，针对本例子即`res => console.log(res + 'frist'); ...`和`resolve()`

1. 在这个新的Promise中执行到底部fn(resolve)后立即执行handle函数，但是此时本轮事件循环还未结束，2中的resolve并未取出，所以将该handler设置为deferred
2. 此时该Promise执行完毕，同步事件继续，遇到第二个then，**重复2-4**，但是3中的callback为`res => console.log(res + ' second')`
3. 此时同步代码全部执行完毕，500ms过去后2中的resolve从异步队列中取出执行，修改状态为FULFILL，value设置为`promise finish`，同时发现异步函数deferred存在，调用handle函数

> 这里的deferred指的是哪个handler？
>
> 因为闭包的存在，变量得以保存，所以这是哪个函数的resolve就是那个函数的handler

1. 因为为第一个resolve，所以调用第一个callback，打印`promise finish first`，然后调用resolve并传入这次的结果，resolve中的newValue为`promise finish first`，deferred为5中添加的callback
2. 调用第二个handle，打印`promise finish first second`，调用resolve，其中newValue为undefined且没有下一个函数

# 小结

对于reject其实并没有太大变化，这里就不实现了，光是上面那一堆我就要类似了。读过Promise的源码，知道Promise的运行机制，但是真正实现起来却并没有想象的那么顺畅简单。

