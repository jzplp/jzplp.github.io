# JavaScript中fetch的最简单实现示例，最简单的跨域请求方式

fetch和XMLHttpRequest非常相似，都是在不需要重新加载整个网页的情况下，实现从后端获取数据，更新网页内容。

但是fetch更新（部分旧浏览器不支持），调用方式也更简单。

直接上例子：
```html
<html>
  <body>
    <div>
      receive <span id="qwerty"> </span>
    </div>
  </body>
  <script>
    fetch('/fetchJson')
      .then(res => {
        console.log(res);
        return res.json();
      }).then(myjson => {
        console.log(myjson);
        document.getElementById('qwerty').innerHTML = myjson.c;
      }).catch(err => {
        console.log(err);
      })
  </script>
</html>
```
这是不跨域的示例，就一个fetch调用就可以了，返回一个Promise。

跨域的调用加一个属性（mode: 'no-cors'）即可：

```html
<html>
  <body>
    <div>
      receive <span id="qwerty"> </span>
    </div>
  </body>
  <script>
    fetch('http://example.com/movies.json', {
      mode: 'no-cors'
    })
      .then(res => {
        console.log(res);
        return res.json();
      }).then(myjson => {
        console.log(myjson);
        document.getElementById('qwerty').innerHTML = myjson.c;
      }).catch(err => {
        console.log(err);
      })
  </script>
</html>
```

更多fetch的资料和配置项：
* https://developer.mozilla.org/zh-CN/docs/Web/API/Fetch_API
* https://developer.mozilla.org/zh-CN/docs/Web/API/WindowOrWorkerGlobalScope/fetch
