# 超详细！手把手带你实现一个完整的Promise
Promise是JavaScript中异步编程的解决方案，一开始在社区中提出和实现，后来ECMAScript将其写进了标准中。Promise有效的解决了异步编程的回调地狱问题，非常受开发者的欢迎。

本文首先介绍JavaScript中异步编程的几种方式，再对Promise进行了简单说明。然后从创建类开始，一步一步实现一个完整的Promise。我们实现的Promise不仅可以通过Promises/A+规范测试，并且提供了与ECMAScript同样的实用函数。

我还在GitHub上新建了一个仓库，里面包含了我们实现的Promise的完整代码和每一部分的中间代码，还集成了Promises/A+规范测试工具，方便进行测试。
- PromiseJz GitHub仓库
- https://github.com/jzplp/PromiseJz

## 目录
[[toc]]

## JavaScript异步编程
### 回调函数简介
在以前传统的JavaScript编程中，我们使用回调函数来解决异步编程的问题，即：一个操作（例如事件触发，定时器等）需要异步执行时，我们传入一个回调函数。当操作执行完毕后，程序会执行回调函数中的代码。目前JavaScript中提供的基础异步操作也基本是回调函数的形式：
```js
// 定时器
setTimeout(() =>{ console.log('定时器结束后输出') }, 3000)
// Node.js下 打开文件
fs.open('<directory>', 'a+', (err, fd) => {
  console.log('文件成功打开或者失败')
});
```

有了回调函数，我们可以实现对于同步和异步流程的分别控制，即部分操作不需要等异步流程结束，部分操作需要拿到异步流程的结果才能进行。

我们拿定时器来举例：
```js
// 定时器
setTimeout(() =>{ console.log('3分钟时间已到！') }, 30000)
console.log('定时器已开始计时！')
other('其他操作');
```
假设程序触发了一个定时器，3分钟之后提醒用户时间已到。同时在定时器开始计时之后，我们需要提示用户已经开始计时了，而且后续还有其他操作需要处理，是不可能等待3分钟后再进行的。通过回调函数，我们把异步操作放入回调函数中，实现了对异步流程的控制。

### 回调地狱问题
上一节中回调函数的写法虽然有效，但如果遇到复杂的异步回调流程，虽然可以实现，但是写法很难受。例如我们有很多个请求，每一种请求需要等待上一个请求的结果，就会出现嵌套函数特别多的情况，被叫做“回调地狱”。
```js
get1(function(res1) {
  get2(function(res2) {
    get3(function(res3) {
      get4(function(res4) {
        get5(function(res5) {
          // ... 如果有更多请求
          console.log(res5);
        })
      })
    })
  })
})
```
可以看到，每一个异步请求都会“嵌套一层函数”，上面的代码还只是简化形式，在实际使用中，每一层会出现不同的处理逻辑，同一层还可能有多个子层级等等。因此如果异步请求特别多，这种写法的可读性是很差的，也不利于维护。

### Promise对于回调地狱的解决方案
Promise的出现，解决了上面的回调地狱问题，将嵌套形式进行了改写：
```js
// 仅为伪代码，请求函数需要改造
new Promise(get1)
  .then(function(res1) { return get2 })
  .then(function(res2) { return get3 })
  .then(function(res3) { return get4 })
  .then(function(res4) { return get5 })
  .then(function(res5) { console.log(res5); })
  .catch(function(e) { console.log('错误信息', e) })
```
可以看到，使用Promise，我们不用再一层一层的嵌套，而是像顺序执行一样写then即可。同时Promise还提供了catch、finally等捕捉错误的机制，而且提供了像all、race、any等有用的逻辑控制函数。因此，Promise改良了异步编程的写法，解决了回调地狱问题。

### async/await的进阶方案
上一节的Promise虽然不用嵌套了，但其实Promise和then依旧使用函数的形式。如果遇到复杂的逻辑依旧不简便。有没有一种方式，可以像写同步的逻辑那样写异步逻辑呢？

有的，这就是async/await。我们再次将上面的例子改写：
```js
// 仅为伪代码，请求函数需要改造
async function exec() {
  try {
    const res1 = await get1()
    const res2 = await get2()
    const res3 = await get3()
    const res4 = await get4()
    // 不需要等待的异步操作
    get6().then(() => { other(); })
    const res5 = await get5()
  } catch(e) {
    console.log('错误信息', e)
  }
}
```

可以看到，使用Promise，我们可以将异步操作使用同步操作的形式改写，改写之后的程序贴近于普通同步流程的代码写法，流程清晰、逻辑非常容易理解。其中需要等待异步结果的操作，我们使用await命令使代码等待结果；不需要等待的异步操作，也可以直接用回调函数或者Promise的形式来写。

实际上async/await是Promise的语法糖，内部还是使用了Promise作为异步流程的控制机制。因此还是需要先对Promise进行充分的了解。这篇文章的主题是Promise，因此后续不会对async/await进行更多介绍。感兴趣的同学可以参考下[《ES6入门教程》中的async部分](https://es6.ruanyifeng.com/#docs/async)。

## Promise简介
这里仅仅是简单的介绍下Promise，如果想看更多关于Promise的用法，可以参考[《ES6入门教程》中的Promise部分](https://es6.ruanyifeng.com/#docs/promise)。后面的实现Promise流程中，也会对Promise的用法进行细化。

### Promise的使用
```js
const promiseObj = new Promise(function(resolve, reject) {
  // 执行业务逻辑
  resolve(value) // 如果成功
  reject(reason)// 如果失败
})
promiseObj
  .then(value => {
    console.log('成功的值', value)
  })
  .catch(e => {
    console.log('失败的值', e)
  })
```

Promise主要有三个状态：
- pending 进行中
- fulfilled 已成功
- rejected 已失败

当我们创建了一个新的Promise，初始状态是pending，在回调中我们执行了resolve，则状态变为了fulfilled。如果执行了reject或者引发了异常，那么状态变为rejected。状态一旦被更改，就不能再变化了。

我们可以创建一个Promise，然后在then中写入成功逻辑，在catch中写入异常处理逻辑。

### Promise的方法
可以大致将Promise的方法分为三部分。在下面的实现中，我们会实现这里介绍的全部方法。

**1. 实例方法**
- `Promise.prototype.then(onFulfilled, onRejected)`\
  Promise状态转变后，执行入参的回调函数。
- `Promise.prototype.catch(onRejected)`\
  Promise状态转变为rejected后，执行回调函数。
- `Promise.prototype.finally(callback)`\
  Promise状态转变后，无论状态如何都会执行回调函数。

**2. 静态方法，对象转为Promise**
- `Promise.resolve(value)`\
  将现有对象转换为一个Promise对象。
- `Promise.reject(value)`\
  将现有对象转换为一个Promise对象，且状态为rejected。

**3. 静态方法，接收实例数组，返回Promise**
- `Promise.all()`\
  实例全部fulfilled，则状态为fulfilled，有一个为rejected则为rejected。
- `Promise.race()`\
  状态由最先转换的那个实例决定。
- `Promise.allSettled()`\
  所有实例的状态都变更后才会变更。变更的状态总是fulfilled。
- `Promise.any()`\
  只要有一个实例为fulfilled，状态为fulfilled。如果全部rejected，状态才为rejected。

## 实现Promise前要了解的
### Promise规范
大家或许听到过Promises/A+，这是ECMAScript选用的Promise规范。为什么叫“A+”？这是因为Promises/A+是在Promise/A的基础上进行扩展的。实际上，Promise有很多个规范，下面列出了部分较知名的：
- [Promises/A](https://wiki.commonjs.org/wiki/Promises/A)
- [Promises/A+](https://promisesaplus.com/)
- [Promises/B](https://wiki.commonjs.org/wiki/Promises/B)
- [Promises/D](https://wiki.commonjs.org/wiki/Promises/D)

其中除了Promises/A+之外，其他规范都是CommonJs组织提出的。查看A+规范的原文，我们发现其中详细的描述了Promise的状态和执行流程。但其中只定义了then方法。

### Promise测试工具
Promises/A+不仅有规范，还有对应的测试工具。我们自己实现的Promise，需要通过检测工具的检测，才能算是合格的实现。

官方提供的工具为：[promises-aplus-tests](https://github.com/promises-aplus/promises-tests)，是个npm包。在实现完成后，我们也会用这个工具进行测试。

## 第一部分 Promise构造函数

### 新建类
首先创建构造函数，接受一个函数作为入参，并执行。
```js
class PromiseJz {
  // 构造函数，接收一个函数作为入参
  constructor(executor) {
    // 立即执行函数
    executor()
  }

  // 实例属性 状态，默认为pending
  state = STATE_PENDING
}
module.export = PromiseJz
```

设三个状态常量，表示Promise的三种状态。
```js
const STATE_PENDING = 'pending'
const STATE_FULFILLED = 'fulfilled'
const STATE_REJECTED = 'rejected'
```

### resolve和reject函数
创建resolve和reject函数并处理状态。

```js
resolve(value) {
  // 只处理pending状态
  if(this.state !== STATE_PENDING) return
  this.state = STATE_FULFILLED
}
reject(reason) {
  // 只处理pending状态
  if(this.state !== STATE_PENDING) return
  this.state = STATE_REJECTED
}
```

构造函数中使用这两个函数：
```js
// 构造函数，接收一个函数作为入参
constructor(executor) {
  try {
  // 立即执行函数 需要手动指定bind指向
  executor(this.resolve.bind(this), this.reject.bind(this))
  } catch(err) {
    // 出现异常则认为rejected
    this.reject(err)
  }
}
```

如果执行中出现异常，那么认为是reject状态。注意这里resolve和reject函数的执行位置实际上是在实例之外，因此需要手动bind。

### 第一部分完整代码
```js
// 三种状态常量
const STATE_PENDING = 'pending'
const STATE_FULFILLED = 'fulfilled'
const STATE_REJECTED = 'rejected'

class PromiseJz {
  // 构造函数，接收一个函数作为入参
  constructor(executor) {
    try {
    // 立即执行函数 需要手动指定bind指向
    executor(this.resolve.bind(this), this.reject.bind(this))
    } catch(err) {
      // 出现异常则认为rejected
      this.reject(err)
    }
  }

  // 实例属性 状态，默认为pending
  state = STATE_PENDING

  resolve(value) {
    // 只处理pending状态
    if(this.state !== STATE_PENDING) return
    this.state = STATE_FULFILLED
  }
  reject(reason) {
    // 只处理pending状态
    if(this.state !== STATE_PENDING) return
    this.state = STATE_REJECTED
  }
}

module.exports = PromiseJz
```

### 第一部分测试
测试一下效果：

```js
const prom1 = new PromiseJz(function (resolve, reject) {
  console.log('立即执行')
  resolve(1)
  // 状态改变一次之后，就不能再变化
  reject(0)
})
console.log(prom1)

const prom2 = new PromiseJz(function (resolve, reject) {
  console.log('立即执行')
  reject(0)
  resolve(1)
})
console.log(prom2)
// 输出结果
// 立即执行
// PromiseJz { state: 'fulfilled' }
// 立即执行
// PromiseJz { state: 'rejected' }
```

## 第二部分 then方法
### 保存promise结果
then状态需要获取promise的结果，因此需要在类中保存。首先创建两个实例属性：
```js
// 成功的值
value = null
// 失败的原因
reason = null
```
然后在resolve和reject函数中将值保存到实例属性中。

```js
resolve(value) {
  // 上面已有代码，因此省略
  this.value = value
}
// reject函数
reject(reason) {
  // 上面已有代码，因此省略
  this.reason = reason
}
```

### 创建then方法
在then方法中获取promise的结果，传给回调函数。
```js
then(onFulfilled, onRejected) {
  if(this.state === STATE_FULFILLED) {
    onFulfilled(this.value)
  }
  if(this.state === STATE_REJECTED) {
    onRejected(this.reason)
  }
}
```

### then方法处理pending状态
上一节的then方法，我们只处理了fulfilled和reject的情况。也就是说，我们可以处理同步执行的方法了。但是异步情况下，即执行then方法时，我们的promise状态还是pending呢？这时候就需要保存下回调函数，等后续状态改变时在执行。

新建两个实例属性，用于保存then的回调函数。
```js
// 异步promise调用then时的回调
onFulfilledCallback = null
onRejectedCallback = null
```

then方法如果遇到pending状态，则把回调函数保存在属性中。
```js
then(onFulfilled, onRejected) {
  // 上面已有代码，因此省略
  if(this.state === STATE_PENDING) {
    // pending状态时，无法执行回调，因此把状态写入属性中，等后续状态改变时执行
    this.onFulfilledCallback = onFulfilled
    this.onRejectedCallback = onRejected
  }
}
```
既然保存下了回调函数，那么状态改变时，就需要执行回调。promise的状态何时改变呢？就是在执行resolve或者reject函数的时候。因此我们在这两个函数里面执行then的回调。

```js
resolve(value) {
  // 上面已有代码，因此省略
  if(this.onFulfilledCallback) this.onFulfilledCallback(value)
}
reject(reason) {
  // 上面已有代码，因此省略
  if(this.onRejectedCallback) this.onRejectedCallback(reason)
}
```

到这里，我们就已经可以处理Promise的异步调用了，即这种形式的：
```js
const prom5 = new PromiseJz(function (resolve, reject) {
  setTimeout(() => resolve(1), 1000)
})
prom5.then(value => {
  console.log('prom5成功', value)
}, reason => {
  console.log('prom5失败', reason)
})
```

### 对同一个Promise多次调用then
对于同一个Promise，如果多次调用then，上面的代码是无法处理的，例如：

```js
const prom7 = new PromiseJz(function (resolve, reject) {
  setTimeout(() => resolve(1), 1000)
})
prom7.then(value => {
  console.log('prom7成功1', value)
}, reason => {
  console.log('prom7失败1', reason)
})
prom7.then(value => {
  console.log('prom7成功2', value)
}, reason => {
  console.log('prom7失败2', reason)
})
// 应该输出的结果:
// prom7成功1 1
// prom7成功2 1
// 目前输出的结果：
// prom7成功2 1
```

可以看到，对同一个promise调用了两次then方法，按道理我们应该输出两次结果，但现在仅输出了一次。这是因为，我们的then回调函数属性`onFulfilledCallback`只能保存一个回调函数。如果遇到多个then方法，新的回调函数会把原有的覆盖掉，所以旧的就不会被调用了。因此，我们把回调函数属性改成数组。

```js
  onFulfilledCallback = []
  onRejectedCallback = []
```
同样的，处理一下then方法和resolve、reject函数，适配数组形式。
```js
then(onFulfilled, onRejected) {
  // 上面已有代码，因此省略
  if(this.state === STATE_PENDING) {
    this.onFulfilledCallback.push(onFulfilled)
    this.onRejectedCallback.push(onRejected)
  }
}
resolve(value) {
  // 上面已有代码，因此省略
  this.onFulfilledCallbackList.forEach(callback => callback(value))
  this.onFulfilledCallbackList = []
}
reject(reason) {
  // 上面已有代码，因此省略
  this.onRejectedCallbackList.forEach(callback => callback(reason))
  this.onRejectedCallbackList = []
}
```

清空数组不是必须的，因为promise的状态只会改变一次。当状态改变之后，resolve、reject函数就没有执行的机会了。即使后面再调用then方法，回调函数也直接执行了，不会被加入数组中。因此即使不清空，也是可以的。

### 第二部分完整代码
```js
// 三种状态常量
const STATE_PENDING = 'pending'
const STATE_FULFILLED = 'fulfilled'
const STATE_REJECTED = 'rejected'

class PromiseJz {
  // 构造函数，接收一个函数作为入参
  constructor(executor) {
    try {
    // 立即执行函数 需要手动指定bind指向
    executor(this.resolve.bind(this), this.reject.bind(this))
    } catch(err) {
      // 出现异常则认为rejected
      this.reject(err)
    }
  }

  // 实例属性 状态，默认为pending
  state = STATE_PENDING
  // 成功的值
  value = null
  // 失败的原因
  reason = null
  // 异步promise调用then时的回调 处理对同一个Promise多次调用then的情况，需要用数组
  onFulfilledCallbackList = []
  onRejectedCallbackList = []

  resolve(value) {
    // 只处理pending状态
    if(this.state !== STATE_PENDING) return
    this.state = STATE_FULFILLED
    this.value = value
    // 状态改变时如果有回调函数需要执行
    this.onFulfilledCallbackList.forEach(callback => callback(value))
    // 处理完再清空数组
    this.onFulfilledCallbackList = []
  }
  reject(reason) {
    // 只处理pending状态
    if(this.state !== STATE_PENDING) return
    this.state = STATE_REJECTED
    this.reason = reason
    // 状态改变时如果有回调函数需要执行
    this.onRejectedCallbackList.forEach(callback => callback(reason))
    // 处理完再清空数组
    this.onRejectedCallbackList = []
  }

  then(onFulfilled, onRejected) {
    if(this.state === STATE_FULFILLED) {
      onFulfilled(this.value)
    }
    if(this.state === STATE_REJECTED) {
      onRejected(this.reason)
    }
    if(this.state === STATE_PENDING) {
      // pending状态时，无法执行回调，因此把状态写入属性中，等后续状态改变时执行
      this.onFulfilledCallbackList.push(onFulfilled)
      this.onRejectedCallbackList.push(onRejected)
    }
  }
}

module.exports = PromiseJz
```

## 第三部分 完善then方法

### then的链式调用
Promise的then方法会返回一个promise，可以进行链式调用的，例如：
```js
const prom8 = new PromiseJz(function (resolve, reject) {
  setTimeout(() => resolve(1), 1000)
})
prom8.then((value) => value + 1).then((value) => {
  console.log('prom8成功', value)
})
```

但是目前我们的then方法没有返回值，因此目前会报错：
```
prom8.then((value) => value + 1).then((value) => {
                                ^
TypeError: Cannot read properties of undefined (reading 'then')
```

这里我们处理一下then方法，返回一个Promise。同时加入了try/catch，当引发异常时会调用reject。

```js
then(onFulfilled, onRejected) {
  return new PromiseJz((resolve, reject) => {
    if(this.state === STATE_FULFILLED) {
      try {
        resolve(onFulfilled(this.value))
      } catch(err) {
        reject(err)
      }
    }
    if(this.state === STATE_REJECTED) {
      try {
        resolve(onRejected(this.reason))
      } catch(err) {
        reject(err)
      }
    }
    if(this.state === STATE_PENDING) {
      // pending状态时，无法执行回调，因此把状态写入属性中，等后续状态改变时执行
      this.onFulfilledCallbackList.push(onFulfilled)
      this.onRejectedCallbackList.push(onRejected)
    }
  })
}
```
可以看到，不管状态是fulfilled还是rejected，都会调用resolve函数。


### 处理pending状态的then的链式调用
上面处理了fulfilled和rejected状态，pending状态也是需要处理的，但是由于是回调，因此处理上有点不同。

```js
then(onFulfilled, onRejected) {
  return new PromiseJz((resolve, reject) => {
    // 上面已有代码，因此省略
    if(this.state === STATE_PENDING) {
      this.onFulfilledCallbackList.push((value) => {
        try {
          resolve(onFulfilled(value))
        } catch(err) {
          reject(err)
        }
      })
      this.onRejectedCallbackList.push(reason => {
        try {
          resolve(onRejected(reason))
        } catch(err) {
          reject(err)
        }
      })
    }
  })
}
```
实际上就是将回调函数包裹了一层，接收结果，进行和上一节一样的处理。

写到这里，上面的prom8测试也能够正常返回结果了：
```
prom8成功 2
```

### then省略入参
then方法中的两个入参是可以不传的，例如：
```js
const prom9 = new PromiseJz(function (resolve, reject) {
  reject(0)
})
prom9.then((value) => {
  console.log('prom9成功', value)
}).then(null, reason => {
  console.log('prom9失败', reason)
})
```
但是现在我们的代码没有处理这种情况，会报错。因此，我们为两个入参提供一个默认值，使Promise传递下去，后面也能接收到。

```js
// 错误的代码  仅为示例
then(onFulfilled, onRejected) {
  if(!onFulfilled) {
    onFulfilled = value => value
  }
  if(!onRejected) {
    onRejected = reason => reason
  }
}
```

上面的处理看起来还不错，提供了默认值，对于fulfilled状态的默认值处理也是正确的，例如：
```js
const prom10 = new PromiseJz(function (resolve, reject) {
  resolve(1)
})
prom10.then(null, reason => {
  console.log('prom10失败', reason)
}).then((value) => {
  console.log('prom10成功', value)
})
```
prom10测试中，第一个then省略了onFulfilled函数，我们提供了默认值，并在第二个then中接收到。

但是对于上面的prom9测试，Promise的状态是rejected，第一个then省略了onRejected函数，但是第二个then的onRejected函数却没有捕捉到。因为我们的默认onRejected函数并没有传递rejected状态，而是把返回的新promise设置为了fulfilled状态。因此，默认的onRejected函数和入参中实际提供的onRejected函数效果是不一致的。
- 入参中实际提供的onRejected函数相当于捕捉了异常，如果没有引发新的异常，则返回的新promise设置为fulfilled状态。
- 默认的onRejected函数不能捕捉异常，而是将rejected状态传递下去。

这里我们使用引发异常的方式来传递。

```js
then(onFulfilled, onRejected) {
  if(!onRejected) {
    onRejected = reason => { throw reason }
  }
  // 上面已有代码，因此省略
}
```
到这里，我们的prom9测试也能通过了。

### then的回调函数返回Promise
如果then的回调函数中返回了一个Promise，那么then返回的新Promise就由这个回调函数中返回的Promise决定。说起来有点绕口，我们看下例子：
```js
// 使用ES官方的Promise查看效果
PromiseJz = Promise

const prom13 = new PromiseJz(function (resolve, reject) {
  setTimeout(() => resolve(1), 1000)
})
prom13.then(value => {
  // then中返回了新的promise
  return new PromiseJz((resolve, reject) => {
    setTimeout(() => resolve(value + 1), 1000)
  })
}).then((value) => {
  console.log('prom13成功', value)
})
// 输出 prom13成功 2
```

可以看到，如果then方法的回调中返回的是一个新的Promise。这时候，下一个then中输出的不是一个Promise对象（目前我们的代码输出的是这个）。而是这个新的Promise的结果。因此，我们的也要加入返回Promise的判断。

```js
then(onFulfilled, onRejected) {
  // 上面已有代码，因此省略
  return new PromiseJz((resolve, reject) => {
    if(this.state === STATE_FULFILLED) {
      try {
        const newValue = onFulfilled(this.value)
        // 如果返回一个Promise，那么状态要根据这个Promise来定
        if(newValue instanceof PromiseJz) {
          newValue.then(resolve, reject)
        } else {
          resolve(newValue)
        }
      } catch(err) {
        reject(err)
      }
    }
    if(this.state === STATE_REJECTED) {
      try {
        const newValue = onRejected(this.reason)
        // 如果返回一个Promise，那么状态要根据这个Promise来定
        if(newValue instanceof PromiseJz) {
          newValue.then(resolve, reject)
        } else {
          resolve(newValue)
        }
      } catch(err) {
        reject(err)
      }
    }
    if(this.state === STATE_PENDING) {
      // pending状态时，无法执行回调，因此把状态写入属性中，等后续状态改变时执行
      // 处理链式调用，需要返回promise状态
      this.onFulfilledCallbackList.push((value) => {
        try {
          const newValue = onFulfilled(value)
          // 如果返回一个Promise，那么状态要根据这个Promise来定
          if(newValue instanceof PromiseJz) {
            newValue.then(resolve, reject)
          } else {
            resolve(newValue)
          }
        } catch(err) {
          reject(err)
        }
      })
      this.onRejectedCallbackList.push(reason => {
        try {
          const newValue = onRejected(reason)
          // 如果返回一个Promise，那么状态要根据这个Promise来定
          if(newValue instanceof PromiseJz) {
            newValue.then(resolve, reject)
          } else {
            resolve(newValue)
          }
        } catch(err) {
          reject(err)
        }
      })
    }
  })
}
```
可以看到，fulfilled和rejected状态的处理基本一致，同时pending的回调中处理方法也是一样的，因此，我们可以抽象出一个处理函数。这也是Promises/A+规范中的做法。

```js
// then中的回调处理
// value 返回值  onCallback 回调
resolutionProduce(value, onCallback, resolve, reject) {
  try {
    const newValue = onCallback(value)
    // 如果返回一个Promise，那么状态要根据这个Promise来定
    if(newValue instanceof PromiseJz) {
      newValue.then(resolve, reject)
    } else {
      resolve(newValue)
      }
  } catch(err) {
    reject(err)
  }
}
```

我们再将原来的代码使用处理函数改写下：
```js
then(onFulfilled, onRejected) {
  // 上面已有代码，因此省略
  return new PromiseJz((resolve, reject) => {
    if(this.state === STATE_FULFILLED) {
      this.resolutionProduce(this.value, onFulfilled, resolve, reject)
    }
    if(this.state === STATE_REJECTED) {
      this.resolutionProduce(this.reason, onRejected, resolve, reject)
    }
    if(this.state === STATE_PENDING) {
      this.onFulfilledCallbackList.push((value) => {
        this.resolutionProduce(value, onFulfilled, resolve, reject)
      })
      this.onRejectedCallbackList.push(reason => {
        this.resolutionProduce(reason, onRejected, resolve, reject)
      })
    }
  })
}
```
改之后，代码看起来舒服多了!

### 第三部分完整代码
```js
// 三种状态常量
const STATE_PENDING = 'pending'
const STATE_FULFILLED = 'fulfilled'
const STATE_REJECTED = 'rejected'

class PromiseJz {
  // 构造函数，接收一个函数作为入参
  constructor(executor) {
    try {
    // 立即执行函数 需要手动指定bind指向
    executor(this.resolve.bind(this), this.reject.bind(this))
    } catch(err) {
      // 出现异常则认为rejected
      this.reject(err)
    }
  }

  // 实例属性 状态，默认为pending
  state = STATE_PENDING
  // 成功的值
  value = null
  // 失败的原因
  reason = null
  // 异步promise调用then时的回调 处理对同一个Promise多次调用then的情况，需要用数组
  onFulfilledCallbackList = []
  onRejectedCallbackList = []

  resolve(value) {
    // 只处理pending状态
    if(this.state !== STATE_PENDING) return
    this.state = STATE_FULFILLED
    this.value = value
    // 状态改变时如果有回调函数需要执行
    this.onFulfilledCallbackList.forEach(callback => callback(value))
    // 处理完再清空数组
    this.onFulfilledCallbackList = []
  }
  reject(reason) {
    // 只处理pending状态
    if(this.state !== STATE_PENDING) return
    this.state = STATE_REJECTED
    this.reason = reason
    // 状态改变时如果有回调函数需要执行
    this.onRejectedCallbackList.forEach(callback => callback(reason))
    // 处理完再清空数组
    this.onRejectedCallbackList = []
  }

  // then中的回调处理
  // value 返回值  onCallback 回调
  resolutionProduce(value, onCallback, resolve, reject) {
    try {
      const newValue = onCallback(value)
      // 如果返回一个Promise，那么状态要根据这个Promise来定
      if(newValue instanceof PromiseJz) {
        newValue.then(resolve, reject)
      } else {
        resolve(newValue)
        }
    } catch(err) {
      reject(err)
    }
  }

  then(onFulfilled, onRejected) {
    // 回调的默认值，适用于省略入参
    if(!onFulfilled) {
      onFulfilled = value => value
    }
    if(!onRejected) {
      // 使用引发异常的方式来传递 rejected状态
      onRejected = reason => { throw reason }
    }
    // 返回Promise，适配链式调用
    return new PromiseJz((resolve, reject) => {
      if(this.state === STATE_FULFILLED) {
        this.resolutionProduce(this.value, onFulfilled, resolve, reject)
      }
      if(this.state === STATE_REJECTED) {
        this.resolutionProduce(this.reason, onRejected, resolve, reject)
      }
      if(this.state === STATE_PENDING) {
        // pending状态时，无法执行回调，因此把状态写入属性中，等后续状态改变时执行
        this.onFulfilledCallbackList.push((value) => {
          this.resolutionProduce(value, onFulfilled, resolve, reject)
        })
        this.onRejectedCallbackList.push(reason => {
          this.resolutionProduce(reason, onRejected, resolve, reject)
        })
      }
    })
  }
}

module.exports = PromiseJz
```

## 第四部分 更多异常处理
### Promise循环调用自身
考虑这样一种情况，then中返回的Promise是它自身。看一下例子：
```js
const prom16 = new PromiseJz(function (resolve, reject) {
  setTimeout(() => resolve(1), 1000)
})
const prom16Then = prom16.then(value => {
  console.log('prom16成功1', value)
  return prom16Then
})
prom16Then.then(value => {
  console.log('prom16成功2', value)
}, (reason) => {
  console.log('prom16失败2', reason)
})
```

这时候，prom16Then这个Promise是then方法返回的这个Promise。但是这个Promise返回了prom16Then，因此是依赖于prom16Then的状态。此时prom16Then的更改状态是依赖于prom16Then自身的状态的。由于循环调用了自身，因此这个Promise永远都不会更改状态。

Promises/A+规范要求遇到这种情况时，程序需要抛出TypeError异常，这个异常是可以被then方法的第二个回调函数捕获到的。我们参考Node.js中的异常提示来实现。
```
TypeError: Chaining cycle detected for promise #<Promise>
```

修改下resolutionProduce函数，加入识别自身的判断。这里我们直接引发了TypeError，由下面的catch去捕获处理。
```js
resolutionProduce(thenPromise, value, onCallback, resolve, reject) {
  try {
    const newValue = onCallback(value)
    // 如果循环调用自身，抛出TypeError
    if(thenPromise === newValue) {
      throw TypeError('Chaining cycle detected for promise #<Promise>')
    }
    // 如果返回一个Promise，那么状态要根据这个Promise来定
    if(newValue instanceof PromiseJz) {
      newValue.then(resolve, reject)
    } else {
      resolve(newValue)
    }
  } catch(err) {
    reject(err)
  }
}
```

这样上面的prom16测试也可以通过了。

### then异常处理的问题
但上面的代码还是有问题：如果我们把prom16测试中then的第二个入参，即onRejected回调删除，JS中原生的Promise是会引发异常的。但是我们的Promise拦截了。我们抛开循环调用自身的场景，看一个简单的例子：
```js
PromiseJz = Promise
const prom21 = new PromiseJz(function (resolve, reject) {
  setTimeout(() => resolve(1), 1000)
}).then(value => {
  throw Error(value)
})
// 情况1
prom21.then(() => {})
// 情况2
prom21.then(() => {}, reason => {
  console.log('prom21失败2',reason)
})
```

对于prom21测试，JS中原生的Promise的现象是：情况1应该未捕获异常，情况2捕获则到了这个异常，然后输出。最后程序还是会异常终止。如果只保留情况2，则程序可以正常结束。而我们的代码在情况2可以正常运行，情况1则不会有任何输出或异常终止。

这是因为即使我们没有手动捕获，resolutionProduce函数也替我们捕获了异常，给了reject函数。即使后续没有then来处理这个reject，异常也不会再抛出了。

但是如果我们去掉resolutionProduce函数中的try/catch，或者捕获并提供给reject之后再抛出，这个异常都无法被捕获，都不能实现和JS中原生的Promise一样的效果。这是因为我们需要在前一个then方法上抛出一个真正的异常，然后在后一个then方法中捕获。如果后一个then方法的onRejected回调不存在，则异常被真正抛出，如果onRejected回调存在，则不抛出，而是被捕获。

我们再尝试把then放到setTimeout中，让捕获的时间晚于抛出异常的时间。

```js
const prom22 = new Promise(function (resolve, reject) {
  setTimeout(() => resolve(1), 1000)
}).then(value => {
  throw Error(value)
})
setTimeout(() => {
  prom22.then(() => {}, reason => {
    console.log('prom22失败2',reason)
  })
}, 1000)
```
在Node.js中，依旧是抛出异常结束程序。而在Chrome浏览器的Console中，先是抛出了红字的未捕获异常，然后过了一秒当then方法执行后，红字又变成黑字，意思是异常被捕获到了。

![Chrome浏览器的Console实验图](/2023/promise-1.png)

这部分在Promises/A+规范中并未要求，但我还是尝试实现一下。（Chrome中的这种操作肯定是做不到的）

首先增加一个实例属性，代表then中的onRejected是否传入过。然后修改resolutionProduce函数，在捕获异常的同时，如果新生成的Promise已经传入过onRejected回调，这时说明异常会被新的Promise中的then捕获到，因此不抛出异常。反之则抛出异常。

```js
thenOnRejectedFlag = false

resolutionProduce(thenPromise, value, onCallback, resolve, reject) {
  try {
    // 上面已有代码，因此省略
  } catch(err) {
    reject(err)
    if(!thenPromise.thenOnRejectedFlag)
      throw err
  }
}
```

### Promise构造函数回调中resolve值为Promise
上一步我们处理了then方法中返回Promise的情况，此时后一个then方法的状态是由这个返回的Promise来确定的。同样的，Promise构造函数的回调中如果resolve返回的是一个Promise，后续then方法的状态也是由返回的Promise来确定的。我们看一下例子：
```js
const prom24 = new PromiseJz(function (resolve, reject) {
  const returnProm = new PromiseJz((resolveItem) => resolveItem(10))
  setTimeout(() => resolve(returnProm), 1000)
})
prom24.then(value => {
  console.log('prom24成功', value)
})

// JS原生Promise输出 prom24成功 10
// 我们的PromiseJz输出 prom24成功 PromiseJz { ...省略 }
```

使用JS中原生的Promise，输出的是returnProm最终resolve的值，也就是10。但是我们的Promise输出的却是一个Promise对象。这部分在Promises/A+规范中也没有涉及，但我们这里还是做一下处理。

此时有一个疑问，我们是在then中判断当前的Promise值为一个Promise，再进行处理；还是在resolve和reject的时候，判断如果接收到的是一个Promise，则等待这个Promise状态改变后再改变本身的状态？JS中原生的Promise选择了后者。我们再看一个例子：

```js
PromiseJz = Promise
const prom25 = new PromiseJz(function (resolve, reject) {
  const returnProm = new PromiseJz((resolveItem) => setTimeout(() => resolveItem(10), 3000))
  setTimeout(() => {
    resolve(returnProm)
    console.log('1秒时')
    setTimeout(() => { console.log('2秒时', prom25) }, 1000)
  }, 1000)
})
prom25.then(value => {
  console.log('3秒时 prom25成功', value)
})
/* 输出结果
1秒时
2秒时 Promise { <pending> }
3秒时 prom25成功 10
*/
```

可以看到当第二秒时，此时已经调用过resolve了，但是resolve的值为一个Promise，这个Promise的状态还是Pending。这时候我们输出一下这个原始的Promise，发现还是Pending。所以，我们原始的Promise状态是由这个新的Promise决定的。

再看看一个奇怪的现象：
```js
PromiseJz = Promise
const prom26 = new PromiseJz(function (resolve, reject) {
  const returnProm = new PromiseJz((resolveItem, rejectItem) => setTimeout(() => resolveItem(10), 3000))
  setTimeout(() => {
    reject(returnProm)
    console.log('1秒时')
    setTimeout(() => { console.log('2秒时', prom26) }, 1000)
  }, 1000)
})
prom26.then(value => {
  console.log('3秒时 prom25成功', value)
}, resaon => {
  console.log('3秒时 prom25失败', resaon)
})
/* 输出结果
1秒时
3秒时 prom25失败 Promise { <pending> }
2秒时 Promise { <rejected> Promise { <pending> } }
*/
```
prom26实例reject了一个新的Promise，这个Promise最终是`fulfilled`状态。这时候then反而先输出，捕获到了rejected状态，但此时新的Promise还在Pending。因此，resolve和reject的处理是不同的。更确切的说，reject调用时，不需要等待新的Promise状态变化，还是使用原来的方式处理即可。我们处理下resolve函数。
```js
resolve(value) {
  // 只处理pending状态
  if(this.state !== STATE_PENDING) return
  // 如果值为一个新的Promise，那么状态由这个新的Promise确定
  if(value instanceof PromiseJz) {
    value.then(newValue => {
      if(this.state !== STATE_PENDING) return
      this.state = STATE_FULFILLED
      this.value = newValue
      // 状态改变时如果有回调函数需要执行
      this.onFulfilledCallbackList.forEach(callback => callback(newValue))
      // 处理完再清空数组
      this.onFulfilledCallbackList = []
    }, newReason => {
      // 只处理pending状态
      if(this.state !== STATE_PENDING) return
      this.state = STATE_REJECTED
      this.reason = newReason
      // 状态改变时如果有回调函数需要执行
      this.onRejectedCallbackList.forEach(callback => callback(newReason))
      // 处理完再清空数组
      this.onRejectedCallbackList = []
    })
  } else {
    this.state = STATE_FULFILLED
    this.value = value
    // 状态改变时如果有回调函数需要执行
    this.onFulfilledCallbackList.forEach(callback => callback(value))
    // 处理完再清空数组
    this.onFulfilledCallbackList = []
  }
```

可以看到还是存在冗余的逻辑，我们再抽象出一个函数。
```js
resolve(value) {
  // 如果值为一个新的Promise，那么状态由这个新的Promise确定
  if(value instanceof PromiseJz) {
    value.then(newValue => {
      this.resolveHandle(newValue)
    }, newReason => {
      this.rejectHandle(newReason)
    })
  } else {
    this.resolveHandle(value)
  }
}
// resolve函数状态变更的处理逻辑
resolveHandle(value) {
  if(this.state !== STATE_PENDING) return
  this.state = STATE_FULFILLED
  this.value = value
  this.onFulfilledCallbackList.forEach(callback => callback(value))
  this.onFulfilledCallbackList = []
}

reject(reason) {
  this.rejectHandle(reason)
}

// reject函数状态变更的处理逻辑
rejectHandle(reason) {
  // 只处理pending状态
  if(this.state !== STATE_PENDING) return
  this.state = STATE_REJECTED
  this.reason = reason
  this.onRejectedCallbackList.forEach(callback => callback(reason))
  this.onRejectedCallbackList = []
}
```

这下看起来又清爽多了，上面的例子也可以成功输出结果。不过这里的执行顺序目前还和JS原生的Promise不一致，而且prom24测试并未成功。我们下一步再完善。

### then的执行逻辑使用微任务
上面的测试24并未成功，我们的Promise不会返回结果。我调试了一下，简化为这样的场景：
```js
new PromiseJz((resolveItem) => resolveItem(10)).then(value => console.log("prom27成功", value))
```
这种基础的场景，我们的Promise竟然没有输出！这是在第二部分时我们就已经测试过的。我调试了一下，发现是我们在then中处理重复调用自身抛出异常的逻辑时，使用到了then方法返回的Promise。在异步状态下，这个Promise肯定已经初始化完毕了，但如果是同步执行，这个新的Promise还没有初始化完毕。这时候我们拿它做判断是不对的。

规范中也要求了then中的回调要异步执行，在ECMAScript中设立了一个单独的微任务给Promise，规范中要求用宏任务或者微任务都可以。这里我们就采用在浏览器和Node.js中都可以使用的queueMicrotask作为延迟执行的方法。（至于兼容性？这里不考虑）对事件循环不熟悉的同学可以看一下我之前写的文章：[谈一谈浏览器与Node.js中的JavaScript事件循环，宏任务与微任务机制](https://jzplp.github.io/2023/macro-micro-task.html)

我们改造一下then方法：
```js
then(onFulfilled, onRejected) {
  // 上面已有代码，因此省略
  const thenPromise = new PromiseJz((resolve, reject) => {
    if(this.state === STATE_FULFILLED) {
      queueMicrotask(() => {
        this.resolutionProduce(thenPromise, this.value, onFulfilled, resolve, reject)
      })
    }
    if(this.state === STATE_REJECTED) {
      queueMicrotask(() => {
        this.resolutionProduce(thenPromise, this.reason, onRejected, resolve, reject)
      })
    }
    if(this.state === STATE_PENDING) {
      this.onFulfilledCallbackList.push((value) => {
        queueMicrotask(() => {
          this.resolutionProduce(thenPromise, value, onFulfilled, resolve, reject)
        })
      })
      this.onRejectedCallbackList.push(reason => {
        queueMicrotask(() => {
          this.resolutionProduce(thenPromise, reason, onRejected, resolve, reject)
        })
      })
    }
  })
  return thenPromise
}
```

这里有几点需要注意：
1. 为了保持执行逻辑的一致，我们对于pending状态的处理也加入了微任务。
2. 作为函数参数传递也算“使用它的值”，因此即使上面的逻辑一样，也无法在resolutionProduce函数中统一处理，必须写在外面。

到这里，prom24和prom27测试都可以通过了。prom25和prom26测试的输出顺序也和JS中原生的Promise一致了。

### 处理构造函数回调中返回自身
之前我们处理过then函数循环调用自身的情况，会抛出TypeError。如果构造函数的回调中也出现了调用自身的情况，ECMAScript中的Promise也会抛出同样的异常。看这个例子：
```js
PromiseJz = Promise
const prom28 = new PromiseJz(function (resolve, reject) {
  setTimeout(() => resolve(prom28), 1000)
})
prom28.then(value => {
  console.log('prom28成功', value)
})
// 输出结果
// TypeError: Chaining cycle detected for promise #<Promise>
```
经过测试，这里和then中的逻辑类似：如果没有then方法的onRejected回调，或者在执行到resolve时then方法还获取不到，就抛出异常，否则异常可以被捕获。

我们这里也做下处理：
```js
resolve(value) {
  // 在构造函数回调中返回自身
  if(value === this) {
    const err = new TypeError('Chaining cycle detected for promise #<Promise>')
    // 如果then传入过onRejected，则不抛出异常，而是触发rejected状态 否则抛出异常
    if(this.thenOnRejectedFlag) {
      this.reject(err)
    } else {
      throw err
    }
    return
  }
  // 上面已有代码，因此省略
}
```

对于prom28测试，这段代码是生效的。但prom28是异步返回then，如果是同步返回呢？会不会遇到上面then使用微任务一样的问题，即这个Promise还没有创建完毕，就开始比较了？我们试一下：
```js
PromiseJz = Promise
const prom29 = new PromiseJz(function (resolve, reject) {
  resolve(prom29)
})
// 输出结果
// ReferenceError: Cannot access 'prom29' before initialization
```

可以看到，如果是同步执行，还没进入到Promise内部的比较，就因为在初始化完成前就使用作为函数入参而抛出异常了。这个异常也可以被then中的onRejected回调捕获。但是在没有使用then的情况下，prom29在我们的代码上测试，没有抛出异常。这个问题我们在下一节处理。

### 构造函数中所有rejected都作为异常
上一节中，我们实际上在构造函数的回调中抛出了异常。这个异常会被构造函数捕获，并交给reject函数处理。但如果then中的onRejected回调不存在呢？此时我们的代码并不会输出异常。而是当作无事发生。更进一步，JS中原生的Promise，对于rejected状态的promise，如果没有then捕获，都会抛出异常，例如：
```js
PromiseJz = Promise
const prom30 = new PromiseJz((resolve, reject) => { reject(0) })
```
上面这个测试在Chrome浏览器和Node.js中都会抛出未捕获的异常。因此，我们也做一下处理。
```js
constructor(executor) {
  try {
    executor(this.resolve.bind(this), this.reject.bind(this))
  } catch(err) {
    queueMicrotask(() => {
      this.reject(err)
      if(!this.thenOnRejectedFlag)
        throw err
    })
  }
}
// reject函数状态变更的处理逻辑
rejectHandle(reason) {
  // 上面已有代码，因此省略
  throw reason
}
resolve(value) {
  // 在构造函数回调中返回自身的处理逻辑进行了简化
  if(value === this) {
    this.rejectHandle(TypeError('Chaining cycle detected for promise #<Promise>'))
    return
  }
  // 上面已有代码，因此省略
}
```
首先是reject函数处理逻辑，这里判断如果没有捕获到就抛出异常。但是，这个异常又可能会被构造函数的捕获。这时候的异常来源主要有几种：
1. constructor的executor回调产生的异常。会被constructor中的try/catch捕获。
2. reject函数调用引起的状态变化，会被reject函数抛出异常，又被constructor中的try/catch捕获。
3. resolve函数中调用resolveHandle函数。

因此，我们除了要对reject函数逻辑做处理之外，构造函数的catch中还要将其抛出来。那什么这里还要再用一个微任务？考虑这样的情况：
```js
const prom30 = new PromiseJz((resolve, reject) => { reject(0) })
prom30.then(null, reason => {
  console.log('prom30失败', reason)
})
```
构造函数回调中是同步代码，执行到catch语句时，还没有碰到then方法，这种情况我们的代码会认为没有捕获到异常而抛出。因此，我们使用`queueMicrotask`，延迟异常的抛出，以便后面的then可以捕获到。这部分在Promises/A+规范中应该也并未要求。

### 第四部分完整代码
```js
// 三种状态常量
const STATE_PENDING = 'pending'
const STATE_FULFILLED = 'fulfilled'
const STATE_REJECTED = 'rejected'

class PromiseJz {
  // 构造函数，接收一个函数作为入参
  constructor(executor) {
    try {
      // 立即执行函数 需要手动指定bind指向
      executor(this.resolve.bind(this), this.reject.bind(this))
    } catch(err) {
      // 如果是同步代码，需要用微任务延迟执行，以获取到是否调用了then方法
      queueMicrotask(() => {
        // 出现异常则认为rejected
        this.reject(err)
        // 如果捕获不到就抛出
        if(!this.thenOnRejectedFlag)
          throw err
      })
    }
  }

  // 实例属性 状态，默认为pending
  state = STATE_PENDING
  // 成功的值
  value = null
  // 失败的原因
  reason = null
  // 异步promise调用then时的回调 处理对同一个Promise多次调用then的情况，需要用数组
  onFulfilledCallbackList = []
  onRejectedCallbackList = []
  // 是否传入过then中的onRejected
  thenOnRejectedFlag = false

  resolve(value) {
    // 在构造函数回调中返回自身
    if(value === this) {
      // 触发rejected状态
      this.rejectHandle(TypeError('Chaining cycle detected for promise #<Promise>'))
      return
    }
    // 如果值为一个新的Promise，那么状态由这个新的Promise确定
    if(value instanceof PromiseJz) {
      value.then(newValue => {
        this.resolveHandle(newValue)
      }, newReason => {
        this.rejectHandle(newReason)
      })
    } else {
      this.resolveHandle(value)
    }
  }
  // resolve函数状态变更的处理逻辑
  resolveHandle(value) {
    // 只处理pending状态
    if(this.state !== STATE_PENDING) return
    this.state = STATE_FULFILLED
    this.value = value
    // 状态改变时如果有回调函数需要执行
    this.onFulfilledCallbackList.forEach(callback => callback(value))
    // 处理完再清空数组
    this.onFulfilledCallbackList = []
  }

  reject(reason) {
    this.rejectHandle(reason)
  }

  // reject函数状态变更的处理逻辑
  rejectHandle(reason) {
    // 只处理pending状态
    if(this.state !== STATE_PENDING) return
    this.state = STATE_REJECTED
    this.reason = reason
    // 状态改变时如果有回调函数需要执行
    this.onRejectedCallbackList.forEach(callback => callback(reason))
    // 处理完再清空数组
    this.onRejectedCallbackList = []
    // 构造函数中所有rejected都作为异常
    throw reason
  }

  // then中的回调处理
  // thenPromise then返回的Promise value 返回值  onCallback 回调
  resolutionProduce(thenPromise, value, onCallback, resolve, reject) {
    try {
      const newValue = onCallback(value)
      // 如果循环调用自身，抛出TypeError
      if(thenPromise === newValue) {
        throw TypeError('Chaining cycle detected for promise #<Promise>')
      }
      // 如果返回一个Promise，那么状态要根据这个Promise来定
      if(newValue instanceof PromiseJz) {
        newValue.then(resolve, reject)
      } else {
        resolve(newValue)
      }
    } catch(err) {
      reject(err)
      // 如果新Promise截止目前没有传入过onRejected，则抛出不能被捕获的异常
      if(!thenPromise.thenOnRejectedFlag)
        throw err
    }
  }

  then(onFulfilled, onRejected) {
    // 回调的默认值，适用于省略入参
    if(!onFulfilled) {
      onFulfilled = value => value
    }
    if(!onRejected) {
      // 使用引发异常的方式来传递 rejected状态
      onRejected = reason => { throw reason }
    } else {
      this.thenOnRejectedFlag = true
    }
    // 返回Promise，适配链式调用
    const thenPromise = new PromiseJz((resolve, reject) => {
      if(this.state === STATE_FULFILLED) {
        queueMicrotask(() => {
          this.resolutionProduce(thenPromise, this.value, onFulfilled, resolve, reject)
        })
      }
      if(this.state === STATE_REJECTED) {
        queueMicrotask(() => {
          this.resolutionProduce(thenPromise, this.reason, onRejected, resolve, reject)
        })
      }
      if(this.state === STATE_PENDING) {
        // pending状态时，无法执行回调，因此把状态写入属性中，等后续状态改变时执行
        this.onFulfilledCallbackList.push((value) => {
          queueMicrotask(() => {
            this.resolutionProduce(thenPromise, value, onFulfilled, resolve, reject)
          })
        })
        this.onRejectedCallbackList.push(reason => {
          queueMicrotask(() => {
            this.resolutionProduce(thenPromise, reason, onRejected, resolve, reject)
          })
        })
      }
    })
    return thenPromise
  }
}

module.exports = PromiseJz
```


## 第五部分 满足规范要求
通过上面的步骤，我们实现了基本的Promise功能（标准未要求的功能在后面的步骤实现）。但是我们目前的Promise还是不符合部分规范的，无法通过测试，还需要进行部分改动。

### 加入deferred函数
Promise/A+规范的测试工具需要使用deferred函数进行测试，因此在类中增加一个静态方法。
```js
static deferred() {
  const res = {};
  res.promise = new PromiseJz(function (resolve, reject) {
    res.resolve = resolve;
    res.reject = reject;
  })
  return res;
}
```

### 兼容thenable对象
为了适配其他Promise实现和thenable对象，因此要考虑兼容的问题。这部分基本就是对Promises/A+规范中的2.3.3节的实现。

```js
resolutionProduce(thenPromise, value, onCallback, resolve, reject) {
  try {
    const newValue = onCallback(value)
    // 如果循环调用自身，抛出TypeError
    if(thenPromise === newValue) {
      throw TypeError('Chaining cycle detected for promise #<Promise>')
    }
    // 如果返回一个Promise，那么状态要根据这个Promise来定
    if(newValue instanceof PromiseJz) {
      newValue.then(resolve, reject)
    } else if(typeof newValue === 'object' || typeof newValue === 'function') {
      // 兼容其它的promise实现
      let then
      try {
        then = newValue.then
      } catch(e) { // 如果抛出异常则设为rejected状态
        reject(e)
        return
      }
      // 如果then不是函数，则设置fulfilled状态
      if(typeof then !== 'function') {
        resolve(newValue) 
        return
      }
      // 是否调用过的标志 只能调用一次
      let calledFlag = false
      // 调用then方法
      then.call(newValue, y => {
        if(calledFlag) return
        calledFlag = true
        this.resolutionProduce(thenPromise, y, v => v, resolve, reject)
      }, r => {
        if(calledFlag) return
        calledFlag = true
        reject(r)
      })
    } else {
      resolve(newValue)
    }
  } catch(err) {
    reject(err)
    // 如果新Promise截止目前没有传入过onRejected，则抛出不能被捕获的异常
    if(!thenPromise.thenOnRejectedFlag)
      throw err
  }
}
```

### 去掉大部分throw
ECMAScript的实现和Promises/A+规范的要求有些不一致。我们抛出的异常会造成后续测试失败。因此我们把大部分抛出异常都取消掉，对应的部分冗余逻辑也会删除。这里就不给出具体的代码了，后面会给出完整代码。

### 修改resolutionProduce函数，处理递归解析
我们的resolutionProduce函数是包含onFulfilled和onFulfilled回调处理的。但是Promises/A+规范中在处理thenable对象时，还需要传这个函数，因此我们要进行改造，把回调处理放到这个函数外面。对应调用resolutionProduce函数的地方也都做下处理。

```js
// 入参少了onCallback
resolutionProduce(thenPromise, newValue, resolve, reject) {
  try {
    // 这句去掉
    // const newValue = onCallback(value)
    // 上面已有代码，因此省略
  } catch () {
    reject(err)
  }
}

then(onFulfilled, onRejected) {
  // 其他已有代码，因此省略
  // 这里只列举fulfilled状态的代码，其他状态的处理基本相同。
  if(this.state === STATE_FULFILLED) {
    queueMicrotask(() => {
      try {
        const newValue = onFulfilled(this.value)
        this.resolutionProduce(thenPromise, newValue, resolve, reject)
      } catch(err) {
        reject(err)
      }
    })
  }
}
```

同样的，我们自己的Promise对象的处理考虑的不够全面，因此直接使用Promises/A+规范的方法处理。
```js
// 这部分代码删除
if(newValue instanceof PromiseJz) {
  newValue.then(resolve, reject)
}
```

还有一个改动是，Promises/A+规范3.3.3.4中的thenable对象then执行中的异常处理。即如果newValue.then入参中的两个函数都已经被调用过，那么即使有异常，也要忽略。因此在then.call外面套一个try/catch处理。这时候，包裹整个resolutionProduce函数的try/catch已经没有用了，可以删除。
```js
let calledFlag = false
try {
  then.call(newValue, y => {
    if(calledFlag) return
    calledFlag = true
    this.resolutionProduce(thenPromise, y, resolve, reject)
  }, r => {
    if(calledFlag) return
    calledFlag = true
    reject(r)
  })
} catch(err) {
  if(calledFlag) return
  reject(err)
}
```

### 其他改动
#### then回调函数入参判断
之前我们仅仅粗暴的判断了是否存在，现在修改成判断是否为函数，如果不是函数则使用默认值。
```js
then(onFulfilled, onRejected) {
  if(typeof onFulfilled !== 'function') {
    onFulfilled = value => value
  }
  if(typeof onRejected !== 'function') {
    onRejected = reason => { throw reason }
  }
  // 上面已有代码，因此省略
}
```

#### object中加入null判断
typeof null 的值也是 'object'，因此我们要加入相关的处理。
```js
} else if(typeof newValue === 'object' || typeof newValue === 'function') {
  // typeof null 也是 'object'
  if (newValue === null) {
    resolve(newValue) 
    return
  }
  // 上面已有代码，因此省略
}
```

#### 设置私有方法和私有属性
不提供给外部调用的方法和属性设置成私有的，前面加#号。这并不是Promises/A+规范要求的，但是这样处理更规范，也更容易分清那些看起来名字一样的变量和方法。

设置之后可以看到，其实Promises/A+规范就只要求的构造函数，then方法还有一个测试用的静态方法deferred而已。那些更多的方法是ECMAScript自己加的，不在Promises/A+规范内。

### 第五部分完整代码
这个完整的代码已经可以通过Promises/A+规范的测试了。
```js
// 三种状态常量
const STATE_PENDING = 'pending'
const STATE_FULFILLED = 'fulfilled'
const STATE_REJECTED = 'rejected'

class PromiseJz {
  // 构造函数，接收一个函数作为入参
  constructor(executor) {
    try {
      // 立即执行函数 需要手动指定bind指向
      executor(this.#resolve.bind(this), this.#reject.bind(this))
    } catch(err) {
      // 出现异常则认为rejected
      this.reject(err)
    }
  }

  // 状态，默认为pending
  #state = STATE_PENDING
  // 成功的值
  #value = null
  // 失败的原因
  #reason = null
  // 异步promise调用then时的回调 处理对同一个Promise多次调用then的情况，需要用数组
  #onFulfilledCallbackList = []
  #onRejectedCallbackList = []

  #resolve(value) {
    // 在构造函数回调中返回自身
    if(value === this) {
      // 触发rejected状态
      this.#rejectHandle(TypeError('Chaining cycle detected for promise #<Promise>'))
      return
    }
    // 如果值为一个新的Promise，那么状态由这个新的Promise确定
    if(value instanceof PromiseJz) {
      value.then(newValue => {
        this.#resolveHandle(newValue)
      }, newReason => {
        this.#rejectHandle(newReason)
      })
    } else {
      this.#resolveHandle(value)
    }
  }
  // resolve函数状态变更的处理逻辑
  #resolveHandle(value) {
    // 只处理pending状态
    if(this.#state !== STATE_PENDING) return
    this.#state = STATE_FULFILLED
    this.#value = value
    // 状态改变时如果有回调函数需要执行
    this.#onFulfilledCallbackList.forEach(callback => callback(value))
    // 处理完再清空数组
    this.#onFulfilledCallbackList = []
  }

  #reject(reason) {
    this.#rejectHandle(reason)
  }

  // reject函数状态变更的处理逻辑
  #rejectHandle(reason) {
    // 只处理pending状态
    if(this.#state !== STATE_PENDING) return
    this.#state = STATE_REJECTED
    this.#reason = reason
    // 状态改变时如果有回调函数需要执行
    this.#onRejectedCallbackList.forEach(callback => callback(reason))
    // 处理完再清空数组
    this.#onRejectedCallbackList = []
  }

  // then中的回调处理
  // thenPromise then返回的Promise newValue 回调的返回值  onCallback 回调
  #resolutionProduce(thenPromise, newValue, resolve, reject) {
      // 如果循环调用自身，抛出TypeError
      if(thenPromise === newValue) {
        reject(TypeError('Chaining cycle detected for promise #<Promise>'))
        return
      }
      // 兼容的promise实现
      if(typeof newValue === 'object' || typeof newValue === 'function') {
        // typeof null 也是 'object'
        if (newValue === null) {
          resolve(newValue) 
          return
        }
        let then
        try {
          then = newValue.then
        } catch(e) { // 如果抛出异常则设为rejected状态
          reject(e)
          return
        }
        // 如果then不是函数，则设置fulfilled状态
        if(typeof then !== 'function') {
          resolve(newValue) 
          return
        }
        // 是否调用过的标志 只能调用一次
        let calledFlag = false
        // 调用then方法
        try {
          then.call(newValue, y => {
            if(calledFlag) return
            calledFlag = true
            this.#resolutionProduce(thenPromise, y, resolve, reject)
          }, r => {
            if(calledFlag) return
            calledFlag = true
            reject(r)
          })
        } catch(err) {
          if(calledFlag) return
          reject(err)
        }
      } else {
        resolve(newValue)
      }
  }

  then(onFulfilled, onRejected) {
    // 回调的默认值，适用于省略入参
    if(typeof onFulfilled !== 'function') {
      onFulfilled = value => value
    }
    if(typeof onRejected !== 'function') {
      // 使用引发异常的方式来传递 rejected状态
      onRejected = reason => { throw reason }
    }
    // 返回Promise，适配链式调用
    const thenPromise = new PromiseJz((resolve, reject) => {
      if(this.#state === STATE_FULFILLED) {
        queueMicrotask(() => {
          try {
            const newValue = onFulfilled(this.#value)
            this.#resolutionProduce(thenPromise, newValue, resolve, reject)
          } catch(err) {
            reject(err)
          }
        })
      }
      if(this.#state === STATE_REJECTED) {
        queueMicrotask(() => {
          try {
            const newValue = onRejected(this.#reason)
            this.#resolutionProduce(thenPromise, newValue, resolve, reject)
          } catch(err) {
            reject(err)
          }
        })
      }
      if(this.#state === STATE_PENDING) {
        // pending状态时，无法执行回调，因此把状态写入属性中，等后续状态改变时执行
        this.#onFulfilledCallbackList.push((value) => {
          queueMicrotask(() => {
            try {
              const newValue = onFulfilled(value)
              this.#resolutionProduce(thenPromise, newValue, resolve, reject)
            } catch(err) {
              reject(err)
            }
          })
        })
        this.#onRejectedCallbackList.push(reason => {
          queueMicrotask(() => {
            try {
              const newValue = onRejected(reason)
              this.#resolutionProduce(thenPromise, newValue, resolve, reject)
            } catch(err) {
              reject(err)
            }
          })
        })
      }
    })
    return thenPromise
  }
  // Promise/A+规范的测试工具使用
  static deferred() {
    const res = {};
    res.promise = new PromiseJz(function (resolve, reject) {
      res.resolve = resolve;
      res.reject = reject;
    })
    return res;
  }
}

module.exports = PromiseJz
```

## Promises/A+规范测试
### 建立测试环境
首先电脑上安装Node.js和npm等工具。然后创建项目，安装依赖并配置。
```sh
## 命令行执行
# 创建工程
npm init
# 安装依赖
npm install -D promises-aplus-tests
```
把我们的Promise实现放到工程中，例如放到 src/index.js。然后在package.json的scripts中增加命令：
```
"test:APlus": "promises-aplus-tests src/index.js"
```
然后就可以开始执行测试啦！
```sh
## 命令行执行
npm run test:APlus
```
命令行中会输出测试结果，如果测试失败会有红色的字来说明。

![Promises/A+规范测试效果图](/2023/promise-2.png)

### 测试结果
测试结果肯定是通过啦，当然其中也遇到了部分问题，第五部分的大部分时间其实就是改Bug。秀一下通过测试的图。

![Promises/A+规范测试通过图](/2023/promise-3.png)

通过测试并不是结束，后面的部分我们将继续实现与ECMAScript同样的实用函数。后面方法的实现基本不会改动我们已经实现的Promise的主体部分（因此后面的每一部分就不放完整代码了）。至于上面那些Promises/A+规范与ECMAScript不一致的地方，也只能先放着不管了。

## 第六部分 静态resolve/reject方法
静态的resolve/reject方法主要是将一个对象（可能是Promise，也可能是thenable对象，也可能是其他）转化为一个Promise对象。

### 静态resolve方法
```js
static resolve(data) {
  if(data instanceof PromiseJz)
    return data
  return new PromiseJz(function (resolveItem, rejectItem) {
    resolveItem(data)
  })
}
```

由于thenable对象等处理方法其实我们在then方法中已经处理过了，因此如果不是Promise的话，这里直接用一个Promise包裹即可。

### 静态reject方法
静态reject方法不需要处理入参是Promise或者thenable对象的情况。看一下这个例子：
```js
PromiseJz = Promise
const prom33 = new PromiseJz((resolve, reject) => {
  setTimeout(() => resolve(1), 1000)
})
PromiseJz.reject(prom33).then(value => {
  console.log('prom33成功', value)
}, reason => {
  console.log('prom33失败', reason)
})
// 输出结果
// prom33失败 Promise { <pending> }
```

可以看到，实际上Promise.reject并没有等入参的Promise状态改变再返回。而即使传入的Promise状态是fulfilled，静态reject方法的状态还是rejected。那我们就很容易处理了，直接返回rejected状态即可。

```js
static reject(data) {
  return new PromiseJz(function (resolveItem, rejectItem) {
    rejectItem(data)
  })
}
```

## 第七部分 catch/finally方法
这一部分主要是实现ECMAScript提供的实例方法，其中then之前已经实现过，目前还剩catch和finally方法。

### catch方法
catch方法非常简单，实际上就是then方法不传onFulfilled即可。
```js
catch(onRejected) {
  return this.then(null, onRejected)
}
```

### finally方法
finally方法类似类似于try/catch/finally中的finally，不管状态如何都会执行。而且finally会把Promise的状态传递下去。看这个例子：
```js
PromiseJz = Promise
const prom34 = new PromiseJz((resolve, reject) => { reject(0) }).finally(() => {
  console.log('prom34 finally')
})
prom34.then(value => {
  console.log('prom34成功', value)
}, reason => {
  console.log('prom34失败', reason)
})
// 输出结果
// prom34 finally
// prom34失败 0
```
可以看到，fulfilled或者rejected的状态会被传递下去，后面的then也能接收到。但是如果finally中抛出异常了，返回的Promise就是rejected状态。这里我们实现一下finally方法。

```js
// 错误的代码  仅为示例
finally(callback) {
  return this.then(value => {
    callback()
    return value
  }, reason => {
    callback()
    throw reason
  })
}
```
上面的代码可以实现传递状态的功能，如果callback中引发异常也能正确识别。但是我们JS中原生的Promise还有一个功能。如果finally中返回了一个Promise：
- 这个Promise的状态是rejected，finally后面链式调用中接收的Promise状态也是rejected，而且reason为finally中返回的Promise的reason。
- 这个Promise的状态是fulfilled，这个状态不会影响后面链式调用中接收的Promise状态。
- 这个Promise的状态是pending，那么需要等待状态改变。

比如这个例子：
```js
PromiseJz = Promise
const prom36 = new PromiseJz((resolve, reject) => { resolve(0) }).finally(() => {
  console.log('prom36 finally')
  return new PromiseJz((resolveItem, rejectItem) => {
    setTimeout(() => rejectItem(2), 2000)
  })
})
prom36.then(value => {
  console.log('prom36成功', value)
}, reason => {
  console.log('prom36失败', reason)
})
// 输出结果
// prom36 finally
// prom36失败 2
```

上面的代码显然没有做到这个逻辑。可以将callback包裹起来，转化为一个Promise，然后在then中实现上面的逻辑。正好这里可以用到上一部分实现的静态方法Promise.resolve()。我们来重新实现下。

```js
finally(callback) {
  return this.then(value => {
    return PromiseJz.resolve(callback()).then(() => value)
  }, reason => {
    return PromiseJz.resolve(callback()).then(() => { throw reason })
  })
}
```

如果`PromiseJz.resolve(callback())`的状态为rejected，后面的then方法就不再执行了，直接返回rejected状态的Promise。到这里，上面的prom34和prom36都可以测试成功。

## 第八部分 接收数组的静态方法
这部分的方法有：
- `Promise.all()`
- `Promise.race()`
- `Promise.allSettled()`
- `Promise.any()`

我们一一进行实现。

### Promise.all()
首先入参都是一个数组，但是也要支持Iterator对象。如果不是Iterator对象要抛出错误。由于这几种方法的入参是一致的，因此我们实现一个公共逻辑来判断，而且抛出的异常与JS中原生的Promise一致。

```js
// 判断入参是否为Iterator
static #isIterator(data) {
  if (!data || typeof data[Symbol.iterator] !== 'function') {
    const type = typeof data
    throw new TypeError(`${type} ${data} is not iterable (cannot read property Symbol(Symbol.iterator))`)
  }
}
```

然后是Promise.all方法。
```js
static all(data) {
  PromiseJz.#isIterator(data)
  // count为总数量，count为Promise完成的数量
  let sum = 0, count = 0
  // 存储promise值的数组
  const valueList = []
  return new PromiseJz((resolveItem, rejectItem) => {
    for(let item of data) {
      // 当前的序号
      let tempi = sum++
      valueList.push(null)
      PromiseJz.resolve(item).then(value => {
        ++count
        valueList[tempi] = value
        // 全部完成
        if(count === valueList.length)
          resolveItem(valueList)
      }, reason => {
        // 有一个出现rejected状态则返回rejected
        rejectItem(reason)
      })
    }
    // 循环一次都没进入，实际是空数组
    if(sum === 0)
      resolveItem([])
  })
}
```

由于要适配Iterator对象，因此这里用了for of做循环。处理非Promise对象，thenable对象等则交给了PromiseJz.resolve统一转换。注意要处理下空数组。我们拿一个Iterator对象试一下：
```js
const prom37 = new PromiseJz((resolve, reject) => { resolve(37) })
const prom38 = new PromiseJz((resolve, reject) => {
  setTimeout(() => resolve(38), 2000)
})
const prom39 = new PromiseJz((resolve, reject) => {
  setTimeout(() => resolve(39), 1000)
})
let count = 0
const iteratorObj = {
  [Symbol.iterator]: () => {
    return {
      next: () => {
        ++count;
        let value = null
        switch(count) {
          case 1: value = prom37
            break
          case 2: value = prom38
            break
          case 3: value = prom39
            break
          case 4: value = 40
            break
          default: return { done: true }
        }
        return {
          value: value,
          done: false
        };
      }
    };
  }
};

PromiseJz.all(iteratorObj).then(value => {
  console.log(value)
}, reason => {
  console.log(reason)
})
// 输出结果
// [ 37, 38, 39, 40 ]
```

ECMAScript中Promise的输出和我们的PromiseJz输出结果是一致的，可以适配Iterator对象。

### Promise.race()
race方法的实现更简单，只要碰到Promise状态改变就输出即可。不用担心重复改变状态，之前在Promise内部就已经做过处理了。

```js
static race(data) {
  PromiseJz.#isIterator(data)
  return new PromiseJz((resolveItem, rejectItem) => {
    for(let item of data) {
      PromiseJz.resolve(item).then(resolveItem, rejectItem)
    }
  })
}
```

如果入参是空数组，那么既不会触发fulfilled，也不会触发rejected。ECMAScript中的Promise经过测试也是如此：
```js
PromiseJz = Promise
PromiseJz.race([]).then(value => {
  console.log(1, value)
}, reason => {
  console.log(2, reason)
})
// 无输出结果
```

### Promise.allSettled()
allSettled方法的逻辑和all非常像，只不过allSettled方法需要等所有Promise结束才行。和all方法一样，这里也要判断空数组。

```js
static allSettled(data) {
  PromiseJz.#isIterator(data)
  // count为总数量，count为Promise完成的数量
  let sum = 0, count = 0
  // 存储promise值的数组
  const valueList = []
  return new PromiseJz((resolveItem, rejectItem) => {
    for(let item of data) {
      // 当前的序号
      let tempi = sum++
      valueList.push(null)
      PromiseJz.resolve(item).then(value => {
        ++count
        valueList[tempi] = { status: 'fulfilled', value: value }
        if(count === valueList.length)
          resolveItem(valueList)
      }, reason => {
        ++count
        valueList[tempi] = { status: 'rejected', reason: reason }
        if(count === valueList.length)
          resolveItem(valueList)
      })
    }
    // 循环一次都没进入，实际是空数组
    if(sum === 0)
      resolveItem([])
  })
}
```

### Promise.any()
any方法实际上类似于all方法的反向，计数器用到了onRejected回调中。与其他方法不同的是，这里空数组要设置为rejected状态。因为空数组没有任何一个元素可以变为fulfilled状态。

```js
static any(data) {
  PromiseJz.#isIterator(data)
  // count为总数量，count为Promise完成的数量
  let sum = 0, count = 0
  // 存储promise值的数组
  const reasonList = []
  return new PromiseJz((resolveItem, rejectItem) => {
    for(let item of data) {
      // 当前的序号
      let tempi = sum++
      reasonList.push(null)
      PromiseJz.resolve(item).then(value => {
        resolveItem(value)
      }, reason => {
        ++count
        reasonList[tempi] = reason
        if(count === reasonList.length)
        // ECMAScript要求抛出AggregateError错误
        rejectItem(new AggregateError(reasonList, 'All promises were rejected'))
      })
    }
    // 循环一次都没进入，实际是空数组 为rejected状态
    if(sum === 0)
      rejectItem(new AggregateError([], 'All promises were rejected'))
  })
}
```

## 最终版本完整代码
到这里，Promise的完整功能已经基本实现。由于从第六部分开始就没有改动过Promise的主体部分，只是新增方法，因此最终版本也是可以通过Promises/A+规范测试的。看一下我们的最终版本代码：

```js
// 三种状态常量
const STATE_PENDING = 'pending'
const STATE_FULFILLED = 'fulfilled'
const STATE_REJECTED = 'rejected'

class PromiseJz {
  // 构造函数，接收一个函数作为入参
  constructor(executor) {
    try {
      // 立即执行函数 需要手动指定bind指向
      executor(this.#resolve.bind(this), this.#reject.bind(this))
    } catch(err) {
      // 出现异常则认为rejected
      this.reject(err)
    }
  }

  // 状态，默认为pending
  #state = STATE_PENDING
  // 成功的值
  #value = null
  // 失败的原因
  #reason = null
  // 异步promise调用then时的回调 处理对同一个Promise多次调用then的情况，需要用数组
  #onFulfilledCallbackList = []
  #onRejectedCallbackList = []

  #resolve(value) {
    // 在构造函数回调中返回自身
    if(value === this) {
      // 触发rejected状态
      this.#rejectHandle(TypeError('Chaining cycle detected for promise #<Promise>'))
      return
    }
    // 如果值为一个新的Promise，那么状态由这个新的Promise确定
    if(value instanceof PromiseJz) {
      value.then(newValue => {
        this.#resolveHandle(newValue)
      }, newReason => {
        this.#rejectHandle(newReason)
      })
    } else {
      this.#resolveHandle(value)
    }
  }

  // resolve函数状态变更的处理逻辑
  #resolveHandle(value) {
    // 只处理pending状态
    if(this.#state !== STATE_PENDING) return
    this.#state = STATE_FULFILLED
    this.#value = value
    // 状态改变时如果有回调函数需要执行
    this.#onFulfilledCallbackList.forEach(callback => callback(value))
    // 处理完再清空数组
    this.#onFulfilledCallbackList = []
  }

  #reject(reason) {
    this.#rejectHandle(reason)
  }

  // reject函数状态变更的处理逻辑
  #rejectHandle(reason) {
    // 只处理pending状态
    if(this.#state !== STATE_PENDING) return
    this.#state = STATE_REJECTED
    this.#reason = reason
    // 状态改变时如果有回调函数需要执行
    this.#onRejectedCallbackList.forEach(callback => callback(reason))
    // 处理完再清空数组
    this.#onRejectedCallbackList = []
  }

  // then中的回调处理
  // thenPromise then返回的Promise newValue 回调的返回值  onCallback 回调
  #resolutionProduce(thenPromise, newValue, resolve, reject) {
      // 如果循环调用自身，抛出TypeError
      if(thenPromise === newValue) {
        reject(TypeError('Chaining cycle detected for promise #<Promise>'))
        return
      }
      // 兼容的promise实现
      if(typeof newValue === 'object' || typeof newValue === 'function') {
        // typeof null 也是 'object'
        if (newValue === null) {
          resolve(newValue) 
          return
        }
        let then
        try {
          then = newValue.then
        } catch(e) { // 如果抛出异常则设为rejected状态
          reject(e)
          return
        }
        // 如果then不是函数，则设置fulfilled状态
        if(typeof then !== 'function') {
          resolve(newValue) 
          return
        }
        // 是否调用过的标志 只能调用一次
        let calledFlag = false
        // 调用then方法
        try {
          then.call(newValue, y => {
            if(calledFlag) return
            calledFlag = true
            this.#resolutionProduce(thenPromise, y, resolve, reject)
          }, r => {
            if(calledFlag) return
            calledFlag = true
            reject(r)
          })
        } catch(err) {
          if(calledFlag) return
          reject(err)
        }
      } else {
        resolve(newValue)
      }
  }

  then(onFulfilled, onRejected) {
    // 回调的默认值，适用于省略入参
    if(typeof onFulfilled !== 'function') {
      onFulfilled = value => value
    }
    if(typeof onRejected !== 'function') {
      // 使用引发异常的方式来传递 rejected状态
      onRejected = reason => { throw reason }
    }
    // 返回Promise，适配链式调用
    const thenPromise = new PromiseJz((resolve, reject) => {
      if(this.#state === STATE_FULFILLED) {
        queueMicrotask(() => {
          try {
            const newValue = onFulfilled(this.#value)
            this.#resolutionProduce(thenPromise, newValue, resolve, reject)
          } catch(err) {
            reject(err)
          }
        })
      }
      if(this.#state === STATE_REJECTED) {
        queueMicrotask(() => {
          try {
            const newValue = onRejected(this.#reason)
            this.#resolutionProduce(thenPromise, newValue, resolve, reject)
          } catch(err) {
            reject(err)
          }
        })
      }
      if(this.#state === STATE_PENDING) {
        // pending状态时，无法执行回调，因此把状态写入属性中，等后续状态改变时执行
        this.#onFulfilledCallbackList.push((value) => {
          queueMicrotask(() => {
            try {
              const newValue = onFulfilled(value)
              this.#resolutionProduce(thenPromise, newValue, resolve, reject)
            } catch(err) {
              reject(err)
            }
          })
        })
        this.#onRejectedCallbackList.push(reason => {
          queueMicrotask(() => {
            try {
              const newValue = onRejected(reason)
              this.#resolutionProduce(thenPromise, newValue, resolve, reject)
            } catch(err) {
              reject(err)
            }
          })
        })
      }
    })
    return thenPromise
  }

  // Promise/A+规范的测试工具使用
  static deferred() {
    const res = {};
    res.promise = new PromiseJz(function (resolve, reject) {
      res.resolve = resolve;
      res.reject = reject;
    })
    return res;
  }

  static resolve(data) {
    // 如果是Promise，则直接返回
    if(data instanceof PromiseJz)
      return data
    // thenable对象等由then方法处理
    return new PromiseJz(function (resolveItem, rejectItem) {
      resolveItem(data)
    })
  }

  static reject(data) {
    return new PromiseJz(function (resolveItem, rejectItem) {
      rejectItem(data)
    })
  }

  catch(onRejected) {
    return this.then(null, onRejected)
  }

  finally(callback) {
    // 如果callback()返回Promise且状态rejected，则后续状态为rejected
    return this.then(value => {
      return PromiseJz.resolve(callback()).then(() => value)
    }, reason => {
      return PromiseJz.resolve(callback()).then(() => { throw reason })
    })
  }

  // 判断入参是否为Iterator
  static #isIterator(data) {
    if (!data || typeof data[Symbol.iterator] !== 'function') {
      const type = typeof data
      throw new TypeError(`${type} ${data} is not iterable (cannot read property Symbol(Symbol.iterator))`)
    }
  }

  static all(data) {
    PromiseJz.#isIterator(data)
    // count为总数量，count为Promise完成的数量
    let sum = 0, count = 0
    // 存储promise值的数组
    const valueList = []
    return new PromiseJz((resolveItem, rejectItem) => {
      for(let item of data) {
        // 当前的序号
        let tempi = sum++
        valueList.push(null)
        PromiseJz.resolve(item).then(value => {
          ++count
          valueList[tempi] = value
          // 全部完成
          if(count === valueList.length)
            resolveItem(valueList)
        }, reason => {
          // 有一个出现rejected状态则返回rejected
          rejectItem(reason)
        })
      }
      // 循环一次都没进入，实际是空数组
      if(sum === 0)
        resolveItem([])
    })
  }

  static race(data) {
    PromiseJz.#isIterator(data)
    return new PromiseJz((resolveItem, rejectItem) => {
      for(let item of data) {
        PromiseJz.resolve(item).then(resolveItem, rejectItem)
      }
    })
  }

  static allSettled(data) {
    PromiseJz.#isIterator(data)
    // count为总数量，count为Promise完成的数量
    let sum = 0, count = 0
    // 存储promise值的数组
    const valueList = []
    return new PromiseJz((resolveItem, rejectItem) => {
      for(let item of data) {
        // 当前的序号
        let tempi = sum++
        valueList.push(null)
        PromiseJz.resolve(item).then(value => {
          ++count
          valueList[tempi] = { status: 'fulfilled', value: value }
          if(count === valueList.length)
            resolveItem(valueList)
        }, reason => {
          ++count
          valueList[tempi] = { status: 'rejected', reason: reason }
          if(count === valueList.length)
            resolveItem(valueList)
        })
      }
      // 循环一次都没进入，实际是空数组
      if(sum === 0)
        resolveItem([])
    })
  }

  static any(data) {
    PromiseJz.#isIterator(data)
    // count为总数量，count为Promise完成的数量
    let sum = 0, count = 0
    // 存储promise值的数组
    const reasonList = []
    return new PromiseJz((resolveItem, rejectItem) => {
      for(let item of data) {
        // 当前的序号
        let tempi = sum++
        reasonList.push(null)
        PromiseJz.resolve(item).then(value => {
          resolveItem(value)
        }, reason => {
          ++count
          reasonList[tempi] = reason
          if(count === reasonList.length)
          // ECMAScript要求抛出AggregateError错误
          rejectItem(new AggregateError(reasonList, 'All promises were rejected'))
        })
      }
      // 循环一次都没进入，实际是空数组 为rejected状态
      if(sum === 0)
        rejectItem(new AggregateError([], 'All promises were rejected'))
    })
  }
}

module.exports = PromiseJz
```

## 总结
因为ECMAScript中已经包含了Promise的功能实现，因此即使我们写了自己的Promise，大概率也不会在项目中使用。即使我们自己用，别人也不会用的。那自己实现Promise有什么意义呢？

通过实现，可以详细了解Promise的原理和执行流程，对于JavaScript异步编程和事件循环也有更多认识。实现的过程中也是对类、异常、thenable对象、Iterator对象等语法的实践。代码量虽然不大，但是里面的设计思路是非常好的，可以吸收进来，提高我们的编程水平。

总之，纸上得来终觉浅，绝知此事要躬行。实现一些经典的代码，对提高自己也是很有帮助的。

## 参考
- ECMAScript6入门教程(阮一峰) —— Promise对象\
  https://es6.ruanyifeng.com/#docs/promise
- ECMAScript6入门教程(阮一峰) —— async函数\
  https://es6.ruanyifeng.com/#docs/async
- 理解 Promise 的工作原理\
  https://juejin.cn/post/6844903426006974477
- Promises/A+\
  https://promisesaplus.com/
- Promises CommonJs\
  https://wiki.commonjs.org/wiki/Promises
- Promises/A CommonJs\
  https://wiki.commonjs.org/wiki/Promises/A
- Promises/B CommonJs\
  https://wiki.commonjs.org/wiki/Promises/B
- Promises/D CommonJs\
  https://wiki.commonjs.org/wiki/Promises/D
- 【译】 Promises/A+ 规范\
  https://juejin.cn/post/6844903767654023182
- promises-aplus-tests\
  https://github.com/promises-aplus/promises-tests
- Promise实现原理\
  https://juejin.cn/post/7259647015604863013
- 手写Promise完整介绍\
  https://juejin.cn/post/7255855848836464677
- 从一道让我失眠的 Promise 面试题开始，深入分析 Promise 实现细节\
  https://juejin.cn/post/6945319439772434469
- 面试官：“你能手写一个 Promise 吗”\
  https://juejin.cn/post/6850037281206566919
- 谈一谈浏览器与Node.js中的JavaScript事件循环，宏任务与微任务机制\
  https://jzplp.github.io/2023/macro-micro-task.html
- PromiseJz GitHub仓库\
  https://github.com/jzplp/PromiseJz
- MDN Promise\
  https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise
- promise 内部实现真的是 setTimeout 嘛？ 知乎\
  https://www.zhihu.com/question/518340676
