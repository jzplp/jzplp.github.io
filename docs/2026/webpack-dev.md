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


分析 filename: "[name]-[contenthash].js",

看看watch选项

看看命令行输出








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



