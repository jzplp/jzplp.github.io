# 浏览器中Cookie的全面介绍

## 目录
[[toc]]

## 简介
在Web前端开发时，我们经常会遇到一些浏览器存储相关的工具，例如Cookie。Cookie的英文本意是曲奇，但是在Web中，它被用作浏览器中存储的数据。Cookie都是`name=value`的结构，name和value都为字符串。

## 使用流程
1. 在首次访问网站时，浏览器发送请求中并未携带Cookie。
2. 浏览器看到请求中未携带Cookie，在HTTP的响应头中加入`Set-Cookie`。
3. 浏览器收到`Set-Cookie`后，会将Cookie保存下来
4. 下次再访问该网站时，HTTP请求头就会携带Cookie。

下图分别为设置Cookie和携带Cookie的示例。

![](/2023/cookie-1.png)
设置Cookie

![](/2023/cookie-2.png)
携带Cookie

## 配置属性
在上面`Set-Cookie`的图中，我们可以看到，设置Cookie时，除了最前面的name和value之外，还配置了其他属性。实际上Cookie还有更多属性，可以查看浏览器的Application-Storage，获取当前网站的Cookie。

![](/2023/cookie-3.png)

这里简单描述一下每个属性的含义：

| 属性 | 含义 |
| - | - |
| Name | Cookie的名称 |
| Value | 对应名称的值 |
| Domain | Cookie的域名 |
| Path | Cookie生效的路径 |
| Expires | 过期时间，过了这个时间后Cookie失效 |
| Max-age | 生效时间，表示Cookie在多长时间后失效 |
| Size | Cookie的长度，为name和value的长度和 |
| HttpOnly | 防止通过JavaScript访问Cookie |
| Secure | 只在HTTPS协议的情况下才会将Cookie传到后端 |
| SameSite | 是否允许跨站请求时发送Cookie |
| Partitioned | 第三方Cookie分区 |
| Priority | 优先级 |

下面我们对其中一些属性和作用进行讨论。

## 生命周期
Cookie是有生命周期的，在设置Cookie值时，可以同时设置有效期。当超过了这个有效期之后，Cookie便会失效，前端请求时，不会携带过期的Cookie。

Cookie的有效期有三种类型：
### Session
这里的Session并不是存储在服务端的Session，而是指浏览器会话。如果Cookie的有效期为Session，一般关闭会话时，Cookie便会失效；而一些浏览器重启时，也会将会话恢复，此时Cookie并不会失效。
### Expires
Expires表示过期时间，是一个确定的日期时间。例如`Expires=Wed, 21 Oct 2015 07:28:00 GMT`。当浏览器端本地的当前时间超过这个时间时，Cookie便会失效。
### Max-age
Max-age表示Cookie的存活时间，以秒作为单位。例如`Max-age=3000`。当获取到该Cookie后开始倒计时，3000秒之后便失效。

注意：上述的生命周期都是服务端指定的。如果设置了Expires，则是把服务器时间和浏览器本地时间相比较，如果时间不同步，配置就会出现问题。而Max-age设置的是秒数，始终是浏览器本地时间自己相比较，不会出现时间不同步的问题。

## 作用范围
作用范围主要由Domain和Path两个属性来控制。
### Domain
Domain用来设置Cookie作用的域名，即Cookie在哪个网站生效。默认情况下，生效的域名为当前访问的域名。例如我们在`jzplp.com`设置的Cookie，就只能限制该网站内使用。

#### 多级域名  
如果访问的网站有多级域名，则Cookie默认仅在访问的多级域名内生效。如果希望在更大范围内生效，可以指定域名。

例如我们在`a.jzplp.com`下设置的Cookie，就只在这个域名下生效。但是如果我们在设置cookie时同时设置了`domain=jzplp.com`，则该Cookie可以在`jzplp.com`下的任何域名内生效。比如：
- `jzplp.com`
- `a.jzplp.com`
- `b.jzplp.com`
- `c.d.jzplp.com`

### Path
有时候，我们希望Cookie仅仅在部分路径下生效，就可以使用Path进行限制。这里的路径就是网站的路由。默认的`path=/`，即在所有路径下生效。
如果设置了`path=/abc`，则只在`/abc`路径下生效。比如：
- `jzplp.com` 不生效
- `jzplp.com/abc` 生效
- `jzplp.com/abc/def` 生效
- `jzplp.com/qaz` 不生效
- `jzplp.com/qaz/abc` 不生效

## 个数和大小限制

### 限制规则
不同的浏览器允许的Cookie大小并不相同，通常的限制为：
- 个数限制: 20~50
- 总大小限制: 4KB左右

网络上也有人整理各种浏览器详细的限制。

| | IE6.0 | IE7.0/8.0 | Opera | Firefox | Safari | Chrome |
| - | - | - | - | - | - | - |
| cookie个数 | 每个域为20个 | 每个域为50个 | 每个域为30个 | 每个域为50个 | 没有个数限制 | 每个域为53个 |
| cookie大小 | 4095个字节 | 4095个字节 | 4096个字节 | 4097个字节 | 4097个字节 | 4097个字节 |

来源：[Cookie个数限制及大小](https://my.oschina.net/gaollg/blog/71299)

一个Cookie的大小可以在浏览器中查看Size属性得知，这个大小是key和value的和。

### Priority优先级
当Cookie的数量超过限制时，路蓝旗会清除一部分Cookie。清除哪些合适呢？Priority属性用来定义Cookie的优先级，低优先级的Cookie会优先被清除。

Priority属性有三种： Low, Medium, High

## HttpOnly
通常的Cookie在客户端（一般指浏览器）是可以通过脚本代码（一般指js）访问的。方式可见[JavaScript中操作Cookie](#JavaScript中操作Cookie)。

如果设置了HttpOnly属性，则该Cookie在浏览器中无法通过js代码访问，经过我测试也无法写入。这样可以防止窃取Cookie信息，一般用来防止XSS攻击。

## 跨站与Samesite设置
Samesite是Cookie的跨站属性，也可以看做是“更高级”的作用范围设置。部分内容参考了几篇文章：[SameSite Cookie，防止CSRF攻击](https://www.cnblogs.com/ziyunfei/p/5637945.html)， [Cookie 的 SameSite 属性](http://www.ruanyifeng.com/blog/2019/09/cookie-samesite.html)

### 跨站与跨域
一般浏览器限制请求的内容是按照跨域来判断的，比如XHR和fetch。但是Samesite限制的并不是跨域，而是跨站。跨站是比跨域更宽松的一种限制。可以这么说如果跨站，那么肯定会跨域，但如果跨域，那么不一定会跨站。

#### 跨站和跨域的主要区别
- 子域名不同时  属于跨域  不属于跨站  
  例如 `a.jzplp.com`与`b.jzplp.com`
- 端口不同时 属于跨域 不属于跨站  
  例如 `jzplp.com:8000`与`jzplp.com:9000`
- IP不同时（如果直接使用IP访问网站） 属于跨域 属于跨站  

#### Public Suffix List
在上面子域名的的跨站说明中，是存在漏洞的。我们假设这样的情况：
1. `a.jzplp.com`与`b.jzplp.com`  实际属于同站
2. `jzplp.com.cn`与`other.com.cn`  实际属于跨站
3. `jzplp.github.io`与`other.github.io`  实际属于跨站

可以看到，上面的三个域名格式是相同的，都使用了两个点来分隔。
第一个属于同站。看第二个例子，`com.cn`是我们国家颁布的二级域名并不是指的某一个网站。显然这种域名后缀，并不能认为是同站。除了我国，还有其他国家和组织也会公布这种二级甚至更高级的域名。再看第三个例子，是Github提供的网站域名。使用`github.io`后缀的网站，显然也不能认为是同站。

因此，仅仅通过网址格式匹配，是无法判断是否同站的。因此，浏览器会维护一个列表：Public Suffix List。列表里面记录了这些需要特殊匹配的域名后缀，比如上面提到的`com.cn`与`github.io`等等，这个叫做有效顶级域名，eTLD。在遇到一个域名时，会首先匹配列表中的后缀，再把eTLD+1个字段相同表示为同站，不同表示为非同站。

例如 列表中的域名后缀为`com.cn`，那么eTLD+1个字段表示为`jzplp.com.cn`。那么`a.jzplp.com.cn`与`b.jzplp.com.cn`属于同站， `jzplp.com.cn`与`other.com.cn`属于跨站。

[Public Suffix List列表的内容](https://publicsuffix.org/list/public_suffix_list.dat)。这个列表会随着浏览器的更新而更新。

Public Suffix List除了应用在Samesite中，还在其他地方有应用。例如Cookie中的Domain也使用了这里eTLD+1个字段作为设置的最大范围。

### 请求分类
当我们在浏览器中访问一个网站，在输入一个网址后，首先返回的是一个HTML页面。而在这个页面中还可以继续包含其他请求，比如图片，iframe，fetch等等。这些请求可以被分为两类：
1. 可能打开新页面或者改变当前页面的请求。  
例如： `window.open()`，`<a>`链接，form表单提交等。
2. 不改变当前页面的请求。  
例如： `<script>`，`<css>`，`<img>`等标签，fetch，XHR请求等。

可以看到，这两类的主要区别是：第一类请求直接把页面替换了，或者打开了一个新的页面，即——和原有的页面不属于同一个页面。而第二类请求依然在原页面上，仅仅是做一些内容上的更新。这个请求分类与Samesite配置相关。

### Samesite设置
上面跨站，eTLD和请求分类，是理解Samesite设置的基础。Samesite设置有三种：
1. None  
关闭SameSite属性，即不对跨站Cookie做限制。关闭的前提是设置了Secure，即Cookie只能在HTTPS下使用，否则关闭是无效的。
2. Strict  
禁止发送跨站Cookie。即不管是什么请求，如果我们请求的地址与所在的页面地址属于跨站，那么Strict的Cookie将不会被发送。
3. Lax 默认设置  
在部分情况下可以发送跨站Cookie：请求分类的第1种，即可能打开新页面或者改变当前页面的请求，而且是个Get请求时，可以发送。其他请求不允许发送。

- Strict的设置非常严格，在部分场景下会影响用户正常使用。例如（假想场景）我们在一个网站中提供了Github网站链接；其他用户点击后，由于Strict设置，Cookie不会发送，因此点击链接后是未登录状态。
- Lax设置基本保证了不会产生CSRF攻击，但是如果需要部分请求跨站的场景，又会造成限制。

## Partitioned独立分区
上面我们介绍过的SameSite属性，是为限制第三方Cookie进行跨站传输而设置的。但是在很多场景下，SameSite属性并不够用，我们需要“更更高级”的作用范围设置。这就是Partitioned属性————Cookie分区设置，也叫作CHIPS。关于提案和讨论可以查看[GitHub-CHIPS](https://github.com/privacycg/CHIPS)

SameSite属性仅仅能控制网站是否发送第三方Cookie，但是不能针对不同的网站来源做出不同的Cookie反应。例如一个网站对于外部的网站需要记录不同的第三方Cookie。Partitioned属性允许在请求第三方cookie，即跨站传输Cookie后，浏览器设置一个分区Key（PartitionKey），标明当前访问的网站来源。后续浏览器再次请求第三方Cookie时，浏览器会判当前网站的域名与分区Key是否一致。如果一致才发送这个Cookie，如果不一致则不发送。

![](/2023/cookie-4.png)

假设C网站开启了分区Cookie设置，例如`Set-Cookie: value=1; Partitioned;`。有A网站和B网站分别都会调用C网站的接口。
1. A网站第一次访问后，浏览器除了记录Cookie，还会记录下PartitionKey=A网站。
2. 当我们访问B网站时，也会请求C网站的接口。浏览器使用PartitionKey判断，此时访问的网站与A网站不是同一个，不会发送PartitionKey=A网站的Cookie。
3. 我们访问B网站的C接口后，浏览器除了记录Cookie，还会记录下PartitionKey=B网站。
4. 我们再一次访问A网站或者B网站，浏览器会对应的传输PartitionKey的值为对应网站的Cookie。

这样，就实现了对第三方Cookie更细粒度的访问控制。

除了独立分区之外，浏览器还在讨论其他关于第三方Cookie作用范围设置的方法，例如SameParty属性等等。可以看下：[详解Cookie新增的SameParty属性](https://mp.weixin.qq.com/s/GFQo-GnU-ROc6wmbCQp3Nw)

## JavaScript中操作Cookie

在浏览器中使用js，可以直接设置Cookie。一次只能设置一个Cookie。但是可以同时对单个Cookie的属性进行设置，每个属性使用分隔符;。

### 设置
```js
document.cookie = "a=1;";
document.cookie = "a=1; doamin=jzplp.com";
document.cookie = "a=1; doamin=jzplp.com；path=/abc";
```
修改某个Cookie，相当于对其进行重新设置。

### 读取
```js
document.cookie
```
读取到的是一个字符串，内容为该页面的所有Cookie，不同的Cookie用分隔符;分隔。只能读到key和value，其余的属性读不到。例如：
```js
"a=1; b=2"
```

### 删除
js中没有直接删除Cookie的方法。如果需要删除某个Cookie，需要重新设置该Cookie，将它的有效期直接设置为过期，即可实现删除功能。例如：
```js
document.cookie = "a=1; max-age=-1";
```

## 参考
- MDN Cookies  
  https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Cookies
- MDN Set-Cookie  
  https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers/Set-Cookie
- [译]Cookies Having Independent Partitioned State (CHIPS)  
  https://juejin.cn/post/7086386576837574693
- wikipedia Cookie  
  https://zh.wikipedia.org/wiki/Cookie
- Cookie个数限制及大小  
  https://my.oschina.net/gaollg/blog/71299
- 在什么情况下JavaScript写入cookie的操作会失败？  
  https://www.zhihu.com/question/20332255
- SameSite Cookie，防止CSRF攻击  
  https://www.cnblogs.com/ziyunfei/p/5637945.html
- Public Suffix List 列表  
  https://publicsuffix.org/list/public_suffix_list.dat
- Cookie 的 SameSite 属性  
  http://www.ruanyifeng.com/blog/2019/09/cookie-samesite.html
- Cookie独立分区 CHIPS  
  https://github.com/privacycg/CHIPS
- 谁能帮我们顺利过渡到没有三方 Cookie 的未来？(CHIPS)  
  https://mp.weixin.qq.com/s/sw0lWmUdBSmypMjIg8ulvA
- 详解Cookie新增的SameParty属性  
  https://mp.weixin.qq.com/s/GFQo-GnU-ROc6wmbCQp3Nw
- 在什么情况下 JavaScript 写入 cookie 的操作会失败？
  https://www.zhihu.com/question/20332255
