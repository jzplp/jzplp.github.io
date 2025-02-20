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
首先我们来描述一下CSS的float属性。float属性即是控制浮动流的主要属性，一共有三个值。向哪个方向浮动，即是将那个元素放到其容器的哪一侧。

* left: 左浮动
* right: 右浮动
* none: 不浮动 

### 基本特性

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

文本中间有一个图片元素，在不设置浮动时，图片在文本的中间，在设置了左或者右浮动后，图片到了左侧或者右侧。还可以看到，原本图片是占一行，但设置了浮动后，实现了文字环绕图片展示。

```html
<html>
  <body>
    <div class="div-common">
      你好CSS! 我是JZ。你好CSS! 我是JZ。你好
      <img class="img-common left" src="1.jpg" />
      <img class="img-common left" src="1.jpg" />
      <img class="img-common left" src="1.jpg" />
      CSS! 我是JZ。你好CSS! 我是JZ。你好CSS! 我是JZ。你好CSS! 我是JZ。你好CSS! 我是JZ。
    </div>
    <div class="div-common">
      你好CSS! 我是JZ。你好CSS! 我是JZ。你好
      <img class="img-common right" src="1.jpg" />
      <img class="img-common right" src="1.jpg" />
      <img class="img-common left" src="1.jpg" />
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

![](/2025/float-4.png)

如例子，可以将多个元素设置浮动，浮动到同一侧的元素会并排放置，即碰到另一个浮动的元素就停止。

### 块级元素浮动
不止行内元素，块级元素实际上也是可以浮动的。我们举例看一下：

```html
<html>
  <body>
    <div class="div-common" style="height: 140px">
      <div class="size-common">1</div>
      <div class="size-common">2</div>
      <div class="size-common">3</div>
    </div>
    <div class="div-common">
      <div class="size-common left">1</div>
      <div class="size-common left">2</div>
      <div class="size-common right">3</div>
    </div>
    <div class="div-common">
      CSS! 我是JZ。你好CSS! 我是JZ。
      <div class="size-common left">1</div>
      <div class="size-common left">2</div>
      <div class="size-common right">3</div>
      <div class="size-common right">4</div>
    </div>
  </body>
  <style>
    .div-common {
      height: 60px;
      padding-top: 10px;
      border: 1px dotted blue; 
    }
    .size-common {
      width: 40px;
      height: 40px;
      border: 1px solid red; 
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

![](/2025/float-5.png)

从例子中可以看到，当未设置浮动时，块级元素根据文档流的特点，从上到下排列。当设置浮动之后，亏啊及元素聚到了一行，左右浮动排列。如果同时存在未浮动的行内元素，则行内元素在中间展示。

### display属性变化
其实不仅如此，原本的行内元素在设置了浮动后，就变成了块级元素。即float属性会修改display属性的计算值（图源MDN）：

![](/2025/float-6.png)

```html
<html>
  <body>
    <div class="div-common">
      CSS! 我是JZ。你好CSS! 我是JZ。
      <div class="size-common left">1</div>
      <img class="size-common left" src="1.jpg" />
      <span class="left">左浮动</span>
      <div class="size-common left">2</div>
      <div class="size-common right">3</div>
    </div>
  </body>
  <style>
    .div-common {
      height: 60px;
      padding-top: 10px;
      border: 1px dotted blue; 
    }
    .size-common {
      width: 40px;
      height: 40px;
      border: 1px solid red; 
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

![](/2025/float-7.png)

可以看到span元素的display原本是inline，但设置了浮动之后，计算值就变为block了，img元素额现象也是一样的。

## 浮动流
上面仅仅描述了浮动的基本特点，事实上浮动的特点还有很多。我们从浮动流的角度，再看看浮动有什么其它特点。

### 浮动流与块级元素
首先我们来看一下纯块级元素在浮动流中的表现。

```html
<html>
  <body>
    <div class="div-common">
      <div class="size-common one"></div>
      <div class="size-common two"></div>
      <div class="size-common three"></div>
      <div class="size-common four"></div>
    </div>
    <div class="div-common">
      <div class="size-common one left"></div>
      <div class="size-common two left"></div>
      <div class="size-common three right"></div>
      <div class="size-common four right"></div>
    </div>
    <div class="div-common" style="margin-top: 80px">
      <div class="size-common one"></div>
      <div class="size-common two left"></div>
      <div class="size-common three"></div>
      <div class="size-common four"></div>
    </div>
    <div class="div-common">
      <div class="size-common one"></div>
      <div class="size-common two right"></div>
      <div class="size-common three"></div>
      <div class="size-common four"></div>
    </div>
    <div class="div-common">
      <div class="size-common one"></div>
      <div class="size-common two left"></div>
      <div class="size-common three left"></div>
      <div class="size-common four"></div>
    </div>
    <div class="div-common" style="margin-top: 20px">
      <div class="size-common one"></div>
      <div class="size-common two right"></div>
      <div class="size-common three right"></div>
      <div class="size-common four"></div>
    </div>
  </body>
  <style>
    .div-common {
      margin-bottom: 10px;
      border: 1px dotted blue;
    }
    .size-common {
      width: 40px;
      height: 40px;
    }
    .left {
      float: left;
    }
    .right {
      float: right;
    }
    .one {
      background: red;
      height: 20px;
      width: 30px;
    }
    .two {
      background: yellow;
      height: 50px;
      width: 40px;
    }
    .three {
      background: green;
      height: 30px;
      width: 50px;
    }
    .four {
      background: blue;
      height: 40px;
      width: 60px;
    }
  </style>
</html>
```

![](/2025/float-8.png)

这里有按先后次序放置的四个元素，分别是第一个红，第二个黄，第三个绿，第四个蓝色。蓝色虚线指的是外部容器的框。我们看看它们在不同场景下的表现：
* 第一行：未设置浮动，四个元素按照文档流从上到下展示。
* 第二行：四个元素全部设置浮动，四个元素排成了一行。在子元素全部为浮动时，父级元素的高度会变为0，子元素无法撑起父元素的高度，造成塌陷。具体的解决方案我们会在后面章节描述。
* 第三行：第一个红元素是正常文档流，第二个黄元素设置了左浮动；因此第二个元素的位置是在第一个元素下方。由于黄元素是浮动不占文档流位置，因此第三个绿元素和第四个蓝元素从上到下依次排列。
* 第四行： 在第三行的基础上，把第二个黄元素设置为右浮动，不挡住其它元素，可以看到非浮动的1，3，4元素组成了一个正常的文档流。
* 第五行: 第一个元素是正常文档流。第二个黄，第三个绿元素设置了左浮动，因此在第一个元素下方横向排列。第四个元素未浮动，因此与第一个元素一起组成正常文档流。
* 第六行: 在第三行的基础上，把第二个黄，第三个绿元素设置为右浮动，不挡住其它元素。

通过这几个例子，可以看到浮动与文档流的关系。浮动元素前面如果有块级元素，那么浮动元素会在块级元素的下方。但是浮动元素本身脱离了文档流，因此不占空间，下方的非浮动块级元素可能会被浮动元素盖住。所有非浮动元素会形成一个文档流。

### 块级元素与浮动超过一行




## clear属性清除浮动

## 浮动的父元素塌陷和解决方案


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
- MDN float\
  https://developer.mozilla.org/zh-CN/docs/Web/CSS/float
- 三个div都做浮动，给第二个div加上clear:both为什么右边的还是在本行浮动？（clear:right无效）\
  https://www.zhihu.com/question/28166594
- 经验分享：CSS浮动(float,clear)通俗讲解\
  https://www.cnblogs.com/iyangyuan/archive/2013/03/27/2983813.html

