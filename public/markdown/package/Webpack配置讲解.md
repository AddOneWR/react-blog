## 背景
之前讲了讲Parcel搭建React环境...想了想不讲一哈Webpack还真有点过意不去

## 开始

### 安装

```
npm install webpack webpack-cli -g 

# 或者
yarn global add webpack webpack-cli
```

### 配置

创建`package.json`文件
```
npm install webpack -D 

# 或者
yarn add webpack -D
```

添加`npm scripts`
```
"scripts": {
  "build": "webpack --mode production"
},
"devDependencies": {
  "webpack": "^4.1.1",
  "webpack-cli": "^2.0.12",
}
```

#### 入口

随意创建`./src/index.js`，此为webpack默认入口文件，若想更改可以对webpack配置文件进行修改

```JSON
module.exports = {
  entry: './src/index.js' 
}

// 上述配置等同于
module.exports = {
  entry: {
    main: './src/index.js'
  }
}

// 或者配置多个入口
module.exports = {
  entry: {
    foo: './src/page-foo.js',
    bar: './src/page-bar.js', 
    // ...
  }
}

// 使用数组来对多个文件进行打包
module.exports = {
  entry: {
    main: [
      './src/foo.js',
      './src/bar.js'
    ]
  }
}
```
#### loader
> 我们可以把 loader 理解为是一个转换器，负责把某种文件格式的内容转换成 webpack 可以支持打包的模块

在module.rules中进行修改
```Json
module: {
  // ...
  rules: [
    {
      test: /\.jsx?/, // 匹配文件路径的正则表达式，通常我们都是匹配文件类型后缀
      include: [
        path.resolve(__dirname, 'src') // 指定哪些路径下的文件需要经过 loader 处理
      ],
      use: 'babel-loader', // 指定使用的 loader
    },
  ],
}
```

关于loader的安装可以查看[网址](https://doc.webpack-china.org/loaders/babel-loader/)

#### plugin
> 模块代码转换的工作由 loader 来处理，除此之外的其他任何工作都可以交由 plugin 来完成，只需在配置中通过 plugins 字段添加新的 plugin 即可

```Json
const UglifyPlugin = require('uglifyjs-webpack-plugin')

module.exports = {
  plugins: [
    new UglifyPlugin()
  ],
}
```

#### 输出
> webpack 的输出即指 webpack 最终构建出来的静态文件，使用output字段进行修改

```Json
module.exports = {
  // ...
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
}

// 或者多个入口生成不同文件
module.exports = {
  entry: {
    foo: './src/foo.js',
    bar: './src/bar.js',
  },
  output: {
    filename: '[name].js',
    path: __dirname + '/dist',
  },
}

// 路径中使用 hash，每次构建时会有一个不同 hash 值，避免发布新版本时线上使用浏览器缓存
module.exports = {
  // ...
  output: {
    filename: '[name].js',
    path: __dirname + '/dist/[hash]',
  },
}
```

#### 小结
创建一个简单的配置文件webpack.config.js

```Json
const path = require('path')
const UglifyPlugin = require('uglifyjs-webpack-plugin')

module.exports = {
  entry: './src/index.js',

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },

  module: {
    rules: [
      {
        test: /\.jsx?/,
        include: [
          path.resolve(__dirname, 'src')
        ],
        use: 'babel-loader',
      },
    ],
  },

  // 代码模块路径解析的配置
  resolve: {
    modules: [
      "node_modules",
      path.resolve(__dirname, 'src')
    ],

    extensions: [".wasm", ".mjs", ".js", ".json", ".jsx"],
  },

  plugins: [
    new UglifyPlugin(), 
    // 使用 uglifyjs-webpack-plugin 来压缩 JS 代码
    // 如果你留意了我们一开始直接使用 webpack 构建的结果，你会发现默认已经使用了 JS 代码压缩的插件
    // 这其实也是我们命令中的 --mode production 的效果，后续的小节会介绍 webpack 的 mode 参数
  ],
}
```

> 简单的webpack搭建就到这里