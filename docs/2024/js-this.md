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

这是因为直接用Chrome浏览器打开的本地文件，协议为`file://`。在这个协议下使用ESModule中的import会被认为是跨域。因此我们在本地启动一个Node服务来提供HTTP协议，用来支持import。

```js
// main.js
const http = require('http');
const fs = require('fs');

http.createServer((req, res) => {
  let data = '';
  console.log(`request url: ${req.url}`);
  if(req.url === '/') {
    data = fs.readFileSync('./index.html');
    res.end(data);
  } else if(req.url === '/a.js') {
    data = fs.readFileSync('./a.js');
    // Chrome浏览器要求必须设置Content-type才能使用import
    res.setHeader('Content-type', 'text/javascript');
    res.end(data);
  }
}).listen(8000, () => {
  console.log('server start!');
});
```

然后在命令行执行`node main.js`启动服务，再到浏览器输入`localhost:8000`即可访问页面。查看浏览器Console输出：

```
1 Window {window: Window, self: Window, document: document, ...省略 }
3 undefined
3
2 undefined
2 Window {window: Window, self: Window, document: document, ...省略 }
// 严格模式下表现一致
```

可以看到，在浏览器中非ESModule，this指向window，而在ESModule内，this却是undefined，而globalThis依然指向window不变。

### ESModule和Node.js

虽然在Node.js下默认使用CommonJS规范，但Node.js也是支持ESModule的，但需要手动开启，方式主要有两种：
1. 文件后缀名为.mjs。
2. 所在项目的package.json文件中包含`type: "module"`。

我们在Node.js中开启ESModule，看看this的指向问题。首先是入口文件a.mjs：

```js
import a from "./a.mjs";
console.log(a);
console.log(2, this);
console.log(2, globalThis);
```

然后是被引入的文件b.mjs:

```js
console.log(3, this)
const a = 3;
export default a;
```

最后命令行执行`node a.mjs`，结果如下：

```
3 undefined
3
2 undefined
2 <ref *1> Object [global] { ...省略 }
// 严格模式下表现一致
```

我们构造的示例与浏览器中ESModule的示例基本一致，结果也是一致的，除了在Node.js中，globalThis依然指向global对象。

因此，不管是Node.js还是浏览器环境，在ESModule的模块上下文中，this的指向都是undefined。

## 场景小总结

通过上面对于全局上下文/模块上下文的实验结果，我们总结出了六种场景：

* 浏览器命令行
* 浏览器HTML中
* Node.js命令行
* CommonJS和Node.js
* ESModule和浏览器
* ESModule和Node.js

后续的实验都会考虑这六种场景，以及对应的严格模式。

## 普通函数上下文
在普通函数上下文，以及普通函数的嵌套函数中，this指向什么？在不同的环境和模块化规范下，this指向有什么区别呢？我们在不同的场景执行同一段代码，看看结果区别如何。

```js
function fun1() {
  console.log(1, this);
  function fun2() {
    console.log(2, this);
  }
  fun2();
  return fun2;
}
const fun2 = fun1();
fun2();
```

### 浏览器命令行
首先看看在浏览器命令行执行的结果：

```
// 非严格模式
1 Window {window: Window, self: Window, document: document, ...省略 }
2 Window {window: Window, self: Window, document: document, ...省略 }
2 Window {window: Window, self: Window, document: document, ...省略 }
```

可以看到，浏览器命令行的不管是单层函数，还是嵌套函数，都是指向window，也就是globalThis。但是在严格模式下表现并不一致：

```
// 严格模式
1 undefined
2 undefined
2 undefined
```

在严格模式下，this值为undefined。这里先不解释，在专门的严格模式总结中描述。

### 浏览器HTML中
看一下在浏览器HTML中执行的结果：

```
// 非严格模式
1 Window {window: Window, self: Window, document: document, ...省略 }
2 Window {window: Window, self: Window, document: document, ...省略 }
2 Window {window: Window, self: Window, document: document, ...省略 }

// 严格模式
1 undefined
2 undefined
2 undefined
```

浏览器HTML中与浏览器命令行的效果完全一致，而且是否严格模式的表现也不一致。

### Node.js命令行
看一下在Node.js命令行中执行的结果：

```
// 非严格模式
1 <ref *1> Object [global] { ...省略 }
2 <ref *1> Object [global] { ...省略 }
2 <ref *1> Object [global] { ...省略 }

// 严格模式
1 undefined
2 undefined
2 undefined
```

结果与在浏览器中类似，非严格模式指向globalThis，严格模式为undefined。

### CommonJS和Node.js
看一下在Node.js中，使用CommonJS规范中执行的结果：

```
// 非严格模式
1 <ref *1> Object [global] { ...省略 }
2 <ref *1> Object [global] { ...省略 }
2 <ref *1> Object [global] { ...省略 }

// 严格模式
1 undefined
2 undefined
2 undefined
```

结果还是与前面类似，非严格模式指向globalThis，严格模式为undefined。

### ESModule和浏览器
看一下在浏览器中，使用ESModule规范中执行的结果：

```
// 非严格模式
1 undefined
2 undefined
2 undefined

// 严格模式
1 undefined
2 undefined
2 undefined
```

ESModule规范中，this的值全都是undefined。

### ESModule和Node.js
看一下在Node.js中，使用ESModule规范中执行的结果：

```
// 非严格模式
1 undefined
2 undefined
2 undefined

// 严格模式
1 undefined
2 undefined
2 undefined
```

ESModule规范中，this的值全都是undefined。

### 小总结
通过上面不同环境下的实验，可以看到在普通函数上下文中，this指向globalThis；而在严格模式中，this值为undefined。至于ESModule规范，它是默认开启严格模式的，因此全是undefined。

## 构造函数上下文
构造函数是JavaScript原型链和类的重要概念，是生成实例对象的方法，构造函数中的this，指向的就是我们要生成的实例对象的this。这里我们来执行一段代码，试验一下。

```js
let global1 = null;
function C1() {
  global1 = this;
  console.log(1, this);
  this.a = 1;
  console.log(1, this);
}
const c1 = new C1();
console.log(1, global1, c1, global1 === c1);

let global2 = null;
class C2 {
  a = 2;
  constructor() {
    global2 = this;
    console.log(2, this);
    this.b = 2;
    console.log(2, this);
  }
}
const c2 = new C2();
console.log(2, global2, c2, global2 === c2);

let global3 = null;
function C3() {
  global3 = this;
  this.a = 1;
  console.log(3, this);
  return {};
}
const c3 = new C3();
console.log(3, global3, c3, global3 === c3);
```

代码中分别尝试了三种情形，分别是传统构造函数，Class类的构造函数，以及在构造函数中返回另一个对象。来看一下输出：

```
1 C1 {}
1 C1 { a: 1 }
1 C1 { a: 1 } C1 { a: 1 } true
2 C2 { a: 2 }
2 C2 { a: 2, b: 2 }
2 C2 { a: 2, b: 2 } C2 { a: 2, b: 2 } true
3 C3 { a: 1 }
3 C3 { a: 1 } {} false
```

由于构造函数中的this是JavaScript语法规定的特性，因此不同的环境和是否严格模式表现都是一致的。可以看到，构造函数上下文中的this，确实是指向创建的实例对象，不管是传统构造函数还是Class类的构造函数。

如果构造函数返回另一个对象，那么这个返回的对象并不属于这个构造函数的实例对象；构造函数中的this也不指向返回对象，而是指向真正的实例对象。

## 对象或实例属性的函数上下文
### 函数属性
如果一个函数是某个对象或者实例的属性，那么这个函数的内部的this，指向的应该是这个对象/实例本身。这里我们来执行一段代码，试验一下。

```js
function fun() {
  console.log(this);
}

const a = {};
a.fun = fun;
a.fun();

function C1() {
  this.fun = fun;
}
const b = new C1();
b.fun();
```

对于函数fun，我们尝试了两种情况，一种先创建对象，再作为对象属性赋值，另一种是在构造函数中作为属性赋值。我们来看一下输出：

```
{ fun: [Function: fun] }
C1 { fun: [Function: fun] }
```

由于对象或实例属性函数中的this是JavaScript语法规定的特性，因此不同的环境和是否严格模式表现都是一致的。可以看到分别输出了普通对象和C1的实例。

结合上面关于普通函数上下文的实验，可以看到其实函数本身是“不拥有自己的this的”，函数内部的this，完全看调用这个函数所在的环境和调用方式。如果是以对象属性的形式调用，this就指向对象本身；如果是直接调用，则指向globalThis或者严格模式下为undefined。

### get和set
一个对象的取值函数getter和存值函数setter也都是函数，在其中也能获取到this。在这里面this指向什么呢？

```js
const c1 = {
  get g1() {
    console.log("1 get", this);
    return 1;
  },
  set g1(val) {
    console.log("1 set", this);
  },
};
c1.g1 = c1.g1;

const c2 = {};
Object.defineProperty(c2, "g2", {
  enumerable: true, // 对象可以枚举
  get() {
    console.log("2 get", this);
    return 1;
  },
  set(val) {
    console.log("2 set", this);
  },
});
c2.g2 = c2.g2;
```

这里又尝试了两种情况，一种是定义对象时直接提供getter和setter，一种是先定义对象，后面使用Object.defineProperty添加。我们看一下输出。

```
1 get { g1: [Getter/Setter] }
1 set { g1: [Getter/Setter] }
2 get { g2: [Getter/Setter] }
2 set { g2: [Getter/Setter] }
```

可以看到，分别输出了getter和setter所属的对象。由于getter和getter函数中的this是JavaScript语法规定的特性，因此不同的环境和是否严格模式表现都是一致的。

## 原型函数属性上下文
上面介绍了实例属性的函数中，this的指向问题。那我们再看一下如果这个函数属性是挂在原型上的，或者是原型上的set和get，this指向如何。

### 原型函数属性
首先来看看原型上的函数属性。

```js
class C1 {
  a = 1;
  fun() {
    console.log(1, this);
  }
}
const c1 = new C1();
c1.fun();

function C2() {
  this.a = 2;
}
C2.prototype = {
  fun() {
    console.log(2, this);
  },
};
const c2 = new C2();
c2.fun();

function C3() {
  this.a = 3;
}
const c3 = new C3();
const c3proto = {
  fun() {
    console.log(3, this);
  },
};
c3.__proto__ = c3proto;
c3.fun();
c3proto.fun();
```

上面代码尝试了三种情况，分别是class关键字直接创建原型；在构造函数上提供原型；以及在实例上直接赋值原型。其中最后一种我们还尝试了在原型上直接调用函数，这相当于上一节对象的函数属性上下文。看一下输出结果：

```
// 浏览器输出
1 C1 { a: 1 }
2 C2 { a: 2 }
3 C3 { a: 3 }
3 { fun: [Function: fun] }

// Node.js输出
1 C1 { a: 1 }
2 { a: 2 }
3 { a: 3 }
3 { fun: [Function: fun] }

// 严格模式下表现一致
```

可以看到，在浏览器和Node.js中的输出有区别，是情况2和3的输出不同。浏览器中明确指出了这是C2和C3的实例，但是Node.js并没有。那是不是就说明Node.js中this指向的不是实例呢？

并不是的，查看代码发现所有的a都是实例属性，而不是原型属性。因此实际上无论浏览器或者Node.js，这三种场景this指向的都是实例对象，而不是原型对象。只不过原型更改后，Node.js对于console.log的输出处理不同。

再看最后一句输出：原型对象调用fun函数，函数中的this指向的是原型对象；实例调用fun函数，函数中的this指向的是实例对象。因此函数中this的指向和函数本身无关，而是和函数的“调用形式”有关。

### 原型的get和set
首先来看看原型上的取值函数getter和存值函数setter。仿照上一节给出了代码：

```js
class C1 {
  a = 1;
  get g1() {
    console.log("1 get", this);
    return 1;
  };
  set g1(val) {
    console.log("1 set", this);
  };
}
const c1 = new C1();
c1.g1 = c1.g1;

function C2() {
  this.a = 2;
}
C2.prototype = {
  get g2() {
    console.log("2 get", this);
    return 1;
  },
  set g2(val) {
    console.log("2 set", this);
  },
};
const c2 = new C2();
c2.g2 = c2.g2;

function C3() {
  this.a = 3;
}
const c3proto = {
  get g3() {
    console.log("3 get", this);
    return 1;
  },
  set g3(val) {
    console.log("3 set", this);
  },
};
const c3 = new C3();
c3.__proto__ = c3proto;
c3.g3 = c3.g3;
c3proto.g3 = c3proto.g3;
```

来看一下各个环境的输出结果：

```
// 浏览器输出
1 get C1 { a: 1 }
1 set C1 { a: 1 }
2 get C2 { a: 2 }
2 set C2 { a: 2 }
3 get C3 { a: 3 }
3 set C3 { a: 3 }
3 get { g3: [Getter/Setter] }
3 set { g3: [Getter/Setter] }

// Node.js输出
1 get C1 { a: 1 }
1 set C1 { a: 1 }
2 get { a: 2 }
2 set { a: 2 }
3 get { a: 3 }
3 set { a: 3 }
3 get { g3: [Getter/Setter] }
3 set { g3: [Getter/Setter] }

// 严格模式下表现一致
```

可以看到，浏览器和Node.js的输出是不同的，但不同点依然是Node.js对于console.log的输出处理不同，本质上指向的还是同一个对象。

然后我们看下输出结果，发现原型上的getter和setter与在原型上的函数属性一致，其中的this都指向调用它的对象。如果是实例调用就指向实例，原型直接调用就指向原型。

## 类的静态方法上下文
### 类的静态方法与getter,setter
与实例属性或者原型属性一样，类本身也有自己的静态属性。那么在类的静态方法中，this的指向如何呢？

```js
class C1 {
  static a = 1;
  static fun() {
    console.log(this, this === C1);
  }
  static get g1() {
    console.log('get', this, this === C1);
    return 1;
  }
  static set g1(val) {
    console.log('set', this, this === C1);
  }
}
C1.fun();
C1.g1 = C1.g1;
```

我们尝试了类的静态属性方法，以及类的静态getter，setter。来看下输出结果：

```
[class C1] { a: 1 } true
get [class C1] { a: 1 } true
set [class C1] { a: 1 } true
```

可以看到，指向的都是类本身。没有指向实例（甚至这个例子都没有创建实例），也没有指向原型。注意这里没有包含传统的构造函数形式的类静态方法的例子。因为那种场景与直接对一个函数赋值一个属性没有任何区别。如果没有对这个函数使用new，甚至都看不出它是一个构造函数。因此，类的静态方法实际上就是类这个对象的方法而已。由于类的静态方法的this是JavaScript语法规定的特性，因此不同的环境和是否严格模式表现都是一致的。

### 类的静态块
类的静态属性中有一个特殊一点的叫做静态块，它是为了类静态属性的初始化逻辑而设置的。我们来看一下，在类的静态块中，this指向什么。

```js
class C1 {
  static a = 1;
  static {
    console.log(this);
  }
}

// 输出
// [class C1] { a: 1 }
```

可以看到，类的静态块中的this指向的就是类本身。由于类的静态块中的this是JavaScript语法规定的特性，因此不同的环境和是否严格模式表现都是一致的。

## 继承-构造函数
了解实例和原型的上下文之后，我们再来了解一下与继承有关的场景中this的指向问题。首先来看一下继承中的构造函数。

```js
class C1 {
  constructor() {
    console.log(1, this);
  }
  a = 1;
  fun1(){}
}

class C2 extends C1 {
  constructor() {
    // console.log(this) 这里会报错
    super();
    console.log(2, this);
  }
  b = 2;
  fun2() {}
}

const c1 = new C1();
const c2 = new C2();

/* 输出
1 C1 { a: 1 }
1 C2 { a: 1 }
2 C2 { a: 1, b: 2 }
*/
```

首先我们创建了一个父类C1的实例，此时this指向父类的实例。子类C2继承了C1，在创建实例的时候，调用super()，即执行父类的构造函数。在super()执行前，不可以使用this，会报错的。

可以看到父类的构造函数输出this中类名是子类C2，而不是父类本身C1。这是由继承的机制决定的，我们创建的是子类C2的实例，而不是父类C1的。但是由于父类构造函数需要先执行，此时子类的实例属性还没挂载到实例上，因此没有`b: 2`。在子类的构造函数中，此时子类的实例属性就已经被挂载了。

由于继承构造函数中的this是JavaScript语法规定的特性，因此不同的环境和是否严格模式表现都是一致的。



## super上下文

## 箭头函数上下文
todo 考虑和上面形式的结合

## 回调函数

## call, bind, apply


## 严格模式总结

`"use strict";`

ESModule是自动使用严格模式的，我们是否设置`"use strict";`对this指向没有影响。class中是自动使用严格模式的。

### 类内的函数放到外面执行
todo 具体描述后面补充。class中是自动使用严格模式的。那也就是说，类内的函数放到外面执行，也具有严格模式的性质。

```js
class C1 {
  fun() {
    console.log(this);
  }
}

const c1 = new C1();
c1.fun();
const {fun} = c1;
fun();

function fun1() {
  console.log(1, this);
}
fun1();
```

todo 试验下 实例方法等其它情况。

## 部分特殊场景


## 复杂组合场景讨论



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
- 《ECMAScript6入门教程》Class 的基本语法\
  https://es6.ruanyifeng.com/#docs/class
- 《ECMAScript6入门教程》Class 的继承\
  https://es6.ruanyifeng.com/#docs/class-extends

