# 后端开启https服务的方法，以OpenSSL和Egg.js为例

普通的HTTP服务没有加密，传输的数据很容易被其他人获取到。而HTTPS使用加密传输，安全性更高，现在越来越多的网站采用了HTTPS服务。但是HTTPS服务的开启，相比于HTTP要麻烦一点。

下面以后端框架Egg.js为例，开启HTTPS服务。

## OpenSSL 生成证书
OpenSSL的安装方法这里省略了，需要请自己去搜索引擎查一下。

安装完成后，需要用OpenSSL生成HTTPS需要的证书。

```shell
openssl genrsa -des3 -out server.key 2048
```
生成server.key。生成的时候需要设定一个密码。
```shell
openssl rsa -in server.key -out server.key
```
把server.key转换为不需要密码的版本
```shell
openssl req -new -x509 -key server.key -out ca.crt -days 3650
```
生成ca.crt，这一步和下面一步会要求你输入一些信息，其中common name需要和域名对应（如果有域名），没有的话就随便填了。
```shell
openssl req -new -key server.key -out server.csr
```
生成server.csr
```shell
openssl x509 -req -days 3650 -in server.csr -CA ca.crt -CAkey server.key -CAcreateserial -out server.crt
```
最后生成server.crt，就是我们需要的证书啦~

## egg.js配置
在配置中加入证书的路径：
```js
const path = require('path');
  
config.cluster = {
  https: {
    key: path.join(appInfo.baseDir, 'httpskey/server.key'),
    cert: path.join(appInfo.baseDir, 'httpskey/server.crt'),
  },
};
```
然后启动服务就OK啦！

访问的时候会提示网页不安全，这是因为我们的证书是自签名的，不被信任，此时我们忽略提示，依旧访问网页即可。
​​![](/2021/https-1.png)
注意，有些教程提到，HTTPS的端口是443，有些同学就会设置为这个端口。但是设置之后，会出现无法访问的现象，其他端口号就没有这种问题。

端口号设置为443的效果：
​​![](/2021/https-2.png)
