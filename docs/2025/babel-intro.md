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
除了API调用之外，Babel可以通过命令行调用。我们首先安装@babel/cli，然后在根目录创建src文件夹，包含两个文件：

```js
// index.js
const index =1;

// a.js
const fun = () => {
  console.log(123);
}
```

我们依然使用上一节中Babel配置文件。然后命令行执行：

```sh
npx babel src --out-dir lib
# 输出
# Successfully compiled 2 files with Babel (5974ms).
```

此时新增了lib文件夹，里面包含我们创建的两个文件，但是都经过了转换。查看结果，配置文件也能通过命令行调用生效。

```js
// index.js
"use strict";

var index = 1;

// a.js
"use strict";

var fun = function fun() {
  console.log(123);
};
```

### 生成AST
在之前的文章中，我们介绍过AST抽象语法树，是将代码转换成抽象的树状结构的技术。在转换和生成代码中，AST是必须要用到的。Babel也支持输出AST。

```js
const babel = require("@babel/core");

const code = `const a =1;`;
const obj1 = babel.transformSync(code, { ast: true });
console.log(JSON.stringify(obj1.ast));
```

然后我们看输出结果，是符合ESTree标准的抽象语法树：

```json
{
  "type": "File",
  "start": 0,
  "end": 11,
  "loc": {
    "start": { "line": 1, "column": 0, "index": 0 },
    "end": { "line": 1, "column": 11, "index": 11 }
  },
  "errors": [],
  "program": {
    "type": "Program",
    "start": 0,
    "end": 11,
    "loc": {
      "start": { "line": 1, "column": 0, "index": 0 },
      "end": { "line": 1, "column": 11, "index": 11 }
    },
    "sourceType": "module",
    "interpreter": null,
    "body": [
      {
        "type": "VariableDeclaration",
        "start": 0,
        "end": 11,
        "loc": {
          "start": { "line": 1, "column": 0, "index": 0 },
          "end": { "line": 1, "column": 11, "index": 11 }
        },
        "declarations": [
          {
            "type": "VariableDeclarator",
            "start": 6,
            "end": 10,
            "loc": {
              "start": { "line": 1, "column": 6, "index": 6 },
              "end": { "line": 1, "column": 10, "index": 10 }
            },
            "id": {
              "type": "Identifier",
              "start": 6,
              "end": 7,
              "loc": {
                "start": { "line": 1, "column": 6, "index": 6 },
                "end": { "line": 1, "column": 7, "index": 7 },
                "identifierName": "a"
              },
              "name": "a"
            },
            "init": {
              "type": "NumericLiteral",
              "start": 9,
              "end": 10,
              "loc": {
                "start": { "line": 1, "column": 9, "index": 9 },
                "end": { "line": 1, "column": 10, "index": 10 }
              },
              "extra": { "rawValue": 1, "raw": "1" },
              "value": 1
            }
          }
        ],
        "kind": "const"
      }
    ],
    "directives": [],
    "extra": { "topLevelAwait": false }
  },
  "comments": []
}
```

### 生成SourceMap
SourceMap是一种保存代码转换前后对应位置信息的技术，Babel同样简单配置即可生成。这次我们使用前面的命令行形式。首先修改配置文件：

```js
{
  "presets": [
    [
      "@babel/preset-env",
      {
        "targets": {
          "chrome": "60"
        },
        "useBuiltIns": "usage",
        "corejs": 3
      }
    ]
  ],
  "sourceMaps": true
}
```

然后执行命令行，结果生成代码的最下方有一行注释，指向了index.js.map。同时也生成了独立的index.js.map文件，这就是生成的SourceMap数据，这里就不展示了。（下方代码中包含那一句会让VitePress真的去寻找SourceMap文件，而且会因为找不到而报错，因此注释中我增加了防止报错的文本）

```js
"use strict";

require("core-js/modules/es.promise.js");
const a = 1;
new Promise(() => {});
Object.is(a, a);
//# sourceMappingURL/*防止报错*/=index.js.map
```

## Polyfill功能
前面对于代码的转换仅仅是语法层面的转换，例如const或者箭头函数。但ECMAScript的新版本除了增加新的语法外，还会增加新的API，比如对象，类，内置方法等等，例如Promise, Object.is()等等。这些并不是语法层面的改动，但也随着浏览器环境版本的变动而变动。

### 未使用场景

对于这些API的兼容的方法，就叫做“Polyfill”。有一个core-js包提供了各种API在旧版本的兼容实现，引入这个包中所需要的模块，即可正常使用这些新版本才有的API。这里举个使用Babel进行转换的例子（使用前面的配置文件进行转换）：

```js
// 转换前代码
const a = 1;
new Promise(() => {});

// 转换后代码
"use strict";

var a = 1;
new Promise(function () {});
```

可以看到，const和箭头函数都被转换成旧版本的形式了，但因为Promise并不是语法，因此它没有被转换。但Promise在IE11是不能用的，因此我们依然需要Polyfill，才能在低版本执行代码。

### Polyfill配置
Babel的@babel/preset-env预设中也提供了Polyfill功能，可以帮我们将缺失的API引入。首先需要修改配置文件：

```js
{
  "presets": [
    [
      "@babel/preset-env",
      {
        "targets": {
          "ie": "11"
        },
        "useBuiltIns": "usage",
        "corejs": 3
      }
    ]
  ]
}
```

增加useBuiltIns:usage表示需要按需引入Polyfill功能，同时Babel的Polyfill引入的实际上还是core-js包中的模块，因此需要指定core-js版本。此时将上面的代码重新转换，结果如下：

```js
// 转换后代码
"use strict";

require("core-js/modules/es.object.to-string.js");
require("core-js/modules/es.promise.js");
var a = 1;
new Promise(function () {});
```

可以看到，除了语法被转换成旧版本，还增加了两个require，是core-js中的模块。引入了这些模块后，在旧版本浏览器中就存在Promise对象，我们的代码也可以正常执行了。

### 根据代码按需引入
Babel在引入Polyfill的时候，不会一股脑的将所有新API全部引入，这样会造成无用的API过多，影响执行效率。Babel会检查我们的代码，只引入使用到的API。例如我们在前面的例子中增加一行，然后重新转换：

```js
// 转换前代码
const a = 1;
new Promise(() => {});
Object.is(a, a)


// 转换后代码
"use strict";

require("core-js/modules/es.object.is.js");
require("core-js/modules/es.object.to-string.js");
require("core-js/modules/es.promise.js");
var a = 1;
new Promise(function () {});
Object.is(a, a);
```

可以看到，我们的代码中多了`Object.is`，这是ES6新增的方法。在转换后的代码中除了看到新增的代码外，还多了一句require，里面包含这个ES6新增方法的实现。通过对比可以得出，Babel是会根据代码内容按需引入的。

### 根据浏览器版本按需引入
Babel在引入Polyfill的时候不仅考虑代码内容，还会考虑目标浏览器的版本。如果目标浏览器已经支持这个API，便不再引入了。前面的例子中我们是以IE11作为浏览器版本的，现在我们改一下配置文件：

```js
{
  "presets": [
    [
      "@babel/preset-env",
      {
        "targets": {
          "chrome": "60"
        },
        "useBuiltIns": "usage",
        "corejs": 3
      }
    ]
  ]
}
```

现在支持的浏览器版本为Chrome60，我们重新转换代码：

```js
// 转换后代码
"use strict";

require("core-js/modules/es.promise.js");
const a = 1;
new Promise(() => {});
Object.is(a, a);
```

通过结果可以看到，在更换浏览器版本后，需要引入的API也变化了，这说明Babel是会根据浏览器版本按需引入的。

## 使用工具包
Babel除了可以转换语法之外，还提供了很多相关的开源库，其中包括一些工具包。这里我们简单介绍少部分常用的Babel工具。

### @babel/parser生成AST
@babel/parser是Babel使用的JavaScript解析器，以前叫做Babylon。它可以提供JavaScript到AST抽象语法树的转换。

```js
const babelParser = require('@babel/parser');
const ast = babelParser.parse('const a = 1');
console.log(ast);
```

### @babel/generator从AST生成代码
@babel/generator提供了从AST数据生成代码的功能。

```js
// 生成AST
const babelParser = require('@babel/parser');
const ast = babelParser.parse('const a = 1');

// 从AST生成代码
const babelGenerator = require("@babel/generator");
const res = babelGenerator.generate(ast);
console.log(res.code);

// 生成结果
const a = 1;
```

### @babel/code-frame代码报错信息展示
当我们代码编译或者其它处理发生报错时，有时命令行会输出具体的错误代码位置。@babel/code-frame就是突出显示代码位置的工具。

```js
const babelCodeFrame = require("@babel/code-frame");
const lines = `const a =1;
console.log('hello~')
let sum = 1 + 2;`;
const res = babelCodeFrame.codeFrameColumns(lines, {
  start: { line: 2, column: 8 },
  end: { line: 2, column: 12 },
});
console.log(res);

/* 输出结果
  1 | const a =1;
> 2 | console.log('hello~')
    |        ^^^^
  3 | let sum = 1 + 2;
*/
```

### @babel/types生成和判断AST结点
@babel/types这个包里面放的并不是Babel相关的类型文件，而是判断和生成各种各样AST类型的函数。

```js
const babelTypes = require("@babel/types");

const be = babelTypes.binaryExpression('+',
  babelTypes.numericLiteral(1),
  babelTypes.numericLiteral(2)
);
console.log(be);

const r1 = babelTypes.isBinaryExpression(be);
const r2 = babelTypes.isArrayExpression(be);
console.log(r1, r2);

/* 输出结果
{
  type: 'BinaryExpression',
  operator: '+',
  left: { type: 'NumericLiteral', value: 1 },
  right: { type: 'NumericLiteral', value: 2 }
}
true false
*/
```

在上面的代码中，我们利用@babel/types先创建了一个加号二元表达式的AST结点，其中左右都是数字字面量。然后使用函数判断其是否为二元表达式或数组表达式的AST结点。

### @babel/traverse遍历和修改AST
上面介绍了生成AST和从AST生成代码的工具，那肯定少不了遍历修改AST的工具。@babel/traverse就可以做这件事。

```js
// 生成AST
const babelParser = require("@babel/parser");
const ast = babelParser.parse("const a = 1 + 2");

// 遍历和修改AST
const babelTypes = require("@babel/types");
const babelTraverse = require("@babel/traverse").default;
babelTraverse(ast, {
  enter(path) {
    if (babelTypes.isBinaryExpression(path.node) && path.node.operator === "+")
      path.node.operator = "-";
  },
});
babelTraverse(ast, {
  BinaryExpression(path) {
    if (path.node.operator === "+") path.node.operator = "-";
  },
});

// 从AST生成代码
const babelGenerator = require("@babel/generator");
const res = babelGenerator.generate(ast);
console.log(res.code);

// 生成结果
const a = 1 - 2;
```

这段代码用到了上面提到的好多工具。首先把代码生成AST，然后使用@babel/traverse遍历和修改AST，最后生成新代码，可以看到已经被修改了（+号改成了-号）。其中遍历修改用了两种方式，最后的效果一致：第一种方式enter遍历所有结点，使用@babel/types中的函数判断结点类型，然后修改。第二种方式@babel/traverse直接提供了对应结点类型的访问入口，无需对所有结点做筛选。

### @babel/template从模板生成AST
我们提供给@babel/template一个代码模板，给这个模板提供结点数据，就可以生成相应的AST抽象语法树。

```js
const babelTemplate = require("@babel/template").default;
const babelTypes = require("@babel/types");

const codeTemplate = "const %%name%% = %%value%%;";
const template = babelTemplate(codeTemplate);
const ast = template({
  name: babelTypes.identifier("a"),
  value: babelTypes.stringLiteral("hello, jzplp"),
});
console.log(JSON.stringify(ast));

// 从AST生成代码
const babelGenerator = require("@babel/generator");
const res = babelGenerator.generate(ast);
console.log(res.code);
```

首先我们创建了一个模板，有name和value两个占位符。一个是变量标识符，一个是值。然后我们给模板数据，数据本身是对应的AST结点。生成的AST，以及用AST生成的代码中都可以看到占位符被替换了。

```js
// 生成的AST
{
  "type": "VariableDeclaration",
  "kind": "const",
  "declarations": [
    {
      "type": "VariableDeclarator",
      "id": { "type": "Identifier", "name": "a" },
      "init": { "type": "StringLiteral", "value": "hello, jzplp" }
    }
  ]
}

// 生成的代码
const a = "hello, jzplp";
```

## 转义TypeScript
### 转义ts文件
通过预设，Babel可以转换TypeScript语法的代码为JavaScript语法的代码（但是不能检查和输出类型声明）。首先修改配置文件babel.config.json：

```js
{
  "presets": ["@babel/preset-typescript"]
}
```

然后在src文件夹中新增index.ts文件，这就是我们要转义的文件：

```ts
const jz: number = 1;
const list: Array<number> = [jz];
interface Stru {
  jz: number;
  list: Array<number>;
}
const stru: Stru = { jz, list };
const p = new Promise(() => {});
```

然后执行命令行，和之前相比增加了支持ts文件的参数：`babel src --out-dir lib --extensions ".ts"`。在lib文件夹中可以看到生成结果index.js，去掉了TypeScript类型相关语法。

```js
// 生成结果
const jz = 1;
const list = [jz];
const stru = {
  jz,
  list
};
const p = new Promise(() => {});
```

### 多预设同时生效
在上一节转义TS文件生成的结果代码中，可以看到只转义了TypeScript，并没有转义新版本的ECMAScript语法和Polyfill。是否需要我们编译两次，第一次转义TS，第二次转义ES新语法？通过多个预设的顺序排列，Babel支持在一次转义中同时做多件事。修改配置文件：

```js
{
  "presets": [
    [
      "@babel/preset-env",
      {
        "targets": {
          "ie": "11"
        },
        "useBuiltIns": "usage",
        "corejs": 3
      }
    ],
    "@babel/preset-typescript"
  ]
}
```

Babel支持同时传入多个预设，这些预设有前后顺序，数组中后面的预设更早执行，因此先使用@babel/preset-typescript转义TypeScript，再使用@babel/preset-env转义新版本的ECMAScript语法。我们看下转义结果：

```js
// 生成结果
"use strict";

require("core-js/modules/es.object.to-string.js");
require("core-js/modules/es.promise.js");
var jz = 1;
var list = [jz];
var stru = {
  jz: jz,
  list: list
};
var p = new Promise(function () {});
```

另外插件数组是从前往后执行，插件在预设之前运行。不过我发现这两个插件在配置文件的顺序更换之后，结果也一致。

## 转义JSX
### 转义JSX语法
通过@babel/preset-react预设，Babel可以解析JSX。首先修改配置文件babel.config.json：

```js
{
  "presets": ["@babel/preset-react"]
}
```

然后在src文件夹中新增index.jsx文件，这就是我们要转义的文件：

```js
function Comp() {
  const a = 1;
  const str = "jzplp";

  return (
    <div>
      <span>{str}</span>
      <span>{a}</span>
    </div>
  );
}
```

执行命令行`babel src --out-dir lib`(和一开始的命令行一致)。可以看到输出结果，JSX语法被转义成了createElement方法。

```js
// 生成结果
function Comp() {
  const a = 1;
  const str = "jzplp";
  return /*#__PURE__*/ React.createElement(
    "div",
    null,
    /*#__PURE__*/ React.createElement("span", null, str),
    /*#__PURE__*/ React.createElement("span", null, a)
  );
}
```

### 转义TSX语法
同时使用JSX语法和TypeScript语法的代码，被叫做TSX。再加上转义ECMAScript新语法，因此转义需要三个预设同时生效。首先展示一下我们需要转义的代码：

```ts
const jz: number = 1;
const list: Array<number> = [jz];
interface Stru {
  jz: number;
  list: Array<number>;
}
const stru: Stru = { jz, list };
const p = new Promise(() => {});

function Comp() {
  const a = 1;
  const str = "jzplp";

  return (
    <div>
      <span>{str}</span>
      <span>{a}</span>
    </div>
  );
}
```

首先我们先只转义TypeScript语法试一下。配置文件：

```js
{
  "presets": [
    [
      "@babel/preset-typescript",
      {
        "isTSX": true,
        "allExtensions": true
      }
    ]
  ]
}
```

然后执行命令：`babel src --out-dir lib --extensions ".tsx"`。可以看到结果中TS声明没有了，但是JSX是没有被转义的。因此@babel/preset-typescript是可以解析TSX语法的，但是不转义。

```js
// 生成结果
const jz = 1;
const list = [jz];
const stru = {
  jz,
  list
};
const p = new Promise(() => {});
function Comp() {
  const a = 1;
  const str = "jzplp";
  return <div>
      <span>{str}</span>
      <span>{a}</span>
    </div>;
}
```

然后我们在配置文件中增加JSX语法和ECMAScript新语法转义。修改配置文件：

```js
{
  "presets": [
    [
      "@babel/preset-env",
      {
        "targets": {
          "ie": "11"
        },
        "useBuiltIns": "usage",
        "corejs": 3
      }
    ],
    "@babel/preset-react",
    [
      "@babel/preset-typescript",
      {
        "isTSX": true,
        "allExtensions": true
      }
    ]
  ]
}
```

还是执行上面tsx的命令行，查看结果发现三种语法都被转义了。同样的，三个插件在配置文件的顺序无论如何更换结果都一致。

```js
// 生成结果
"use strict";

require("core-js/modules/es.object.to-string.js");
require("core-js/modules/es.promise.js");
var jz = 1;
var list = [jz];
var stru = {
  jz: jz,
  list: list,
};
var p = new Promise(function () {});
function Comp() {
  var a = 1;
  var str = "jzplp";
  return /*#__PURE__*/ React.createElement(
    "div",
    null,
    /*#__PURE__*/ React.createElement("span", null, str),
    /*#__PURE__*/ React.createElement("span", null, a)
  );
}
```

## 如何开发Babel插件

### 新建插件
开发Babal插件需要用到前面描述的相关工具能力。插件实际上就是一个修改AST的函数，这里举个例子。

```js
export default function plugin1(babel) {
  console.log("plugin1", babel.version);
  return {
    visitor: {
      BinaryExpression(path) {
        if (path.node.operator === "+") path.node.operator = "-";
      },
    },
  };
}
```

插件函数返回一个对象，对象中的visitor就是我们在前面AST遍历中传给@babel/traverse的对象，里面描述了遍历和修改AST的方法。然后修改Babel配置，引入插件，设置为相对路径：

```js
{
  "plugins": ["./plugins/plugin1.js"]
}
```

然后准备好要处理的代码：
```js
const a = 1 - 1;
new Promise(() => {});
Object.is(a, a);
```

从生成结果中可以看到，+号变为了-号，我们的插件确实生效了。

```js
// 生成结果
const a = 1 - 1;
new Promise(() => {});
Object.is(a, a);
```

### 插件参数
在前面@babel/preset-env的使用中，可以看到插件可以接受参数，我们的自定义插件也可以做到。首先修改配置文件，传入插件参数：

```js
{
  "plugins": [
    [
      "./plugins/plugin1.js",
      {
        "option1": "jzplp",
        "option2": "hello,jz"
      }
    ]
  ]
}
```

然后在插件代码中打印配置。可以看到通过state.opts可以获取。

```js
module.exports = function plugin1(babel) {
  return {
    visitor: {
      BinaryExpression(path, state) {
        if (path.node.operator === "+") {
          console.log(state.opts);
          path.node.operator = "-";
        }
      },
    },
  };
};

/* 命令行输出
{ option1: 'jzplp', option2: 'hello,jz' }
*/
```

### 多文件与触发时间

插件还可以定义在插件运行前和运行后的函数，再加上创建插件时也可以插入逻辑，我们在这些位置都加入输出：

```js
module.exports = function plugin1(babel) {
  console.log("plugin1 init");
  return {
    pre(state) {
      console.log("plugin1 pre");
    },
    visitor: {
      BinaryExpression(path, state) {
        if (path.node.operator === "+") {
          console.log("plugin1 visitor");
          path.node.operator = "-";
        }
      },
    },
    post(state) {
      console.log("plugin1 post");
    },
  };
};
```

然后我们在要处理的代码目录中放入两个文件，执行命令行，输出结果如下：

```
plugin1 init
plugin1 pre
plugin1 visitor
plugin1 post
plugin1 pre
plugin1 visitor
plugin1 post
Successfully compiled 2 files with Babel (160ms).
```

对应我们上面代码的输出，可以看到插件仅初始化了一次，但是处理前/处理后的函数却是每个文件分别执行的。

### 其它参数说明

## 如何开发Babel预设

## 多插件和多预设顺序

### 多插件顺序

todo 参考 多文件与触发时间

### 多预设顺序

### 综合顺序

## 总结

## 参考
- Babel 文档\
  https://babeljs.io/
- Babel 中文文档\
  https://www.babeljs.cn/
- core-js Github\
  https://github.com/zloirock/core-js
- JavaScript语法树简介：AST/CST/词法/语法分析/ESTree/生成工具\
  https://jzplp.github.io/2025/js-ast.html
- Babel 插件手册\
  https://github.com/jamiebuilds/babel-handbook/blob/master/translations/zh-Hans/plugin-handbook.md
