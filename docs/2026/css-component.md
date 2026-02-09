# CSS组件化方案概述：BEM/CSS Modules/CSS-in-JS/原子化CSS等（未完成）
todo 标题后面看一下如何优化

## 前端组件化
众所周知，前端开发代码有三大部分：

* HTML 负责页面的结构
* CSS 负责页面的视觉样式
* JavaScript 负责页面的交互行为

这三大部分属于三种不同的“编程语言”，有一定的隔离性，但在逻辑上又互相关联，因此如何组织这些代码，是前端开发的一个重要问题。

### 关注点分离
在较早期的前端开发中是三种代码分离的，即HTML中只写标签，不写CSS和JavaScript，这两个在单独的区域/文件中实现。这种做法叫做“关注点分离”。

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

这样的代码结构清晰，每种代码的耦合性少，因此在早期受到推崇。但这种方式在代码组织上有很大的问题，即虽然三种技术互相独立，但在逻辑上确是相互关联的：

* CSS样式是和HTML标签关联的，标签绑定样式才能发挥效果
* JavaScript对数据和交互的处理会造成HTML元素的展示和CSS样式变化

尤其是前端交互逻辑和数据处理越来越重，将三类代码分离对开发有很多不便之处。试想如果要调整一个模块的逻辑和展示，需要三个甚至更多文件同时查看对比才能搞清楚，这会造成造开发效率太低，逻辑不清晰，代码维护性差等很多问题。

后来出现了组件化的思想，将同一个模块的HTML, JavaScript, CSS代码放在一起，组成一个组件。组件本身可以自由组合和复用，组件内部的代码和外部隔离。开源社区中涌现了很多组件化的前端工具和框架，例如知名的React和Vue。现在这种组件化的模式，已经成为了前端开发的主流。

### Vue模式
Vue框架中的单文件组件形式，既保留了HTML, JavaScript, CSS代码的独立性（虽然演变为了生成HTML的模板），依旧保留有关注点分离的特性，又将它们组合到了同一个文件中，HTML模板可以直接使用JavaScript的数据来更新元素。这样使得同属于一个组件的代码逻辑清晰展示，同时不会影响到其它组件。前面的代码使用Vue的单文件组件改写后如下：

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

React其中CSS可以直接作为内联style属性的数据，在JavaScript中控制样式。React对于CSS的封装比较弱，因此很多开发者还是喜欢使用独立的CSS等样式文件来控制样式。例如：

```css
/* index.css */
.texts {
  color: red;
}
```

但这样事实上就造成了React组件中HTML和JavaScript的代码位置联系紧密，但与CSS的联系却有些松散。再加上不管哪种框架，在组件中引入的CSS不仅在组件内生效，而且对于页面全局都生效，这样会造成不同组件的样式冲突和污染。为了解决这些问题，使得CSS和组件紧密联系，开源社区中涌现了很多关于CSS的组件化技术。下面我们就跟随着技术出现的时间顺序和进化方向，介绍一些CSS组件化相关方案。

## BEM
CSS样式冲突和污染主要的原因在于，不同组件中class类名都是公用的，假设两个组件中起了同样的类名，那么就会出现样式污染。既然问题出在名字，那么让不同组件的类名不同不就能解决问题了。因此，社区中出现了一些CSS命名规范，希望使用规范将CSS的冲突污染减少，同时通过命名起到和HTML标签关系更紧密的作用。

### BEM介绍
BEM是最知名的CSS命名规范，由Yandex团队开发。BEM的全称为Block Element Modifier，翻译成和中文就是块，元素和修饰符。BEM使用这三种层级来规范CSS的命名：

* Block 区块 表示页面中一个独立可复用的模块或者组件
* Element 元素 表示区块中的一个组成元素
* Modifier 修饰符 修饰元素的状态或者行为

每个层级内部使用串行命名法（Kebab Case），中间分隔单词使用单中线-。元素前的分隔符为双下划线__，修饰符前的分隔符为双中线--。元素不能独立存在，必须依附于区块内。修饰符则必须跟在元素或者区块后面。因此可以这样组合命名：

* block 单区块
* block__element 区块+元素
* block--modifier 区块+修饰符
* block__element--modifier 区块+元素

```html
<div class="container">
  <input class="container__input" />
  <button class="container__button--primary">提交<button>
</div>

<style>
.container {}
.container__input {}
.container__button--primary {}
</style>
```

在上面的例子中，container是区块，input和button是元素，primary则是修饰符。这样每个元素都有自己的类型，不需要考虑名称冲突的问题，而且这样命名是有页面结构含义在的，即通过命名就知道这个元素属于哪个组件，有什么用处。因此，BEM也不推荐使用嵌套选择器。

### BEM的应用和优缺点
BEM的应用比较广泛，很多项目都是使用它来命名class，还有一些项目利用了他的命名思路。这里我们以Vue3的组件库Element-Plus为例，来看一下BEM的应用：

​![流程图](/2026/css-comp-1.png)

这里是一个复合型输入框组件，名称叫做el-input-group。这里包含左边的前置展示元素和右边的输入框，其中组件结构和以BEM方式命名的class如下：

* el-input-group--prepend:  区块 el-input-group 修饰符 prepend
  * el-input-group__prepend:  区块 el-input-group 元素 prepend
  * el-input__wrapper:  区块 el-input 元素 wrapper
    * el-input__inner:  区块 el-input 元素 inner

通过这种方式，Element-Plus有着清晰的元素class名，不仅组件内部开发使用，使用组件库的用户也可以使用这些类名来覆盖组件库样式。下面我们来总结一下BEM命名规范的优缺点：

* 优点
  * 清晰的类名，只看class就能知道元素的作用和归属，不会发生混淆
  * 组件间和组件之间的名称是独立的，不会样式污染
  * 提供了命名规范，团队协作开发时命名不会混乱，也可以提供给外部使用
* 缺点
  * 对于包含很多元素的复杂组件，仅仅三个层级，命名可能并不够用
  * 组件名称太长，对开发者并不方便

这些优缺点不仅仅是BEM的优缺点，也基本上是大部分CSS命名规范的优缺点了。

## OOCSS
### 面对对象简介
OOCSS的全称为Object Oriented CSS，即为面对对象的CSS。接触过编程的同学大多知道，Object Oriented即面对对象，是一种编程模式，是将一些数据属性和对应的方法结合起来，抽象成一个类，而类的示例就是对象。面对对象还有继承，封装，多态等特性。这里举个简单的例子：

| 类别 | 类名 | 属性 | 方法 |
| - | - | - | - |
| 基类 | 水果 | 名称 重量 体积 | 切开水果 |
| 子类 继承水果 | 苹果 | 甜度 | 做苹果派 |
| 子类 继承水果 | 橘子 | 酸度 | 作陈皮 |

每一种类都封装了属性和方法。苹果和橘子都是水果的子类，继承了水果的属性和方法。子类可以有自己独立的方法，也能调用父类的方法。调用父类的方法时，可以有子类自己的实现，这是多态。例如苹果和橘子都可以使用切开水果这个方法，但切开的效果不一样。一个类可以生成很多个示例对象，每个对象可以有不同的数据。

JavaScript中也有面对对象相关的方法，老方法有原型链，ES6中直接提供了class关键字，并且在逐渐完善面对对象相关的语法。

### OOCSS介绍
JavaScript是一种编程语言，因此它可以提供面对对象相关语法，但CSS并不是编程语言，无法提供直接提供面对对象语法，只能在概念上简单模拟一下。OOCSS就是利用CSS，对面对对象的概念进行了简单的模拟。



### OOCSS的应用和优缺点


## SMACSS

## 其它命名方案？
OOCSS、AMCSS、SMACSS、SUITCSS

## 搞一个React工程示例

同时提供不使用 下面技术的场景示例 这次用vite？


## CSS Modules

## CSS in JS
以 styled-components 为例


## 原子化CSS

## 比较和总结

## 参考
- CSS Modules 用法教程 阮一峰\
  https://www.ruanyifeng.com/blog/2016/06/css_modules.html
- styled-components 文档\
  https://styled-components.com/
- Github styled-components\
  https://github.com/styled-components/styled-components
- CSS in JS 简介 阮一峰\
  https://www.ruanyifeng.com/blog/2017/04/css_in_js.html
- CSS 模块化方案探讨（BEM、OOCSS、CSS Modules、CSS-in-JS ...）\
  https://juejin.cn/post/6947335144894103583
- CSS 管理方案CSS Modules、CSS-in-JS 和 Tailwind CSS\
  https://juejin.cn/post/7529660423999848500
- 为什么 CSS in JS 这样的解决方案在国外很火，在国内却热度特别低？\
  https://www.zhihu.com/question/452075622
- React 文档\
  https://react.docschina.org/
- Vue 文档\
  https://cn.vuejs.org/
- 单文件组件 Vue文档\
  https://cn.vuejs.org/guide/scaling-up/sfc
- 如何看待 CSS 中 BEM 的命名方式？\
  https://www.zhihu.com/question/21935157
- BEM 文档\
  https://getbem.com/
- 快收藏！4种大厂常用的CSS命名法(Ⅰ)：BEM\
  https://juejin.cn/post/7377683176229224475
- BEM方法论：构建可维护的前端CSS架构\
  https://juejin.cn/post/7564304007763591220
- 优秀框架都在使用的CSS规范: BEM、OOCSS、SMACSS\
  https://juejin.cn/post/7438994542769520680
