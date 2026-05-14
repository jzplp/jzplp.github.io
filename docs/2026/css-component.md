# CSS组件化方案对比总结：CSS命名规范、CSS模块化、CSS Modules、原子化CSS
todo 标题后面看一下如何优化

## 关注点分离
众所周知，前端开发代码有三大部分：

* HTML 负责页面的结构
* CSS 负责页面的视觉样式
* JavaScript 负责页面的交互行为

这三大部分属于三种不同的“编程语言”，有一定的隔离性，但在逻辑上又互相关联，因此如何组织这些代码，是前端开发的一个重要问题。在较早期的前端开发中是三种代码分离的，即HTML中只写标签，不写CSS和JavaScript，这两个在单独的区域/文件中实现。这种做法叫做“关注点分离”。

```html
<!-- 三种代码合并 -->
<div style= "color: red" onclick="console.log('click')"> 你好 </div>

<!-- 三种代码分离 -->
<div class="texts" onclick="handleClick()"> 你好 </div>

<style>
.texts {
  color: red;
}
</style>

<script>
function handleClick() {
  console.log('click');
}
</script>
```

关注点分离的代码结构清晰，每种代码的耦合性少，因此在早期受到推崇。但这种方式在代码组织上有很大的问题，即虽然三种技术互相独立，但在逻辑上确是相互关联的：

* CSS样式是和HTML标签关联的，标签绑定样式才能发挥效果
* JavaScript对数据和交互的处理会造成HTML元素的展示和CSS样式变化

尤其是前端交互逻辑和数据处理越来越重，将三类代码分离对开发有很多不便之处。试想如果要调整一个模块的逻辑和展示，需要三个甚至更多文件同时查看对比才能搞清楚，这会造成造开发效率太低，逻辑不清晰，代码维护性差等很多问题。

## 组件化框架
后来出现了组件化的思想，将同一个模块的HTML, JavaScript, CSS代码放在一起，组成一个组件。组件本身可以自由组合和复用，组件内部的代码和外部隔离。开源社区中涌现了很多组件化的前端工具和框架，例如知名的React和Vue。现在这种组件化的模式，已经成为了前端开发的主流。

### Vue模式
Vue框架中的单文件组件形式，既保留了HTML, JavaScript, CSS代码的独立性（虽然HTML部分演变为了生成HTML的模板），依旧保留关注点分离的特性，又将它们组合到了同一个文件中，HTML模板可以直接使用JavaScript的数据来更新元素。这样使得同属于一个组件的代码逻辑清晰展示，同时不会影响到其它组件。前面的代码使用Vue的单文件组件改写后如下：

```vue
<script setup>
function handleClick() {
  console.log('click');
}
</script>

<template>
  <div class="texts" @click="handleClick"> 你好 </div>
</template>

<style>
.texts {
  color: red;
}
</style>
```

### React模式
React框架则首先发明了JSX语法，可以在JavaScript中编写标签模板。这样使得JavaScript和HTML的关系非常紧密：

```jsx
import './index.css';

function Comp() {
  const handleClick = () => {
    console.log('click');
  };
  const styles = { fontSize: '14px' };
  return <div className="texts" style={styles} onclick={handleClick}> 你好 </div>;
}
```

可以看到，React中一个函数即为一个组件，组件函数直接返回JSX标签语法，作为HTML渲染的模板。虽然Vue等组件后来也支持JSX，但还是React的使用最广泛。并且它们的标签语法都是类似于“HTML模板”，而不是一种真正的HTML。

React中的CSS可以直接作为内联style属性的数据，在JavaScript中控制样式。React对于CSS的封装比较弱，因此开发者还是必须使用独立的CSS等样式文件来控制样式。例如：

```css
/* index.css */
.texts {
  color: red;
}
```

但这样事实上就造成了React组件中HTML和JavaScript的代码位置联系紧密，但与CSS的联系却有些松散。再加上在组件中引入的CSS规则不仅在组件内生效，而且对于页面全局都生效，这样会造成不同组件的样式冲突和污染。为了解决这些问题，使得CSS和组件紧密联系，开源社区中涌现了很多关于CSS的组件化技术。

## 组件化方案
前面我花了不少时间，根据技术发展的顺序学习了CSS组件化相关的技术，写了四篇文章：

* [BEM、OOCSS、SMACSS、ITCSS、AMCSS、SUITCSS：CSS命名规范简介](https://jzplp.github.io/2026/css-name.html)
* [CSS Modules完全指南：CSS模块化的特性，生态工具和实践](https://jzplp.github.io/2026/css-modules.html)
* [运行时vs编译时：CSS in JS四种主流方案介绍和对比](https://jzplp.github.io/2026/css-in-js.html)
* [从TailwindCSS到UnoCSS：原子化CSS框架接入、特性与配置](https://jzplp.github.io/2026/atomic-css.html)

这四种方案分别是CSS命名规范/CSS Modules/CSS in JS/原子化CSS，它们都尝试着解决组件化开发中 CSS 的问题，我们在这里再简单描述一下。

### CSS命名规范
CSS命名规范有非常多，最知名的是是BEM命名规范。BEM的全称为Block Element Modifier，翻译成和中文就是块，元素和修饰符。BEM使用这三种层级来规范CSS的命名：

* Block 区块 表示页面中一个独立可复用的模块或者组件
* Element 元素 表示区块中的一个组成元素
* Modifier 修饰符 修饰元素的状态或者行为

元素不能独立存在，必须依附于区块内。修饰符则必须跟在元素或者区块后面。因此可以这样组合命名：因此可以这样组合命名：

block 单区块
block__element 区块+元素
block--modifier 区块+修饰符
block__element--modifier 区块+元素

再列举一下其他的CSS命名规范：

* **OOCSS**: 面对对象的CSS，将CSS类封装为基类和子类等，例如分离结构和皮肤，分离容器和内容等
* **SMACSS**: 可扩展和模块化的CSS结构，主要将CSS规则分为五种类型：基础样式/布局样式/模块样式/状态样式主题样式
* **ITCSS**: 把CSS规则分成了七层：Settings/Tools/Generic/Elements/Objects/Components/Trumps，并在不同的位置放置
* **AMCSS**: 使用HTML的属性key和值用来组织CSS选择器，有三种类型：Modules模块/Variations变体/Traits特征
* **SUITCSS**：组件化的样式工具，不仅包含CSS命名规范，也提供CSS预设包。有公共样式和组件样式等。

### CSS Modules

### CSS in JS

### 原子化CSS

## 比较和总结


## 参考
- React 文档\
  https://react.docschina.org/
- Vue 文档\
  https://cn.vuejs.org/
- 单文件组件 Vue文档\
  https://cn.vuejs.org/guide/scaling-up/sfc
- BEM、OOCSS、SMACSS、ITCSS、AMCSS、SUITCSS：CSS命名规范简介\
  https://jzplp.github.io/2026/css-name.html
- CSS Modules完全指南：CSS模块化的特性，生态工具和实践\
  https://jzplp.github.io/2026/css-modules.html
- 运行时vs编译时：CSS in JS四种主流方案介绍和对比\
  https://jzplp.github.io/2026/css-in-js.html
- 从TailwindCSS到UnoCSS：原子化CSS框架接入、特性与配置\
  https://jzplp.github.io/2026/atomic-css.html
