# CSS优先级，没你想的那么简单！选择器/类/继承/内联/默认样式/@layer/@import/important/:where()/动画/过渡等等...

## 目录
[[toc]]

## 简介
提到CSS优先级，我们首先会想到各类的选择器，例如ID选择器，类选择器，元素选择器等等。这些选择器有不同的优先级分数，可以根据得分轻松判断出CSS样式的优先级。

但是CSS优先级真的这么简单么？其实不是。在实践中，有很多很多会覆盖CSS样式或者改变优先级顺序的语法和现象，CSS优先级的判断实际上是非常复杂的。有如下这些主题会实际影响到CSS优先级的表现：
- 各种选择器和组合：ID选择器，类选择器，元素选择器等
- CSS属性顺序
- CSS属性继承
- 内联CSS属性
- 层叠层 @layer
- 嵌套层叠层
- 浏览器默认样式
- 用户自定义样式
- !important声明
- CSS属性默认值
- 正在动画的样式
- 正在过渡的样式
- 引入样式 @import
- :where()和:is()和:not()选择器
- all属性

下面我们就来分别聊一下，这些主题是如何影响到CSS优先级的。




## 参考
- MDN CSS优先级\
  https://developer.mozilla.org/zh-CN/docs/Web/CSS/Specificity
- MDN CSS层叠、优先级与继承\
  https://developer.mozilla.org/zh-CN/docs/Learn/CSS/Building_blocks/Cascade_and_inheritance
- MDN CSS层叠层\
  https://developer.mozilla.org/zh-CN/docs/Learn/CSS/Building_blocks/Cascade_layers
- CSS specifishity with plankton, fish and sharks\
  https://specifishity.com/
- CSS中class的优先级\
  https://blog.csdn.net/yjjjjz/article/details/103240864
- MDN CSS all属性\
  https://developer.mozilla.org/zh-CN/docs/Web/CSS/all
- MDN CSS :where()伪类\
  https://developer.mozilla.org/zh-CN/docs/Web/CSS/:where
