# CSS中的BFC，到底有什么作用？(未完成 标题待完善)

## 什么是BFC
BFC的全程为Block Formatting Context，含义是块级格式化上下文。在MDN中，对它的解释为：

> BFC是Web页面的可视CSS渲染的一部分，是块级盒子的布局过程发生的区域，也是浮动元素与其他元素交互的区域。

第一次了解BFC的同学对这个解释肯定一头雾水，这个BFC的解释好像说了什么，又好像什么都没说。简单来说，BFC实际上是一种作用于元素上的模式，如果符合出现的BFC出现的条件，就会成为一个BFC区域，对应的元素样式处理就符合BFC模式的特点。下面先看一下BFC出现的条件(图源MDN)：

![图片](/2025/bfc-1.png)

可以看到，符合BFC出现的条件有很多。注意看，文档的根元素`<html>`是一个BFC区域。其它大部分都是明确的修改CSS属性以达到某些样式效果，变为BFC区域只不过是它们的副作用。只有一个无其它作用，专门设置为BFC区域的条件：`display: flow-root`。本文的例子中主要使用这个条件来设置BFC区域。

成为BFC区域后，这个区域内的元素不会受到外部元素的影响，内部元素也不会影响外部元素的布局。特点列举如下：

* BFC区域会包含内部的浮动元素
* BFC区域会避开外部的浮动元素
* BFC区域与外部没有margin折叠效果 todo

其中与浮动有关的特点在之前我写“[聊一下CSS中的标准流，浮动流，文本流，文档流](https://jzplp.github.io/2025/css-float.html)”文章的时候讲过，但当时我们的关注点在于浮动，这次我们还是重新描述一下，但重点放在BFC本身。

## 包含内部浮动元素
浮动指的是设置了CSS中float属性为left或者right的元素。设置了浮动之后，元素本身便脱离了文档流，父元素计算空间时也不会包含内部的浮动元素。这样会造成浮动的父元素塌陷问题。但设置了BFC之后，父元素就会包含内部的浮动元素。

```html
<html>
  <body>
    <body>
      <div class="wrapper">
        <div class="parent">
          <div class="child"></div>
        </div>
      </div>
      <div class="wrapper">
        <div class="parent bfc">
          <div class="child"></div>
        </div>
      </div>
  </body>
  <style>
    .wrapper {
      height: 150px;
      width: 100%;
    }
    .parent {
      border: 1px solid blue;
    }
    .child {
      float: left;
      width: 100px;
      height: 100px;
      background: yellow;
    }
    .bfc {
      display: flow-root;
    }
  </style>
</html>
```

![图片](/2025/bfc-2.png)

* 第一个例子是非BFC，可以看到父元素已经塌陷到只有一条线了，内部浮动的黄元素位置在父元素之外。
* 第一个例子在父元素设置了BFC，父元素包裹住了内部浮动的黄元素，不会造成父元素塌陷问题。

BFC包含内部的浮动元素的特点仅适用于符合BFC条件的那个元素，在BFC元素内部的元素则没有这个特点。即BFC元素本身可以包含内部的浮动元素，但是BFC内部包含的元素是无法包含它的浮动子元素的。这里不用举例，因为根HTML元素就是一个BFC区域，假设内部的所有子元素都有这个特点，那么浮动父元素塌陷的问题将永远不会存在。

## 避开外部浮动元素
BFC区域除了可以将内部的浮动元素包裹进来之外，还可以避开外部的浮动元素，即BFC区域以外的浮动元素不会覆盖到BFC内部。我们看下例子：

```html
<html>
  <body>
    <body>
      <div class="wrapper">
          <div class="first"></div>
          <div class="second"></div>
      </div>
      <div class="wrapper">
          <div class="first"></div>
          <div class="second bfc"></div>
      </div>
      <div class="wrapper">
        <div class="parent">
          <div class="first"></div>
        </div>
        <div class="second"></div>
      </div>
      <div class="wrapper">
        <div class="parent">
          <div class="first"></div>
        </div>
        <div class="second bfc"></div>
      </div>
  </body>
  <style>
    .wrapper {
      height: 130px;
      width: 100%;
    }
    .parent {
      border: 1px solid blue;
      height: 10px;
    }
    .first {
      float: left;
      width: 100px;
      height: 100px;
      background: yellow;
    }
    .second {
      width: 150px;
      height: 100px;
      background: green;
    }
    .bfc {
      display: flow-root;
    }
  </style>
</html>
```

![图片](/2025/bfc-3.png)

第一个例子：第一个黄元素浮动，第二个绿元素未浮动。由于浮动元素脱离了文档流，因此将后面的非浮动元素覆盖了。
第二个例子：第二个元素设置了BFC，可以看到BFC区域避开了前面的浮动元素。
第三个例子：第一个浮动黄元素被包裹在父元素中。父元素未浮动。绿元素避开了非浮动的父元素，但是依然被浮动黄元素覆盖。
第四个例子：绿元素设置了BFC，BFC区域避开了前面的浮动元素。

## 与外部没有margin折叠效果


## BFC真的不受任何影响？

todo 定位是受影响的  试试相对定位

## 总结

BFC的包含内部浮动元素与避开外部浮动元素两个特点，使得它可以实现浮动父元素塌陷的问题。

## 参考
- 区块格式化上下文 MDN\
  https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_display/Block_formatting_context
- 聊一下CSS中的标准流，浮动流，文本流，文档流\
  https://jzplp.github.io/2025/css-float.html
- 格式化上下文简介 MDN\
  https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_display/Introduction_to_formatting_contexts
- 掌握外边距折叠 MDN\
  https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_box_model/Mastering_margin_collapsing
- 速通BFC知识点，BFC规则全覆盖，看完全明白！！！\
  https://juejin.cn/post/7454005481503096847
