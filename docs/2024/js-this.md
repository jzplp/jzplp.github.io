# JavaScript中的this, 究竟指向什么？（未完成）

在JavaScript代码的不同位置中，this所指向的数据是不一样的。比如大部分同学都知道，在对象的函数数据中，this指向对象本身；在构造函数中，this指向要生成的新对象。事实上，this指向的逻辑不止这几种，this也不只是与原型链有关。在这里我们总结一下，在不同的场景下，JavaScript中的this, 究竟指向什么。

## globalThis
在观察各类this之前，先来了解一下globalThis的概念。globalThis是从不同的JavaScript环境中获取全局对象方法。

由于在部分环境或者在场景下，使用this是无法直接获取到全局对象的，例如一些模块化的JS代码内，以及在部分环境的严格模式下(具体场景和区别后面会描述)。因此globalThis提供了一个标准的方式来获取不同环境下的全局this对象。这个对象在不同的JavaScript环境中是不一样的。

```js
// 浏览器环境
console.log(globalThis)
console.log(globalThis === window)
/* 输出
Window {window: Window, self: Window, document: document, ...省略 }
true
*/

// Node.js环境
console.log(globalThis)
console.log(globalThis === global)
/* 输出
<ref *1> Object [global] { ...省略 }
true
*/
```

可以看到，在浏览器中globalThis就是window对象，而在Node.js中，globalThis是global对象。我们直接在命令行中使用var定义的全局变量，实际上会被作为globalThis的属性（但let和const不会）。这里我们不过多介绍全局对象，感兴趣的同学可以自行了解更多。

## 命令行使用
我们先试一下，直接在命令行使用this，所指向的值是什么。

### 浏览器命令行
浏览器命令行，即是在浏览器调试工具的Console中使用。

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
```

可以看到，在浏览器命令行中直接使用this，实际指向的是globalThis，也就是window对象。在严格模式下表现也一致。

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
```

在浏览器命令行中直接使用this，实际指向的是globalThis，也就是global对象。在严格模式下表现也一致。

## 浏览器HTML中使用
在浏览器的HTML中的this，是否和命令行中不一样呢？我们来试验一下。

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

这里尝试了两种情况，一种是内部脚本语句，第二种是外部脚本文件。两种情况下，this都指向window。在严格模式下表现也一致。输出结果：

```
1 Window {window: Window, self: Window, document: document, ...省略 }
1 true
1 true
2 Window {window: Window, self: Window, document: document, ...省略 }
2 true
2 true
```

## JS模块内使用
由于JavaScript发展历史的原因，JavaScript有很多模块化开发规范，比如：AMD，CMD，UMD，CommonJS等等。后来ECMAScript标准官方定义了ESModule模块化规范，现在大部分环境都支持这个规范。这里我们对目前主流使用的ESModule和CommonJS规范进行说明。

### CommonJS和Node.js



### ESModule和浏览器

### ESModule和Node.js

## 普通函数调用

todo 考虑嵌套函数

### 浏览器命令行

### Node.js命令行

### CommonJS和Node.js

### ESModule和浏览器

### ESModule和Node.js

## 构造函数调用

## 对象的函数属性调用

## 箭头函数调用
todo 考虑和上面形式的结合

## call, bind, apply


## 参考
- MDN globalThis\
  https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/globalThis
- Javascript 中 let 声明的全局变量不在 window 上\
  https://juejin.cn/post/7064043813534171149
- 现代 JavaScript 教程 — "use strict" 现代模式\
  https://juejin.cn/post/6844903956800356360
- MDN this\
  https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/this


