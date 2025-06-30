# CSS 中的 BFC，到底有什么作用？(未完成 标题待完善)

## 什么是 BFC

BFC 的全程为 Block Formatting Context，含义是块级格式化上下文。在 MDN 中，对它的解释为：

> BFC 是 Web 页面的可视 CSS 渲染的一部分，是块级盒子的布局过程发生的区域，也是浮动元素与其他元素交互的区域。

第一次了解 BFC 的同学对这个解释肯定一头雾水，这个 BFC 的解释好像说了什么，又好像什么都没说。简单来说，BFC 实际上是一种作用于元素上的模式，如果符合出现的 BFC 出现的条件，就会成为一个 BFC 区域，对应的元素样式处理就符合 BFC 模式的特点。下面先看一下 BFC 出现的条件(图源 MDN)：

![图片](/2025/bfc-1.png)

可以看到，符合 BFC 出现的条件有很多。注意看，文档的根元素`<html>`是一个 BFC 区域。其它大部分都是明确的修改 CSS 属性以达到某些样式效果，变为 BFC 区域只不过是它们的副作用。只有一个无其它作用，专门设置为 BFC 区域的条件：`display: flow-root`。本文的例子中主要使用这个条件来设置 BFC 区域。

成为 BFC 区域后，这个区域内的元素不会受到外部元素的影响，内部元素也不会影响外部元素的布局。特点列举如下：

- BFC 区域会包含内部的浮动元素
- BFC 区域会避开外部的浮动元素
- 避开外部 margin 折叠效果 todo

其中与浮动有关的特点在之前我写“[聊一下 CSS 中的标准流，浮动流，文本流，文档流](https://jzplp.github.io/2025/css-float.html)”文章的时候讲过，但当时我们的关注点在于浮动，这次我们还是重新描述一下，但重点放在 BFC 本身。

## 包含内部浮动元素

浮动指的是设置了 CSS 中 float 属性为 left 或者 right 的元素。设置了浮动之后，元素本身便脱离了文档流，父元素计算空间时也不会包含内部的浮动元素。这样会造成浮动的父元素塌陷问题。但设置了 BFC 之后，父元素就会包含内部的浮动元素。

```html
<html>
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

- 第一个例子是非 BFC，可以看到父元素已经塌陷到只有一条线了，内部浮动的黄元素位置在父元素之外。
- 第一个例子在父元素设置了 BFC，父元素包裹住了内部浮动的黄元素，不会造成父元素塌陷问题。

BFC 包含内部的浮动元素的特点仅适用于符合 BFC 条件的那个元素，在 BFC 元素内部的元素则没有这个特点。即 BFC 元素本身可以包含内部的浮动元素，但是 BFC 内部包含的元素是无法包含它的浮动子元素的。这里不用举例，因为根 HTML 元素就是一个 BFC 区域，假设内部的所有子元素都有这个特点，那么浮动父元素塌陷的问题将永远不会存在。

## 避开外部浮动元素

BFC 区域除了可以将内部的浮动元素包裹进来之外，还可以避开外部的浮动元素，即 BFC 区域以外的浮动元素不会覆盖到 BFC 内部。我们看下例子：

```html
<html>
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

- 第一个例子：第一个黄元素浮动，第二个绿元素未浮动。由于浮动元素脱离了文档流，因此将后面的非浮动元素覆盖了。
- 第二个例子：第二个元素设置了 BFC，可以看到 BFC 区域避开了前面的浮动元素。
- 第三个例子：第一个浮动黄元素被包裹在父元素中。父元素未浮动。绿元素避开了非浮动的父元素，但是依然被浮动黄元素覆盖。
- 第四个例子：绿元素设置了 BFC，BFC 区域避开了前面的浮动元素。

## 避开外部 margin 折叠效果

元素的外边距 margin，如果相互靠近时，会发生折叠现象，即两个靠近的外边距会合并，实际两个元素之间的 margin 距离为两个 margin 中的较大值。外部 margin 折叠效果只在垂直方向上发生。有几种情况会造成 margin 折叠，这里列举一下：

- 空元素
- 父子元素
- 相邻兄弟元素

下面将会提供这些场景中 margin 折叠的实例，以及设置 BFC 之后的效果。设置 BFC 之后，只有部分场景可以避开 margin 折叠，且避开 margin 折叠效果也仅仅对设置 BFC 的那个元素有效。它内部的元素互相之间的 margin 折叠效果依然是存在的。原因与前面一致：根元素就是一个 BFC 区域，如果 BFC 内部的元素互相没有 margin 折叠效果，那么所有元素都没有 margin 折叠效果了。

### 空元素

一个没有高度，没有边框，padding 和子元素的元素是一个空元素。默认情况下，空元素的上下 margin 会合并。但设置 BFC 之后，空元素的上下 margin 就不再合并了。

```html
<html>
  <body>
    <div class="wrapper">
      <div class="first"></div>
    </div>
    <div class="wrapper">
      <div class="first bfc"></div>
    </div>
  </body>
  <style>
    .wrapper {
      width: 100%;
      border: 1px solid red;
      margin-bottom: 20px;
    }
    .first {
      margin: 10px;
    }
    .bfc {
      display: flow-root;
    }
  </style>
</html>
```

![图片](/2025/bfc-4.png)

第一个例子是未设置 BFC，上下 10px 的 margin 被合并了。第二个例子设置了 BFC 之后，margin 不再合并，可以看到父元素的高度明显变高了一倍。

### 父子元素

当父子元素之间没有间隔（例如 border, padding， 其它元素等）时，父子元素的 margin 会出现折叠现象。我们看下例子以及设置 BFC 之后的效果：

```html
<html>
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
    <div class="wrapper">
      <div class="parent">
        <div class="child bfc"></div>
      </div>
    </div>
  </body>
  <style>
    .wrapper {
      width: 100%;
      border: 1px solid red;
      margin-bottom: 20px;
    }
    .parent {
      margin: 10px;
      background: yellow;
      width: 150px;
    }
    .child {
      margin: 10px;
      background: blue;
      height: 50px;
      width: 100px;
    }
    .bfc {
      display: flow-root;
    }
  </style>
</html>
```

![图片](/2025/bfc-5.png)

- 第一个例子：父子元素的顶部没有间隔，出现了 margin 折叠现象。
- 第二个例子：父元素设置了 BFC，可以看到父子元素的 margin 没有折叠，子元素 margin 部分被染上了父元素的颜色。
- 第三个例子：子元素设置了 BFC，可以看到 margin 折叠现象依然存在。

因此，父子元素折叠的场景下，要对父元素设置 BFC 才可以避开 margin 折叠，对子元素设置无效。

### 相邻兄弟元素

上下相邻的同一层级的兄弟元素的 margin 也会出现折叠现象，我们看一下例子：

```html
<html>
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
      <div class="first bfc"></div>
      <div class="second"></div>
    </div>
  </body>
  <style>
    .wrapper {
      border: 1px solid red;
      margin-bottom: 20px;
      height: 130px;
      width: 100%;
    }
    .first {
      width: 100px;
      height: 50px;
      background: yellow;
      margin: 10px;
    }
    .second {
      width: 150px;
      height: 50px;
      background: green;
      margin: 10px;
    }
    .bfc {
      display: flow-root;
    }
  </style>
</html>
```

![图片](/2025/bfc-6.png)

- 第一个例子：兄弟元素上下相邻，出现了 margin 折叠现象。
- 第二个例子：下面的元素设置了 BFC，margin 折叠现象依然存在。
- 第三个例子：上面的元素设置了 BFC，margin 折叠现象依然存在。

可以看到，不管是上面还是下面元素设置 BFC，都不会避开 margin 折叠现象。那么 BFC 是不是无法避开兄弟元素的折叠现象呢？ 我们看一下组合场景。

```html
<html>
  <body>
    <div class="wrapper">
      <div class="parent">
        <div class="first"></div>
      </div>
      <div class="second"></div>
    </div>
    <div class="wrapper">
      <div class="bfc parent">
        <div class="first"></div>
      </div>
      <div class="second"></div>
    </div>
    <div class="wrapper">
      <div class="first"></div>
      <div class="parent">
        <div class="second"></div>
      </div>
    </div>
    <div class="wrapper">
      <div class="first"></div>
      <div class="bfc parent">
        <div class="second"></div>
      </div>
    </div>
  </body>
  <style>
    .wrapper {
      border: 1px solid red;
      margin-bottom: 20px;
      height: 140px;
      width: 100%;
    }
    .first {
      width: 100px;
      height: 50px;
      background: yellow;
      margin: 10px;
    }
    .second {
      width: 150px;
      height: 50px;
      background: green;
      margin: 10px;
    }
    .parent {
      background: blue;
      width: 300px;
    }
    .bfc {
      display: flow-root;
    }
  </style>
</html>
```

![图片](/2025/bfc-7.png)

- 第一个例子：上面的元素增加了父元素(设置为蓝色)，出现了父子元素 margin 折叠，然后再跟下面的兄弟元素折叠。
- 第二个例子：上面的父元素设置了 BFC，避开了父子元素 margin 折叠，因此避开了子元素与下面元素的 margin 折叠。
- 第三个例子：下面的元素增加了父元素(设置为蓝色)，出现了父子元素 margin 折叠，然后再跟上面的兄弟元素折叠。
- 第三个例子：下面的父元素设置了 BFC，避开了父子元素 margin 折叠，因此避开了子元素与上面元素的 margin 折叠。

通过这几个例子可以看出，BFC 不能阻止兄弟元素的 margin 折叠行为，如果希望禁止，需要利用父子元素 bikaimargin 折叠的方法实现。

## BFC 真的不受任何影响么

todo 定位是受影响的 试试相对定位

## 总结

BFC 的包含内部浮动元素与避开外部浮动元素两个特点，使得它可以实现浮动父元素塌陷的问题。

## 参考

- 区块格式化上下文 MDN\
  https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_display/Block_formatting_context
- 聊一下 CSS 中的标准流，浮动流，文本流，文档流\
  https://jzplp.github.io/2025/css-float.html
- 格式化上下文简介 MDN\
  https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_display/Introduction_to_formatting_contexts
- 掌握外边距折叠 MDN\
  https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_box_model/Mastering_margin_collapsing
- 速通 BFC 知识点，BFC 规则全覆盖，看完全明白！！！\
  https://juejin.cn/post/7454005481503096847
