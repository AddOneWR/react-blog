## 1
写一个方法，在一个未知对象中，找出所有的“李鹏”,并`console.log`输出:
+ 对应值当前所在对象
+ 当前对象有多少个目标值

```Javascript
const tar = {
  a:{
    b:{
      c:{
        d:{
          e:{
            name:"百度"
          }
        },
        l:{
          name:"李鹏",
          age: "李鹏"
        }
      }
    }
  },
  d:"90",
  e:"90",
  l:{
    a:{
      b:{
        c:{
          version:"1.0.0.1",
          name:"李鹏"
        }
      }
    }
  },
  f:{
    name:"李鹏",
    update:"2017年03月20日"
  }
}

function getTar(tar, search){
  
  let count = 0 // 记录目标数
  let path = [] // 记录所在对象
  
  function _deep(tar){
    Object.keys(tar).map(item => {
      if(Object.prototype.toString.call(tar[item]) === '[object Object]'){
        path.push(item)
        _deep(tar[item]) // 如果是对象则递归遍历并将对象名加入path
      }else if(tar[item] === search){
        count++
        console.log(path) //找到则打印路径
      }
    })
    path.pop() // 遍历完一个对象的所有成员后回溯路径
  }
  
  _deep(tar) // 初始遍历
  
  console.log(count)
}

getTar(tar,'李鹏')
```

输出

```Javascript
["a", "b", "c", "l"]
["a", "b", "c", "l"]
["l", "a", "b", "c"]
["f"]
4
```

## 2

找出数组`arr`中重复出现过的元素

```Javascript
input: [1,2,4,4,3,3,1,5,3].sort()

output: [1,3,4]
```

```Javascript
const arr = [1,2,4,4,3,3,1,5,3].sort()

function seleteDup(arr){
  let res = []
  arr.map(item => {
    if(arr.indexOf(item) != arr.lastIndexOf(item) && res.indexOf(item) === -1){
      res.push(item) //第一次出现的位置和最后一次出现的位置不相等 并且res数组中没有 则添加
    }
  })
  
  console.log(res)
}

seleteDup(arr)
```

## 3

不使用循环，创建一个长度为`100`的数组，并使数组的每个值等于它的下标

```Javascript
// 先创建一个长为100的数组然后Object.keys拿到字符数组, 需要转化为数字
let temp = Object.keys(Array.apply(null, {length:100}))

let arr = temp.map(item => {
  return +temp;
})
// Array.keys拿到迭代器然后转为数组
let arr = Array.from(new Array(100).keys())

// 方法与第一种类似 同样为字符数组 需要转化
let temp = Object.keys(Array.from({length:100}))

// es6扩展运算符
let arr = [...Array(100).keys()]
```

## 4

解析 URL 中的 queryString，返回一个对象返回值示例：

```Json
{
  name: 'coder',
  age: '20'.
  callback: 'https://youzan.com?name=test'
}
```

该题解见自写`npm`包`j2url`

## 5

输出以下语句结果
```Javascript
["1", "1", "11","5"].map(parseInt)
```

自解: 
先查看`MDN`

```Javascript
parseInt(string, radix)
```

**string**
要被解析的值。如果参数不是一个字符串，则将其转换为字符串(使用  `ToString` 抽象操作)。字符串开头的空白符将会被忽略

**radix**
一个介于2和36之间的整数(数学系统的基础)，表示上述字符串的基数。比如参数"10"表示使用我们通常使用的十进制数值系统。始终指定此参数可以消除阅读该代码时的困惑并且保证转换结果可预测。当未指定基数时，不同的实现会产生不同的结果，通常将值默认为10

```javascript
let new_array = arr.map(function callback(currentValue, index, array) { 
    // Return element for new_array 
}[, thisArg])
```

**callback**
生成新数组元素的函数，使用三个参数：
&nbsp;&nbsp;&nbsp;&nbsp;**currentValue**
&nbsp;&nbsp;&nbsp;&nbsp;callback 的第一个参数，数组中正在处理的当前元素。
&nbsp;&nbsp;&nbsp;&nbsp;**index**
&nbsp;&nbsp;&nbsp;&nbsp;callback 的第二个参数，数组中正在处理的当前元素的索引。
&nbsp;&nbsp;&nbsp;&nbsp;**array**
&nbsp;&nbsp;&nbsp;&nbsp;callback 的第三个参数，map 方法被调用的数组。
**thisArg**
可选的。执行 callback 函数时 使用的this 值

> 以上MDN内容用来科普

对数组`["1", "1", "11","5"]`调用`map`后回调函数传入`parseInt`， 这里数组中每个元素都能转化成数字所以不用考虑`string`参数不符合要求，这里关键是要明白传给`parseInt`的参数都是什么

我们重写一个函数来测试一下

```Javascript
let arr = ["1", "1", "11","5"]

let parseInt = function(string, radix){
  return string + ' : ' + radix
}

console.log(arr.map(parseInt))

// ["1 : 0", "1 : 1", "11 : 2", "5 : 3"]
```

可以看到第一个参数传入了数组元素，第二个参数传入了索引，这和`map`函数接受的参数一样，那么我们可以猜一下最后一个参数传入的就是数组

```Javascript
let arr = ["1", "1", "11","5"]

let parseInt = function(string, radix, array){
  return string + ' : ' + radix + '-' + array
}

console.log(arr.map(parseInt))

// ["1 : 0-1,1,11,5", "1 : 1-1,1,11,5", "11 : 2-1,1,11,5", "5 : 3-1,1,11,5"]
```

这样题目就很好理解了.. 答案就是
```Javascript
[1,NaN,3,NaN]
```

## flatten实现

```javascript
const flatten = (arr, depth = 1)  => arr.reduce((a, b) => {
  if (Array.isArray(b) && depth - 1) {
    return a.concat(flatten(b, depth - 1));
  }
  return a.concat(b);
}, []);
```
