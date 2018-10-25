# pareact-cli

**A lightweight quickly build simple react cli which is based on parcel**

If you just want to quickly build a project which support react and sass and without any configurations，you can use this cli.

## Prepare

```javascript
npm install -g parcel-bundler

or

yarn global add parcel-bundler
```

## Install

```javascript
npm install pareact-cli -g

or

yarn add pareact-cli -g
```

## Usage

```
pareact init <project-name>
```



## Develop

```
"chalk": "^2.4.1",
"commander": "^2.15.1",
"download-git-repo": "^1.0.2",
"handlebars": "^4.0.11",
"inquirer": "^6.0.0",
"log-symbols": "^2.2.0",
"ora": "^2.1.0"
```



# astro-classname

A small and powerful package which can help you change or add classnames quickly and easily

## Install

npm: 

```
npm install astro-classname
```

yarn: 

```
yarn add astro-classname
```



## Usage

You can set anything to the classname，but the value that was associated with a given key is falsy， it will not be effective。Object has the highest priority

Before you use，you should require or import the package

![](http://p5sf6v0wz.bkt.clouddn.com/classname-1.png)

You can also add classname to dom directly

![](http://p5sf6v0wz.bkt.clouddn.com/classname-2.png)

Usage with react!

![](http://p5sf6v0wz.bkt.clouddn.com/classname-4.png)

Usage with jquery!

![](http://p5sf6v0wz.bkt.clouddn.com/classname-5.png)

You can use all the methods in anywhere

## Develop

### Init

初始化所需变量，后根据传入参数使用不同处理函数。

```javascript
function classname() {
  var res = {};
  var str = '';
  var _arg = Array.from(arguments);
  var toString = Object.prototype.toString;
    
  if (getType(arguments[0]) === 'nodelist' || (getType(arguments[0]) !== 'string' && arguments[0][0])){
    handleMulElement(arguments);
    return ;
  } else if (getType(arguments[0]) === 'htmldivelement') {
    handleSinElement(arguments);
    return ;
  } else {
    return getClassName(_arg);
  }
}
```

### getType

截取字符串8位后的字符并去掉`]`，转成小写返回

```javascript
function getType(el) {
    var _type = toString.call(el).slice(8, -1).toLowerCase();
    return _type;
}
```

### 类型判别

#### NodeList or jQuery

`getType`方法判断是否为`nodelist`；`arguments[0][0]`判断其是否为jQuery对象，同时排除其为`string`的情况

```javascript
if (getType(arguments[0]) === 'nodelist' || (getType(arguments[0]) !== 'string' && arguments[0][0])){
    handleMulElement(arguments);
    return ;
}
```

#### 单独Dom

`document`获取的单独`dom`类型为`htmldivelement`

```javascript
if (getType(arguments[0]) === 'htmldivelement') {
    handleSinElement(arguments);
    return ;
} 
```

#### 其他

```javascript
return getClassName(_arg);
```

### 剩余

懒得写了



# j2url

## Install

npm: 

```
npm install j2url
```

yarn: 

```
yarn add j2url
```

## Usage

You can get every params

```javascript
j2url.getParam('https://www.google.com/?a=1', 'a') // => 1
j2url.getParam('https://www.google.com/?a[]=1&a[]=2', 'a') // => [1, 2]
j2url.getParam('https://www.google.com/?a={'b': 1}', 'a') // => {b: 1}
```

You can also set the param of the url , the last argument defaults to false, if you set it to true, you will get a encoding url

```javascript
j2url.setParam('https://www.google.com/?a=1', 'a', 2) // => https://www.google.com/?a=2
j2url.setParam('https://www.google.com/?a=1&b=2', 'c', 3) // => https://www.google.com/?a=1&b=2&c=3
j2url.setParam('https://www.google.com/?a=1', 'a', 2, true) // => https%3A%2F%2Fwww.google.com%2F%3Fa%3D2
```

You can get the url's params to json

```javascript
j2url.toJson('https://www.google.com/?a=1&b=2') // => {a: 1,b: 2}
j2url.toJson('https://www.google.com/?a={'name': 'bob'}&b[]=1&b[]=2') // => {a: {name: bob},b:[1, 2]}
```

You can add the json to url

```javascript
j2url.toUrl('https://www.google.com/','a','{'name': 'Tom'}') // => https://www.google.com/?a={'name': 'Tom'}
```

## Develop

### Init

初始化`j2url`对象

```javascript
var j2url = {

}
```

### getParamArr

获取`url`参数数组，默认使用`decodeURIComponent`解码后，使用`split`分割成数组后获取参数字符串，再次`split`分割`&`获取参数数组并返回

```javascript
j2url.getParamArr = function(url) {
  var url = decodeURIComponent(url);
  var paramString = (url.split('?')[1] ? url.split('?')[1] : '');
  var paramArr = paramString.split('&');
  
  return paramArr;
}
```



### getParam

先获取`url`参数数组，遍历获取其`key`和`value`，判断`key`和`paramName`是否相等，若相等再判断`value`是否为`Json`然后分别处理；若不相等则判断其是否为数组，若为数组则判断是否已经有该元素(根据数组长度是否大于0)分别处理

```javascript
j2url.getParam = function(url, paramName) {
  var paramArr = j2url.getParamArr(url);
  var obj = [];
  var res = [];
  paramArr.forEach(function(item) {
    obj = item.split('=');
    
    if(obj[0] === paramName) {
      j2url.isObj(obj[1]) ? res = JSON.parse(obj[1]) : res = obj[1];
    } else if (obj[0].slice(0, obj[0].length - 2) === paramName) {
      res.length > 0 ? res.push(obj[1]) : res = [obj[1]];
    }
  })
  
  return res.length === 0 ? '' : res;
}
```

### setParam

同样先获取参数数组，分割获取参数，设置时需要确定设置的优先级，其中`object`为最高优先级，最后将参数拼接成字符串，根据传入参数返回是否编码的结果

```javascript
j2url.setParam = function(url, paramName, value, encode = false) {
  var paramArr = j2url.getParamArr(url);
  var isSetted = false;
  var obj = [];
  var res = '';
  paramArr = paramArr.map(function(item) {
    obj = item.split('=');
    if(obj[0] === paramName) {
      obj[1] ? obj[1] = value : obj.push(value);
      isSetted = true;
      
      return obj[0] + '=' + obj[1];
    }
    
    return item;
  })
  
  if(!isSetted) {
    var str = paramName + '=' + value;
    paramArr.push(str);
  }

  paramArr.forEach(function(item) {
    res += (item + '&');
  })
   
  if(encode) return encodeURIComponent(j2url.getUrlOp(url) + '?' + res.substring(0, res.length - 1));
  else return j2url.getUrlOp(url) + '?' + res.substring(0, res.length - 1);
}
```

### toJson

同样获取参数数组，遍历参数，对参数分成数组，对象，其他三种情况分别处理。若为数组，则获取该数组名之后判断其是否存在在当前数组中进行相应的初始化或者`push`操作；若为对象，则直接`parse`将字符串转成对象后赋值；其他则直接赋值

```javascript
j2url.toJson = function(url) {
  var obj = {};
  var temp;
  var paramArr = j2url.getParamArr(url);
  paramArr.forEach(function(item) {
    temp = item.split('=');
    if(j2url.isArr(temp[0])){
      var key = temp[0].slice(0, temp[0].length - 2);
      Object.keys(obj).indexOf(key) > -1 ? obj[key].push(temp[1]) : obj[key] = [temp[1]];
    } else if (j2url.isObj(temp[1])) {
      obj[temp[0]] = JSON.parse(temp[1]);
    } else {
      obj[temp[0]] = (temp[1] ? temp[1] : '');
    }
  })
  
  return obj;
}
```

### toUrl

拼接`url`，`key`以及`json`成字符串返回即可

```javascript
j2url.toUrl = function(url, key, json) {
  return url + '?' + key + '=' + JSON.stringify(json);
}
```



### getUrlOp

获取`?`前地址

```javascript
j2url.getUrlOp = function(url) {
  return url.split('?')[0];
}
```

### isArr

判断参数是否为数组

```javascript
j2url.isArr = function(value) {
  return (value.slice(value.length - 2) === '[]');
}
```

### isObj

判断参数是否为对象

```javascript
j2url.isObj = function(value) {
  return (value.indexOf('{') === 0 && value.indexOf('}') === value.length -1)
}
```
