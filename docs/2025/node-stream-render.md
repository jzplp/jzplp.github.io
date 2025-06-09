# 利用Node.js实现HTTP流式渲染与流式传输（未完成）

## 什么是流式
流式和非流式的最大区别是，数据和页面不是完成的一次发送给前端，而是使用“流”的方式，把整个数据分块传输到前端。

我们日常使用流式体验最深的应该是观看在线高清视频：高清视频是数据量非常大的，如果全部下载再观看，需要耗费很长时间下载。大部分网站都会采用流式传输技术，把大视频分割成很多个小数据块分别发送。这些小块再客户端进行处理后就可以播放了，不需要等所有块都接收到。

我们前端页面的流式渲染和接口数据使用的流式传输在原理上与流式视频类似。只不过流式渲染是将HTML页面分块发送，流式传输是将接口数据分块发送。这里画出了流式与非流式在传输和渲染模式的对比流程图：

![图片](/2025/stream-1.png)

![图片](/2025/stream-2.png)

通过流程图可以清晰的看到，流式的优势在于可以服务端准备好一部分数据好就给前端进行展示，不必把所有数据都准备好再发送，前端的页面或数据展示可以和服务端处理并行进行。这样对于有需求的场景，用户体验和速度都能提升。

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
把上面使用Node.js流式传输数据例子的url直接放到浏览器地址栏访问，浏览器页面和调试工具的Network都是所有数据块传输完成后再一起展示的，没有表现出流式特性。这并不是因为浏览器不支持流式，而是访问的方式不对。当我们把分块的数据内容换成HTML，再把url放到浏览器地址栏访问，就可以触发HTML流式渲染的特性了。看下服务端代码：

```js
const http = require("http");

const dataHeader = '<html><body><div>header</div>';
const dataFooter = '<div>footer</div></body></html>'

http
  .createServer((req, res) => {
    console.log(`request url: ${req.url}`);
    if (req.url === "/") {
      res.setHeader('Content-Type', 'text/html');
      res.write(dataHeader);
      let index = 0;
      const clear = setInterval(() => {
        if (++index === 10) {
          res.end(dataFooter);
          clearInterval(clear);
        } else res.write(`<div>data index: ${index}</div>`);
      }, 1000);
    }
  })
  .listen(8000, () => {
    console.log("server start");
  });
```

![图片](/2025/stream-3.png)

最后生成的HTML和浏览器展示的效果如上图，可以看到是一个接口传输完成所有的块，拼合成一整个HTML文件。调试工具的Network上看到这个接口的总时间为10秒，和我们服务端的延时对的上。只看静态图是看不出流式特性的，这里用一个gif动图展示流式的效果：

![图片](/2025/stream-4.gif)

通过gif动图，可以明显的看到，HTML数据随着时间一点一点增加，浏览器窗口中的页面展示也是一点一点更新。这明显的体现了流式渲染的特性：即数据是分块发送的，并不是一次发送全部HTML数据；浏览器也不是收到完整的HTML数据后才开始渲染和展示页面，而是只要拿到部分HTML数据（哪怕是不完整的，例如标签没有闭合），就开始渲染展示流程。这也能在浏览器的工作原理中得到证明。

## fetch与可读流接收流式数据
除了HTML之外，使用JavaScript在浏览器中也是可以获取流式数据的。这里我们以fetch为例，展示下如何接收流式数据。

```js
const http = require("http");

const htmlData = `
<html><body>
  <div>hello, jzplp</div>
  <script>
    const decoder = new TextDecoder();
    fetch('/api/stream').then(async (res) => {
      console.log('res.body', res.body);
      const reader = res.body.getReader();
      while(1) {
        const data = await reader.read();
        if (data.done) return;
        console.log('array', data.value);
        console.log('decode', decoder.decode(data.value));
      }
    });
  </script>
</body></html>
`;

http
  .createServer((req, res) => {
    console.log(`request url: ${req.url}`);
  
    if (req.url === "/") {
      res.setHeader("Content-Type", "text/html");
      res.end(htmlData);
    }
  
    if (req.url === "/api/stream") {
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

这次服务端代码分为了两部分，匹配`url === "/"`的部分返回固定的字符串作为页面的HTML；匹配`url === "/api/stream"`的部分定时返回流式数据。虽然是流式数据也仅仅是字符串（与最开始流式传输的举例一致）但这次浏览器可以正常接收流式数据了。我们看下gif动图：

![图片](/2025/stream-5.gif)

同时我们在浏览器Console中也打印了我们收到数据的不同形式，这个数据也是随着时间流式处理的，这里就不展示动图了，只展示收到的完整数据。

![图片](/2025/stream-6.png)

重点是上面那段HTML代码，使用fetch请求流式接口，处理并输出。通过查看文档，发现从fetch中拿到的Response.body实际上是一个可读流ReadableStream，因此fetch自然可以接收流式数据。我们打印了res.body，在浏览器Console图中的第一条，可以看到确实是一个ReadableStream。

对可读流使用reader方法创建一个reader(ReadableStreamDefaultReader)，再使用read方法，返回一个Promise，当流式传输有了新数据时，即可拿到结果（或者拿到流关闭的标志）。这时候我们输出数据，发现拿到的流式数据是Uint8Array格式的。我们创建一个TextDecoder（文本解码器），然后解析成utf-8格式的文本，就能拿到想要的数据了。当多次返回数据块时，需要多次调用read方法继续拿Promise，每个Promise可以拿到一个数据块。

## SSE(EventSource)流式传输
JavaScript提供了一种SSE(Server-sent events)技术，可以利用HTTP协议和服务端进行单向的流式传输。SSE使用的JavaScript API为EventSource。

### 流程和协议简述
单向流式传输指的是服务端只能向客户端发送数据，客户端无法向服务端发送数据。具体的协议和流程如下：

1. 客户端创建EventSource对象，请求服务端接口。
2. 服务端将header中Content-Type设置为text/event-stream，表示使用SSE流式传输。
3. 服务端按照规定的数据格式发送事件或者数据块，客户端接收数据并处理。
4. 客户端调用close方法关闭连接。

SSE有规定的消息格式，格式中有如下字段：

* event 标识事件类型
* data 传输的数据内容
* id 事件ID
* retry 断开后浏览器尝试重新连接的时间，以毫秒为单位的整数

其中event和data是最常用的字段。当传输纯数据时，可以忽略event字段，此时event为默认值message。每条消息后面需要跟两个换行符。这里举例部分消息格式（其中:表示注释行）

```bash
: 事件格式

event: event1

event: event2
data: { "data1": 1, "data2": 2 }

: 消息格式

data: { "data1": 1, "data2": 2 }

event: message
data: dataString123
```

### 代码实现

```js
const http = require("http");

const htmlData = `
<html><body>
  <div>hello, jzplp</div>
  <script>
    const es = new EventSource('/api/sse');
    es.onmessage = function(event) {
      console.log(event.data);
    }
    es.addEventListener('abc', function(event) {
      console.log('abc', event);
    })
  </script>
</body></html>
`;

http
  .createServer((req, res) => {
    console.log(`request url: ${req.url}`);

    if (req.url === "/") {
      res.setHeader("Content-Type", "text/html");
      res.end(htmlData);
    }

    if (req.url === "/api/sse") {
      res.setHeader("Content-Type", "text/event-stream");
      let index = 0;
      setInterval(() => {
        index++;
        if (index % 4 === 0)
          res.write(`event: abc\ndata: abc index: ${index}\n\n`);
        else res.write(`data: data index: ${index}\n\n`);
      }, 1000);
    }
  })
  .listen(8000, () => {
    console.log("server start");
  });
```

这里实现了一个简单的SSE示例，有数据传输和自定义事件。可以看到前端对于EventSource的使用方式：创建EventSource对象时传入url，即开始发送请求；接收事件和数据就是绑定事件监听器。

浏览器对于SSE是做过适配的，在network中可以直接看到EventStream，这里依然使用gif动图展示随时间接收到的数据流。我们还在浏览器Console打印了收到的数据，也截图给大家。

![图片](/2025/stream-7.gif)

![图片](/2025/stream-8.png)

### 关闭SSE
注意看上面的代码中并没有关闭SSE，关闭的方式在这里单独讨论。

#### 服务端关闭
首先我们试一下服务端关闭连接的场景。

```js
const http = require("http");

const htmlData = `
<html><body>
  <div>hello, jzplp</div>
  <script>
    const es = new EventSource('/api/sse');
    es.onmessage = function(event) {
      console.log(event.data);
    }
  </script>
</body></html>
`;

http
  .createServer((req, res) => {
    console.log(`request url: ${req.url}`);

    if (req.url === "/") {
      res.setHeader("Content-Type", "text/html");
      res.end(htmlData);
    }

    if (req.url === "/api/sse") {
      res.setHeader("Content-Type", "text/event-stream");
      let index = 0;
      const clear = setInterval(() => {
        index++;
        if (index === 10) {
          res.end();
          clearInterval(clear);
        } else res.write(`data: data index: ${index}\n\n`);
      }, 1000);
    }
  })
  .listen(8000, () => {
    console.log("server start");
  });
```

在服务端代码中当index为10时，我们关闭了HTTP数据传输。这时可以看到浏览器的EventStream确实结束了传输，index停在了9。但是随后浏览器又新开了一个接口重新请求，这时index又从1开始持续循环。通过查看文档发现，当连接关闭时客户端会重启连接。

![图片](/2025/stream-9.png)

注意close并不是一个有关闭功能的事件，而是一个纯自定义事件，并不会起到关闭效果。我们尝试了：

```js
// 尝试1
res.write(`event: close\n\n`);

// 尝试2
res.end(`event: close\n\n`);

// 尝试3
res.write(`event: close\ndata: close data\n\n`);

// 尝试4
res.end(`event: close\ndata: close data\n\n`);
```

* 尝试1：没有关闭连接。EventStream中未出现该事件（因为没有data）。
* 尝试2：关闭连接又重启，这是因为res.end导致。
* 尝试3：没有关闭连接，EventStream中出现该自定义事件和数据。
* 尝试4：关闭连接又重启，且EventStream中出现该自定义事件和数据。

![图片](/2025/stream-10.png)

通过上述几个尝试，可以看出服务端实际上是没有关闭SSE的能力的，即使关闭了，前端也会重新开启。（当然服务端有拒绝服务的能力）

#### 前端关闭
前端是有关闭连接的能力的，使用EventSource实例的close方法即可关闭。

```js
const http = require("http");

const htmlData = `
<html><body>
  <div>hello, jzplp</div>
  <script>
    const es = new EventSource('/api/sse');
    es.onmessage = function(event) {
      console.log(event.data);
      if(event.data === '10') es.close();
    }
  </script>
</body></html>
`;

http
  .createServer((req, res) => {
    console.log(`request url: ${req.url}`);

    if (req.url === "/") {
      res.setHeader("Content-Type", "text/html");
      res.end(htmlData);
    }

    if (req.url === "/api/sse") {
      res.setHeader("Content-Type", "text/event-stream");
      let index = 0;
      setInterval(() => {
        index++;
        res.write(`data: ${index}\n\n`);
      }, 1000);
    }
  })
  .listen(8000, () => {
    console.log("server start");
  });
```

![图片](/2025/stream-11.png)

可以看到，在发送了10次数据后，前端控制关闭了。但这里看代服务端没有关闭连接以及setInterval。我们试一下后端关闭时，发送自定义事件，前端收到事件关闭连接。

```js
const http = require("http");

const htmlData = `
<html><body>
  <div>hello, jzplp</div>
  <script>
    const es = new EventSource('/api/sse');
    es.onmessage = function(event) {
      console.log(event.data);
    }
    es.addEventListener('close', function(event) {
      console.log('close!', event);
      es.close();
    })
  </script>
</body></html>
`;

http
  .createServer((req, res) => {
    console.log(`request url: ${req.url}`);

    if (req.url === "/") {
      res.setHeader("Content-Type", "text/html");
      res.end(htmlData);
    }

    if (req.url === "/api/sse") {
      res.setHeader("Content-Type", "text/event-stream");
      let index = 0;
      const clear = setInterval(() => {
        index++;
        if (index === 10) {
          res.end(`event: close\ndata: close data\n\n`);
          clearInterval(clear);
        } else res.write(`data: ${index}\n\n`);
      }, 1000);
    }
  })
  .listen(8000, () => {
    console.log("server start");
  });
```

![图片](/2025/stream-12.png)

可以看到，服务端关闭的时候发送事件，同时指示前端关闭，是比较好的关闭连接方式。

## 流式与HTTP1.1协议
流式传输与渲染背后，少不了HTTP协议的支持。下面我们来简单看一下不同版本的HTTP协议是如何支撑流式实现的。上面的所有例子默认都是运行在HTTP1.1协议中的，因此我们先从HTTP1.1协议开始。

### 分块传输简介
在流式传输中，最重要的一项就是Header中的Transfer-Encoding: chunked，这里简单介绍一下这个标头的作用。Transfer-Encoding标头表示数据传递采用的编码形式，可选的值有：chunked, compress, deflate, gzip等。除了chunked之外，其他的值都代表压缩算法，和流式无关。只有chunk表示数据需要分块发送。

首先HTTP1.1是默认保持长连接的，即Connection: keep-alive。在设置chunked之后，Content-Length这个表示数据长度的标头就不会被发送。因为数据是分块的，长度未知。那么如何知道数据块的长度和是否结束传输呢？

在传输的每一个分块的开头，需要输出当前分块的数据长度，以十六进制的形式表示，最后输出“\r\n”。然后是传输的数据，最后也输出“\r\n”。当传输完全结束时，需要传输一个终止块，数据长度为0，但也有数据行。终止块的样子：“0\r\n\r\n”。通过这种形式，服务端和客户端就可以实现在一个HTTP接口中分块传输数据。

### 使用TCP协议模拟HTTP流式
为了加深理解和实践，我们使用Node.js与TCP协议，模拟一下HTTP在服务端分块传输数据。

```js
const net = require("net");

const header = "<html><body>\n";
const footer = "</body></html>";

net
  .createServer((c) => {
    console.log("client connected");
    c.on("data", () => {
      c.write("HTTP/1.1 200 OK\r\n");
      c.write("Content-Type: text/html\r\n");
      c.write("Transfer-Encoding: chunked\r\n");
      c.write("\r\n");
      c.write(`d\r\n${header}\r\n`);

      let index = 0;
      setInterval(() => {
        if (++index === 10) {
          c.write(`e\r\n${footer}\r\n`);
          c.write("0\r\n\r\n");
        } else {
          const str = `<div>index:${index}</div>\n`;
          c.write(`13\r\n${str}\r\n`);
        }
      }, 1000);
    });
  })
  .listen(8000, () => {
    console.log("server bound");
  });
```

net是使用Node.js中TCP协议的API。这段代码使用TCP协议实现了一个简单的HTTP分块传输功能，传输了一个HTML文档。运行这段代码，在浏览器中访问localhost:8000，可以看到成功的被浏览器解析为HTTP的分块传输协议，并实现了流式渲染，验证了上面所说的分块传输协议。

![图片](/2025/stream-13.gif)

## 流式与HTTP2协议

### 二进制分帧
HTTP2在技术上相比于1.1版本有了较大的进步，使用了二进制分帧的编码机制。HTTP2引入了帧的概念，帧是HTTP2协议传输的最小单位，所有数据都通过帧来传输。每个帧都包含一个帧头部和帧数据部分。

HTTP报文的Header和Body部分都使用帧来传送，其中Header部分为单独的一个帧，Body部分可以分为多个帧独立传送。而且HTTP2实现了多路复用，同一个地址的不同请求使用同一个TCP连接，避免了HTTP1.1限制最大连接数的问题（后面总结描述）。

因此，通过二进制分帧和多路复用，HTTP2天然就支持流式传输，而且效果比HTTP1.1更好，也并不需要额外设置Header。在HTTP2中也不能设置Transfer-Encoding: chunked头部。

在参考文档中，还有原本用HTTP1.1协议的流式数据，通过Nginx转换后变为HTTP2传输到浏览器。虽然没有了Transfer-Encoding: chunked头部，但是依然具有流式特性。HTTP2还有其它很多改进，由于和流式没有直接关系，这里就不描述了。

### HTTP2流式代码
正好Node.js也提供了HTTP2的相关API，这里我们尝试一下HTTP2的流式功能。因为HTTP2必须使用https，因此要生成证书。首先在电脑上安装‌OpenSSL，然后在Node.js代码的目录下执行命令：

```bash
# 生成私钥
openssl genrsa -out server.key 1024
# 生成证书请求文件 (仅为了实验HTTP2的场景下，中间输入全部回车即可)
openssl req -new -key server.key -out server.csr
# 生成证书
openssl x509 -req -in server.csr -out server.crt -signkey server.key -days 3650
```

然后是Node.js服务端代码：

```js
const http2 = require("http2");
const fs = require("fs");

const dataHeader = "<html><body><div>header</div>";
const dataFooter = "<div>footer</div></body></html>";

const server = http2.createSecureServer({
  key: fs.readFileSync("server.key"),
  cert: fs.readFileSync("server.crt"),
});

server.on("stream", (stream) => {
  stream.respond({
    "content-type": "text/html",
    ":status": 200,
  });
  stream.write(dataHeader);
  let index = 0;
  const clear = setInterval(() => {
    if (++index === 10) {
      stream.end(dataFooter);
      clearInterval(clear);
    } else stream.write(`<div>data index: ${index}</div>`);
  }, 1000);
});

server.listen(8000, () => {
  console.log("server start");
});
```

在访问时需要使用HTTPS，即`https://localhost:8000/`。由于我们是自签名证书，因此浏览器会提示不安全，忽略即可。访问后的结果如下，可以看到协议部分确实是HTTP2。

![图片](/2025/stream-14.png)

![图片](/2025/stream-15.gif)

通过gif图可以看到，HTML数据的接收和渲染确实是流式进行的。而且在服务端代码中，我们并没有设置流式相关的头部，观察浏览器的Network也没有，因为HTTP2是天然就支持流式的。由于协议比较复杂，这里就不使用TCP协议模拟HTTP2了。

## SSE与HTTP协议
通过前面关于SSE的实验中，观察浏览器Network中的Header，发现了Transfer-Encoding: chunked。因此在HTTP1.1中，SSE中流式的实现也是通过分块传输来实现的。SSE更像是在HTTP1.1分块传输的上层，封装了一个小协议。既然HTTP1.1可以实现，那么HTTP2这种天然支持流式的协议也是可以使用SSE的。这里使用HTTP2实践一下：

```js
const http2 = require("http2");
const fs = require("fs");

const htmlData = `
<html><body>
  <div>hello, jzplp</div>
  <script>
    const es = new EventSource('/api/sse');
    es.onmessage = function(event) {
      console.log(event.data);
      if(event.data === '10') es.close();
    }
  </script>
</body></html>
`;

const server = http2.createSecureServer(
  {
    key: fs.readFileSync("server.key"),
    cert: fs.readFileSync("server.crt"),
  },
  (req, res) => {
    console.log(`request url: ${req.url}`);

    if (req.url === "/") {
      res.setHeader("Content-Type", "text/html");
      res.end(htmlData);
    }

    if (req.url === "/api/sse") {
      res.setHeader("Content-Type", "text/event-stream");
      let index = 0;
      setInterval(() => {
        index++;
        res.write(`data: ${index}\n\n`);
      }, 1000);
    }
  }
);

server.listen(8000, () => {
  console.log("server start");
});
```

这里我们使用了Node.js的HTTP2的兼容性API，因此代码看起来和上面HTTP1.1的部分基本一致。在浏览器上可以看到，在HTTP2协议下，SSE也是生效的，而且header中没有了Transfer-Encoding: chunked。

![图片](/2025/stream-16.png)

## 总结

流式作用举例：

流式渲染可以用在SSR上，流式传输可以在GPT回答或者其它

HTTP1.1 有链接数量限制

流式渲染相关的技术有很多，这里不讲的：

Node.js 实现流式的底层原理（看看要不要简单提一下？）

React关于流式的支持和原理

并非全都是优势（占用端口）

还有其它读流式数据的方法，看看要不要介绍 我觉得可以要 比如axios(与背后)

## 参考
- 万字长文：深度解析React渲染技术演进之路\
  https://juejin.cn/post/7424908830902075444
- 渲染页面：浏览器的工作原理 MDN\
  https://developer.mozilla.org/zh-CN/docs/Web/Performance/Guides/How_browsers_work
- Node.js文档 Stream\
  https://nodejs.org/docs/latest/api/stream.html
- Node.js文档 HTTP\
  https://nodejs.org/docs/latest/api/http.html
- Response.body MDN\
  https://developer.mozilla.org/zh-CN/docs/Web/API/Response/body
- ReadableStream MDN\
  https://developer.mozilla.org/zh-CN/docs/Web/API/ReadableStream
- ReadableStream.getReader() MDN\
  https://developer.mozilla.org/zh-CN/docs/Web/API/ReadableStream/getReader
- ReadableStreamDefaultReader.read() MDN\
  https://developer.mozilla.org/zh-CN/docs/Web/API/ReadableStreamDefaultReader/read
- TextDecoder MDN\
  https://developer.mozilla.org/zh-CN/docs/Web/API/TextDecoder
- TypedArray MDN\
  https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/TypedArray
- ArrayBuffer MDN\
  https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer
- EventSource MDN\
  https://developer.mozilla.org/zh-CN/docs/Web/API/EventSource
- 使用服务器发送事件 MDN\
  https://developer.mozilla.org/zh-CN/docs/Web/API/Server-sent_events/Using_server-sent_events
- Transfer-Encoding MDN\
  https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Reference/Headers/Transfer-Encoding
- HTTP协议中的Transfer-Encoding\
  https://juejin.cn/post/6997215152533667876
- 当Transfer-Encoding: chunked遇上HTTP2\
  https://juejin.cn/post/7188046760215445559
- Connection MDN\
  https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Reference/Headers/Connection
- http/2 二进制分帧层 (Binary Framing Layer)讲解\
  https://blog.csdn.net/qq_62311779/article/details/139873173
- Node.js文档 HTTP/2\
  https://nodejs.org/docs/latest/api/http2.html
- Nodejs 第六十一章（http2）\
  https://juejin.cn/post/7352763226529447999
