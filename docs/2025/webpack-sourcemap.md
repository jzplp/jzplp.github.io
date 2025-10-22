# Webpack中的SourceMap（未完成）
## 简述
在之前的文章中，我们对SourceMap进行了简要的了解:[快速定位源码问题：SourceMap的生成/使用/文件格式与历史](https://jzplp.github.io/2025/js-sourcemap.html)。SourceMap的出现，是为了应对前端工程化工具在转义，打包，压缩等操作后，代码变化非常大，出错后排查报错位置困难的问题，原理是记录源和生成代码中标识符的位置关系。

Webpack是一个打包工具，在修改源代码的同时，也会生成SourceMap文件。Webpack提供了几十种生成的SourceMap的生成方式，生成的文件内容和性能各不相同，这次我们就来了解下Webpack中的SourceMap配置。

## 创建Webpack基础示例
首先创建一个使用Webpack打包的基础示例，后面各种配置都基于这个示例修改。首先命令行执行：

```sh
# 创建工程
npm init -y
# 安装Webpack相关依赖
npm install webpack webpack-cli --save-dev
```

然后创建文件src/index.js，这就是我们要打包的文件。内容如下：

```js
const a = 1;
function fun() {
  console.log(a + 2);
}
fun();
```

然后在package.json文件的scripts中增加命令：`"build": "webpack"`。最后是Webpack配置文件`webpack.config.js`:

```js
const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
  },
  devtool: 'source-map'
};
```

其中devtool表示SourceMap的生成配置，后面主要修改的就是它。命令行运行`npm run build`，即可使用Webpack打包，同时生成SourceMap文件。生成后目录结构如下：

```
|-- webpack1
    |-- package-lock.json
    |-- package.json
    |-- webpack.config.js
    |-- dist
    |   |-- main.js
    |   |-- main.js.map
    |-- src
        |-- index.js
```

## none与source-map值

## inline-值

## nosources-值

## eval-值

## ...值

## Rule.extractSourceMap

## SourceMapDevToolPlugin

## source-map-loader

## 参考
- 快速定位源码问题：SourceMap的生成/使用/文件格式与历史\
  https://jzplp.github.io/2025/js-sourcemap.html
- Webpack文档\
  https://webpack.js.org/
- Webpack中文文档\
  https://webpack.docschina.org/
- Webpack文档 Devtool\
  https://webpack.js.org/configuration/devtool
- Webpack文档 SourceMapDevToolPlugin\
  https://webpack.js.org/plugins/source-map-dev-tool-plugin/
- Webpack文档 source-map-loader\
  https://webpack.js.org/loaders/source-map-loader



