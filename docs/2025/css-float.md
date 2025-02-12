# 聊一下CSS中的标准流，浮动流，文本流，文档流（未完成）
在网络上关于CSS的文章中，有时候能听到“标准流”，“浮动流”，“定位流”等等词语，还有像“文档流”，“文本流”等词，这些流指的都是什么？ 实际上指的是CSS中的一些布局方案和特性。今天我们就来聊一下CSS中的这些流。

## 简述
* 文档流，普通流，标准流，常规流等：这么多名词实际上指的是都是文档流，即元素在HTML中的位置顺序，决定了它在页面中的位置顺序，分为块级元素和行内元素两种。
* 文本流：文本流指的文档中元素（例如字符）的位置顺序，即从左到右，从上到下的顺序形式。
* 浮动流：浮动流是使用CSS浮动属性作为布局方式。
* 定位流：定位流是使用CSS定位属性作为布局方式。

看了简述，还是不清楚各种流的区别与关联，比如文档流和文本流看起来差不多，究竟有什么不同？CSS浮动和定位为什么要多加一个“流”字？下面我们一一解答下。

## 文档流
文档流又叫做普通流，标准流，常规流等等，的英文名是“normal flow”，是HTML默认的布局形式。在未指定使用其它布局时，我们使用的就是文档流的布局。在文档流中分为两种元素：块级元素和行内元素。

**块级元素**：常见的块级元素有div和p标签等。块级元素会默认占满横向全部宽度，在文档流中从上到下垂直排列。块级元素的左边缘与父元素的左边缘是重合的。

**行内元素**：常见的行内元素有span和a标签等。行内元素在文档流中的宽度为实际内容的宽度，在水平方向从左到右排列。

```html
<html>
  <body>
    <div class="border div-common"></div>
    <div class="border div-common div-width"></div>
    <div class="border div-common div-width"></div>
    你好CSS! 我是JZ。你好CSS! 我是JZ。你好CSS! 我是JZ。你好CSS! 我是JZ。你好CSS!
    我是JZ。你好CSS! 我是JZ。
    <span class="border">
      我是JZ。你好CSS! 我是JZ。你好CSS! 我是JZ。你好CSS! 我是JZ。你好CSS!
    </span>
  </body>
  <style>
    .border {
      border: 1px solid red;
    }
    .div-common {
      height: 50px;
    }
    .div-width {
      width: 100px;
    }
  </style>
</html>
```

![](/2025/float-1.png)

通过例子我们可以看到，每个块级元素独占一行，从上到下排列。在未设置宽度时，默认占满横向全部宽度；即使设置了宽度且剩余空间足够，也是独占一行。行内元素则从左到右排列，如果一行不够，则从下一行左边开始继续。

## 文本流
文本流是指的文本字符从左到右，从上到下的输出顺序。只看说明，感觉文本流和文档流看起来像是一种东西，但事实上是不一样的，我们看一个例子。

```html
<html>
  <body>
    <div class="container">
      <div class="div-common"></div>
      你好CSS! 我是JZ。你好CSS! 我是JZ。你好CSS! 我是JZ。你好CSS!
      我是JZ。你好CSS! 我是JZ。你好CSS! 我是JZ。
    </div>
    <div class="container">
      <div class="div-common div-float"></div>
      你好CSS! 我是JZ。你好CSS! 我是JZ。你好CSS! 我是JZ。你好CSS!
      我是JZ。你好CSS! 我是JZ。你好CSS! 我是JZ。
    </div>
    <div class="container">
      <div class="div-common div-pos"></div>
      你好CSS! 我是JZ。你好CSS! 我是JZ。你好CSS! 我是JZ。你好CSS!
      我是JZ。你好CSS! 我是JZ。你好CSS! 我是JZ。
    </div>
  </body>
  <style>
    .container {
      margin-bottom: 50px;
    }
    .div-common {
      height: 50px;
      width: 100px;
      border: 1px solid red;
    }
    .div-float {
      float: left;
    }
    .div-pos {
      position: absolute;
    }
  </style>
</html>
```

![](/2025/float-2.png)


这里列举了三种情况（例子中包含浮动流和定位流，我们后面会单独介绍）：
1. 第一种情况就是正常的文档流，块级元素单独占一行，字符文本也单独一行从左到右排列。
2. 我们对块级元素设置了左浮动。下面的字符文本跑到同一行展示了，因此浮动脱离了文档流。但是字符文本没有覆盖到块级元素上面，因此没有脱离文本流。
3. 我们对块级元素设置了绝对定位。可以看到下面的字符文本不止跑到同一行展示了，还覆盖到了块级元素上面，因此脱离了文档流，也脱离了文本流。

## CSS的float属性
首先我们来描述一下CSS的float属性。

```html
<html>
  <body>
    <div class="div-common">
      你好CSS! 我是JZ。你好CSS! 我是JZ。你好
      <img class="img-common" src="1.jpg" />
      <span>
        CSS! 我是JZ。你好CSS! 我是JZ。你好CSS! 我是JZ。你好CSS! 我是JZ。你好CSS! 我是JZ。
      </span>
    </div>
    <div class="div-common">
      你好CSS! 我是JZ。你好CSS! 我是JZ。你好
      <img class="img-common left" src="1.jpg" />
      CSS! 我是JZ。你好CSS! 我是JZ。你好CSS! 我是JZ。你好CSS! 我是JZ。你好CSS! 我是JZ。
    </div>
    <div class="div-common">
      你好CSS! 我是JZ。你好CSS! 我是JZ。你好
      <img class="img-common right" src="1.jpg" />
      CSS! 我是JZ。你好CSS! 我是JZ。你好CSS! 我是JZ。你好CSS! 我是JZ。你好CSS! 我是JZ。
    </div>
  </body>
  <style>
    .div-common {
      margin-bottom: 40px;
    }
    .img-common {
      width: 40px;
      height: 40px;
    }
    .left {
      float: left;
    }
    .right {
      float: right;
    }
  </style>
</html>
```

![](/2025/float-3.png)

文本中间有一个图片元素，在不设置浮动时，

## 浮动流

## 定位流

## 更多

## 参考
- MDN 介绍CSS布局\
  https://developer.mozilla.org/zh-CN/docs/Learn_web_development/Core/CSS_layout/Introduction
- MDN 浮动\
  https://developer.mozilla.org/zh-CN/docs/Learn_web_development/Core/CSS_layout/Floats
- HTML的文档流和文本流分别是什么？\
  https://www.zhihu.com/question/21911352
- 文档流、文本流、定位流、浮动流、脱离文档流\
  https://blog.csdn.net/a18792627168/article/details/106298596
- HTML中的文档流和文本流\
  https://juejin.cn/post/6844904013360545800
- css脱离文档流到底是什么意思，脱离文档流就不占据空间了吗？脱离文档流是不是指该元素从dom树中脱离？\
  https://www.zhihu.com/question/24529373
- 文档流和文本流的区别\
  https://www.cnblogs.com/gvip-cyl/p/6258119.html
- CSS2 normal-flow\
  https://www.w3.org/TR/CSS2/visuren.html#normal-flow
- MDN 常规流中的块和内联布局\
  https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_flow_layout/Block_and_inline_layout_in_normal_flow
- MDN 块级内容\
  https://developer.mozilla.org/zh-CN/docs/Glossary/Block-level_content
- MDN 行级内容\
  https://developer.mozilla.org/zh-CN/docs/Glossary/Inline-level_content
- MDN 区块格式化上下文\
  https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_display/Block_formatting_context
- MDN 行内格式化上下文\
  https://developer.mozilla.org/zh-CN/docs/Web/CSS/Inline_formatting_context

