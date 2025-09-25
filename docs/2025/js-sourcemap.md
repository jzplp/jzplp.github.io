# SourceMap（未完成）

## SourceMap简介
### 什么是SourceMap
SourceMap，中文名叫“源映射”。在前端开发中，打包后的文件中除了我们写的代码与npm包的代码之外，经常还会出现一个后缀名为.map的文件。这就是SourceMap文件，也是我们今天要讲的主题。

我们写的代码一般并不直接作为成果提供，而且使用各类框架后，大多数代码也没办法直接在浏览器运行。代码通常需要经过转义，打包，压缩，混淆等操作，最后作为成果提供。但这时候生成的代码与我们写的代码相比，已经面目全非了（尤其是代码量很多的项目）。如果这时候代码在运行中报错，我们很难找到错误原因，以及原来代码中的位置。

因此，很多前端工具在修改完代码后，会生成一个SourceMap文件，这个文件中记录了我们写的源代码和生成代码中标识符(主要包含变量名，属性名等)的文件位置对应关系。有了这个关系之后，当代码出错时，浏览器或者其它工具可以将出错位置定位到源代码的具体位置上，方便排查运行时问题。如果没有这个文件，则只能定位到生成代码的位置。例如这是经过压缩后的部分jQuery代码，在这种生成代码中排查问题太难了。

![图片](/2025/sourcemap-1.png)

### SourceMap的历史
历史内容基本来源于网络。其中部分描述现在可能还不太了解，别担心，我们在后面会逐渐介绍。

* 在2009年时，Google推出了一个JavaScript代码压缩工具Cloure Compiler。在推出时，还附带了一个浏览器调试插件Closure Inspector，方便调试生成的代码。这个工具就是SourceMap的雏形。（第一版）
* 在2010年时，Closure Compiler Source Map 2.0中，SourceMap确定了统一的JSON格式，使用Base64编码等，这时候的SourceMap已经基本成型。（第二版）
* 在2011年，Source Map Revision 3 Proposal中，此时SourceMap已经脱离了Closure Compiler，成为了独立的工具。这一代使用Base64 VLQ编码，压缩了文件体积。这是第三版，也是现在广泛流行的，作为标准使用的版本。

这三个版本的map文件文件体积逐渐缩小，但即使是第三版，也要比源文件更大。SourceMap一开始作为一款Cloure Compiler的辅助小工具诞生，最后却被当作标准广泛应用，名气比Cloure Compiler本身要大的多。

## 转换代码工具生成SourceMap
JavaScript中有非常多转换代码的工具，这些工具大多数在转换代码的同时，都提供了SourceMap生成功能。这里我们选择两个来介绍一下。首先构造一下要被转换的源代码：

```js
const globaljz = 123;
function fun() {
  const jzplp1 = "a" + "b";
  const jzplp2 = 12345;
  const jzplp3 = { jz1: 1, jz2: 1221 };
  try {
    jzplp1();
  } catch (e) {
    console.log(e);
    throw e;
  }
  console.log(jzplp1, jzplp2, jzplp3);
}
fun();
```

### Babel生成SourceMap
Babel是一个JavaScript编译器，主要作用是将新版本的ECMAScript代码转换为兼容的旧版本JavaScript代码，之前我们有文章介绍过：[解锁Babel核心功能：从转义语法到插件开发](https://jzplp.github.io/2025/babel-intro.html)。Babel也带有生成SourceMap的功能，首先配置babel.config.json：

```json
{
  "presets": [
    [
      "@babel/preset-env",
      {
        "targets": {
          "edge": "17",
          "firefox": "60",
          "chrome": "67",
          "safari": "11.1"
        }
      }
    ]
  ],
  "sourceMaps": true
}
```

presets中是代码转义配置，`"sourceMaps": true`是生成独立文件的SourceMap。执行命令行`babel src/index.js --out-file dist.js`转义代码后，我们看一下生成结果。首先是生成的代码dist.js：

```js
"use strict";

var globaljz = 123;
function fun() {
  var jzplp1 = "a" + "b";
  var jzplp2 = 12345;
  var jzplp3 = {
    jz1: 1,
    jz2: 1221
  };
  try {
    jzplp1();
  } catch (e) {
    console.log(e);
    throw e;
  }
  console.log(jzplp1, jzplp2, jzplp3);
}
fun();

//# sourceMappingURL/*防止报错*/=dist.js.map
```

可以看到不仅行数变化，部分语法也被转义了。代码的最后一行有个注释，指向了SourceMap文件dist.js.map。这是一个JSON文件，我们看一下文件内容：

```json
{
  "version": 3,
  "file": "dist.js",
  "names": [
    "globaljz",
    "fun",
    "jzplp1",
    "jzplp2",
    "jzplp3",
    "jz1",
    "jz2",
    "e",
    "console",
    "log"
  ],
  "sources": [
    "src/index.js"
  ],
  "sourcesContent": [
    "const globaljz = 123;\r\nfunction fun() {\r\n  const jzplp1 = \"a\" + \"b\";\r\n  const jzplp2 = 12345;\r\n  const jzplp3 = { jz1: 1, jz2: 1221 };\r\n  try {\r\n    jzplp1();\r\n  } catch (e) {\r\n    console.log(e);\r\n    throw e;\r\n  }\r\n  console.log(jzplp1, jzplp2, jzplp3);\r\n}\r\nfun();\r\n"
  ],
  "mappings": ";;AAAA,IAAMA,QAAQ,GAAG,GAAG;AACpB,SAASC,GAAGA,CAAA,EAAG;EACb,IAAMC,MAAM,GAAG,GAAG,GAAG,GAAG;EACxB,IAAMC,MAAM,GAAG,KAAK;EACpB,IAAMC,MAAM,GAAG;IAAEC,GAAG,EAAE,CAAC;IAAEC,GAAG,EAAE;EAAK,CAAC;EACpC,IAAI;IACFJ,MAAM,CAAC,CAAC;EACV,CAAC,CAAC,OAAOK,CAAC,EAAE;IACVC,OAAO,CAACC,GAAG,CAACF,CAAC,CAAC;IACd,MAAMA,CAAC;EACT;EACAC,OAAO,CAACC,GAAG,CAACP,MAAM,EAAEC,MAAM,EAAEC,MAAM,CAAC;AACrC;AACAH,GAAG,CAAC,CAAC",
  "ignoreList": []
}
```

同时Babel还支持将SourceMap与生成代码放到同一个文件中，需要设置`"sourceMaps": "inline"`。我们看一下生成结果：

```js
"use strict";

var globaljz = 123;
function fun() {
  var jzplp1 = "a" + "b";
  var jzplp2 = 12345;
  var jzplp3 = {
    jz1: 1,
    jz2: 1221
  };
  try {
    jzplp1();
  } catch (e) {
    console.log(e);
    throw e;
  }
  console.log(jzplp1, jzplp2, jzplp3);
}
fun();
//# sourceMappingURL/*防止报错*/=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJnbG9iYWxqeiIsImZ1biIsImp6cGxwMSIsImp6cGxwMiIsImp6cGxwMyIsImp6MSIsImp6MiIsImUiLCJjb25zb2xlIiwibG9nIl0sInNvdXJjZXMiOlsic3JjL2luZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbImNvbnN0IGdsb2JhbGp6ID0gMTIzO1xyXG5mdW5jdGlvbiBmdW4oKSB7XHJcbiAgY29uc3QganpwbHAxID0gXCJhXCIgKyBcImJcIjtcclxuICBjb25zdCBqenBscDIgPSAxMjM0NTtcclxuICBjb25zdCBqenBscDMgPSB7IGp6MTogMSwganoyOiAxMjIxIH07XHJcbiAgdHJ5IHtcclxuICAgIGp6cGxwMSgpO1xyXG4gIH0gY2F0Y2ggKGUpIHtcclxuICAgIGNvbnNvbGUubG9nKGUpO1xyXG4gICAgdGhyb3cgZTtcclxuICB9XHJcbiAgY29uc29sZS5sb2coanpwbHAxLCBqenBscDIsIGp6cGxwMyk7XHJcbn1cclxuZnVuKCk7XHJcbiJdLCJtYXBwaW5ncyI6Ijs7QUFBQSxJQUFNQSxRQUFRLEdBQUcsR0FBRztBQUNwQixTQUFTQyxHQUFHQSxDQUFBLEVBQUc7RUFDYixJQUFNQyxNQUFNLEdBQUcsR0FBRyxHQUFHLEdBQUc7RUFDeEIsSUFBTUMsTUFBTSxHQUFHLEtBQUs7RUFDcEIsSUFBTUMsTUFBTSxHQUFHO0lBQUVDLEdBQUcsRUFBRSxDQUFDO0lBQUVDLEdBQUcsRUFBRTtFQUFLLENBQUM7RUFDcEMsSUFBSTtJQUNGSixNQUFNLENBQUMsQ0FBQztFQUNWLENBQUMsQ0FBQyxPQUFPSyxDQUFDLEVBQUU7SUFDVkMsT0FBTyxDQUFDQyxHQUFHLENBQUNGLENBQUMsQ0FBQztJQUNkLE1BQU1BLENBQUM7RUFDVDtFQUNBQyxPQUFPLENBQUNDLEdBQUcsQ0FBQ1AsTUFBTSxFQUFFQyxNQUFNLEVBQUVDLE1BQU0sQ0FBQztBQUNyQztBQUNBSCxHQUFHLENBQUMsQ0FBQyIsImlnbm9yZUxpc3QiOltdfQ==
```

文件最后有一行注释，里面是Base64格式的数据，将数据放到浏览器地址栏，解析出数据内容和前面独立文件的sourceMap一致。

### Terser生成SourceMap
Terser是一个代码压缩混淆工具，我们在命令行中执行`terser src/index.js --compress --mangle -o dist.js --source-map url=dist.js.map`命令。其中compress表示代码开启压缩，去掉代码中未被使用和无意义的内容。mangle表示开启混淆，将代码转换为难以阅读的形式。我们看一下生成结果。首先是生成的代码dist.js：

```js
const globaljz=123;function fun(){const o="ab";try{o()}catch(o){throw console.log(o),o}console.log(o,12345,{jz1:1,jz2:1221})}fun();
//# sourceMappingURL/*防止报错*/=dist.js.map
```

可以看到局部变量名都被重新命名了，有些简单的字面量计算如"a" + "b"也直接以结果的形式展现，甚至部分肯定不会被执行到的代码也被删除了。使用代码压缩混淆后，代码的样子和之前相比区别不小。我们再看看生成的sourceMap文件：

```js
{
  "version": 3,
  "names": [
    "globaljz",
    "fun",
    "jzplp1",
    "e",
    "console",
    "log",
    "jz1",
    "jz2"
  ],
  "sources": [
    "src/index.js"
  ],
  "mappings": "AAAA,MAAMA,SAAW,IACjB,SAASC,MACP,MAAMC,EAAS,KAGf,IACEA,GACF,CAAE,MAAOC,GAEP,MADAC,QAAQC,IAAIF,GACNA,CACR,CACAC,QAAQC,IAAIH,EARG,MACA,CAAEI,IAAK,EAAGC,IAAK,MAQhC,CACAN",
  "ignoreList": []
}
```

sourceMap文件形式与Babel的基本一致，都是通用的。

## 浏览器使用SourceMap
上一节的示例代码中故意留了一个错误，而且为了输出栈先捕捉异常再进行抛出。这里以上一节中使用Terser生成的代码为例，描述在Chrome浏览器中如何使用SourceMap。

### 不使用SourceMap
作为对比，首先来看一下不使用SourceMap的现象。执行命令`terser src/index.js --compress --mangle -o dist.js`重新生成代码，但是不包含SourceMap。然后将代码使用HTML包裹，以便浏览器打开：

```html
<html>
  <script src="./dist.js"></script>
</html>
```

![图片](/2025/sourcemap-2.png)

在浏览器中打开调试工具的Console(上图中左侧)，可以看到白底的字是我捕获并打印的错误栈，红底是抛出的错误。错误栈中标明了报错的具体位置：文件名，行号和列号。点击蓝色的位置文字可以跳到右边查看具体的报错代码。红底因为被浏览器解析过了所以没有列号，但是点击蓝字同样可以跳过去。

因为dist文件只有一行，因此可以看到行号都是1。看右边的所有文件目录树中并没有源码文件，定位到的位置是生成代码中的出错位置（红色波浪线和x号的位置）。生成的代码实际只有一行，浏览器在这里美化展示了，但从错误栈的行号上还是能看到只有一行。在复杂代码的情况下。，这样是很难定位到源码出错位置和逻辑的。

### 使用SourceMap
首先打开浏览器的SourceMap开关（默认是打开状态）：

![图片](/2025/sourcemap-3.png)

然后使用前面的Terser工具生成代码与SourceMap：`terser src/index.js --compress --mangle -o dist.js --source-map url=dist.js.map`。然后用HTML包裹，在浏览器中打开，查看Console：

![图片](/2025/sourcemap-4.png)

首先看左边的图中，虽然我们执行的是生成后的dist.js文件，且报错信息给出的变量名并不是我们写的源码，但这里给出的错误栈中的报错文件已经不是dist.js了，而是生成前的源码index.js，行号也不是1了，而是实际源码中的行号。点击蓝色文字切换到右边，可以看到目录树中多了`src/index.js`，这是我们的源码，且精确定位出了我们源码中报错的具体位置。这样排查错误方便多了。

我们切换到目录树中的生成的代码dist.js，下方还可以看到SourceMap已经加载的提示（下方左图）；如果加载失败，那么会有黄色的提示（下方右图）：

![图片](/2025/sourcemap-5.png)

### 后添加SourceMap
假设我们页面访问时没有提供SourceMap，浏览器也支持我们后添加SourceMap进去。这里我们把生成代码中的最后一行注释去掉，模拟没有提供SourceMap的场景。去掉的是这一行：`//# sourceMappingURL/*防止报错*/=dist.js.map`。然后在浏览器运行，如下面作图，此时的报错信息没有经过SourceMap处理。

![图片](/2025/sourcemap-6.png)

我们点击报错文件位置信息到右侧查看dist.js，在空白处点鼠标右键，选择Add source map，可以将SourceMap添加到这个文件上。我们添加之后的的效果如下：

![图片](/2025/sourcemap-7.png)

可以看到文件下方出现SourceMap加载成功的通知，左侧文件目录出现了我们的源码文件。此时回到Console，发现以前产生的报错栈文件位置信息，也已经被修改为SourceMap处理之后的位置了。

这种场景适用于工程构建时生成SourceMap，但并不直接附加到页面上。这种情况下用户无法访问到源代码。当遇到有错误需要排查的场景，再将SourceMap文件附加到浏览器中进行调试，这样兼顾了安全性和可调试性。

### SourceMap浏览器请求
在实际开发中，由于前端工程化工具的广泛应用，SourceMap是非常常用的调试工具。有些同学也会好奇，既然SourceMap是独立的文件，为啥我们在浏览器调试工具中的Network中从来没看到过。这是因为SourceMap相关的请求并不在这里展示，而是在Developer resources这个模块中展示（需要在More tools中将它选中展示）。

![图片](/2025/sourcemap-8.png)

从上图中可以看到，Network中并不展示SourceMap相关请求，而是在下方的Developer resources中出现。而且除了dist.js.map，还有src/index.js，也就是我们的源码文件。这是因为SourceMap中只有对应关系，没有真正的源码，如果希望像前面一样在浏览器中表示具体出错代码，那还是要请求源码文件。

那么这里还有一个疑问，SourceMap会造成额外的资源请求，而且这个文件还挺大（比生成的代码本身更大），那么它是什么时间请求的？会不会造成过多请求浪费服务器资源？从上面的浏览器调试工具中看不出来，我们自己搞个简易的服务试一下。

```js
const http = require("http");
const fs = require("fs");

http
  .createServer((req, res) => {
    try {
      const data = fs.readFileSync("." + req.url);
      console.log(new Date(Date.now()).toLocaleString(), `Url: ${req.url}`);
      res.end(data);
    } catch (e) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not found");
    }
  })
  .listen(8000, () => {
    console.log("server start!");
  });
```

上面的代码启动了一个简单的Node.js服务，当收到请求时，读取本地文件并返回。请求到来时还会输出当前时间，这使我们可以看到浏览器请求SourceMap的时机。我们的操作流程如下：

1. 访问`http://localhost:8000/index.html`。（此时浏览器调试工具未打开）
2. 10秒后，打开浏览器调试工具。
3. 再10秒后，点击错误文件位置信息，查看浏览器中展示的出错源码文件。

![图片](/2025/sourcemap-9.png)

由于人手操作，因此时间并不是那么精确，但已经能得到规律了。即正常访问页面时不请求，只有调试时才请求SourceMap文件。这样不会因此SourceMap造成服务器请求过多，也不会阻碍调试。

* 正常访问页面的时候，只请求页面相关的内容，不请求SourceMap文件。
* 浏览器调试工具的时候，浏览器会发送SourceMap文件请求。
* 当在浏览器中查看对应错误源码时，浏览器会发送源码文件请求。

## SourceMap文件内容
前面我们介绍了如何使用哪些转换代码的工具来生成SourcaMap，还列出了用Babel与Terser生成的SourceMap，是一个JSON文件。这里介绍一下文件内容：

| 字段名 | 类型 | 示例值 | 含义描述 |
| - | - | - | - |
| version | number | 3 | SourcaMap版本号 |
| file | string | "dist.js" | 转换后代码的文件名 |
| sources | `Array<string>` | ["index1.js", "index2.js"] | 转换前代码的文件名，多个文件可以包含在一个转换后文件内，因此是一个数组 |
| names | `Array<string>` | ["a", "jzplp1"] | 转换前代码中的变量和属性名 |
| mappings | string | ";;AAAA,IAAMA" | 转换前后代码中的变量和属性名 |
| sourcesContent  | `Array<string>` | ["const a = 1"] | 转换前代码的文件内容 |
| sourceRoot  | string | "src" | 转换前代码的文件所在的目录，如果和转换后代码一致则省略 |

其中版本号我们在前面介绍SourceMap历史的时候介绍过，现在使用的都是第三版。mappings中保存着最核心的转换关系。

转换前代码的文件名sources是个数组，这是因为可以将多个文件打包到一个转换后文件中，因此来源可能有多个(多对一)。那有人会问：有没有一个转换前文件被多个转换后文件打包的情况(一对多)？有的。这种情况每个转换后文件中都有同一个转换前文件。sourcesContent中是对应转换前文件的源码，可以省略。关于这些字段具体起到的作用，在以后描述SourceMap原理的时候再详细说。

## SourceMap生成工具使用

## Webpack中的SourceMap选项

## SourceMap生成原理

## 实际从生成到解析的例子

最后用一个简单的例子实际生成SourceMap到解析SourceMap

## source-map-visualization

## 参考
- sourcemap这么讲，我彻底理解了\
  https://juejin.cn/post/7199895323187347514
- JavaScript Source Map 详解\
  https://www.ruanyifeng.com/blog/2013/01/javascript_source_map.html
- 万字长文：关于sourcemap，这篇文章就够了\
  https://juejin.cn/post/6969748500938489892
- Source Map Github\
  https://github.com/mozilla/source-map
- HTTP标头 SourceMap MDN\
  https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Reference/Headers/SourceMap
- terser Github\
  https://github.com/terser/terser
- node-source-map-support Github\
  https://github.com/evanw/node-source-map-support
- SourceMap详解\
  https://juejin.cn/post/6948951662144782366
- 深入浅出之 Source Map\
  https://juejin.cn/post/7023537118454480904
- 绝了，没想到一个 source map 居然涉及到那么多知识盲区\
  https://juejin.cn/post/6963076475020902436
- Terser 文档\
  https://terser.org/
- Closure Compiler Source Map 2.0\
  https://docs.google.com/document/d/1xi12LrcqjqIHTtZzrzZKmQ3lbTv9mKrN076UB-j3UZQ
- Source Map Revision 3 Proposal\
  https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k
- Babel 文档\
  https://babeljs.io/
- 解锁Babel核心功能：从转义语法到插件开发\
  https://jzplp.github.io/2025/babel-intro.html
- Terser 中文文档\
  https://terser.nodejs.cn/
