# 聊一下CSS中的标准流，浮动流，文本流，文档流（未完成）
在网络上关于CSS的文章中，有时候能听到“标准流”，“浮动流”，“定位流”等等词语，还有像“文档流”，“文本流”等词，这些流指的都是什么？ 实际上指的是CSS中的一些布局方案和特性。今天我们就来聊一下CSS中的这些流。这篇文章重点详细描述的是浮动流。

## 简述
* 文档流，普通流，标准流，常规流等：这么多名词实际上指的是都是文档流，即元素在HTML中的位置顺序，决定了它在页面中的位置顺序，分为块级元素和行内元素两种。
* 文本流：文本流指的文档中元素（例如字符）的位置顺序，即从左到右，从上到下的顺序形式。
* 浮动流：浮动流是使用CSS浮动属性作为布局方式。
* 定位流：定位流是使用CSS定位属性作为布局方式。

看了简述，还是不清楚各种流的区别与关联，比如文档流和文本流看起来差不多，究竟有什么不同？CSS浮动和定位为什么要多加一个“流”字？下面我们一一解答下。

## 预置CSS
下面的文档中会出现大量的重复CSS代码，这里提前进行声明。后面的所有示例都预先加载了这部分CSS代码。

```css
.left { /* 左浮动 */
  float: left;
}
.right { /* 右浮动 */
  float: right;
}
.red { /* 红 */
  background: red;
}
.yellow { /* 黄 */
  background: yellow;
}
.green { /* 绿 */
  background: green;
}
.blue { /* 蓝 */
  background: blue;
}
.gray { /* 灰 */
  background: gray;
}
.pink { /* 粉 */
  background: pink;
}
.brown { /* 棕 */
  background: brown;
}
.maroon { /* 褐色 */
  background: maroon;
}
.purple { /* 紫色 */
  background: purple;
}
.fuchsia { /* 紫红 */
  background: fuchsia;
}
.lime { /* 黄绿 */
  background: lime;
}
.olive { /* 橄榄绿 */
  background: olive;
}
.navy { /* 藏青 */
  background: navy;
}
.teal { /* 青 */
  background: teal;
}
.aqua { /* 水绿 */
  background: aqua;
}
.orange { /* 橙 */
  background: orange;
}
.clear-left {
  clear: left;
}
.clear-right {
  clear: right;
}
.clear-both {
  clear: both;
}
```

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
    .border { border: 1px solid red; }
    .div-common { height: 50px; }
    .div-width { width: 100px; }
  </style>
</html>
```

![图片](/2025/float-1.png)

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
      <div class="div-common left"></div>
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
    .container { margin-bottom: 50px; }
    .div-common {
      height: 50px;
      width: 100px;
      border: 1px solid red;
    }
    .left { float: left; }
    .div-pos { position: absolute; }
  </style>
</html>
```

![图片](/2025/float-2.png)


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
    .div-common { margin-bottom: 40px; }
    .img-common {
      width: 40px;
      height: 40px;
    }
  </style>
</html>
```

![图片](/2025/float-3.png)

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
  </style>
</html>
```

![图片](/2025/float-4.png)

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
  </style>
</html>
```

![图片](/2025/float-5.png)

从例子中可以看到，当未设置浮动时，块级元素根据文档流的特点，从上到下排列。当设置浮动之后，块级元素聚到了一行，左右浮动排列。如果同时存在未浮动的行内元素，则行内元素在中间展示。

### display属性变化
其实不仅如此，原本的行内元素在设置了浮动后，就变成了块级元素。即float属性会修改display属性的计算值（图源MDN）：

![图片](/2025/float-6.png)

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
  </style>
</html>
```

![图片](/2025/float-7.png)

可以看到span元素的display原本是inline，但设置了浮动之后，计算值就变为block了，img元素额现象也是一样的。

## 浮动流与块级元素
上面仅仅描述了浮动的基本特点，事实上浮动的特点还有很多。我们从浮动流与块级元素的角度，再看看浮动有什么其它特点。

### 浮动流与块级文档流
首先我们来看一下纯块级元素在浮动流中的表现。

```html
<html>
  <body>
    <div class="div-common">
      <div class="one"></div>
      <div class="two"></div>
      <div class="three"></div>
      <div class="four"></div>
    </div>
    <div class="div-common">
      <div class="one left"></div>
      <div class="two left"></div>
      <div class="three right"></div>
      <div class="four right"></div>
    </div>
    <div class="div-common" style="margin-top: 80px">
      <div class="one"></div>
      <div class="two left"></div>
      <div class="three"></div>
      <div class="four"></div>
    </div>
    <div class="div-common">
      <div class="one"></div>
      <div class="two right"></div>
      <div class="three"></div>
      <div class="four"></div>
    </div>
    <div class="div-common">
      <div class="one"></div>
      <div class="two left"></div>
      <div class="three left"></div>
      <div class="four"></div>
    </div>
    <div class="div-common" style="margin-top: 20px">
      <div class="one"></div>
      <div class="two right"></div>
      <div class="three right"></div>
      <div class="four"></div>
    </div>
  </body>
  <style>
    .div-common {
      margin-bottom: 10px;
      border: 1px dotted blue;
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

![图片](/2025/float-8.png)

这里有按先后次序放置的四个元素，分别是第一个红，第二个黄，第三个绿，第四个蓝色。蓝色虚线指的是外部容器的框。我们看看它们在不同场景下的表现：
* 第一行：未设置浮动，四个元素按照文档流从上到下展示。
* 第二行：四个元素全部设置浮动，四个元素排成了一行。在子元素全部为浮动时，父级元素的高度会变为0，子元素无法撑起父元素的高度，造成塌陷。具体的解决方案我们会在后面章节描述。
* 第三行：第一个红元素是正常文档流，第二个黄元素设置了左浮动；因此第二个元素的位置是在第一个元素下方。由于黄元素是浮动不占文档流位置，因此第三个绿元素和第四个蓝元素从上到下依次排列。
* 第四行： 在第三行的基础上，把第二个黄元素设置为右浮动，不挡住其它元素，可以看到非浮动的1，3，4元素组成了一个正常的文档流。
* 第五行: 第一个元素是正常文档流。第二个黄，第三个绿元素设置了左浮动，因此在第一个元素下方横向排列。第四个元素未浮动，因此与第一个元素一起组成正常文档流。
* 第六行: 在第三行的基础上，把第二个黄，第三个绿元素设置为右浮动，不挡住其它元素。

通过这几个例子，可以看到浮动与文档流的关系。浮动元素前面如果有块级元素，那么浮动元素会在块级元素的下方。但是浮动元素本身脱离了文档流，因此不占空间，下方的非浮动块级元素可能会被浮动元素盖住。所有非浮动元素会形成一个文档流。

### 块级元素与浮动超过一行（单侧）
当浮动的块级元素超过一行时，会发生什么现象呢？我们来看一下单侧浮动的例子。

```html
<html>
  <body>
    <div class="div-common">
      <div class="one left"></div>
      <div class="three left"></div>
      <div class="four left"></div>
      <div class="two left"></div>
      <div class="three left"></div>
      <div class="two left"></div>
    </div>
    <div class="div-common" style="margin-top: 110px">
      <div class="one left"></div>
      <div class="two left"></div>
      <div class="three left"></div>
      <div class="four left" style="width: 100px"></div>
    </div>
    <div class="div-common" style="margin-top: 80px">
      <div class="one left"></div>
      <div class="two left"></div>
      <div class="three left"></div>
      <div class="four left"></div>
    </div>
    <div class="div-common" style="margin-top: 100px">
      <div class="one left" style="height: 100px"></div>
      <div class="two left"></div>
      <div class="three left"></div>
      <div class="four left"></div>
    </div>
    <div class="div-common" style="margin-top: 120px">
      <div class="one left"></div>
      <div class="two left"></div>
      <div class="three left" style="height: 50px"></div>
      <div class="four left"></div>
    </div>

    <div class="div-common" style="margin-top: 120px">
      <div class="one left" style="height: 100px"></div>
      <div class="two left" ></div>
      <div class="three left" style="height: 50px"></div>
      <div class="four left"></div>
    </div>
    <div class="div-common" style="margin-top: 120px">
      <div class="one left" style="height: 100px"></div>
      <div class="two left" ></div>
      <div class="three left"></div>
      <div class="four left"></div>
      <div class="two left" style="height: 10px"></div>
    </div>
    <div class="div-common" style="margin-top: 120px">
      <div class="one left"></div>
      <div class="two left"></div>
      <div class="three left"></div>
      <div class="four left"></div>
      <div class="one left"></div>
      <div class="two left"></div>
      <div class="three left"></div>
      <div class="four left"></div>
    </div>
    <div class="div-common" style="margin-top: 150px">
      <div class="one left"></div>
      <div class="two left"></div>
      <div class="three left"></div>
      <div class="one left"></div>
      <div class="two left"></div>
      <div class="one left"></div>
      <div class="one left"></div>
      <div class="two left"></div>
      <div class="two left"></div>
    </div>
  </body>
  <style>
    .div-common {
      margin-bottom: 10px;
      border: 1px dotted blue;
    }
    .one {
      background: red;
      height: 20px;
      width: 90px;
    }
    .two {
      background: yellow;
      height: 50px;
      width: 120px;
    }
    .three {
      background: green;
      height: 40px;
      width: 150px;
    }
    .four {
      background: blue;
      height: 40px;
      width: 180px;
    }
  </style>
</html>
```

![图片](/2025/float-9.png)

这些例子中为了更容易换行，元素比较宽，且数量比较多，每一个元素都设置的左浮动。这些例子比较复杂。我们还是一个一个来分析：

* 第一个例子：正常浮动，超过一行之后，从第二行左边继续开始浮动。且第二行的垂直位置是前一行最低的位置。
* 第二个例子：第三个绿元素的高度比第二个矮一点，第四个元素与第三个高度一样，且一行可以完整放置，因此横向排列。
* 第三个例子：与第二个例子类似，但是第四个蓝元素更宽，导致水平一行肯定放不开。但是注意第四个蓝元素并没有去开一个新行，而是在前一个绿元素下方继续放置。
* 第四个例子：与第三个例子类似，但是第一个红元素高度很高，能纵向同时容纳第二个黄元素与第三个绿元素。但因为水平有空间，因此第三个绿元素并没有纵向放置。第四个蓝元素虽然水平一行肯定放不开，而且前面的红元素右侧还有大片空闲区域，但是依旧放置在第三个绿元素下方。
* 第五个例子：与第三个例子类似，但是第二个黄元素与第三个绿元素高度相同。因此第三个绿元素下方没有空闲区域了，因此第四个绿元素只好从最左侧开始新的一行浮动了。
* 第六个例子：第一个红元素非常高，第二三个元素高度相同，且第四个蓝元素太宽，无法放置在第一行。由于前一个第二三个元素高度相同，因此第四个蓝元素无法放置在第三个下方，因此它向前寻找，找到了第一个元素下方还有位置。
* 第七个例子：与第六个例子类似，但第四个蓝元素可以放置在第三个元素下方，同时增加了第五个黄元素。第五个黄元素太宽，无法放置在第四个绿元素右侧。第五个黄元素同时高度非常低，三四五元素加起来都比红元素高度低，因此第五个黄元素向前寻找位置，最终在第一个红元素右侧放置。注意看虽然第五个黄元素上方还有空位可以容纳它自己，但是它不在前一个元素右侧的时候，它的位置纵向需要在前一个元素下方。
* 第八个例子：第四个蓝元素在第三个绿元素下方放置，且依旧属于浮动的第一行。第五个红元素的水平位置和第四个蓝元素对齐，虽然上方还有位置可以完整放置红元素，但红元素还是没有过去。同样的第二行的第一个黄元素上方有位置，但纵向还是从上一行最低的位置下方开始。
* 第九个例子：上面部分示例的综合场景。

从上面的例子可以看到浮动在换行场景时的一些规律：
1. 如果一行后方有位置，那么优先水平放置。
2. 如果一行后方没有位置，且前一个元素下方有“空位”，就优先放置在前一个元素下方。如果下方没有空位，但是更前的元素下方有空位，这个元素会向前寻找。
3. 后一个元素的位置如果在前一个元素右侧，那么纵向位置可以水平对齐。如果后一个元素的位置如果在前一个元素左侧，那么那么纵向位置必须在前一个元素最低位置的下方。
4. 如果实在找不到位置，那就开启新的一行浮动。新一行浮动的纵向位置开始于前一行所有元素的最下方。


### 块级元素与浮动超过一行（双侧）
可以看到，在单侧浮动的元素排列就已经比较复杂了，如果左侧和右侧同时出现浮动，且超过一行，又会出现怎样的现象呢？首先看个简单的例子。

```html
<html>
  <body>
    <div class="div-common">
      <div class="div1 left red"></div>
      <div class="div1 left yellow"></div>
      <div class="div1 right green"></div>
      <div class="div1 right blue"></div>
      <div class="div1 left gray"></div>
      <div class="div1 right pink"></div>
    </div>
    <div class="div-common" style="margin-top: 110px">
      <div class="div1 left red"></div>
      <div class="div1 left yellow"></div>
      <div class="div1 left gray"></div>
      <div class="div1 right pink"></div>
      <div class="div1 right green"></div>
      <div class="div1 right blue"></div>
    </div>
    <div class="div-common" style="margin-top: 110px">
      <div class="div1 left red"></div>
      <div class="div1 left yellow"></div>
      <div class="div1 left gray"></div>
      <div class="div1 right pink"></div>
      <div class="div1 left green"></div>
      <div class="div5 right blue"></div>
    </div>
    <div class="div-common" style="margin-top: 110px">
      <div class="div3 left red"></div>
      <div class="div2 left yellow"></div>
      <div class="div2 left gray"></div>
      <div class="div1 right pink"></div>
      <div class="div1 left green"></div>
      <div class="div2 right blue"></div>
    </div>
    <div class="div-common" style="margin-top: 120px">
      <div class="div3 left red"></div>
      <div class="div2 left yellow"></div>
      <div class="div2 left gray"></div>
      <div class="div1 right pink"></div>
      <div class="div1 left green"></div>
      <div class="div2 right blue"></div>
      <div class="div2 left pink"></div>
      <div class="div2 left gray"></div>
      <div class="div2 right yellow"></div>
      <div class="div2 left green"></div>
    </div>
  </body>
  <style>
    .div-common {
      margin-bottom: 10px;
      border: 1px dotted blue;
    }
    .div1 {
      height: 40px;
      width: 100px;
    }
    .div2 {
      height: 40px;
      width: 150px;
    }
    .div3 {
      height: 100px;
      width: 50px;
    }
    .div4 {
      height: 200px;
      width: 50px;
    }
    .div5 {
      height: 40px;
      width: 50px;
    }
  </style>
</html>
```

![图片](/2025/float-10.png)

* 首先看第一与第二个例子：同样的6个元素，只不过顺序和左右浮动不同。这里可以看到换行的规律：按照元素在HTML中出现的顺序在页面中排列，如果第一行无法容纳下一个元素，那么就从第二行开始继续浮动。
* 第三个例子在的第五个绿元素因为第一行位置不够，因此开启了第二行左浮动。第六个蓝元素是右浮动，虽然第一行有位置可以放置，但由于上一个元素已经开启了第二行（虽然是左浮动），因此也在第二行展示了。
* 然后是第四个例子，第一个红元素高度非常高，因此其余的左右浮动元素都在它的右侧排列，在内部换行，但是都属于大的第一行。再看第五个例子，第一个红元素的右侧足够放置三行元素的排列。尤其看第三行，最上面的部分高度在红元素内，但是下面的高度已经超过红元素了。再看最后一个绿元素，当右侧位置不够时，终于开启了大的第二行浮动。

```html
<html>
  <body>
    <div class="div-common">
      <div class="div1 left red"></div>
      <div class="div4 right yellow"></div>
      <div class="div2 left gray"></div>
      <div class="div3 right pink"></div>
      <div class="div2 left green"></div>
    </div>
    <div class="div-common" style="margin-top: 150px">
      <div class="div1 left red"></div>
      <div class="div4 right yellow"></div>
      <div class="div2 left gray"></div>
      <div class="div3 right pink"></div>
      <div class="div2 right green"></div>
    </div>
    <div class="div-common" style="margin-top: 150px">
      <div class="div1 left red"></div>
      <div class="div4 right yellow"></div>
      <div class="div2 left gray"></div>
      <div class="div3 right pink"></div>
      <div class="div2 right green"></div>
      <div class="div2 right blue"></div>
      <div class="div1 left brown"></div>
    </div>
    <div class="div-common" style="margin-top: 160px">
      <div class="div5 right red"></div>
      <div class="div1 left yellow"></div>
      <div class="div3 left gray"></div>
      <div class="div6 right green"></div>
      <div class="div7 left pink"></div>
      <div class="div8 left brown"></div>
    </div>
    <div class="div-common" style="margin-top: 160px">
      <div class="div5 right red"></div>
      <div class="div1 left yellow"></div>
      <div class="div3 left gray"></div>
      <div class="div6 right green"></div>
      <div class="div7 left pink"></div>
      <div class="div8 right brown"></div>
    </div>
  </body>
  <style>
    .div-common {
      margin-bottom: 10px;
      border: 1px dotted blue;
    }
    .div1 {
      height: 50px;
      width: 100px;
    }
    .div2 {
      height: 50px;
      width: 150px;
    }
    .div3 {
      height: 40px;
      width: 100px;
    }
    .div4 {
      height: 40px;
      width: 300px;
    }
    .div5 {
      height: 100px;
      width: 150px;
    }
    .div6 {
      height: 40px;
      width: 150px;
    }
    .div7 {
      height: 80px;
      width: 100px;
    }
    .div8 {
      height: 100px;
      width: 50px;
    }
  </style>
</html>
```

![图片](/2025/float-11.png)

再看更复杂一点的例子。

* 首先第一个例子，第一个红元素比第二个高一点，导致第三个灰元素左浮动时靠在红元素的右侧。而第四个绿元素比第三个灰元素低一点，因此第五个绿元素左浮动时靠在灰元素的右侧，形成了类似于台阶的样式。第二个例子把最后的绿元素右浮动，可以看到和左浮动在同一水平位置。
* 第三个例子在第二个的基础上增加了右浮动的蓝元素。虽然是右浮动，但因为绿元素前面位置水平被灰元素挡住了，因此位置靠下了，这时候蓝元素左侧反而没有左浮动的元素了，这时候放置一个左浮动的棕元素，它反而靠在最前了。
* 第四第五个例子的非常类似，区别在于最后的棕元素是左浮动还是右浮动。棕元素的前一个元素是左浮动的粉元素，但是棕元素的位置上方恰好空出了一块位置，可以容纳棕元素。但是棕元素不能比前一个元素的水平位置更高，因此上方空出了一块位置。这个不管对左浮动还是右浮动都有效。

通过这几个例子可以看到，双侧浮动和单侧浮动的换行以及位置规律是一样的，单侧的规则双侧也是可以生效的。但由于双侧浮动情况更多，因此会有更多看起来奇怪的位置排列现象。

### 不同父元素的浮动流
上面我们尝试的都集中在一个父元素里面，如果在不同的父元素中浮动，会发生什么现象呢？

```html
<html>
  <body>
    <div class="div-common">
      <div class="div1 left red"></div>
      <div class="div1 left yellow"></div>
    </div>
    <div class="div-common">
      <div class="div1 right gray"></div>
      <div class="div1 right pink"></div>
    </div>
    <div class="div-common" style="margin-top: 80px">
      <div class="div2 left red"></div>
      <div class="div1 right yellow"></div>
      <div class="div1 right pink"></div>
    </div>
    <div class="div-common" style="margin-top: 10px">
      <div class="div1 left blue"></div>
      <div class="div2 left gray"></div>
      <div class="div1 left green"></div>
    </div>
    <div class="div-devide" style="margin-top: 180px"></div>
    <div>
      <div class="div1 left red"></div>
      <div class="div1 left yellow"></div>
    </div>
    <div>
      <div class="div1 right gray"></div>
      <div class="div1 right pink"></div>
    </div>
    <div class="div-devide" style="margin-top: 100px"></div>
    <div>
      <div class="div2 left red"></div>
      <div class="div1 right yellow"></div>
      <div class="div1 right pink"></div>
    </div>
    <div style="margin-top: 10px">
      <div class="div1 left blue"></div>
      <div class="div2 left gray"></div>
      <div class="div1 left green"></div>
    </div>
  </body>
  <style>
    .div-common { border: 1px dotted blue; }
    .div-devide {
      border: 1px dotted brown;
    }
    .div1 {
      height: 50px;
      width: 100px;
    }
    .div2 {
      height: 50px;
      width: 150px;
    }
  </style>
</html>
```

 ![图片](/2025/float-12.png)

这几个例子与前几个有一些区别：这些都是两个父级div组成了一个例子，父级div之间没有设置margin。前两个例子父级div右boder，后两个例子没有。

* 第一个例子：两个父级div由于内部元素全部浮动，因此不占空间。所以内部元素在垂直位置上居然是重叠的。即第二个父级div的元素浮动不会因为第一个父级div元素中出现浮动而在第二行排列。但由于父级div存在border，因此垂直位置并不是完全一致的，而是有很小的高度差。
* 第三个例子：在第一个例子的基础上去掉了父级div的border。这样我们发现不同父级的浮动元素在垂直方向上位置完全一致。
* 第二个例子：在第一个例子的基础上，增加了第二个父级div的margin-top，这样两个父级的元素浮动在第一行就能有明显区分，而且多了几个元素。我们看第五个灰元素，它自身属于第二个父级，放置的时候属于第一个父级的右浮动元素挡住了它的位置。虽然所属的父元素不同，但是灰元素依然避开了粉元素，在下方放置了。最后一个绿元素因为第一行位置不够，在第二行重新开始浮动。
* 第四个例子：在第二个例子的基础上，去掉了父级div的border。现象与第二个例子基本一致。

从这几个例子可以看出，虽然浮动元素所属的父级不同，浮动流的规律也是适用的；即在同一个浮动流中浮动。

## 浮动流与同高度行内元素
上面我们讨论了很多块级元素在浮动流中的现象，现在我们再讨论一下浮动流与行内元素的特点。由于行内元素场景更多，这里仅讨论下非可替换元素，以及元素高度固定的场景。这里以span元素为例，但是其它元素

### 单个行内元素浮动
首先来看一下单个行内元素在浮动中的简单表现。

```html
<html>
  <body>
    <div class="div-common">
      <span class="red">第1个</span><span class="yellow">第2个</span
      ><span class="green">第3个</span><span class="blue">第4个</span
      ><span class="gray">第5个</span>
    </div>
    <div class="div-common">
      <span class="red">第1个</span><span class="left yellow">第2个左</span
      ><span class="green">第3个</span><span class="blue left">第4个左</span
      ><span class="gray">第5个</span>
    </div>
    <div class="div-common">
      <span class="red">第1个个个个个个个个个个个个个个个个个个个个个个</span
      ><span class="left yellow">第2个个个个个左</span>
    </div>
    <div class="div-common">
      <span class="red"
        >第1个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个</span
      ><span class="left yellow">第2个个个个个左</span>
    </div>
    <div class="div-common">
      <span class="red"
        >第1个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个</span
      ><span class="left yellow">第2个个个个个左</span>
    </div>
    <div class="div-common">
      <span class="red">第1个个个个个个个个个个个个个个个</span
      ><span class="yellow">第2个个个个个个个个个</span
      ><span class="left green">第3个个个个个左</span>
    </div>
    <div class="div-common">
      <span class="red">第1个个个个个个个个个个个</span
      ><span class="yellow">第2个个个个个个个个个个个个个个个个个个个个</span
      ><span class="left green">第3个个个个个左</span>
    </div>
    <div class="div-common">
      <span class="red">第1个个个个个个个个个个个个个个个个个</span
      ><span class="yellow">第2个个个个个个个个个个个个个个个个个个个个</span
      ><span class="green"
        >第3个个个个个个个个个个个个个个个个个个个个个个个</span
      ><span class="left gray">第4个个个个个个个个个个个</span>
    </div>
    <div class="div-common">
      <span class="red">第1个个个个个个个个个个个个个个个个个</span
      ><span class="yellow">第2个个个个个个个个个个个个个个个个个个个个</span
      ><span class="green"
        >第3个个个个个个个个个个个个个个个个个个个个个个个</span
      ><span class="gray">第4个个个个个个个</span><span class="left pink">第5个个个个个个个个</span>
    </div>
  </body>
  <style>
    .div-common {
      border: 1px dotted blue;
      margin-bottom: 40px;
    }
  </style>
</html>
```

 ![图片](/2025/float-13.png)

* 第一个例子：五个行内元素，没有设置浮动
* 第二个例子：第二个和第四个元素设置了左浮动，这两个元素跑到最左边了。同样都是浮动元素时，按照它们的在原HTML中的位置排列。
* 第三个例子：只有两个元素，第二个元素浮动。但第一个元素太长，使得第一行无法容纳下完整的第二个元素，因此跑到第二行最左边浮动。注意此时第一行虽然有位置，但是浮动元素并未利用。（非浮动时则会利用）
* 第四个例子：只有两个元素，第二个元素浮动。但第一个元素太长，超过了一行。因此第二个元素跑到第二行最左边浮动。注意此时第一个元素看起来向被浮动元素“断成两截”的样子。
* 第五个例子：第一个元素太长了，自己延伸到第三行了，因此把第二个元素挤到第三行浮动。
* 第六个例子：前两个元素使得第一行位置不足了，因此跑到第二行最左边浮动。注意此时第一行虽然有位置，但是浮动元素并未利用。（非浮动时则会利用）
* 第七个例子：前两个元素超过了一行，第三个元素跑到第二行最左边浮动。最后一个元素像是被浮动元素“断成两截”的样子。
* 第八个例子：三个元素延伸到第三行了，因此把第四个元素挤到第三行浮动。
* 第九个例子：四个元素延伸到第三行了，第五个元素挤到第三行浮动。但注意第四个元素自身比较短，是肯定在第三行展示的，因此这里不止截断了第三个长元素，第一个元素还在同一行的第五个后面。

这里能总结出单个元素单侧浮动的一点规律：浮动元素会在当前行向一侧浮动。但如果浮动元素在浮动前的位置跨行，则在它最下方所在行浮动。即原来浮动元素可能在第二行和第三行，则浮动后会在第三行浮动。我们做一下更多的实验，看看总结的规律是否正确。

### 单个元素很长
这里试一下单个元素很长的场景，包括单个很长的非浮动元素与浮动元素：

```html
<html>
  <body>
    <div class="div-common">
      <span class="red"
        >第1个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个</span
      ><span class="yellow">第2个</span>
    </div>
    <div class="div-common">
      <span class="red"
        >第1个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个</span
      ><span class="yellow left">第2个</span>
    </div>
    <div class="div-common">
      <span class="red"
        >第1个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个</span
      ><span class="yellow">第2个</span>
    </div>
    <div class="div-common">
      <span class="red"
        >第1个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个</span
      ><span class="yellow left">第2个</span>
    </div>
    <div class="div-common">
      <span class="yellow">第1个</span
      ><span class="red"
        >第2个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个</span
      >
    </div>
    <div class="div-common" style="margin-bottom: 70px">
      <span class="yellow">第1个</span
      ><span class="red left"
        >第2个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个</span
      >
    </div>
    <div class="div-common">
      <span class="yellow">第1个</span
      ><span class="red"
        >第2个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个</span
      ><span class="green">第3个</span><span class="blue">第4个</span>
    </div>

    <div class="div-common">
      <span class="yellow">第1个</span
      ><span class="red"
        >第2个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个</span
      ><span class="green left">第3个</span><span class="blue">第4个</span>
    </div>

    <div class="div-common" style="margin-bottom: 90px">
      <span class="yellow">第1个</span
      ><span class="red left"
        >第2个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个</span
      ><span class="green">第3个</span><span class="blue">第4个</span>
    </div>

    <div class="div-common">
      <span class="yellow">第1个</span
      ><span class="red left"
        >第2个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个</span
      ><span class="green">第3个</span><span class="blue">第4个</span
      ><span class="gray"
        >第5个个个个个个个个个个个个个个个个个个个个个个个</span
      >
    </div>

    <div class="div-common">
      <span class="red left"
        >第1个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个</span
      ><span class="yellow">第2个</span><span class="green">第3个</span
      ><span class="blue">第4个</span
      ><span class="gray">第5个个个个个个个个个个个</span>
    </div>
  </body>
  <style>
    .div-common {
      border: 1px dotted blue;
      margin-bottom: 40px;
    }
  </style>
</html>
```

![图片](/2025/float-14.png)

上面的每个例子共同特征是，都有一个超过一行的红元素。我们一个一个来分析下。

* 第一个例子：未设置浮动，与第二个例子做对比用。
* 第二个例子：第二个黄元素设置了浮动，浮动前它在红元素之后，浮动后截断了红元素，跑到第二行最左侧了。
* 第三个例子：与第一个例子类似，未设置浮动。只不过红元素更长了，使得第二个黄元素在第二行换行。
* 第四个例子：第三个例子中的黄元素设置了浮动，可以看到浮动前黄元素横跨第二行第三行，浮动后只在第三行展示。
* 第五个例子：第一个黄元素与第二个长红元素横跨第一行第二行，均未设置浮动。
* 第六个例子：第五个例子中的红元素设置了浮动，在设置浮动后红元素从第二行开始展示，一直持续到第三行，且红色背景的覆盖范围持续到第三行结束。
* 第七个例子：一共四个元素，均未设置浮动。其中第二个红元素很长。
* 第八个例子：第三个绿元素设置了浮动，它本来就在第二行，因此跑到了第二行最左侧，截断了红元素。
* 第九个例子：一共四个元素，其中第二个红元素很长，且设置了浮动。可以看到第二个红元素在第二行第三行展示，和第六个例子一致。
* 第十个例子：在第九个例子的基础上增加了第五个灰元素，较长且未设置浮动。第二个红元素右上方的空白被灰元素填充了，且剩下灰元素部分被浮动的红元素阶段，到了第四行展示。
* 第十一个例子：第十个例子中的红元素跑到了第一位，其它元素都没有占用红元素在第二行剩下的空间，而是全部在第三行展示。

上面的例子看似有点奇怪，其实比较容易理解。虽然我们的元素是span，但浮动后就变成了块级元素，其中的文本也在块级元素内展示。因此浮动前这些文本可能横跨两行，浮动后便统一在一行展示了。即使是避免不了换行的长元素，也是在块级与元素内部换行。也正因为是块级元素，因此存在换行的长元素的未被文本覆盖的有背景的位置，也属于块级内部，别的文本是不能占用这个位置来展示的。

至于同一个span元素中的文本是可以被浮动元素截断，导致换行甚至间隔几行来展示的。另外如果浮动的元素在最下方，父元素的宽高是不计算最下方的浮动元素的。但如果浮动元素在最上方，父元素的宽高却将它包含在内。

### 多行内元素单侧浮动
上面的例子基本都都是单个元素浮动的场景，这一部分我们来看下多个元素同时浮动的例子。

```html
<html>
  <body>
    <div class="div-common">
      <span class="yellow">第1个</span><span class="red">第2个</span
      ><span class="green">第3个</span><span class="blue">第4个</span
      ><span class="gray">第5个</span>
    </div>
    <div class="div-common">
      <span class="yellow">第1个</span><span class="red left">第2个</span
      ><span class="green">第3个</span><span class="blue left">第4个</span
      ><span class="gray">第5个</span>
    </div>
    <div class="div-common">
      <span class="yellow">第1个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个</span><span class="red left">第2个</span
      ><span class="green">第3个</span><span class="blue left">第4个</span
      ><span class="gray">第5个</span>
    </div>
    <div class="div-common">
      <span class="yellow">第1个个个个个个个个个个个个个个个个个个个个个个个个个个</span><span class="red left">第2个</span
      ><span class="green">第3个</span><span class="blue left">第4个</span
      ><span class="gray">第5个</span>
    </div>
    <div class="div-common">
      <span class="yellow">第1个个个个个个个个个个个个个个个个个个个个个个个个个</span><span class="red left">第2个</span
      ><span class="green">第3个</span><span class="blue left">第4个</span
      ><span class="gray">第5个</span>
    </div>
    <div class="div-common">
      <span class="yellow">第1个个个个个个个个个个个个个个个个个个个个个个</span><span class="red left">第2个</span
      ><span class="green">第3个</span><span class="blue left">第4个</span
      ><span class="gray">第5个</span>
    </div>
    <div class="div-common">
      <span class="yellow">第1个个个个个个个个个个个个个个个个个个个个</span><span class="red left">第2个</span
      ><span class="green">第3个</span><span class="blue left">第4个</span
      ><span class="gray">第5个</span>
    </div>
    <div class="div-common">
      <span class="yellow">第1个个个个个个个个个个个个个个个个</span><span class="red left">第2个</span
      ><span class="green">第3个</span><span class="blue left">第4个</span
      ><span class="gray">第5个</span>
    </div>
  </body>
  <style>
    .div-common {
      border: 1px dotted blue;
      margin-bottom: 40px;
    }
  </style>
</html>
```

![图片](/2025/float-15.png)

这是一组相互关联的例子，每个例子都是五个元素。从第二个例子开始，都是第二个和第四个元素浮动。从第三个例子开始，第一个元素变长，但是长度逐渐减小。

* 第一个例子：五个元素没有浮动，做对照使用。
* 第二个例子：第二和第四个元素左浮动，浮动顺序为在HTML中的元素顺序。
* 第三个例子：第一个元素超长，导致元素其它元素全部在第二行。浮动的第二和第四个元素也在第二行展示。效果和上一节的例子一致。
* 第四个例子：第一个元素缩短，长度不足占满一行，但是第一行又不够完整的展示第二个元素（浮动为了块级元素，不能像行内元素一样换行），因此第三个元素的一部分放到了第一行。
* 第五个例子：继续缩短第一个元素，使得第一行可以容纳第二个元素，因此第二个元素在第一行左浮动。
* 第六个例子：继续缩短第一个元素，使得第一行可以容纳第二和第三个元素，但第四个位置不够，此时第五个元素在第一行和第二行跨行展示。
* 第七个例子：继续缩短第一个元素，使得第一行可以容纳第二，第三，第四个元素。此时第二和第四个元素都在第一行左浮动。
* 第八个例子：继续缩短第一个元素，此时所有元素都在第一行展示，类似第二个例子。

这个例子体现出的行内浮动规则在前面已经说过了，但是通过不断地缩短第一个元素，能看出一个有趣的现象：当前行无法容纳浮动元素时，浮动元素会在下一行展示。但是排在后面的非浮动元素却不受限制，可以跑到浮动的前一行展示。

如果排到后面的浮动元素可以在当前行容纳下，那么这个元素会不会排到前面展示呢？根据上面块级元素的规律，我认为不会。我们再看几个例子实验下：

```html
<html>
  <body>
    <div class="div-common">
      <span class="yellow">第1个个个个个个个个个个个个个个个个个个个个个</span
      ><span class="red left">第2个个个个个个个</span
      ><span class="green left">第3个</span><span class="blue left">第4个</span
      ><span class="gray">第5个</span>
    </div>
    <div class="div-common" style="margin-bottom: 150px">
      <span class="yellow">第1个个个个个个个个个个个个个个个个个个个个个</span
      ><span class="red left"
        >第2个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个</span
      ><span class="green left">第3个</span
      ><span class="blue left"
        >第4个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个</span
      ><span class="gray left">第5个个个</span>
    </div>
    <div class="div-common">
      <span class="yellow">第1个个个个个个个个个个个个个个个个个个个个个</span
      ><span class="red left"
        >第2个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个</span
      ><span class="green left">第3个</span
      ><span class="blue left"
        >第4个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个</span
      ><span class="gray left">第5个个个</span
      ><span class="pink"
        >第6个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个</span
      >
    </div>
    <div class="div-common">
      <span class="yellow">第1个个个个个个个个个个个个个个个个个个个个个</span
      ><span class="red left"
        >第2个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个</span
      ><span class="green left">第3个</span
      ><span class="blue left"
        >第4个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个</span
      ><span class="gray left">第5个个个</span
      ><span class="pink"
        >第6个个个个个个个个个个个个个个个个个个</span
      >
    </div>
  </body>
  <style>
    .div-common {
      border: 1px dotted blue;
      margin-bottom: 40px;
    }
  </style>
</html>
```

![图片](/2025/float-16.png)

* 第一个例子：第一个黄元素比较长，导致第二个红元素虽然是左浮动，但第一行容纳不下，因此在第二行左浮动。第三个第四个元素虽然第一行的空间足够容纳下，但它们是左浮动，必须在第二个红元素下方或者右侧，因此只能在第二行红元素后面放置。
* 第二个例子：第二到第五个元素全部左浮动。其中第二和第四个元素长度超过了一行。可以看到所有浮动的元素都单独一行，因为所有的元素都没办法和前面的元素组合成单独一行。而且虽然第一行有空位可以容纳第三个元素，而且第二个元素后面（第三行）也有空位，但是由于块级元素的性质以及浮动元素不能出现在前一个浮动元素的“前面”，因此第三个元素依然独立一行展示。第五个元素同理。
* 第三个例子：增加了第六个非浮动元素，可以看到它在各个浮动元素造成的空白中补足（除了被块级元素占据的空白）。
* 第四个例子：缩短了第六个元素的长度，使其只到第四行。

可以看到第二个例子中父级元素的的边框只右第一行，第三个例子中父级元素的边框持续到了最后一行，第四个例子中父级元素的边框缩短到了第四行。这说明行内元素构成的浮动中，依然是非浮动元素的高度决定了它的高度。通过这些例子可以看到，块级元素浮动规律和文本行内元素构成的浮动是一致的。例如后一个左浮动元素必须在前一个左浮动元素的“下方或者右侧”(右浮动同理)。

### 多行内元素双侧浮动

了解了单侧多元素浮动，再来看一下双侧多元素浮动的场景。与单侧一样，我们也构造一组相互关联的例子：

```html
<html>
  <body>
    <div class="div-common">
      <span class="red">第1个</span><span class="yellow">第2个</span
      ><span class="green">第3个</span><span class="blue">第4个</span
      ><span class="gray">第5个</span><span class="pink">第6个</span
      ><span class="brown">第7个</span>
    </div>
    <div class="div-common">
      <span class="red right">第1个</span><span class="yellow">第2个</span
      ><span class="green right">第3个</span><span class="blue">第4个</span
      ><span class="gray left">第5个</span><span class="pink">第6个</span
      ><span class="brown left">第7个</span>
    </div>
    <div class="div-common">
      <span class="red right"
        >第1个个个个个个个个个个个个个个</span
      ><span class="yellow">第2个</span><span class="green right">第3个</span
      ><span class="blue">第4个</span><span class="gray left">第5个</span
      ><span class="pink">第6个</span><span class="brown left">第7个</span>
    </div>
    <div class="div-common">
      <span class="red right"
        >第1个个个个个个个个个个个个个个个个</span
      ><span class="yellow">第2个</span><span class="green right">第3个</span
      ><span class="blue">第4个</span><span class="gray left">第5个</span
      ><span class="pink">第6个</span><span class="brown left">第7个</span>
    </div>
    <div class="div-common">
      <span class="red right"
        >第1个个个个个个个个个个个个个个个个个个</span
      ><span class="yellow">第2个</span><span class="green right">第3个</span
      ><span class="blue">第4个</span><span class="gray left">第5个</span
      ><span class="pink">第6个</span><span class="brown left">第7个</span>
    </div>
    <div class="div-common">
      <span class="red right"
        >第1个个个个个个个个个个个个个个个个个个个</span
      ><span class="yellow">第2个</span><span class="green right">第3个</span
      ><span class="blue">第4个</span><span class="gray left">第5个</span
      ><span class="pink">第6个</span><span class="brown left">第7个</span>
    </div>
    <div class="div-common">
      <span class="red right"
        >第1个个个个个个个个个个个个个个个个个个个个个个</span
      ><span class="yellow">第2个</span><span class="green right">第3个</span
      ><span class="blue">第4个</span><span class="gray left">第5个</span
      ><span class="pink">第6个</span><span class="brown left">第7个</span>
    </div>
    <div class="div-common">
      <span class="red right"
        >第1个个个个个个个个个个个个个个个个个个个个个个个</span
      ><span class="yellow">第2个</span><span class="green right">第3个</span
      ><span class="blue">第4个</span><span class="gray left">第5个</span
      ><span class="pink">第6个</span><span class="brown left">第7个</span>
    </div>
    <div class="div-common">
      <span class="red right"
        >第1个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个</span
      ><span class="yellow">第2个</span><span class="green right">第3个</span
      ><span class="blue">第4个</span><span class="gray left">第5个</span
      ><span class="pink">第6个</span><span class="brown left">第7个</span>
    </div>
  </body>
  <style>
    .div-common {
      border: 1px dotted blue;
      margin-bottom: 40px;
    }
  </style>
</html>
```

![图片](/2025/float-17.png)

* 第一个例子：未设置浮动，做对比用。
* 第二个例子：第一个和第三个元素设置了右浮动，第五个和第七个元素设置了左浮动。可以看到，在HTML中顺序靠前的元素在浮动中的顺序更靠前。
* 第三个例子：第一个元素长度增加，使得第一行放不开所有元素。这里第七个元素被挤到了第二行。由于第七个元素是浮动元素，因此他没有跨行展示。
* 第四个例子：第一个元素长度继续增加。使得第六个元素无法完整放在第一行，由于它不是浮动元素，因此跨行展示。
* 第五个例子：第一个元素长度继续增加，第六个元素全部放置在第二行。
* 第六个例子：第一个元素长度继续增加，使得第五个元素无法完全放置在第一行。注意由于第五个元素是左浮动，不能跨行展示，因此在完全第二行展示。但是这样造成第一行又剩下一点空间被第六个元素填充了。
* 第七个例子：第一个元素长度继续增加，第五六七个元素都在第二行展示，第四个元素由于空间不够跨行展示。
* 第八个例子：第一个元素长度继续增加，第二行完整展示第四个元素。
* 第九个例子：第一个元素长度继续增加，超过一行。触发了块级元素独立成两行，其它元素都在第三行展示。

当双侧浮动时，元素的展示二号换行规律也是一样的，浮动元素的出现位置按照HTML的位置顺序出现。对于浮动元素来说，位置更靠后的元素的所在行不可能在位置更靠前的元素所在行的前面。但非浮动元素由于可以补缺的原因，位置靠后的元素是可以出现在更前面的行的。我们再来看几个例子：

```html
<html>
  <body>
    <div class="div-common">
      <span class="red left">第1个个个个个个个个个个个个</span
      ><span class="yellow right">第2个个个个个个个个个个个个个</span
      ><span class="green left">第3个个个个个个个个个个个个个个个</span
      ><span class="blue right">第4个个个个个个个个</span
      ><span class="gray left">第5个个个个个个个个个</span
      ><span class="pink right">第6个个个个个个个个个个个</span
      ><span class="brown">第7个个个个个个个个个个个个个个个个个个个</span>
    </div>
    <div class="div-common" style="margin-bottom: 100px">
      <span class="brown">第0个个个个个个个个个个个个个个个个个个个个个个</span
      ><span class="red left">第1个个个个个个个个个个个个</span
      ><span class="yellow right">第2个个个个个个个个个个个个个</span
      ><span class="green left">第3个个个个个个个个个个个个个个个</span
      ><span class="blue right">第4个个个个个个个个</span
      ><span class="gray left">第5个个个个个个个个个</span
      ><span class="pink right">第6个个个个个个个个个个个</span>
    </div>
    <div class="div-common">
      <span class="red left"
        >第1个个个个个个个个个个个个个个个个个个个个个个个</span
      ><span class="yellow right"
        >第2个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个</span
      ><span class="green left">第3个个个个个个个个个个个个</span
      ><span class="blue right"
        >第4个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个</span
      ><span class="gray left">第5个个个个个个个个个个个个</span
      ><span class="pink right">第6个个个个个个个个个个</span
      ><span class="brown"
        >第7个个个个个个个个个个个个个个个个个个个个个个个个个</span
      >
    </div>
    <div class="div-common">
      <span class="red left"
        >第1个个个个个个个个个个个个个个个个个个个个个个个</span
      ><span class="yellow right"
        >第2个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个</span
      ><span class="green left">第3个个个个个个个个个个个个</span
      ><span class="blue right"
        >第4个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个</span
      ><span class="gray left">第5个个个个个个个个个个个个</span
      ><span class="pink right">第6个个个个个个个个个个</span
      ><span class="brown"
        >第7个个个个个个个个个个个个个个个个个个个个个个个个个</span
      >
    </div>
  </body>
  <style>
    .div-common {
      border: 1px dotted blue;
      margin-bottom: 40px;
    }
  </style>
</html>
```

![图片](/2025/float-18.png)

* 第一个例子：前六个元素分别左右浮动，致使前三行都有少量空白。第七个元素未浮动，因此从第一行开始填补每一行的空白区域。
* 第二个例子：第0个元素未浮动，第一到六个分别左右浮动。可以看到第一行的未浮动元素没有向下填充下面行的空白，下面的浮动元素也没有向上侵占未浮动元素的空间。
* 第三个例子：浮动元素长度增加了，第二个元素和第四个元素都超过了一行。但是第四个元素依然在空白处填补。
* 第四个例子：第三个例子未改动。但是使用鼠标选中了第一到第六个元素中间的部分文本。可以看到第7个元素虽然在中间穿插填补，但并未被选中。实际上选中顺序还是按照HTML的顺序，不是按照页面上呈现的顺序。

第一与第二个例子中六个浮动元素是一样的，区别在于未浮动元素的位置。第一个例子在最后，元素向上填补了空缺。第二个例子在最前，元素没有向下填补浮动元素造成的空缺。

## 浮动流中块级元素与同高度行内元素
前面描述的行内元素都是同高度的场景，但行内元素和块级元素都存在高度不同的场景。我们首先从简单的块级元素与同高度行内元素的组合场景开始看起。

### 仅块级元素浮动

```html
<html>
  <body>
    <div class="wrapper">
      <div class="red block"></div>
      <span class="yellow">第1个</span><span class="green">第2个</span>
      <div class="brown block"></div>
      <span class="gray">第3个</span><span class="pink">第4个</span>
    </div>
    <div class="wrapper">
      <div class="red block left"></div>
      <span class="yellow">第1个</span><span class="green">第2个</span>
      <div class="brown block"></div>
      <span class="gray">第3个</span><span class="pink">第4个</span>
    </div>
    <div class="wrapper">
      <div class="red block left"></div>
      <span class="yellow">第1个</span><span class="green">第2个</span>
      <div class="brown block left"></div>
      <span class="gray">第3个</span><span class="pink">第4个</span>
    </div>
    <div class="wrapper">
      <div class="red block"></div>
      <span class="yellow">第1个</span><span class="green">第2个</span>
      <div class="brown block left"></div>
      <span class="gray">第3个</span><span class="pink">第4个</span>
    </div>
    <div class="wrapper">
      <div class="red block"></div>
      <span class="yellow">第1个</span><span class="green">第2个</span>
      <div class="brown block left"></div> <div class="maroon block left"></div>
      <span class="gray">第3个</span><span class="pink">第4个</span>
    </div>
    <div class="wrapper">
      <div class="red block"></div>
      <span class="yellow">第1个</span><span class="green">第2个</span>
      <div class="brown block left"></div><div class="maroon block left"></div>
      <div class="purple block"></div>
      <span class="gray">第3个</span><span class="pink">第4个</span>
    </div>
  </body>
  <style>
    .wrapper {
      border: 1px dotted blue;
      margin-bottom: 40px;
    }
    .block {
      width: 100px;
      height: 40px;
    }
  </style>
</html>
```

![图片](/2025/float-19.png)

这是一个较简单的例子，没有换行，所有块级元素的高度一致而且是左浮动。我们来分析一下：

* 第一个例子：块级元素和行内元素间隔放置，没有设置浮动，做对比用。可以看到块级元素独立一行，在块级元素之间的行内元素们也是独立一行。
* 第二个例子：红块级元素设置浮动。虽然浮动元素脱离了文档流不占空间，但是没有脱离“文本流”，行内元素还是会为它空出位置，因此行内元素在它同一行的后面显示。至于棕色的块级元素，没有浮动，所以应该在上面行内元素的下一行展示。由于红浮动元素并不占空间，因此和红元素部分重叠展示。
* 第三个例子：两个块级元素同时浮动，到了一行。行内元素因此也在后面展示了。注意第二和第三个行内元素中间有空，这是因为它们中间原有一个块级元素，虽然浮动走了，但是两个行内元素并不紧挨，因此中间会出现空格。
* 第四个例子：棕块级元素浮动。上面的红元素继续独立一行，棕块级元素则出现在了浮动元素之前。
* 第五个例子：在棕块级元素浮动的基础上，增加了浮动的褐块级元素。可以看到横向展示了。
* 第六个例子：在浮动的褐块级元素的后面增加了一个非浮动的紫色块级元素，可以看到如第二个例子一样，紫色元素为上面的恒内元素空出一行，然后与棕色元素部分重叠展示。最后的行内元素则独立一行展示。

通过行内元素和块级元素的对比，我们可知在前一个块级元素浮动后，后面的非浮动块级元素依然会独立一行展示。但是后面的行内元素却紧贴着浮动块级元素同行展示。这也是浮动脱离文档流但没有脱离“文本流”的标志。

```html
<html>
  <body>
    <div class="wrapper">
      <div class="red block"></div>
      <span class="yellow">第1个个个个个个个个个个个个个个个个个个个个个</span
      ><span class="green"
        >第2个个个个个个个个个个个个个个个个个个个个个个个个个个个</span
      >
      <div class="brown block"></div>
      <span class="gray">第3个个个个个个个个个个个个个个个</span
      ><span class="pink">第4个个个个个个个个个个个个个</span>
    </div>
    <div class="wrapper">
      <div class="red block left"></div>
      <span class="yellow"
        >第1个个个个个个个个个个个个个个个个个个个个个个个个</span
      ><span class="green"
        >第2个个个个个个个个个个个个个个个个个个个个个个个个个个个</span
      >
      <div class="brown block"></div>
      <span class="gray">第3个个个个个个个个个个个个个个个</span
      ><span class="pink">第4个个个个个个个个个个个个个</span>
    </div>
    <div class="wrapper">
      <div class="red block left"></div>
      <span class="yellow"
        >第1个个个个个个个个个个个个个个个个个个个个个个个个</span
      ><span class="green"
        >第2个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个</span
      >
      <div class="brown block left"></div>
      <span class="gray">第3个个个个个个个个个个个个个个个</span
      ><span class="pink">第4个个个个个个个个个个个个个</span>
    </div>
    <div class="wrapper">
      <div class="red block"></div>
      <span class="yellow"
        >第1个个个个个个个个个个个个个个个个个个个个个个个个</span
      ><span class="green"
        >第2个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个</span
      >
      <div class="brown block left higher"></div>
      <div class="purple block left"></div>
      <span class="gray">第3个个个个个个个个个个个个个个个个个个个个个个个</span
      ><span class="pink">第4个个个个个个个个个个个个个个个个个个个个个</span>
    </div>
    <div class="wrapper">
      <div class="red block"></div>
      <span class="yellow"
        >第1个个个个个个个个个个个个个个个个个个个个个个个个</span
      ><span class="green"
        >第2个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个</span
      >
      <div class="brown block left"></div>
      <div class="purple block left higher"></div>
      <span class="gray">第3个个个个个个个个个个个个个个个个个个个个个个个</span
      ><span class="pink">第4个个个个个个个个个个个个个个个个个个个个个</span>
    </div>
  </body>
  <style>
    .wrapper {
      border: 1px dotted blue;
      margin-bottom: 40px;
    }
    .block {
      width: 100px;
      height: 40px;
    }
    .higher {
      height: 100px;
    }
  </style>
</html>
```

![图片](/2025/float-20.png)

这里又有几个例子，主要示例了换行和块级元素高度不同的个场景。我们一个一个分析下：

* 第一个例子：块级元素和行内元素间隔放置，没有设置浮动，做对比用。可以看到行内元素正常换行。
* 第二个例子：红块级元素设置浮动。可以看到行内元素在红元素右侧展示，且因为红元素可以容纳两行，因此在右侧分行放置。行内元素的第三行因为空间不够，独立成行。
* 第三个例子：两个块级元素都设置了浮动。与上面行内元素没有换行的场景不同，这次两个元素分成两行浮动了。这是因为浮动元素后面的块级元素太长，导致第一个浮动元素后面没有空间放置第二个浮动元素了，只能新起一行。
* 第四个例子：红块级元素没有浮动。后面行内元素有三行，再后面的两个块级元素都设置了浮动。注意看行内元素的第三行，前面是两个左浮动的块级元素。因此，行内元素的最后一行后面如果有左浮动元素，该浮动元素会跑到这一行的最左边。这与我们讨论行内浮动元素时的规律一致。注意看两个浮动元素的高度不一致，先高后矮。后面的行内元素，先在紫色的块级元素后面一行一行展示，然后又在下面更高的棕色元素后一行一行展示。
* 第五个例子：与上一个例子不一样的是，两个浮动元素先矮后高。右侧的浮动元素并没有到棕色元素下面的空白区域展示，而是一直在右侧浮动。这与我们前面看到的浮动块级元素的规律类似。

### 仅行内元素浮动

```html
<html>
  <body>
    <div class="wrapper">
      <div class="red block"></div>
      <span class="yellow">第1个</span><span class="green">第2个</span>
      <div class="brown block"></div>
      <span class="gray">第3个</span><span class="pink">第4个</span>
    </div>
    <div class="wrapper">
      <div class="red block"></div>
      <span class="yellow left">第1个</span><span class="green">第2个</span>
      <div class="brown block"></div>
      <span class="gray">第3个</span><span class="pink left">第4个</span>
    </div>
    <div class="wrapper">
      <div class="red block"></div>
      <span class="yellow left">第1个</span
      ><span class="green"
        >第2个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个</span
      ><span class="gray">第3个</span><span class="pink left">第4个</span>
      <div class="brown block"></div>
    </div>
    <div class="wrapper">
      <div class="red block"></div>
      <span class="yellow">第1个</span
      ><span class="green left"
        >第2个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个</span
      ><span class="gray">第3个</span><span class="pink left">第4个</span>
      <div class="brown block"></div>
    </div>
  </body>
  <style>
    .wrapper {
      border: 1px dotted blue;
      margin-bottom: 40px;
    }
    .block {
      width: 100px;
      height: 40px;
    }
  </style>
</html>
```

![图片](/2025/float-21.png)

* 第一个例子：块级元素和行内元素间隔放置，没有设置浮动，做对比用。
* 第二个例子：第一个和第四个文本左浮动。可以看到文本元素浮动仅在文本元素所在的行内部进行，不会影响块级元素。
* 第三个例子：所有文本放在一起，且第二个文本超长，第一个和第四个文本左浮动。可以看到由于第二个元素跨行，所以第四个元素跑到文本第二行的最左边。
* 第四个例子：第二个和第四个文本浮动。第二个文本由于超长因此独立两行展示，第四个文本没有侵占第二个文本内的空间。注意我们没有看到棕色块级元素，因为它被浮动元素遮盖了（注意看蓝色边框是留出棕色块级元素位置的）。浮动元素由于脱离文档流不占用空间，因此和下面的非浮动元素遮挡。

在这个场景下，规律与上面纯行内元素的浮动场景一致，因此这里不过多讨论了。另外注意“第四个例子”中，非浮动的文本元素会给浮动的块级元素留出空间（即文本流），但是浮动的文本元素却没有给非浮动的块级元素留出空间。关于这一点我们再看一下明确的对比：

```html
<html>
  <body>
    <div class="wrapper">
      <div class="red block"></div>
      <span class="yellow">第1个个个个个个个个个个</span>
    </div>
    <div class="wrapper">
      <div class="red block left"></div>
      <span class="yellow">第1个个个个个个个个个个</span>
    </div>
    <div class="wrapper">
      <span class="yellow">第1个个个个个个个个个个</span>
      <div class="red block"></div>
    </div>
    <div class="wrapper">
      <span class="yellow left">第1个个个个个个个个个个</span>
      <div class="red block"></div>
    </div>
  </body>
  <style>
    .wrapper {
      border: 1px dotted blue;
      margin-bottom: 40px;
    }
    .block {
      width: 100px;
      height: 40px;
    }
  </style>
</html>
```

![图片](/2025/float-22.png)

* 第一个例子：块级元素在上方，行内元素在下方，未浮动做对比用。
* 第二个例子：块级元素浮动，下方的行内元素到了与块级元素同行的位置，且给块级元素留出了位置。
* 第三个例子：行内元素在上方，块级元素在下方，未浮动做对比用。
* 第四个例子：行内元素浮动，下方的块级元素位置上移。文本元素没有给块级元素留出位置，反而遮挡了下方的块级元素。

### 块级元素与行内元素同时浮动

```html
<html>
  <body>
    <div class="wrapper">
      <div class="red block"></div>
      <span class="yellow">第1个</span><span class="green">第2个</span>
      <div class="brown block"></div>
      <span class="gray">第3个</span><span class="pink">第4个</span>
    </div>
    <div class="wrapper">
      <div class="red block left"></div>
      <span class="yellow left">第1个</span><span class="green">第2个</span>
    </div>
    <div class="wrapper">
      <span class="yellow left">第1个</span><span class="green">第2个</span>
      <div class="red block left"></div>
    </div>
    <div class="wrapper">
      <div class="red block"></div>
      <span class="yellow">第1个</span><span class="green left">第2个</span>
      <div class="brown block left"></div>
      <span class="gray">第3个</span><span class="pink left">第4个</span>
    </div>
    <div class="wrapper">
      <div class="red block"></div>
      <span class="yellow">第1个</span><span class="green left">第2个个个个个个个个个个个个个个个个个</span>
      <div class="brown block left"></div>
      <span class="gray">第3个</span><span class="pink left">第4个</span>
    </div>
    <div class="wrapper">
      <div class="red block"></div>
      <span class="yellow">第1个</span><span class="green left">第2个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个</span>
      <div class="brown block left"></div>
      <span class="gray">第3个</span><span class="pink left">第4个</span>
    </div>
  </body>
  <style>
    .wrapper {
      border: 1px dotted blue;
      margin-bottom: 40px;
    }
    .block {
      width: 100px;
      height: 40px;
    }
  </style>
</html>
```

![图片](/2025/float-23.png)

* 第一个例子：未设置浮动，做对比用。
* 第二个例子：红块级元素与第一个文本元素设置了浮动，可以看到横向顺序排列。
* 第三个例子：红块级元素放到了最后，可以看到依然横向排列，只不过位置发生了变化。
* 第四个例子：棕块级元素，第二和第四个文本元素浮动。可以看到在第二排横向展示，非浮动元素排列在后面。注意第三个文本元素因为和第一个元素的HTML中实际有个块级元素，因此有个空隙。而第一个文本元素虽然和第四个元素的HTML中间也有块级元素，但左侧是浮动区域，因此不展示空隙了。
* 第五个例子：第二个文本元素长度加长。其它元素被挤到右边，发生了换行。注意看此时虽然第四个文本元素浮动，一三文本元素未浮动，但是依然一三元素在上方，第四个元素在下方。
* 第六个例子：我们继续加长第二个文本元素，使其超过一行。可以看到一三文本元素在第二行上方，第四个元素则跑到了最后。注意第二个文本元素在HTML中的位置是比第三个文本元素靠前，但是依然在后面展示。这与前面行内元素的展示逻辑是一样的。

那么如果多个不同的块级元素中间出现的“空白区域”，浮动或者浮动文本元素会不会补齐呢？我们看一下例子：

```html
<html>
  <body>
    <div class="wrapper" style="margin-bottom: 50px">
      <div class="red block1 left"></div>
      <div class="brown block2 left"></div>
      <span class="yellow">第1个</span><span class="green">第2个</span
      ><span class="gray">第3个</span><span class="pink">第4个</span>
    </div>
    <div class="wrapper">
      <div class="red block1 left"></div>
      <div class="brown block2 left"></div>
      <span class="yellow"
        >第1个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个</span
      ><span class="green">第2个</span><span class="gray">第3个</span
      ><span class="pink">第4个</span>
    </div>
    <div class="wrapper" style="margin-bottom: 100px">
      <div class="red block1 left"></div>
      <div class="brown block2 left"></div>
      <span class="yellow left"
        >第1个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个</span
      ><span class="green">第2个</span><span class="gray">第3个</span
      ><span class="pink">第4个</span>
    </div>
    <div class="wrapper">
      <div class="red block1 left"></div>
      <div class="brown block2 left"></div>
      <span class="yellow"
        >第1个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个</span
      ><span class="green left">第2个</span><span class="gray">第3个</span
      ><span class="pink">第4个</span>
    </div>
    <div class="wrapper">
      <span class="yellow left">第1个</span>
      <div class="red block1 left"></div>
      <div class="brown block2 left"></div>
      <span class="green">第2个个个个个个个个个个个个个个个个个个个个个个个个个</span><span class="gray">第3个</span
      ><span class="pink">第4个</span>
    </div>
    <div class="wrapper" style="margin-bottom: 80px">
      <span class="yellow left">第1个</span>
      <div class="red block1 left"></div>
      <div class="brown block2 left"></div>
      <span class="green left">第2个个个个个个个个</span><span class="gray left">第3个</span
      ><span class="pink">第4个</span>
    </div>
    <div class="wrapper" style="margin-bottom: 100px">
      <span class="yellow left">第1个个个个个个个个个个</span>
      <div class="red block1 left"></div>
      <div class="brown block2 left"></div>
      <span class="green left">第2个个个个个个个个</span><span class="gray left">第3个</span
      ><span class="pink">第4个</span>
    </div>
    <div class="wrapper">
      <span class="yellow left">第1个个个个个个个个个个</span>
      <div class="red block1 left"></div>
      <div class="brown block2 left"></div>
      <span class="green left">第2个个个个个个个个</span><span class="gray left">第3个</span
      ><span class="pink">第4个个个个个个个个个个个个个个个个个个</span>
    </div>
  </body>
  <style>
    .wrapper {
      border: 1px dotted blue;
      margin-bottom: 40px;
    }
    .block1 {
      width: 100px;
      height: 20px;
    }
    .block2 {
      width: 200px;
      height: 50px;
    }
  </style>
</html>
```

![图片](/2025/float-24.png)

* 第一个例子：设置了两个浮动的块级元素，左边低，右边高，左边下方留下的空白。这个例子主要做对比用。
* 第二个例子：第一个文本元素长度加长，使得其它文本元素跑到空白下面了。但是没有去补齐空白。
* 第三个例子：第一个文本元素设置浮动，在下面单独一行。可以看到其它文本元素在第一个文本元素上面展示了。
* 第四个例子：文本元素仅第二个设置了浮动，可以看到它位于当前行的最左位置，没有向上补齐。
* 第五个例子：第一个文本元素改成了在块级元素之前，第二个文本元素加长。可以看到依然没有元素补齐空白。
* 第六个例子：在第五个例子的条件下，第二第三个文本元素浮动。可以看到第四个文本元素在右侧上方展示。
* 第七个例子：第一个文本元素加长，导致两个块级元素不能在同一行。
* 第八个例子：第四个文本元素加长，可以看到依然没有补齐空白。

因此，块级浮动元素造成的左侧空白是不能被补齐的，文本元素只能补齐右侧的空白，而且是在非浮动状态下。我们列举几个可以被补齐的例子：

```html
<html>
  <body>
    <div class="wrapper" style="margin-bottom: 70px">
      <span class="yellow">第1个个个个个个个个个个个个个个个个个个个个</span>
      <div class="red block2 left"></div>
      <span class="green left">第2个</span><span class="gray left">第3个</span
      ><span class="pink">第4个</span>
    </div>
    <div class="wrapper" style="margin-bottom: 50px">
      <div class="red block2 left"></div>
      <div class="pink block2 left"></div>
      <div class="purple block2 left"></div>
      <span class="yellow">第1个个</span>
      <span class="green">第2个个个个个</span><span class="gray">第3个</span
      ><span class="pink">第4个</span>
    </div>
    <div class="wrapper" style="margin-bottom: 50px">
      <div class="red block2 left"></div>
      <div class="pink block2 left"></div>
      <div class="purple block2 left"></div>
      <span class="yellow left">第1个个</span>
      <span class="green">第2个个个个个</span><span class="gray">第3个</span
      ><span class="pink">第4个</span>
    </div>
  </body>
  <style>
    .wrapper {
      border: 1px dotted blue;
      margin-bottom: 40px;
    }
    .block1 {
      width: 100px;
      height: 20px;
    }
    .block2 {
      width: 200px;
      height: 50px;
    }
  </style>
</html>
```

![图片](/2025/float-25.png)

* 第一个例子：第一个文本元素与块级元素在两行分别左浮动。第二第三个文本元素左浮动。可以看到第四个文本元素去第一行补齐第一个文本元素右侧的空白，但是左浮动的文本元素却没有。
* 第二个例子：三个块级元素左浮动。右侧的空白由文本元素补齐了。
* 第三个例子：第一个文本元素左浮动。可以看到其它文本元素去补齐右侧，但是浮动的文本元素没有。

## 浮动流中不同高度行内元素

前面列举的元素中，行内元素中文本高度都是相同的，因此一行一行顺序排列。假设行内元素的文本高度不同，现象又会怎样呢？我们可以通过控制字号来实现文本高度的控制。

### 场景举例

```html
<html>
  <body>
    <div class="wrapper">
      <span class="yellow size14">第1个</span
      ><span class="green size35">第2个</span
      ><span class="gray size14">第3个</span
      ><span class="pink size35">第4个</span>
    </div>
    <div class="wrapper">
      <span class="yellow size14 left">第1个</span
      ><span class="green size35">第2个</span
      ><span class="gray size14">第3个</span
      ><span class="pink size35 left">第4个</span>
    </div>
    <div class="wrapper">
      <span class="yellow size14">第1个</span
      ><span class="green size35">第2个</span
      ><span class="gray size14">第3个</span
      ><span class="pink size35">第4个</span
      ><span class="brown size14">第5个个个个个个个个个个个个个个个个个个</span>
    </div>
    <div class="wrapper">
      <span class="yellow size14 left">第1个</span
      ><span class="green size35">第2个</span
      ><span class="gray size14"
        >第3个个个个个个个个个个个个个个个个个个个个个个个个个个个个</span
      ><span class="pink size35 left">第4个</span>
    </div>
    <div class="wrapper">
      <span class="yellow size14 left">第1个</span
      ><span class="green size35 left">第2个</span
      ><span class="gray size14"
        >第3个个个个个个个个个个个个个个个个个个个个个个个个个个个个</span
      ><span class="pink size35 left">第4个</span>
    </div>
  </body>
  <style>
    .wrapper {
      border: 1px dotted blue;
      margin-bottom: 40px;
    }
    .size14 {
      font-size: 14;
    }
    .size35 {
      font-size: 35;
    }
  </style>
</html>
```

![图片](/2025/float-26.png)

* 第一个例子：两种不同高度的文本元素展示，未浮动做对比用。默认垂直对齐是baseline。
* 第二个例子：第一个第四个元素左浮动。看到左浮动的1号元素的“垂直对齐方式”改变了。但实际上并未改变，观察vertical-align还是baseline。这是因为设置后变为了块级元素，是自己跟自己对齐，因此垂直对齐无意义了。
* 第三个例子：最后增加了第五个元素，且长度超过一行，可以看到并没有填充左边的空白，而是把所有元素整体作为一行，它自己跨到第二行展示。
* 第四个例子：第三个元素加长，使其换行，可以看到第四个元素到了最左边浮动。
* 第五个例子：一二四元素都浮动，只有第三个元素非浮动。可以看到非浮动元素在浮动元素右侧换行，没有把左浮动都作为一行处理。

### 右侧换行规律
这里再列举几个右侧换行的例子：

```html
<html>
  <body>
    <div class="wrapper">
      <span class="yellow size14">第1个个个</span
      ><span class="green size35">第2个个个个个个个</span
      ><span class="gray size14"
        >第3个个个个个个个个个个个个个个个个个个个个个个个个个个</span
      >
    </div>
    <div class="wrapper">
      <span class="yellow size14">第1个个个</span
      ><span class="green size35 left">第2个个个个个个个</span
      ><span class="gray size14"
        >第3个个个个个个个个个个个个个个个个个个个个个个个个个个</span
      >
    </div>
    <div class="wrapper">
      <span class="yellow size14 left">第1个个个</span
      ><span class="green size35">第2个个个个个个个</span
      ><span class="gray size14"
        >第3个个个个个个个个个个个个个个个个个个个个个个个个个个</span
      >
    </div>
    <div class="wrapper">
      <span class="yellow size14 left">第1个个个</span
      ><span class="green size35 left">第2个个个个个个个</span
      ><span class="gray size14"
        >第3个个个个个个个个个个个个个个个个个个个个个个个个个个</span
      >
    </div>
    <div class="wrapper">
      <span class="yellow size14 left">第1个个个</span
      ><span class="green size35 left">第2个个个个个个个</span
      ><span class="gray size14">第3个</span
      ><span class="pink size14">第4个个个个个个个个个个个个个</span>
    </div>
    <div class="wrapper">
      <span class="yellow size14 left">第1个个个</span
      ><span class="green size35 left">第2个</span
      ><span class="gray size35">第3个</span
      ><span class="pink size14">第4个个个个个个个个个个个个个个个个个个个个个</span>
    </div>
    <div class="wrapper">
      <span class="yellow size14 left">第1个个个</span
      ><span class="green size35 left">第2个</span
      ><span class="gray size35 left">第3个</span
      ><span class="pink size14">第4个个个个个个个个个个个个个个个个个个个个个</span>
    </div>
  </body>
  <style>
    .wrapper {
      border: 1px dotted blue;
      margin-bottom: 40px;
    }
    .size14 {
      font-size: 14;
    }
    .size35 {
      font-size: 35;
    }
  </style>
</html>
```

![图片](/2025/float-27.png)

* 第一个例子：一三是矮元素，二是高元素，均未设置浮动，做对比用。
* 第二个例子：二元素浮动，一元素被挤到右边。三元素在右侧换行了。
* 第三个例子：一元素浮动，二元素未浮动。这时候三元素没有在右边换行，而是整体换行了。
* 第四个例子：一二元素均浮动，三元素在右侧换行。
* 第五个例子：增加了第四个元素，且三元素变短，四元素在右侧换行了。
* 第六个例子：三元素变高，这时候四元素没有在右侧换行，而是整体换行了。
* 第七个例子：三元素变为左浮动，四元素又在右侧换行了。

从这些例子中，可以看出行内元素在右侧换行的规律：右侧换行的多个元素是一个整体，这个整体的左边的元素超过右边这个整体的行高，且是浮动元素。即假设这个换行元素左侧是非浮动元素，也可以换行，只要把右侧的非浮动行内元素作为整体来换行即可。但如果些非浮动元素第一行的行高（取每个元素最高值）达到或者超过左侧浮动元素的行高，则不在右侧换行，而是和浮动元素作为一个整体换行。

## 浮动流中的可替换元素与行内块元素
### 元素介绍
可替换元素是一类特殊的HTML元素，它内容的展现效果是由内部内容控制的，比如iframe和img元素。

行内块元素是同时具有行内元素和块级元素部分特性的元素，比如input和button元素。可以通过设置`display: inlin-block`来指定为行内块元素。

可替换元素和行内元素类似，在默认情况下它们都像行内元素一样，在同一行横向展示。但是也与块级元素类似，可以指定元素的宽高。其它特性在这里就不描述了。我们举例看一下这两种元素的展示效果：

```html
<html>
  <body>
    <div>
      个个个个<img class="common" src="./1.jpg" />个个个个<button class="common">按钮</button>个个个个<button class="common vertical-top">按钮</button>个个个个<input class="common" />个个个个<div class="common yellow inline-block"></div>个个个个
      </div>
  </body>
  <style>
    .common {
      width: 100px;
      height: 100px;
    }
    .inline-block {
      display: inline-block;
    }
    .vertical-top {
      vertical-align: top;
    }
  </style>
</html>
```

![图片](/2025/float-28.png)

上面的例子展示了在文本中的可替换元素与行内块元素的表现。可以看到它们都是行内元素，但可以设置宽度与高度。同时它们在行中的纵向位置表现不一样：
* 第一个图片元素和最后一个手动设置inline-block的黄元素，默认和文字的底端对齐。
* 第二个按钮和第四个input元素，因为其中有文字，所以和文字居中对齐。
* 第三个按钮，我们手动设置了`vertical-align: top`，于是和行内元素的最高处对齐。

### 浮动表现
看完了默认表现，我们再看一下它们在浮动流中的表现。

```html
<html>
  <body>
    <div class="wrapper" style="margin-bottom: 100px">
      <span class="yellow">第1个</span><span class="green">第2个</span
      ><img class="common left" src="./1.jpg" /><span class="gray">第3个</span
      ><span class="pink">第4个</span>
    </div>
    <div class="wrapper" style="margin-bottom: 100px">
      <span class="yellow">第1个个个个个个个个个</span
      ><span class="green">第2个个个个个个个个个个</span
      ><img class="common left" src="./1.jpg" /><span class="gray">第3个</span
      ><span class="pink">第4个</span>
    </div>
    <div class="wrapper">
      <span class="yellow">第1个</span
      ><span class="green">第2个</span
      ><img class="common" src="./1.jpg" /><span class="gray left">第3个</span
      ><span class="pink">第4个</span>
    </div>
    <div class="wrapper" style="margin-bottom: 100px">
      <span class="yellow">第1个</span><span class="green">第2个</span
      ><input class="common left" /><span class="gray">第3个</span
      ><span class="pink">第4个</span>
    </div>
    <div class="wrapper" style="margin-bottom: 100px">
      <span class="yellow">第1个个个个个个个个个</span
      ><span class="green">第2个个个个个个个个个个</span
      ><input class="common left" /><span class="gray">第3个</span
      ><span class="pink">第4个</span>
    </div>
    <div class="wrapper">
      <span class="yellow">第1个</span
      ><span class="green">第2个</span
      ><input class="common" /><span class="gray left">第3个</span
      ><span class="pink">第4个</span>
    </div>
    <div class="wrapper" style="margin-bottom: 100px">
      <span class="yellow">第1个</span><span class="green">第2个</span
      ><div class="common yellow inline-block left"></div><span class="gray">第3个</span
      ><span class="pink">第4个</span>
    </div>
    <div class="wrapper" style="margin-bottom: 100px">
      <span class="yellow">第1个个个个个个个个个</span
      ><span class="green">第2个个个个个个个个个个</span
      ><div class="common yellow inline-block left"></div><span class="gray">第3个</span
      ><span class="pink">第4个</span>
    </div>
    <div class="wrapper">
      <span class="yellow">第1个</span
      ><span class="green">第2个</span
      ><div class="common yellow inline-block"></div><span class="gray left">第3个</span
      ><span class="pink">第4个</span>
    </div>
  </body>
  <style>
    .common {
      width: 100px;
      height: 100px;
    }
    .inline-block {
      display: inline-block;
    }
    .vertical-top {
      vertical-align: top;
    }
    .wrapper {
      border: 1px dotted blue;
      margin-bottom: 40px;
    }
  </style>
</html>
```

![图片](/2025/float-29.png)

例子比较长，但是没什么难点，可替换元素与行内块元素就像一个大块头的行内元素，具体表现和前面的部分场景是类似的。

* 第一个例子：img元素浮动。
* 第二个例子：img元素浮动的基础上，文本长度增加，右侧出现换行。
* 第三个例子：img元素不浮动，单独一个文本元素浮动，虽然看起来纵向位置差较多，但实际上是在一行的。
* 第四个例子：与第一个例子一样，但浮动元素变成了input，表现一致。
* 第五个例子：与第二个例子一样，但浮动元素变成了input，表现一致。
* 第六个例子：与第三个例子一样，但元素变成了input，除了垂直对齐外表现一致。
* 第七个例子：与第一个例子一样，但浮动元素变成了行内块的div，表现一致。
* 第八个例子：与第二个例子一样，但浮动元素变成了行内块的div，表现一致。
* 第九个例子：与第三个例子一样，但元素变成了行内块的div，表现一致。

## 元素内部包含行内元素
块级元素内部可以包含行内元素，一些行内块元素内部也可以包含行内元素，那么包含行内元素时，浮动的表现又如何呢？

### 块级元素包含行内元素
```html
<html>
  <body>
    <div class="wrapper">
      <span class="yellow">第1个</span><span class="green">第2个</span>
      <div class="orange">块级元素1</div>
      <span class="gray">第3个</span><span class="pink">第4个</span>
    </div>
    <div class="wrapper">
      <span class="yellow">第1个</span><span class="green">第2个</span>
      <div class="orange left">块级元素1</div>
      <span class="gray">第3个</span><span class="pink">第4个</span>
    </div>
    <div class="wrapper">
      <span class="yellow"
        >第1个个个个个个个个个个个个个个个个个个个个个个个</span
      ><span class="green">第2个</span>
      <div class="orange left">块级元素1</div>
      <span class="gray">第3个</span><span class="pink">第4个</span>
    </div>
    <div class="wrapper">
      <span class="yellow">第1个</span><span class="green">第2个</span>
      <div class="orange left">
        块级元素1个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个
      </div>
      <span class="gray">第3个</span><span class="pink">第4个</span>
    </div>
  </body>
  <style>
    .wrapper {
      border: 1px dotted blue;
      margin-bottom: 40px;
    }
  </style>
</html>
```
![图片](/2025/float-30.png)

我们在一个div内部放置了行内元素，没有给这个div设置宽高。

* 第一个例子：div元素未浮动，独占一整行，且高度由文本内容撑开。
* 第二个例子：div元素设置浮动，元素实际宽高都由文本内容撑开。
* 第三个例子：行内元素超长，浮动的div被挤到第二行。
* 第四个例子：浮动的div超长，元素在第二行展示且独占两整行。

上面列举的例子看起来很常规，和前面正常块级元素的表现基本一致。下面我们试一下，当块级元素设置宽高，但不足以容纳其中内容时的表现。

```html
<html>
  <body>
    <div class="wrapper">
      <div class="orange common">块级元素1个个个个个个个个个</div>
    </div>
    <div class="wrapper">
      <span class="yellow">第1个</span><span class="green">第2个</span>
      <div class="orange common">块级元素1个个个个个个个个个</div>
      <span class="gray">第3个</span><span class="pink">第4个</span>
    </div>
    <div class="wrapper">
      <span class="yellow">第1个</span><span class="green">第2个</span>
      <div class="orange left common">块级元素1个个个个个个个个个</div>
      <span class="gray">第3个</span><span class="pink">第4个</span>
    </div>
    <div class="wrapper">
      <span class="yellow"
        >第1个个个个个个个个个个个个个个个个个个个个个个个</span
      ><span class="green">第2个</span>
      <div class="orange left common">块级元素1个个个个个个个个个</div>
      <span class="gray">第3个</span><span class="pink">第4个</span>
    </div>
    <div class="wrapper">
      <span class="yellow">第1个</span><span class="green">第2个</span>
      <div class="orange left common">块级元素1个个个个个个个个个</div>
      <span class="gray">第3个个个个个个个个个个个个个个个个个个个个个</span
      ><span class="pink">第4个个个个个个个个个个个个个个个个个个个个个个个个个个</span>
    </div>
  </body>
  <style>
    .common {
      width: 100px;
      height: 40px;
    }
    .wrapper {
      border: 1px dotted blue;
      margin-bottom: 80px;
    }
  </style>
</html>
```

![图片](/2025/float-31.png)

* 第一个例子：单独列举了div元素的宽高不能容纳内容的例子。橘黄色背景的为div实际占用空间，文本内容超出展示了。
* 第二个例子：将div元素放到行内元素中，可以看到后面的行内元素覆盖了超出的块级元素文本。
* 第三个例子：div元素设置浮动，超出的文本元素依旧。
* 第四个例子：前面的行内元素超长，浮动的div被挤到第二行。
* 第五个例子：后面的行内元素超长，可以看到依旧覆盖了div中超出的文本元素。

### 行内块元素包含行内元素

```html
<html>
  <body>
    <div class="wrapper">
      <span class="yellow">第1个</span><span class="green">第2个</span>
      <div class="orange inline-block">块级元素1</div>
      <span class="gray">第3个</span><span class="pink">第4个</span>
    </div>
    <div class="wrapper">
      <span class="yellow">第1个</span><span class="green">第2个</span>
      <div class="orange left inline-block">块级元素1</div>
      <span class="gray">第3个</span><span class="pink">第4个</span>
    </div>
    <div class="wrapper">
      <span class="yellow"
        >第1个个个个个个个个个个个个个个个个个个个个个个个</span
      ><span class="green">第2个</span>
      <div class="orange left inline-block">块级元素1</div>
      <span class="gray">第3个</span><span class="pink">第4个</span>
    </div>
    <div class="wrapper">
      <span class="yellow">第1个</span><span class="green">第2个</span>
      <div class="orange left inline-block">
        块级元素1个个个个个个个个个个个个个个个个个个个个个个个个个个个个个个
      </div>
      <span class="gray">第3个</span><span class="pink">第4个</span>
    </div>
  </body>
  <style>
    .wrapper {
      border: 1px dotted blue;
      margin-bottom: 40px;
    }
    .inline-block {
      display: inline-block;
    }
  </style>
</html>
```

![图片](/2025/float-32.png)

可以看到，除了第一个未浮动的例子行内块元素和文本元素一行之外，其它例子和块级元素一摸一样，因此这里不再赘述了。下面再来看一下设置宽高，但不足以容纳其中内容时的表现。

```html
<html>
  <body>
    <body>
      <div class="wrapper">
        <div class="orange common">块级元素1个个个个个个个个个</div>
      </div>
      <div class="wrapper">
        <span class="yellow">第1个</span><span class="green">第2个</span>
        <div class="orange common">块级元素1个个个个个个个个个</div>
        <span class="gray">第3个</span><span class="pink">第4个</span>
      </div>
      <div class="wrapper">
        <span class="yellow">第1个</span><span class="green">第2个</span>
        <div class="orange left common">块级元素1个个个个个个个个个</div>
        <span class="gray">第3个</span><span class="pink">第4个</span>
      </div>
      <div class="wrapper">
        <span class="yellow"
          >第1个个个个个个个个个个个个个个个个个个个个个个个</span
        ><span class="green">第2个</span>
        <div class="orange left common">块级元素1个个个个个个个个个</div>
        <span class="gray">第3个</span><span class="pink">第4个</span>
      </div>
      <div class="wrapper">
        <span class="yellow">第1个</span><span class="green">第2个</span>
        <div class="orange left common">块级元素1个个个个个个个个个</div>
        <span class="gray">第3个个个个个个个个个个个个个个个个个个个个个</span
        ><span class="pink">第4个个个个个个个个个个个个个个个个个个个个个个个个个个</span>
      </div>
      <div class="wrapper">
        <span class="yellow">第1个</span><span class="green">第2个</span>
        <div class="orange common vertical-top">块级元素1个个个个个个个个个</div>
        <span class="gray">第3个</span><span class="pink">第4个</span>
      </div>
  </body>
  <style>
    .common {
      width: 100px;
      height: 40px;
      display: inline-block;
    }
    .wrapper {
      border: 1px dotted blue;
      margin-bottom: 80px;
    }
  </style>
</html>
```

![图片](/2025/float-33.png)

这里只有第二个例子与上面块级元素不一样。虽然行内块元素中的文本超过了宽高，但第二个例子（也只有这个例子）为其留出了位置。如果我们设置div元素`vertical-align: top`，（看第六个例子），则超过的区域又没有被父级包裹。猜测应该是垂直对齐通过作用于行内元素，影响了父元素的包裹区域大小。

## clear属性清除浮动
在CSS中还有个clear属性，用于清除浮动，取值有：none、left、right、both，对应不清除，清除左边，清除右边，左右都清除。虽然看起来叫做“clear”、“清除浮动”，但实际上不能起到“清除”的作用，只能说是“避开”，而且应用于行内元素无效。

### clear用于块级元素
看一下clear属性在块级元素上的表现，也通过这些例子了解clear属性的作用。首先看一下clear作用于浮动元素上的例子。

```html
<html>
  <body>
    <body>
      <div class="wrapper">
        <div class="orange common right"></div>
        <span class="yellow">第1个</span><span class="green">第2个</span>
        <div class="teal common left"></div>
        <span class="gray">第3个</span><span class="pink">第4个</span>
        <div class="purple common left"></div>
      </div>
      <div class="wrapper">
        <div class="orange common right"></div>
        <span class="yellow">第1个</span><span class="green">第2个</span>
        <div class="teal common left"></div>
        <span class="gray">第3个</span><span class="pink">第4个</span>
        <div class="purple common left clear-left"></div>
      </div>
      <div class="wrapper">
        <div class="orange common right"></div>
        <span class="yellow">第1个</span><span class="green">第2个</span>
        <div class="teal common left clear-left"></div>
        <span class="gray">第3个</span><span class="pink">第4个</span>
        <div class="purple common left"></div>
      </div>
      <div class="wrapper">
        <div class="orange common right"></div>
        <span class="yellow">第1个</span><span class="green">第2个</span>
        <div class="teal common left clear-right"></div>
        <span class="gray">第3个</span><span class="pink">第4个</span>
        <div class="purple common left"></div>
      </div>
      <div class="wrapper">
        <div class="orange common right"></div>
        <span class="yellow">第1个</span><span class="green">第2个</span>
        <div class="teal common left"></div>
        <span class="gray">第3个</span><span class="pink">第4个</span>
        <div class="purple common left clear-right"></div>
      </div>
  </body>
  <style>
    .common {
      width: 100px;
      height: 40px;
    }
    .wrapper {
      border: 1px dotted blue;
      margin-bottom: 80px;
    }
  </style>
</html>
```

![图片](/2025/float-34.png)

* 第一个例子：三个块级元素，两个左浮动，一个右浮动，未设置clear，做对比用。
* 第二个例子：紫元素clear:left，因为前面有一个左浮动元素，因此避开到第二行展示。
* 第三个例子：青元素clear:left，但是前面并没有左浮动元素了，因此无变化。注意clear并不会清除自己身上的浮动，也并不会清除其它元素上的浮动。
* 第四个例子：青元素clear:right。它的前面有一个右浮动元素，因此避开到第二行展示。后面的左浮动元素跟着也到了第二行展示。
* 第五个例子：紫元素clear:right。它的前面有一个右浮动元素，因此避开到第二行展示。

从上面几个例子可以看到，clear并不会清除自身的浮动属性，也更不会影响和清除其它浮动元素的属性。它仅仅是通过改变自身的位置，避开前面元素的浮动行，另起一行展示而已。

```html
<html>
  <body>
    <body>
      <div class="wrapper">
        <div class="red common left clear-right"></div>
        <div class="yellow common left"></div>
        <div class="green common left"></div>
        <div class="blue common right"></div>
      </div>
      <div class="wrapper" style="margin-bottom: 120px">
        <div class="blue common right"></div>
        <div class="red common left clear-right"></div>
        <div class="yellow common left"></div>
        <div class="green common left"></div>
      </div>
      <div class="wrapper">
        <div class="red common left"></div>
        <div class="yellow common left clear-right"></div>
        <div class="green common left"></div>
      </div>
      <div class="wrapper" style="margin-bottom: 120px">
        <div class="red common left"></div>
        <div class="yellow common left clear-left"></div>
        <div class="green common left"></div>
      </div>
      <div class="wrapper">
        <div class="red common left"></div>
        <div class="yellow common left clear-both"></div>
        <div class="green common left"></div>
      </div>
  </body>
  <style>
    .common {
      width: 100px;
      height: 40px;
    }
    .wrapper {
      border: 1px dotted blue;
      margin-bottom: 80px;
    }
  </style>
</html>
```

![图片](/2025/float-35.png)

* 第一个例子：三个元素左浮动，一个元素右浮动。第一个左浮动元素设置clear:right，但是并无效果。因为右浮动元素在HTML中的位置在后面，因此无法影响到。
* 第二个例子：右浮动元素在HTML中的位置提到前面，这时候左浮动元素设置clear:right，就有效果了。
* 第三个例子：只有三个左浮动元素，中间元素设置了clear:right，效果和未设置一样。因为中间元素的HTML位置中的前面并没有右浮动元素。
* 第四个例子：三个左浮动元素，中间元素设置了clear:left，第二个元素和它后面的浮动元素被移动到第二行展示。
* 第五个例子：中间元素设置了clear:both，相当于第三个和第四个例子的结合。

通过上面的例子，我们可以看到，clear只能判断HTML中位置处于前面的元素是否有左右浮动。我们再看一下clear应用于非浮动元素的例子。

```html
<html>
  <body>
    <body>
      <div class="wrapper">
        <div class="red common left"></div>
        <div class="yellow common left"></div>
        <div class="green common left"></div>
        <div class="blue commonHeight"></div>
      </div>
      <div class="wrapper">
        <div class="red common left"></div>
        <div class="yellow common left"></div>
        <div class="green common left"></div>
        <div class="blue commonHeight clear-left"></div>
      </div>
      <div class="wrapper">
        <div class="red common left"></div>
        <div class="yellow common left"></div>
        <div class="green commonHeight left"></div>
        <div class="blue commonHeight"></div>
      </div>
      <div class="wrapper">
        <div class="red common left"></div>
        <div class="yellow common left"></div>
        <div class="green commonHeight left"></div>
        <div class="blue commonHeight clear-left"></div>
      </div>
      <div class="wrapper">
        <div class="red common left"></div>
        <div class="yellow commonHeight left"></div>
        <div class="green common left"></div>
        <div class="blue commonHeight clear-left"></div>
      </div>
      <div class="wrapper">
        <div class="red common left"></div>
        <div class="yellow commonHeight right"></div>
        <div class="green common left"></div>
        <div class="blue commonHeight clear-left"></div>
      </div>
      <div class="wrapper">
        <div class="red common left"></div>
        <div class="yellow commonHeight right"></div>
        <div class="green common left"></div>
        <div class="blue commonHeight clear-right"></div>
      </div>
  </body>
  <style>
    .common {
      width: 100px;
      height: 40px;
    }
    .commonHeight {
      width: 100px;
      height: 60px;
    }
    .wrapper {
      border: 1px dotted blue;
      margin-bottom: 40px;
    }
  </style>
</html>
```

![图片](/2025/float-36.png)

* 第一个例子：前三个元素左浮动，第四个更高的蓝元素不浮动，因为前面浮动元素不占位置，因此重叠展示。
* 第二个例子：第四个更高的蓝元素设置了clear:left，可以看到蓝元素靠下展示，没有和浮动元素重叠。
* 第三个例子：未设置clear，第三个浮动元素高度提高，做对比用。
* 第四个例子：第四个蓝元素设置了clear:left，由于第三个浮动是高元素，因此蓝元素也避开了这部分高度。
* 第五个例子：换到了第二个浮动元素是高元素，四个蓝元素位置不变。
* 第六个例子：第二个浮动元素变为了右浮动。因为第四个蓝元素是clear:left，因此没有空出右浮动元素高的这部分区域。
* 第七个例子：第四个蓝元素设置为clear:right，可以看到有空出右浮动元素高的这部分区域。

通过上面的例子可以看到，clear属性也能作用于非浮动元素，而且效果类似，都使得被设置的元素避开前面的浮动元素。

### clear用于行内元素

```html
<html>
  <body>
    <body>
      <div class="wrapper">
        <span class="red">第1个</span><span class="yellow right">第2个</span
          ><span class="green">第3个</span><span class="blue left">第4个</span
          ><span class="gray">第5个</span><span class="pink left">第6个</span
          ><span class="brown left">第7个</span>
      </div>
      <div class="wrapper">
        <span class="red">第1个</span><span class="yellow right">第2个</span
          ><span class="green">第3个</span><span class="blue left">第4个</span
          ><span class="gray">第5个</span><span class="pink left clear-left">第6个</span
          ><span class="brown left">第7个</span>
      </div>
      <div class="wrapper">
        <span class="red">第1个</span><span class="yellow right">第2个</span
          ><span class="green">第3个</span><span class="blue left">第4个</span
          ><span class="gray">第5个</span><span class="pink left clear-right">第6个</span
          ><span class="brown left">第7个</span>
      </div>
      <div class="wrapper">
        <span class="red">第1个</span><span class="yellow right">第2个</span
          ><span class="green">第3个</span><span class="blue left">第4个</span
          ><span class="gray clear-both">第5个</span><span class="pink left">第6个</span
          ><span class="brown left">第7个</span>
      </div>
  </body>
  <style>
    .wrapper {
      border: 1px dotted blue;
      margin-bottom: 40px;
    }
  </style>
</html>
```

![图片](/2025/float-37.png)

上面的例子展示了行内元素clear的场景，我们具体分析一下：

* 第一个例子：第四个第六个第七个元素左浮动，第二个元素右浮动，做对比用。
* 第二个例子：第六个元素设置了clear:left，因此避开到第二行展示。后面的左浮动第七个元素跟随到了第二行。
* 第三个例子：第六个元素设置了clear:right，因此避开到第二行展示。后面的左浮动第七个元素跟随到了第二行。
* 第四个例子：第五个非浮动元素设置了clear:both，现象与不设置一样无变化。

从上面的例子可以看到，对于行内元素来说，对浮动元素设置clear有效，对非浮动元素设置无效。但这背后的原因是行内元素浮动后，display属性变化，会变为块级元素，因此设置有效。综合来看，clear属性对于行内元素的设置是无效的。

```html
<html>
  <body>
    <body>
      <div class="wrapper">
        <span class="red">第1个</span><button class="common left">按钮1</button><span class="yellow">第2个</span
          ><button class="common right">按钮2</button><span class="green">第3个</span><button class="common left"
          >按钮3</button><span class="blue">第4个</span
          >
      </div>
      <div class="wrapper" style="margin-bottom: 100px">
        <span class="red">第1个</span><button class="common left">按钮1</button><span class="yellow">第2个</span
          ><button class="common right clear-left">按钮2</button><span class="green">第3个</span><button class="common left"
          >按钮3</button><span class="blue">第4个</span
          >
      </div>
      <div class="wrapper">
        <span class="red">第1个</span><button class="common left">按钮1</button><span class="yellow">第2个</span
          ><button class="common right">按钮2</button><span class="green">第3个</span><button class="common"
          >按钮3</button><span class="blue">第4个</span
          >
      </div>
      <div class="wrapper">
        <span class="red">第1个</span><button class="common left">按钮1</button><span class="yellow">第2个</span
          ><button class="common right">按钮2</button><span class="green">第3个</span><button class="common clear-left"
          >按钮3</button><span class="blue">第4个</span
          >
      </div>
      <div class="wrapper">
        <span class="red">第1个</span><button class="common left">按钮1</button><span class="yellow">第2个</span
          ><button class="common right">按钮2</button><span class="green">第3个</span><button class="common"
          >按钮3</button><span class="blue clear-left">第4个</span
          >
      </div>
      <div class="wrapper">
        <div class="common left pink"></div>
        <span class="red">第1个</span><button class="common left">按钮1</button><span class="yellow">第2个</span
          ><button class="common clear-left">按钮2</button><span class="green clear-left">第3个</span>
      </div>
  </body>
  <style>
    .common {
      width: 80px;
      height: 40px;
    }
    .wrapper {
      border: 1px dotted blue;
      margin-bottom: 40px;
    }
  </style>
</html>
```

![图片](/2025/float-38.png)

这些例子展示了行内元素，行内块元素，块级元素组合使用clear时的场景，可以发现行内元素与行内块元素对于clear的规律是一致的：

* 第一个例子：三个按钮，两个左浮动，一个右浮动，作对比用。
* 第二个例子：按钮2设置clear:left，按钮2和3避开到第二行展示。
* 第三个例子：按钮1和2设置浮动，按钮3未设置浮动，做对比用。
* 第四个例子：按钮3未浮动，设置clear:left，没有效果。
* 第五个例子：文本4未浮动，设置clear:left，没有效果。
* 第六个例子：最前面增加了一个左浮动块级元素，按钮2和文本3均未浮动，设置clear:left，没有效果。

## 浮动的父元素塌陷与解决方案
### 问题描述
由于浮动元素不占空间，父元素可能无法把其中的浮动元素完全包裹在内。这时候浮动元素会覆盖后面其它元素的展示，这种特点会对我们造成困扰。而这些解决父元素塌陷问题的方法， 被叫做clearfix。

```html
<html>
  <body>
    <body>
      <div class="wrapper">
        <img src="./1.jpg" class="common left">
        <span>第一段文字。第一段文字。第一段文字。第一段文字。第一段文字。第一段文字。第一段文字。第一段文字。第一段文字。第一段文字。</span>
      </div>
      <div class="wrapper">
        <div class="common2 red"></div>
        第二段文字。第二段文字。第二段文字。第二段文字。第二段文字。第二段文字。第二段文字。第二段文字。
      </div>
  </body>
  <style>
    .common {
      width: 100px;
      height: 100px;
    }
    .common2 {
      width: 120px;
      height: 20px;
    }
    .wrapper {
      border: 1px dotted blue;
    }
  </style>
</html>
```

![图片](/2025/float-39.png)

在上面的例子中，第一段有一个浮动的大图片，它的高度超过了第一段的父元素的高度，侵占了第二段的部分空间，把第二段中红色div的大部分区域都挡住了。这就是浮动的父元素塌陷问题。

下面会介绍很多种父元素塌陷问题的解决方案，这些解决方案不仅能应用到父元素，也能应用到后面的的元素上。

### 方法：父元素设置固定高度
最简单的方法就是给父元素设置一个固定的高度，或者固定的底部padding，margin等高度，即可以包裹进浮动元素。

```html
<html>
  <body>
    <body>
      <div class="wrapper" style="height: 120px">
        <img src="./1.jpg" class="common left">
        <span>第一段文字。第一段文字。第一段文字。第一段文字。第一段文字。</span>
      </div>
      <div class="wrapper">
        <div class="common2 red"></div>
      </div>
  </body>
  <style>
    .common {
      width: 100px;
      height: 100px;
    }
    .common2 {
      width: 120px;
      height: 20px;
    }
    .wrapper {
      border: 1px dotted blue;
    }
  </style>
</html>
```

![图片](/2025/float-40.png)

在上面的例子中，我们给父级div设置了固定高度，下面的内容就可以露出来了。但这种方法太死板，不能根据浮动内容的高度自适应。

### 方法：clear和空块级元素
前面我们聊过，使用css中的clear属性，可以让块级元素避开浮动元素，在后面新起一行展示。利用这个特性，可以做到自适应浮动内容的高度。

```html
<html>
  <body>
    <body>
      <div class="wrapper">
        <img src="./1.jpg" class="common left">
        <span>第一段文字。第一段文字。第一段文字。第一段文字。第一段文字。</span>
        <div class="clear-both"></div>
      </div>
      <div class="wrapper">
        <div class="common2 red"></div>
      </div>
  </body>
  <style>
    .common {
      width: 100px;
      height: 100px;
    }
    .common2 {
      width: 120px;
      height: 20px;
    }
    .wrapper {
      border: 1px dotted blue;
    }
  </style>
</html>
```

![图片](/2025/float-41.png)

在父元素的最后，添加一个空的块级元素，设置clear，即可让父元素的区域包含这个空块级元素以及上面的浮动元素。由于空块级元素并不在视觉上占空间，因此页面展示中看不出它的存在。

### 方法：clear和after伪类
有些人会觉得在html中增加空元素不太美观，这时候还可以使用after伪类来代替空块级元素。

```html
<html>
  <body>
    <body>
      <div class="wrapper after">
        <img src="./1.jpg" class="common left">
        <span>第一段文字。第一段文字。第一段文字。第一段文字。第一段文字。</span>
      </div>
      <div class="wrapper">
        <div class="common2 red"></div>
      </div>
  </body>
  <style>
    .after::after {
      content: "";
      display: block;
      clear: both;
    }
    .common {
      width: 100px;
      height: 100px;
    }
    .common2 {
      width: 120px;
      height: 20px;
    }
    .wrapper {
      border: 1px dotted blue;
    }
  </style>
</html>
```

![图片](/2025/float-41.png)

使用after伪类在父元素的最后添加一个空元素，设置为块级且clear，这时候就能起到和html中设置空块级元素一样的效果了。

### 方法：使用BFC(overflow)
区块格式化上下文（Block Formatting Context，BFC）是一个以特定方式渲染的区域，在这里我们并不详细介绍BFC的特点，但是BFC可以包含内部浮动与排除外部浮动，解决浮动的父元素塌陷问题。

![图片](/2025/float-42.png)

很多种方式可以创建一个BFC，这里我们以比较常用的overflow为例。

```html
<html>
  <body>
    <body>
      <div class="wrapper overflow">
        <img src="./1.jpg" class="common left">
        <span>第一段文字。第一段文字。第一段文字。第一段文字。第一段文字。</span>
      </div>
      <div class="wrapper">
        <div class="common2 red"></div>
      </div>
  </body>
  <style>
    .overflow {
      overflow: auto;
    }
    .common {
      width: 100px;
      height: 100px;
    }
    .common2 {
      width: 120px;
      height: 20px;
    }
    .wrapper {
      border: 1px dotted blue;
    }
  </style>
</html>
```

![图片](/2025/float-41.png)

可以看到，设置overflow这个看起来没什么关系属性之后，形成了一个BFC区块，区块中包含了所有浮动元素。

### 方法：使用BFC(flow-root)
使用overflow虽然好用，但是强制指定了overflow属性。有没有无副作用创建BFC的方式呢？那就是flow-root。设置display:flow-root可以创建一个BFC区块。通过下面的例子可以看到，效果和verflow一样。

```html
<html>
  <body>
    <body>
      <div class="wrapper flowroot">
        <img src="./1.jpg" class="common left">
        <span>第一段文字。第一段文字。第一段文字。第一段文字。第一段文字。</span>
      </div>
      <div class="wrapper">
        <div class="common2 red"></div>
      </div>
  </body>
  <style>
    .flowroot {
      display: flow-root;
    }
    .common {
      width: 100px;
      height: 100px;
    }
    .common2 {
      width: 120px;
      height: 20px;
    }
    .wrapper {
      border: 1px dotted blue;
    }
  </style>
</html>
```

![图片](/2025/float-41.png)

## 定位流
所谓定位流实际上就是CSS中的position属性。position定位属性在CSS中被经常使用，但定位流这个概念并不常见，一般只有在与浮动做对比的时候才提到。而且定位是针对于单个元素的，且方式有很多种，因此用一种“定位流”来描述我感觉并不精确。常用的定位方式有如下几种：

* 静态定位 static
* 相对定位 relative
* 绝对定位 absolute
* 固定定位 fixed
* 粘性定位 sticky

下面分别简单介绍一下这几种定位方式。

### 静态定位 static
静态定位即正常的布局模式，遵守正常的文档流规则，也是position属性的默认值。由于无变化，这里就不提供例子了。

### 相对定位 relative
相对定位模式下，元素先按照正常的定位


### 绝对定位 absolute

### 固定定位 fixed

### 粘性定位 sticky



## 总结



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
- 【CSS浮动属性】别再纠结布局了！一文带你玩转CSS Float属性\
  https://juejin.cn/post/7351321081562857522
- MDN 可替换元素\
  https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_images/Replaced_element_properties
- MDN clear\
  https://developer.mozilla.org/zh-CN/docs/Web/CSS/clear
- MDN 区块格式化上下文 BFC\
  https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_display/Block_formatting_context
- MDN position\
  https://developer.mozilla.org/zh-CN/docs/Web/CSS/position
