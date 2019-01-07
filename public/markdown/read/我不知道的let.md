## 问题

对于let，我以前对它特性的理解就是：

- 块级作用域
- 不受变量提升
- 暂存死区
- 处理构造函数时创建私有接口

今天才发现：**let在全局环境下的变量声明不会挂载到window上，即你只能通过变量名访问**

## Why

我想了想，这东西跟我所了解的let的几个特性(上文提到的)并没有什么直接的联系，所以我决定先看看它被挂载到哪里了。

```javascript
let a = 1;
var b= 2;
```

随便写两行，去chrome控制台看了一下

![FHCjER.png](https://s2.ax1x.com/2019/01/06/FHCjER.png)

可以看到在全局情况下，var声明的变量被挂载到了Global(即window)上，而let声明的变量被挂载到了Scope中的Script上

难道任何作用域中的let声明的变量都会被挂到Script上么？我觉得不可能...不然Scope Chain就太混乱了，不过我还是测了一次

[![FHPtP0.md.png](https://s2.ax1x.com/2019/01/06/FHPtP0.md.png)](https://imgchr.com/i/FHPtP0)

果然，只有全局环境下let声明的变量才会进入Script

这个Script是什么？为什么要把它们放入Script中？为什么只有全局的let声明才会在Script中?

## 个人理解

**这个Script是什么?**

也是一个Scope，可以理解为Script标签，它们之间可以互相访问，也可以被其他Scope访问

**为什么要把它们放入Script中?**

为了防止污染全局window

**为什么只有全局的let声明才会在Script中?**

因为其他Scope中的变量不会污染window，所以就没有放入的必要了

