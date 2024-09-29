# JavaScript中的this, 究竟指向什么？（未完成）

在JavaScript代码的不同位置中，this所指向的数据是不一样的。比如大部分同学都知道，在对象的函数属性方法中，this指向对象本身；在构造函数中，this指向要生成的新对象。事实上，this指向的逻辑不止这几种，this也不只是与原型链有关。在这里我们总结一下，在不同的场景下，JavaScript中的this, 究竟指向什么。

todo 测试每一种都要带严格模式试一下。

## globalThis
在观察各类this之前，先来了解一下globalThis的概念。globalThis是从不同的JavaScript环境中获取全局对象方法。

由于在部分环境或者上下文中，使用this是无法直接获取到全局对象的，例如一些模块化的JS代码内，以及在部分上下文的严格模式下(具体场景和区别后面会描述)。因此globalThis提供了一个标准的方式来获取不同环境下的全局this对象。这个对象在不同的JavaScript环境中是不一样的。

```js
// 浏览器环境
console.log(globalThis)
console.log(globalThis === window)
/* 输出
Window {window: Window, self: Window, document: document, ...省略 }
true
*/
// 严格模式下表现一致

// Node.js环境
console.log(globalThis)
console.log(globalThis === global)
/* 输出
<ref *1> Object [global] { ...省略 }
true
*/
// 严格模式下表现一致
```

可以看到，在浏览器中globalThis就是window对象，而在Node.js中，globalThis是global对象。我们直接在命令行中使用var定义的全局变量，实际上会被作为globalThis的属性（但let和const不会）。这里我们不过多介绍全局对象，感兴趣的同学可以自行了解更多。

## 命令行全局上下文
我们先试一下，直接在命令行的全局上下文中使用this，所指向的值是什么。

### 浏览器命令行
浏览器命令行，即是在浏览器调试工具的Console中使用this。

```js
// 浏览器命令行
console.log(this)
console.log(this === globalThis)
console.log(this === window)
/* 输出
Window {window: Window, self: Window, document: document, ...省略 }
true
true
*/
// 严格模式下表现一致
```

可以看到，在浏览器命令行的全局上下文中直接使用this，实际指向的是globalThis，也就是window对象。

### Node.js命令行
Node.js命令行，即使用node命令，不带其他参数，进入交互式shell。

```js
// Node.js命令行
console.log(this)
console.log(this === globalThis)
console.log(this === global)
/* 输出
<ref *1> Object [global] { ...省略 }
true
true
*/
// 严格模式下表现一致
```

在浏览器命令行的全局上下文中直接使用this，实际指向的是globalThis，也就是global对象。

## 浏览器HTML中的全局上下文
在浏览器的HTML的全局上下文中的this，是否和命令行中不一样呢？我们来实验一下。

```html
<html>
  <body>
    <script>
      console.log(1, this);
      console.log(1, this === globalThis);
      console.log(1, this === window);
    </script>
    <script src="1.js"></script>
  </body>
</html>
```

引用的1.js内容：

```js
console.log(2, this);
console.log(2, this === globalThis);
console.log(2, this === window);
```

这里尝试了两种情况，一种是内部脚本语句，第二种是外部脚本文件。两种情况下，this都指向window。输出结果：

```
1 Window {window: Window, self: Window, document: document, ...省略 }
1 true
1 true
2 Window {window: Window, self: Window, document: document, ...省略 }
2 true
2 true
// 严格模式下表现一致
```

## CommonJS中的模块上下文
由于JavaScript发展历史的原因，JavaScript有很多模块化开发规范，比如：AMD，CMD，UMD，CommonJS等等。后来ECMAScript标准官方定义了ESModule模块化规范，现在大部分环境都支持这个规范。我们对目前主流使用的ESModule和CommonJS规范进行说明。首先看一下CommonJS，这种规范最常用在Node.Js环境。

### 单个文件
假设我们有一个js文件，里面没有任何模块化规范相关的代码。我们使用命令行直接执行这个文件`node 1.js`，这时模块上下文中this的值指向什么呢？是否和命令行直接执行代码一致呢？这里举个例子看下：

```js
console.log(this)
console.log(this === globalThis);
console.log(this === global);
/* 输出
{}
false
false
*/
// 严格模式下表现一致
```

注意我们不能在带package.json的项目里面执行，否则项目配置会干扰我们的判断。这时查看结果，看到并不是global，而是一个空对象。这个空对象是什么呢？我们继续实验下：

```js
console.log(this)
console.log(module.exports)
console.log(this === module.exports)
/* 输出
{}
{}
true
*/
// 严格模式下表现一致
```

原来这时候的this是module.exports！这是CommonJS规范中的模块导出内容。也就是说，在我们没有指定规范，且代码内容也没有任何规范相关指示时，Node.js命令行执行的文件会包裹在CommonJS模块中运行。(后面部分会说明如何使文件在ESModule规范下运行)

这时候this的指向与直接命令行执行代码不同，这时候的this，指向的就是module.exports。我们再看一个例子：

```js
console.log(1, this)
console.log(1, module.exports)
console.log(1, this === module.exports)

this.a = 1;
exports.b = 2;

console.log(2, this)
console.log(2, module.exports)
console.log(2, exports)
console.log(2, this === module.exports)

module.exports.c = 3;

console.log(3, this)
console.log(3, module.exports)
console.log(3, this === module.exports)

module.exports = {d: 4};

console.log(4, this)
console.log(4, module.exports)
console.log(4, exports)
console.log(4, this === module.exports)

/* 输出
1 {}
1 {}
1 true
2 { a: 1, b: 2 }
2 { a: 1, b: 2 }
2 { a: 1, b: 2 }
2 true
3 { a: 1, b: 2, c: 3 }
3 { a: 1, b: 2, c: 3 }
3 true
4 { a: 1, b: 2, c: 3 }
4 { d: 4 }
4 { a: 1, b: 2, c: 3 }
5 false
*/
// 严格模式下表现一致
```

这个例子比较长。最上面我们输出了this和module.exports，都是空对象。然后我们将this和exports都添加了不同的属性，发现this和CommonJS的导出对象都增加了，也证明了exports和module.exports实际是同一个对象。然后在module.exports添加了属性，this中也同时被添加了。

然后看最后一步，我们将module.exports整个替换为其它对象，这时候this和module.exports就再不是一个对象了。而exports依旧是旧对象不变。这里this和exports被覆盖的逻辑是一样的，导出的内容会被新的module.exports覆盖。

### CommonJS模块文件
这里新建两个CommonJS模块文件，看看this的指向问题。首先是入口文件a.js内容:

```js
const b = require("./b");
console.log(b);

console.log("a1", this);
console.log("a1", module.exports);
console.log("a1", this === module.exports);

exports.a = 1;

console.log("a2", this);
console.log("a2", module.exports);
console.log("a2", this === module.exports);
```

然后是被引用的b.js内容:

```js
console.log("b1", this);
console.log("b1", module.exports);
console.log("b1", this === module.exports);

this.b = 2;
module.exports.c = 3;

console.log("b2", this);
console.log("b2", module.exports);
console.log("b2", this === module.exports);
```

命令行执行`node a.js`，然后我们看一下输出结果：

```
b1 {}
b1 {}
b1 true
b2 { b: 2, c: 3 }
b2 { b: 2, c: 3 }
b2 true
{ b: 2, c: 3 }
a1 {}
a1 {}
a1 true
a2 { a: 1 }
a2 { a: 1 }
a2 true
// 严格模式下表现一致
```

因为文件a中先引用了文件b，所以文件b先输出。首先可以看到，在文件b中，我们使用this和module.exports本身对导出对象添加了属性，可以看到这并不影响this的指向，this依旧指向导出对象，而且我们添加的属性在文件a中成功的输出了。而文件a中this指向的是该文件独立的导出对象，与文件b的导出对象无关。

### this是不是模块内的"全局对象"
前面了解到，我们直接在命令行中使用var定义的全局变量，实际上会被作为globalThis的属性。上面我们也清楚了，在CommonJS模块内的this，并不是全局对象，而是该模块的初始导出对象。那么这里的this，是否可以作为这个模块局部的“全局对象”呢？也就是说，在模块中使用var定义的变量，会不会也挂在this上呢？我们来尝试一下。

```js
console.log(this);
var a = 1;
this.b = 2;
module.exports.c = 3;
console.log(this);
console.log(b);
/* 输出
{}
{ b: 2, c: 3 }
ReferenceError: b is not defined
*/
// 严格模式下表现一致
```

首先使用var定义了变量a，但是后面输出this时，里面并没有a。然后对this添加了属性b，并尝试直接输出变量b，可以看到变量b找不到，引发了异常。可以得出结论，CommonJS中的this，用法并不像globalThis一样，并不是一个模块内的"全局对象"。

### 小总结
可以看到，当我们在CommonJS模块中使用this时，this指向的是该模块初始的导出对象。此时我们给this添加属性，属性值也会被导出。但如果我们覆盖了导出对象，此时导出对象就和this无关了。另外，模块中的this并不能类似像全局globalThis一样，不能模块内变量作为自身的属性。这个也容易理解，如果真的有这种特性，那模块内的变量统统被导出，模块导出机制会变得非常混乱。

## ESModule中的模块上下文
ESModule模块化规范是ECMAScript标准官方定义的，目前大部分环境都支持这个规范。这里列举Node.Js和浏览器环境，看一下在模块上下文中，this究竟指向什么。

### ESModule和浏览器
我们来看下在浏览器中的表现。首先是index.html:

```html
<html>
  <body>
    <script>
      console.log(1, this);
    </script>
    <script type="module">
      import a from "./a.js";
      console.log(a);
      console.log(2, this);
      console.log(2, globalThis);
    </script>
  </body>
</html>
```

然后是index.html中引用的a.js：

```js
console.log(3, this)
const a = 3;
export default a;
```

我们直接在浏览器中打开，却发现报错：

![](/2024/this-1.png)


### ESModule和Node.js

## 普通函数上下文

todo 考虑嵌套函数

### 浏览器命令行

### Node.js命令行

### CommonJS和Node.js

### ESModule和浏览器

### ESModule和Node.js

## 严格模式总结

`"use strict";`

## 构造函数上下文

## 对象的函数属性上下文

## 箭头函数上下文
todo 考虑和上面形式的结合

## call, bind, apply


## 参考
- MDN globalThis\
  https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/globalThis
- Javascript 中 let 声明的全局变量不在 window 上\
  https://juejin.cn/post/7064043813534171149
- MDN 严格模式\
  https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Strict_mode
- MDN this\
  https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/this
- JS 中在严格模式下 this 的指向 超详细\
  https://www.cnblogs.com/cyy22321-blog/p/16672057.html
- 「万字进阶」深入浅出 Commonjs 和 Es Module\
  https://juejin.cn/post/6994224541312483336
