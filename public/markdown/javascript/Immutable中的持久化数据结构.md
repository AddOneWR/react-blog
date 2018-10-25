# Immutable中的持久化数据结构

## 什么是Immutable.js?

如果你不知道的话，也不重要，反正这篇文章的重点是**持久化数据结构**，不过我还是放个官网给你吧[Immutable](https://facebook.github.io/immutable-js/)

## 什么是持久化数据结构?

可持久数据结构主要指的是我们可以查询历史版本的情况并支持插入，利用使用之前历史版本的数据结构来减少对空间的消耗，本文将实现的是简化版的`Immutable`中的`Vector Trie`以及位分区(`Bit Partitioning`)

## 正文

### 非持久化

这里先来个普通结构的小`Demo`

```javascript
class vectorTree {
    constructor() {
        this.nodes = []
    }

    set(key, value){
        this.nodes.push({
            key: key,
            value: value
        })
    }
}

let tree = new vectorTree()
for(let i = 0 ; i < 1000 ; i++) {
    tree.set(Math.random(), Math.random());
}
console.log(tree)
```

![](http://p5sf6v0wz.bkt.clouddn.com/vector-1.png)

可以看到这个糟糕的结构，不仅占用大量空间而且搜索更新效率低，并且如果我们要在这个结构中添加一个元素的话，那么必然会改变这个结构，唯一能保持原结构不变的方法便是重新构造一份相同的结构(这真是太蠢了)

### 持久化

假设我们现在有一棵树

![](http://p5sf6v0wz.bkt.clouddn.com/vector-2.png)

如果我们要在C下添加一个节点，那么按照非持久化的特点，要保持原结构不变，就只能新构建一棵一样的树

![](http://p5sf6v0wz.bkt.clouddn.com/vector-3.png)

这种方案时间空间开销都很大，效率十分低下，所以我们有了持久化方案

![](http://p5sf6v0wz.bkt.clouddn.com/vector-4.png)

Amazing!对于没有修改的节点，我们可以`共享`，仅对于修改了的节点进行添加，同时我们的根节点变了，生成了新的版本，旧的版本也得到了保留，时间和空间都得到了大大的节约。对于每个根节点。都会有一个`ownerID`来标识，在进行操作时，会判断`ownerID`是否一致再决定后面的操作。对于`ownerID`的生成，`Immutable`中采用`new`出对象的地址来赋值，因为每次`new`出的地址肯定与之前的不同

### Vector Trie

假设我们有一个`Map`(这里懒得hash所以key先设置为数字)

```javascript
{
    0: 'tom'
    1: 'bob'
    2: 'tomax'
    3: 'addone'
    4: 'zedd'
}
```

如果要把它变成一个二叉`Vector Trie`的话，就需要把它的`key`转成二进制

```javascript
{
    000: 'tom'
    001: 'bob'
    010: 'tomax'
    011: 'addone'
    100: 'zedd'
}
```

表现出来的树就是这样的，我觉得学过数据结构的人对此应该都不陌生，每个节点是一个数组，其内部存两个数`0`和`1`来表示二进制数，所有的`value`都存在叶子节点上，这样我们根据`key`的二进制就很容易找到对应的`value`

![](http://p5sf6v0wz.bkt.clouddn.com/vector-5.png)



如果我们要添加一个`5: 'baby'`也很容易，跟上文类似

![](http://p5sf6v0wz.bkt.clouddn.com/vector-6.png)

这样对于任何一个`map`(如果`key`不是数字我们就需要对其进行`hash`即可)我们都可以用一棵`Vector Trie`来表示它，但是聪明的人能够看出，这里每个节点的数组长度只有2(这是为了简化例子)，这样如果数据量大了的话会导致树变得很深，耗时会增加，所以在`Immutable`中每个节点的长度被设置成`32`(为什么?)。关于`hash`冲突，`Vector Trie`会将相同`hash`的值放在一个数组里

### 数字分区

位分区前我们先讲一下数字分区，和上面`Vector Trie`差不多，不过这里是转化成了7进制，这样每个数组就有7个元素

![vector-7](/Users/addone/Desktop/vector-7.png)

通过公式`key / radix^(level - 1) % radix`可以求出每一层对应的数字，`key`为待求值，`radix`为`base`，`level`为层数，如果用代码来表示的话：

```javascript
const radix = 7;

function getValue(key) {
  let node = root; // 获取根节点
  let max = Math.pow(radix, (level - 1)); // max = radix^(level - 1)
    
  for (let size = max; size > 1; size /= radix) {
    node = node[Math.floor(key / size) % radix]; // node[key/radix^level - 1 % radix]
  }

  return node[key % radix];
}
```

### 位分区

上面的数字分区需要进行多次的除法以及取模运算，效率较低，所以就有了位分区对其进行优化。数字分区将`key`拆成一个个数字，而位分区将其拆分成一个个二进制，每一位按照5Bit拆分，比如：数字`666666`拆分后为`10100 01011 00001 01010` ，因为基数变成了`32`，所以之前的求解式子为`key / 32^(level - 1) % 32`，`32`又等于`2^5`，所以式子可以改写为`2^[5*(level - 1)] % 32`，又知通过位运算可得

`a / 2^n === a >>> n`和`a % 2^n === a & (n - 1)`，可以获得下面的代码

```javascript
const bits = 5;
const width = 1 << bits; // 32: 100000
const mask = width - 1; // 31: 11111

function getValue(key) {
    let node = root; 

    for (let offset = (level - 1) * bits; offset > 0; offset -= bits) {
        node = node[(key >>> offset) & mask];
    }

    return node[key & mask];
}

```

然后一张图，这里为5Bit，查找的数为`626`

![](http://p5sf6v0wz.bkt.clouddn.com/vector-8.png)

那么`Immutable`中对于`Vector trie`的源码又是什么样的呢？

```javascript
get(shift, keyHash, key, notSetValue) {
  if (keyHash === undefined) {
    keyHash = hash(key);
  }
  const idx = (shift === 0 ? keyHash : keyHash >>> shift) & MASK;
  const node = this.nodes[idx];
  return node
    ? node.get(shift + SHIFT, keyHash, key, notSetValue)
    : notSetValue;
}
```

这里对`key`进行了`hash`，然后同样采用了位分区，不过这里搜索的先后是从低到高，之前我们的例子是从高到低，这是因为`key`的二进制长度不是固定的

### 时间复杂度

`map`中根据`key`来搜索的时间复杂度为`O(1)`，现在变成了树，时间复杂度变成了`O(log32n)`，但是32叉树未免太大，所以`Immutable`对此进行了优化

### 树高压缩

一张图

![](http://p5sf6v0wz.bkt.clouddn.com/vector-9.png)

### Bitmap

之前提过32叉树占用了太大的空间，其中很多空间在大多数情况下是用不到的，使用`Bitmap`就可以对其进行压缩，同样一张图

![](http://p5sf6v0wz.bkt.clouddn.com/vector-10.png)



对于原来的数组，我们用一个二进制来代替，其中1为原数组中有元素的一项。若想取得对应下标的元素，假如想要获取`6`对应的`145`，先判断`01000100`第`6`位是否为`1`，发现为`1`后通过

`bitmap & (1 << i - 1)`得出二进制，该二进制只有下标为`6`之前的数组元素中有值的地方才为`1`，我们只需要统计`1`的个数就能获得`145`在新数组中的下标，统计`1`的个数的过程为[popcount](https://en.wikipedia.org/wiki/Hamming_weight)，这里不再普及。

这里贴上`Bitmap`部分源码

```javascript
get(shift, keyHash, key, notSetValue) {
  if (keyHash === undefined) {
    keyHash = hash(key);
  }
  const bit = 1 << ((shift === 0 ? keyHash : keyHash >>> shift) & MASK);
  const bitmap = this.bitmap;
  return (bitmap & bit) === 0
    ? notSetValue
    : this.nodes[popCount(bitmap & (bit - 1))].get(
        shift + SHIFT,
        keyHash,
        key,
        notSetValue
      );
}
```

再顺便贴上`popcount`源码

```javascript
function popCount(x) {
  x -= (x >> 1) & 0x55555555;
  x = (x & 0x33333333) + ((x >> 2) & 0x33333333);
  x = (x + (x >> 4)) & 0x0f0f0f0f;
  x += x >> 8;
  x += x >> 16;
  return x & 0x7f;
}
```

### 最后

上文提到过的为什么是32?

![](http://p5sf6v0wz.bkt.clouddn.com/vector-11.png)

这里可以看到综合查询和更新来讲，`Immutable`选择了`32`



> 文章参考于[《深入探究immutable.js的实现机制》](https://juejin.im/post/5b9b30a35188255c6418e67c)

