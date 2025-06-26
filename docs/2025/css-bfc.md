# CSS中的BFC，到底有什么作用？(未完成 标题待完善)

## 什么是BFC
BFC的全程为Block Formatting Context，含义是块级格式化上下文。在MDN中，对它的解释为：

> BFC是Web页面的可视CSS渲染的一部分，是块级盒子的布局过程发生的区域，也是浮动元素与其他元素交互的区域。

第一次了解BFC的同学对这个解释肯定一头雾水，这个BFC的解释好像说了什么，又好像什么都没说。简单来说，BFC实际上是一种作用于元素上的模式，如果符合出现的BFC出现的条件，就会成为一个BFC区域，对应的元素样式处理就符合BFC模式的特点。下面先看一下BFC出现的条件(图源MDN)：

![图片](/2025/bfc-1.png)

可以看到，符合BFC出现的条件有很多。注意看，文档的根元素`<html>`是一个BFC区域。其它大部分都是明确的修改CSS属性以达到某些样式效果，变为BFC区域只不过是它们的副作用。只有一个无其它作用，专门设置为BFC区域的条件：`display: flow-root`。

成为BFC区域后，这个区域内的元素不会受到外部元素的影响，内部元素也不会影响外部元素的布局。具体特点列举如下：

* BFC区域会包含内部的浮动元素
* BFC区域会避开外部的浮动元素
* BFC区域与外部没有margin折叠效果 todo

todo BFC区域的其它 特性

其中与浮动有关的特点在之前我写“[聊一下CSS中的标准流，浮动流，文本流，文档流](https://jzplp.github.io/2025/css-float.html)”文章的时候讲过，但当时我们的关注点在于浮动，这次我们还是重新描述一下，但重点放在BFC本身。

## 包含内部的浮动元素

参考之前浮动先写

## 避开外部的浮动元素

等等。。。

## 与外部没有margin折叠效果


## 总结

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
