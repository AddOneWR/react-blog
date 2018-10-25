# 序
+ "你构建项目用`webpack`么?"
+ "不, 我用`parcel`。"
+ "那你用过什么脚手架么?"
+ "`create-react-app`等等..."
+ "那你读过`create-react-app`中的`webpack`配置源码么?"
+ "当然，balabala...."

# Dev(开发环境)

```javascript
'use strict';

const autoprefixer = require('autoprefixer');
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin');
const WatchMissingNodeModulesPlugin = require('react-dev-utils/WatchMissingNodeModulesPlugin');
const eslintFormatter = require('react-dev-utils/eslintFormatter');
const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');
const getClientEnvironment = require('./env');
const paths = require('./paths');

const publicPath = '/';

const publicUrl = '';

const env = getClientEnvironment(publicUrl);

module.exports = {
  devtool: 'cheap-module-source-map',

  entry: [
    require.resolve('./polyfills'),
    require.resolve('react-dev-utils/webpackHotDevClient'),
    paths.appIndexJs,
  ],
  output: {
    pathinfo: true,
    filename: 'static/js/bundle.js',
    chunkFilename: 'static/js/[name].chunk.js',
    publicPath: publicPath,
    devtoolModuleFilenameTemplate: info =>
      path.resolve(info.absoluteResourcePath).replace(/\\/g, '/'),
  },
  resolve: {
    modules: ['node_modules', paths.appNodeModules].concat(
      process.env.NODE_PATH.split(path.delimiter).filter(Boolean)
    ),
    extensions: ['.web.js', '.mjs', '.js', '.json', '.web.jsx', '.jsx'],
    alias: {
      'react-native': 'react-native-web',
    },
    plugins: [
      new ModuleScopePlugin(paths.appSrc, [paths.appPackageJson]),
    ],
  },
  module: {
    strictExportPresence: true,
    rules: [
      {
        test: /\.(js|jsx|mjs)$/,
        enforce: 'pre',
        use: [
          {
            options: {
              formatter: eslintFormatter,
              eslintPath: require.resolve('eslint'),
              
            },
            loader: require.resolve('eslint-loader'),
          },
        ],
        include: paths.appSrc,
      },
      {
        oneOf: [
          {
            test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
            loader: require.resolve('url-loader'),
            options: {
              limit: 10000,
              name: 'static/media/[name].[hash:8].[ext]',
            },
          },
          {
            test: /\.(js|jsx|mjs)$/,
            include: paths.appSrc,
            loader: require.resolve('babel-loader'),
            options: {
              cacheDirectory: true,
            },
          },
          {
            test: /\.css$/,
            use: [
              require.resolve('style-loader'),
              {
                loader: require.resolve('css-loader'),
                options: {
                  importLoaders: 1,
                },
              },
              {
                loader: require.resolve('postcss-loader'),
                options: {
                  ident: 'postcss',
                  plugins: () => [
                    require('postcss-flexbugs-fixes'),
                    autoprefixer({
                      browsers: [
                        '>1%',
                        'last 4 versions',
                        'Firefox ESR',
                        'not ie < 9',
                      ],
                      flexbox: 'no-2009',
                    }),
                  ],
                },
              },
            ],
          },
          {
            test: /\.scss$/,
            loader: 'style!css!postcss!sass?outputStyle=expanded'
          },
          {
            exclude: [
              /\.(js|jsx|mjs)$/,
              /\.html$/,
              /\.json$/,
              /\.scss$/
            ],
            loader: require.resolve('file-loader'),
            options: {
              name: 'static/media/[name].[hash:8].[ext]',
            },
          }
        ],
      },
    ],
  },
  plugins: [
    new InterpolateHtmlPlugin(env.raw),
    new HtmlWebpackPlugin({
      inject: true,
      template: paths.appHtml,
    }),
    new webpack.NamedModulesPlugin(),
    new webpack.DefinePlugin(env.stringified),
    new webpack.HotModuleReplacementPlugin(),
    new CaseSensitivePathsPlugin(),
    new WatchMissingNodeModulesPlugin(paths.appNodeModules),
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
  ],
  node: {
    dgram: 'empty',
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
    child_process: 'empty',
  },
  performance: {
    hints: false,
  },
};
```

接下来我们从上到下进行阅读

> 这里只涉及`module.exports`中的内容

## devtool

```javascript
devtool: 'cheap-module-source-map',
```

这里是`webpack`的`sourcemap`配置。

> `sourcemap`是为了解决开发代码与实际运行代码不一致时帮助我们debug到原始开发代码的技术

官方有十几种`sourcemap`这里不做普及，不懂的看一下[详细官方文档](https://webpack.docschina.org/configuration/devtool/#src/components/Sidebar/Sidebar.jsx)

## entry

```javascript
require.resolve('./polyfills'),

require.resolve('react-dev-utils/webpackHotDevClient'),

paths.appIndexJs,
```

+ 默认装载了`polyfills.js`
+ 载入热更新, 可以被看做具有更好体验的`WebpackDevServer`
+ 你的入口文件

关于第三点，我们可以在`paths.js`中看到其为`appIndexJs: resolveApp('src/index.js')`

## output

```javascript
pathinfo: true,

filename: 'static/js/bundle.js',

chunkFilename: 'static/js/[name].chunk.js',

publicPath: publicPath,

devtoolModuleFilenameTemplate: info =>
  path.resolve(info.absoluteResourcePath).replace(/\\/g, '/'),
```

+ 告诉 `webpack`在`bundle`中引入「所包含模块信息」的相关注释(不在生产环境中使用)
+ 决定了每个输出`bundle`的名称和目录
+ 决定了非入口`chunk`文件的名称(`name`为入口名称)
+ 指定在浏览器中所引用的「此输出目录对应的公开 URL」, 上文中为`const publicPath = '/'`
+ 自定义每个`source map`的`sources`数组中使用的名称(此选项仅在 「`devtool` 使用了需要模块名称的选项」时使用, 上文在这里使用了`cheap-module-source-map`)

## resolve
```javascript
modules: ['node_modules', paths.appNodeModules].concat(
  process.env.NODE_PATH.split(path.delimiter).filter(Boolean)
),

extensions: ['.web.js', '.mjs', '.js', '.json', '.web.jsx', '.jsx'],

alias: {
  'react-native': 'react-native-web',
},

plugins: [
  new ModuleScopePlugin(paths.appSrc, [paths.appPackageJson]),
],
```

+ 告诉`webpack`解析模块时应该搜索的目录，按数组前后优先级进行搜索。这里`process.env.NODE_PATH.split(path.delimiter).filter(Boolean)`将路径按`:`或者`;`分割开返回数组并且去掉其中逻辑值为`false`的元素
+ 自动解析确定的扩展，能够使用户在引入模块时不带扩展，比如`import ./index.js`可以写成`import ./index`
+ 创建 `import` 或 `require` 的别名，来确保模块引入变得更简单，这里在引用模块的时候可以把目录名`react-native-web`简写成`react-native`
+ 使用的额外的解析插件列表，这里使用`ModuleScopePlugin`限制自己编写的模块只能从src目录中引入

## module

```javascript
strictExportPresence: true,
rules: [
  {
    test: /\.(js|jsx|mjs)$/,
    enforce: 'pre',
    use: [
      {
        options: {
          formatter: eslintFormatter,
          eslintPath: require.resolve('eslint'),
          
        },
        loader: require.resolve('eslint-loader'),
      },
    ],
    include: paths.appSrc,
  },
  {
    oneOf: [
      {
        test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
        loader: require.resolve('url-loader'),
        options: {
          limit: 10000,
          name: 'static/media/[name].[hash:8].[ext]',
        },
      },
      {
        test: /\.(js|jsx|mjs)$/,
        include: paths.appSrc,
        loader: require.resolve('babel-loader'),
        options: {
          cacheDirectory: true,
        },
      },
      {
        test: /\.css$/,
        use: [
          require.resolve('style-loader'),
          {
            loader: require.resolve('css-loader'),
            options: {
              importLoaders: 1,
            },
          },
          {
            loader: require.resolve('postcss-loader'),
            options: {
              ident: 'postcss',
              plugins: () => [
                require('postcss-flexbugs-fixes'),
                autoprefixer({
                  browsers: [
                    '>1%',
                    'last 4 versions',
                    'Firefox ESR',
                    'not ie < 9',
                  ],
                  flexbox: 'no-2009',
                }),
              ],
            },
          },
        ],
      },
      {
        test: /\.scss$/,
        loader: 'style!css!postcss!sass?outputStyle=expanded'
      },
      {
        exclude: [
          /\.(js|jsx|mjs)$/,
          /\.html$/,
          /\.json$/,
          /\.scss$/
        ],
        loader: require.resolve('file-loader'),
        options: {
          name: 'static/media/[name].[hash:8].[ext]',
        },
      }
    ],
  },
],
```

+ `strictExportPresence`使缺少的导出出现错误而不是警告, 默认值为`false`
+ `rules`使创建模块时，匹配请求的规则数组。这些规则能够修改模块的创建方式。这些规则能够对模块(`module`)应用`loader`，或者修改解析器(`parser`)

这里`rules`中的每个`loader`就不讲了，把定义列一下自己就能看懂

+ `test`: 匹配要处理的文件的正则匹配，是 `Rule.resource.test` 的简写
+ `enforce`:加载器的执行顺序，不设置为正常执行。可选值 `'pre|post'`前|后
+ `include`:将要处理的目录包括进来
+ `exclude`:排除不处理的文件目录，可以使数组或字符串正则格式
+ `issuer`:一个条件，用来与被发布的 `request` 对应的模块项匹配
+ `loader`:是 `Rule.use: [ { loader } ]` 的简写
+ `loaders`:是 `Rule.use `的别名,由于需要支持`Rule.use`，此选项已废弃
+ `oneOf`:规则数组，当规则匹配时，只使用第一个匹配规则
+ `options|query`: 是 `Rule.use: [ { options } ]` 的简写，已废弃
+ `parser`:解析选项对象。所有应用的解析选项都将合并
+ `resource`:与资源匹配的条件，可以使用正则。例子中匹配资源内部 含有`app`的文件 如 `app.js | demoapp.js`
+ `resourceQuery`:与资源查询匹配的条件，匹配资源?后面的字段 如 `app.js?userName`
+ `use`: 应用于模块的`UseEntries`列表。每个入口(`entry`)指定使用一个 `loader`

## plugins

在 `webpack` 的构建流程中，`plugin` 用于处理更多其他的一些构建任务。可以这么理解，模块代码转换的工作由 `loader` 来处理，除此之外的其他任何工作都可以交由 `plugin` 来完成

> 这里只对用到的`plugins`功能进行分析，不对其进行具体分析

```javascript
new InterpolateHtmlPlugin(env.raw),
new HtmlWebpackPlugin({
  inject: true,
  template: paths.appHtml,
}),
new webpack.NamedModulesPlugin(),
new webpack.DefinePlugin(env.stringified),
new webpack.HotModuleReplacementPlugin(),
new CaseSensitivePathsPlugin(),
new WatchMissingNodeModulesPlugin(paths.appNodeModules),
new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
```

+ `InterpolateHtmlPlugin`: 和`HtmlWebpackPlugin`串行使用，允许在`index.html`中添加变量
+ `HtmlWebpackPlugin`: 简化了`HTML`文件的创建，以便为你的webpack包提供服务,可以让插件为你生成一个`HTML`文件，使用`lodash`模板提供你自己的模板，或使用你自己的`loader`
+ `NamedModulesPlugin`: 当开启 `HMR`(模块热替换) 的时候使用该插件会显示模块的相对路径，建议用于开发环境
+ `DefinePlugin`: 允许创建一个在编译时可以配置的全局常量，这里设置了`env.stringified`为`development`
+ `HotModuleReplacementPlugin`: `HMR`
+ `CaseSensitivePathsPlugin`: 如果路径有误则直接报错
+ `WatchMissingNodeModulesPlugin`: 允许你安装库后自动重新构建打包文件
+ `IgnorePlugin`: 防止在 `import` 或 `require` 调用时，生成以下正则表达式匹配的模块

## node

这些选项可以配置是否 `polyfill` 或 `mock` 某些 `Node.js` 全局变量和模块。这可以使最初为` Node.js` 环境编写的代码，在其他环境（如浏览器）中运行

是一个对象，其中每个属性都是 Node.js 全局变量或模块的名称，每个 value 是以下其中之一

+ `true`：提供 `polyfill。`
+ `"mock"`：提供 `mock` 实现预期接口，但功能很少或没有。
+ `"empty"`：提供空对象。
+ `false`: 什么都不提供。预期获取此对象的代码，可能会因为获取不到此对象，触发 `ReferenceError` 而崩溃。尝试使用 `require('modulename')` 导入模块的代码，可能会触发 `Cannot find module "modulename"` 错误

```javascript
node: {
  dgram: 'empty',
  fs: 'empty',
  net: 'empty',
  tls: 'empty',
  child_process: 'empty',
},
```

允许我来一个标准收尾

> 这就不用讲了吧?