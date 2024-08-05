# 带你搞懂JavaScript中的原型和原型链

## 简介
原型和原型链是JavaScript中与对象有关的重要概念，但是部分前端开发者却不太理解，也不清楚原型链有什么用处。其实，学过其他面对对象语言的同学应该了解，对象是由类生成的实例，类与类之间有继承的关系。在ES6之前，JavaScript中并没有class，实现类和继承的方法就是使用原型。在我个人看来，JS中类和原型链的设计和语法由于一些历史或包袱问题而不易用，也不易于理解。因此在ES6中推出了class相关的语法，和其他语言更接近，也更易用。

> ES6的class可以看作只是一个语法糖，它的绝大部分功能，ES5都可以做到，新的class写法只是让对象原型的写法更加清晰、更像面向对象编程的语法而已。(ECMAScript6入门教程 阮一峰)

虽然有了class，但是原型链相关的内容我们依然要掌握。不仅是因为作为前端开发者，我们要深入理解语法。而且在查看源码，以及实现一些复杂的面对对象写法时，依然是有用的。因此在这篇文章中，我们一起搞懂JavaScript中的原型和原型链。(这篇文章并不会涉及class相关语法)

## 构造函数与原型

### 构造函数
在JS中创建实例的方法是通过构造函数。在构造函数中通过this实现对实例的操控，比如赋值各种属性和方法。我们看个例子：

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

我们创建了PersonFun构造函数，使用new关键字创建了实例p1。可以看到，在构造函数中对this增加了属性和方法，最后成为了实例的属性。注意构造方法必须使用new调用。但是这样所有的属性都是实例属性，包括那个getName方法：
```js
const p1 = new PersonFun('jz');
const p2 = new PersonFun('jz');
console.log(p1.getName === p2.getName);
// 输出结果:
// false
```

### 原型对象
只用上面的构造函数，依然没有“类”的存在。这时候我们增加原型这一概念，可以理解为是实例对象的类。原型对象可以通过构造函数的prototype属性访问。

```js
// Person构造函数
function PersonFun(name) {
  this.name = name;
}
// Person原型对象
PersonFun.prototype.getName = function() {
  return this.name;
}
// 创建实例
const p1 = new PersonFun('jz');
const p2 = new PersonFun('jz');
console.log(p1.name, p1.getName());
console.log(p1.getName === p2.getName);
// 输出结果:
// jz jz
// true
```

可以看到，我们没有在构造函数中添加实例对象的属性方法getName，仅仅在原型对象上添加。但实例对象上依然能使用属性方法getName，而且对于不同的实例来说，这个方法是共享的，是同一个。通过原型，我们不仅能共享方法名也能共享属性值：

```js
// Person原型对象
PersonFun.prototype.title = 'hello';
const p1 = new PersonFun('jz');
const p2 = new PersonFun('jz');
console.log(p1.title, p1.title);
p1.title = '你好'
console.log(p1.title, p2.title);
// 输出结果:
// hello hello
// 你好 hello
```

可以看到，在实例中修改原型上提供的属性，实际上是增加实例中的属性值，因此这个修改是不在实例中共享的。但如果原型提供的属性是个对象，我们修改对象内部的值，这个值是实例间共享的。
```js
PersonFun.prototype.obj = {};
p1.obj.a = 1;
console.log(p2.obj.a);
// 输出结果:
// 1
```

### 构造函数/原型的获取
通过上面的描述，我们了解了实例，构造函数和原型对象以及他们之间的关系。那么在代码中，如何获取构造函数和原型对象呢？我们列出了一些方法：

```js
// 构造函数 PersonFun
// 获取原型对象
Person = PersonFun.prototype
// 创建实例对象
p1 = new PersonFun()

// 原型对象 Person
// 获取构造函数
PersonFun = Person.constructor

// 实例对象 p1
// 获取原型对象
Person = p1.__proto__
Person = Object.getPrototypeOf(p1)
// 获取构造函数
PersonFun = p1.constructor
```

其中的`__proto__`最好使用`Object.getPrototypeOf`代替：
> `__proto__`并不是语言本身的特性，这是各大厂商具体实现时添加的私有属性，虽然目前很多现代浏览器的JS引擎中都提供了这个私有属性，但依旧不建议在生产中使用该属性，避免对环境产生依赖。(ECMAScript6入门教程 阮一峰)

## 字面量的原型

### 字面量对象的原型
如果我们创建对象的时候，没有使用构造函数，而是直接是用大括号，以字面量的形式创建的对象，那么它的原型是什么？它有没有构造函数呢？是有的。我们一起来看一下：
```js
const obj = { a: 1 };
console.log(obj.__proto__)
console.log(obj.constructor)
// 输出结果:
// {constructor: ƒ, __defineGetter__: ƒ, …}
// ƒ Object() { [native code] }
```
输出了一些奇怪的东西，我们还是不知道字面量对象的原型是什么。我们换个角度想一想，以字面量形式创建的对象，是不是就相当于直接使用`new Object()`形式创建的对象？这里的Object也是一个构造函数。我们来试验下：
```js
const obj1 = { a: 1 };
const obj2 = new Object({ b: 2 });
console.log(obj1.__proto__ === obj2.__proto__)
console.log(Object.prototype === obj1.__proto__)
console.log(obj1.constructor === Object)
// 输出结果:
// true
// true
// true
```

可以看到，使用字面量形式和`new Object()`形式，创建出来对象的原型是一样的。既然Object是个构造函数，那么`Object.prototype`即是Object实例的原型对象。

至于`obj.constructor`实际上就是构造函数`Object()`。它是JS内部生成的，因此这里展示`[native code]`。

### new Function()
在JS中函数实际上也是个对象。既然它是个对象，那么它应该也有构造函数和原型吧。我们来试验下：
```js
// Person构造函数
function PersonFun(name) {
  this.name = name;
}
console.log(PersonFun.__proto__)
console.log(PersonFun.constructor)
// 输出结果:
// ƒ () { [native code] }
// ƒ Function() { [native code] }
```

又输出了一些奇怪的东西，其中还有个`Function()`。我们继续联想下：对象可以用`new Object()`形式创建，那么函数是不是也可以？可以的！使用`new Function()`可以创建函数。我们来看下：

```js
const fun = new Function('a', 'b', 'return a + b');
console.log(fun(1, 2));
// 输出结果:
// 3
```

`new Function()`可以使用字符串作为代码执行的函数体，感觉有点像eval。但是eval是局部作用域，`new Function()`一直都是全局作用域。我们来看下例子：
```js
const a = 1;
function envir() {
  const a = 2;
  eval('console.log(a)');
  const fun = new Function('console.log(a)');
  fun();
}
envir();
// 输出结果:
// 2
// 1
```

可以看到，eval输出的是局部作用域中的a值2，而`new Function()`虽然在局部作用域的位置中，但是内部获取到的依然是全局的变量。不过这些区别和我们要讨论的原型链无关，因此不再继续讨论。

### 字面量函数的原型
了解了`new Function()`，我们再回来看看字面量函数的原型。

```js
// Person构造函数
function PersonFun(name) {
  this.name = name;
}
const fun = new Function('a', 'b', 'return a + b');
console.log(PersonFun.__proto__ === fun.__proto__)
console.log(PersonFun.__proto__ === Function.prototype)
console.log(PersonFun.constructor === Function)
// 输出结果:
// true
// true
// true
```

与对象类似，`Function.prototype`是函数的原型，我们函数字面量的原型都是它。函数的构造函数即是`Function()`。（构造函数与普通函数并无区别，都是函数）。在上面的输出中，函数的原型对象`Function.prototype`也是一个函数：`ƒ () { [native code] }`。关于这点我们会在后面讨论。

## JS中的原型关系
了解了字面量相关的原型，现在我们再来刨根问底，看看JS中对象的原型关系。

### 对象的原型关系
首先看下Object原型的关系。

#### 对象的尽头
首先看看对象的尽头。上面讲过字面量对象的原型即是`Object.prototype`。它也是个对象，那么它有没有原型呢？我们试一下：
```js
const obj = { a: 1 };
console.log(obj.__proto__)
console.log(obj.__proto__.__proto__)
// 输出结果:
// {constructor: ƒ, __defineGetter__: ƒ, …}
// null
```
答案是没有的，`Object.prototype`是没有原型的。

#### 自定义构造函数与原生对象的关系
我们的自定义构造函数与对应的实例原型和`Object.prototype`有关系么？我们试验下：
```js
// Person构造函数
function PersonFun(name) {
  this.name = name;
}
// Person原型对象
PersonFun.prototype.getName = function() {
  return this.name;
}
console.log(PersonFun.prototype.__proto__);
console.log(PersonFun.prototype.__proto__ === Object.prototype);
console.log(PersonFun.prototype.constructor === Object);
// 输出结果:
// {constructor: ƒ, __defineGetter__: ƒ, …}
// true
// false
```

可以看到，Person构造函数对应实例的原型对象，它的原型即是`Object.prototype`。但是它与字面量对象不同的是，它的constructor属性表示的是它对应实例的构造函数，而不是字面量对象的`Object()`。

### 原生类型的原型关系
在前面我们聊过了函数的原型，即是`Function.prototype`。但当时我们输出它，发现它是一个函数，那么它究竟是什么？它还有没有原型？

```js
// Person构造函数
function PersonFun(name) {
  this.name = name;
}
console.log(PersonFun.__proto__);
console.log(PersonFun.__proto__.__proto__);
console.log(PersonFun.__proto__.__proto__ === Object.prototype);
console.log(PersonFun.__proto__.prototype);
// 输出结果:
// ƒ () { [native code] }
// {constructor: ƒ, __defineGetter__: ƒ, …}
// true
// undefined
```
可以看到，直接打印函数的原型也是一个函数，里面是`[native code]`，即它也是由JS内部生成的。它的再深一层原型，居然又是`Object.prototype`。函数的原型虽然也是个函数，但是它并没有更深一层的prototype。

这时候我们返回去看看对象原型的构造函数，即`Object()`。作为一个函数，它的原型是什么？
```js
console.log(Object);
console.log(Object.__proto__);
console.log(Object.__proto__ === Function.prototype);
// 输出结果:
// ƒ Object() { [native code] }
// ƒ () { [native code] }
// true
```

看来这些原生类型的构造函数的原型，都同一个来源。我们再试一下其他的原生类型：
```js
console.log(Number);
console.log(Number.__proto__);
console.log(Number.__proto__ === Function.prototype);
console.log(Array);
console.log(Array.__proto__);
console.log(Array.__proto__ === Function.prototype);
console.log(String);
console.log(String.__proto__);
console.log(String.__proto__ === Function.prototype);
new Function.prototype();
// 输出结果:
// ƒ Number() { [native code] }
// ƒ () { [native code] }
// true
// ƒ Array() { [native code] }
// ƒ () { [native code] }
// true
// ƒ String() { [native code] }
// ƒ () { [native code] }
// true
// Uncaught TypeError: Function.prototype is not a constructor
```
果然如此，原生类型的构造函数的原型都是同一个。而如上面实验得出的结论，这个原型是一个函数，它没有构造函数，它的原型是`Object.prototype`。我还尝试直接用这个构造函数原型创建实例，结果提示这不是一个构造函数。

## 原型链
有了上面这些关系，我们发现不同类型对象的原型似乎都是有关系的，好像有一条线可以把他们穿起来。这条线就是我们所说的原型链。在文章一开始的简介中说过，原型和原型链是JavaScirpt中实现类和继承的一种方式。原型就相当于实例的类，继承就像是原型链。因此，原型的特点也很像父类，即实例可以访问原型的属性，也可以覆盖原型属性。在浏览器的控制台中，我们打印一个对象，展示的`[[Prototype]]`即是它的原型。

### 原型链示意图
不仅我们自定义的类型有原型链的关系，JS内部的原生类型也存在原型链，且可以和我们自定义的类型串起来。这里我们用一个图片描述原型链之间的关系（图片来源MollyPages.org）：

![](/2023/prototype-1.jpg)

### 原型链文字版
假设我们有这样一些对象，我们来搞清楚它们的原型关系。
- 构造函数 PersonFun
- 实例对象 p1
- 原型对象(类) Person

```js
// 构造函数 生成 实例对象
p1 = new PersonFun()
// 构造函数 -> 原型对象
Person = PersonFun.prototype

// 实例对象 -> 构造函数
PersonFun = p1.constructor
// 实例对象 -> 原型对象
Person = p1.__proto__
Person = Object.getPrototypeOf(p1) // 推荐

// 原型对象 -> 构造函数
PersonFun = Person.constructor
```

再看一下字面量的原型关系，以及更深层次的关系：
- 字面量对象 obj1
- 字面量函数 fun1

```js
// 字面量对象 -> Object构造函数
Object = obj1.constructor
// 字面量对象 -> Object原型
Object.prototype = obj1.__proto__
// Object原型的原型 为 null
null = Object.prototype.__proto__

// 字面量函数 -> Function构造函数
Function = fun1.constructor
// 字面量函数 -> Function原型
Function.prototype = fun1.__proto__
// Function原型作为一个构造函数时的实例原型 -> undefined
undefined = Function.prototype.prototype
// Function原型的原型 为 Object原型
Object.prototype = Function.prototype.__proto__
```

然后我们就可以完整的得到原型链：
```js
// 构造函数链
// 实例对象 -> 构造函数 -> Function构造函数
PersonFun = p1.constructor
Function  = p1.constructor.constructor
Function  = p1.constructor.constructor.constructor

// 原型对象链
// 实例对象 -> 原型对象 -> Object原型 -> null
Person            = p1.__proto__
Object.prototype  = p1.__proto__.__proto__
null              = p1.__proto__.__proto__.__proto__

// 字面量对象的原型对象链
// 字面量函数 ->  Object原型 -> null
Object.prototype  = obj1.__proto__
null              = obj1.__proto__.__proto__

// 字面量函数的原型对象链
// 字面量函数 -> Function原型 -> Object原型 -> null
Function.prototype  = fun1.__proto__
Object.prototype    = fun1.__proto__.__proto__
null                = fun1.__proto__.__proto__.__proto__

// Number对象的原型链
const n1 = new Number(1);
// Number对象 -> Number原型 -> Object原型 -> null
Number.prototype  = n1.__proto__
Object.prototype  = n1.__proto__.__proto__
null              = n1.__proto__.__proto__.__proto__
```

## 总结

通过原型链，我们可以了解JS中一些原生对象的原理和机制，比如为什么Function的实例也是对象，Number的实例也是对象，因为这些对象的原型都继承了Object原型，因此可以使用对象类型的方法。

使用原型链，也可以实现很多类的继承模式，后面有机会我们可以讨论一下。总体看来，虽然使用原型链确实可以实现类和继承的等面对对象特性，但是相比于其他语言更晦涩且不容易理解。

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
- Javascript Object Layout\
http://www.mollypages.org/tutorials/js.mp
