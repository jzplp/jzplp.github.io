# 带你搞懂JavaScript中的原型和原型链（未完成）

## 目录
[[toc]]

## 简介
原型和原型链是JavaScript中与对象有关的重要概念，但是部分前端开发者却不太理解，也不清楚原型链有什么用处。其实，学过其他面对对象语言的同学应该了解，对象是由类生成的实例，类与类之间有继承的关系。在ES6之前，JavaScript中并没有class，实现类和继承的方法就是使用原型。在我个人看来，JS中类和原型链的设计和语法由于一些历史或包袱问题而不易用，也不易于理解。因此在ES6中推出了class相关的语法，和其他语言更接近，也更易用。

> ES6的class可以看作只是一个语法糖，它的绝大部分功能，ES5都可以做到，新的class写法只是让对象原型的写法更加清晰、更像面向对象编程的语法而已。(ECMAScript6入门教程 阮一峰)

虽然有了class，但是原型链相关的内容我们依然要掌握。不仅是因为作为前端开发者，我们要深入理解语法。而且在查看源码，以及实现一些复杂的面对对象写法时，依然是有用的。因此在这篇文章中，我们一起搞懂JavaScript中的原型和原型链。(这篇文章并不会涉及class相关语法)

## 构造函数与原型
在JS中，创建实例的方法是通过构造函数。在构造函数中通过this实现对实例的操控，比如赋值各种属性和方法。我们看个例子：

```js
// Person构造函数
function PersonFun(name) {
  this.name = name;
  this.getName = function() {
    return this.name;
  }
}

// 创建实例
const p1 = new PersonFun('jz');
console.log(p1.name, p1.getName());
// 输出结果:
// jz jz
```

我们创建了PersonFun构造函数，使用new关键字创建了实例p1。可以看到，在构造函数中对this



## Function与Object类型

## 字面量的原型链

## 使用原型链实现各种继承

## 总结

## 参考
- Class的基本语法 ECMAScript6入门教程 阮一峰\
https://es6.ruanyifeng.com/#docs/class
- Class 的继承 ECMAScript6入门教程 阮一峰\
https://es6.ruanyifeng.com/#docs/class-extends
- 一文搞懂JS原型与原型链（超详细，建议收藏）\
https://juejin.cn/post/6984678359275929637
- 你可能不太理解的JavaScript - 原型与原型链\
https://juejin.cn/post/7254443448563040311
- js从原型链到继承——图解来龙去脉\
https://juejin.cn/post/7075354546096046087
