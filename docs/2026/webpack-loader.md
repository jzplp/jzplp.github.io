# Webpack中的loader(未完成)
Webpack是前端历史上具有统治地位的打包工具，应用非常广泛。虽然现在逐渐被性能更强的工具替代，但是依然有很多工程使用。loader是Webpack中的一种重要的外部插入配置工具，负责对源代码进行转换。Webpack本身只能识理解JavaScript和JSON文件，其它类型的文件不能处理。正是使用各种loader，Webpack才有了将各种格式的资源和代码识别和引入的能力。当然，loader的能力也并不仅限于此。

## loader使用示例
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

### 基础配置
loader主要的配置方式是通过module.rules进行配置。但这个配置项并不是专供loader使用的，而是负责Webapck模块的规则配置。parser和generator（解析器和生成器）也是用rules等选项进行配置。这里我们主要介绍和loader相关的配置项，这一节会提到这些配置：

* Rule.test 匹配模块规则
* Rule.use 应用于模块的loader配置
* Rule.loader 应用模块的单个loader配置
* Rule.include 引入符合条件的模块
* Rule.exclude 排除符合条件的模块
* Rule.issuer 匹配模块请求者的路径

这里列举几个简单的配置实例，部分示例是前面提到过的：

```js
module.exports = {
  module: {
    rules: [
      // 单个loader写法，使用use
      {
        test: /\.xml$/,
        use: "xml-loader",
      },
      // 单个loader写法
      {
        test: /\.xml$/,
        loader: "xml-loader",
      },
      // 多个loader写法
      {
        test: /\.css$/,
        use: [ "style-loader", "css-loader" ],
      },
      // 排除模块
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: "babel-loader",
      },
    ],
  },
};
```
loader还可以接受参数，此时需要修改为对象写法。

```js
module.exports = {
  module: {
    rules: [
      // loader接受参数
      {
        test: /\.css$/i,
        use: [
          "style-loader",
          { loader: "css-loader", options: { modules: true } },
        ],
      },
      // 单个loader时的简化写法
      {
        test: /\.css$/i,
        loader: 'css-loader',
        options: {
          modules: true,
        },
      },
    ],
  },
};
```

上面几个路径相关的匹配参数test, include, exclude等，匹配的都是我们要引入的被loader处理的模块路径。例如我们在src/index.js中引入src/index.xml，那么匹配的路径就是src/index.xml。而issuer这个参数，匹配的却是引入者的路径，例如src/index.js。这里举个配置的例子：

```js
// 生效，成功编译
{
  test: /\.xml$/,
  issuer: /index\.js/,
  loader: "xml-loader",
},
// 失效，编译失败
{
  test: /\.xml$/,
  issuer: /123\.js/,
  loader: "xml-loader",
},
```

### 顺序和优先级
前面的配置中我们看到，同一个模块可以接收多个loader，这些loader依次对模块代码进行处理。最常见的是loader配置为数组，这时候是从后往前执行。例如我们希望编译SCSS文件，则配置和执行顺序如下：

```js
{
  test: /\.scss$/i,
  use: ["style-loader", "css-loader", "sass-loader"],
},
```

1. sass-loader 将SCSS编译为CSS -> 传给下一级
2. css-loader 解析CSS代码，作为一个JS模块 传给下一级
3. style-loader 创建style样式，将CSS代码插入到HTML中

可以看到，每个loader实际上只做一件事情。除了顺序之外，使用Rule.enforce还可以配置优先级，pre表示高优先级，未设置表示普通优先级，post表示低优先级。优先级越高的越早执行。例如我们希望共享编译CSS和SCSS的配置，可以利用优先级这样写：

```js
{
  test: /\.scss$/i,
  enforce: "pre",
  use: ["sass-loader"],
},
{
  test: /\.(scss|css)$/i,
  use: ["style-loader", "css-loader"],
},
```

这样，对于CSS文件，仅仅执行css-loader, style-loader两个。对于SCSS文件，在前面多执行了一个sass-loader。这样两种文件都能得到妥善处理。

### 函数形式
use属性支持函数形式，可以自定义启用loader的逻辑：

```js
{
  test: /\.xml$/,
  use: (info) => {
    console.log(info);
    return ["xml-loader"];
  },
},
/*
{
  resource: 'E:\\testProj\\webpack-loader\\use-loader\\src\\index.xml',
  realResource: 'E:\\testProj\\webpack-loader\\use-loader\\src\\index.xml',
  phase: 'evaluation',
  dependency: 'esm',
  descriptionData: {
    name: 'webpack-loader',
    scripts: { build: 'webpack' },
    devDependencies: { ... },
    ...
  },
  issuer: 'E:\\testProj\\webpack-loader\\use-loader\\src\\index.js',
  ...
}
*/
```

返回值与直接配置use参数一致。info参数可以拿到部分项目和模块信息，这里列举部分属性的含义：

* resource 被加载的模块路径
* issuer 引入者的路径
* descriptionData package.json中的信息

### oneOf和嵌套rules
使用oneOf和rules属性，可以实现嵌套rule。首先使用OneOf可以配置多个规则，只有第一个匹配到的规则生效：

```js
{
  test: /\.(scss|css)$/i,
  oneOf: [
    {
      test: /\.scss$/i,
      use: ["style-loader", "css-loader", "sass-loader"],
    },
    {
      test: /\.css$/i,
      use: ["style-loader", "css-loader"],
    },
  ],
}
```

上面的父规则同时匹配SCSS和CSS文件，但是子规则却区分了两条，不同的文件匹配不同的规则。下面再来举例一个嵌套rule的例子：

```js
{
  test: /\.scss$/i,
  rules: [
    {
      test: /\.m\.scss$/i,
      use: [
        "style-loader",
        {
          loader: "css-loader",
          options: {
            modules: true,
          },
        },
        "sass-loader",
      ],
    },
    {
      test: /\.c\.css$/i,
      use: ["style-loader", "css-loader", "sass-loader"],
    },
  ],
},
```

上面的例子中，父rule识别了SCSS文件，子rule又根据不同文件名采取不同的处理方式。通过oneOf和嵌套rules的能力，可以更好的组织Rule配置。

### 内联方式
除了Wbepack配置文件中配置外，loader还可以配置在引入模块的路径处，这样可以对部分特性模块使用特殊配置。我们先删除webpack.config.js中module相关的所有内容，然后修改引入模块的路径：

```js
// 单个loader
import data from 'xml-loader!./index.xml';
// 多个loader
import 'style-loader!css-loader!./index.css';
// loader配置
import { abc } from "style-loader!css-loader?modules=local!sass-loader!./index.scss";
// 另一种loader配置
import { abc } from 'style-loader!css-loader?{"modules": true}!sass-loader!./index.scss';
```

可以看到，将loader写在路径前面，通过感叹号分隔，即可以内联方式使用loader。多个loader时执行顺序依然是从后到前，和rules中一致。同时内联方式也支持配置，可以使用类似url查询参数的格式，例如?a=xx&b=xx。又或者是一个JSON数据，例如?{"modules": true}。

当同时配置了Webpack配置文件和内联方式时，他们两个必定会冲突。内联模式也提供了一些配置可以禁用配置文件，在最前面增加符号即可：

```js
// !  禁用普通loader
import data from '!xml-loader!./index.xml';
// !! 禁用所有loader
import data from '!!xml-loader!./index.xml';
// -! 禁用pre和普通loader
import data from '-!xml-loader!./index.xml';
```

## 自定义loader
### 新建loader
loader实际上就是一个处理代码的函数。首先我们新建一个最简单的loader，接收js后缀名的文件，但是只输出，不处理。新建loader/abc.js，内容就是loader的本体：

```js
module.exports = function abcLoader(src) {
  console.log(src);
  return src;
}
```

然后在webpack.config.js中配置这个loader：

```js
module: {
  rules: [
    {
      test: /\.js$/,
      use: path.resolve('loader/abc.js'),
    },
  ],
},
```

然后Console和打包后输出的结果如下。可以看到，loader函数接受的src实际上就是代码字符串本身。

```js
// Console输出
function genEle(test, className) {
  const div = document.createElement("div");
  div.className = className;
  div.textContent = test;
  document.body.appendChild(div);
}
genEle("jzplp1", abc);

// 打包后文件内容
!(function (e, t) {
  const n = document.createElement("div");
  ((n.className = t), (n.textContent = "jzplp1"), document.body.appendChild(n));
})(0, abc);
```

如果我们不返回src本身，而是使用对src进行修改，或者返回其它内容，这时候webpack处理的代码也会变化。

```js
module.exports = function abcLoader(src) {
  return 'const str = "hello, jzplp!"; console.log(str)';
}
```

使用上面的loader，无论我们js文件中的代码是什么，输出都是一致的。例如用前面一样的js源码进行尝试，输出如下：

```js
console.log("hello, jzplp!");
```

了解了这些，我们可以试着做一个处理xml的loader。首先需要安装fast-xml-parser用来处理xml文件。

```js
const { XMLParser } = require("fast-xml-parser");

module.exports = function abcLoader(src) {
  const parser = new XMLParser();
  const data = parser.parse(src);
  return `export default ${JSON.stringify(data)}`;
};
```

通过loader代码可以看到，我们接收xml字符串，然后处理成JSON数据，再返回一个JavcaScript模块，导出JSON数据，这样就完成了xml的接入。再修改webpack.config.js配置：

```js
module: {
  rules: [
    {
      test: /\.xml$/,
      use: path.resolve('loader/abc.js'),
    },
  ],
},
```

然后使用前面的xml数据，修改index.js内容。通过打包后输出代码可以看到，xml中的数据内容已经被合并进了输出JavcaScript中。

```js
// index.js
import data from './index.xml'; 
console.log(data);

// 打包后输出代码
(() => {
  "use strict";
  console.log({ "?xml": "", note: { to: "jzplp1", from: "jzplp2" } });
})();
```




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
- 编写loader Webpack中文文档\
  https://webpack.docschina.org/contribute/writing-a-loader/
- Loader Interface API Webpack中文文档\
  https://webpack.docschina.org/api/loaders/
