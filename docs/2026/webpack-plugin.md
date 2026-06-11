# Webpack的Plugin（未完成）
前面我们介绍了Webpack中的loader，它主要是用在模块引入时转换使用。除了loader之外，Webpack还有一种更强大的外部插入工具，这就是插件Plugin。

插件可以深入到Webpack中的打包和编译过程，在Webpack打包的不同阶段时，触发相应的钩子函数，从而实现对构建过程的定制与扩展。

## Plugin使用示例
为了了解Plugin的作用和使用方式，我们举例一些现有的知名Plugin。

### HtmlWebpackPlugin
在Webapack中，入口文件和生成文件都是JavaScript，但作为一个前端工程，入口文件应该是HTML。我们可以自己手写一个HTML入口文件，但如果是多入口，或者文件名根据内容变化等场景，我们手写HTML入口文件就会变的非常麻烦。HtmlWebpackPlugin插件可以自动生成HTML入口文件，帮我们免去烦恼。首先我们创建两个JavaScript入口文件：

```js
// src/index.js
import "./index.css";
import { abc } from "./index.module.scss";
import data from "./index.xml";

function genEle(test, className) {
  const div = document.createElement("div");
  div.className = className;
  div.textContent = test;
  document.body.appendChild(div);
}
genEle("jzplp1", "qaz");
genEle("jzplp2", abc);
console.log(data);

// src/another.js
console.log("another");
```

入口文件中引入了两种CSS文件，分别为普通CSS文件和SCSS的CSS Modules，这里分别列出：

```css
/* src/index.css */
.qaz {
  color: blue;
}

/* src/index.module.scss */
.abc {
  color: red;
}
```

然后是index.xml的内容：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<note>
  <to>jzplp1</to>
  <from>jzplp2</from>
</note>
```

最后是Webpack配置，这里我们使用了多个JavaScript入口，以及hash文件名，这时候手动生成HTML入口文件确实不方便，因此引入了HtmlWebpackPlugin插件。

```js
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  mode: "production",
  // 多个入口
  entry: {
    index: "./src/index.js",
    another: "./src/another.js",
  },
  output: {
    clean: true,
    // 根据入口文件名和内容hash生成文件名
    filename: "[name]_[contenthash].js",
    path: path.resolve(__dirname, "dist"),
  },
  module: {
    rules: [
      {
        test: /\.xml$/,
        use: "xml-loader",
      },
      {
        test: /\.scss$/,
        use: ["style-loader", "css-loader", "sass-loader"],
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: "jzplp-test",
    }),
  ],
};
```

我们看一下打包生成文件和浏览器效果，可以看到入口文件确实都被自动引入到了HTML中，且在浏览器上正常展示。

​![](/2026/plugin-1.png)

### TerserWebpackPlugin
TerserWebpackPlugin是一个压缩JS代码的Webpack插件。它已经被内置在Webpack中作为压缩代码工具默认启用，但如果希望修改配置，依然要手动引入插件。因为已经内置+生成代码优化相关功能统一配置，因此这个插件不在plugins中配置。下面我们举个例子：

```js
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const TerserWebpackPlugin = require("terser-webpack-plugin");

module.exports = {
  mode: "production",
  // 多个入口
  entry: {
    index: "./src/index.js",
    another: "./src/another.js",
  },
  output: {
    clean: true,
    filename: "[name]_[contenthash].js",
    path: path.resolve(__dirname, "dist"),
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: "jzplp-test",
    }),
  ],
  optimization: {
    minimize: true,
    minimizer: [new TerserWebpackPlugin({
        exclude: /index/,
    })],
  },
};
```

TerserWebpackPlugin是在optimization.minimizer中配置，由于默认是开启的，因此我们测试下开启和关闭（exclude）的大包生成代码区别。可以看到，一个被压缩了，一个没有被压缩。

```js
// 开启效果
!(function (e, t) {
  const n = document.createElement("div");
  ((n.className = t), (n.textContent = e), document.body.appendChild(n));
})("jzplp1", "");

// 关闭效果
/******/ (() => { // webpackBootstrap
function genEle(test, className) {
  const div = document.createElement("div");
  div.className = className;
  div.textContent = test;
  document.body.appendChild(div);
}
genEle("jzplp1", "");
/******/ })()
;
```

### ProgressPlugin
ProgressPlugin是一个报告编译进度的插件，接收一个函数，当编译进度更新时就会触发回调函数。

```js
const webpack = require("webpack");
module.exports = {
  // ...其它配置
  plugins: [
    new webpack.ProgressPlugin((percentage, message, ...args) => {
      console.log("---", percentage, message, args);
    }),
  ],
};
```

ProgressPlugin是一个webpack，因此我们不需要引入别的包就可以使用。回调参数中percentage是一个0-1之间的数字，表示进度。message是当前执行内容的简要描述。执行打包，输出如下：

```js
--- 0  []
--- 0.01 setup [ 'before run' ]
--- 0.01 setup [ 'before run', 'NodeEnvironmentPlugin' ]
--- 0.01 setup [ 'before run' ]
--- 0.02 setup [ 'run' ]
// 省略大部分输出
--- 0.99 cache [ 'shutdown' ]
--- 0.99 cache [ 'shutdown' ]
--- 1  []
```

### MiniCssExtractPlugin
前面我们使用style-loader时，创建的CSS代码是被包含在JS代码内的，以JavaScript的方式引入。使用MiniCssExtractPlugin插件，可以将CSS代码创建为一个独立的CSS文件。配合HtmlWebpackPlugin使用时，CSS文件用link标签直接引入。

```js
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  mode: "production",
  // 多个入口
  entry: {
    index: "./src/index.js",
    another: "./src/another.js",
  },
  output: {
    clean: true,
    // 根据入口文件名和内容hash生成文件名
    filename: "[name].js",
    path: path.resolve(__dirname, "dist"),
  },
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: "jzplp-test",
    }),
    new MiniCssExtractPlugin(),
  ],
};
```

注意我们除了新建MiniCssExtractPlugin插件外，还把style-loader替换成插件自带的loader了。生成结果如下。

```js
// dist/index.js
(() => {
  "use strict";
  function e(e, t) {
    const n = document.createElement("div");
    ((n.className = t), (n.textContent = e), document.body.appendChild(n));
  }
  (e("jzplp1", "qaz"), e("jzplp2", "fSAWgreSNL09jvgiZJuV"), console.log(data));
})();

// dist/another.js
console.log("another");
```

然后是dist/index.css文件。注意我们引入了多种CSS/SCSS文件，但最后合并生成为了一个。

```css
.qaz {
  color: blue;
}
.fSAWgreSNL09jvgiZJuV{color:red}
```

如果不使用HtmlWebpackPlugin插件，生成的结果就只有上面的文件，CSS和JS文件是分离的。如果使用了HtmlWebpackPlugin插件会多一个dist/index.html将上面的文件都引入。

```html
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>jzplp-test</title>
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <script defer="defer" src="index.js"></script>
    <script defer="defer" src="another.js"></script>
    <link href="index.css" rel="stylesheet" />
  </head>
  <body></body>
</html>
```

## 钩子和生命周期
### 新建插件和钩子用法
插件是一个JavaAscript类，这个类需要有一个apply方法，Webpack在注入插件的时候会调用。如果需要接收插件参数，则需要从构造函数中接收。

```js
const pluginName = "JzplpPlugin";

module.exports = class JzplpPlugin {
  options = {};
  constructor(options) {
    console.log('constructor')
    // 获取插件参数并保存
    this.options = options;
  }

  apply(compiler) {
    console.log("apply", this.options);
    // 钩子
    compiler.hooks.compile.tap(pluginName, () => {
      console.log("hook compile");
    });
  }
};
```

apply方法接收一个compiler参数，在它上面可有很多hooks钩子，我们可以编写触发相应钩子的回调函数。这里再看下Webpack配置和执行结果。

```js
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const JzplpPlugin = require("./plugin/jzplpPlugin");

module.exports = {
  /// 其它Webpack配置
  plugins: [
    new JzplpPlugin({ abc: 123 }),
    // 其它Webpack插件
  ]
};

/* 打包时命令行输出
constructor
apply { abc: 1234 }
hook compile
*/
```

Webpack提供了非常多的钩子，我们在后面会介绍。有些钩子只能同步方式回调，有些可以异步方式，对应三种tap方法，这里以代码形式举例说明：

```js
const pluginName = "JzplpPlugin";

module.exports = class JzplpPlugin {
  apply(compiler) {
    // tap 同步回调
    compiler.hooks.compile.tap(pluginName, () => {
      console.log("hooks tap");
    });

    // tapAsync 异步回调
    compiler.hooks.run.tapAsync(pluginName, (data, callback) => {
      setTimeout(() => {
        console.log("hooks tapAsync");
        callback();
      }, 1000);
    });

    // tapPromise 异步回调
    compiler.hooks.make.tapPromise(pluginName, () => {
      return new Promise((resolve) =>
        setTimeout(() => {
          console.log("hooks tapPromise Promise");
          resolve();
        }, 1000),
      );
    });

    // tapPromise 异步回调 async
    compiler.hooks.emit.tapPromise(pluginName, async () => {
      await new Promise((resolve) =>
        setTimeout(() => {
          resolve();
        }, 1000),
      );
      console.log("hooks tapPromise async");
    });
  }
};

/* 打包时命令行输出
hooks tapAsync
hooks tap
hooks tapPromise Promise
hooks tapPromise async
*/
```

### compiler编译器钩子
Webpack提供了很多插件钩子，这些钩子实际上对应Webpack打包过程中的声明周期过程。这里我们简述一下插件钩子和生命周期关系。首先介绍compiler编译器钩子。

**1.初始化阶段**
| 钩子名称 | 含义和触发时机 |
| - | - |
| environment | 初始化环境配置 |
| afterEnvironment | 环境准备完成后触发 |
| entryOption | webpack配置的entry处理之后 |
| afterPlugins | 所有插件初始化之后 |
| afterResolvers | 所有模块解析器（Resolver）初始化之后 |

**2.启动阶段**
| 钩子名称 | 含义和触发时机 |
| - | - |
| initialize | 当编译器对象被初始化时触发 |
| beforeRun | 开始构建之前触发 |
| run | 构建正式开始 |
| watchRun | 监听模式下，每次重新构建之前触发 |

**3.编译阶段**
| 钩子名称 | 含义和触发时机 |
| - | - |
| beforeCompile | 创建Compilation实例前，可修改参数	 |
| compile | 创建Compilation实例前，不可修改参数 |
| thisCompilation | 初始化Compilation时 |
| compilation | 初始化Compilation之后 |
| make | Compilation创建完毕，生命周期开始前 |
| afterCompile | Compilation编译过程结束后 |

**4.输出阶段**
| 钩子名称 | 含义和触发时机 |
| - | - |
| shouldEmit | 在输出产物之前调用，返回true/false决定是否输出 |
| emit | 在输出全部产物到文件目录之前 |
| assetEmitted | 每一个文件输出后触发 |
| afterEmit | 在输出全部产物到文件目录之后 |

**4.结束阶段**
| 钩子名称 | 含义和触发时机 |
| - | - |
| done | 编译完成之后 |
| failed | 编译失败之后 |
| invalid | 监听模式下，一次编译失效后（可能来源于文件变更导致的失效，不是编译失败） |
| watchClose | 监听模式关闭 |
| shutdown | 编译器关闭 |

这些钩子虽然很多，而且非常细致，进行一个步骤的前前后后有多个钩子顺序触发。这些钩子可能是同步的，可能是异步的，会有不同的参数和返回值，这里就不一一描述了，可以查看Webpack文档。编译阶段实际上并没有做编译工作，而是创建Compilation，由它来完成编译。我们会在后面介绍Compilation相关使用和钩子。

### compilation编译过程钩子
在前面的钩子列表介绍中，我们介绍了compiler编译器钩子。但它实际上并不负责真正的编译任务，而是创建compilation编译过程，由它来负责真正的编译工作。在生产模式打包过程中，compiler只会触发一次，compilation一般也只触发一次。但在监听模式下，compilation会触发多次。下面我们介绍一下compilation编译过程的相关钩子和生命周期关系。

**1.构建阶段**
| 钩子名称 | 含义和触发时机 |
| - | - |
| buildModule | 单个模块构建开始之前触发 |
| succeedModule | 单个模块构建成功触发 |
| failedModule | 单个模块构建失败触发 |
| finishModules | 所有模块都完成构建且没有错误时触发 |

**2.优化阶段**
| 钩子名称 | 含义和触发时机 |
| - | - |
| seal | 停止接收新的模块，开始优化阶段 |
| optimizeDependencies | 依赖优化开始时触发 |
| afterOptimizeDependencies | 依赖优化之后触发 |
| optimize | 优化阶段开始时触发 |
| optimizeModules | 模块优化阶段开始时触发 |
| afterOptimizeModules | 模块优化完成之后触发 |
| optimizeChunks | chunk优化开始时触发 |
| afterOptimizeChunks | chunk优化完成之后触发 |
| optimizeTree | 优化依赖树之前触发 |
| afterOptimizeTree | 优化依赖树之后触发 |
| optimizeChunkModules | 优化Chunk内的模块开始时触发 |
| afterOptimizeChunkModules | 优化Chunk内的模块完成之后触发 |

**3.Record阶段**
| 钩子名称 | 含义和触发时机 |
| - | - |
| shouldRecord | 返回值决定是否存储record |
| reviveModules | 从record中恢复模块信息 |
| beforeModuleIds | 为每个模块分配id之前 |
| moduleIds | 为每个模块分配一个id |
| optimizeModuleIds | 在模块id优化开始时调用 |
| afterOptimizeModuleIds | 在模块 id 优化完成时调用 |
| reviveChunks | 从record中恢复chunk信息 |
| beforeChunkIds | 在为每个chunk分配id之前 |
| chunkIds | 为每个chunk分配id时 |
| optimizeChunkIds | chunk id优化阶段开始时 |
| afterOptimizeChunkIds | chunk id优化结束之后 |
| recordModules | 将模块信息存储到record中 |
| recordChunks | 将chunk存储到record中 |
| beforeModuleHash | 在创建模块哈希之前 |
| afterModuleHash | 在创建模块哈希之后 |
| beforeHash | 在compilation添加哈希之前 |
| afterHash | 在compilation添加哈希之后 |
| recordHash | record的信息存储到records中 |
| record | 将compilation相关信息存储到record中 |

**4.资源生成和优化阶段**
| 钩子名称 | 含义和触发时机 |
| - | - |
| beforeModuleAssets | 在创建模块asset之前 |
| shouldGenerateChunkAssets | 是否生成chunk asset，返回false不生成 |
| beforeChunkAssets | 在创建 chunk asset 之前 |
| additionalAssets | 创建额外asset |
| optimizeAssets | 优化存储在compilation.assets中的所有asset |
| afterOptimizeAssets | asset优化之后 |
| processAssets | 处理和修改asset，其中包含多个步骤 |
| afterProcessAssets | processAssets完成后 |

**4.资源密封和后处理阶段**
| 钩子名称 | 含义和触发时机 |
| needAdditionalSeal | compilation是否需要解除seal以引入其他文件 |
| afterSeal | 在needAdditionalSeal之后 |
| - | - |
| - | - |
| - | - |



### 使用编译过程钩子

编译过程钩子怎么使用




## 做一点简单的插件？



## 自定义hooks

### tapable简介

### 怎么自定义？



## 参考
- Webpack如何实现万物皆可import？loader的使用/配置/手写实践\
  https://jzplp.github.io/2026/webpack-loader.html
- Webpack GitHub\
  https://github.com/webpack/webpack
- Webpack 文档\
  https://webpack.js.org/
- Webpack 中文文档\
  https://webpack.docschina.org/
- Webpack 插件列表\
  https://webpack.docschina.org/plugins/
- Webpack Plugin API\
  https://webpack.docschina.org/api/plugins/
- Webpack概念 plugin\
  https://webpack.docschina.org/concepts/plugins/
- Webpack 自定义插件\
  https://webpack.docschina.org/contribute/writing-a-plugin/
- html-webpack-plugin GitHub\
  https://github.com/jantimon/html-webpack-plugin
- tapable GitHub\
  https://github.com/webpack/tapable
- Webpack TerserWebpackPlugin\
  https://webpack.docschina.org/plugins/terser-webpack-plugin/
- Webpack MiniCssExtractPlugin\
  https://webpack.docschina.org/plugins/mini-css-extract-plugin/

