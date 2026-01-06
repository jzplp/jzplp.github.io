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

### 使用方式

引入全部，引入单个对象，引入单个方法


### 引入方式

全局引入 不全局引入 bundle引入
core-js core-js-pure  core-js-bundle

### 类型？
full actual stable es


## core-js源码结构

参考上面的各种方式说明


## 用个打包工具引入到浏览器中试试？


## Babel与core-js




## 参考
- core-js文档\
  https://core-js.io/
- Github core-js\
  https://github.com/zloirock/core-js
- 解锁Babel核心功能：从转义语法到插件开发\
  https://jzplp.github.io/2025/babel-intro.html
