# 谈一谈前端构建工具的本地代理配置（Webpack与Vite）

在Web前端开发中，我们在本地写代码经常遇到的一件事情就是代理配置。代理配置说简单也简单，配置一次基本就一劳永逸，但有时候配置不对，无论如何也连不上后端，就成了非常头疼的一件事。在这本文中，我们讨论一下前端构建工具提供的代理配置。

## 为什么要使用代理
我们前端开发的页面，是要运行到浏览器上的（SSR和其它场景暂不考虑）。浏览器会请求HTML页面，请求一些JS/CSS/图片等静态资源（部分静态资源可能使用CDN，这里暂不考虑），还会请求服务端的数据接口。

浏览器限制了我们请求HTML和请求的数据接口必须在同一个域中，简言之就是必须同一个域名或者同一个IP+端口号。我们的页面在线上运行时，这些HTML和接口都在同一网站中请求，不存在跨域问题。即使有这个问题，也是服务端采用Nginx等代理服务转发接口，浏览器看到的也是同域而不是跨域。

但在本地开发前端页面时，情况和服务端并不一致。我们本地一般会启动一个服务，专门提供HTML页面。但是所以需要的数据在后端或者平台中，并不在我们本地，因此是跨域的。所以需要一个代理来将跨域转换为同域。

- 浏览器访问本地HTML页面 -> 前端本地服务承载
- 使用代理前：浏览器访问后端数据接口 -> 跨域
- 使用代理后：浏览器访问本地数据接口 -> 本地代理转发给后端 -> 从后端拿到数据 -> 返回给前端（同域）

这里使用React和fetch举一个跨域的例子：

```js
import { useEffect } from "react";
function App() {
  useEffect(() => {
    fetch('/api/test').then(res => console.log(1, res))
    fetch('https://www.baidu.com/s').then(res => console.log(2, res))
  }, [])
  return <div>23123</div>;
}
```

![](/2025/proxy-1.png)

我们在代码中使用fetch请求了两个接口，结果如图。一个是同域的`/api/test`，能正常收到结果。一个是跨域的`https://www.baidu.com/s`，请求被浏览器拦住了，错误提示为 CORS policy。如果我们想本地请求跨域的接口，就需要代理来帮我们。(还有一些其它方式可以规避跨域，因为与这个主题无关，且有诸多限制，因此这里并不描述)

当然，使用代理还有一些其它原因，例如需要调试移动端，需要Mock数据，方便切换后端服务等等。

## 模拟后端服务
在描述具体的代理配置和实验之前，我们先在本地启动一个模拟的后端服务，方便我们实验代理请求。

```js
const http = require('http');

http.createServer((req, res) => {
  console.log(`request url: ${req.url}`);
  if(req.url === '/api/test') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end('{"a":1}');
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
}).listen(8000, () => {
  console.log('server start!');
});
```

我们在本地的8000端口启动了一个“后端服务”，当请求命中接口时，返回json。这个后端服务与前端独立，是跨域的。在下面的例子中，我们假设：

* 前端本地服务： `http://localhost:5000`
* 后端服务： `http://localhost:8000`

## Vite中的代理配置
这里参考Vite文档中的说明，简单描述一下Vite中的代理配置。

### 简单代理

```js
server: {
  proxy: { '/api': 'http://localhost:8000' }
}
// 或者
server: {
  proxy: { "/api": { target: "http://localhost:8000" } }
}
```

最简单的配置就如上面所示，将/api开头的请求都转发到配置的服务地址上。我们举几个例子：

* `http://localhost:5000/api` 命中为 `http://localhost:8000/api`
* `http://localhost:5000/api/test` 命中为 `http://localhost:8000/api/test`
* `http://localhost:5000/api1` 命中为 `http://localhost:8000/api1`
* `http://localhost:5000/abc` 未命中

### changeOrigin
变更请求中的host为target所指定的url。

```js
server: {
  proxy: { "/api": { target: "http://localhost:8000", changeOrigin: true } }
}
```
通过打印我们模拟服务中req.headers，我们能看到加与不加的区别：

* 配置之前 host: 'localhost:5000'
* 配置之后 host: 'localhost:8000'

![](/2025/proxy-2.png)

为什么要改host？因为部分后端会要求host为指定地址时，接口验证才会通过。还有很多后端会要求其它的指定数据，例如headers和cookies等，我们后面再描述。

### rewrite
rewrite参数接收一个函数，可以在传给后端前，重写接口地址。

```js
server: {
  proxy: {
    "/api": {
      target: "http://localhost:8000",
      rewrite: (path) => path.replace(/\/proxy/, ""),
    },
  },
},
```

使用上面的例子，可以将接口地址中的/proxy/去掉，而没有包含的则不改动。

* `http://localhost:5000/api/proxy/test` 命中为`http://localhost:8000/api/test`
* `http://localhost:5000/api/test` 命中为 `http://localhost:8000/api/test`
* `http://localhost:5000/abc` 未命中

### bypass
bypass也接收一个函数，不同的是它可以接收request对象，和代理配置等，方便我们直接修改请求对象。例如我们可以在bypass中直接修改headers：

```js
server: {
  proxy: {
    "/api": {
      target: "http://localhost:8000",
      bypass: (req, res, options) => {
        req.headers.host = options.target;
      },
    },
  },
},
```

* 配置之前 host: 'localhost:5174'
* 配置之后 host: 'localhost:8000'

bypass还可以返回另一个url，代替原本的请求；返回false会为请求产生 404 错误；返回null或undefined则继续代理请求（如上例）。

```js
// 将/api/b请求代替为/index.html
bypass: (req, res, options) => {
  if(req.url == '/api/b') return '/index.html';
},
// 返回404
bypass: (req, res, options) => {
  if(req.url == '/api/b') return false;
},
```

## Webpack中的代理配置
这里我们换用Vue CLI创建了工程，看看Webpack中提供的代理配置。

### 简单代理

```js
devServer: {
  proxy: 'http://localhost:8000'
}
```
服务器将任何未知请求 (没有匹配到静态文件的请求) 代理到指定的后端服务。

### 配置选项

```js
proxy: {
  "/proxy": {
    target: "http://localhost:8000",
    changeOrigin: true,
    // pathRewrite: { '^/proxy': '' },
    pathRewrite: (path) => path.replace(/^\/proxy/, ""),
    bypass:  (req, res, options) => {
      req.headers.host = options.target;
    }
  },
},
```

这是在Webpack中的配置例子，可以看到和Vite的配置非常像，我们对比一下：

| Vite配置 | Webpack配置 |
| - | - |
| target | target |
| changeOrigin | changeOrigin |
| rewrite | pathRewrite |
| bypass | bypass |

这些对应的配置在Webpack和Vite中不仅效果一样，连配置方式，字段名都是基本都一样的，因此这里不再赘述了，Webpack的使用方法对比Vite即可。

## Vite和Webpack配置总结
使用代理之后，在浏览器中，前端访问还是原来的非跨域的接口，但实际请求后端的url可能早就被改的面目全非了。例如上面的场景中，浏览器中看到的请求是`http://localhost:5000/api/proxy/test`，但实际对后端你发起的请求为`http://localhost:8000/api/test`。

### 生产模式
那么上述的代理配置，在生产模式，即我们构建后的成果物中会不会生效呢？答案是不会的。因为构建的成果物是纯静态资源（html,js等），没有服务器配置，因此是无法解决跨域问题的。在服务器中，一般由后端服务或者有统一的代理服务器解决跨域问题。

正好vite有预览模式（preview），我们本地打包一下构建成果物，然后本地预览一下试试。注意需要先在vite中设置`preview.proxy`为false，否则预览模式也会自动采用开发模式的代理。

结果虽然本地后端服务依旧是开启状态，在浏览器中看到的请求依然是`http://localhost:5000/api/proxy/test`没有变，但是接口不通了，后端服务收不到请求。

### 共同的底层http-proxy
通过上一节的具体配置，我们发现两个构建工具的配置形式非常像。这是因为它们使用了共同的底层依赖http-proxy。

查看Vite的文档与Vite代理配置的源码，发现Vite实际就是将http-proxy进行了简单的封装。查看Webpack的文档，发现代理配置是由http-proxy-middleware这个包提供的，而它的底层依赖，实际上也是http-proxy。因此，这两个构建工具的代理配置才这么像。

那为什么两个工具的配置还有不同的地方呢？这是因为构建工具在封装http-proxy时，多提供的额外功能。因此两者才会有一些小区别。

## http-proxy简述
http-proxy是一个Node.js下的HTTP代理请求库，Vite和Webpack等构建工具就是用它作为底层代理请求的方法。我们不通过构建工具，直接使用一下http-proxy。这里我们启动一个小Node.js服务器作为前端开发服务器（在角色上类似于前端构建工具启动的本地开发服务）。

```js
const http = require('http');
const httpProxy = require('http-proxy');

const htmlData = `
<html>
  <script>
    fetch('/proxy/api/test').then(res => console.log(1, res.json()))
    fetch('/proxy/api/b').then(res => console.log(2, res.json()))
    fetch('/api/b').then(res => console.log(2, res.json()))
  </script>
</html>
`;

const reg = /^\/proxy/;
const rewrite = (path) => path.replace(reg, "");
const proxy = httpProxy.createProxyServer({});

proxy.on('proxyReq', (proxyReq, req, res, option) => {
  proxyReq.path = rewrite(proxyReq.path);
})

http.createServer((req, res) => {
  console.log(`request url: ${req.url}`);
  if(req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(htmlData);
  } else if(reg.test(req.url)) {
    proxy.web(req, res, { target: 'http://localhost:8000' }, (e) => {});
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  }
}).listen(5000, () => {
  console.log('server start!');
});
```

可以看到，我们自己启动了一个服务，提供HTML，里面包含fetch请求。当fetch请求命中我们的API规则时，将req和res交给http-proxy的代理接管，由它来负责请求真正的后端，拿到接口返回后，再透传回来。代理提供了一些配置和事件，可以做到拦截请求，更改请求内容或者返回数据等等。上面展示的例子就类似于我们在前面使用Webpack和Vite的配置的代理规则。注意上面即使是接口请求失败，也会帮我们转发失败结果。

通过例子可以看到，http-proxy代理本身是没有“独立服务”的(除非我们手动启动独立服务)，依附于本地开发用的http服务。它的作用很简单，仅仅是帮我们请求后端接口而已。最后我们用一个图表示代理关系：

![](/2025/proxy-3.png)

## 参考
- Vite文档 server.proxy\
  https://cn.vitejs.dev/config/server-options.html#server-proxy
- webpack文档 devServer.proxy\
  https://webpack.docschina.org/configuration/dev-server/#devserverproxy
- Github http-proxy-middleware\
  https://github.com/chimurai/http-proxy-middleware
- Github http-proxy\
  https://github.com/http-party/node-http-proxy
- MDN fetch\
  https://developer.mozilla.org/zh-CN/docs/Web/API/Fetch_API/Using_Fetch
- Vue CLI devServer.proxy\
  https://cli.vuejs.org/zh/config/?#devserver-proxy
- Vite代理配置 源码\
  https://github.com/vitejs/vite/blob/main/packages/vite/src/node/server/middlewares/proxy.ts
