# Webpack中各种devtool配置的含义与SourceMap生成逻辑
## 简述
在之前的文章中，我们对SourceMap进行简单的了解：[快速定位源码问题：SourceMap的生成/使用/文件格式与历史](https://jzplp.github.io/2025/js-sourcemap.html)。SourceMap的出现，是为了应对前端工程化工具在转义，打包，压缩等操作后，代码变化非常大，出错后排查报错位置困难的问题，原理是记录源和生成代码中标识符的位置关系。

Webpack是目前流行的前端打包工具，在修改源代码的同时，也会生成SourceMap文件。Webpack提供了几十种生成的SourceMap的生成方式，生成的文件内容和性能各不相同，这次我们就来了解下Webpack中的SourceMap配置。

Webpack中的devtool配置不仅涉及SourceMap，还与代码生成，开发/生产模式有关系。本文更多使用生产模式，更在意SourceMap数据本身，而不是Webpack构建过程。

## 创建Webpack示例
创建一个使用Webpack打包的基础示例，后面各种配置都基于这个示例修改。首先命令行执行：

```sh
# 创建工程
npm init -y
# 安装Webpack相关依赖
npm install webpack webpack-cli html-webpack-plugin --save-dev
```

然后创建文件src/index.js，这就是我们要打包的文件。内容如下（执行到第二行会出现找不到变量的报错）：

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
这里还需要一段解析SourceMap文件的代码，方便后续拿到map文件后分析数据。这里使用source-map包，详细描述可以看[快速定位源码问题：SourceMap的生成/使用/文件格式与历史](https://jzplp.github.io/2025/js-sourcemap.html)。创建一个mapAnalysis.js文件，内容如下：

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
(none)表示不设置devtool，也就是不生成SourceMap数据。（注意`devtool: 'none'`是错误值）。我们生成试一下，作为对比：

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

在浏览器中打开页面，看到Console报错中指示的文件为源代码文件index.js，第二行，也就是说SourceMap数据是生效的。但点击文件名查看，却找不到源代码文件，这是因为我们没提供文件，webpack生成的文件路径`webpack://`浏览器不能使用它来找到文件。

![图片](/2025/devtool-3.png)

## 值hidden-前缀
配置中可以增加hidden-前缀，表示生成SourceMap，但是在源码中并不生成引用注释。这里以`devtool: 'hidden-source-map`为例生成试试。

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
          "{const a = 1;\r\nconsole.log(a + b);//# sourceURL=[module]\n//# sourceMappingURL/* 防止报错 */=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiNDQuanMiLCJtYXBwaW5ncyI6IkFBQUE7QUFDQSIsInNvdXJjZXMiOlsid2VicGFjazovL3dlYnBhY2sxLy4vc3JjL2luZGV4LmpzP2I2MzUiXSwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgYSA9IDE7XHJcbmNvbnNvbGUubG9nKGEgKyBiKTsiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///44\n\n}"
        );
      },
    },
    __webpack_exports__ = {};
  __webpack_modules__[44]();
})();
```

看生成代码中源码也是被eval包裹的，但在后面出现了三条注释，其中一条是sourceMappingURL，也就是SourceMap数据。两条是sourceURL，其中第一条`sourceURL=[module]`是没有用处的，我尝试过是否删除这条对现象没有影响，应该是被第二条覆盖了。我们先来解析一下里面的SourceMap数据，内容如下：

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

打开浏览器，发现此时错误信息是经过转换的，定位到了源码文件，但是仅定位到了行，没有具体到错误的列位置。而且右侧除了出现源码和生成代码外，还出现了另一个叫做44的文件。这里我们结合生成代码和浏览器现象，一起分析一下：

![图片](/2025/devtool-9.png)

index.js是源码，经过WebPack打包生成了mian.js。其中包含了eval内代码和SourceMap数据。这部分代码由于包含注释sourceURL，因此被浏览器展示为独立的文件44。由于sourceMappingURL在eval内代码中，因此这个SourceMap被认为是源码index.js和eval内代码的转换关系，并不是index.js与mian.js的转换关系。

至于为什么但是仅定位到了行，我们看SourceMap解析后的数据，发现它仅仅是将每行关联起来，没有详细的记录每个标识符的转换关系。因此才只定位到行号。至于为什么这么做，这是因为性能考虑，毕竟eval内代码也是将源码直接拿过来用，因此也就不费力生成高质量的SourceMap了。

## 值cheap-前缀
配置中可以增加cheap-前缀，表示生成简略版的SourceMap，只有行号没有列号。这里以`devtool: 'cheap-source-map`为例生成试试。

```js
// main.js
console.log(1+b);
//# sourceMappingURL/* 防止报错 */=main.js.map

// main.js.map
{
  "version": 3,
  "file": "main.js",
  "mappings": "AACA",
  "sources": ["webpack://webpack1/./src/index.js"],
  "sourcesContent": ["const a = 1;\r\nconsole.log(a + b);"],
  "names": [],
  "sourceRoot": ""
}

/* 解析后位置关系数据
生成代码行1  列0  源代码行2  列0  源名称-            源文件:webpack://webpack1/src/index.js
*/
```

可以看到，正常生成了代码与SourceMap文件，但是SourceMap中却只有一条行对行的转换关系，没有列信息，更没有标识符。我们在浏览器中看一下效果：

![图片](/2025/devtool-10.png)

可以看到，与`devtool: 'source-map`的效果不同，它的错误指向的是源码中的一整行，并不精确。为什么明明有更精确的选项，却存在这种模糊的SourceMap数据呢？这是因为它虽然信息模糊，但生成速度更快，可以适用于开发模式或者追求速度的场景。

## 值module-前缀
配置中可以增加module-前缀，可以实现SourceMap映射生成的功能。与这个场景非常相似的例子，我们在source-map包的SourceMapGenerator对象中的applySourceMap方法中描述过。这个场景是将已生成的代码作为源代码，继续生成代码，同时生成SourceMap，实现最终生成代码与最开始的源代码的位置关系映射。这个场景经常用于希望关联npm包中的SourceMap，进行错误排查或调试使用。Webpack限制module-前缀必须与cheap-前缀一起使用，因此我们以`devtool: 'cheap-module-source-map`生成试试。

### 模拟npm包
这里有两步，第一步我们模拟一个npm包的打包并生成SourceMap。这里我们使用前面【创建Webpack示例】中的方法创建新一个项目，项目名称为project1。源码文件改名为index2.js（不和主示例项目用同一个文件名），Webpack配置文件webpack.config.js有改动：

```js
// index2.js
const a = 1;
console.log(a, b);

// webpack.config.js
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'production', // 生产模式
  entry: './src/index2.js', // 源码入口
  output: {
    filename: 'project1.js', // 生成文件名
    path: path.resolve(__dirname, 'dist'),  // 生成文件目录
    clean: true, // 生成前删除dist目录内容
  },
  devtool: 'source-map'
};
```

我们只需要它生成的Javascript代码，并不需要HTML，因此就不生成了。这里并不限制SourceMap数据类型，我们生成一个最简单的`devtool: 'source-map`。生成的结果如下：

```js
// project1.js
console.log(1,b);
//# sourceMappingURL/* 防止报错 */=project1.js.map

// project1.js.map
{
  "version": 3,
  "file": "project1.js",
  "mappings": "AACAA,QAAQC,IADE,EACKC",
  "sources": ["webpack://webpack1/./src/index.js"],
  "sourcesContent": ["const a = 1;\r\nconsole.log(a, b);"],
  "names": ["console", "log", "b"],
  "sourceRoot": ""
}

/* 解析后位置关系数据
生成代码行1  列0  源代码行2  列0  源名称console      源文件:webpack://webpack1/src/index.js
生成代码行1  列8  源代码行2  列8  源名称log          源文件:webpack://webpack1/src/index.js
生成代码行1  列12 源代码行1  列10 源名称-            源文件:webpack://webpack1/src/index.js
生成代码行1  列14 源代码行2  列15 源名称b            源文件:webpack://webpack1/src/index.js
*/
```

这里我们把package.json里面的main属性改成project1.js，它即是这个包的入口文件；增加"type": "module"，表示是一个ESModule的包。这里不污染npm仓库，就不发包了。我们在主示例项目的根目录中新建project1文件夹，然后将package.json, 以及dist目录里面的文件都放进去。最后主示例项目的目录结构如下：

```
|-- webpack1
    |-- mapAnalysis.js
    |-- package-lock.json
    |-- package.json
    |-- webpack.config.js
    |-- dist
    |   |-- index.html
    |   |-- main.js
    |   |-- main.js.map
    |-- project1
    |   |-- package.json
    |   |-- project1.js
    |   |-- project1.js.map
    |-- src
        |-- index.js
```

### 主示例不使用module-前缀
修改主示例中的index.js，引入project1包中的代码，否则project1包的代码不会被打包进来。

Webpack解析已有的SourceMap文件需要loader。首先命令行执行`npm install source-map-loader --save-dev`安装依赖，然后修改Webpack配置文件webpack.config.js。使用Rule.extractSourceMap选项也能解析已有的SourceMap文件，可以看注释。

注意这里我们首先使用`devtool: "cheap-source-map"`试一下效果。这里关闭了代码压缩，实测打开压的时候使用cheap-前缀不会生成SourceMap数据。

```js
// index.js
import "../project1";

const c = 3;
console.log(c, d);

// webpack.config.js
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  mode: "production",
  entry: "./src/index.js",
  optimization: {
    minimize: false, // 关闭代码压缩
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: "jzplp的SourceMap实验",
    }),
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        use: "source-map-loader",
      },
      /*
      {
        test: /\.m?js$/,
        extractSourceMap: true,
      },
      */
    ],
  },
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "dist"),
    clean: true,
  },
  devtool: "cheap-source-map",
};
```

这里我们生成的代码和SourceMap数据如下：

```js
// mian.js
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";

;// ./project1/project1.js
console.log(1,b);

;// ./src/index.js


const c = 3;
console.log(c, d);

/******/ })()
;
//# sourceMappingURL/* 防止报错 */=main.js.map

// main.js.map
{
  "version": 3,
  "file": "main.js",
  "mappings": ";;;;AAAA;;;ACAA;AACA;AACA;AACA",
  "sources": [
    "webpack://webpack1/./project1/project1.js",
    "webpack://webpack1/./src/index.js"
  ],
  "sourcesContent": [
    "console.log(1,b);\n",
    "import \"../project1\";\r\n\r\nconst c = 3;\r\nconsole.log(c, d);\r\n"
  ],
  "names": [],
  "sourceRoot": ""
}

/* 解析后位置关系数据
生成代码行5  列0  源代码行1  列0  源名称-            源文件:webpack://webpack1/project1/project1.js
生成代码行8  列0  源代码行1  列0  源名称-            源文件:webpack://webpack1/src/index.js
生成代码行9  列0  源代码行2  列0  源名称-            源文件:webpack://webpack1/src/index.js
生成代码行10 列0  源代码行3  列0  源名称-            源文件:webpack://webpack1/src/index.js
生成代码行11 列0  源代码行4  列0  源名称-            源文件:webpack://webpack1/src/index.js
*/
```

通过SourceMap数据可以看到，使用cheap-source-map，报错信息是关联到npm包中的生成文件project1.js中的，并没有使用project1.js.map数据。我们在浏览器看下效果。

![图片](/2025/devtool-11.png)

可以看到错误被识别到了project1.js文件中，我们主项目SourceMap数据起作用了，但是没有关联到project1中的源码。

### 主示例使用module-前缀
修改Webpack配置为`devtool: 'cheap-module-source-map`，然后重新生成代码。

```js
// mian.js
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";

;// ./project1/project1.js
console.log(1,b);

;// ./src/index.js


const c = 3;
console.log(c, d);

/******/ })()
;
//# sourceMappingURL/* 防止报错 */=main.js.map

// main.js.map
{
  "version": 3,
  "file": "main.js",
  "mappings": ";;;;AACA;;;ACDA;AACA;AACA;AACA",
  "sources": [
    "webpack://webpack1/webpack1/./src/index2.js",
    "webpack://webpack1/./src/index.js"
  ],
  "sourcesContent": [
    "const a = 1;\r\nconsole.log(a, b);",
    "import \"../project1\";\r\n\r\nconst c = 3;\r\nconsole.log(c, d);\r\n"
  ],
  "names": [],
  "sourceRoot": ""
}

/* 解析后位置关系数据
生成代码行5  列0  源代码行2  列0  源名称-            源文件:webpack://webpack1/webpack1/src/index2.js
生成代码行8  列0  源代码行1  列0  源名称-            源文件:webpack://webpack1/src/index.js
生成代码行9  列0  源代码行2  列0  源名称-            源文件:webpack://webpack1/src/index.js
生成代码行10 列0  源代码行3  列0  源名称-            源文件:webpack://webpack1/src/index.js
生成代码行11 列0  源代码行4  列0  源名称-            源文件:webpack://webpack1/src/index.js
*/
```

生成的mian.js依然是一致的，可以忽略。但是main.js.map却不一样了。通过解析可以看到，它直接与project1中的源码文件index2.js产生了关系，因此Webpack内部将project1.js.map利用上了，因此可以直接定位到npm包中的源码。我们看一下浏览器效果：

![图片](/2025/devtool-12.png)

可以看到，错误直接定位到了源文件index2.js。右侧浏览器目录中的project1.js消失了，取代的是index2.js的源码和错误位置信息。通过这种方式，可以排查和调试npm包中的错误。最后用一张图表示它们之间的关系：

![图片](/2025/devtool-13.png)


## 混合前缀值
前面我们介绍了devtool中的各种前缀值，这些前缀值可以互相组合成几十种选项。选项需要符合这个规则：`[inline-|hidden-|eval-][nosources-][cheap-[module-]]source-map`。例如eval-cheap-module-source-map, hidden-nosources-cheap-source-map等等，这里就不完整列举了。

这些值分别满足前面这些前缀值的相关特性。在实际开发中，会根据不同的场景选择不同的模式，这里我们简单列举一下不同前缀符合的特点，详细的可以参考Webpack文档。

| 前缀值 | 构建速度 | 是否适合生产模式 | SourceMap质量 |
| - | - | - | - |
| eval | 快 | 否 | 差 |
| cheap | 快 | 否 | 差 |
| nosources | - | 是 | - |
| hidden | - | 是 | - |
| inline | - | 否 | - |
| module | 慢 | 否 | - |

## sourceURL注释
在前面eval相关配置中，我们看到了sourceURL注释，指向一个地址。浏览器会解析这个注释，把这个地址作为这个代码的源文件。但与SourceMap不同的是，sourceMappingURL会真的请求文件，sourceURL并不会请求，而是把代码本身当作文件内容。这里我们尝试script标签和eval两种场景。

### script标签
首先我们构造一段代码，里面包含三个script标签的例子a,b和c。首先是index.html:

```html
<html>
  <script src="./a.js"></script>
  <script>
    try {
      console.log("jzplp", b);
    } catch (e) {
      console.log(e);
    }
  </script>
  <script>
    //# sourceURL=./c.js
    try {
      console.log("jzplp", c);
    } catch (e) {
      console.log(e);
    }
  </script>
</html>
```

因为需要同时输出三个错误，因此我们将错误捕获之后输出，这样依然可以关联到源文件。具体可以看[快速定位源码问题：SourceMap的生成/使用/文件格式与历史](https://jzplp.github.io/2025/js-sourcemap.html)文章中的浏览器使用SourceMap部分。然后是两个独立的js文件，a.js和c.js。其中a是被HTML直接引用的，c并没有被引用，只是用来尝试有没有被请求。

```js
// a.js
try {
  console.log("jzplp", a);
} catch (e) {
  console.log(e);
}

// c.js
try {
  console.log("jzplp", c);
} catch (e) {
  // is c
  console.log(e);
}
```

然后我们在浏览器中打开index.html文件，在Console中查看输出结果，以及点击文件名称查看文件：

![图片](/2025/devtool-14.png)

- 例子a：标签直接引用文件，浏览器加载的也是文件，因此报错栈信息和浏览器文件中都能展示正确的文件。
- 例子b：标签中直接写代码，浏览器无法与独立文件相关联，因此认为是index.html中的一部分。
- 例子c：标签中直接写代码，但是增加了sourceURL注释。浏览器认为它来源于独立的文件，因此把标签中的内容作为独立的c.js文件展示。

注意此时查看Developer resources，发现其中没有c.js的文件请求，文件内容也与独立的c.js不一致。因此，浏览器读取sourceURL注释后，并不会真的请求源文件，而只是把当前代码（在这里是标签内代码）作为独立文件展示。而sourceURL值作为文件路径。

### eval
我们最开始是在Webpack的eval中发现sourceURL的，因此eval肯定也如同script标签一样支持sourceURL。这里我们再举d,e,f三个例子：

```html
<html>
  <script>
    eval(`
    try {
      console.log("jzplp", d);
    } catch (e) {
      console.log(e);
    }
    `);
  </script>
  <script>
    eval(`
    //# sourceURL=./e.js
    try {
      console.log("jzplp", e);
    } catch (e) {
      console.log(e);
    }
    `);
  </script>
  <script>
    //# sourceURL=./f1.js
    eval(`
    //# sourceURL=./f2.js
    try {
      console.log("jzplp", f);
    } catch (e) {
      console.log(e);
    }
    `);
  </script>
</html>
```

![图片](/2025/devtool-15.png)

- 例子d：直接写eval，浏览器无法关联文件，认为是index2.html中的一部分。
- 例子b：eval中增加了sourceURL注释，浏览器认为它来源于独立的文件，因此把eval中的内容作为独立的e.js文件展示。（图中左下）
- 例子f：标签和eval都有sourceURL注释。浏览器认为它们都是来源于独立的文件，因此文件相当于是嵌套引用的，f1内部引用了f2：index2.html -> f1.js -> f2.js。（图中右边）

## SourceMapDevToolPlugin插件
SourceMapDevToolPlugin是一个Webpack插件，对比devtool，它可以更精细的控制SourceMap生成行为。详细说明可以看参考中的SourceMapDevToolPlugin文档，这里我们列举几个简单场景。由于生成的SourceMap内容和上面相似，这里就不重复写了，只描述配置项和效果。

```js
module.exports = {
  // ...
  devtool: false,
  plugins: [new webpack.SourceMapDevToolPlugin({})],
};
```

这是默认场景，由于没有指定SourceMap的filename，因此不生成独立文件，生成效果和`devtool: inline-source-map`一致。

```js
module.exports = {
  // ...
  devtool: false,
  plugins: [new webpack.SourceMapDevToolPlugin({
    filename: '[file].map',
  })],
};
```

指定了filename，生成独立的SourceMap文件，生成效果和`devtool: source-map`一致。

```js
module.exports = {
  // ...
  devtool: false,
  plugins: [new webpack.SourceMapDevToolPlugin({
    filename: 'mapDir/[file].map',
  })],
};
```

将所有生成的SourceMap文件放到独立的mapDir目录中。这是devtool选项无法做到的。


```js
module.exports = {
  // ...
  devtool: false,
  plugins: [new webpack.SourceMapDevToolPlugin({
    filename: '[file].map',
    append: '\n//# sourceMappingURL=https://jzplp.com/sourcemap/[url]',
  })],
};
```

修改生成代码中记录的SourceMap文件地址，适用于SourceMap的url与生成代码有区别的场景。

```js
module.exports = {
  // ...
  devtool: false,
  plugins: [new webpack.SourceMapDevToolPlugin({
    filename: '[file].map',
    columns : 'false',
  })],
};
```

生成SourceMap的时候，不记录SourceMap的列信息。类似于`devtool: 'cheap-source-map`的效果。

## 总结
这篇文章总结了Webpack中生成SourceMap数据的配置与具体效果，尤其详细描述了各种devtool配置项的逻辑。devtool虽然有几十个配置选项，但都是由几个前缀组合而成的，拥有对应前缀的特性。还介绍了SourceMapDevToolPlugin插件，相比于devtool可以更灵活的生成SourceMap。

通过上面的各种例子，也可以看到生成的SourceMap数据并不是完全符合SourceMap规范，而是有一些变化，比如没有列信息，没有标识符名称等等。而浏览器也能适应这些变化，例如没有列信息就表示为整行错误。

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
- 动态调试JS脚本文件：（JS源映射 - sourceURL）与 debugger\
  https://blog.csdn.net/qq_16559905/article/details/78346717
- Webpack文档 SourceMapDevToolPlugin\
  https://webpack.js.org/plugins/source-map-dev-tool-plugin