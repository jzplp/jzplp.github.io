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
在观察模式下，Webpack触发的钩子会有差异，还有部分钩子是观察模式专属的。这里要先注释HtmlWebpackPlugin插件，否则会干扰输出。

```js
const pluginName = "JzplpPlugin";
const listKey = [
  "beforeRun",
  "run",
  "watchRun",
  "compilation",
  "done",
  "invalid",
  "watchClose",
  "shutdown",
];

module.exports = class JzplpPlugin {
  apply(compiler) {
    listKey.map((key) => {
      compiler.hooks[key].tap(pluginName, () => {
        console.log(`\n hook ${key}`);
      });
    });
  }
};
```

在这个插件中，我们批量监听了很多个钩子。将插件引入webapck.config.js中，然后在非观察模式和观察模式下查看输出结果：

```js
const JzplpPlugin = require("./plugin/a");
module.exports = {
  // 其它配置
  plugins: [
    new JzplpPlugin(),
    // 其它插件
  ],
};

/* 
非watch模式输出结果
 hook beforeRun
 hook run
 hook compilation
 hook done
 hook shutdown
 打包完成输出信息...

watch模式输出结果
 hook watchRun
 hook compilation
 hook done
 打包完成输出信息...
 hook invalid
 hook watchRun
 hook compilation
 hook done
 打包完成输出信息...
 hook invalid
 hook watchRun
 hook compilation
 hook done
 打包完成输出信息...
 hook watchClose
 hook shutdown
*/
```

通过对比可以看到，观察模式下没有触发beforeRun和run钩子，而是触发了watchRun，这是一个观察模式的专属钩子。然后在每次修改代码并保存后，会重新触发观察模式的专属钩子： invalid（compilation失效）和watchRun。然后是compilation相关钩子被触发。当命令行退出时，会触发一个专属钩子watchClose。

还可以注意到，非观察模式的打包时线性的，打包完一次就结束。观察模式下从watchRun开始走进了一个循环，每次修改文件便会触发。注意到compilation和invalid钩子，分别是创建一个新的compilation和失效一个compilation。

正因为观察模式要重新打包，因此在观察模式的循环中，每次会重新创建compilation。也正是因为如此，compilation对象需要在钩子中获取，而不是像compiler一样固定一个对象。虽然重新打包，但实际上是增量构建，Webpack只会打包修改过的模块和相关部分。

## webpack-dev-middleware
webpack-dev-middleware是一个适配express的中间件，用来适配Webpack的开发模式。express是Node.js的Web应用框架。这里我们一步一步介绍一下webpack-dev-middleware的使用方式和作用。

### 中间件初步
首先我们启动一个express服务，使用webpack-dev-middleware中间件。中间件的第一个入参为Webapck的compiler对象。

```js
const express = require("express");
const webpack = require("webpack");
const webpackDevMiddleware = require("webpack-dev-middleware");

const config = require("../webpack.config.js");
const compiler = webpack(config);
const app = express();

app.use(webpackDevMiddleware(compiler));
app.listen(3000, () => {
  console.log("Listening http://127.0.0.1:3000 \n");
});
```

需要打开HtmlWebpackPlugin插件，和我们前面为了实验watch模式钩子写的自定义插件JzplpPlugin。然后执行上面的脚本，访问3000端口的服务。然后发现我们的页面被挂载了这个本地服务上。这是webpack-dev-middleware的第一个作用：本地启动开发服务器。

其次我们看到命令行中输出了“hook watchRun”等观察模式才输出的字符串，且在编译完成后，程序并没有结束退出。我们修改src/index.js文件内容，发现会触发重新编译。这是webpack-dev-middleware的第二个作用：自动开启观察模式。

我们删除dist目录后再启动脚本，发现命令行中提示编译成功，浏览器上也可以访问编译完的结果，但是dist目录中依旧是空的。这是webpack-dev-middleware的第三个作用：编译结果放到内存中存储，并不写入真实磁盘文件。这样读取和写入结果的速度更快。

### 中间件参数
webpack-dev-middleware中间件的第二个参数可以接受一个对象，里面可以配置多种参数，这里我们先简单介绍一下：

| 参数 | 类型 | 默认值 | 描述 |
| - | - | - | - |
| methods | Array | [ 'GET', 'HEAD' ] | 中间件接受的HTTP请求方法 |
| headers | Array\|Object\|Function | undefined | 允许为每个请求传递自定义HTTP头 |
| index | boolean\|string | index.html | 若为false（非undefined），则根URL请求不响应 |
| mimeTypes | Object | undefined | 允许注册自定义MIME类型或扩展映射 |
| mimeTypeDefault | string | undefined | 无法确定内容类型时使用的默认MIME类型 |
| etag | boolean\|"weak"\|"strong" | undefined | 启用或禁用ETag生成 |
| lastModified | boolean | undefined | 启用或禁用Last-Modified头（使用文件系统修改时间） |
| cacheControl | boolean\|number\|string\|Object | undefined | 启用或禁用Cache-Control响应头 |
| cacheImmutable | boolean | undefined | 为不可变资源启用强缓存头（public, max-age=31536000, immutable） |
| publicPath | string | undefined | 中间件绑定的公共路径 |
| stats | boolean\|string\|Object | stats（来自配置） | 统计选项对象或预设名称 |
| serverSideRender | boolean | undefined | 启用或禁用服务端渲染模式 |
| writeToDisk | boolean\|Function | false | 是否将文件写入磁盘（按配置路径） |
| outputFileSystem | Object | memfs | 设置Webpack输出文件的目标文件系统 |
| modifyResponseData | Function | undefined | 允许设置回调以修改响应数据 |
| forwardError | boolean | false | 是否将错误转发给下一个中间件 |

上面大部分都是Header相关的，下面部分是文件相关的配置。这里我们实际尝试一下文件相关的配置。首先是publicPath，除了在中间件这里配置之外，更常见的是在webpack.config.js中的output.publicPath中配置。在不配置时，我们访问本地服务使用http://127.0.0.1:3000 即可。 publicPath配置为"/abc/"时，我们访问本地服务的地址就变为了 http://127.0.0.1:3000/abc/ 。

前面我们尝试过，使用webpack-dev-middleware之后，watch模式打包的代码时，生成的代码是保存在内存中的，并不会真正写入磁盘。但如果我们确实希望同时输出真实文件，那么设置writeToDisk为true，每次watch模式重新打包后，就会同步生成一份最新的代码到dist目录中。不过不管writeToDisk是否设置，依旧会在内存中生成文件，且本地服务还是从内存中读取。

webpack-dev-middleware是如何将生成文件放到内存中的？实际上是使用了memfs这个库，它的作用是在内存中模拟文件系统，实现了与Node.js原生fs模块一致的API接口。outputFileSystem配置的默认值就是memfs。作为配置举例，我们可以将outputFileSystem修改为fs模块，此时即使不用writeToDisk配置，在每次编译后，中间件会保存文件到dist中。此时内存中将不再保存文件，即使本地服务，也从磁盘文件中读取。可以尝试手动修改dist中的文件后，访问本地服务刷新浏览器可以看到变化。配置方式：

```js
app.use(
  webpackDevMiddleware(compiler, {
    outputFileSystem: require("fs"),
  }),
);
```

modifyResponseData配置接收一个函数，可以允许我们访问并修改本地服务输出的数据。注意这里修改的并不是生成文件（它并不是Webpack插件），用户给本地服务发送文件访问请求，中间件读取内存中的生成文件后，经过modifyResponseData函数处理在返回给用户。

```js
const express = require("express");
const webpack = require("webpack");
const webpackDevMiddleware = require("webpack-dev-middleware");
const config = require("../webpack.config.js");
const compiler = webpack(config);
const app = express();
const { PassThrough } = require("stream");

app.use(
  webpackDevMiddleware(compiler, {
    modifyResponseData: (req, res, data, byteLength) => {
      // 如果请求的是js文件
      if (req.url.endsWith(".js")) {
        // 创建一个双向流
        const passThrough = new PassThrough();
        // 首先写入注释
        passThrough.write("/* hello jzplp */\n");
        // 然后把data中的数据传入
        data.pipe(passThrough);
        // passThrough 作为可读流输出
        return { data: passThrough, byteLength: byteLength + 18 };
      }
      return { data, byteLength };
    },
  }),
);

app.listen(3000, () => {
  console.log("Listening http://127.0.0.1:3000 \n");
});
```

由于modifyResponseData中的data实际上是可读流，因此全程使用流的方式处理。我们识别JavaScript文件，将每个文件第一行增加一句注释，然后再输出。可以验证浏览器上访问的.js后缀的文件，都带有了这句注释。

### 中间件API和插件模式
webpack-dev-middleware中间件还提供了很多API方法，这里简单介绍下：

* close(callback) 关闭监听源文件变化
* invalidate(callback) 前置重新构建一次，内部调用watch.invalidate方法
* waitUntilValid(callback) 当构建成功时，触发回调（只触发一次）
* getFilenameFromUrl(url) 传入url路径，获取文件路径
* koaWrapper, hapiWrapper, honoWrapper 适配其它Node.js的Web服务中间件

其中close方法不关闭本地的Web服务，紧紧关闭Webpack的watch观察模式。即调用close之后，还是能够从内存中读取之前编译过的文件。但如果开启中间件后立即close，Webapck还没来及的打包完成就关闭了。这时候服务读不到文件，就会报错。

webpack-dev-middleware还有一个插件模式，设置第三个属性为ture即可开启。说是插件模式，实际上就是去掉了开启watch模式的部分，需要我们自己开启，但还是需我们自己启动express服务。插件模式适合使用在一些特殊要求的场景。

```js
const express = require("express");
const webpack = require("webpack");
const webpackDevMiddleware = require("webpack-dev-middleware");
const config = require("../webpack.config.js");
const compiler = webpack(config);
const app = express();

// 打开插件模式
app.use(webpackDevMiddleware(compiler, {}, true));

// 自己开启Webpack观察模式
compiler.watch({}, (err, stats) => {
  console.log('打包完成');
});

app.listen(3000, () => {
  console.log("Listening http://127.0.0.1:3000 \n");
});
```

## webpack-dev-server
### 服务初步
webpack-dev-server提供了开发模式下的服务，内部实际上是webpack-dev-middleware的封装，并且扩展了一些功能。它与Webpack的集成度更高，且不需要我们自己编写开发服务代码。

```sh
# 安装依赖
npm add -D webpack-dev-server
# package.json的script中写入 
"start": "webpack serve"
# 执行命令
npm run start
```

执行命令后，发现Webpack以观察模式启动，同时命令行中输出了访问例如，例如：`http://localhost:8080/`，在浏览器中访问即可看到打包结果。同时dist中也没有生成文件，说明生成文件还是在内存中。这里可以看到，webpack-dev-server提供了与webpack-dev-middleware一样的能力，但是使用更便捷，基本无需修改源码。HTTP服务除了提供文件访问之外，还有几个扩展能力：

* `http://localhost:8080/webpack-dev-server` 展示打包生成的文件列表
* `http://localhost:8080/webpack-dev-server/invalidate` 触发Webpack重新打包

### 命令行参数
前面实际上是通过webpack-cli使用webpack-dev-server的，是一种命令行使用方式。通过webpack serve启动服务时，可以接受一些命令行参数。这里我们对命令行参数进行一些简单介绍，通过介绍也能让我们了解webpack-dev-server的功能。其中部分参数是webpack-cli本身的参数，并不是给webpack-dev-server使用的，这里就不介绍了。

* --allowed-hosts value... 哪些主机可以访问开发服务器
* --allowed-hosts-reset 重置允许访问的主机列表
* --bonjour 允许在启动时通过ZeroConf网络广播开发服务器
* --no-bonjour 禁止在启动时通过ZeroConf网络广播开发服务器
* --no-client 禁用客户端脚本
* --client-logging value 在浏览器中设置日志级别
* --client-overlay-xxx (多种参数) 当有编译错误或警告时，浏览器全屏覆盖层相关
* --client-progress 在浏览器中以百分比显示编译进度
* --no-client-progress 不在浏览器中以百分比显示编译进度
* --client-reconnect value 告知开发服务器尝试重新连接客户端的次数
* --no-client-reconnect 告知开发服务器不要尝试重新连接客户端
* --client-web-socket-xxx (多种参数) WebSocket传输相关配置
* --compress 为所有提供的内容启用gzip压缩
* --no-compress 为所有提供的内容禁用gzip压缩
* --history-api-fallback 允许通过指定的索引页（默认index.html）代理请求
* --no-history-api-fallback 禁止通过指定的索引页代理请求
* --host value 允许指定要使用的主机名
* --hot value 启用热模块替换（HMR）
* --no-hot 禁用热模块替换（HMR）
* --ipc value 监听Unix套接字
* --live-reload 当检测到文件更改时启用页面重新加载/刷新（默认启用）
* --no-live-reload 当检测到文件更改时禁用页面重新加载/刷新
* --open-xxx (多种参数) 允许配置开发服务器启动后自动打开浏览器和页面
* --port value 允许指定要使用的端口
* --server-type value 允许设置服务器和选项（默认为 'http'）
* --server-options-xxx (多种参数) SSL证书等配置相关
* --static value... 允许配置从目录（默认为 'public'）提供静态文件服务
* --no-static 禁止配置从目录提供静态文件的选项
* --static-directory value... 设置静态文件目录
* --static-public-path value... 静态文件在浏览器中以此公共路径提供
* --static-serve-index 告知开发服务器在启用时使用serveIndex中间件
* --no-static-serve-index 不告知开发服务器使用serveIndex中间件
* --static-watch 监视静态内容目录中的文件
* --no-static-watch 不监视静态内容目录中的文件
* --static-reset 重置static配置
* --static-public-path-reset 重置static.publicPath配置
* --watch-files value... 允许配置要监视文件更改的glob/目录/文件列表
* --watch-files-reset 重置watchFiles配置
* --no-web-socket-server 禁止设置WebSocket服务器及其选项
* --web-socket-server-type value 指定WebSocket服务器类型

通过上述配置，可以看到webpack-dev-serve相比于webpack-dev-middleware，扩展了非常多的功能和配置。其中open相关配置表示服务启动后，自动打开了浏览器，且跳转到项目首页。static相关配置可以设置额外于生成文件的静态文件访问目录。hot和live-reload相关配置可以在生成文件变动时自动更新浏览器展示效果。history-api-fallbacks适配单页应用的前端路由形式。webpack-dev-serve还会在生成文件中注入额外的JavaScript代码（使用--no-client禁用），这些代码有很多作用：例如在构建失败时展示全屏覆盖层提示错误；创建WebSocket服务，和本地服务配合监控打包文件变更，从而实现自动更新效果等。后面我们将介绍一部分功能。

### devServer参数
除了命令行参数之外，还可以在webpack.config.js中直接配置webpack-dev-serve的功能。大部分配置内容和上面命令行配置是一致的，这里就不再重复描述了。我们列一下不能使用命令行参数配置的内容：

```js
module.exports = {
  devServer: {
    headers: {'X-Custom-Foo': 'bar'}, // 添加HTTP的相应header
    onListening: (devServer) => {}, // 开始监听端口连接时执行自定义函数
    proxy: {}, // 代理功能，实际由http-proxy-middleware提供
    setupMiddlewares: (middlewares, devServer) => {} // 提供执行自定义函数和自定义中间件能力 
  },
};
```

proxy代理相关内容，我们之前在[谈一谈前端构建工具的本地代理配置(Webpack与Vite)](https://jzplp.github.io/2025/web-proxy.html)中描述过。其余的选项大多是使用命令行不方便配置的，例如函数，对象或者数组等。

### Node.js的API形式
webpack-dev-serve也支持Node.js的API形式使用。

```js
const Webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const webpackConfig = require('../webpack.config.js');

const compiler = Webpack(webpackConfig);
const server = new WebpackDevServer(webpackConfig.devServer || {}, compiler);

const runServer = async () => {
  await server.start();
  console.log('服务已启动');
};
runServer();
```

使用这种形式，devServer参数必须手动传给WebpackDevServer，否则无效。start方法可以await，服务启动后resolve。webpack-dev-serve还有几种启动和结束方式：

```js
const Webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const webpackConfig = require('../webpack.config.js');

const compiler = Webpack(webpackConfig);
const server = new WebpackDevServer(webpackConfig.devServer || {}, compiler);

// startCallback 启动后触发回调
server.startCallback(() => {
  console.log('服务已启动');
});

const stopServer = async () => {
  // 结束服务
  await server.stop();
  console.log('服务已结束');
};
setTimeout(stopServer, 5000);

const stopServer = () => {
  // 回调方式结束服务
  server.stopCallback(() => {
    console.log('服务已结束');
  });
}
setTimeout(stopServer, 5000);
```

### static静态目录
statc相关配置的作用是，在除了打包生成的文件之外，额外提供一个静态资源目录。webpack-dev-server会将这个目录挂到服务上，使得开发模式下可以访问到这些静态资源。默认目录是public。假设我们在里面放置一个图片 public/1.png，然在src/index.js中，以url的方式使用，我们启动开发服务，可以发现图片可以被正常请求和展示：

```js
// src/index.js 其它代码省略
const img = document.createElement("img");
img.src = "/1.png";
document.body.appendChild(div);
```

通过配置可以修改静态资源的目录：

```js
// webpack.config.js 其它代码省略
module.exports = {
  devServer: {
    static: { directory: path.join(__dirname, 'assets'), },
  },
};
```

不管使用public还是其它目录，这个目录本身都不用在url中体现，相当于直接挂在url的根目录上。但如果不希望挂在根目录，可以使用publicPath配置，是静态资源目录有一个固定前缀。

```js
// webpack.config.js 其它代码省略
module.exports = {
  devServer: {
    static: {
      publicPath: '/abc/123',
    },
  },
};

// src/index.js 其它代码省略
const img = document.createElement("img");
img.src = "/abc/123/1.png";
document.body.appendChild(div);
```

static还有一个serveIndex参数，启动它之后，当静态资源该文件夹内不存在index.html文件时，使用url访问对应的目录，即可在浏览器中展示对应的文件列表。


```js
// webpack.config.js 其它代码省略
module.exports = {
  devServer: {
    static: {
      directory: path.join(__dirname, 'src'),
      publicPath: '/src',
      serveIndex: true,
    },
  },
};
```

例如上面将src设为了静态资源目录，挂在/src上面。当我们访问`http://localhost:8080/src/`时，如果不开启serveIndex，访问会404（是目录且找不到index.html）。如果打开serveIndex，则会发现浏览上展示了src目录中的文件，且点击文件后可以在浏览器上查看文件内容。这时候源代码被当作文本在浏览器中展示了。

### overlay错误提示遮罩
当我们打包的代码有编译错误或者运行时错误时，webpack-dev-server会在浏览器上展示一个全屏遮罩，提示我们报错内容。例如这里我们主动引发一个编译错误：

```js
// src/index.js 其它代码省略
a + 1 = 2;
```

​![](/2026/dev-1.png)

遮罩右上角有关闭按钮，关闭后依然可以查看页面（可能是残缺不全的）。如果是运行时错误，上面的文字会变成“Uncaught runtime errors:”。但是由于Webpack本身的Bug，页面初始化时候的运行时错误遮罩可能会一闪而过，用户根本看不到。因此我们定时稍后展示，才能看到遮罩：

```js
// src/index.js 其它代码省略
a + 1 // 引发运行时错误，但可能看不到 
setTimeout(() => {a + 1}, 1000); // 一秒后引发运行时错误，可以看到
```

Webpack配置也可以修改遮罩的展示，甚至警告时也能产生遮罩。

```js
// webpack.config.js 其它代码省略
module.exports = {
  devServer: {
    client: {
      overlay: {
        errors: true, // 编译错误遮罩
        warnings: false, // 编译告警遮罩
        runtimeErrors: true, // 运行时错误遮罩
      },
    },
  },
};
```

### liveReload和WebSocket
之前我们使用观察模式watch时，虽然代码更新后会自动打包，但我们需要手动刷新浏览器，才能看到最新生成的文件效果。使用webpack-dev-server，我们就不需要手动刷新了，使用liveReload配置，可以在编译完成后自动刷新浏览器页面。liveReload是默认开启的，但可能被HMR功能阻碍，因此我们需要关闭hot配置：

```js
// webpack.config.js 其它代码省略
module.exports = {
  devServer: {
    hot: false, // 关闭HMR
    liveReload: true
  },
};
```

然后首先启动服务。在浏览器上访问到页面后，在修改源文件。可以看到打包成功后，页面自动刷新。它是如何做到自动刷新的呢？要知道HTTP协议是一个单向的客户端->服务端协议，无法做到服务器推送客户端数据。webpack-dev-server在浏览器页面与本地服务之间额外创建了一个WebSocket通信，当打包内容更新时，会通知浏览器刷新页面重新请求。（这里打开浏览器Network配置中的Preserve Log, 让页面刷新时保留网络记录）

​![](/2026/dev-2.png)

可以看到前五条记录是浏览器新打开页面的初始化消息。后三条是本地服务告诉浏览器，已经重新打包并有有变更，请刷新页面。注意刷新页面后WebSocket会重新链接，因此可以看到左下角又有了新的ws通信。

WebSocket在webpack-dev-server中的作用不止于此，像是HMR, live-reload, 编译错误/告警通知浏览器展示遮罩等，都是通过WebSocket实现的。

还要注意到，WebSocket，遮罩等功能需要依赖浏览器端代码来实现，但是我们的源码中是肯定没有这些内容的。因此，webpack-dev-server会在我们的代码中注入一些JavaScript脚本，实现这些功能。可以观察一下`http://localhost:8080/index.js`等请求的返回，比我们自己源码代码多了很多内容。如果希望关闭注入的脚本，可以使用--no-client配置。

## HMR
HMR的全程叫做Hot Module Replacement，即模块热替换/热更新。利用这个技术，可以在页面运行时，只替换改动所在模块的代码，不需要刷新整个页面，就能看到更新后的效果。

### HMR初步
虽然HMR默认在webpack-dev-server中开启，但为了演示功能和避免冲突，还是需要修改webpack.config.js:

```js
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");

module.exports = {
  mode: "development", // 开发模式
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
        use: ["style-loader", "css-loader"], // 换成style-loader
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: "jzplp-test",
    }),
    // new MiniCssExtractPlugin(), // 此插件不支持HMR
  ],
  devServer: {
    hot: true, // 开启HMR
    liveReload: false,
  },
  optimization: {
    runtimeChunk: "single", // HMR运行时单独chunk
  },
};
```

* 因为HMR是开发模式专用，且其它配置也有区别，因此专设开发模式下的配置
* MiniCssExtractPlugin这个插件只能在生产模式使用，因此开发模式配置去掉，改用style-loader
* webpack-dev-server会注入到生成代码一些支持HMR的代码，这叫做HMR运行时(runtime)。
* 多入口(entry)的工程，默认会在每个入口代码中都返回运行时，但这会产生成冲突导致HMR时报错。因此将HMR运行时放到单独的chunk内引入，这样浏览器中只有一份运行时代码

​![](/2026/dev-3.png)

这时候与逆行 npm run start，查看浏览器，发现有个单独的runtime.js请求，表示HMR运行时代码。WebSocket表示当前运行在hot模式，如上图。这时候我们修改src/index.js中的代码，却发现依然刷新了页面。如下图所示，WebSocket收到了更新页面的请求，也拿到了更新文件的hot-update相关文件，但是再往后可以看到依然重新请求了页面，重建了WebSocket链接。

​![](/2026/dev-4.png)

虽然我们开启了HMR模式，但是源码中并没有配套的HMR处理代码，因此webpack-dev-server还是回退到自动刷新页面的状态（即使liveReload被设置为false）。这里我们修改src/index.js，适配HMR处理代码：

```js
import "./index.css";
import { abc } from "./index.module.css";
import data from "./index.xml";

function genEle(test, className) {
  const div = document.createElement("div");
  div.className = className;
  div.textContent = test;
  document.body.appendChild(div);
}

genEle("jzplp1111111", "qaz1");
genEle("jzplp2", abc);

module?.hot?.accept();
```

代码中执行了一个module.hot.accept方法，它的作用时当这个文件代码改动时，重新执行这个模块本身的代码。我们重启工程，访问浏览器。然后改动代码，看下效果：

​![](/2026/dev-5.png)

可以看到这时候页面没有刷新，仅凭hot-update相关请求，就实现了代码的更新和应用。但我们看浏览器上代码的执行效果，发现代码是被重新执行了，但代码变更前的执行效果没有消失，后面又叠加了src/index.js新的执行结果，这很显然不正确。因此我们执行新代码时，要清理掉之前代码的执行结果：

```js
import "./index.css";
import { abc } from "./index.module.css";
import data from "./index.xml";

function genEle(test, className) {
  const div = document.createElement("div");
  div.className = className;
  div.textContent = test;
  document.body.prepend(div);
  return div;
}

const div2 = genEle("jzplp2", abc);
const div1 = genEle("jzplp1111111", "qaz1");

module?.hot?.dispose(() => {
  div1.remove();
  div2.remove();
});
module?.hot?.accept();
```

这次增加了dispose方法，它的作用是在当前模块被替换时，可以执行一些清理的操作。这里我们把旧的两个div从body中删除掉。然后更新代码，重新生成div挂在body上。注意为了使得更新代码前后元素位置不变，这里改了两个div的生成顺序，以及appendChild改成了prepend方法。因此可以看到，清理操作有时候并不是一个简单的事情。修改后正确的浏览器效果如下，可以看到不仅没有刷新页面，且仅修改的文本内容变化，其余效果任何改动。

​![](/2026/dev-6.png)

### hot-update请求和模块操作
首先为了后面多文件改动的例子可以正常演示，首先需要增加监听文件改动的延迟时间，这个多个文件的变化可以合并到一次打包中。

```js
// webpack.config.js 其它代码省略
module.exports = {
  watchOptions: {
    aggregateTimeout: 4000,
  },
};
```

然后将src/another.js也改写成支持HMR的代码形式，但是忽略HTML元素展示的前后顺序问题。

```js
function genEle(test, className) {
  const div = document.createElement("div");
  div.className = className;
  div.textContent = test;
  document.body.appendChild(div);
  return div;
}
const div1 = genEle("jzplp3", "qaz");

module?.hot?.dispose(() => {
  div1.remove();
});
module?.hot?.accept();
```

前面我们体验了HMR的能力，好奇HMR是如何更新代码的呢？答案就是使用hot-update相关文件。当本地服务通过WebSocket向浏览器发送更新请求后，浏览器会首先获取xxx.runtime.xxx.hot-update.json文件，一般一个项目只请求一次。这里面存放了有改动的chunk文件列表。我们在启动后修改src/another.js中的字符串，且将src/index.js中的`import "./index.css"`删除，对应的hot-update.json文件内容如图，可以看到JSON数据中一共有三个数组。这个JSON数据也被叫做更新清单manifest。

​![](/2026/dev-7.png)

* c 发生变更的chunk列表
* r 需要移除的chunk列表
* m 需要移除的module列表

c对应着应该重新请求的chunk数据，因此c中的每个元素对应后面的一个xxx.hot-update.js文件请求。r对应着需要在客户段删除的对应chunk文件代码。我们观察index.xxx.hot-update.js，发现里面就是我们变更的index.js打包后代码，以及一些Webpack运行时相关代码：

​![](/2026/dev-8.png)

但是注意，这里面仅有src/index.js这个模块的代码，并不是这个chunk的所有代码。像我们前面删除的src/index.css，它就没有。因此才需要m这个单独的module列表表示需要移除的模块。从这里可以看到，HMR是以模块作为单位来更新代码的。我们再举一个例子，这里同时修改src/index.js和src/index.xml两个模块，再观察现象。

​![](/2026/dev-9.png)

这里我们看index.xxx.hot-update.js，发现虽然是一个chunk中同时更新了两个文件，但这两个文件的更新却是分开的，运行时代码中明显的列出了源文件名称。从前面的删除例子和这里的更新例子可以总结如下：

1. HMR获取更新数据的请求是以chunk维度获取的，一个chunk对应一个xxx.hot-update.js。
2. 这个js文件中提供的并不是chunk的所有代码，而是chunk中有更新的module。没有变更的模块这里并不会包含。
3. 被移除的module肯定也不会包含到这个js文件中（被移除了所以无法表示），因此需要一个独立的m列表来表示。
4. HMR实际以module维度来更新代码。

观察一下HTML本身请求的`http://localhost:8080/index.js`内容，发现代码本身就是以module维度分割组织的，因此HMR以模块维度更新代码也是顺理成章。但要注意这仅仅是开发模式，生产模式生成这种繁琐的代码既无用，也会拖累性能。

### accept方法和模块冒泡
在前面HMR的代码示例中，accept方法，阻止了更新页面刷新，成功的触发了页面HMR。accept方不仅能更新自身，还可以更新子模块，它使用一种叫做模块冒泡的机制处理，从子到父再到祖父模块向上冒泡，有点像DOM的事件处理机制：

```ts
// 处理本模块自身更新
module.hot.accept(errorHandler: () => {})
// 处理子模块更新 注意只能是直接子模块，不能是间接的
module.hot.accept(dependencies: string | Array<string>, callback: () =>{}, errorHandler: () => {})
/* 
  dependencies 子模块名称，可以是列表
  callback 模块更新后触发函数
  errorHandler 模块更新后异常时触发
*/
```

accept冒泡的逻辑是：当更新的模块存在accept函数时，就认为已经接收了更新并处理完成，模块更新就不会冒泡到父模块。如果子模块本身没有accept函数，那么就冒泡到父模块。父模块如果存在accept函数，可以是父模块处理自身更新，也可以是处理子模块更新，且匹配了这个子模块，这样父模块就将子模块的更新处理掉了。如果父模块没有处理掉，会再冒泡到祖父模块，就这样一直到根模块。也就时打包入口。下面我们构造一个例子来看一下，首先是模块树：

```
├── src/index.js          (根模块，打包入口1)
│   ├── src/index.module.css
│   ├── src/index.xml
│   └── src/index2.js     (新增文件)
└── src/another.js        (根模块，打包入口2)
```

其中新增文件和有改动的文件内容如下：

```js
// src/index.js
import { abc } from "./index.module.css";
import data from "./index.xml";
import './index2';

function genEle(test, className) {
  const div = document.createElement("div");
  div.className = className;
  div.textContent = test;
  document.body.prepend(div);
  return div;
}
const div2 = genEle("jzplp 1", abc);
const div1 = genEle("jzplp 2", "qaz1");

console.log('index.js run');

module?.hot?.dispose(() => {
  div1.remove();
  div2.remove();
  console.log('index.js dispose');
});

// src/index2.js
function genEle(test, className) {
  const div = document.createElement("div");
  div.className = className;
  div.textContent = test;
  document.body.prepend(div);
  return div;
}
const div1 = genEle("jzplp 3", "");

console.log('index2.js run');

module?.hot?.dispose(() => {
  div1.remove();
  console.log('index2.js dispose');
});
```

每个代码文件中都带有一句`console.log('xxx.js run')`，当文件重新执行时，就会触发输出。上面两个文件都没有accept方法，将在后续的例子中添加在不同的位置，触发不同的场景观察现象。后面都忽略服务启动时的输出。首先将自身accept方法添加到父模块中。然后启动服务，尝试几个例子。

```js
// src/index.js 文件 其余内容省略
module?.hot?.accept();

/* 1. src/index.js改动后输出
index.js dispose
index.js run
*/

/* 2. src/index2.js改动后输出
index.js dispose
index2.js dispose
index2.js run
index.js run
*/
```

当src/index.js（父模块）改动后，只有父模块本身被重新执行了，未改动的src/index2.js（子模块）没有被重新执行。这说明，父模块的重新执行不会传染给子模块。src/index2.js（子模块）改动后，因为子模块没有处理更新，所以向上冒泡到了src/index.js（父模块）。父模块有处理模块自身的更新，因此父模块+改动的子模块一起被重新执行了。再试试其它场景：

```js
// src/index2.js 文件 其余内容省略
module?.hot?.accept();

/* 1. src/index.js改动后输出
页面被刷新
*/

/* 2. src/index2.js改动后输出
index2.js dispose
index2.js run
*/
```

src/index.js本身就是入口文件，它自身没有accept处理模块更新，它上面也没有父模块了。在无法处理更新的情况下，页面被刷新。src/index2.js（子模块）改动后，它自身就有处理更新的accept调用，因此仅子模块本身更新，父模块没有触发任何操作。再试试其它场景：

```js
// src/index.js 文件 其余内容省略
module?.hot?.accept('./index2.js', () => {
  console.log('accept');
});

/* 1. src/index.js改动后输出
页面被刷新
*/

/* 2. src/index2.js改动后输出
index2.js dispose
index2.js run
accept
*/
```

在父模块中，可以接收子模块的更新，使用方式为accept方法的第一个参数为字符串或者数组。子模块只能是直接引用关系的子模块，子模块的写法和import的路径一致。当子模块触发更新时，子模块会被更新，accept第二个参数的回调函数被触发，但是父模块本身不受影响。同时父模块本身由于没有处理更新的方法，因此自身改动后就被刷新了。注意父模块accept子模块的更新，是有调函数可以触发的，但是处理自身更新时，就没有回调函数供触发。

### 状态和模块API
HMR过程中有多个状态，这些状态表示当前模块更新的阶段。获取和监听方法以及状态表列举如下：

```js
// 获取当前状态
module.hot.status()
// 监听当前状态变化并输出
module.hot.addStatusHandler((status) => {
  console.log(status);
});
```

| 状态名 | 当前阶段 | 备注 |
| - | - | - |
| idle | 空闲等待更新 | - |
| check | 向服务发请求获取更新清单 | - |
| prepare | 下载变更的模块代码 | - |
| ready | 下载完成，但还没实际更新 | 可能被跳过 |
| dispose | 触发dispose回调，清理旧代码资源 | - |
| apply | 调用accept方法，正在执行更新 | - |
| abort | 更新被中止或者放弃 | - |
| fail | 更新失败 | - |

然后再介绍一下HMR的API方法。前面主要接触过accept方法，它可以接受自己更新，或者接受子模块更新。HMR的API中的decline方法，也是类似的逻辑：

```ts
// 拒绝本模块自身更新
module.hot.decline()
// 拒绝子模块更新
module.hot.decline(dependencies: string | Array<string>)
```

这里“拒绝更新”的意思时，如果模块更新冒泡到触发decline，则停止冒泡，直接导致页面整个刷新。如果父模块调用decline，但子模块本身已经触发accept，更新不会冒泡到父模块，不会导致页面刷新。

然后再介绍dispose方法，这个方法前面提到过，是在当前模块更新前触发回调函数，可以清理就代码的资源。实际上它还可以提供数据，供新的模块调用。这里我们在src/index2.js中试一下：

```js
function genEle(test, className) {
  const div = document.createElement("div");
  div.className = className;
  div.textContent = test;
  document.body.prepend(div);
  return div;
}
const div1 = genEle("jzplp 3", "");

console.log("index2.js run");
console.log("data", module?.hot?.data);

module?.hot?.dispose((data) => {
  console.log("index2.js dispose");
  data.abc = 123;
});
module?.hot?.accept();

/* 浏览器Console输出 修改代码前+修改代码后
index2.js run
data undefined
[webpack-dev-server] App updated. Recompiling...
[webpack-dev-server] App hot update...
[HMR] Checking for updates on the server...
index2.js dispose
index2.js run
data {abc: 123}
*/
```

可以看到，当修改代码前，尝试获取module?.hot?.data为undefined。在dispose方法的入参中修改data，这个data的值可以在代码更新后被取到。通过这种方式可以做到前后代码的数据沟通，避免一些应该保留的状态被销毁。

再介绍一下invalidate方法，它类似于Webpack的watch模式中的invalidate方法，会触发一次HMR更新，但他在不同的HMR状态下触发，表现并不一致：

| 状态名 | 触发效果 |
| - | - |
| idle | 发起新的HMR更新 |
| check | 检查更新，如果有则与invalidate合并为一次更新，如果没有则自己发起新的HMR更新 |
| prepare, ready | 此时HMR已经在准备更新了， 因此invalidate合并为一次同更新 |
| dispose, apply | 更新已经在进行中，无法合并，因此等更新完成后再出触发一次更新 |

```js
// src/index2.js 文件 其余内容省略
module?.hot?.dispose((data) => {
  console.log("index2.js dispose");
  module.hot.invalidate();
});
module?.hot?.accept();

/* src/index2.js改动后输出
index2.js dispose
index2.js run
index2.js dispose
index2.js run
index2.js dispose
index2.js run
...无限输出
*/ 
```

这里我们在dispose中触发invalidate，按照上面的说明，当我们修改后，会先触发一次正常更新，再触发一次invalidate更新。但实际上会触发无限更新，直到浏览器卡死。这是因为每次invalidate触发更新后，都会再触发一次dispose，这时候就会再触发一次invalidate，因此变成了无限更新。这时候就需要用到我们前面提到的data数据来控制。如下面例子，就只触发两次更新了。

```js
// src/index2.js 文件 其余内容省略
module?.hot?.dispose((data) => {
  console.log("index2.js dispose");
  if (!module?.hot?.data?.hasInvalidate) module.hot.invalidate();
  data.hasInvalidate = true;
});
module?.hot?.accept();

/* src/index2.js改动后输出
index2.js dispose
index2.js run
index2.js dispose
index2.js run
*/ 
```

还有一些模块相关的API，这里列举一下。其中check和apply方法一般是自己实现HMR更新策略时使用的：

```js
module.hot.check() // 向服务端发送hot-update请求，看是否有更新
module.hot.apply() // 应用更新
module.hot.removeStatusHandler(callback) // 移除addStatusHandler注册的回调函数
module.hot.removeDisposeHandler(callback) // 移除dispose 注册的回调函数
```

### HMR流程简述

### 部分流程讨论？

webpack-dev-server的HMR功能

## webpack-hot-middleware

webpack-dev-middleware有HMR功能



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
- Webpack 模块热替换 配置示例\
  https://webpack.docschina.org/guides/hot-module-replacement/
- Webpack 模块热替换(hot module replacement) 概念\
  https://webpack.docschina.org/concepts/hot-module-replacement/
- Webpack Hot Module Replacement 模块 API\
  https://webpack.docschina.org/api/hot-module-replacement/
- webpack-dev-server GitHub\
  https://github.com/webpack/webpack-dev-server
- webpack-dev-middleware GitHub\
  https://github.com/webpack/webpack-dev-middleware
- Webpack DevServer\
  https://webpack.docschina.org/configuration/dev-server/
- Webpack Node接口\
  https://webpack.docschina.org/api/node/
- Webpack compiler钩子\
  https://webpack.docschina.org/api/compiler-hooks/
- Webpack compilation钩子\
  https://webpack.docschina.org/api/compilation-hooks/
- Webpack webpack-dev-server API\
  https://webpack.docschina.org/api/webpack-dev-server/
- 谈一谈前端构建工具的本地代理配置(Webpack与Vite)\
  https://jzplp.github.io/2025/web-proxy.html
- webpack-hot-middleware GitHub\
  https://github.com/webpack/webpack-hot-middleware
