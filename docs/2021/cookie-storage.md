# Cookie，sessionStorage，localStorage与浏览器新开窗口window.open的关系

window.open是用JavaScript打开一个新的浏览器的窗口的函数，而Cookie，sessionStorage，localStorage是三种常用的浏览器存储数据的方式，在开发时经常会用到。这里不谈cookie，sessionStorage，localStorage三种的联系和区别，只看一下三种在window.open打开窗口时发生的现象。

## 1. 第一次window.open全部传输成功
​首先，我们手动打开第一个窗口，访问本地服务器，例如`http://127.0.0.1:7001/`。并赋值三项：

```js
document.cookie = 'cookieA=1;path=/;' + document.cookie
sessionStorage.sessionA = '2'
localStorage.localA = '3'
```
测试赋值是否成功：
```js
console.log(document.cookie)
console.log(sessionStorage.sessionA)
console.log(localStorage.localA)
```

​​![](/2021/cookie-1.png)

打开一个新浏览器窗口，url相同，测试值是否被传过去了：

```js
let windowName = 'qazwsxedc'
window.open('http://127.0.0.1:7001', windowName)
```
​​![](/2021/cookie-2.png)

可以看到，全部的值都被传输到了新窗口。

从第一个窗口再打开第三个浏览器窗口，url相同，但是窗口名称windowName不同，经过测试也成功传输了。从第二个窗口再打开第四个窗口，url相同，窗口名称windowName不同，经过测试也成功传输了。

## 2.重复打开同一个浏览器窗口，sessionStorage没有传输

第一步，设置数值，打开第二个窗口。

```js
document.cookie = 'cookieA=1;path=/;' + document.cookie
sessionStorage.sessionA = '2'
localStorage.localA = '3'
let windowName = 'qazwsxedc'
window.open('http://127.0.0.1:7001', windowName)
```
此时数值是全部传输成功的。

第二步，对第一个窗口设置新的值：
```js
document.cookie = 'cookieA=4;path=/;' + document.cookie
sessionStorage.sessionA = '5'
localStorage.localA = '6'
```

测试第二个窗口，已经产生变化了，除了sessionStorage都变为了新值。也就是说这些值是浏览器共享的（在同一域下）：

​​![](/2021/cookie-3.png)

第三步，此时重新打开第二个窗口，windowName不变，然后测试：

```js
window.open('http://127.0.0.1:7001', windowName)
```

结果与上面相同，sessionStorage并无发生变化。

猜测是因为第一个窗口与第二个窗口现在是两个会话，刚才相当于刷新操作，不影响sessionStorage。

## 关闭并打开同一个浏览器窗口，sessionStorage成功传输

那么，应该如何把第一个窗口的sessionStorage传输到第二个窗口？

第一步，设置数值，打开第二个窗口。

```js
document.cookie = 'cookieA=1;path=/;' + document.cookie
sessionStorage.sessionA = '2'
localStorage.localA = '3'
let windowName = 'qazwsxedc'
window.open('http://127.0.0.1:7001', windowName)
```
第二步，对第一个窗口设置新的值，关闭第二个窗口，随即打开：

```js
document.cookie = 'cookieA=4;path=/;' + document.cookie
sessionStorage.sessionA = '5'
localStorage.localA = '6'
windowObject.close()
window.open('http://127.0.0.1:7001', windowName)
```

此时测试第二个窗口，发现数值成功更新。

​​![](/2021/cookie-4.png)

因为窗口关闭会话结束了，因此sessionStorage可以更新。

## 4.更新子窗口的最简单方法
当然，如果只想本地更新sessionStorage，还有更简单的方法
```js
let windowName = 'qazwsxedc'
let windowObject = window.open('http://127.0.0.1:7001', windowName)
windowObject.document.cookie = 'cookieA=7;path=/;' + windowObject.document.cookie
windowObject.sessionStorage.sessionA = '8'
windowObject.localStorage.localA = '9'
```
打开子窗口，直接对其设置值，然后子窗口测试：

这三个都正常更新了。
