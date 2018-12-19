# 关于Super

super这个函数，本萌新虽然经常接触(因为每次在React中Class的构造函数中第一行就是这个东西)，但是一直没有研究一下为什么？？？

保持一贯对技术的探究精神，我今天要搞个明白

# Go

**super**关键字用于访问和调用一个对象的父对象上的函数

## 语法

```javascript
// 调用 父对象/父类 的构造函数
super([arguments]); 

// 调用 父对象/父类 上的方法
super.functionOnParent([arguments]);
```

## 描述

在构造函数中使用时，`super`关键字将单独出现，并且必须在使用`this`关键字之前使用。`super`关键字也可以用来调用父对象上的函数

> 为什么一定要在this关键字之前使用?

为了防止你未初始化父对象变量就在这里傻傻的调用，比如：

```javascript
class Parent {
  constructor(width, height) {
    this.name = 'super';
    this.width = width;
    this.height = height;
  }
  sayName() {
    console.log('Hi, I am a ', this.name + '.');
  }
}


class Child extends Parent {
    constructor(length) {
        this.name; // ReferenceError，super 需要先被调用！
        super(length, length); // 它调用父类的构造函数让length作为width和height
    }
}

```

## 正确的例子

### 调用父类的静态方法

```javascript
class Parent {
  constructor() {}
  static say() {
    return 'super';
  }
}

class Child extends Parent {
  constructor() {}
  static sayHello() {
    return 'hello ' + super.say();
  }
}

Child.sayHello(); // 'hello super'
```

### 删除 super 上的属性

这是不允许的

```javascript
class Parent {
  constructor() {}
  say() {
    return 'super';
  }
}

class Child extends Parent {
  constructor() {}
  delete() {
    delete super.say();
  }
}

new Child().delete(); // ReferenceError: invalid delete involving 'super'.
```

### 在对象字面量中使用super.prop

这里使用`setPrototypeOf`将`obj2`的原型加到`obj1`上，然后obj2才能通过`super`调用obj1上的方法

```javascript
let obj1 = {
  method1() {
    console.log("method 1");
  }
}

let obj2 = {
  method2() {
   super.method1();
  }
}

Object.setPrototypeOf(obj2, obj1);
obj2.method2(); // logs "method 1"
```

## React中的super(props)

那么问题来了，为什么要传入props呢?

如果上面的内容你仔细阅读了，你可能就会想到下面的代码：

```javascript
class Component {
    constructor(props) {
        this.props = props；
        // ...
    }
}
```

没错，这差不多就是正确的答案，但是其实你不传入props，你也可以在`constructor`外面调用`this.props`

因为React为了防止你记性不好忘了传props，在你调用构造函数后又设置了一遍

```javascript
// React 内部
const instance = new YourComponent(props);
instance.props = props;
```

哇，那我还传个jer的props？？？

天真！！如果你提出这个疑问，说明你没有好好看上文：因为这段代码是在你`constructor`后执行的，那么如果你不传props，你在`constructor`中调用的this.props就会是未定义

```javascript
class Component {
  constructor(props) {
    this.props = props;
    // ...
  }
}

class Container extends React.Component {
  constructor(props) {
    super();
    console.log(props);      // {}
    console.log(this.props); // undefined
  }
}
```

如果你不传props，这种错误其实是很难调试的，所以尽管这不是必要的，还是推荐你传一下，也不会死。

# 结束

说了这么多，我还是不想写super(props)

# 后记

+ 2018-12-18: [V8 v7.2]('https://v8.js.cn/blog/v8-release-72/')发布...简化了class，确实不用写super了hhh 
