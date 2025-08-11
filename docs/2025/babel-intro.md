# Babel介绍（todo 标题待确定）

## Babel是什么
### 巴别塔的故事
Babel这个单词的本意是“巴别塔”，是传说中古代巴比伦王国的著名高塔。这里有一个传说：

> 在当时，所有人类都说同一种语言，联合起来兴建希望能通往天堂的高塔：巴别塔。为了阻止人类的计划，上帝让人类说不同的语言，使人类相互之间不能沟通，计划因此失败，人类自此各散东西。（故事源自圣经）

这个传说告诉我们，语言与沟通的重要性。但不止人类的语言与沟通很重要，计算机编程所用的语言沟通也很重要。因此在前端开发中，Babel这个工具做的事情与让“前端语言更容易沟通”有关系。而Babel所采用的解析器Babylon，也正是巴比伦王国的英文单词。

### Babel的功能
Babel是一个JavaScript编译器，主要作用是将新版本的ECMAScript代码转换为兼容的旧版本JavaScript代码，以便新代码可以正常运行在旧浏览器环境中。当然Babel可以做的事情不止于此，这里我们列举一下Babel的部分功能：

* 转义语法：将新ECMAScript语法转义为兼容语法
* Polyfill：在旧环境中增加ECMAScript中的新API，例如全局对象和方法
* 转换代码
* 生成抽象语法树AST
* 生成SourceMap
* 转换React的JSX语法
* 转换TypeScript与Flow语法
* 支持配置文件
* 支持插件和预设
* 支持API调用与命令行调用
* 等等...

总之，Babel是做与转换代码有关的功能。它还提供了很多独立的工具包，可以按需选用。

## Babel的简单使用
这里简单列举一下Babel部分基础功能的使用方式。

### 转义语法API
首先尝试用JavaScript的API方式调用转换语法：

```js
const babel = require("@babel/core");

const code = `const a =1;`;

const obj1 = babel.transformSync(code);
console.log('例子1', obj1.code);

const obj2 = babel.transformSync(code, {
  presets: [
    [
      "@babel/preset-env",
      {
        targets: { ie: "11" },
      },
    ],
  ],
});
console.log('例子2', obj2.code);
```

这里使用了@babel/core用来转换代码，它提供了多种API，包括同步异步，从文本/文件/AST中转换代码等。第一个例子是没有使用任何配置的，第二个例子还使用了@babel/preset-env，这是一个预设，同时可以接受参数表示要求适配的浏览器版本。我们看下输出结果：

```js
// 例子1
const a = 1;
// 例子2
"use strict";

var a = 1;
```

第一个例子因为没有配置，所以输出代码仅仅是格式上发生了变化。第二个例子因为有配置需要兼容IE11浏览器（不支持ES6），因此const被转义成了var。

### 配置文件
Babel支持独立的配置文件，且有多种形式，例如`babel.config.*, .babelrc.*`等等，我们以babel.config.json为例，放在项目的根目录下，然后将上一节中API中的配置转移到配置文件中：

```js
{
  "presets": [
    [
      "@babel/preset-env",
      {
        "targets": {
          "ie": "11"
        }
      }
    ]
  ]
}
```

然后我们再使用API调用，并且去掉API中的配置，重新调用，发现Babel读取了配置文件中的配置，效果和前面API传入配置一致。

```js
const babel = require("@babel/core");

const code = `const a =1;`;
const obj1 = babel.transformSync(code);
console.log('例子1', obj1.code);

// 输出
"use strict";

var a = 1;
```

Babel配置文件支持很多配置，部分配置在后面会逐渐介绍。全量配置描述可以看Babel文档。

### 命令行调用
除了API调用之外，Babel可以通过命令行调用。




### Polyfill

### 生成AST

### 生成SourceMap

### 使用工具包

## 转义React与JSX

## 转义TypeScript

## 如何开发Babel插件

## 如何开发Babel预设

## 搞一个应用？

## 总结

## 参考
- Babel文档\
  https://babeljs.io/
- Babel中文文档\
  https://www.babeljs.cn/
