# 利用Node.js实现HTTP流式渲染与流式传输（未完成）

## 什么是流式
流式和非流式的最大区别是，数据和页面不是完成的一次发送给前端，而是使用“流”的方式，把整个数据分块传输到前端。

我们日常使用流式体验最深的应该是观看在线高清视频：高清视频是数据量非常大的，如果全部下载再观看，需要耗费很长时间下载。大部分网站都会采用流式传输技术，把大视频分割成很多个小数据块分别发送。这些小块再客户端进行处理后就可以播放了，不需要等所有块都接收到。

我们前端页面的流式渲染和接口数据使用的流式传输在原理上与流式视频类似。只不过流式渲染是将HTML页面分块发送，流式传输是将接口数据分块发送。这里画出了流式与非流式在传输和渲染模式的对比流程图：

![图片](/2025/stream-1.png)

![图片](/2025/stream-2.png)

通过流程图可以清晰的看到，流式的优势在于可以一部分数据准备好就发给前端进行展示，不必把所有数据都准备好再发送，前端的页面或数据展示可以和后端处理并行进行。这样对于有需求的场景，用户体验和速度都能提升。

## 使用Node.js实现流式传输
Node.js支持流式作为数据传输方式，因此我们试一下使用HTTP协议传输流式数据。对于Node.js来说，前端的HTML页面也是数据的一种。

### 流式传输数据
```js
const http = require("http");

http
  .createServer((req, res) => {
    console.log(`request url: ${req.url}`);
    if (req.url === "/") {
      res.setHeader('Content-Type', 'text/plain');
      let index = 0;
      const clear = setInterval(() => {
        if (++index === 10) {
          res.end(`data index: ${index}\n`);
          clearInterval(clear);
        } else res.write(`data index: ${index}\n`);
      }, 1000);
    }
  })
  .listen(8000, () => {
    console.log("server start");
  });
```

在Node.js中，使用`res.write`方法，即可在body上发送一个数据块。可以多次发送，接口传输不会停止，直到使用`res.end`方法结束发送。`res.write`方法会在header中自动增加`Transfer-Encoding: chunked`表示分块传输。使用这个方式，即可实现Node.js的流式传输。

### 流式传输文件
在Node.js中，流式不仅限于HTTP，文件等其它系统也是支持流式的。这里我们举例利用HTTP流式传输文件：

```js
const http = require("http");
const fs = require("fs");

http
  .createServer((req, res) => {
    console.log(`request url: ${req.url}`);
    if (req.url === "/") {
      fs.createReadStream('./1.txt').pipe(res);
    }
  })
  .listen(8000, () => {
    console.log("server start");
  });
```

使用fs.createReadStream创建一个可读流，然后使用管道将数据发送到HTTP输出流中。这时候HTTP的header中也会自动增加`Transfer-Encoding: chunked`。这样就实现了文件的流式输出。关于文件的流式输出还有其它方法，这里就不列举了。

## 浏览器HTML支持流式渲染

todo 浏览器直接请求text/plain不能看到流式



## fetch接收流式传输数据

## SSE(EventSource)支持流式传输



## 流式背后的HTTP协议支持
todo 分不同的协议描述 HTTP1.1，HTTP2，HTTP3

看看怎么指定不同HTTP版本来实验。


Transfer-Encoding: chunked 的含义具体描述

## 总结

流式作用举例：

流式渲染可以用在SSR上，流式传输可以在GPT回答或者其它


流式渲染相关的技术有很多，这里不讲的：

Node.js 实现流式的底层原理（看看要不要简单提一下？）

React关于流式的支持和原理

并非全都是优势（占用端口）

## 参考
- 万字长文：深度解析React渲染技术演进之路\
  https://juejin.cn/post/7424908830902075444
- MDN EventSource\
  https://developer.mozilla.org/zh-CN/docs/Web/API/EventSource
- MDN 渲染页面：浏览器的工作原理\
  https://developer.mozilla.org/zh-CN/docs/Web/Performance/Guides/How_browsers_work
- Node.js文档 Stream\
  https://nodejs.org/docs/latest/api/stream.html
- Node.js文档 HTTP\
  https://nodejs.org/docs/latest/api/http.html
