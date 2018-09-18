## 背景
我从不关注代码之外的东西，因为我相信有人会帮我做这些... 

之前上手了Parcel感觉还OK，在这里小小的整理一哈

## 开始操作

+ 安装Parcel

```JavaScript
yarn global add parcel-bundler
```
+ 创建package.json再顺便加个命令

```JavaScript
yarn init -y
// package.json
"scripts": {
  "start": "parcel index.html"
}
```
+ 安装Babel

```JavaScript
yarn add babel-preset-env
```
+ 安装node-sass

```JavaScript
yarn add node-sass
```
+ 接着创建.babelrc

```Json
{
  "preset": ["env"]
}
```
+ 安装React依赖

```JavaScript
yarn add react
yarn add react-dom
yarn add --dev parcel-bundler
yarn add --dev babel-preset-env
yarn add --dev babel-preset-react
```
+ 在.babelrc中修改

```Json
{
  "presets": ["env", "react"]
}
```

+ 让`React`内部`Class`支持箭头函数

```
npm install --save-dev babel-plugin-transform-class-properties
```

+ 在.babelrc中添加

```Json
"presets": ["env", "react"],
"plugins": [
    ["transform-class-properties", { "spec": true }]
  ]
```
再整理一下目录...现在应该是这样的(关键的)

```Json
node_modules
src
    components
    containers
    App.js
    App.scss
.babelrc
index.html
package.json
```

**index.html**
```Html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>Parcel-React</title>
</head>
<body>
  <div id="root"></div>
  <script src="./src/index.js"></script>
</body>
</html>
```

**index.js**
```JavaScript
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

ReactDOM.render(<App />, document.getElementById('root'));
```
**App.js**
```JavaScript
import React, { Component } from 'react';

import './App.scss';

class App extends Component {
  render() {
    return (
      <div className="App">
        <h1>Hello Parcel-React</h1>
      </div>
    );
  }
}

export default App;
```
**App.scss**
```Css
$color-red: red;
$color-black: black;
h1{
  color: $color-red;
  cursor: pointer;
  &:hover{
    color: $color-black;
  }
}
```
**package.json**
```Json
{
  "name": "parcel-test1",
  "version": "1.0.0",
  "main": "index.js",
  "license": "MIT",
  "scripts": {
    "start": "parcel index.html"
  },
  "dependencies": {
    "babel-preset-env": "^1.6.1",
    "node-sass": "^4.8.3",
    "react": "^16.2.0",
    "react-dom": "^16.2.0"
  },
  "devDependencies": {
    "babel-core": "^6.26.0",
    "babel-preset-react": "^6.24.1",
    "parcel-bundler": "^1.6.2"
  }
}
```

最后`npm run`一哈

![Parcel-React-Gif](http://p5sf6v0wz.bkt.clouddn.com/Jietu20180325-224425.gif
)

舒服了，终于可以不用手脚架了，自己动手丰衣足食

> 有什么其他依赖再自己yarn add或npm install就好啦




