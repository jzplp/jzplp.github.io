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
再来看看原型上的取值函数getter和存值函数setter。仿照上一节给出了代码：

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

## 继承-构造函数上下文
了解实例和原型的上下文之后，我们再来了解一下与继承有关的场景中this的指向问题。首先来看一下继承中的构造函数上下文。

```js
class C1 {
  constructor() {
    console.log(1, this);
  }
  a = 1;
  fun1() {}
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


## 继承-实例函数属性上下文
再来看看继承中的函数属性上下文，首先来看下继承中的实例属性上下文。我们构造下例子：

```js
function fun() {
  console.log(this);
}
class C1 {
  constructor() {
    this.fun1 = fun;
  }
  a = 1;
}
class C2 extends C1 {
  constructor() {
    super();
    this.fun2 = fun;
  }
  b = 2;
}

const c1 = new C1();
c1.fun1();
const c2 = new C2();
c2.fun1();
c2.fun2();

/* 输出
C1 { a: 1, fun1: [Function: fun] }
C2 { a: 1, fun1: [Function: fun], b: 2, fun2: [Function: fun] }
C2 { a: 1, fun1: [Function: fun], b: 2, fun2: [Function: fun] }
*/
```

首先我们创建了类C1的实例，没有用到继承，输出也是类C1的实例。然后我们创建了类C2的实例，继承C1，调用C1中的实例属性，发现此时this是C2的实例，与类C2自己绑定的fun2函数输出一致。至于函数中的super.xx用法指向的是原型，并不是实例属性，因此这个场景无法使用。

由于继承实例函数属性上下文中的this是JavaScript语法规定的特性，因此不同的环境和是否严格模式表现都是一致的。

## 继承-原型函数属性上下文
看完了继承的实例函数属性，再看下继承的原型函数属性上下文。

### 函数属性
首先看一下普通的函数属性，我们构造下例子：

```js
class C1 {
  a = 1;
  fun1() {
    console.log(1, this);
  }
}
class C2 extends C1 {
  b = 2;
  fun2() {
    console.log(2, this);
  }
  fun3() {
    super.fun1();
  }
}

const c1 = new C1();
c1.fun1();
const c2 = new C2();
c2.fun1();
c2.fun2();
c2.fun3();

/* 输出
1 C1 { a: 1 }
1 C2 { a: 1, b: 2 }
2 C2 { a: 1, b: 2 }
1 C2 { a: 1, b: 2 }
*/
```

可以看到与实例属性一致，在类C2的实例上调用的方法，其中继承的this指向的都是类C2的实例。注意最后一个输出，我们是使用super.xxx调用父类的原型方法，结果也是一致的。

由于继承原型函数属性上下文中的this是JavaScript语法规定的特性，因此不同的环境和是否严格模式表现都是一致的。

### get和set
再来看看继承原型上的取值函数getter和存值函数setter。我们构造下例子：

```js
class C1 {
  a = 1;
  get g1() {
    console.log("1 get", this);
    return 1;
  }
  set g1(val) {
    console.log("1 set", this);
  }
}
class C2 extends C1 {
  b = 2;
  get g2() {
    console.log("2 get", this);
    return 1;
  }
  set g2(val) {
    console.log("2 set", this);
  }
  fun() {
    super.g1 = super.g1;
  }
}

const c1 = new C1();
c1.g1 = c1.g1;
const c2 = new C2();
c2.g1 = c2.g1;
c2.g2 = c2.g2;
c2.fun();

/* 输出
1 get C1 { a: 1 }
1 set C1 { a: 1 }
1 get C2 { a: 1, b: 2 }
1 set C2 { a: 1, b: 2 }
2 get C2 { a: 1, b: 2 }
2 set C2 { a: 1, b: 2 }
1 get C2 { a: 1, b: 2 }
1 set C2 { a: 1, b: 2 }
*/
```

与普通函数属性一致，我们在在类C2的实例上使用getter和setter，其中继承的this指向也是类C2的实例。包括我们使用super直接调用类C1原型上的方法。由于继承原型函数属性上下文中的this是JavaScript语法规定的特性，因此不同的环境和是否严格模式表现都是一致的。

## 继承-类的静态方法上下文
看完了继承的实例属性和原型属性，再来看看它的静态方法上下文中，this的指向。

### 外部和静态方法中调用
```js
class C1 {
  static a = 1;
  static fun1() {
    console.log(1, this);
  }
}

class C2 extends C1 {
  static b = 1;
  static fun2() {
    console.log(2, this);
  }
  static fun3() {
    super.fun1();
  }
}

C1.fun1();
C2.fun1();
C2.fun2();
C2.fun3();

/* 输出
1 [class C1] { a: 1 }
1 [class C2 extends C1] { b: 1 }
2 [class C2 extends C1] { b: 1 }
1 [class C2 extends C1] { b: 1 }
*/
```

可以看到在子类中调用父类的静态方法，其中的this指向的是子类。这与在子类实例中调用父类(实例或原型)方法是一样的逻辑。最后我们尝试了以super的形式调用父类方法，this指向的也是子类。由于继承类的静态方法上下文中的this是JavaScript语法规定的特性，因此不同的环境和是否严格模式表现都是一致的。

### 静态块中调用
在子类中调用父类方法还有一个场景，就是静态块。我们举例试一下：

```js
class C1 {
  static a = 1;
  static fun() {
    console.log('1 fun', this);
  }
  static {
    console.log(1, this);
  }
}

class C2 extends C1 {
  static b = 1;
  static {
    console.log(2, this);
    this.fun();
    super.fun();
  }
}

/* 输出
1 [class C1] { a: 1 }
2 [class C2 extends C1] { b: 1 }
1 fun [class C2 extends C1] { b: 1 }
1 fun [class C2 extends C1] { b: 1 }
*/
```

这里在静态块中尝试了使用this和super调用父类的静态方法，结果其中的this指向的都是子类。由于继承类的静态方法在静态块中调用上下文中的this是JavaScript语法规定的特性，因此不同的环境和是否严格模式表现都是一致的。

## call方法
上面我们介绍了很多函数场景下，this的指向问题，其中无论是普通对象，类还是原型，修改函数中this指向的方式实际上都是obj.fun()。那么有没有方法，不需要将函数附加到对象上即可绑定this？下面要介绍的三个方法，call，bind和aplly，可以做到。首先介绍call方法。

使用 call()可以在调用函数时让this指向指定的值。我们看一下例子：

```js
function fun(val) {
  console.log(val, this);
}
const obj = { a: 1 };
fun.call(obj, 2);

/* 输出
2 { a: 1 }
*/
```

可以看到，使用call方法的第一个入参为要指向的this，后面的入参为函数本身原有的入参。call方法可以做到不修改对象绑定this，同时执行函数。

如果call方法的第一个入参为null和undefined：在非严格模式下，此时它的this指向和不使用call方法一致，即为globalThis，可以参考上面普通函数场景下的输出。如果为严格模式，那么还是指向call方法的第一个入参。

```js
function fun() {
  console.log(this);
}
fun.call();
fun.call(undefined);
fun.call(null);

/* 输出
// 非严格模式 Node.js
<ref *1> Object [global] { ...省略 }
<ref *1> Object [global] { ...省略 }
<ref *1> Object [global] { ...省略 }
// 非严格模式 浏览器
Window {window: Window, self: Window, document: document, ...省略 }
Window {window: Window, self: Window, document: document, ...省略 }
Window {window: Window, self: Window, document: document, ...省略 }
// 严格模式
undefined
undefined
null
*/
```

## apply方法
apply方法与上面介绍的call方法非常类似，也是不需要将函数附加到对象上即可绑定this，执行函数。他俩的区别在于函数传参方式不同，apply是用数组的形式传参。我们看一下示例：

```js
function fun(a, b) {
  console.log(a, b, this);
}

const obj = { a: 1 };
fun.call(obj, 1, 2);
fun.apply(obj, [1, 2]);

/* 输出
1 2 { a: 1 }
1 2 { a: 1 }
*/
```

可以看到，call方法会将除了第一个参数外的所有参数都传给原函数，而apply的第二个方法是一个数组，数组的内容就是第二个函数的参数列表。

如果apply方法的第一个入参为null和undefined，它的表现与call方法一致：在非严格模式下，此时它的this指向和不使用call方法一致，即为globalThis，可以参考上面普通函数场景下的输出。如果为严格模式，那么还是指向call方法的第一个入参。

```js
function fun() {
  console.log(this);
}
fun.apply();
fun.apply(undefined);
fun.apply(null);

/* 输出
// 非严格模式 Node.js
<ref *1> Object [global] { ...省略 }
<ref *1> Object [global] { ...省略 }
<ref *1> Object [global] { ...省略 }
// 非严格模式 浏览器
Window {window: Window, self: Window, document: document, ...省略 }
Window {window: Window, self: Window, document: document, ...省略 }
Window {window: Window, self: Window, document: document, ...省略 }
// 严格模式
undefined
undefined
null
*/
```

## bind方法
call和apply方法虽然可以绑定this，但都是立即执行该函数。那么有没有方法可以绑定this，但是并不会立即执行该函数呢？这就是bind方法的效果。

### bind方法说明
我们来举个例子看一下：

```js
// 示例1
function fun1() {
  console.log(this);
}
const obj = { a: 1 };
const funa = fun1.bind(obj);
funa();
// 示例2
function fun2(a, b, c, d) {
  console.log(this, a, b, c, d);
}
const funb = fun2.bind(obj, 1,2);
funb(3,4);
const func = funb.bind(null, 5);
func(6);
/* 输出
{ a: 1 }
{ a: 1 } 1 2 3 4
{ a: 1 } 1 2 5 6
*/
```

示例1可以看到，使用bind方法绑定了obj作为函数的this，但是并没有直接执行，而是返回了新函数，可以延迟执行。而且比call和apply方法更高级的是，bind方法可以暂存入参，且可以多次调用，多次暂存。看示例2，funb绑定了this，且传了两个参数；在执行新函数的时候前两个就不需要传了，相当于起到暂存参数的作用。而且可以重复调用bind方法，多次暂存参数，例如func就二次调用了bind方法。不过多次调用时，绑定this就无效了，以第一次为准。

### bind方法特殊场景
首先是常见的第一个入参为null和undefined，它的表现与call，apply方法一致：在非严格模式下，此时它的this指向和不使用call方法一致，即为globalThis，可以参考上面普通函数场景下的输出。如果为严格模式，那么还是指向bind方法的第一个入参。

```js
function fun() {
  console.log(this);
}
fun.bind()();
fun.bind(undefined)();
fun.bind(null)();

/* 输出
// 非严格模式 Node.js
<ref *1> Object [global] { ...省略 }
<ref *1> Object [global] { ...省略 }
<ref *1> Object [global] { ...省略 }
// 非严格模式 浏览器
Window {window: Window, self: Window, document: document, ...省略 }
Window {window: Window, self: Window, document: document, ...省略 }
Window {window: Window, self: Window, document: document, ...省略 }
// 严格模式
undefined
undefined
null
*/
```

然后是bind方法创建的函数作为构造函数，此时我们绑定的this是无效的：

```js
function Fun1() {
  console.log(this, new.target === Fun1);
}
const obj = { a: 1 };
const fun1 = Fun1.bind(obj);
console.log(new fun1());

function Fun2(a, b, c, d) {
  console.log(a, b, c, d);
}
const fun2 = Fun2.bind(obj, 1, 2);
new fun2(3, 4);

/* 输出
Fun1 {} true
Fun1 {}
1 2 3 4
*/
```

可以看到，Fun1在作为构造函数使用时，绑定的obj是无效的，this此时还是构造函数生成的实例。虽然此时绑定this无效，但是暂存参数的功能还是有效的。例如fun2就暂存了Fun2的两个参数，然后作为构造函数使用时，成功读入了暂存的参数。

bind方法创建的函数虽然能作为构造函数，但不能作为父类被其他子类继承。bind方法可以绑定类，此时静态方法会失效，但继承的静态方法依旧生效。bind还有一些其它特性，不过并不是this的新情形，因此这里就不多介绍了。

## 原始值原型函数属性上下文
在JavaScript中，原始值（原始数据类型）是一种既非对象也无方法或属性的数据。所有原始值都是不可变的，即它们的值不能被修改。但是当在原始值上访问属性时，JavaScript自动将值装入包装对象中，并访问该对象上的属性。这里我们尝试执行原始值的原型函数属性，看看其中this的指向。

```js
function fun() {
  console.log(this);
}
Number.prototype.fun = fun;
(1).fun();
console.log(new Number(1), 1);

String.prototype.fun = fun;
('a').fun();
console.log(new String('a'), 'a');

Boolean.prototype.fun = fun;
(false).fun();
console.log(new Boolean(false), false);

/* 输出
// 非严格模式
[Number: 1]
[Number: 1] 1
[String: 'a']
[String: 'a'] a
[Boolean: false]
[Boolean: false] false
// 严格模式
1
[Number: 1] 1
a
[String: 'a'] a
false
[Boolean: false] false
*/
```

可以看到，我们先在原始值对应的原型上增加了一个函数属性，然后再在原始值上调用。结果在严格模式和非严格模式是不同的。严格模式下，this指向原始值；非严格模式下，this指向包装对象。

## 回调函数上下文
当一个函数作为回调函数传递时，this的值取决于如何调用回调。

### 自定义回调场景
如果是我们自己写的调用回调代码，那么this的值就由我们的调用方式决定。这里举例看下：

```js
let globThis = null;
function funStore() {
  globThis = this;
}
funStore();

function fun() {
  console.log(globThis === this);
}
fun();

function call1(call) {
  call();
}
call1(fun);

const obj = {
  call2: function (call) {
    call();
  }
};
obj.call2(fun);

/* 输出
true
true
true
*/
```

首先我们执行了一个普通函数，记录了this，然后在两种回调中尝试this值与普通函数直接执行的区别。输出发现没有任何区别，this的指向实际是一样的，可以参考上面普通函数场景下的输出，且不同的环境和是否严格模式表现都普通函数场景下一致。

### JavaScript提供的回调场景
JavaScript本身提供了很多回调函数的调用场景，比如迭代数组方法。其中大部分回调的this指向都与普通函数执行时一致，而且也可以传入可选的this值。我们看一下例子：

```js
let globThis = null;
function funStore() {
  globThis = this;
}
funStore();

function fun() {
  console.log(globThis === this);
}
fun();

[1].forEach(fun);
[1].map(fun);

function fun2() {
  console.log(this);
}
const obj = {a:1};
[1].forEach(fun2, obj);
[1].map(fun2, obj);

/* 输出
true
true
true
{ a: 1 }
{ a: 1 }
*/
```

这里我们举例了数组的两个原型方法：forEach和map。在执行回调函数时，this的值与普通函数直接执行没有区别。但是这些接受回调的方法允许我们多传一个参数作为this指向，传了之后，回调中的this值就是我们指定的了。

### 部分特殊情形
还有一些特殊的可以接收回调的函数，它的回调函数this指向是由意义的。我们举例看下：

```js
function fun() {
  console.log(this);
}
JSON.parse("true", fun);
JSON.stringify({ a: 1 }, fun);

/* 输出
{ '': true }
{ '': { a: 1 } }
*/
```

这里尝试了JSON.parse和JSON.stringify。可以看到，虽然我们没有传额外的参数，但是回调函数中的this却与普通函数直接执行是有区别的。这里的this指向的是当前解析的对象，具体可以查看相关文档了解。

## 箭头函数
箭头函数是一种简洁的函数表达式，且除了简介之外，与普通函数相比在用法上有一些差异，比如这里要说的this。普通函数中this的指向是看调用函数的对象，如果没有为上面介绍的普通函数上下文中的this指向。但箭头函数的this指向是创建箭头函数时，作用域中this的指向。

箭头函数的this指向，在不同的情形下与普通函数的效果由较大区别。

### 不同的环境和模块化规范
首先我们试一下，在不同的环境和模块化规范下，直接执行函数。

```js
function fun1() {
  console.log(1, this);
}
const fun2 = () => {
  console.log(2, this);
}
console.log(0, this);
fun1();
fun2();

/* 输出
// 浏览器命令行 非严格模式
0 Window {window: Window, self: Window, document: document, ...省略 }
1 Window {window: Window, self: Window, document: document, ...省略 }
2 Window {window: Window, self: Window, document: document, ...省略 }

// 浏览器命令行 严格模式
0 Window {window: Window, self: Window, document: document, ...省略 }
1 undefined
2 Window {window: Window, self: Window, document: document, ...省略 }

// 浏览器HTML中 非严格模式
0 Window {window: Window, self: Window, document: document, ...省略 }
1 Window {window: Window, self: Window, document: document, ...省略 }
2 Window {window: Window, self: Window, document: document, ...省略 }

// 浏览器HTML中 严格模式
0 Window {window: Window, self: Window, document: document, ...省略 }
1 undefined
2 Window {window: Window, self: Window, document: document, ...省略 }

// Node.js命令行 非严格模式
0 <ref *1> Object [global] { ...省略 }
1 <ref *1> Object [global] { ...省略 }
2 <ref *1> Object [global] { ...省略 }

// Node.js命令行 严格模式
0 <ref *1> Object [global] { ...省略 }
1 undefined
2 <ref *1> Object [global] { ...省略 }

// CommonJS和Node.js 非严格模式
0 {}
1 <ref *1> Object [global] { ...省略 }
2 {}

// CommonJS和Node.js 严格模式
0 {}
1 undefined
2 {}

// ESModule和浏览器
0 undefined
1 undefined
2 undefined

// ESModule和Node.js
0 undefined
1 undefined
2 undefined
*/
```

我们尝试了六种场景，以及对应的严格模式和非严格模式。可以看到不同的场景下，箭头函数的指向的this值是有去别的，而且很多场景下普通函数和箭头函数的this指向也不一样。

但是可以看到，箭头函数中this的指向和箭头函数外，直接输出this的指向是一样的。因此证明了箭头函数中的this指向，即是作用域中this的指向。

### 外部的箭头函数在对象和类中作为属性
如果一个在对象和类外面的箭头函数，被作为对象属性，类的静态属性或者实例属性来执行，其中的this指向又是如何呢？我们来看一下例子：

```js
function fun1() {
  console.log(1, this);
}
const outerThis = this;
const fun2 = () => {
  console.log(this === outerThis);
};

const obj = {
  fun1: fun1,
  fun2: fun2,
};
obj.fun1();
obj.fun2();

class C1 {
  static sf1 = fun1;
  static sf2 = fun2;
  f1 = fun1;
  f2 = fun2;
}
C1.sf1();
C1.sf2();

const c1 = new C1();
c1.f1();
c1.f2();

/* 输出
1 { fun1: [Function: fun1], fun2: [Function: fun2] }
true
1 [class C1] { sf1: [Function: fun1], sf2: [Function: fun2] }
true
1 C1 { f1: [Function: fun1], f2: [Function: fun2] }
true
*/
```

在这里我们同时对比了普通函数和箭头函数的情况。可以看到普通函数在对象属性，类的静态属性或者实例属性执行时，this指向的值就是“拥有这个属性的对象”，我们在上面的章节讨论过。但是箭头函数的this却始终与外面直接输出的this指向是一致的，不管箭头函数被哪个类或者对象拥有。这也说明了箭头函数的this指向是创建箭头函数时，作用域中this的指向。

### 类或对象内部的箭头函数



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
- MDN Function.prototype.call()\
  https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Function/call
- MDN Function.prototype.bind()\
  https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Function/bind
- MDN Function.prototype.apply()\
  https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Function/apply
- MDN JSON.parse()\
  https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse
- MDN JSON.stringify()\
  https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify
- MDN 原始值\
  https://developer.mozilla.org/zh-CN/docs/Glossary/Primitive
- MDN 箭头函数表达式\
  https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Functions/Arrow_functions
