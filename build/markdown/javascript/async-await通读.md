## async ?

### 语法
> async function name([param[, param[, ... param]]]) { statements }

+ **name:** 函数名称
+ **param:** 要传递给函数的参数的名称
+ **statements:** 函数体语句

### 描述
`async` 函数是 `Generator` 函数的语法糖。使用 关键字 `async` 来表示，在函数内部使用 `await` 来表示异步。

当调用一个 `async` 函数时，会返回一个 `Promise` 对象。当这个 `async` 函数返回一个值时，`Promise` 的 resolve 方法会负责传递这个值；当 `async` 函数抛出异常时，`Promise` 的 reject 方法也会传递这个异常值。

`async` 函数中可能会有 `await` 表达式，这会使 `async` 函数暂停执行，等待表达式中的 `Promise` 解析完成后继续执行 `async` 函数并返回解决结果

总的来说为以下4点：

+ **内置执行器**。`Generator` 函数的执行必须依靠执行器，而 `async` 函数自带执行器，调用方式跟普通函数的调用一样
+ **更好的语义**。`async` 和 `await` 相较于 `*` 和 `yield` 更加语义化
+ **更广的适用性**。`co` 模块约定，`yield` 命令后面只能是 Thunk 函数或 Promise对象。而 `async` 函数的 `await` 命令后面则可以是 Promise 或者 原始类型的值（Number，string，boolean，但这时等同于同步操作
+ **返回值是 Promise**。`async` 函数返回值是 Promise 对象，比 Generator 函数返回的 Iterator 对象方便，可以直接使用 `then()` 方法进行调用

>  `await` 关键字仅仅在 async function中有效。如果在 `async function`函数体外使用 `await` ，你只会得到一个语法错误（`SyntaxError`）

> `async/await`的用途是简化使用 `promises` 异步调用的操作，并对一组 `Promises`执行某些操作。正如`Promises`类似于结构化回调，`async/await`类似于组合生成器和 `promises`

### 例子

```Javascript
async function asyncFn() {
    return '我后执行'
}
asyncFn().then(result => {
    console.log(result);
})
console.log('我先执行');

// 我先执行
// 我后执行
```

> async 函数返回的Promise resolve时为异步

```Javascript
async function e() {    
    throw new Error('has Error');
}
e().then(success => console.log('成功', success))   
   .catch(error => console.log('失败', error));

async function throwStatus() {    
    return '可以返回所有类型的值'
}
throwStatus().then(success => console.log('成功', success)              .catch(error => console.log('失败', error));

// 失败
// 成功
```

> `async` 定义的函数内部会默认返回一个`promise`对象，如果函数内部抛出异常或者是返回reject，都会使函数的`promise`状态为失败reject

如下结果会使async函数判定失败reject: 

+ 内部含有直接使用并且未声明的变量或者函数
+ 内部抛出一个错误`throw new Error`或者返回`reject`状态`return Promise.reject('执行失败')`
+ 函数方法执行出错（🌰：Object使用push()）等等...

```Javascript
function resolveAfter2Seconds(x) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(x);
    }, 2000);
  });
}

async function add1(x) { 
  var a = await resolveAfter2Seconds(20); 
  var b = await resolveAfter2Seconds(30); 
  return x + a + b; 
}
 
add1(10).then(v => { 
  console.log(v); // prints 60 after 4 seconds. 
});

async function add2(x) {
  var a = resolveAfter2Seconds(20);
  var b = resolveAfter2Seconds(30);
  return x + await a + await b;
}

add2(10).then(v => {
  console.log(v);  // prints 60 after 2 seconds.
});
```

## await ?

`await`意思是`async wait`(异步等待)。这个关键字只能在使用`async`定义的函数里面使用。任何`async`函数都会默认返回`promise`，并且这个`promise`解析的值都将会是这个函数的返回值，而`async`函数必须等到内部所有的 `await` 命令的 `Promise` 对象执行完，才会发生状态改变

`await`是一个让出线程的标志。`await`后面的函数会先执行一遍，然后就会跳出整个`async`函数来执行后面js栈的代码。等本轮事件循环执行完了之后又会跳回到`async`函数中等待`await`后面表达式的返回值，如果返回值为非`promise`则继续执行`async`函数后面的代码，否则将返回的`promise`放入`Promise`队列（Promise的Job Queue）

> 正常情况下，`await` 命令后面跟着的是 `Promise` ，如果不是的话，也会被转换成一个 立即 `resolve` 的 `Promise`

```Javascript
async function start() {
    console.log('START');
    const time1 = 500;
    const time2 = await first(time1);
    const time3 = await second(time2);
    const res = await third(time3);
    console.log(`最后一次延迟${res}`);
    console.log('END');
}
start();

// START
// 第一次延迟了500
// 第二次延迟了700
// 第三次延迟了900
// 最后一次延迟1100
// END
```

最后一个例子

```Javascript
function testSometing() {
    console.log("testSomething");
    return "return testSomething";
}

async function testAsync() {
    console.log("testAsync");
    return Promise.resolve("hello async");
}

async function test() {
    console.log("test start...");

    const testFn1 = await testSometing();
    console.log(testFn1);

    const testFn2 = await testAsync();
    console.log(testFn2);

    console.log('test end...');
}

test();

var promiseFn = new Promise((resolve)=> { 
                    console.log("promise START...");
                    resolve("promise RESOLVE");
                });
promiseFn.then((val)=> console.log(val));

console.log("===END===")


// test start...
// testSomething
// promise START...
// ===END===
// return testSomething
// testAsync
// promise RESOLVE
// hello async
// test end...
```

> 文章参考于[一次性让你懂async/await，解决回调地狱](https://juejin.im/post/5b1ffff96fb9a01e345ba704)和`MDN`