# JavaScript中的this, 究竟指向什么？（未完成）

在JavaScript代码的不同位置中，this所指向的数据是不一样的。比如大部分同学都知道，在对象的函数数据中，this指向对象本身；在构造函数中，this指向要生成的新对象。事实上，this指向的逻辑不止这几种，this也不只是与原型链有关。在这里我们总结一下，在不同的场景下，JavaScript中的this, 究竟指向什么。

todo 严格模式非严格模式有区别？

## 命令行使用
### globalThis
在观察命令行中的this之前，我们先来了解一下globalThis的概念。globalThis是从不同的JavaScript环境中获取全局对象方法。

由于在部分环境或者在场景下，使用this是无法直接获取到全局对象的，例如一些模块化的JS代码内，以及在部分环境的严格模式下。(具体场景和区别后面会描述)。因此globalThis提供了一个标准的方式来获取不同环境下的全局this对象。这个对象在不同的JavaScript环境中是不一样的。

```js
// 浏览器命令行
console.log(globalThis)
console.log(globalThis === window)
/* 输出
Window {window: Window, self: Window, document: document, ...省略 }
true
*/

// Node.js命令行
console.log(globalThis)
console.log(globalThis === global)
/* 输出
<ref *1> Object [global] { ...省略 }
true
*/
```

可以看到，在浏览器中globalThis就是window对象，而在Node.js中，globalThis是global对象。我们直接在命令行中使用var定义的全局变量，实际上会被作为globalThis的属性。

### 浏览器命令行

### Node.js命令行

### 浏览器HTML中

## JS模块内使用

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
tiodo 考虑和上面形式的结合

## call, bind, apply


## 参考
- MDN globalThis\
  https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/globalThis

