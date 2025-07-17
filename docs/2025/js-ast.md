# 前端开发中的AST抽象语法树简介（未完成 标题待确定 可能突出下babel?）

## AST简介
在平时的开发中，经常会遇到对我们写的JavaScript代码进行检查或改动的工具，例如ESLint会检查代码中的语法错误；Prettier会修改代码的格式；打包工具会将不同文件中的代码打包在一起等等。这些工具都对JavaScript代码本身进行了解析和修改。这些工具是如何实现对代码本身的解析呢？这就要用到一种叫做AST抽象语法树的技术。

抽象语法树(Abstract Syntax Tree, 缩写为AST)，是将代码抽象成一种树状结构，树上的每个节点表示代码中的一种语法，包括标识符，字面量，表达式，语句，模块等等。将代码形成抽象语法树AST之后，还可以通过这棵树还原成代码。在AST的形成过程中会丢弃注释和空白符等无意义的内容。

将代码抽象成AST需要两个步骤：1.词法分析，是扫描代码并将其中的内容标识为以一个一个的token，形成数组。2.语法分析，是将词法分析的token数组转化为树状的形式，也就形成了抽象语法树。下面我们分别看一下每个步骤。

todo 写完下面的之后在这里放个流程图

## 词法分析
词法分析是生成AST的第一个步骤，它将代码的内容转换为一个一个的标识token，忽略空白符号，识别标识符的类型，最终形成一个tokens数组。只用语言描述有点晦涩，让我们先来看看生成的数组是什么样子吧。这里使用Esprima，一个ECMAScript解析器来生成tokens。本来想用babel，但是babel没有抛出独立生成tokens的方法。

```js
const esprima = require("esprima");
const code = "const a = 2 + 1;";
const tokens = esprima.tokenize(code);
console.log(tokens);

/* 生成的tokens
[
  { type: 'Keyword', value: 'const' },
  { type: 'Identifier', value: 'a' },
  { type: 'Punctuator', value: '=' },
  { type: 'Numeric', value: '2' },
  { type: 'Punctuator', value: '+' },
  { type: 'Numeric', value: '1' },
  { type: 'Punctuator', value: ';' }
]
*/
```

在Node.js中执行这段代码，命令行中就打印出了生成的tokens，放在上面的注释中了。可以看到，代码中除了空白之外，全都被生成token了，value为实际的内容，type为这个内容的类型，其中Keyword为JavaScript的关键字，Numeric为数字，Punctuator是符号，Identifier指的是标识符，例如变量名等。

我们再看一个代码中包含多行与函数的场景，与上面的代码相比，只有code不一样，因此其它代码就省略了：

```js
// 准备解析的代码
const fun = function (a) {
  const b = 2;
  return a + b;
}

/* 生成的tokens
[
  { type: 'Keyword', value: 'const' },
  { type: 'Identifier', value: 'fun' },
  { type: 'Punctuator', value: '=' },
  { type: 'Keyword', value: 'function' },
  { type: 'Punctuator', value: '(' },
  { type: 'Identifier', value: 'a' },
  { type: 'Punctuator', value: ')' },
  { type: 'Punctuator', value: '{' },
  { type: 'Keyword', value: 'const' },
  { type: 'Identifier', value: 'b' },
  { type: 'Punctuator', value: '=' },
  { type: 'Numeric', value: '2' },
  { type: 'Punctuator', value: ';' },
  { type: 'Keyword', value: 'return' },
  { type: 'Identifier', value: 'a' },
  { type: 'Punctuator', value: '+' },
  { type: 'Identifier', value: 'b' },
  { type: 'Punctuator', value: ';' },
  { type: 'Punctuator', value: '}' }
]
*/
```

这个例子复杂很多，通过结果可以看到函数虽然作为一个整体，但是被拆分成了多个token。而且这个例子中虽然有多行，但生成的tokens是没有换行标志的。事实上对于Esprima，可以配置保留注释和以及展示每个token在源码中的位置（从而可以判断是否有换行）。更多配置可以看Esprima文档。

```js
const esprima = require("esprima");
// 准备解析的代码
const code = `// 打印输出
console.log(value);`;
const tokens = esprima.tokenize(code, { loc: true, comment: true });
console.log(JSON.stringify(tokens));

/* 生成的tokens
[
  {
    type: "LineComment",
    value: " 打印输出",
    loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 7 } },
  },
  {
    type: "Identifier",
    value: "console",
    loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 7 } },
  },
  {
    type: "Punctuator",
    value: ".",
    loc: { start: { line: 2, column: 7 }, end: { line: 2, column: 8 } },
  },
  {
    type: "Identifier",
    value: "log",
    loc: { start: { line: 2, column: 8 }, end: { line: 2, column: 11 } },
  },
  {
    type: "Punctuator",
    value: "(",
    loc: { start: { line: 2, column: 11 }, end: { line: 2, column: 12 } },
  },
  {
    type: "Identifier",
    value: "value",
    loc: { start: { line: 2, column: 12 }, end: { line: 2, column: 17 } },
  },
  {
    type: "Punctuator",
    value: ")",
    loc: { start: { line: 2, column: 17 }, end: { line: 2, column: 18 } },
  },
  {
    type: "Punctuator",
    value: ";",
    loc: { start: { line: 2, column: 18 }, end: { line: 2, column: 19 } },
  },
];
*/
```

可以看到结果中打印了每一个token的起始位置和最终位置，注释也保留了，使用LineComment类型。另外注意看console.log这个对象方法，在数组中被分解为了标识符+符号+标识符三个。另外这个被解析的代码我故意放了一个错误（value未定义就被使用值），但这里仅仅是识别token，代码是否可以被执行与生成tokens无关。

## 语法分析
词法分析结束之后，对生成tokens进一步分析，最后形成一个语法树，就是抽象语法树AST了。这里我们还是使用Esprima生成。（本想尝试利用词法分析结果来生成AST，但暂时没有找到相关的API，因此只能从代码直接生成AST了）。

```js
const esprima = require("esprima");
// 准备生成的代码
const code = "const a = 2 + 1;";
const ast = esprima.parse(code);
console.log(JSON.stringify(ast));

/* 生成的AST
{
  type: "Program",
  body: [
    {
      type: "VariableDeclaration",
      declarations: [
        {
          type: "VariableDeclarator",
          id: { type: "Identifier", name: "a" },
          init: {
            type: "BinaryExpression",
            operator: "+",
            left: { type: "Literal", value: 2, raw: "2" },
            right: { type: "Literal", value: 1, raw: "1" },
          },
        },
      ],
      kind: "const",
    },
  ],
  sourceType: "script",
}
*/
```

可以看到代码被解析成了一个JSON结构，这个JSOn结构即描述了代码本身。我们从外向内试着分析一下这个结构：

* Program 表示一个程序
* VariableDeclaration 表示变量声明，kind表示了是const
* VariableDeclarator 表示变量声明的标识符，是名称为a的Identifier标识符
* BinaryExpression 二元运算符表达式，其中操作符是+号
* Literal 加号的左右都是字面量，值为数字1和2

因此，一段代码就被分析成了这样一颗AST树。这里我们再看一个例子：

```js
// 准备解析的代码
const fun = function (a) {
  const b = 2;
  return a + b;
}

/* 生成的AST
{
  type: "Program",
  body: [
    {
      type: "VariableDeclaration",
      declarations: [
        {
          type: "VariableDeclarator",
          id: { type: "Identifier", name: "fun" },
          init: {
            type: "FunctionExpression",
            id: null,
            params: [{ type: "Identifier", name: "a" }],
            body: {
              type: "BlockStatement",
              body: [
                {
                  type: "VariableDeclaration",
                  declarations: [
                    {
                      type: "VariableDeclarator",
                      id: { type: "Identifier", name: "b" },
                      init: { type: "Literal", value: 2, raw: "2" },
                    },
                  ],
                  kind: "const",
                },
                {
                  type: "ReturnStatement",
                  argument: {
                    type: "BinaryExpression",
                    operator: "+",
                    left: { type: "Identifier", name: "a" },
                    right: { type: "Identifier", name: "b" },
                  },
                },
              ],
            },
            generator: false,
            expression: false,
            async: false,
          },
        },
      ],
      kind: "const",
    },
  ],
  sourceType: "script",
}
*/
```

这个例子增加了FunctionExpression，表示函数；BlockStatement表示块级语句；ReturnStatement表示return语句等。与前面词法分析将函数拆分成多个token不一样，这次函数是一个整体，且内部包含了params，BlockStatement和ReturnStatement等，确实是做到了对语法本身的分析。

与tokenize方法一样，语法分析的parse方法也有很多选项，例如支持JSX语法，解析注释，列出在代码中的位置等等，这里就不描述了。除了通过代码之外，还有[AST explorer](https://astexplorer.net/)网站可以将代码在线转换为AST，并且可以在线标黄AST结点对应的代码。

## Estree



## JavaScript中的AST工具列表

### 工具列表

### babel场景用具介绍

## AST的应用（这里可以试一下babel插件？）

## 具体语法树CST

## 总结？

这属于编译原理的内容

## 参考
- 深入理解AST-带你揭秘前端工程的幕后魔法\
  https://juejin.cn/post/7405239837939548160
- AST 抽象语法树知识点\
  https://mp.weixin.qq.com/s/KaIaCjRGC55UB6px15M1kw
- CST vs AST 以及 biome 和 Oxc 各自的选择理由\
  https://juejin.cn/post/7504168956594683943
- Babel文档\
  https://babeljs.io/
- 前端工程化基石 -- AST（抽象语法树）以及AST的广泛应用\
  https://juejin.cn/post/7155151377013047304
- Esprima 文档\
  https://esprima.org/
- 快来享受AST转换的乐趣\
  https://zhuanlan.zhihu.com/p/617125984
- Estree Github\
  https://github.com/estree/estree
- AST explorer JavaScript代码在线转换为AST语法树
  https://astexplorer.net/
