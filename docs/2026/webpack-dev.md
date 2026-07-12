# Webpack中的观察模式，开发服务与HMR等（未完成）

## 创建基础Webpack工程
在说明下面各种模式之前，首先创建一个基础的Webapck工程，方便后续扩展执行示例。首先执行命令行：

```sh
npm init -y
npm install -D webpack webpack-cli html-webpack-plugin css-loader mini-css-extract-plugin css-loader xml-loader
```

修改package.json，去掉"type": "commonjs"，scripts中增加"build": "webpack"指令。创建两个js文件，作为两个入口：

```js
// src/index.js
import "./index.css";
import { abc } from "./index.module.css";
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
function genEle(test, className) {
  const div = document.createElement("div");
  div.className = className;
  div.textContent = test;
  document.body.appendChild(div);
}
genEle("jzplp3", "qaz");
```

然后是对应的两个css文件，其中一个使用CSS module方式引入：

```css
/* src/index.css */
.qaz {
  color: blue;
}

/* src/index.module.css */
.abc {
  color: red;
}
```

还有一个xml文件，路径为src/index.xml。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<note>
  <to>jzplp1</to>
  <from>jzplp2</from>
</note>
```

最后是webpack.config.js文件，里面对上述文件进行了适配处理：

```js
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  mode: "production",
  entry: {
    index: "./src/index.js",
    another: "./src/another.js",
  },
  output: {
    clean: true,
    path: path.resolve(__dirname, "dist"),
  },
  module: {
    rules: [
      {
        test: /\.xml$/,
        use: "xml-loader",
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

执行npm run build命令，可以看到打包成功并在dist目录中输出结果。其中index.html为入口文件，引入了其它资源，内容如下。我们使用浏览器打开index.html，即可看到生成的代码运行效果。

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

## 观察模式watch
执行npm run build命令，可以将当前代码打包。这对于代码已经完成的生产模式来说是很简单的，但对于开发模式却并不好用。在开发模式下，代码内容会实时变化，我们希望自己写的代码可以尽快看到结果。尤其是前端页面开发，如果写的页面可以实时在浏览器中看到效果，那么对于开发和调试效率都有很大的提升。

### 观察模式初步
如果每次写完一部分代码。还要手动执行命令，等待打包完成查看效果，那么等待时间会造成效率下降。有没有一种方式可以自动监听文件变化，自动打包最新成果呢？Webapck中的watch模式，就可以做到。

开启观察模式非常简单，package.json的scripts中"watch": "webpack --watch"指令，执行后即可开启。或者webpack.config.js中设置watch: true。开启后，可以观察到dist目录中依然生成了代码。但是命令行执行并没有结束。我们此时打开dist/index.html，可以正常访问打包后的页面效果。

在这个状态下，我们将src/index.js中的代码内容变化：

```js
// 原代码
genEle("jzplp1", "qaz");
// 新代码
genEle("jzplp1", "qaz1");
```

然后观察dist/index.js，发现对应的输出文件内容也发生了变化。我们点击浏览器的刷新按钮，发现页面效果也同步发生了变化，jzplp1文字上面的蓝色没有了。

```js
// 原生成代码
r("jzplp1", "qaz"),
// 新生成代码
r("jzplp1", "qaz1"),
```

不只修改js文件，修改CSS，XML等文件，效果也是一样的，刷新后页面内容就发生变化了。原因在于开启了watch模式后，Webpack会先打包一次，然后并不会结束退出，而是监听每个源文件的变化，如果源文件有改动，就重新编译，更新dist目录中的文件。

### 进一步尝试
Webapck支持自定义输出文件名的模板，我们将输出文件名改成根据文件内容变化的hash，看看watch模式下的效果。修改webpack.config.js中的output相关配置：

```js
module.exports = {
  output: {
    // clean: true,
    path: path.resolve(__dirname, "dist"),
    filename: "[name]-[contenthash].js",
  },
  // 其它配置
};
```

首先我们关闭每次打包后删除旧文件的功能，然后指定了文件名中包含contenthash，即文件内容的hash，这样当文件内容变化时，打包出的文件名也随之变化。然后我们再次尝试watch模式，并修改文件。首先是第一次构建的结果：

```html
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>jzplp-test</title>
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <script defer="defer" src="index-e4066e9a2ff77c7c0d24.js"></script>
    <script defer="defer" src="another-0c91733d77fe188bca5a.js"></script>
    <link href="index.css" rel="stylesheet" />
  </head>
  <body></body>
</html>

<!-- 对应文件目录
index.html
index-e4066e9a2ff77c7c0d24.js
another-0c91733d77fe188bca5a.js
index.css
-->
```

然后我们尝试修改src/index.js，将"qaz"变为"qaz1"。再看下构建结果：

```html
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>jzplp-test</title>
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <script defer="defer" src="index-3f4853076a5c12fef72c.js"></script>
    <script defer="defer" src="another-0c91733d77fe188bca5a.js"></script>
    <link href="index.css" rel="stylesheet" />
  </head>
  <body></body>
</html>

<!-- 对应文件目录
index.html
index-e4066e9a2ff77c7c0d24.js
another-0c91733d77fe188bca5a.js
index.css
index-3f4853076a5c12fef72c.js  新增
-->
```

然后再修改src/another.js，将jzplp3改为jzplp4。再看下构建结果：

```html
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>jzplp-test</title>
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <script defer="defer" src="index-3f4853076a5c12fef72c.js"></script>
    <script defer="defer" src="another-32277c21d626f15ea07f.js"></script>
    <link href="index.css" rel="stylesheet" />
  </head>
  <body></body>
</html>

<!-- 对应文件目录
index.html
index-e4066e9a2ff77c7c0d24.js
another-0c91733d77fe188bca5a.js
index.css
index-3f4853076a5c12fef72c.js
another-32277c21d626f15ea07f.js  新增
-->
```

通过这个例子可以看到，watch每次都会重新编译，如果文件有改动，就会生成新的文件，同时html引入的文件名也会变化。如果我们一直在watch模式编辑，那么旧文件会越来越多。因此平时使用时，还是要设置clean: true，自动删除旧的生成文件。

每次重新触发编译时，命令行也会有对应的提示，告诉我们哪些重新编译，生成了哪些文件：

```sh
> watch@1.0.0 watch
> webpack --watch

# 第一次编译
assets by status 988 bytes [cached] 2 assets
assets by path . 408 bytes
  asset index.html 344 bytes [compared for emit]
  asset index.css 64 bytes [compared for emit] (name: index)
Entrypoint index 929 bytes = index.css 64 bytes index-e4066e9a2ff77c7c0d24.js 865 bytes
Entrypoint another 123 bytes = another-0c91733d77fe188bca5a.js
orphan modules 3.39 KiB (javascript) 2.67 KiB (runtime) [orphan] 14 modules
runtime modules 1.1 KiB 3 modules
cacheable modules 686 bytes (javascript) 62 bytes (css/mini-extract)
  javascript modules 686 bytes
    ./src/index.js + 1 modules 430 bytes [built] [code generated]
    ./src/another.js 195 bytes [built] [code generated]
    ./src/index.xml 61 bytes [built] [code generated]
  modules by path ./src/*.css 62 bytes
    css ./node_modules/css-loader/dist/cjs.js!./src/index.css 23 bytes [built] [code generated]
    css ./node_modules/css-loader/dist/cjs.js!./src/index.module.css 39 bytes [built] [code generated]
webpack 5.108.4 compiled successfully in 222 ms
# 第二次编译
assets by status 123 bytes [cached] 1 asset
assets by chunk 930 bytes (name: index)
  asset index-3f4853076a5c12fef72c.js 866 bytes [emitted] [immutable] [minimized] (name: index)
  asset index.css 64 bytes [emitted] (name: index)
asset index.html 344 bytes [emitted]
Entrypoint index 930 bytes = index.css 64 bytes index-3f4853076a5c12fef72c.js 866 bytes
Entrypoint another 123 bytes = another-0c91733d77fe188bca5a.js
orphan modules 3.39 KiB (javascript) 2.67 KiB (runtime) [orphan] 14 modules
runtime modules 1.1 KiB 3 modules
cacheable modules 687 bytes (javascript) 62 bytes (css/mini-extract)
  javascript modules 687 bytes
    ./src/index.js + 1 modules 431 bytes [built] [code generated]
    ./src/another.js 195 bytes [built] [code generated]
    ./src/index.xml 61 bytes [built] [code generated]
  modules by path ./src/*.css 62 bytes
    css ./node_modules/css-loader/dist/cjs.js!./src/index.css 23 bytes [built] [code generated]
    css ./node_modules/css-loader/dist/cjs.js!./src/index.module.css 39 bytes [built] [code generated]
webpack 5.108.4 compiled successfully in 80 ms
# 第三次编译
assets by status 866 bytes [cached] 1 asset
asset index.html 344 bytes [emitted]
asset another-32277c21d626f15ea07f.js 123 bytes [emitted] [immutable] [minimized] (name: another)
asset index.css 64 bytes [emitted] (name: index)
Entrypoint index 930 bytes = index.css 64 bytes index-3f4853076a5c12fef72c.js 866 bytes
Entrypoint another 123 bytes = another-32277c21d626f15ea07f.js
orphan modules 3.39 KiB (javascript) 2.67 KiB (runtime) [orphan] 14 modules
runtime modules 1.1 KiB 3 modules
cacheable modules 687 bytes (javascript) 62 bytes (css/mini-extract)
  javascript modules 687 bytes
    ./src/index.js + 1 modules 431 bytes [built] [code generated]
    ./src/another.js 195 bytes [built] [code generated]
    ./src/index.xml 61 bytes [built] [code generated]
  modules by path ./src/*.css 62 bytes
    css ./node_modules/css-loader/dist/cjs.js!./src/index.css 23 bytes [built] [code generated]
    css ./node_modules/css-loader/dist/cjs.js!./src/index.module.css 39 bytes [built] [code generated]
webpack 5.108.4 compiled successfully in 74 ms
```

这里列举一下部分asset的表示，这样方便理解有哪些文件重新输出了。通过阅读标识和文件名变动，我们可以从命令行输出中找到哪些文件被改动了。

* [compared for emit] 和已输出的文件内容一致
* [emitted] 重新输出
* [emitted] [immutable] [minimized] 重新输出+已压缩+不可变的（缓存标记）

### watch选项
watch模式还可以配置一些选项，在webpack.config.js的watchOptions中配置，示例如下：

```js
module.exports = {
  watchOptions: {
    aggregateTimeout: 200,
    ignored: /node_modules/,
  },
  // ...其它配置
};
```

* aggregateTimeout 文件更改后，重新构建前的延迟时间，单位ms。这个时间内的其它改动也会合并进这次构建中。类似于防抖。
* ignored 忽略监听部分目录或文件，可接受正则，字符串，数组等。最常用的是忽略node_modules目录。
* poll 指定毫秒为单位进行轮询。
* followSymlinks 根据软链接查找文件。
* stdin 当stdin流结束时停止监听。一般用在自动化脚本或者程序控制，对于本地打包无影响。

### Node.js脚本
Webpack也提供了watch模式的Node.js API，我们试一下按脚本方式调用：

```js
const webpack = require("webpack");
const config = require("../webpack.config.js");

const compiler = webpack(config);
compiler.watch({ aggregateTimeout: 200 }, (err, stats) => {
  console.log("一次打包成功！");
});
```

使用watch方法，即可开启观察模式。第一个参数为watchOptions值，第二个参数是打包结束的回调函数，和compiler.run方法一致。但打包成功后不会停止，还是继续监听文件。如果文件有改动，那便会重新触发打包，打包完成后会重新触发一次打包结束的回调函数。还有两个watch相关的方法：

```js
const webpack = require("webpack");
const config = require("../webpack.config.js");

const compiler = webpack(config);
const watchObj = compiler.watch({ aggregateTimeout: 200 }, (err, stats) => {
  console.log("一次打包成功！");
});

setTimeout(() => {
  watchObj.invalidate();
}, 5000);
setTimeout(() => {
  watchObj.close((closeErr) => {
    console.log("Watch模式结束");
  });
}, 10000);

/* 命令行输出  （未改动文件）
一次打包成功！  （刚执行打包时）
一次打包成功！  （5秒后）
Watch模式结束  （10秒后）
*/
```

invalidate方法会重新触发一次打包。如果当前有正在打包中的流程，会被中断并重新开始打包。close方法则是主动关闭监听模式，结束打包。

### watch相关钩子


## webpack-dev-middleware

## webpack-dev-server

## HMR


## 参考
- Webpack如何实现万物皆可import？loader的使用/配置/手写实践\
  https://jzplp.github.io/2026/webpack-loader.html
- 理解Webpack插件机制：从插件使用、各类编译对象、Tapable到自定义插件与钩子开发\
  https://jzplp.github.io/2026/webpack-plugin.html
- Webpack GitHub\
  https://github.com/webpack/webpack
- Webpack 文档\
  https://webpack.js.org/
- Webpack 中文文档\
  https://webpack.docschina.org/
- Webpack 开发环境\
  https://webpack.docschina.org/guides/development/
- Webpack watch和watchOptions\
  https://webpack.docschina.org/configuration/watch/
- Webpack 模块热替换\
  https://webpack.docschina.org/guides/hot-module-replacement/
- Webpack 模块热替换(hot module replacement)\
  https://webpack.docschina.org/concepts/hot-module-replacement/
- Webpack Hot Module Replacement\
  https://webpack.docschina.org/api/hot-module-replacement/
- webpack-dev-server GitHub\
  https://github.com/webpack/webpack-dev-server
- webpack-dev-middleware GitHub\
  https://github.com/webpack/webpack-dev-middleware
- Webpack DevServer\
  https://webpack.docschina.org/configuration/dev-server/
- Webpack Node接口\
  https://webpack.docschina.org/api/node/



