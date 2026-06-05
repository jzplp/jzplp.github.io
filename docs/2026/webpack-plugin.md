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

## 自定义plugin

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

