## 背景

最近在看Javascript引擎的时候看到了`Shape`这个东西， 在这里理解并且延伸一下

## 预热 - JS内存机制

### 内存模型

JS内存空间分为栈(stack)、堆(heap)、池(一般也会归类为栈中)。简单来理解的话，其中基础数据类型大多数保存在栈中(闭包除外)，对象保存在堆中，常量保存在池中。

+ 对于栈中的数据，根据先进后出来取，若想取下层的数据，就要先将上层的数据取出
+ 对于堆中的数据，Js是不允许直接访问的，我们实际操作的都是对象的引用而不是它的本身，例如`var a = { b: 20 }`，当我们操作`{ b: 20 }`时，实际上是从栈中访问`a`来获取对象的地址引用，再从堆中获取我们需要的数据

> 其他一些细节知识这里就懒得写的

## Shape

### 基础

我们无时不刻都在访问属性，那么对于JS来说，快速的属性访问就是必不可少的。这时，对于几个拥有相同属性的对象：
```Javascript
const obj1 = { a: 1, b: 2 };
const obj2 = { a: 3, b: 4 };
```
它们有相同的键值对，我们可以说它们有相同的`Shape`(即`key`)，对于这种数据，JS如果在每个对象中都存储这些重复的数据，就会造成大量重复且不必要的内存开销。所以Javascript引擎会将这些对象的`Shape`和`Value`分开存储

![](http://p5sf6v0wz.bkt.clouddn.com/js-shape.png)

这样对于相同的对象只需要存储一个`Shape`就可以了，每一个具有相同`Shape`的对象都会指向这个`Shape`实例

> 所有JavaScript引擎都使用Shape作为优化，但它们并不都称之为Shape

+ 学术论文称之为Hidden Classes
+ V8称之为Maps
+ Chakra称之为Types
+ JavaScriptCore称之为Structures
+ SpiderMonkey称之为Shapes，演讲中统一使用了Shape

### 过渡链

如果我们为一个对象添加或者删除了一个熟悉，那么Javascript引擎如何找到这个对象的新的Shape？其实很简单

![](http://p5sf6v0wz.bkt.clouddn.com/js-shape-trans.png)

```javascript
var obj1 = {}
obj1.a = 1
obj1.b = 2
```
大家都是聪明人，一眼就能看懂吧，但是我们甚至不需要存储一个完整的`Shape`，我们只需要知道新引入进来的属性即可

![](http://p5sf6v0wz.bkt.clouddn.com/js-shape-trans-more2.png)

如果你要找obj1.a，那么只需要顺着过渡链找到引用了`a`的`Shape`即可

如果我们无法创建一个过渡链会怎样？
```javascript
var obj1 = {}
obj1.a = 1
var obj2 = {}
obj2.b = 2
```

也很简单，构建一个树形分支结构即可，建立一个过渡树

![](http://p5sf6v0wz.bkt.clouddn.com/js-shape-tree.png)

对于一种特殊情况

```javascript
var obj1 = {}
obj1.a = 1
var obj2 = { a: 2 }
```

![](http://p5sf6v0wz.bkt.clouddn.com/js-shape=tree-empty.png)

> 对于初始化就包含属性的对象，其过渡链跳过了empty，优化缩短了过渡链

### 内存联缓（ICs）

JavaScript引擎使用ICs来记住在何处查找对象属性的信息，以减少查找次数。假如有一个获取对象内部值的函数
```javascript
function getX(o) {
	return o.x;
}
```

![](https://user-gold-cdn.xitu.io/2018/6/18/16411f1b7217d045?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

第一个`get_by_id`指令从第一个参数（arg1）加载属性“x”，并将结果存储到loc0中。第二个指令返回我们存储到的LoC0。
JSC还将内联缓存嵌入到`get_by_id`指令中，该指令由两个未初始化的槽组成

![](https://user-gold-cdn.xitu.io/2018/6/18/16411f6118ecaea0?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

现在假设我们使用{x：“a”}参数来调用getX。如我们所知，这个对象指向有属性“x”的Shape，并且该Shape存储了属性“x”的偏移量和描述对象。当第一次执行该函数时，get_by_id指令查找属性“x”，并发现该值被存储在偏移量0

![](https://user-gold-cdn.xitu.io/2018/6/18/16411f68e5c06ab2?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

嵌入到get_by_id指令中的IC记住了这个属性是从哪个Shape以及偏移量中找到的

![](https://user-gold-cdn.xitu.io/2018/6/18/16411f70abbe30f7?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

对于后续的运行，IC只需要比较Shape，如果它与以前相同，只需从存储的偏移量中加载值即可。具体地说，如果JavaScript引擎看到对象指向了IC之前记录的Shape，那么就不需要重新去查找，可以完全跳过昂贵的属性查找。这比每次查找属性要快得多。

## 有效存储数组

数组使用数组索引来存储属性。这些属性的值称为数组元素。为每个数组元素存储描述对象是不明智的。数组索引属性默认为可写、可枚举和可配置，JavaScript引擎将数组元素与其他属性分开存储。

```javascript
const array = [
  '#jsconfeu',
];
```

引擎存储的数组长度为1，并指向包含length的Shape，偏移值为0。

![](https://user-gold-cdn.xitu.io/2018/6/18/16411ff1f8046d1b?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

![](https://user-gold-cdn.xitu.io/2018/6/18/16411ffa76bf36bc?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

每个数组都有一个单独的元素后备存储区，它包含所有数组索引的属性值。JavaScript引擎不必为每个数组元素存储任何描述对象，因为它们通常都是可写的、可枚举的和可配置的。
如果更改数组元素的描述对象，会怎么样？

```javascript
// Please don’t ever do this!
const array = Object.defineProperty(
  [],
  '0',
  {
    value: 'Oh noes!!1',
    writable: false,
    enumerable: false,
    configurable: false,
  }
);
```

上面的代码段定义了一个名为“0”的属性（恰好是一个数组索引），但它将属性设置为非默认值。

在这样的极端情况下，JavaScript引擎将整个元素后备存储区作为字典，映射描述对象到每个数组索引。

![](https://user-gold-cdn.xitu.io/2018/6/18/1641200f5b4b4c5f?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

即使只有一个数组元素有非默认描述对象，整个数组的元素后备存储区也会进入这个缓慢而低效的模式。避免在元素索引上使用Object.defineProperty！

> 文章改编于[《【JSConf EU 2018】JavaScript引擎: 精粹部分》](https://juejin.im/post/5b275178f265da59a23f19cf)