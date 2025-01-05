# 谈一谈Web前端开发中的本地代理配置

在Web前端开发中，我们在本地写代码经常遇到的一件事情就是代理配置。代理配置说简单也简单，配置一次基本就一劳永逸，但有时候配置不对，无论如何也连不上后端，就成了非常头疼的一件事。在这篇文章中，我们先从项目构建工具提供的代理配置开始，讨论一下本地代理的问题。

## 为什么要使用代理
我们前端开发的页面，是要运行到浏览器上的（SSR和其它场景暂不考虑）。浏览器会请求HTML页面，请求一些JS/CSS/图片等静态资源（部分静态资源可能使用CDN，这里暂不考虑），还会请求服务端的数据接口。

浏览器限制了我们请求HTML和请求的数据接口必须在同一个域中，简言之就是必须同一个域名或者同一个IP+端口号。我们的页面在线上运行时，这些HTML和接口都在同一网站中请求，不存在跨域问题。即使有这个问题，也是服务端采用Nginx等代理服务转发接口，浏览器看到的也是同域而不是跨域。

但在本地开发前端页面时，情况和服务端并不一致。我们本地一般会启动一个服务，专门提供HTML页面。但是所以需要的数据在后端或者平台中，并不在我们本地，因此是跨域的。所以需要一个代理来将跨域转换为同域。

- 浏览器访问本地HTML页面 -> 前端本地服务承载
- 使用代理前：浏览器访问后端数据接口 -> 跨域
- 使用代理后：浏览器访问本地数据接口 -> 本地代理转发给后端 -> 从后端拿到数据 -> 返回给前端（同域）

这里举一个跨域的例子：



当然，使用代理还有一些其它原因，例如需要调试移动端，需要Mock数据，方便切换后端服务等等。


## Vite中的代理配置





## 参考
- Vite文档 server.proxy\
  https://cn.vitejs.dev/config/server-options.html#server-proxy
- webpack文档 devServer.proxy\
  https://webpack.docschina.org/configuration/dev-server/#devserverproxy
- Github http-proxy-middleware\
  https://github.com/chimurai/http-proxy-middleware
- Github node-http-proxy\
  https://github.com/http-party/node-http-proxy
- MDN fetch\
  https://developer.mozilla.org/zh-CN/docs/Web/API/Fetch_API/Using_Fetch
