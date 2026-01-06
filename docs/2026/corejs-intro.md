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

### 类型？
full actual stable es


## core-js源码结构

参考上面的各种方式说明

core-js core-js-pure  core-js-bundle

full actual stable es

## 用个打包工具引入到浏览器中试试？

core-js-bundle

## Babel与core-js




## 参考
- core-js文档\
  https://core-js.io/
- Github core-js\
  https://github.com/zloirock/core-js
- 解锁Babel核心功能：从转义语法到插件开发\
  https://jzplp.github.io/2025/babel-intro.html
