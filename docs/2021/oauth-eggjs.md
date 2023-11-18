# Oauth第三方登录GitLab实现，用Egg.js做后端

Oauth是一种实现第三方登录的功能，目前在互联网上非常流行，很多大型网站都会提供第三方登陆的功能。

​​![](/2021/oauth-1.png)

由于个人接入Oauth第三方登陆的方式非常简单，因此我们今天就来实践一下。

## Oauth前置知识
Oauth的原理我看的是阮一峰的博客。这几篇博客讲的通俗易懂：

Oauth的原理我看的是阮一峰的博客。这几篇博客讲的通俗易懂：
* [OAuth 2.0 的一个简单解释](http://www.ruanyifeng.com/blog/2019/04/oauth_design.html)
* [OAuth 2.0 的四种方式](http://www.ruanyifeng.com/blog/2019/04/oauth-grant-types.html)
* [GitHub OAuth 第三方登录示例教程](http://www.ruanyifeng.com/blog/2019/04/github-oauth.html)

其中第三篇作者就已经使用了GitHub作为例子，实现了第三方登录的全过程。作者已经把代码开源了，感兴趣的可以去他博客里看看。

## Egg.js后端
Egg.js是Javascript的后端框架，是阿里开源的。我最近在学这个，正好也拿Oauth来练习一下。基本任何正常的后端环境都能实现Oauth。[Egg.js 官网](https://eggjs.org/zh-cn/)

这次大概会用到Controller，模板渲染，HttpClient，Config，router等等，都在Egg.js文档中有讲。

我下面代码的写法是不规范的，比如HttpClient应该返稿service中，我直接就在Controller中请求了。因为我这是demo，所以就没那么注意了。

## gitlab第三方登陆配置
我这边用的是局域网的GitLab（不能截图），所以给大家网上的截图参考。
​​![](/2021/oauth-2.png)

整个Oauth的请求流程我参考的这个: http://www.inyouc.com/help/api/oauth2.md

有了上面这些内容，就可以实现第三方登录啦~

## 程序代码
首先建立好egg工程，然后安装模板渲染的插件，并配置好: https://eggjs.org/zh-cn/core/view.html

然后上完整的代码：（我只列出框架中我修改的部分）
```js
//config.default.js
config.oauth = {
  appId: 'XXXXXXXXXXXXXX',
  secret: 'XXXXXXXXXXXXXX',
  redirect_uri: 'http://127.0.0.1:7001/oauth/redirect',
  gitlab_url: 'http://xxxx.com',
};

config.oauth_access = {};

config.view = {
  root: Path.join(appInfo.baseDir, 'app/view'),
  mapping: {
    '.nj': 'nunjucks',
  },
};
```
config中写入你拿到的id和secret，以及回调地址和gitlab的地址。

```js
// Controller/home.js
const Controller = require('egg').Controller;

class HomeController extends Controller {
  async index() {
    const { ctx } = this;
    await ctx.render('home.nj', ctx.app.config.oauth);
  }
  async redirect() {
    const { ctx } = this;
    const res = await ctx.curl(ctx.app.config.oauth.gitlab_url + '/oauth/token', {
      method: 'POST',
      data: {
        client_id: ctx.app.config.oauth.appId,
        client_secret: ctx.app.config.oauth.secret,
        code: ctx.request.query.code,
        grant_type: 'authorization_code',
        redirect_uri: ctx.app.config.oauth.redirect_uri,
      },
    });
    ctx.app.config.oauth_access = res.data;
  }
}
module.exports = HomeController;
```
​controller是最重要的逻辑。index函数负责渲染首页，首页会有点击去第三方登录的链接。

redirect函数就是第三方登录之后的回调。回调之后直接请求了access_token.

这个函数的body我没有写。

```js
//router.js
module.exports = app => {
  const { router, controller } = app;
  router.get('/', controller.home.index);
  router.get('/oauth/redirect', controller.home.redirect);
};
```

```js
//home.nj
<html>
  <head>
    <title>
      首页
    </title>
  </head>
  <body>
    <a id="link">点击去Gitlab第三方登录</a>
  </body>
  <script>
    var a = document.getElementById('link');
    a.href = '{{ gitlab_url }}/oauth/authorize?client_id={{ appId }}&redirect_uri={{ redirect_uri }}&response_type=code';
  </script>
</html>
```
