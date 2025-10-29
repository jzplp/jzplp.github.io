# Webpack中的devtool SourceMap（未完成）
## 简述
在之前的文章中，我们对SourceMap进行了简要的了解:[快速定位源码问题：SourceMap的生成/使用/文件格式与历史](https://jzplp.github.io/2025/js-sourcemap.html)。SourceMap的出现，是为了应对前端工程化工具在转义，打包，压缩等操作后，代码变化非常大，出错后排查报错位置困难的问题，原理是记录源和生成代码中标识符的位置关系。

Webpack是一个打包工具，在修改源代码的同时，也会生成SourceMap文件。Webpack提供了几十种生成的SourceMap的生成方式，生成的文件内容和性能各不相同，这次我们就来了解下Webpack中的SourceMap配置。

Webpack中的devtool配置不仅涉及SourceMap，还与代码生成，开发/生产模式有关系。本文更多使用生产模式，更在意SourceMap数据本身，而不是Webpack构建过程。

## 创建Webpack示例
首先创建一个使用Webpack打包的基础示例，后面各种配置都基于这个示例修改。首先命令行执行：

```sh
# 创建工程
npm init -y
# 安装Webpack相关依赖
npm install webpack webpack-cli html-webpack-plugin --save-dev
```

然后创建文件src/index.js，这就是我们要打包的文件。内容如下：

```js
const a = 1;
console.log(a + b);
```

然后在package.json文件的scripts中增加命令：`"build": "webpack"`。最后是Webpack配置文件`webpack.config.js`:

```js
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'production', // 生产模式
  entry: './src/index.js', // 源码入口
  plugins: [
    new HtmlWebpackPlugin({ // 生成HTML页面入口
      title: 'jzplp的SourceMap实验', // 页面标题
    }),
  ],
  output: {
    filename: 'main.js', // 生成文件名
    path: path.resolve(__dirname, 'dist'),  // 生成文件目录
    clean: true, // 生成前删除dist目录内容
  },
  devtool: 'source-map'
};
```

devtool表示SourceMap的生成配置，后面主要修改的就是它。它为什么叫做devtool而不直接而叫做sourcemap，是因为它除了控制SourceMap生成之外，也控制代码如何生成，后面我们会看到例子。

命令行运行`npm run build`，即可使用Webpack打包，同时生成SourceMap文件。生成后目录结构如下：

```
|-- webpack1
    |-- package-lock.json
    |-- package.json
    |-- webpack.config.js
    |-- dist
    |   |-- index.html
    |   |-- main.js
    |   |-- main.js.map
    |-- src
        |-- index.js
```

使用浏览器打开index.html，即可看到代码执行效果，查看错误信息。生成的HTML文件内容如下：

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>jzplp的SourceMap实验</title>
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <script defer="defer" src="main.js"></script>
  </head>
  <body></body>
</html>
```

## 解析SourceMap工具
这里还需要一段解析SourceMap文件的代码，方便后续拿到map文件后分析数据。这里使用sourcemap包，详细描述可以看[快速定位源码问题：SourceMap的生成/使用/文件格式与历史](https://jzplp.github.io/2025/js-sourcemap.html)中的source-map包部分。创建一个mapAnalysis.js文件，内容如下：

```js
const sourceMap = require("source-map");
const fs = require("fs");
// 打开SourceMap文件
const data = fs.readFileSync("./dist/main.js.map", "utf-8");

function outputData(data) {
  if (data || data === 0) return String(data);
  return "-";
}

async function jzplpfun() {
  const consumer = await new sourceMap.SourceMapConsumer(data);
  // 遍历内容
  consumer.eachMapping((item) => {
    // 美化输出
    console.log(
      `生成代码行${outputData(item.generatedLine).padEnd(2)} 列${outputData(
        item.generatedColumn
      ).padEnd(2)} 源代码行${outputData(item.originalLine).padEnd(
        2
      )} 列${outputData(item.originalColumn).padEnd(2)} 源名称${outputData(
        item.name
      ).padEnd(12)} 源文件:${outputData(item.source)}`
    );
  });
}
jzplpfun();
```

代码的内容是读取SourceMap文件，解析并输出其中的位置对应关系。执行`node mapAnalysis.js`即可。解析后的结果示例如下。后面会直接利用这段代码解析生成的SourceMap。

```
生成代码行1  列0  源代码行2  列0  源名称console      源文件:webpack://webpack1/src/index.js
生成代码行1  列8  源代码行2  列8  源名称log          源文件:webpack://webpack1/src/index.js
生成代码行1  列12 源代码行1  列10 源名称-            源文件:webpack://webpack1/src/index.js
生成代码行1  列14 源代码行2  列16 源名称b            源文件:webpack://webpack1/src/index.js
```

## 值(none)
(none)表示不设置devtool，也就是不生成SourceMap数据。（注意`devtool: 'none`是错误值）。我们生成试一下，作为对比：

```js
// main.js
console.log(1+b);
```

可以看到只生成了代码，没有SourceMap。在浏览器中打开页面，看到Console报错中指示的文件为生成文件main.js。点击文件名查看也是生成文件的代码，如下图：

![图片](/2025/devtool-1.png)

## 值source-map
`devtool: 'source-map'`这个配置会生成打包后的代码和独立的SourceMap文件。生成内容如下：

```js
// main.js
console.log(1+b);
//# sourceMappingURL/* 防止报错 */=main.js.map

// main.js.map
{
  "version": 3,
  "file": "main.js",
  "mappings": "AACAA,QAAQC,IADE,EACMC",
  "sources": ["webpack://webpack1/./src/index.js"],
  "sourcesContent": ["const a = 1;\r\nconsole.log(a + b);"],
  "names": ["console", "log", "b"],
  "sourceRoot": ""
}
```

使用工具解析，SourceMap中的位置关系如下：

```
生成代码行1  列0  源代码行2  列0  源名称console      源文件:webpack://webpack1/src/index.js
生成代码行1  列8  源代码行2  列8  源名称log          源文件:webpack://webpack1/src/index.js
生成代码行1  列12 源代码行1  列10 源名称-            源文件:webpack://webpack1/src/index.js
生成代码行1  列14 源代码行2  列16 源名称b            源文件:webpack://webpack1/src/index.js
```

在浏览器中打开页面，看到Console报错中指示的文件为源代码文件index.js，第二行。点击文件名查看也是源代码文件的代码，标出了错误的位置，如下图：

![图片](/2025/devtool-2.png)

## 值inline-前缀
配置中可以增加inline-前缀，表示SourceMap数据附加在生成的文件中，而不是作为一个独立的文件存在。这里以`devtool: 'inline-source-map`为例生成试试。

```js
// main.js
console.log(1+b);
//# sourceMappingURL/* 防止报错 */=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsIm1hcHBpbmdzIjoiQUFDQUEsUUFBUUMsSUFERSxFQUNNQyIsInNvdXJjZXMiOlsid2VicGFjazovL3dlYnBhY2sxLy4vc3JjL2luZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbImNvbnN0IGEgPSAxO1xyXG5jb25zb2xlLmxvZyhhICsgYik7Il0sIm5hbWVzIjpbImNvbnNvbGUiLCJsb2ciLCJiIl0sInNvdXJjZVJvb3QiOiIifQ==
```

可以看到没由生成main.js.map，但是最后多了一行注释，sourceMappingURL的值为Data URL格式的SourceMap数据。复制到浏览器地址栏中，得到结果如下。这个JSON数据和前面`devtool: 'source-map'`中生成的完全一致。

```json
{
  "version": 3,
  "file": "main.js",
  "mappings": "AACAA,QAAQC,IADE,EACMC",
  "sources": ["webpack://webpack1/./src/index.js"],
  "sourcesContent": ["const a = 1;\r\nconsole.log(a + b);"],
  "names": ["console", "log", "b"],
  "sourceRoot": ""
}
```

SourceMap数据附加在生成代码文件中会使得文件体积大幅增加，进而造成页面文件下载速度变慢。这里浏览器效果和`devtool: 'source-map'`一致，就不展示了。

## 值nosources-前缀
配置中可以增加nosources-前缀，表示源代码不包含在SourceMap数据中。这里以`devtool: 'nosources-source-map`为例生成试试。

```js
// main.js
console.log(1+b);
//# sourceMappingURL/* 防止报错 */=main.js.map

// main.js.map
{
  "version": 3,
  "file": "main.js",
  "mappings": "AACAA,QAAQC,IADE,EACMC",
  "sources": ["webpack://webpack1/./src/index.js"],
  "names": ["console", "log", "b"],
  "sourceRoot": ""
}
```

生成的SourceMap数据与前面`devtool: 'source-map'`生成的相比，缺少了sourcesContent属性，这个属性包含的就是源代码内容。

在浏览器中打开页面，看到Console报错中指示的文件为源代码文件index.js，第二行，也就是说SAourceMap数据是生效的。但点击文件名查看，却找不到源代码文件，这是因为我们没提供文件，webpack生成的文件路径`webpack://`浏览器不能使用它来找到文件。

![图片](/2025/devtool-3.png)

## 值hidden-前缀
配置中可以增加hidden-前缀，表示生成的SourceMap，但是在源码中并不生成引用注释。这里以`devtool: 'hidden-source-map`为例生成试试。

```js
// main.js
console.log(1+b);

// main.js.map
{
  "version": 3,
  "file": "main.js",
  "mappings": "AACAA,QAAQC,IADE,EACMC",
  "sources": ["webpack://webpack1/./src/index.js"],
  "sourcesContent": ["const a = 1;\r\nconsole.log(a + b);"],
  "names": ["console", "log", "b"],
  "sourceRoot": ""
}
```

通过结果可以看到，生成的SourceMap数据与前面`devtool: 'source-map'`生成的相比一致。但是生成代码最后一行表示SourceMap文件地址的注释却没有了。我们使用浏览器打开，发现错误定位依然到的是生成文件，SourceMap未生效。

![图片](/2025/devtool-4.png)

这种配置一般用于生成SourceMap文件，但并不提供给用户下载的场景。可以使用浏览器主动附加SourceMap，上报收集报错栈数据，或者利用其它工具解析SourceMap并处理报错数据。

这里我们试一下浏览器主动附加SourceMap：右键点击生成代码文件内容，出现Add source map选项，把我们刚才生成的SourceMap文件添加进去。结果与在源码中指定了SourceMap文件地址的现象一致，错误信息被SourceMap处理了。

![图片](/2025/devtool-5.png)

## 值eval
devtool可以直接取值为eval，此时不生成SourceMap，而是直接控制代码生成。这也是为什么devtool不叫sourcemap的原因，因为它不只控制SourceMap的生成。我们来看一下配置为`devtool: 'eval'`时的生成结果：

```js
// main.js
(() => {
  var __webpack_modules__ = {
      44: () => {
        eval(
          "{const a = 1;\r\nconsole.log(a + b);\n\n//# sourceURL=webpack://webpack1/./src/index.js?\n}"
        );
      },
    },
    __webpack_exports__ = {};
  __webpack_modules__[44]();
})();
```

可以看到，源代码被包裹在eval中执行。为什么要这么做？因为这样生成代码的速度很快，而且当源代码被修改后，增量构建的速度也很快，因此开发模式下经常使用值eval以及后面要介绍的eval前缀。但是由于代码包裹在eval中执行，执行效率比较低，因此不适合作为生产模式使用。

我们注意到eval包裹的代码中，最后还有一句注释，指向了一个sourceURL地址。通过这个地址，浏览器会把eval中的代码识别为这个文件。我们用浏览器看一下：

![图片](/2025/devtool-6.png)

可以看到，我们执行代码的的错误并没有被提示为生成的文件名main.js，而是源文件名index.js。点击文件名，到右侧文件内容，发现是把eval中的代码作为源文件index.js的内容了。

这样使用eval虽然没有SourceMap数据，但是错误内容的指示依然很清晰，我们很容易找到源码并修改。注意eval中并不是真的源代码，内容与真正的源码有一定的区别，例如最前面和最后面的括号。

## 值eval-前缀
eval除了可以作为值，还可以作为前缀，例如`devtool: 'eval-source-map'`。此时不仅有eval的特性，还会生成SourceMap数据。我们试一下：

```js
// main.js
(() => {
  var __webpack_modules__ = {
      44: () => {
        eval(
          "{const a = 1;\r\nconsole.log(a + b);//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiNDQuanMiLCJtYXBwaW5ncyI6IkFBQUE7QUFDQSIsInNvdXJjZXMiOlsid2VicGFjazovL3dlYnBhY2sxLy4vc3JjL2luZGV4LmpzP2I2MzUiXSwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgYSA9IDE7XHJcbmNvbnNvbGUubG9nKGEgKyBiKTsiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///44\n\n}"
        );
      },
    },
    __webpack_exports__ = {};
  __webpack_modules__[44]();
})();
```

首先解析一下里面的SourceMap数据，内容如下：

```json
{
  "version": 3,
  "file": "44.js",
  "mappings": "AAAA;AACA",
  "sources": ["webpack://webpack1/./src/index.js?b635"],
  "sourcesContent": ["const a = 1;\r\nconsole.log(a + b);"],
  "names": [],
  "sourceRoot": ""
}

/* 解析后位置关系数据
生成代码行1  列0  源代码行1  列0  源名称-            源文件:webpack://webpack1/src/index.js?b635
生成代码行2  列0  源代码行2  列0  源名称-            源文件:webpack://webpack1/src/index.js?b635
*/
```

![图片](/2025/devtool-7.png)

![图片](/2025/devtool-8.png)

## ...值

## Rule.extractSourceMap

## SourceMapDevToolPlugin

## source-map-loader

## sourceURL

## webpack://和webpack-internal://

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
- 彻底搞懂 Webpack 的 sourcemap 配置原理\
  https://juejin.cn/post/7136049758837145630
