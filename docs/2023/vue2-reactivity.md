# 理解Vue2的响应式原理

使用Vue作为前端开发技术栈的同学，在使用Vue时都会有一些好奇：为啥我们的响应式变量要在data中定义？Vue是如何监听到变化，实现响应式的？这次我们就来探究一下，Vue2的响应式原理。

## 目录
[[toc]]

## 对象的响应式

### 修改属性描述实现响应式
首先我们来实现基础的响应式，即监听data数据的变化。我的代码中提供了较详细的注释。

```js
// 判断是否属于object
function isObject(obj) {
  // 注意 null的typeof 也是 'object'
  return typeof obj === "object" && obj != null;
}

// 为入参提供响应式逻辑
export function observer(obj) {
  // 不是object 原样返回
  if (!isObject(obj)) return obj;
  // 遍历对象，为每个属性增加响应性
  for (const key in obj) {
    defineReactive(obj, key, obj[key]);
  }
}

// 存储真正的属性值
const _obj = {};
// 为每个属性增加响应性
function defineReactive(obj, key, value) {
  _obj[key] = value;
  Object.defineProperty(obj, key, {
    // 取值
    get() {
      console.log(`${key}取值: ${_obj[key]}`);
      return _obj[key];
    },
    // 存值
    set(newValue) {
      if (newValue === _obj[key]) return;
      console.log(`${key}存值: 由 ${_obj[key]} 改为 ${newValue}`);
      _obj[key] = newValue;
    },
  });
}
```

在observer函数中，我们仅对object进行处理。我们对object的每个属性都增加独立的响应性。方法是使用`Object.defineProperty`。它可以修改对象现有属性的描述。我们把一个普通属性改为一个由getter，setter描述的属性。在get和set函数中就能够监听到属性值的存取和变化，进行处理。而真正的值却存储在另一个对象中。我们来看一下使用效果。

```js
import { observer } from './index.js'
const data = {
  a: 1,
  b: 2,
};
observer(data);

data.a = '你好'
data.b = 'js'
console.log(data.a + data.b);
```

我们在对象中定义了几个属性，把对象通过响应式处理后再进行存取。
```sh
# 输出效果
a存值: 由 1 改为 你好
b存值: 由 2 改为 js
a取值: 你好
b取值: js
你好js
```

### 使用闭包优化数据存储
上面代码中定义一个内部对象来存储真正的数据。内部对象的key即是响应式对象的key。这时如果有多个对象都通过这个函数获得响应性，且定义了相同key的属性，此时这个内部存储就会产生覆盖的情况。那么我们要设多个存储变量来分别为不同的对象存储数据么？不需要，使用闭包，我们可以简单的做到这点，

闭包指的是当一个函数执行结束后，其内部的资源并没有被完全释放，还可以被继续使用。利用这个特性，我们可以在函数闭包中存储部分变量，而不用定义一个内部对象来存储。

```js
// 为每个属性增加响应性
function defineReactive(obj, key, value) {
  Object.defineProperty(obj, key, {
    // 取值
    get() {
      console.log(`${key}取值: ${value}`);
      return value
    },
    // 存值
    set(newValue) {
      if (newValue === value) return;
      console.log(`${key}存值: 由 ${value} 改为 ${newValue}`);
      value = newValue;
    },
  });
}
```

我们使用value作为闭包的关键变量。这时即使defineReactive函数结束后，由于内部的get和set函数依然在使用value变量，因此它并不会被销毁。当触发set函数修改属性值时，我们直接更改value为新的值。后续get函数取值时，也能拿到新值。

### 深度监听嵌套对象
我们已经实现的observer函数，只能对于对象的一层属性进行处理，对于多层嵌套对象我们的响应式是失效的，例如这样：
```js
const data = {
  a: 1,
  b: { c: 2 },
};
observer(data);
data.b.c = "js";
// 输出结果：
// b取值: [object Object]
```

目前我们的代码只在`data.b`取值的时候有响应性，而对`data.b.c`赋值的时候，响应性就没有了。我们处理下嵌套对象的监听：

```js
// 为每个属性增加响应性
function defineReactive(obj, key, value) {
  // 如果是嵌套对象，继续监听其属性
  observer(value);
  Object.defineProperty(obj, key, {
    // 取值
    get() {
      console.log(`${key}取值: ${value}`);
      return value;
    },
    // 存值
    set(newValue) {
      if (newValue === value) return;
      console.log(`${key}存值: 由 ${value} 改为 ${newValue}`);
      value = newValue;
    },
  });
}
```

实现也非常简单，就是在defineReactive中对value进行递归监听，即如果value是object，则继续监听其属性。

### 新增对象深度监听
试想这样一种情况：某个深度监听的对象属性，一开始并不是个对象，但是后来被改成了对象。又或者嵌套对象本身被替换成了另一个对象。这时候我们更改的这个嵌套对象，就是没有响应性的。举个例子：
```js
import { observer } from "./index.js";
const data = {
  a: 1,
  b: 2
};
observer(data);

data.a = "你好";
data.b = { c: 2 };
data.b.c = 'js';
data.b.d = 3;
console.log(data.a + data.b.c);
```
此时的输出为：
```sh
# 输出效果
a存值: 由 1 改为 你好
b存值: 由 2 改为 [object Object]
b取值: [object Object]
a取值: 你好
b取值: [object Object]
你好js
```

可以看到，对于修改b属性为对象后，新增的c属性没有被监听到。这里和Vue2的机制是一样的。此时在Vue中可以使用`Vue.set`来为新增的对象增加响应性。对于我们的代码来说，实现可以更简单：直接适配新增嵌套对象时的响应性处理（但是新增属性依然是不行的）。改动也很简单，对于进入set函数的对象新值增加响应性即可。

```js
set(newValue) {
  if (newValue === value) return;
  // 如果存储的是一个对象，那么继续增加响应性
  observer(newValue);
  console.log(`${key}存值: 由 ${value} 改为 ${newValue}`);
  value = newValue;
}
```
这时的输出效果如下：（注意`data.b.d`为新增属性，这里依然没有加入响应性）。
```sh
# 输出效果
a存值: 由 1 改为 你好
b存值: 由 2 改为 [object Object]
b取值: [object Object]
c存值: 由 2 改为 js
a取值: 你好
b取值: [object Object]
c取值: js
你好js
```

### 为新增属性增加响应性
上一节我们的新增属性`data.b.d`没有增加响应性，也就是说，一开始没有在data中定义的属性，是没有响应性的。Vue提供了`Vue.set`方法为这类新增属性增加响应性。正好，我们的`defineReactive`函数也能达到这个目的。来看一下例子。

```js
import { observer, defineReactive } from "./index.js";
const data = {
  a: 1,
  b: 2
};
observer(data);

data.a = "你好";
data.b = {};
defineReactive(data.b, 'c', 2);
data.b.c = 'js';
defineReactive(data, 'd', 3);
data.d = 4;
console.log(data.a + data.b.c);
```

不管对于嵌套的新增属性，还是在data上绑定的新增属性，使用defineReactive函数都可以为其新增响应性。看下输出效果：

```sh
# 输出效果
a存值: 由 1 改为 你好
b存值: 由 2 改为 [object Object]
b取值: [object Object]
b取值: [object Object]
c存值: 由 2 改为 js
d存值: 由 3 改为 4
a取值: 你好
b取值: [object Object]
c取值: js
你好js
```

## 数组的响应式
使用`Object.defineProperty`是无法监听到数组的push等方法引发的变化，因此对于数组形式我们还要单独进行处理。我们重新包装数组的原型，重写原型方法。使数组在使用方法修改数组对象前，我们也能监听到。

```js
// 继承数组原型对象
const arrProperty = Object.create(Array.prototype)
// 重写部分数组原型方法
const methods = ['push','pop','shift','unshift','splice']
methods.forEach(method => {
  arrProperty[method] = function () {
    console.log(`数组${method}方法`);
    // 重新调用对应的数组方法
    Array.prototype[method].call(this, ...arguments);
  }
})
```
可以看到，我们对常用的数组方法进行了重写，在我们重写的函数内容，首先监听到改动，然后再重新调用真正的方法执行改动逻辑。

然后在observer函数中，对数组进行特殊处理：
```js
export function observer(obj) {
  // 不是object 原样返回
  if (!isObject(obj)) return obj;
  // 如果是数组则修改原型
  if (Array.isArray(obj)) {
    obj.__proto__ = arrProperty
  }
  // 遍历对象，为每个属性增加响应性
  for (const key in obj) {
    defineReactive(obj, key, obj[key]);
  }
}
```

然后我们就能监听到数组方法的响应性了。看一下例子：

```js
import { observer } from "./index.js";
const data = [1, 2]
observer(data);

data[1] = 3;
data.push(4);
console.log(data[2])
```
这时的输出效果如下：(后续都省略了get方法的输出)
```sh
# 输出效果
1存值: 由 2 改为 3
数组push方法: 4
4
```

## 总结
这里仅仅是简单的理解了一些Vue2的响应式原理，并且简化了场景。实际上Vue2对于响应式的处理要复杂的多，还涉及到一些对象通信和和设计模式的方法。后面有时间的时候，我们会更详细的探讨，Vue2中是如何实现响应式的。

## 参考
- Object.defineProperty() MDN\
https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty
- 深入响应式原理 Vue 2.x 文档\
https://v2.cn.vuejs.org/v2/guide/reactivity.html
- Vue响应式原理 文章中用到的源码\
https://github.com/jzplp/VueJz
- Vue2 & Vue3 响应式实现原理\
https://juejin.cn/post/7253148953600262203
- 面试官: 能不能手写 Vue 响应式？（Vue2 响应式原理【完整版】）\
https://juejin.cn/post/7079807948830015502
