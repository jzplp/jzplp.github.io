# Node.js中QueryString库的使用注意事项
## 简介
querystring是在Node.js中流行的字符串格式化和解析库，解析的格式与HTTP中GET请求的格式相同。

请求格式例子：

`https://www.baidu.com/s?ie=utf-8&f=8&rsv_bp=1`

其中`ie=utf-8&f=8&rsv_bp=1`部分就是querystring使用的格式。

这里不讲querystring的使用语法，想了解的同学可以去看Node.js的文档：

http://nodejs.cn/api/querystring.html#querystring_querystring_parse_str_sep_eq_options

这种请求方式使用非常方便，不仅能在get中使用在post中也能通过`application/x-www-form-urlencoded`等方式请求。

方便归方便，这种方式的限制是比较大的。

## 代码示例
下面我们通过一个例子进行说明(一个例子就够啦)

```js
var querystring = require('querystring');
var a = {
  a: 1,
  b: '123 456',
  e: "12",
  c: {
    d: 1,
    f: '456'
  },
  g: [1,2,3,"ed"]
}
var b = querystring.stringify(a)
console.log(b);
var c = querystring.parse(b);
console.log(c)
```
执行结果
​​​![](/2020/query-1.png)

我们首先用javascript创建了一个对象，然后用querystring.stringify把对象转换成字符串并输出，然后再用querystring.parse对字符串解析，解析后又生成了一个对象。

## 分析

可以明显看出，最后生成的对象内容是与开始的对象不同的。

我们一个一个来分析哪里不同：

### 1. 不支持数字
在原对象中，属性a的值是个数字，属性e的值是个字符串。原对象经过转换后，属性a和属性e看起来没由什么不同，属性a没有被特殊标记为“数字”。

再重新转换为对象后，属性a和属性e在对象中都变为了字符串，与原对象不同了。可以明显看出，是原对象转换后，数字这个特性无法表示。因此丢失了。

### 2. 不支持嵌套对象
在原对象中，属性c又是一个对象。但是原对象转换后，属性c的值为空！在解析为对象后，c的值为空字符串。也就是说，嵌套对象无法被querystring解析。

我觉得这不是querystring的问题，而是这种表达方式本身就不支持，试想只有&和=两种符号，无法实现对象的嵌套呀。

### 3. 数组的转换
在原对象中，属性g是一个数组。转换之后字符串之后，可以发现属性g的值等于数组的元素：`g=1&g=2&g=3&g=ed`，在解析回对象之后，又恢复为数组了。

因此这种格式是支持数组的。

## 注意
在querystring的文档中提到，解析后的对象与普通Javascript对象不同，不同使用像toString()等方法。

### 文档原文
querystring.parse() 方法返回的对象不是原型地继承自 JavaScript 的 Object。 这意味着典型的 Object 方法如 obj.toString()、 obj.hasOwnProperty() 等都没有被定义并且不起作用。