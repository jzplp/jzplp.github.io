# Vue和VuePress支持显示LaTeX公式方法

在VuePress中撰写文章时，为了解释说明，有时候需要显示公式。而LaTeX是公式编辑最常用的格式。那么如何在VuePress中显示由LaTeX撰写的公式呢？方法很简单。（如果VuePress支持显示，那么Vue中使用同样方法肯定也支持显示）

## 方法

1. 安装katex
```sh
yarn add -D katex
# 或者
npm i -D katex
```

2. VuePress中新建一个component  
我的创建位置是 components/common/latexDisplay.vue。
编写代码：  

```js
<template>
  <span ref="latex" class="katex" v-html="rawHTML"></span>
</template>

<script>
import katex from "katex";
import "katex/dist/katex.css";
export default {
  name: "latexDisplay",
  data() {
    return {
      rawHTML: "",
    };
  },
  mounted() {
    this.rawHTML = katex.renderToString(this.$slots.default[0].text, {
      throwOnError: false,
    });
    /*
    // 另一种方法
    katex.render(this.$slots.default[0].text, this.$refs.latex, {
      throwOnError: false,
    });
    */
  },
};
</script>

<style>
</style>

```

根据katex官方文档，有两种生成方式可以使用：
* 一个是生成HTML的字符串，可以用v-html指令渲染
* 一个是直接生成DOM对象，可以用this.$refs 取得要放置的标签。
这两种方式都已经写在上面的代码中。

3. 在Markdown/Vue文件中使用
直接在标签的slot中写入latex公式即可，例如：
```html
<common-latexDisplay> c = \\pm\\sqrt{a^2 + b^2} </common-latexDisplay> 
```
渲染后：

<latexDisplay> c = \pm\sqrt{a^2 + b^2} </latexDisplay>

## 说明 
* 我把显示公式的component设置为了行内标签span，这样文字可以和标签可以在文字在同一行显示公式。如果需要单独一行显示公式，可以用Markdown的换行方法。
* 公式是写在是在插槽中，比较方便。如果写在标签属性中还要多加一层双引号包裹，格式上不如插槽好看。
* 网上很多其他方法是使用CDN链接CSS，官方文档也提到了这种方法：
```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.15.2/dist/katex.min.css" integrity="sha384-MlJdn/WNKDGXveldHDdyRP1R4CTHr3FeuDNfhsLPYrq2t0UBkUdK2jyTnXPEK1NQ" crossorigin="anonymous">
```
不得不说，这种方法一点也不优雅，而且版本号居然是写死的，也不方便用npm/yarn进行版本控制。代替使用：
```js
import "katex/dist/katex.css";
```
* 文中方式虽然简单，但不能实现markdown中自动识别公式并渲染。网上有相关方法可以参考：[基于vue渲染Latex数学公式（simplemde-editor)](https://juejin.cn/post/6844904097242415112)，有兴趣可以研究一下。

## VitePress和Vue3
使用VitePress和Vue3，只需要对上面的代码做一些小改动即可实现显示Latex公式。

可以参考这个博客的github相关文件：
* https://github.com/jzplp/jzplp.github.io/blob/master/components/latexDisplay.vue
* https://github.com/jzplp/jzplp.github.io/blob/master/docs/2022/vue-latex.md

## 参考
- katex官方文档  
  https://katex.org/docs/api.html
- 基于vue渲染Latex数学公式（simplemde-editor)  
  https://juejin.cn/post/6844904097242415112

<script setup>
import latexDisplay from '../../components/latexDisplay.vue'
</script>
