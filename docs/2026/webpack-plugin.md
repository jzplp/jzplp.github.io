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

**5.资源密封和后处理阶段**
| 钩子名称 | 含义和触发时机 |
| - | - |
| needAdditionalSeal | compilation是否需要解除seal以引入其他文件 |
| afterSeal | 在needAdditionalSeal之后 |
| chunkHash | 为每个chunk生成hash |
| moduleAsset | 单个模块生成单个asset，被添加到compilation时 |
| chunkAsset | 单个chunk生成单个asset，被添加到compilation时 |
| assetPath | 决定asset的路径 |
| needAdditionalPass | 决定asset在输出后是否需要进一步处理 |
| childCompiler | 子compiler设置之后 |

通过上面的钩子可以看到，构建，优化，缓存，生成module，chunk和assets等，都是在compilation编译过程中运行的。compiler和compilation钩子的含义和触发时机涉及到Webpack整个声明周期和构建优化流程，要想理解需要深入Webpack各种知识和源码，是一个较大的主题，因此这里就不详细介绍了。

### 使用编译过程钩子
插件在执行apply方法时，compilation对象还没有创建，因此无法监听钩子。可以通过监听compiler钩子，在回调中拿到compilation对象，然后再监听compilation钩子。

```js
const pluginName = "JzplpPlugin";

module.exports = class JzplpPlugin {
  apply(compiler) {
    compiler.hooks.thisCompilation.tap(pluginName, (compilation) => {
      console.log("compiler thisCompilation");

      compilation.hooks.finishModules.tap(pluginName, () => {
        console.log("compilation finishModules");
      });
      compilation.hooks.optimize.tap(pluginName, () => {
        console.log("compilation optimize");
      });
    });
  }
};

/* 打包时命令行输出
compiler thisCompilation
compilation finishModules
compilation optimize
*/
```

获取compilation对象最常用的compiler钩子是thisCompilation和compilation，这两个在compilation对象创建时触发。其中thisCompilation时间更早。其它compiler钩子也能拿到compilation对象，但是由于它们触发时间较晚，晚于一些compilation钩子的时间，即使我们监听了，也不会被触发。例如make, afterCompile, emit等钩子。但是这些钩子拿到compilation对象后，可以访问对象中挂载的数据，因此还是有意义的。

## Node.js脚本和各类对象
在真正开始插件开发之前，我们先来看一下如何在Node.js中使用Webpack。为什么要先了解这个？因为Node.js中使用Webpack，用的正是我们前面介绍的compiler对象。了解如何使用Webpack，对后面的插件开发也有帮助。

### 编译脚本
首先创建文件script/a.js，里面放置使用Webapck编译的脚本。引入webpack后，当作一个函数调用，第一个参数为打包配置，注意这里

```js
const webpack = require('webpack');
const config = require("../webpack.config.js");

webpack(config, (err, stats) => {
  console.log("打包成功！");
});
```

引入webpack后，当作一个函数调用，第一个参数为打包配置，注意这里Webpack不会自动读入webpack.config.js文件，需要我们手动引入并传给Webpack。第二个参数是一个回调函数，无论打包成功还是失败都会触发回调。命令行执行node script/a.js之后，可以看到一致的打包结果。

打包失败可以分为两种类型。第一种是编译失败，这种错误不会在err中展示，而是放到stats中。第二种是非编译错误，例如Webapck内部错误，我们传的配置不对，或者Webpack插件引发报错等，这种错误会中断打包流程，在err中展示。

```js
const webpack = require("webpack");
const config = require("../webpack.config.js");

webpack(config, (err, stats) => {
  if (err) {
    console.error(err.stack || err);
    return;
  }
  const info = stats.toJson();

  if (stats.hasErrors()) {
    console.log("stats error", info.errors);
    return;
  }

  if (stats.hasWarnings()) {
    console.log("stats warn", info.warnings);
  }
  console.log("打包成功！");
});
```

这里输出了几种错误类型。我们故意引发错误试一下：

```js
// 传入错误配置： webpack('', (err, stats) => {
PS E:\testProj\webpack-plugin\use-plugin> node script/a.js
ValidationError: Invalid configuration object. Webpack has been initialized using a configuration object that does not match the API schema.
 - configuration should be an object:
...省略

// 自定义插件引发异常 apply(compiler) { throw new Error(); }
PS E:\testProj\webpack-plugin\use-plugin> node script/a.js
Error
    at JzplpPlugin.apply (E:\testProj\webpack-plugin\use-plugin\plugin\jzplpPlugin.js:5:11)
    at createCompiler (E:\testProj\webpack-plugin\use-plugin\node_modules\webpack\lib\webpack.js:102:12)
...省略

// 编译错误，代码中的文件名不对 import { abc } from "./index.module.scss1";
PS E:\testProj\webpack-plugin\use-plugin> node script/a.js
stats error [
  {
    moduleIdentifier: 'E:\\testProj\\webpack-plugin\\use-plugin\\src\\index.js',
    moduleName: './src/index.js',
    loc: '2:0-43',
    message: "Module not found: Error: Can't resolve './index.module.scss1' in 'E:\\testProj\\webpack-plugin\\use-plugin\\src'",
...省略
```

### 使用compiler对象
如果不对webpack对象传入回调函数，webpack对象会返回一个Compiler的实例。这个实例实际上就是插件中的那个Compiler对象。对这个对象调用run方法，参数和效果与前面编译脚本一致。

```js
const webpack = require("webpack");
const config = require("../webpack.config.js");

const compiler = webpack(config);
compiler.run((err, stats) => {
  console.log("打包成功！");
});
```

除了run方法之外，compiler对象中还有一些方法，例如watch监听模式，close关闭编译器，保存缓存等。这里拿到的compiler对象，和在插件里一样可以使用各种钩子，也可以使用compilation钩子。

```js
const webpack = require("webpack");
const config = require("../webpack.config.js");

const pluginName = "JzplpPlugin";
const compiler = webpack(config);

compiler.hooks.thisCompilation.tap(pluginName, (compilation) => {
  console.log("compiler thisCompilation");

  compilation.hooks.finishModules.tap(pluginName, () => {
    console.log("compilation finishModules");
  });
  compilation.hooks.optimize.tap(pluginName, () => {
    console.log("compilation optimize");
  });
});

compiler.run((err, stats) => {
  console.log("打包成功！");
});

/* 打包时命令行输出
compiler thisCompilation
compilation finishModules
compilation optimize
打包成功！
*/
```

### stats对象
编译时回调函数入参的stats对象，我们前面构建脚本中使用它来判断构建过程是否有错误，事实上它有很多属性和方法，首先我们列举一下主要方法。

* stats.hasErrors() 返回编译过程是否有错误
* stats.hasWarnings() 返回编译过程是否有警告
* stats.toJson(options) 以JSON对象形式返回编译信息
* stats.toString(options) 以字符串形式返回编译信息

其中toJson和toString的参数一致，包含字符串参数预设（Stats Presets）和参数对象等形式，可以查看Webapck文档中Stats对象参数部分，这里就不描述了。stats保存了大量代码编译过程中的信息，这里我们使用toJson方法输出对象，看一下都包含了哪些信息：

```js
const webpack = require("webpack");
const config = require("../webpack.config.js");

const compiler = webpack(config);
compiler.run((err, stats) => {
  const info = stats.toJson();
  console.log(JSON.stringify(info));
});
```

然后是输出结果。由于输出结果很长，因此这里只截取了部分输出信息。

```json
{
  "hash": "317735e3c5acfb30d4b5", // 一次编译的哈希值
  "version": "5.107.2", // webpack版本
  "time": 742, // 编译时间（毫秒）
  "builtAt": 1781607761628, // 构建时间戳
  "outputPath": "E:\\testProj\\webpack-plugin\\use-plugin\\dist", // 输出目录路径
  "assetsByChunkName": { // 输出资源对应的Chunk名称
    "index": ["index.css", "index.js"],
    "another": ["another.js"]
  },
  "assets": [/* ... */], // asset列表
  "chunks": [/* ... */], // chunk列表
  "modules": [/* ... */], // module列表
  "entrypoints": {/* ... */}, // entry列表
  "namedChunkGroups": [/* ... */],
  "errors": [], // error列表
  "errorsCount": 0, // 错误个数
  "warnings": [], // warning列表
  "warningsCount": 0, // warning个数
  "children": [/* ... */] // 子编译器列表
}
```

其中children中每个元素是一个上述的结构，例如在本次打包中HtmlWebpackPlugin插件就创建了一个子编译器，用来生成HTML文件。stats内还有几个列表，我们分别介绍其中的属性。注意Webpack中文文档中的部分属性描述可能是错的。

```json
// asset属性
{
  "type": "asset",
  "name": "index.js", // 输出文件名
  "size": 631, // 文件大小（字节为单位）
  "emitted": true, // 资源文件是否要生成到output目录中
  "comparedForEmit": false, // 指定是否对该资源文件和输出文件系统上相同文件进行比较
  "cached": false, // 是否已缓存
  "info": {"javascriptModule": false, "minimized": true, "size": 631 },
  "chunkNames": ["index"], // 该资源文件包含的 chunks
  "related": [], //	关联文件信息
  "chunks": [57], // 该资源文件包含的 chunk ID
}

// chunk属性
{
  "rendered": true, // chunk是否输出到最终构建结果
  "initial": true, // chunk是在页面初始化时加载还是按需加载
  "entry": true, // 当前chunk是否包含了webpack运行时
  "recorded": false, // chunk是否已被记录到Webpack的持久化缓存中
  "size": 1131, // 整个chunk的总体积（字节）
  "sizes": { "javascript": 413, "css/mini-extract": 55, "runtime": 663 }, // 按资源类型细分的体积明细
  "names": ["index"], // 当前chunk的别名
  "runtime": ["index"], // 当前chunk所属的运行时环境名称
  "files": ["index.css", "index.js"], // chunk包含的文件名数组
  "hash": "25da9b3c7be8858ab78c", // 基于chunk内容生成的唯一哈希值
  "id": 57, // chunk对应的ID
  "siblings": [], // 与当前chunk同级生成的其他chunk
  "parents": [], // 生成当前chunk的父级chunk
  "children": [], // 当前chunk进一步分割出的子级chunk
  "modules": [/* ... */], // chunk包含的module列表 
  "origins": [/* ... */] // chunk的来源
},

// module属性
{
  "type": "module",
  "moduleType": "javascript/auto", // 模块类型
  "layer": null, // 构建层
  "size": 352, // 模块大小，单位为字节
  "sizes": { "javascript": 352 }, // 按具体资源类型细化该模块的体积组成
  "built": true, // 该模块是否实际执行了构建流程
  "codeGenerated": true, // 该模块是否生成了运行时代码
  "buildTimeExecuted": false, // 该模块是否在构建阶段就被执行了
  "cached": false, // 是否是持久化缓存
  "identifier": "E:\\testProj\\webpack-plugin\\use-plugin\\src\\index.js", // 模块标识符
  "name": "./src/index.js", // 实际文件的路径
  "nameForCondition": "E:\\testProj\\webpack-plugin\\use-plugin\\src\\index.js", // 用于条件匹配（Rule.issuer 或 Rule.resource）时使用的路径
  "index": 0, // 模块在所有模块列表中的全局排序索引
  "cacheable": true, // 是否允许被Webpack缓存
  "optional": false, // 其他模块在请求当前模块时，是否把这次请求标记为可选的
  "issuer": null, // 表示当前模块的父模块
  "issuerName": null, // 父模块路径
  "issuerPath": null, // 从入口模块到当前模块的完整路径
  "failed": false,  // 当前模块编译是否失败
  "errors": 0, // 处理模块时的错误个数
  "warnings": 0, // 处理模块时的警告个数
  "id": 44, // 模块ID
  "issuerId": null, // 父模块ID
  "chunks": [57], // 包含（引用了）当前模块的所有Chunk的ID列表
  "reasons": [/* ... */], // 其他模块请求当前模块的具体信息
  "usedExports": [], // 被其他模块实际使用到的导出名称
  "providedExports": [], // 该模块自己对外提供了哪些导出名称
  "depth": 0 // 该模块在依赖树中的嵌套深度
},

// entry属性
"index": {
  "name": "index", // 入口点的名称
  "chunks": [57], // 该入口点包含的所有 Chunk 的 ID 列表
  "assets": [ // 该入口点首屏加载时需要下载的主要资源列表
    { "name": "index.css", "size": 57 },
    { "name": "index.js", "size": 631 }
  ],
  "assetsSize": 688, // assets数组中所有资源的总体积（字节）
  "auxiliaryAssets": [], // 辅助资源列表
  "auxiliaryAssetsSize": 0, // auxiliaryAssets 数组中所有资源的总体积（字节）
  "children": {}, // 子编译器生成的入口点映射
},
```

### 重要对象关系
前面我们介绍stats对象中的属性，提到了asset属性，chunk属性，module属性，entry属性。这每一个对象都是Webpack中的一类重要数据。下面我们介绍一下它们的含义和对应关系。

* entry 打包入口，即我们Webpack配置中的entry属性，是打包构建的起点。一次打包中可能出现多个属性。
* module Webpack中一个源代码文件一般表示一个模块，像vue文件可以划分为3个子模块（模板/js/css）。
* chunk Webpack内部的处理概念，表示一个代码片段集合。一个entry是一个chunk，动态导入或分隔也产生单独的chunk。
* asset 一个asset代表一个要输出的文件

他们之间的关系如下：

* Webpack打包是从entry开始，根据import关系生成依赖图，其中每个元素都是一个模块。一个entry中可以包含多个模块，不同的entry可以共享模块。
* Webpack构建时会将多个的module合并成一个chunk。合并规则为一个entry生成一个chunk，动态导入，分隔/复用代码等会生成单独的chunk。
* 一个chunk至少生成一个asset，像是sourcemap等场景，一个chunk会生成多个asset。一个asset不能合并多个chunk输出。

因此，实际上Webpack构建是分割，合并，再分割的过程。首先将entry入口分割成一个一个的模块；然后将模块合并成chunk；最后分割成asset文件输出。

### compilation对象属性和方法
stats对象中，还能拿到compilation对象，以stats.compilation访问。事实上stats对象输出的部分打包数据就是从compilation对象中整理获取的。compilation对象中的数据大致有：

* modules 编译中所有处理过的模块
* chunks 编译中所有生成的Chunk
* assets 编译中所有生成的asset
* entrypoints 所有的入口点
* errors 编译错误信息
* warnings 编译警告信息
* hash 本次编译的唯一标识哈希值
* name 当前编译的名称
* compiler 指向当前compiler对象的引用


可以看到，和stats输出的数据非常像，但内部结构和格式不一样。compilation对象上还有很多方法，但stats对象存在的回调函数触发时，已经是打包结束的状态了，因此不能操作这些方法。不过在插件开发中，还是可能用到的。这里列举一下compilation对象的部分方法：

* getStats 返回当前编译的stats对象
* addModule 添加一个模块
* getModule 通过标识符获取模块
* findModule 尝试通过标识符搜索模块
* buildModule 构建给定的模块
* processModuleDependencies 处理给定模块依赖
* addEntry 添加入口
* rebuildModule 触发模块重建
* finish 完成编译回调
* seal 封闭编译
* unseal 解除封闭编译
* reportDependencyErrorsAndWarnings 将给定模块的错误和警告添加到编译的错误和警告中
* addChunkInGroup 将模块添加到现有chunk组或创建一个新的组
* addChunk 创建或添加一个新的chun
* createChildCompiler 允许在webpack中运行另一个webpack实例
* emitAsset 产出一个新的Asset
* updateAsset 更新一个Asset
* deleteAsset 删除一个Asset
* getAssets 返回当前编译的所有Asset
* getAsset 获取单个Asset
* createHash 为本次构建生成唯一标识

### compiler对象属性
compiler对象除了前面介绍的方法之外，还有一些属性，这些属性可能对于后面的插件开发是有帮助的。上面介绍过的方法和钩子这里就不再重复介绍了。

* options Webpack配置对象，为用户配置+默认配置的结合
* context 项目目录的绝对路径
* inputFileSystem和outputFileSystem 读取源文件和写入输出文件的工具接口
* webpack 当前编译使用的webpack对象
* outputPath 最终资源的输出目录的绝对路径
* records 打包后可读取，里面存放module和chunk的ID等信息
* resolverFactory 用于创建 Resolver 实例的工厂对象
* running 正在打包时读取为true，否则为false
* cache 缓存管理器示例

其中options对象也就是我们配置的webapck.config.js的内容。但即使我们的配置项很少，这个选项也非常大，因为它合并了Webapck的默认配置项。

## 自定义插件开发
### 触发脚本
首先我们从最简单的插件开始，首先是在构建结束后，执行传入的脚本代码。首先是插件代码：

```js
const pluginName = "JzplpPlugin";

module.exports = class JzplpPlugin {
  options = {};
  constructor(options) {
    console.log('constructor')
    this.options = options;
  }
  apply(compiler) {
    compiler.hooks.done.tap(pluginName, () => {
      this.options?.func?.();
    });
  }
};
```

然后调用插件时，func参数中传入一个函数，当构建完成时函数代码就会被执行。

```js
// 使用方式
new JzplpPlugin({
  func: () => {
    console.log("jzplp func");
  },
}),

/* 打包时输出结果
jzplp func
*/
```

然后我们尝试使用插件实现output.clean的功能，即生成构建结果前，先把旧输出目录中的文件删除。

```js
const fs = require("fs");
const pluginName = "JzplpPlugin";

module.exports = class JzplpPlugin {
  apply(compiler) {
    // emit钩子，在asset输出到文件前调用
    compiler.hooks.emit.tap(pluginName, () => {
      // 获取webPack配置中的输出路径
      const path = compiler.options.output.path;
      // 删除目录下所有文件
      fs.rmSync(path, { force: true, recursive: true });
    });
  }
};
```

### 新增和修改asset
尝试新增和修改asset，实现对输出文件的直接控制。

```js
const pluginName = "JzplpPlugin";

module.exports = class JzplpPlugin {
  option = {};
  constructor(options) {
    // 获取插件参数
    this.options = options;
  }
  apply(compiler) {
    // 从compiler中获取webpack对象
    const { webpack } = compiler;
    // Compilation 中放着processAssets钩子的stage常量
    const { Compilation, sources } = webpack;

    compiler.hooks.thisCompilation.tap(pluginName, (compilation) => {
      compilation.hooks.processAssets.tap(
        {
          name: pluginName,
          // 此时所有asset已被添加到compilation中
          stage: Compilation.PROCESS_ASSETS_STAGE_SUMMARIZE,
        },
        // assets为 { filePath: fileContent, ... } 的对象
        (assets) => {
          // 新文件内容为asset的路径列表
          const fileContent =
            "# File List\n" +
            Object.keys(assets)
              .map((key) => "* " + key)
              .join("\n");
          // 创建新的源码对象
          const source = new sources.RawSource(fileContent);
          // 生成一个新的asset，放到compilation中
          compilation.emitAsset(this.options?.filaName || "fileList.md", source);
        },
      );
    });
  }
};

/* 文件输出结果
# File List
* index.css
* index.js
* another.js
* index.html
*/
```

在这个例子中，我们尝试了在asset全部生成后读取所有asset路径，然后写入一个新的asset内，最后输出成文件，放到dist/fileList.md中。然后我们再试一下，修改已有的asset。在下面的插件中，我们尝试合并source，将每个asset顶部新增一句注释。

```js
const pluginName = "JzplpPlugin";

module.exports = class JzplpPlugin {
  apply(compiler) {
    const { webpack } = compiler;
    const { Compilation, sources } = webpack;
    compiler.hooks.thisCompilation.tap(pluginName, (compilation) => {
      compilation.hooks.processAssets.tap(
        {
          name: pluginName,
          stage: Compilation.PROCESS_ASSETS_STAGE_SUMMARIZE,
        },
        (assets) => {
          Object.keys(assets).map((key) => {
            const content = `/* fileName: ${key} */\n`;
            const source = new sources.RawSource(content);
            // 合并两个source
            const newSource = new sources.ConcatSource(source, assets[key]);
            // 更新现有的asset
            compilation.updateAsset(key, newSource);
          });
        },
      );
    });
  }
};

// 输出文件顶部示例
/* fileName: index.js */
```

这里我们再尝试修改已有的asset内容，使用ReplaceSource来替换。

```js
const pluginName = "JzplpPlugin";

module.exports = class JzplpPlugin {
  apply(compiler) {
    const { webpack } = compiler;
    const { Compilation, sources } = webpack;
    compiler.hooks.thisCompilation.tap(pluginName, (compilation) => {
      compilation.hooks.processAssets.tap(
        {
          name: pluginName,
          stage: Compilation.PROCESS_ASSETS_STAGE_SUMMARIZE,
        },
        (assets) => {
          Object.keys(assets).map((key) => {
            // 获取当前的asset代码
            const src = assets[key].source().toString();
            // 找到要修改的位置
            const index = src.indexOf("jzplp");
            if (index != -1) {
              const reSource = new sources.ReplaceSource(assets[key], key);
              // 区间是前闭后闭，长度为字符串长度-1，第三个参数为替换内容
              reSource.replace(index, index + 4, "jzplpHello");
              compilation.updateAsset(key, reSource);
            }
          });
        },
      );
    });
  }
};

/*
使用插件前生成代码
e.exports = { note: { to: ["jzplp1"], from: ["jzplp2"] } };
使用插件后生成代码
e.exports = { note: { to: ["jzplpHello1"], from: ["jzplp2"] } };
*/
```

这里将每个文件中第一次出现的jzplp替换为jzplpHello，replace函数不要求替换前后字符串长度一致。

### 各种Source
前面操作asset的代码中，我们从webpack.sources中取出了很多以Source结尾的类，并使用这些类创建了对象。Source类是Webpack中操作源码的重要类，负责源代码的读取，转换合并等。因此这里列举一下Source的类型和对应作用。

* RawSource 没有关联Source Map的源码
* OriginalSource 源码，包含自动生成的Source Map
* SourceMapSource 源码，包含传入的Source Map
* ConcatSource 将多个Source拼接成一个
* ReplaceSource 可以对Source中的源码进行替换操作
* CachedSource 缓存其它Source的计算结果
* SizeOnlySource 仅提供资源大小的Source
* PrefixSource 为源码为一行提供前缀
* CompatSource 将非标准Source对象转换为符合标准的Source

### 重写module路径
在Webpack相关开发中，修改module内容一般放到loader中实现。但我们可以在loader引入之前，修改引入的module路径，从而实现替换文件的效果。

```js
const pluginName = "JzplpPlugin";

module.exports = class JzplpPlugin {
  apply(compiler) {
    compiler.hooks.normalModuleFactory.tap(
      pluginName,
      (normalModuleFactory) => {
        // 当引入每个新模块时触发，此时模块路径还没有被解析
        normalModuleFactory.hooks.beforeResolve.tap(
          pluginName,
          (resolveData) => {
            // 原模块路径
            const path = resolveData.request;
            // 替换为另一个模块路径
            if (path.endsWith("index1.css"))
              resolveData.request = path.replace("index1.css", "index2.css");
          },
        );
      },
    );
  }
};
```

在使用插件之前，代码引入的是index1.css代码，但是经过插件处理之后，引入的代码变为了index2.css的内容。这里引入了一种前面没介绍过的插件钩子对象类型normalModuleFactory。normalModuleFactory是一个处理模块的工厂，负责解析模块路径，确定应用的loader，对于每个模块生成一个NormalModule对象。但是它并不实际引入模块代码，引入还是在compilation中的build相关流程中实现，那里模块代码会先经过loader处理。

所以这里我们在解析路径前替换了模块路径，Webpack会按照新的路径解析引入模块，最后生成代码中也是使用新路径的源码。normalModuleFactory中也有多个钩子，这里也简单介绍一下：

* beforeResolve 遇到新的模块时触发
* resolve 在初始化解析之前调用
* resolveForScheme 在请求被解析之前调用
* afterResolve 在解析带有URI Scheme的请求（如data:,http:）时触发
* createModule 完成路径解析后触发
* createModule 在创建NormalModule实例之前调用
* module 在创建NormalModule实例后调用
* createParser 在Parser实例创建之前调用
* parser 在创建Parser实例后触发
* createGenerator 在Generator实例创建之前调用
* generator 在Generator实例创建之后调用

注意这里仅仅是解析路径，创建Parser实例（解析AST使用），创建Generator实例（代码生成器）。但这里不引入代码，更不会解析AST和代码生成，仅仅是配置项和创建相关实例，实际操作都是在compilation中处理的。

### 修改HTML中资源URL
前面我们使用HtmlWebpackPlugin插件，生成了HTML入口文件，其中使用标签中引用URL的方式，引入了输出的asset资源文件。下面我们编写插件，实现修改这些标签中的URL。

```js
const fs = require("fs");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const pluginName = "JzplpPlugin";

module.exports = class JzplpPlugin {
  apply(compiler) {
    compiler.hooks.compilation.tap(pluginName, (compilation) => {
      // 获取package.json路径
      const pkgPath = path.resolve(compiler.options.context, "package.json");
      // 读取package.json数据
      const pkgData = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));

      // 获取HtmlWebpackPlugin的钩子
      const hooks = HtmlWebpackPlugin.getCompilationHooks(compilation);
      // alterAssetTags钩子，标签生成后，写入前触发
      hooks.alterAssetTags.tap(pluginName, (data) => {
        // 处理script标签
        data.assetTags.scripts.forEach((tag) => {
          if (tag.tagName === "script" && tag?.attributes?.src)
            tag.attributes.src = `${tag.attributes.src}?v=${pkgData.version}`;
        });
        // 处理link标签
        data.assetTags.styles.forEach((tag) => {
          if (tag.tagName === "link" && tag?.attributes?.href)
            tag.attributes.href = `${tag.attributes.href}?v=${pkgData.version}`;
        });
      });
    });
  }
};
```

在上面的插件中，首先读取了package.json文件内容，然后获取HtmlWebpackPlugin插件中的自定义钩子，然后对HtmlWebpackPlugin插件生成标签数据进行改动，其中script标签引入的是JavaScript文件，link标签引入的是CSS文件。通过对URL上增加版本号，可以使得不同版本的代码路径不一致，从而不同版本间浏览器缓存失效。是否使用插件的生成效果对比如下：

```html
<!-- 不使用插件 -->
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

<!-- 使用插件 -->
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>jzplp-test</title>
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <script defer="defer" src="index.js?v=1.0.0"></script>
    <script defer="defer" src="another.js?v=1.0.0"></script>
    <link href="index.css?v=1.0.0" rel="stylesheet" />
  </head>
  <body></body>
</html>
```

## Tapable
在前面自定义插件中，我们使用了HtmlWebpackPlugin插件中的自定义钩子，这些钩子代表着HtmlWebpackPlugin生成HTML的不同阶段。因此插件也是可以自定义钩子，并且被其它插件触发的。Webpack中的钩子是使用Tapable实现事件监听和触发的，要想自定义钩子，首先需要了解Tapable。

### Tapable初步
首先让我们抛开Webapck，用几个例子来描述下Tapable的作用。

```js
const { SyncHook } = require("tapable");

// 创建钩子
const hook = new SyncHook(["arg1", "arg2"]);
// 监听钩子
hook.tap("jzplpTest1", (arg1, arg2) => {
  console.log("jzplpTest1", arg1, arg2);
});
// 监听钩子
hook.tap("jzplpTest2", (arg1, arg2) => {
  console.log("jzplpTest2", arg1, arg2);
});
// 触发钩子
hook.call("a1", "a2");

/* 命令行输出
jzplpTest1 a1 a2
jzplpTest2 a1 a2
*/
```

上面是一个同步钩子的示例，可以看到，创建钩子之后，可以对其进行监听回调，同时也可以触发事件。当事件触发时，所有监听的回调都能收到结果。然后我们再试一下异步钩子。

```js
const { AsyncParallelHook } = require("tapable");

// 创建钩子
const hook = new AsyncParallelHook(["arg1"]);

// 监听钩子
hook.tapAsync("jzplpTest", (data, callback) => {
  setTimeout(() => {
    console.log(data);
    callback();
  }, 1000);
});

// 触发钩子
hook.callAsync("a1", () => {
  console.log("a1 end");
});

// 触发钩子
hook.promise("a2").then(() => {
  console.log("a2 end");
});

/* 命令行输出
a1
a1 end
a2
a2 end
*/
```

触发异步钩子也有回调函数和Promise两种方式。注意监听钩子的回调函数结束之后，对应触发钩子的回调函数才会执行。

### Tapable类型列表
Tapable中的钩子类型除了同步和异步之外，还有很多种钩子，其中有这些分类：

* Sync 同步钩子
* Async 异步钩子
* Bail 熔断
* Waterfall 瀑布
* Loop 循环
* Parallel 并行请求
* AsyncSeries 串行请求

将上面这些分类组合，可以得到Tapable中的所有钩子类型：

* SyncHook 同步钩子
* SyncBailHook 同步熔断钩子
* SyncWaterfallHook 同步瀑布钩子
* SyncLoopHook 同步循环钩子
* AsyncParallelHook 异步并行请求钩子
* AsyncParallelBailHook 异步并行请求熔断钩子
* AsyncSeriesHook 异步串行请求钩子
* AsyncSeriesBailHook 异步串行请求熔断钩子
* AsyncSeriesLoopHook 异步串行请求循环钩子
* AsyncSeriesWaterfallHook 异步串行请求瀑布钩子

这些钩子类型不仅在自定义钩子中会用到，事实上Webapck内部也大量使用了这些不同类型的钩子。只看名称还是不懂这些钩子的使用和区别，下面我们按照钩子分类来介绍一下使用方式。

### Bail熔断
Bail类型钩子的特点是，回调函数串行调用，一个结束了再调用另一个。如果某一个回调函数返回非undefined值，后面的回调函数便不再触发。触发者收到的为第一个非
undefined值，或者undefined（所有回调都执行完毕）。注意，函数没有返回值时，相当于返回undefined。

```js
const { SyncBailHook } = require("tapable");

const hook = new SyncBailHook(["arg1"]);

hook.tap("test1", (arg1) => {
  console.log("test1", arg1);
});
hook.tap("test2", (arg1) => {
  console.log("test2", arg1);
  if (arg1 === "stop") return 1;
});
hook.tap("test3", (arg1) => {
  console.log("test3", arg1);
});

const data1 = hook.call("run");
console.log("run call", data1);
const data2 = hook.call("stop");
console.log("stop call", data2);

/* 命令行输出
test1 run
test2 run
test3 run
run call undefined
test1 stop
test2 stop
stop call 1
*/
```

当第一个run触发执行时，所有回调都没有返回值，因此所有回调都被执行了。stop触发时，第二个钩子返回了1，因此后面的第三个钩子不再执行，且call调用拿到的值也是1。

### Waterfall瀑布
Waterfall类型的钩子，会从头到尾串行执行所有的回调函数。但后一个回调函数收到的，是前一个回调函数返回的结果。call收到的值为最后一个回调函数返回的结果。

```js
const { SyncWaterfallHook } = require("tapable");

const hook = new SyncWaterfallHook(["arg1"]);

hook.tap("test1", (arg1) => {
  console.log("test1", arg1);
  return arg1 + 1;
});
hook.tap("test2", (arg1) => {
  console.log("test2", arg1);
  return arg1 * 3;
});
hook.tap("test3", (arg1) => {
  console.log("test3", arg1);
  return arg1 + 10;
});

const data1 = hook.call(1);
console.log("run call", data1);

/* 命令行输出
test1 1
test2 2
test3 6
run call 16
*/
```

在上面的例子中，我们对一开始传入的值进行累计计算，返回给了call最后得计算结果。当某个回调返回返回undefined（无返回值）时，下一个回调收到的时上上一个回调的结果（相当于绕过一个回调函数的返回值）。了。另外如果钩子还存在多于一个的参数，那么除第一个参数外，其它参数不参与返回值计算，每个钩子收到的都是call函数提供的值。

```js
const { SyncWaterfallHook } = require("tapable");

const hook = new SyncWaterfallHook(["arg1", "arg2"]);

hook.tap("test1", (arg1, arg2) => {
  console.log("test1", arg1, arg2);
  return arg1 + 1;
});
hook.tap("test2", (arg1, arg2) => {
  console.log("test2", arg1, arg2);
});
hook.tap("test3", (arg1, arg2) => {
  console.log("test3", arg1, arg2);
  return arg1 + 10;
});

const data1 = hook.call(1, "jzplp");
console.log("run call", data1);

/* 命令行输出
test1 1 jzplp
test2 2 jzplp
test3 2 jzplp
run call 12
*/
```

从例子中可以看到，虽然中间的test2回调没有返回值，但后面的test3依然取到了由test1返回的值，并输出了最终结果。arg2虽然没有被返回和处理，但每个回调函数依然能收到相同的由call提供的值。

### Loop循环
Loop类型的钩子，也会从头到尾串行执行所有的回调函数。如果所有回调函数都返回undefined值，则正常结束。如果有一个函数返回非undefined值，则钩子会从第一个回调开始重新触发全部回调函数，直到回调函数都都返回undefined值。

```js
const { SyncLoopHook } = require("tapable");

const hook = new SyncLoopHook(["arg1"]);
let loopNum = 3;

hook.tap("test1", (arg1) => {
  console.log("test1", arg1);
});
hook.tap("test2", (arg1) => {
  console.log("test2", arg1);
  if (loopNum-- != 0) return 1;
});
hook.tap("test3", (arg1) => {
  console.log("test3", arg1);
});

hook.call("jzplp");

/* 命令行输出
test1 jzplp
test2 jzplp
test1 jzplp
test2 jzplp
test1 jzplp
test2 jzplp
test1 jzplp
test2 jzplp
test3 jzplp
*/
```

在例子中，前4次test2回调都返回1，导致从第一个回调函数重新开始执行，直到第五次返回undefined，全部回调函数才执行完毕并结束。注意最后的test3只有最后一次才被执行到。

### AsyncParallel并行请求
AsyncParallel是仅适用于异步钩子的类型，指的是所有回调函数一起同时触发，并行执行。返回值会被忽略。

```js
const { AsyncParallelHook } = require("tapable");

const hook = new AsyncParallelHook(["arg1"]);

hook.tapAsync("test1", (arg1, cb) => {
  console.log("test1 start", arg1);
  setTimeout(() => {
    console.log("test1 end", arg1);
    cb();
  }, 2000);
});
hook.tapAsync("test2", (arg1, cb) => {
  console.log("test2 start", arg1);
  setTimeout(() => {
    console.log("test2 end", arg1);
    cb();
  }, 1000);
});
hook.tapAsync("test3", (arg1, cb) => {
  console.log("test3 start", arg1);
  setTimeout(() => {
    console.log("test3 end", arg1);
    cb();
  }, 1500);
});

hook.callAsync("jzplp", () => {
  console.log("callAsync end");
});

/* 命令行输出
test1 start jzplp
test2 start jzplp
test3 start jzplp
test2 end jzplp
test3 end jzplp
test1 end jzplp
callAsync end
*/
```

可以看到，虽然第一个test1最早开始（因为它注册最早），但由于定时时间最长，所以最晚结束。三个异步钩子实际上同时执行。

### AsyncParallelBailHook钩子
AsyncParallelBailHook是一种钩子类型，并不是分类，因为它的效果有点特色，所以拿出来单独描述。它有Parallel并行执行的特点，也具有Bail钩子返回第一个非undefined值的回调函数的特点。但这里不是按照钩子返回的异步事件顺序决定“第一个非undefined值的回调函数”，而是根据它们注册的顺序。

```js
const { AsyncParallelBailHook } = require("tapable");

const hook = new AsyncParallelBailHook(["arg1"]);

hook.tapAsync("test1", (arg1, cb) => {
  console.log("test1 start", arg1);
  setTimeout(() => {
    console.log("test1 end", arg1);
    cb();
  }, 2000);
});
hook.tapAsync("test2", (arg1, cb) => {
  console.log("test2 start", arg1);
  setTimeout(() => {
    console.log("test2 end", arg1);
    cb(1);
  }, 1000);
});
hook.tapAsync("test3", (arg1, cb) => {
  console.log("test3 start", arg1);
  setTimeout(() => {
    console.log("test3 end", arg1);
    cb(2);
  }, 3000);
});

hook.callAsync("jzplp", (data) => {
  console.log("callAsync end", data);
});

/* 命令行输出
test1 start jzplp
test2 start jzplp
test3 start jzplp
test2 end jzplp
test1 end jzplp
callAsync end 1
test3 end jzplp
*/
```

这里来理解一下这个例子的执行流程：
1. 三个异步回调函数被同时触发，这意味着三个定时器都开始定时，最终输出end都会触发。
2. 首先test2先结束，返回了1，但此时test1还没有结束，因此钩子在等待test1的结果。
3. test1定时器结束，返回了undefined。于是钩子转而查看test2，看到返回值为1，于是直接触发callAsync的回调函数，拿到值为1。
4. 最后test3定时器结束，但在此之前钩子就已经执行结束了。

### AsyncSeries串行请求
AsyncSeries类型的钩子是异步串行请求，即第一个异步回调完全执行完毕之后，再开始调用第二个回调函数。

```js
const { AsyncSeriesHook } = require("tapable");

const hook = new AsyncSeriesHook(["arg1"]);

hook.tapAsync("test1", (arg1, cb) => {
  console.log("test1 start", arg1);
  setTimeout(() => {
    console.log("test1 end", arg1);
    cb();
  }, 2000);
});
hook.tapAsync("test2", (arg1, cb) => {
  console.log("test2 start", arg1);
  setTimeout(() => {
    console.log("test2 end", arg1);
    cb();
  }, 1000);
});
hook.tapAsync("test3", (arg1, cb) => {
  console.log("test3 start", arg1);
  setTimeout(() => {
    console.log("test3 end", arg1);
    cb();
  }, 3000);
});

hook.callAsync("jzplp", () => {
  console.log("callAsync end");
});

/* 命令行输出
test1 start jzplp
test1 end jzplp
test2 start jzplp
test2 end jzplp
test3 start jzplp
test3 end jzplp
callAsync end
*/
```

通过调用结果可以看到，钩子是一个一个顺序触发和结束的。AsyncSeries类型的钩子还包含一些组合场景，包括AsyncSeriesBailHook，AsyncSeriesLoopHook，AsyncSeriesWaterfallHook等，这些钩子符合对应类型的特性，比较好理解，这里就不再赘述了。

### stage优先级
前面我们尝试调用compilation中的processAssets钩子时，在参数中除了输入插件名称之外，还有一个stage参数。这个参数实际上指的是回调函数的优先级，它要求输入数字，数值越低，优先级越高，即越早被调用。默认是0，当stage值相同时，越早注册的钩子优先级越高。

```js
const { SyncHook } = require("tapable");

const hook = new SyncHook(["arg1"]);

hook.tap({ name: "test1", stage: 10 }, (arg1) => {
  console.log("test1", arg1);
});
hook.tap("test2", (arg1) => {
  console.log("test2", arg1);
});
hook.tap({ name: "test3", stage: -10 }, (arg1) => {
  console.log("test3", arg1);
});

hook.call("run");

/* 命令行输出
test3 run
test2 run
test1 run
*/
```

如果没有stage参数时，回调触发顺序是从前往后的test1, test2, test3。有了stage参数后，就按照stage的值从第到高顺序执行。钩子还有一个withOptions方法，可以将stage等参数包装起来，作为一个钩子调用时带有预设的stage。

```js
const { SyncHook } = require("tapable");

const hook = new SyncHook(["arg1"]);
const late = hook.withOptions({ stage: 10 });

late.tap("test1", (arg1) => {
  console.log("test1", arg1);
});
hook.tap("test2", (arg1) => {
  console.log("test2", arg1);
});

hook.call("run");

/* 命令行输出
test2 run
test1 run
*/
```

## Webpack自定义钩子



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
- Tapable GitHub\
  https://github.com/webpack/tapable
- Webpack TerserWebpackPlugin\
  https://webpack.docschina.org/plugins/terser-webpack-plugin/
- Webpack MiniCssExtractPlugin\
  https://webpack.docschina.org/plugins/mini-css-extract-plugin/
- Webpack Node接口\
  https://webpack.docschina.org/api/node/
- Webpack Compilation对象\
  https://webpack.docschina.org/api/compilation-object/
- Webpack Stats对象参数\
  https://webpack.docschina.org/configuration/stats
- Webpack Stats Data\
  https://webpack.docschina.org/api/stats/

