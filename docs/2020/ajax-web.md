# AJAX技术示例，Web前端后端实现

AJAX的全称是Asynchronous JavaScript and XML，是一种利用Javascript在web前端请求后端数据的技术，可以在不需要重新加载整个网页的情况下，实现从后端获取数据，更新部分网页内容。

我的理解，实际上就是可以利用javascript代码，异步的发起web请求，接收数据并展示。

我是2020年才开始正式接触的前端开发，目前基本在使用框架，平时并不会直接写AJAX。但是我觉得作为一个前端开发者，了解AJAX是必要的，因此学了一下。

学习AJAX可以看W3School的教程：[AJAX 简介](https://www.w3school.com.cn/ajax/index.asp)

下面是AJAX的实现，后端采用的Egg.js。

这个示例可以实现不同类型的AJAX请求，包含同步，异步，GET/POST，XML
​​​![图片](/2020/ajax-1.png)

点击不同类型的请求，除了看到文字更新之外，在谷歌浏览器的Network里面还可以看到每一次AJAX请求，点击可以看到具体细节。

首先是前端代码 index.html：
```html
<html>
  <head>
    <script type="text/javascript">
      const xmlhttp = new XMLHttpRequest();
      function respond () {
        console.log(xmlhttp);
        if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
          document.getElementById('myDiv').innerHTML = xmlhttp.responseText;
        }
      }
      function loadXMLDoc() {
        xmlhttp.onreadystatechange = respond
        xmlhttp.open('GET', 'data?a=send1&b=2', true);
        xmlhttp.send();
      }
      function loadXMLDocSync() {
        xmlhttp.open('GET', 'data', false);
        xmlhttp.send();
        document.getElementById('myDiv').innerHTML = xmlhttp.responseText;
      }
      function loadXMLDocPost() {
        xmlhttp.onreadystatechange = respond
        xmlhttp.open('POST', 'data', true);
        xmlhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        xmlhttp.send('a=send2&b=2');
      }
      function loadXMLDocXML() {
        xmlhttp.onreadystatechange = function () {
          console.log(xmlhttp);
          if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
            const titles = xmlhttp.responseXML.getElementsByTagName('title');
            let txt = '';
            for (let t of titles) {
              console.log(t.childNodes)
              txt += t.childNodes[0].nodeValue + '<br />';
            }
            document.getElementById('myDiv').innerHTML = txt;
          }
        }
        xmlhttp.open('GET', 'dataxml', true);
        xmlhttp.send();
      }
    </script>
  </head>
  <body>
    <div id="myDiv">
      <h3>
        Let AJAX change this text
      </h3>
    </div>
    <button type="button" onclick="loadXMLDoc()">
      AJAX GET请求
    </button>
    <button type="button" onclick="loadXMLDocSync()">
      AJAX 同步GET请求
    </button>
    <button type="button" onclick="loadXMLDocPost()">
      AJAX POST请求
    </button>
    <button type="button" onclick="loadXMLDocXML()">
      AJAX XML请求
    </button>
  </body>
</html>
```

后端：
```js
'use strict';
 
const Controller = require('egg').Controller;
const fs = require('fs');
const path = require('path');
class HomeController extends Controller {
  async index() {
    const { ctx } = this;
    await ctx.render('index.html');
  }
 
  async data() {
    const { ctx } = this;
    console.log(ctx.query);
    ctx.body = ctx.query.a + 'data';
  }
 
  async datapost() {
    const { ctx } = this;
    // console.log(ctx.request, ctx.request.body);
    ctx.body = ctx.request.body.a + 'data';
  }
 
  async dataxml() {
    const { ctx } = this;
    ctx.set('Content-Type', 'text/xml');
    console.log(this.app.config.view.root[0]);
    ctx.body = fs.readFileSync(path.join(this.app.config.view.root[0], 'data.xml'));
  }
}
 
module.exports = HomeController;
```

```js
'use strict';
 
/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.get('/', controller.home.index);
  router.get('/data', controller.home.data);
  router.post('/data', controller.home.datapost);
  router.get('/dataxml', controller.home.dataxml);
};
```

xml文件
```xml
<?xml version="1.0" encoding="ISO-8859-1"?>
<!--  Copyright w3school.com.cn -->
<!-- W3School.com.cn bookstore example -->
<bookstore>
<book category="children">
<title lang="en">Harry Potter</title>
<author>J K. Rowling</author>
<year>2005</year>
<price>29.99</price>
</book>
<book category="cooking">
<title lang="en">Everyday Italian</title>
<author>Giada De Laurentiis</author>
<year>2005</year>
<price>30.00</price>
</book>
<book category="web" cover="paperback">
<title lang="en">Learning XML</title>
<author>Erik T. Ray</author>
<year>2003</year>
<price>39.95</price>
</book>
<book category="web">
<title lang="en">XQuery Kick Start</title>
<author>James McGovern</author>
<author>Per Bothner</author>
<author>Kurt Cagle</author>
<author>James Linn</author>
<author>Vaidyanathan Nagarajan</author>
<year>2003</year>
<price>49.99</price>
</book>
</bookstore>
```

Node.js部分config
```js
  config.view = {
    root: path.join(appInfo.baseDir, 'app/view'),
    mapping: {
      '.html': 'nunjucks',
    },
  };
 
  config.security = {
    csrf: {
      enable: false,
    },
  };
```