# Webpack中的loader(未完成)
Webpack是前端历史上具有统治地位的打包工具，应用非常广泛。虽然现在逐渐被性能更强的工具替代，但是依然有很多工程使用。loader是Webpack中的一种重要的外部插入配置工具，负责对源代码进行转换。Webpack本身只能识理解JavaScript和JSON文件，其它类型的文件不能处理。正是使用各种loader，Webpack才有了将各种格式的资源和代码识别和引入的能力。当然，loader的能力也并不仅限于此。

## loader示例
为了了解loader的作用和使用方式，我们举例一些现有的知名loader。

### 创建Webpack工程
方便后续演示，首先需要新创建一个使用Webpack构建的最简单工程。执行命令行：

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

与CSS相关的最常用loader有两个，顺序为 css-loader -> style-loader。

* css-loader 负责解析CSS代码，使其作为一个模块
* style-loader 创建style样式，将CSS代码插入到HTML中

如果只引入css-loader，打包后可以看到JS文件中有CSS代码，但是却没有生效。这里我们引入两个试试：

```js
const path = require("path");

module.exports = {
  mode: "production",
  entry: "./src/index.js",
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "dist"),
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          "style-loader",
          "css-loader",
        ],
      },
    ],
  },
};
```

注意看在配置中有个test，我们传入了正则，表示.css后缀的文件名会匹配到这个规则。匹配到这个规则的文件，就使用这两个loader处理。然后再打包，发现成果中有引入CSS代码，而且浏览器中可以看到效果：

​![](/2026/loader-3.png)

### xml-loader
对于引入的XML文件，如果不使用xml-loader，也会像前面CSS文件一样提示模块解析报错。这里我们修改配置，匹配到xml后缀名的文件。

```js
const path = require("path");

module.exports = {
  mode: "production",
  entry: "./src/index.js",
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "dist"),
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.xml$/,
        use: "xml-loader",
      },
    ],
  },
};
```

然后我们创建src/index.xml文件，内容如下：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<note>
  <to>jzplp1</to>
  <from>jzplp2</from>
</note>
```

然后在src/index.js中引入文件，并输出结果：

```js
import "./index.css";
import dataXml from './index.xml';

console.log(dataXml);

function genEle(test, className) {
  const div = document.createElement("div");
  div.className = className;
  div.textContent = test;
  document.body.appendChild(div);
}
genEle("jzplp1", "abc");
```

然后进行构建，查看生成文件和浏览器的Console效果。可以看到，xml文件被解析为数据直接放到生成代码中了，；浏览器可以正常输出结果。

​![](/2026/loader-4.png)

### babel-loader
Babel是一个知名的代码编译工具，它的主要作用是将新版本的ECMAScript代码转换为兼容的旧版本JavaScript代码，以便新代码可以正常运行在旧浏览器环境中。要将Babel引入到Webpack打包流程中，同样需要babel-loader的帮助。首先需要安装依赖babel-loader和@babel/core，以及@babel/preset-env。然后修改配置：

```js
const path = require("path");

module.exports = {
  mode: "production",
  entry: "./src/index.js",
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "dist"),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
          },
        },
      },
    ],
  },
};
```

在配置中我们识别了以js作为后缀名的文件，排除了node_modules中的代码，并且设置了loader选项，提供了Babel预设。注意js文件即使我们不引入babel-loader，Webpack也是可以解析的。在使用babel-loader后，Webpack打包js文件前，需要先经过Babel处理。w我们对比是否使用babel-loader打包后的文件内容：

```js
// 不使用 babel-loader
!(function () {
  const e = document.createElement("div");
  ((e.className = "abc"),
    (e.textContent = "jzplp1"),
    document.body.appendChild(e));
})();
// 使用 babel-loader
(() => {
  var e;
  (((e = document.createElement("div")).className = "abc"),
    (e.textContent = "jzplp1"),
    document.body.appendChild(e));
})();
```

通过对比可以看到，使用babel-loader后，代码被Babel编译了，明显区别在于const这个ES6语法不存在了，转为了var这个兼容语法。

### thread-loader
thread-loader并不是用来引入某种类型文件的，而是利用多进程同时执行的技术，优化其它loader的执行时间的。thread-loader只需要放置在其它loader之前，它会的创建多个进程，将后续的loader执行代码放到独立的进程中执行，从而优化时间性能。它适合T用在比较耗时的操作中，例如babel-loader。我们修改配置：

```js
const path = require("path");

module.exports = {
  mode: "production",
  entry: "./src/index.js",
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "dist"),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ["thread-loader", "babel-loader"],
      },
    ],
  },
};
```

多进程是否有效，直接打包是看不出来的，因此我们增加一个Babel插件，在执行时打印PID和文件名。创建babel.config.js：

```js
module.exports = {
  presets: ["@babel/preset-env"],
  plugins: [
    function plugin1(babel) {
      return {
        visitor: {
          Program(path, state) {
            const line = `PID=${process.pid}  ${state.file.opts.filename}\n`;
            console.log(line);
          },
        },
      };
    },
  ],
};
```

然后再创建两个JavaScript文件，在入口文件src/index.js中都引入：

```js
import './index2';
import './index3';

function genEle(test, className) {
  const div = document.createElement("div");
  div.className = className;
  div.textContent = test;
  document.body.appendChild(div);
}
genEle("jzplp1", "abc");
```

然后在使用和不使用thread-loader时分别打包，打包时观察console输出，可以发现在不使用时，三个文件的PID都一样，说明是在一个进程中执行的。而使用了thread-loader之后，PID出现不一致的情况，说明babel编译不同文件被分散到了不同进程处理。

```
// 不使用thread-loader
PID=15988  E:\testProj\webpack-loader\use-loader\src\index.js
PID=15988  E:\testProj\webpack-loader\use-loader\src\index2.js
PID=15988  E:\testProj\webpack-loader\use-loader\src\index3.js

// 使用thread-loader
PID=25820  E:\testProj\webpack-loader\use-loader\src\index.js
PID=25820  E:\testProj\webpack-loader\use-loader\src\index2.js
PID=7808  E:\testProj\webpack-loader\use-loader\src\index3.js
```

## loader配置方式
通过前面对于几个loader的介绍，我们对与loader的作用已经有了简单的了解。这里我们再描述一下，loader在Webpack中是如何配置的。

### 配置方式



### 配置优先级

Rule.enforce

### 嵌套rules ？

### 内联方式






## 自定义loader


## 参考
- Webpack GitHub\
  https://github.com/webpack/webpack
- Webpack 文档\
  https://webpack.js.org/
- Webpack 中文文档\
  https://webpack.docschina.org/
- 解锁Babel核心功能：从转义语法到插件开发\
  https://jzplp.github.io/2025/babel-intro.html
- Babel 文档\
  https://babeljs.io/
- css-loader Webpack中文文档\
  https://webpack.docschina.org/loaders/css-loader/
- style-loader Webpack中文文档\
  https://webpack.docschina.org/loaders/style-loader/
- thread-loader Webpack中文文档\
  https://webpack.docschina.org/loaders/thread-loader/
- babel-loader Webpack中文文档\
  https://webpack.docschina.org/loaders/babel-loader/
- 概念-loader Webpack中文文档\
  https://webpack.docschina.org/concepts/loaders/
- module.rules Webpack中文文档\
  https://webpack.docschina.org/configuration/module/#modulerules

