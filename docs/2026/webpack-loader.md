# Webpack中的loader(未完成)
Webpack是前端历史上具有统治地位的打包工具，应用非常广泛。虽然现在逐渐被性能更强的工具替代，但是依然有很多工程使用。loader是Webpack中的一种重要的外部插入配置工具，负责对源代码进行转换。使用各种loader，Webpack才有了将各种格式的资源和代码识别和引入的能力。

## loader示例
为了了解loader的作用和使用方式，我们举例一些现有的知名loader。

### 创建Webpack工程
为了后续演示，首先需要新创建一个使用Webpack构建的最简单工程。执行命令行：

```sh
npm init -y
npm install -D webpack webpack-cli
```

修改package.json，去掉`"type": "commonjs"`，scripts中增加`"build": "webpack"`指令。创建src/index.js，内容创建一个div元素并放到body中。

```js
function genEle(test, className) {
  const div = document.createElement("div");
  div.className = className;
  div.textContent = test;
  document.body.appendChild(div);
}
genEle("jzplp1");
```

然后是index.html，为HTML入口，注意因为要打包，所以引用的js是dist目录中的，并不是src。

```html
<html>
  <head>
    <title>jzplp Webpack loader</title>
  </head>
  <body>
    <script src="./dist/main.js"></script>
  </body>
</html>
```

然后是webpack.config.js，配置打包相关路径：

```js
const path = require("path");

module.exports = {
  mode: "production",
  entry: "./src/index.js",
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "dist"),
  },
};
```

然后执行npm run build进行打包，可以在dist目录中看到打包结果，以及在浏览器中看到执行效果：

​![](/2026/loader-1.png)

### CSS文件loader
CSS文件在Webpack中默认是不支持的，如果需要引入CSS文件，则需要loader的帮助。这里我们先试一下不使用loader的效果。首先新增一个src/index.css文件：

```css
.abc {
  color: red;
}
```

然后修改src/index.js，引入CSS文件：

```js
import "./index.css";

function genEle(test, className) {
  const div = document.createElement("div");
  div.className = className;
  div.textContent = test;
  document.body.appendChild(div);
}
genEle("jzplp1", "abc");
```

这时候我们再次打包，会报错模块解析错误，提示我们应该找个合适的loader来适配这个文件类型：

​![](/2026/loader-2.png)



## Webpack的loader配置

## 新建loader


## 参考
- Webpack GitHub\
  https://github.com/webpack/webpack
- Webpack 文档\
  https://webpack.js.org/
- Webpack 中文文档\
  https://webpack.docschina.org/
