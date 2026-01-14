# core-js与Polyfill（未完成）

## 简介
在之前我介绍过Babel：[解锁Babel核心功能：从转义语法到插件开发](https://jzplp.github.io/2025/babel-intro.html)，Babel是一个使用AST转义JavaScript语法，提高代码在浏览器兼容性的工具。但有些ECMAScript并不是新的语法，而是一些新对象，新方法等等，这些并不能使用AST抽象语法树来转义。因此Babel利用core-js实现这些代码的兼容性。

core-js是一个知名的前端工具库，里面包含了ECMAScript标准中提供的新对象/新方法等，而且是使用旧版本支持的语法来实现这些新的API。这样，即使浏览器的没有实现标准中的新API，也能通过注入core-js代码来提供对应的功能。

像这种通过注入代码实现浏览器没有提供的API特性，叫做Polyfill。这个单词的本意是填充材料，在JavaScript领域中，这些注入的代码就类似“填充材料”一样，帮助我们提高代码的兼容性。另外core-js还提供了一些还在提议的API的实现，

## core-js使用方式
### 使用前后对比
要想看到core-js使用前后的效果对比，首先需要到某个语法和对应的执行环境，在这个环境中对应的语法不存在。我本地是Node.js v18.19.1版本，这个版本并没有实现Promise.try这个方法，因此我们就用这个方法进行实验。首先是没有引入core-js的场景：

```js
Promise.try(() => {
  console.log('jzplp!')
})

/* 执行结果
Promise.try(() => {
           ^
TypeError: Promise.try is not a function
*/
```

可以看到，我们没有引入core-js时，直接使用Promise.try时，会因为没有该方法而报错。然后再试试引入core-js的效果：

```js
require('core-js')
Promise.try(() => {
  console.log('jzplp!')
})

/* 输出结果
jzplp!
*/
```

可以看到引入core-js后，原本不存在的API被填充了，我们的代码可以正常执行并拿到结果了。这就是core-js提高兼容性的效果。

### 单个API引入
core-js不仅可以直接引入全部语法， 还可以针对仅引入单个API，比如某个对象或某个方法。首先看下只引入Promise对象：

```js
// require('core-js/full') 等于 require('core-js')
require('core-js/full/promise')
Promise.try(() => {
  console.log('jzplp!')
})

/* 输出结果
jzplp!
*/
```

然后再看下直接引入对象中的某个方法：

```js
require('core-js/full/promise/try')
Promise.try(() => {
  console.log('jzplp!')
})

/* 输出结果
jzplp!
*/
```

### 不注入全局对象
前面展示的场景，core-js都是将API直接注入到全局，这样我们使用这些API就如环境本身支持一样，基本感受不到区别。但如果我们不希望直接注入到全局时，core-js也给我们提供了使用方式：

```js
const promise = require('core-js-pure/full/promise');
promise.try(() => {
  console.log('jzplp!')
})
Promise.try(() => {
  console.log('jzplp!2')
})
/* 输出结果
jzplp!
Promise.try(() => {
           ^
TypeError: Promise.try is not a function
*/
```

可以看到，使用core-js-pure这个包之后，可以直接导出我们希望要的API，而不直接注入到全局。此时直接使用全局对象方法依然报错。而core-js这个包虽然也能导出，但它还是会直接注入全局，我们看下例子：

```js
const promise = require('core-js/full/promise');
promise.try(() => {
  console.log('jzplp!')
})
Promise.try(() => {
  console.log('jzplp!2')
})

/* 输出结果
jzplp!
jzplp!2
*/
```

因此，如果希望仅使用导出对象，还是需要使用core-js-pure这个包。core-js-pure也可以仅导出对象方法：

```js
const try2 = require("core-js-pure/full/promise/try");
Promise.try = try2;
Promise.try(() => {
  console.log("jzplp!");
});

/* 输出结果
jzplp!
*/
```

因为导出的对象方法不能独立使用，因此在例子中我们还是将其注入到Promise对象后使用。

### 特性分类引入
core-js中包含的非常多API特性的兼容代码，有些是已经稳定的特性，有些是还处在提议阶段的，不稳定的特性。我们直接引入core-js会把这些特殊性全部引入，但如果不需要那些不稳定特性，core-js也提供了多种引入方式：

* core-js 引入所有特性，包括早期的提议
* core-js/full 等于引入core-js
* core-js/actual 包含稳定的ES和Web标准特性，以及stage3的特性
* core-js/stable 包含稳定的ES和Web标准特性
* core-js/es 包含稳定的ES特性

这里我们举两个例子尝试下。首先由于ECMAScript标准一直在更新中，有些特性现在是提议，未来可能就已经被列入正式特性了。因此这里的例子需要明确环境和core-js版本。这里我们使用Node.js v18.19.1和core-js@3.47.0版本，以写这篇文章的时间为准。

首先第一个特性是：数组的lastIndex属性，这是一个stage1阶段的API，这里针对不同的引入方式进行尝试：

```js
// 不引入core-js尝试
const arr = ["jz", "plp"];
console.log(arr.lastIndex);
/* 输出结果
undefined
*/

// 引入core-js/full
require("core-js/full");
const arr = ["jz", "plp"];
console.log(arr.lastIndex);
/* 输出结果
1
*/

// 引入core-js/actual
require("core-js/actual");
const arr = ["jz", "plp"];
console.log(arr.lastIndex);

/* 输出结果
undefined
*/
```

首先当不引入core-js时，因为不支持这个API，所以输出undefined。core-js/full支持stage1阶段的API，可以正确输出结果。但core-js/actual仅支持stage3阶段的API，因此还是不支持这个API。

然后我们再看下另外一个API，数组的groupBy方法。这是一个stage3阶段的API：

```js
// 不引入core-js尝试
const arr = [
  { group: 1, value: "jz" },
  { group: 2, value: "jz2" },
  { group: 1, value: "plp" },
];
const arrNew = arr.groupBy(item => item.group);
console.log(arrNew)
/* 输出结果
const arrNew = arr.groupBy(item => item.group);
                   ^
TypeError: arr.groupBy is not a function
*/

// 引入core-js/actual
require("core-js/actual");
const arr = [
  { group: 1, value: "jz" },
  { group: 2, value: "jz2" },
  { group: 1, value: "plp" },
];
const arrNew = arr.groupBy(item => item.group);
console.log(arrNew)
/* 输出结果
[Object: null prototype] {
  '1': [ { group: 1, value: 'jz' }, { group: 1, value: 'plp' } ],
  '2': [ { group: 2, value: 'jz2' } ]
}
*/

// 引入core-js/stable
require("core-js/stable");
const arr = [
  { group: 1, value: "jz" },
  { group: 2, value: "jz2" },
  { group: 1, value: "plp" },
];
const arrNew = arr.groupBy(item => item.group);
console.log(arrNew)
/* 输出结果
const arrNew = arr.groupBy(item => item.group);
                   ^
TypeError: arr.groupBy is not a function
*/
```

可以看到，不引入core-js时不支持，引入了core-js/actual（包含stage3阶段的API）后支持并能输出正确的结果。core-js/stable中不支持又报错了。

## core-js源码结构
前面描述了很多core-js的引入方式，这里我们看一下源码结构，看看core-js内部是如何组织的。

### core-js源码目录
```
core-js
├─actual
│   ├─array
│   │  ├─at.js
│   │  ├─concat.js
│   │  └─...
│   ├─set
│   │  └─...
│   └─...
├─es
│   └─...
├─features
│   └─...
├─index.js
└─...
```
首先列出core-js源码目录的示意图，可以看到core-js内部有很多目录，对应前面的各种引入方式。这里我们列出每个目录的内容：

* actual 包含稳定的ES和Web标准特性，以及stage3的特性
* es 包含稳定的ES特性
* features 没有说明，猜测和full类似
* full 所以特性包括早期提议
* internals 包内部使用的逻辑
* modules 实际特性的代码实现
* proposals 包含提议的特性
* stable 包含稳定的ES和Web标准特性
* stage 按照stage阶段列出提议特性
* web 包含Web标准特性
* configurator.js 是否强制引入逻辑，后面会描述
* index.js 内容为导出full目录，因此导入core-js等于导入core-js/full

### 层层引用
在目录中actual, es, full, stable, es是我们已经介绍过的。另外还有web目录仅包含web标准的特性，features和full类似（index.js中直接导出full目录）。

proposals目录包含提议的特性，特性名来命名文件名。而stage目录中包含0.js, 1.js, 2.js等等，是根据stage阶段来整理的，方便质疑和纳入对应阶段的特性。

这样整理目录虽然清晰，但这些目录中的特性都是重复的，不可能在每个目录中都把他也行实现一遍。因此上面这些目录的文件中，存放的都是实现的引用，并不是特性代码实现本身。真正的实现在modules目录中。modules目录中是特性名作为命名的文件，文件有固定的前缀名：es.表示ES标准；esnext.表示提议中的标准；web.表示web标准。

这里以我们上面提到过的两个特性为例，看看引用路径，首先是Promise.try：

* 使用者引入 core-js/full/promise/try.js
* 引入 actual/promise/try.js
* 引入 actual/promise/try.js
* 引入 stable/promise/try.js
* 引入 es/promise/try.js
* 最终引入 modules/es.promise.try.js

然后是groupBy方法：

* 使用者引入 core-js/actual/array/group-by.js
* 最终引入 modules/esnext.array.group-by.js

可以看到，core-js内部的特性是经过层层引入，最终引入具体的实现代码的。

### core-js-pure与core-js-bundle
除了core-js之外，core-js-pure与core-js-bundle这两个包也提供了兼容性。core-js-pure内部的目录结构与core-js一致，只不过core-js-pure不将特性注入到全局。core-js-bundle比较特殊，它是将core-js代码经过打包后再提供，它的结构如下：

```
core-js-bundle
├─index.js
├─minified.js
├─minified.js.map
└─...
```

其中index.js是打包过后得到特性集合代码，minified.js是经过压缩混淆后的代码。core-js-bundle只能全部引入并注入到全局，不能引入部分目录或者导出某个属性。

## 打包和浏览器效果
### 创建Webpack示例
首先创建一个Webapck项目，方便后续打包查看效果。首先执行：

```bash
# 创建项目
npm init -y
# 安装webpack依赖
npm add webpack webpack-cli html-webpack-plugin
# 安装core-js依赖
npm add core-js core-js-pure core-js-bundle
```

创建src/index.js，内容如下：

```js
const arr = ["jz", "plp"];
console.log(arr.lastIndex);
```

在package.json文件的scripts中增加命令："build": "webpack"。最后是Webpack配置文件webpack.config.js:

```js
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'production', // 生产模式
  entry: './src/index.js', // 源码入口
  plugins: [
    new HtmlWebpackPlugin({ // 生成HTML页面入口
      title: 'jzplp的core-js实验', // 页面标题
    }),
  ],
  output: {
    filename: 'main.js', // 生成文件名
    path: path.resolve(__dirname, 'dist'),  // 生成文件目录
    clean: true, // 生成前删除dist目录内容
  },
};
```

命令行运行npm run build，即可使用Webpack打包。在dist目录中生成了两个文件，一个是main.js，里面是打包后的js代码；index.html可以让我们在浏览器查看效果。由于我们没有引入core-js，浏览器没有预置lastIndex这个提议中的特性，因此输出undefined。

### core-js打包
这里引入core-js，然后打包查看效果。首先是全量引入：

```js
require("core-js");
const arr = ["jz", "plp"];
console.log(arr.lastIndex);
```

此时浏览器输出1，表示core-js注入成功，lastIndex特性生效了。但是我们查看main.js，发现居然有267KB。这是因为它把所有特性都引入了。

如果引入`require("core-js/full/array")`，此时新特性也可以生效。因为只引入了数组相关特性，因此main.js的大小为59.3KB，比全量引入小很多。

如果引入`require("core-js/full/array/last-index")`，此时新特性也可以生效。因为只引入了这一个特性，因此main.js的大小为12.2KB。


## Babel与core-js
从前面打包的例子中可以看到，core-js整个打包进项目中是非常巨大的，可能比你正常项目的大小还要更大。这样明显会造成占用资源更多，页面加载时间变慢等问题。一个解决办法是，只引入我们代码中使用到的特性，以及我们要适配的浏览器版本中不兼容的特性，用不到的特性不打包进代码中。Babel就提供了这样的功能。

### 创建Babel示例
```bash
# 创建项目
npm init -y
# 安装webpack依赖
npm add @babel/core @babel/cli @babel/preset-env
# 安装core-js依赖
npm add core-js core-js-pure core-js-bundle
```

创建src/index.js，内容如下：

```js
require('core-js');
const jzplp = 1;
```

在package.json文件的scripts中增加命令："babel": "babel src --out-dir lib"。最后是Babel配置文件babel.config.json:

```json
{
  "presets": [
    [
      "@babel/preset-env",
      {
        "targets": {
          "chrome": "100"
        }
      }
    ]
  ]
}
```

targets中表示我们需要兼容的浏览器版本。执行npm run babel，生成结果再lib/index.js中，内容如下。可以看到未对core-js做任何处理。

```js
"use strict";

require('core-js');
const jzplp = 1;
```

### preset-env配置entry
@babel/preset-env是一个Babel预设，可以根据配置为代码增加兼容性处理。前面创建Babel示例时已经增加了这个预设，但是没有增加core-js配置。这里我们加一下：

```json
{
  "presets": [
    [
      "@babel/preset-env",
      {
        "targets": {
          "chrome": "100"
        },
        "useBuiltIns": "entry",
        "corejs": "3.47.0"
      }
    ]
  ]
}
```

这里增加了corejs版本和useBuiltIns配置，值为entry。配置这个值，会使得@babel/preset-env根据配置的浏览器版本兼容性，选择引入哪些core-js中的特性。这里再执行命令行，结果如下：

```js
"use strict";

require("core-js/modules/es.symbol.async-dispose.js");
require("core-js/modules/es.symbol.dispose.js");
// ... 更多es特性省略
require("core-js/modules/esnext.array.filter-out.js");
require("core-js/modules/esnext.array.filter-reject.js");
// ... 更多esnext特性省略
require("core-js/modules/web.dom-exception.stack.js");
require("core-js/modules/web.immediate.js");
// ... 更多web特性省略
const jzplp = 1;
```

可以看到，core-js被拆开，直接引入了特性本身。在配置chrome: 100版本时，引入的特性为215个。我们修改配置chrome: 140版本时，再重新生成代码，此时引入的特性为150个。可以看到确实时根据浏览器版本选择不同的特性引入。这对于其它core-js的引入方式也生效：

```js
// 源代码
require('core-js/stable');
const jzplp = 1;

// 生成代码
"use strict";

require("core-js/modules/es.symbol.async-dispose.js");
require("core-js/modules/es.symbol.dispose.js");
// ... 更多es特性省略
require("core-js/modules/web.dom-exception.stack.js");
require("core-js/modules/web.immediate.js");
// ... 更多web特性省略
const jzplp = 1;
```

我们引入core-js/stable，可以看到生成代码中不引入esnext特性了。在配置chrome: 100版本时，引入的特性为71个，配置chrome: 100版本时，引入的特性为6个。同样的，如果引入换成core-js/full/array，就会只引入数组相关特性，而且也是根据浏览器兼容版本引入。

### preset-env配置usage
@babel/preset-env的useBuiltIns配置值为usage时，Babel不仅会跟根据配置的浏览器版本兼容性，还会根据代码中实际使用的特性，来选择引入哪些core-js中的特性。首先是Babel配置：

```json
{
  "presets": [
    [
      "@babel/preset-env",
      {
        "targets": {
          "chrome": "100"
        },
        "useBuiltIns": "usage",
        "corejs": "3.47.0"
      }
    ]
  ]
}
```

然后是要处理的代码，注意配置usage时是不需要手动引入core-js的。我们在配置不同的Chrome浏览器版本，看看输出结果如何：

```js
// 源代码
const jzplp = new Promise();
const b = new Map();

// chrome 50 生成代码 
"use strict";

require("core-js/modules/es.array.iterator.js");
require("core-js/modules/es.map.js");
require("core-js/modules/es.promise.js");
require("core-js/modules/web.dom-collections.iterator.js");
const jzplp = new Promise();
const b = new Map();

// chrome 100 生成代码 
"use strict";

const jzplp = new Promise();
const b = new Map();
```

首先可以看到，引入core-js中的特性数量变得非常少了，代码中没有用到的特性不再引入。其次不同的浏览器版本引入的特性不一样，因此还是会根据浏览器兼容性引入特性。我们再修改一下源代码试试：

```js
// 源代码
const jzplp = new Promise();
const b = new Map();
Promise.try(() =>{});

// chrome 50 生成代码 
"use strict";

require("core-js/modules/es.array.iterator.js");
require("core-js/modules/es.map.js");
require("core-js/modules/es.promise.js");
require("core-js/modules/es.promise.try.js");
require("core-js/modules/web.dom-collections.iterator.js");
const jzplp = new Promise();
const b = new Map();
Promise.try(() => {});

// chrome 100 生成代码 
"use strict";

require("core-js/modules/es.promise.try.js");
const jzplp = new Promise();
const b = new Map();
Promise.try(() => {});
```

可以看到，源代码中增加了Promise.try，引入的特性也随之增加了对应的core-js特性引入。因此，使用@babel/preset-env的usage配置，可以保证兼容性的同时，最小化引入core-js特性。另外这个配置并不会自动引入提议特性，需要额外配置proposals为true。

### @babel/polyfill
@babel/polyfill是一个已经被弃用的包，推荐直接使用core-js/stable。查看@babel/polyfill源码，发现他就是引入了core-js特性与regenerator-runtime这个包。（regenerator-runtime也是一个兼容性相关的包，我们在后面单独介绍）作为替代可以这样引入：

```js
import 'core-js/stable';
import 'regenerator-runtime/runtime';
```

### @babel/runtime
@babel/runtime就像自动引入版的core-js-pure。它还是根据代码实际使用的特性来注入core-js特性，但它不注入到全局，而是引入这些API再调用。这里我们使用@babel/plugin-transform-runtime插件，里面包含了@babel/runtime相关逻辑。首先看下Babel配置：

```json
{
  "plugins": [["@babel/plugin-transform-runtime", { "corejs": 3 }]]
}
```

再转义上一节中的代码，结果如下：

```js
// 源代码
const jzplp = new Promise();
const b = new Map();
Promise.try(() =>{});

// 生成代码
import _Promise from "@babel/runtime-corejs3/core-js-stable/promise";
import _Map from "@babel/runtime-corejs3/core-js-stable/map";
const jzplp = new _Promise();
const b = new _Map();
_Promise.try(() => {});
```

可以看到，虽然没有直接引入core-js-pure，但效果是一样的。打开@babel/runtime-corejs3这个包查看，里面实际上就是导出了core-js-pure中的特性。例如：

```js
// @babel/runtime-corejs3/core-js-stable/map.js 文件内容
module.exports = require("core-js-pure/stable/map");
```

## regenerator-runtime


core-js/configurator 看看能否试试注入和不注入的区别

core-js-builder

core-js-compact

## 参考
- core-js 文档\
  https://core-js.io/
- Github core-js\
  https://github.com/zloirock/core-js
- 解锁Babel核心功能：从转义语法到插件开发\
  https://jzplp.github.io/2025/babel-intro.html
- @babel/preset-env 文档\
  https://babeljs.io/docs/babel-preset-env
- @babel/polyfill 文档\
  https://babeljs.io/docs/babel-polyfill
- @babel/runtime 文档\
  https://babeljs.io/docs/babel-runtime
- Github regenerator-runtime\
  https://github.com/facebook/regenerator/tree/main/packages/runtime
