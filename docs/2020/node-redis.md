# 用Node.js和Redis实现简单消息队列

Node学习指南第二版第10章Redis部分实现了一个很简单的消息队列，但是由于这部分代码只适用于Linux，而且我这里也没服务器的日志可供测试，于是改写成适合Windows，且简化了部分内容。

## 先上代码
```js
// step1.js
var spawn = require('child_process').spawn;
var net = require('net');
 
var client = new net.Socket();
client.setEncoding('utf8');
 
client.connect('3000', '127.0.0.1', () => console.log('connected to server'));
 
var logs = spawn('tail', ['-f', 'log/access1.log'], {shell: true});
logs.stdout.setEncoding('utf8');
logs.stdout.on('data', function (data) {
  // var re = /GET\s(\S+)\sHTTP/g;
  var re2 = /\.gif|\.png|\.jpg/g;
  // var parts = re.exec(data);
  // console.log(parts[1]);
 
  var tst = re2.test(data);
  console.log(tst);
  if (tst) {
    client.write(data);
  }
});
logs.stderr.on('data', data => console.log(`stderr: ${data}`));
logs.on('exit', function(code) {
  console.log(`Child process exited with code ${code}`);
  client.end();
})
```

```js
// step2.js
var net = require('net');
var redis = require('redis');
 
var server = net.createServer(function (conn) {
  console.log('connected');
 
  var client = redis.createClient();
  client.on('error', err => console.log(`Error ${err}`));
 
  client.select(6);
  conn.on('data', function (data) {
    console.log(`${data} from ${conn.remoteAdderss} ${conn.remotePort}`);
    client.rpush('images', data);
  })
}).listen(3000);
server.on('close', () => client.quit());
console.log('listening to port 3000');
```

```js
/ step3.js
var redis = require('redis');
var http = require('http');
 
var messageServer = http.createServer();
messageServer.on('request', function (req, res) {
  if(req.url === '/favicon.ico') {
    res.writeHead(200, {'Content-Type': 'image/x-icon'});
    res.end();
    return;
  }
  var client = redis.createClient();
  client.on('error', err => console.log(`Error ${err}`));
 
  client.select(6);
  client.lpop('images', function (err, reply) {
    if (err) {
      return console.log(`error response ${error}`);
    }
    console.log(reply);
    if (reply) {
      res.write(reply + '\n');
    } else {
      res.write('End of queue');
    }
    res.end();
  })
  client.quit();
});
 
messageServer.listen(8124);
console.log('listening on 8124');
```

log/access1.log
```log
fruit/1.jpg
fruit/2.jpg
https://www.baidu.com/img/PCtm_d9c8750bed0b3c7d089fa7d55720d6cf.png
```

​
## 执行的流程
* step1.js从文件中取得最新的日志，用正则去除图片地址，再传给step2.js的消息队列。
* step3.js是个HTTP服务端，接受浏览器用户的请求，从step2.js的消息队列中取出图片地址并展示在浏览器上，如果消息队列为空则显示End of queue。

这个代码简化了从日志中取得地址的部分，只要带有图片的后缀名就能通过正则。

而且浏览器显示的仅仅是图片地址，而不是图片本身。

（貌似书上原本的操作也是只显示图片地址的）

## tail命令
首先是tail –f，这是Linux的常用命令，但是Windows并没有。好在有网上能找到别人写的一个windows版本的，放入文件夹C:\Windows\System32\ 就能用了。

windows版本tail 地址：

https://files-cdn.cnblogs.com/files/hantianwei/tail.zip

（不是我写的，我不知道是否有潜在风险，请谨慎使用）

但是注意，与Linux版本不同，这个好像只支持追踪一个文件。所以代码部分也要改动。

## 下载Redis
官网好像没有windows版本，我用的菜鸟教程网站提供的安装方法和地址

https://www.runoob.com/redis/redis-install.html

与Mysql，mongoDB不同，这个Redis下载好启动就能用了，不需要任何其他配置，甚至不用新建数据库。
