# JSONP的最简单实现，前端跨域请求的方式

JSONP不是一门语言，也并不是什么特别开发的技术，它更像是一个BUG，一个开发者找出来可以用来作为跨域传输数据的”漏洞”。虽然名字中带的是JSON，但其实严格来说，传输的javascript代码，只不过代码内容基本都是json而已。

JSONP的原理非常简单，就是HTML标签中，很多带src属性的标签都可以跨域请求内容，比如我们熟悉的img图片标签。同理，script标签也可以，可以利用script标签来执行跨域的javascript代码。通过这些代码，我们就能实现前端跨域请求数据。

最关键的方法是这样的：前端网页中写一个fun1，接受跨域传来的数据并处理。请求的跨域script标签中的代码则是执行这个函数，里面包含跨域的数据：fun1(data)。这样跨域的数据就可以被原有的前端js接受并处理了。

我们来看一下最简单的JSONP的例子：
```html
<html>
  <body>
    <div>
      receive <span id="qwerty"> </span>
    </div>
  </body>
  <script>
    function callfun(data) {
      document.getElementById('qwerty').innerHTML = data;
    }
  </script>
  <script src="http://127.0.0.1:10010/js?call=callfun"></script>
</html>
```
后端使用的egg.js，核心代码只有ctx.body那一句
```js
'use strict';
 
const Controller = require('egg').Controller;
class JsonpController extends Controller {
  async index() {
    const { ctx } = this;
    console.log(ctx.query);
    ctx.set('content-type', 'text/javascript');
    ctx.body = ctx.query.call + '("nihao")';
  }
}
 
module.exports = JsonpController;
```
为了让后端知道我们前端的回调函数的名字，我们在script的请求中加入了`call=callfun`参数，后端接收到`ctx.query.call`， 再和`'("nihao")'`合并，最后形成了字符串`callfun("nihao")`这一句JS代码，传到前端。

这个"nihao"就是我们从后端跨域传输到前端的数据了。

callfun函数处理这个数据，显示到了屏幕中。
