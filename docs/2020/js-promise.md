# JavaScript中Promise对象的部分使用特点

回调函数和异步编程是JavaScript的特点之一，但是JavaScript中传统的回调函数编写太麻烦，如果嵌套的回调函数层级过多，容易产生“回调地狱”的现象，代码变得非常难看。因此Promise在ES6被引入用来解决这个问题。

## Promise的基本方法
```js
const promise1 = new Promise((resolve, reject) => {
  // some thing
  if(/* some */)
    resolve(/* some */)
  else
    reject(/* some */)
});
 
promise1.then(v => {
  // resolve函数
  // do some
}, e => {
  // reject函数
  // do some
})
```
代码中上面是创建Promise的过程。

创建Promise时接受一个函数作为参数，这个函数就是作为Promise异步执行的主要函数。
```js
(resolve, reject) => {
  // some thing
  if(/* some */)
    resolve(/* some */)
  else
    reject(/* some */)
}
```
执行结束后，执行resolve（成功）或者reject（失败）这两个函数。

这两个函数就定义在.then的参数中。

如果Promise没有执行resolve（成功）或者reject（失败），那么.then中的内容永远不会执行，这样就实现了异步操作。

## promise函数的异步特点
Promise一个很有意思的特点，就是Promise函数中resolve（成功）或者reject（失败）是异步的：

```js
const promise1 = new Promise((resolve, reject) => {
  reject('fail');
  console.log("promise1");
});
 
promise1.then(v => console.log("then1"), e => console.log(e))
```
浏览器执行结果：
​​​![](/2020/promise-1.png)
我们先调用reject，然后此时函数应该跳转到then中的reject函数执行。但是并没有。

程序先输出了promise1然后再是fail。这说明resolve和reject是异步的，执行到resolve或reject时标记状态，然后继续执行完promise函数再进入then中。

## throw类似reject，但有区别
throw通常情况下可以看作reject。

```js
const promise1 = new Promise((resolve, reject) => {
  console.log("promise1");
  reject('fail');
});
 
const promise2 = new Promise((resolve, reject) => {
  console.log("promise2");
  throw 'fail';
});
 
promise2.then(v => console.log("then1"), e => console.log(e))
```
上面的代码中，promise1和promise2的唯一区别是reject换成了throw，但效果是相同的，reject函数成功捕获了错误，把它当成是一个reject来处理。
​​​![](/2020/promise-2.png)
但throw的一个很大区别是，在promise函数中会同步执行，不会等待promise函数执行完毕再进入then。

```js
const promise1 = new Promise((resolve, reject) => {
  reject('fail');
  console.log("promise1");
});
 
const promise2 = new Promise((resolve, reject) => {
  throw 'fail';
  console.log("promise2");
});
 
promise2.then(v => console.log("then1"), e => console.log(e))
```
我们把reject和throw上调了，先抛出错误再输出。

​​​![](/2020/promise-3.png)

这时候promise函数中的console.log就没有机会输出了。

这是由于考虑到reject和throw的语义是不一样的：
* throw表示函数执行出现了错误，不应该继续执行。
* reject表示执行失败，但是不表示有错误。

## then的链式执行
```js
const promise1 = new Promise((resolve, reject) => {
  console.log("promise1");
  resolve("ok1");
});
 
const promise2 = new Promise((resolve, reject) => {
  resolve('ok2');
  console.log("promise2");
})
 
promise1.then(v => {
  console.log("then1")
  return promise2;
}).then(v => console.log("then2", v), e => console.log("then2", e));
```
​​​![](/2020/promise-4.png)

在then中返回另一个Promise，或者抛出错误(throw)，后面的then就会接受另一个Promise的状态，调用resolve或者reject。

此时还可以看到，在创建Promise后，promise函数接已经在执行了，我们在then中返回的promise2时早就执行完毕，仅仅是把resolve或者reject状态传递给了下一个then。

then中即使不返回另一个Promise，也可以链式执行：

```js
Promise.resolve(2).then(() => console.log(1)).then(() => console.log(2))
```
​​​![](/2020/promise-5.png)

这是因为resolve和reject函数默认返回一个promise。我们看到浏览器每次执行完毕后输出的最后结果就是这个promise。

（看上面浏览器输出的最后一行）

注意这个promise并不代表我们一开始建立的promise。

如果我们指定了返回值，那么相当于返回默认的promise时附带了参数：
​​​![](/2020/promise-6.png)

## reject可被省略
then中的reject函数可以省略：
```js
const promise1 = new Promise((resolve, reject) => {
  resolve('ok');
  console.log("promise1");
});
 
promise1.then(v => console.log("then1"))
```
但是如果此时调用reject也无法被then读取。
​​​![](/2020/promise-7.png)

## catch可替代reject
```js
promise1.then(v => console.log("then1"), e => console.log(e));
 
promise1.then(v => console.log("then1")).catch(e => console.log(e))
```
这两种形式是相等的。

## reject和catch的链式捕获
在链式then中，rejcect和catch可以捕获之前任一层出现的错误。
```js
const promise1 = new Promise((resolve, reject) => {
  throw new Error('fail');
  console.log("promise1");
});
 
const promise2 = new Promise((resolve, reject) => {
  resolve('ok');
  console.log("promise2");
})
 
promise1.then(v => {
  console.log("then1")
  return promise2;
}).then(v => console.log("then2", v), e => console.log("then2", e));
```
浏览器执行结果：
​​​![](/2020/promise-8.png)

从结果中我们看到，在链式then中，如果出现了reject或者throw，后面所有then中的resolve都不会被执行。上面then1就没被执行，且promise2虽然是resolve状态，但是依然没有被后面then2中的resolve接受，反而执行了then2的reject。

改成catch的写法：
```js
promise1.then(v => {
  console.log("then1")
  return promise2;
}).then(v => console.log("then2", v)).catch(e => console.log("then2", e));
```
在执行完reject之后，promise就变为了resolve状态。如果后面还有链式then，就可以执行reslove了。
​​​![](/2020/promise-9.png)

可以看到，在执行完reject之后，后面then中的resolve也被执行了。

最后，文章中描述的resolve状态，实际上应该是fulfilled（已完成）状态，为了方便理解，我就直接使用了resolve来描述。

## 更多资料
在这里介绍的仅仅是Promise中很少的性质，如果想了解Promise的更多用法，可以看看下面的资料：
* 阮一峰 《ES6标准入门》Promise部分  
https://es6.ruanyifeng.com/#docs/promise
* MDN文档 Promise部分  
https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise
