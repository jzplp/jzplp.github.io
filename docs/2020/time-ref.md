# Node.js定时器中的ref函数和unref函数

## 简介
Javascript中有两大和定时有关的函数，setTimeout和setInterval。这两个方法都是在设定的事件之后，把回调函数放入调用栈的最后，一个是只执行一次，一个是重复执行。（这篇文章的重点不是讲这两个，有疑问的同学请自行搜索资料）

清除这两个定时操作是把定时器传入clearTimeout和clearInterval函数。这两个函数的操作也非常清晰。

上述的内容在浏览器和Node.js中都可以使用。

但是还有两个函数，ref()和unref()，这两个操作也是和清楚定时器有关，但是性质比较奇怪，网上的中文资料也不多。

这两个函数都是在定时器对象中的，调用方式为:
```js
timer.ref()
timer.unref()
```
* unref可以粗略的理解为：在程序没有其他定时器的时候，关闭定时器。
* ref函数可以理解为：打开unref关闭的定时器

我们来看几个例子。

## 只有一个定时器的情况
```js
var timer = setTimeout(name => console.log(`Hello setTimeout`), 3000);
timer.unref();
console.log('Waiting timer');
```
​​​![](/2020/time-1.png)

可以看到，定时器并没有执行，unref取消了定时。

再看看ref的用法：
```js
var timer = setTimeout(name => console.log(`Hello setTimeout`), 3000);
timer.unref();
timer.ref();
console.log('Waiting timer');
```

​​​![](/2020/time-2.png)

在调用unref后，对同一个定时器再调用ref，定时器又被恢复了。

## 再看一个例子
```js
var timer = setTimeout(name => console.log(`Hello setTimeout1`), 3000);
var timer2 = setTimeout(name => console.log(`Hello setTimeout2`), 6000);
timer.unref();
console.log('Waiting timer');
```
第二个定时器timer2在定时中，第一个定时器timer1调用unref。
​​​![](/2020/time-3.png)
这时候，unref居然不起作用了！timer的定时器依然输出了。

因此，如果有其他定时器存在，unref就不起效果。

## 再看一个奇怪的例子
```js
var timer = setTimeout(name => console.log(`Hello setTimeout1`), 6000);
var timer2 = setTimeout(name => console.log(`Hello setTimeout2`), 3000);
timer.unref();
console.log('Waiting timer');
```
和上一个例子相比，两个定时器的定时时间交换了，首先定时结束的是没被取消的定时器，然后再是被“尝试取消“的定时器。
​​​![](/2020/time-4.png)

这次可以看到，时间短的，没被取消的定时器被执行了，时间长的，被尝试取消的定时器没有输出。

可以想到，定时器调用unref后，如果在定时结束前的某个时间段中没有事件循环运行，那么就结束定时。


## 与其他事件一起使用的例子
这个性质是不是只有在“定时器“中其作用呢？我们看一个与其他事件一起使用的例子：
```js
var timer = setTimeout(name => console.log(`Hello setTimeout1`), 3000);
timer.unref();
console.log('Waiting timer');
process.stdin.on('readable', () => console.log(process.stdin.read().toString()));
```
在设置定时器后调用unref，再监听stdin的输入事件，此时的事件循环不为空，但是只有一个timer定时器存在。
​​​![](/2020/time-5.png)

可以看到，unref没有起作用，定时器依然被输出了。也就是说，unref是否有效果，要看程序运行时是否还有事件循环，而不仅仅是定时器本身。


