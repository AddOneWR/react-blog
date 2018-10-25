## 语法

> new Promise( function(resolve, reject) {...} /* executor */  );

**executor**

executor是带有 `resolve` 和 `reject` 两个参数的函数 。Promise构造函数执行时立即调用`executor` 函数， `resolve` 和 `reject` 两个函数作为参数传递给executor（executor 函数在Promise构造函数返回新建对象前被调用）。`resolve` 和 `reject` 函数被调用时，分别将promise的状态改为fulfilled（完成）或rejected（失败）。executor 内部通常会执行一些异步操作，一旦完成，可以调用resolve函数来将promise状态改成fulfilled，或者在发生错误时将它的状态改为rejected。

如果在executor函数中抛出一个错误，那么该promise 状态为rejected。executor函数的返回值被忽略

## 描述

`Promise` 对象是一个代理对象（代理一个值），被代理的值在Promise对象创建时可能是未知的。它允许你为异步操作的成功和失败分别绑定相应的处理方法（handlers）。 这让异步方法可以像同步方法那样返回值，但并不是立即返回最终执行结果，而是一个能代表未来出现的结果的promise对象

一个 Promise有以下几种状态:
+ **pending:** 初始状态，既不是成功，也不是失败状态
+ **fulfilled:** 意味着操作成功完成
+ **rejected:** 意味着操作失败

`pending` 状态的 Promise 对象可能触发`fulfilled` 状态并传递一个值给相应的状态处理方法，也可能触发失败状态（`rejected`）并传递失败信息。当其中任一种情况出现时，Promise 对象的 `then` 方法绑定的处理方法（`handlers`）就会被调用（`then`方法包含两个参数：`onfulfilled` 和 `onrejected`，它们都是 Function 类型。当Promise状态为`fulfilled`时，调用 `then` 的 `onfulfilled` 方法，当Promise状态为`rejected`时，调用 `then` 的 `onrejected` 方法， 所以在异步操作的完成和绑定处理方法之间不存在竞争）

因为 Promise.prototype.then 和  Promise.prototype.catch 方法返回promise 对象， 所以它们可以被链式调用

> 如果一个promise对象处在`fulfilled`或`rejected`状态而不是`pending`状态，那么它也可以被称为`settled`状态。你可能也会听到一个术语`resolved` ，它表示promise对象处于`fulfilled`状态。


## 方法

`Promise.all(iterable)`

这个方法返回一个新的promise对象，该promise对象在iterable参数对象里**所有的promise对象都成功的时候才会触发成功**,一旦有任何一个iterable里面的promise对象**失败则立即触发该promise对象的失败**。触发成功状态以后，会把一个**包含iterable里所有promise返回值的数组**作为成功回调的返回值，顺序跟iterable的**顺序保持一致**；如果这个新的promise对象触发了失败状态，它会把iterable里**第一个触发失败**的promise对象的错误信息作为它的失败错误信息。Promise.all方法常被用于处理**多个promise对象的状态集合**。

`Promise.race(iterable)`

当iterable参数里的任意一个子promise被成功或失败后，父promise马上也会用子promise的成功返回值或失败详情作为参数调用父promise绑定的相应句柄，并返回该promise对象

> 即iterable数组中哪个Promise最先被resolve，就把哪个结果返回到Promise.race(iterable).then()中，不管其结果是成功还是失败

`Promise.reject(reason)`
返回一个状态为失败的Promise对象，并将给定的失败信息传递给对应的处理方法

`Promise.resolve(value)`
返回一个以给定值解析后的Promise对象。但如果这个值是个`thenable`（即带有then方法），返回的promise会“跟随”这个thenable的对象，采用它的最终状态（指resolved/rejected/pending/settled）；如果传入的value本身就是promise对象，则该对象作为Promise.resolve方法的返回值返回；否则以该值为成功状态返回promise对象


例子：
```Javascript
let myFirstPromise = new Promise(function(resolve, reject){
    //当异步代码执行成功时，我们才会调用resolve(...), 当异步代码失败时就会调用reject(...)
    //在本例中，我们使用setTimeout(...)来模拟异步代码，实际编码时可能是XHR请求或是HTML5的一些API方法.
    setTimeout(function(){
        resolve("成功!"); //代码正常执行！
    }, 250);
});

myFirstPromise.then(function(successMessage){
    //successMessage的值是上面调用resolve(...)方法传入的值.
    //successMessage参数不一定非要是字符串类型，这里只是举个例子
    console.log("Yay! " + successMessage);
});

// 250ms后输出"Yay! 成功"
```

## Promise执行原理

先放一个例子：

```Javascriptconsole.log(Promise);
new Promise(resolve => {
    console.log(1);
    resolve(3);
    Promise.resolve().then(()=> console.log(4))
}).then(num => {
    console.log(num)
});
console.log(2);

// 1 2 4 3
```

1. 当你执行resolve时，如果参数为`thenable`(见上文Promise.resolve方法)，则会进入一个Promise链处理(这里跳过)；否则进入下一步

2. 根据Promise的构造函数可以看到，state状态初始化为pending

```Javascript
function Promise(resolver) {
  if (typeof resolver !== 'function') {
    throw new TypeError('resolver must be a function');
  }
  this.state = PENDING;
  this.queue = [];
  this.outcome = void 0;
  if (resolver !== INTERNAL) {
    safelyResolveThenable(this, resolver);
  }
}
```

可以发现当你`new Promise`的时候这个`resolver`就会被调用，传进来的函数支持两个参数，分别是resolve和reject回调：

```Javascript
let resolver = function(resolve, reject) {
    if (success) resolve();
    else reject();
};

new Promise(resolver);
```

![](http://p5sf6v0wz.bkt.clouddn.com/promise-res.png)

thenable函数就是我们传给它的resolver，然后传递onSuccess和onError，分别是我们在resolver里面写的resolve和reject这两个参数，如果我们调了它的resolve即onSuccess(或者onError)函数，就去设置当前Promise对象的state，outcome(resolve的值)等属性

3. 上面的到此为止为同步操作，接下来我们看看`then`里发生了什么

![](http://p5sf6v0wz.bkt.clouddn.com/promise-then.png)

then接受两个参数，分别为成功回调和失败回调。我们在resolver中已经设置好了state，在这里就会通过If语句进入不同的函数，假设我们这里传入了成功回调，于是执行`unwrap`函数

![](http://p5sf6v0wz.bkt.clouddn.com/promise-unwrap.png)

在167行执行then里传给Promise的成功回调，并传递结果outcom

这段代码是包在一个`immediate`函数里的，它可以实现一个nextTick的功能，即在当前代码逻辑单元同步执行完了之后立刻执行，相当于setTimeout 0。immediate里面会调一个scheduleDrain（drain是排水的意思）：

```Javascript
function immediate(task) {
  if (queue.push(task) === 1 && !draining) {
    scheduleDrain();
  }
}
```

```Javascript
var Mutation = global.MutationObserver || global.WebKitMutationObserver;
var scheduleDrain = null;
{
  // 浏览器环境，IE11以上支持
  if (Mutation) {
      // ...
  } 
  // Node.js环境
  else if (!global.setImmediate && typeof global.MessageChannel !== 'undefined')

  }
  // 低浏览器版本解决方案
  else if ('document' in global && 'onreadystatechange' in global.document.createElement('script')) {

  }
  // 最后实在没办法了，用最次的setTimeout
  else {
    scheduleDrain = function () {
      setTimeout(nextTick, 0);
    };
  }
}
```

这里会对兼容性进行判断，优先使用MutationObserver，然后是使用script标签的方式，这种到IE6都支持，最后用setTimeout 0。

关于Mutation可以查看[MDN]()，可以用它来监听DOM结点的变化，如增删、属性变化等。Immediate是这么实现的：

```Javascript
if (Mutation) {
  var called = 0;
  var observer = new Mutation(nextTick);
  var element = global.document.createTextNode('');
  // 监听节点的data属性的变化
  observer.observe(element, {
    characterData: true
  });
  scheduleDrain = function () {
    // 让data属性发生变化，在0/1之间不断切换，
    // 进而触发observer执行nextTick函数
    element.data = (called = ++called % 2);
  };
}
```

使用nextTick回调注册一个observer观察者，然后创建一个DOM节点element，成为observer的观察对象，观察它的data属性。当需要执行nextTick函数的时候，就调一下scheduleDrain改变data属性，就会触发观察者的回调nextTick。它是异步执行的，在当前代码单元执行完之后立刻之行，但又是在setTimeout 0之前执行的。

```Javascript
setTimeout(()=> console.log(5), 0);
new Promise(resolve => {
    console.log(1);
    resolve(3);
    // Promise.resolve().then(()=> console.log(4))
}).then(num => {
    console.log(num)
});
console.log(2);

// 1 2 3 5
```

4. 执行immediate的时候把成功回调push到一个全局的数组queue里面，而nextTick是把这些回调按顺序执行

```Javascript
function nextTick() {
  draining = true;
  var i, oldQueue;
  var len = queue.length;
  while (len) {
    oldQueue = queue;
    // 把queue清空
    queue = [];
    i = -1;
    // 执行当前所有回调
    while (++i < len) {
      oldQueue[i]();
    }
    len = queue.length;
  }
  draining = false;
}
```

它会先把排水的变量draining设置成true，然后处理完成之后再设置成false，我们再回顾一下刚刚执行immediate的判断

```Javascript
function immediate(task) {
  if (queue.push(task) === 1 && !draining) {
    scheduleDrain();
  }
}
```

当queue为空时，push一个变量进来，这个时候queue只有1个元素，返回值就为1。所以如果之前已经push过了，那么这里就不用再触发nextTick，因为第一次的push会把所有queue回调元素都执行的，只要保证后面的操作有被push到这个queue里面就好了。

5. 在最开始的例子中，resolver是异步调用的，这样在走到then的时候state还是pending状态，这样的话就不会进入unwrap

![](http://p5sf6v0wz.bkt.clouddn.com/promise-asres.png)

它会创建一个QueueItem然后放到当前Promise对象的queue属性里面（注意这里的queue和上面说的immediate里全局的queue是两个不同的变量）。然后异步执行结束调用resolve，这个时候queue不为空了：

![](http://p5sf6v0wz.bkt.clouddn.com/promise-final.png)

就会执行queue队列里面的成功回调。因为then是可以then多次的，所以成功回调可能会有多个。它也是调用immediate，在nextTick的时候执行的

也就是说如果是同步resolve的，是通过MutationObserver/Setimeout 0之类的方式在当前的代码单元执行完之后立刻执行成功回调；而如果是异步resolve的，是先把成功回调放到当前Promise对象的一个队列里面，等到异步结束了执行resolve的时候再用同样的方式在nextTick调用成功回调

> 文章参考于[从一道Promise执行顺序的题目看Promise实现](https://juejin.im/post/5aa3f7b9f265da23766ae5ae)和`MDN`