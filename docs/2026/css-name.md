# BEM、OOCSS、SMACSS、ITCSS、AMCSS、SUITCSS：CSS命名规范简介

本来是希望讲一下CSS组件化发展历史上的技术，但所有技术放到一个文章中描述太长了，因此对各类方案分开描述。这篇文章说的是CSS命名规范。

不同在前端开发中，不同组件/模块的class类名都是公用的，假设两个组件中起了同样的类名，那么就会出现样式污染。既然问题出在名字，那么让不同组件的类名不同就能解决问题了。因此，社区中出现了一些CSS命名规范，希望使用规范将CSS的冲突污染减少，同时通过命名起到和HTML标签关系更紧密，以及一些其它作用。

## BEM
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

​![流程图](/2026/css-name-1.png)

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

JavaScript中也有面对对象相关的方法，老方法有原型链，ES6中直接提供了class关键字，并且在逐渐完善面对对象相关的语法。但CSS并不是编程语言，无法提供直接提供面对对象语法，只能在概念上简单模拟一下。OOCSS就是利用CSS，对面对对象的概念进行了简单的模拟。

### 分离结构和皮肤
按照OOCSS的设想，CSS样式可以分为结构structure和皮肤skin。结构表示它的尺寸/位置/边距等内容；皮肤表示颜色，字体，背景等。因为皮肤可能会根据不同的场景变化，而且皮肤可能被多个组件所公用，因此分开作为两个类来处理。这里我们举个例子，首先是不使用OOCSS的做法，两个CSS类独立互相没有依赖：

```html
<div>
  <button class="btn-small">jzplp按钮1</button>
  <button class="btn-large">jzplp按钮2</button>
<div>
<style>
.btn-small {
  width: 20px;
  height: 20px;
  Padding: 5px;
  color: red;
  background: blue;
}
.btn-large {
  width: 200px;
  height: 200px;
  Padding: 50px;
  color: red;
  background: blue;
}
</style>
```

这样写会造成一些重复属性存在，例如这里的skin相关属性就是重复的，我们将他抽象出来作为单独的skin共享：

```html
<div>
  <button class="btn-small btn-skin">jzplp按钮1</button>
  <button class="btn-large btn-skin">jzplp按钮2</button>
<div>
<style>
.btn-skin {
  color: red;
  background: blue;
}
.btn-small {
  width: 20px;
  height: 20px;
  Padding: 5px;
}
.btn-large {
  width: 200px;
  height: 200px;
  Padding: 50px;
}
</style>
```

这样皮肤的样式就可以在不同的元素中复用了。如果要修改皮肤，修改一个位置就统一修改了所有元素的皮肤。

### 分离容器和内容
很多人在写CSS时，遇到容器和内容这样组合的HTML结构，经常会把CSS也写为组合的样式，例如与HTML一样也保持了父子的结构。但OOCSS认为，这样限制了这些CSS的引用场景，不利用其它元素复用这些CSS代码。需要将它们分开撰写。这里举个例子，首先依然是嵌套CSS的场景：

```html
<div class="container">
  <div>jzplp内容1</div>
  <div>jzplp内容2</div>
<div>
<style>
.container {
  width: 100%;
  height: 200px;
  div {
      width: 30px;
      margin-right: 10px;
      height: 100%;
  }
}
</style>
```

假设有其它场景只希望复用内部div的CSS代码，是没有办法的，因为嵌套的结构限制了这里的使用场景。因此按照OOCSS的设想，应该不使用嵌套结构，将CSS代码解耦：

```html
<div class="container">
  <div class="content">jzplp内容1</div>
  <div class="content">jzplp内容2</div>
<div>
<style>
.container {
  width: 100%;
  height: 200px;
}
.content {
  width: 30px;
  margin-right: 10px;
  height: 100%;
}
</style>
```

### OOCSS的优缺点
除了上面OOCSS的两个原则“分离结构和皮肤/分离容器和内容”之外，OOCSS最核心的原则其实是：拆开元素的CSS样式，使其做为更方便复用，更独立的样式。上面两个原则是这个核心原则的部分具体做法而已。

这时候有些同学会问，这些原则和面对对象有什么关系？实话说我也觉得关系确实不大。但按照OOCSS的说法，我们定义的类选择器就是面对对象中的类。将这个类的提供给HTML元素，就相当于将这个类实例化。使用OOCSS的原则，拆开的可复用CSS样式相当于基类，那些拆开后依然无法复用的CSS样式称为子类。（例如前面btn-small是子类，btn-skin是父类）。

如果这样抽象的话，即使不了解OOCSS的开发者，肯定也无意间使用过OOCSS的原则，也用过“面对对象方法”组织过CSS。这里我们总结一下OOCSS的优缺点：

* 优点
  * 复用已有的CSS规则更方便（这也是OOCSS的核心原则）
  * CSS文件更少，可提高页面加载速度（这也是复用程度高造成的）
  * 有利于CSS规则更新和扩展（只改一个CSS规则，所有位置都可以生效）
* 缺点
  * 一个元素上可能挂多个类名，可能造成属性混乱
  * 如何拆分抽象公共CSS规则需要根据业务设计与平衡
  * 结构和皮肤有时候时互相关联的，有时候并不容易区分
  * 部分CSS本身就要求父子有联系，例如flex，grid布局等等，必须要求父子元素独立可能并不适合

总之，OOCSS只是一个组织CSS的思路，我们不需要教条化的拆分，而是根据具体场景拆分和抽象公共CSS规则。

## SMACSS
SMACSS的全称叫做Scalable and Modular Architecture for CSS，意思是可扩展和模块化的CSS结构。他与OOCSS类似，也是制定了一些CSS组织的规范，但比OOCSS更细致。这两个命名规范的思想上有很多相似之处。SMACSS将页面的CSS规则分为五种类型，下面我们将分别介绍：

* Base 基础样式
* Layout 布局样式
* Module 模块样式
* State 状态样式
* Theme 主题样式

### Base基础样式
基础样式是整个页面通用的公共样式。一个常用的例子是CSS reset样式表。在[CSS优先级，没有想的那么简单！全面介绍影响CSS优先级的各类因素](https://jzplp.github.io/2024/css-specificity.html)中我们介绍过，浏览器会提供一些预置的默认样式，叫做“用户代理样式表”。但是很多用户不希望使用这些默认样式，因此使用一个全局的CSS reset样式表处理这些默认样式。

除了reset样式表之外，基础样式还可以包含一些对于所有元素通用的样式，例如标题样式，默认链接样式，页面背景等。SMACSS不推荐哎基础样式中使用类或者ID选择器。例如：

```css
body, form {
  margin: 0;
  padding: 0;
}
a {
  color: #039;
}
a:hover {
  color: #03F;    
}
body {
  background-color: red;
}
```

### Layout布局样式
布局指的是将页面划分为几个大部分，这几个部分的样式作为布局样式。例如页面可以划分为头部、主内容区、底部、侧边栏等。这些样式通常是全局样式，一个布局元素中可以包含很多个模块。如果布局元素确定只出现一次，甚至可以使用ID选择器。可以使用l-或者layout-前缀来表示是布局样式，但也可以不使用。这里举几个例子：

```css
#header, #article, #footer {
    width: 960px;
    margin: auto;
}
.sidebar {
    float: right;
}
```

### Module模块样式
SMACSS中的模块和其它CSS命名规范中模块的含义一致，都是页面中独立可复用的模块，也就是组件。模块中的规则避免使用ID选择器或者元素选择器，而使用类名。为了规则不发生冲突，每个模块可以用模块名称本身作为前缀，例如.module-。

```css
.card { padding: 5px; }
.card-top { font-size: 10px; }
```

### State状态样式
SMACSS中的状态类似于BEM中的修饰符modifier，它表示模块或者布局在某些状态下的外观或者行为。但SMACSS中的状态样式倾向于是全局使用的，即多个模块和布局都可以使用。状态样式也可以是依赖JavaScript驱动的，例如点击或者其它操作展示的效果。状态样式可以用is-作为前缀。因为要覆盖元素本身的默认样式，因此允许使用!important。

```css
.is-collapsed {
  width: 10px;
}
.is-selected {
  color: red !important;
}
/* 仅供模块使用的状态规则，可以添加模块前缀 */
.is-card-selected {
  color: yellow !important;
}
```

### Theme主题样式
主题描述了模块或布局的外观样式，一些小的页面不要求主题样式，但有些页面以后特殊要求，甚至要求换肤。将皮肤抽象出来作为的独立样式，方便抽象和更改。这里和OOCSS的皮肤规则有点像。

```css
.normal {
  color: blue;
  background: grey;
}

.primary {
  color: red;
  background: white;
}
```

### SMACSS的优缺点
SMACSS不仅描述了五种CSS规则类型，还包含很多规范说明，比如：类名规范、选择器使用规范和性能优化、字体、页面状态变化、嵌套选择器、与HTML5集成，与CSS预处理器集成、特殊CSS规则、甚至是CSS代码缩进等等。这里我们总结一下SMACSS的优缺点：

* 优点
  * 提供了比较详尽的CSS组织规范
  * 考虑到了各种类型的公共样式，组件/模块的独立样式，可复用和隔离能力相对平衡
  * 由于比较详尽，更有利于团队协作开发
* 缺点
  * 规范比较落后，没有适应现在前端框架的发展，有些想法也过时了
  * Layout也经常以模块/组件的形式组织
  * 规范太详尽，导致经常出现不符合实际情况的场景
  * 虽然说了不要死板套用，但如果不符合的场景太多，那还是需要重新定义自己的规范

## ITCSS
ITCSS的全称为Inverted Triangle Cascading Style Sheets，翻译成中文为倒三角CSS。ITCSS把CSS规则分成了七层，并且把这七层展示为了一个倒三角的形式。

​![流程图](/2026/css-name-2.png)

倒三角的形式指的是从上到下CSS规则的普遍性减少，特殊性增加，即越往下，影响范围和可复用性越低。这里我们说明一下每一层的内容：

* Settings 预先定义的颜色变量，数值变量等
* Tools 全局使用的mixins和函数等
* Generic 全局标准化样式，例如CSS reset样式表
* Elements HTML元素的通用样式
* Objects 整个工程的布局样式，但不包含外观属性
* Components 具体的组件样式
* Trumps 可以覆盖的辅助样式，可以接收!important

可以看到，前两层都没有真正的CSS规则代码；三四层是不带类选择器的CSS规则。ITCSS利用了CSS预处理的特性，例如mixins和函数等。

## AMCSS
AMCSS的全称为Attribute Modules for CSS，即使用属性作为模块的CSS。它与其它CSS命名规范都不相同：其它命名规范主要使用HTML的class属性作为选择器，而它则采用自定义HTML属性作为选择器。

* Modules 模块
  * 类似于BEM中区块和元素的概念
  * 使用HTML属性描述，属性名称采用大驼峰命名法BlockName，如果嵌套子模块名使用连字符-
* Variations 变体
  * 类似于BEM中的修饰符，表示模块中变化的部分，用来新增和覆盖部分属性
  * 使用HTML属性值描述，多个用空格分隔
* Traits 特征
  * 一组某个用途的CSS规则，可以用来描述一些公共的CSS
  * 同一组特征的HTMl属性相同，值不同。特征的属性名采用小驼峰式命名法featureName

上面将的有点晦涩，这里还是要用实际例子说明一下。AMCSS要求属性名添加前缀，推荐am-，其它前缀也可以。

```html
<div am-MainCard>
</div>
<div am-Card>
  <div am-Card-Container> jzplp1 </div>
</div>
<div am-Card="sp1 primary"> 
  <div am-textType="title"> jzplp2 </div>
</div>

<style>
  /* 仅模块名 */
  [am-Card] { color: red; }
  /* 模块名采用大驼峰命名法 */
  [am-MainCard] { color: red; }
  /* 子模块名使用连字符- */
  [am-Card-Container] { color: red; }
  /* 变体使用属性 */
  [am-Card~="primary"] { color: red; }
  /* 特征名使用小驼峰式命名法 */
  [am-textType] { color: red; }
  /* 特征名和限制特征值 */
  [am-textType~="title"] { color: red; }
</style>
```

可以看到，AMCSS实际上就是将类选择器的那一套用法搬到了属性选择器上面，属性选择器的~=符号同样支持多个属性值。而且由于属性有属性名和属性值两种，因此相比于class名更灵活也更清晰。这种属性命名方式并不是推荐的HTML规范，但也可以正常使用。

## SUITCSS
SUITCSS是一套组件化的样式工具。它不仅包含CSS命名规范，而且也提供了一些CSS预设包，构建工具，预处理器（实际上是PostCSS的插件集合），测试工具等。这里我们主要描述一下命名规范：

* 公共样式: 表示一些公共样式
  * 命名规则 `u-[sm-|md-|lg-]<utilityName>`
  * 使用-u开头，后面跟骆驼命名法。中间也可以加响应式规则sm-|md-|lg-
* 组件样式：描述独立组件内部的样式
  * 命名规则 `[<namespace>-]<ComponentName>[-descendentName][--modifierName]`
  * namespace 可选的命名空间，例如组件库中的组件避免与业务组件冲突，可以加前缀，例如 el-label, el-tag等。
  * ComponentName 组件名称，应该用Pascal命名法。组件名称需要与其他组件不同。
  * descendentName 组件内后代的名称，即为组件内部的元素上的类名，使用骆驼命名法。
  * modifierName 组件修饰符，修饰元素的状态或者行为。使用骆驼命名法，且前面有两个连字符。

SUITCSS命名规范中还规定了组件的设计原则，CSS变量名的命名方式，预置公共样式，甚至是代码风格等。

## 总结
即使我们没有了解过这些命名方案，其中的部分思想在我们的开发中也不知不觉会用到一些。这些命名规范确实能够解决很多问题，在前端发展的历史中起到过很多作用，也引导和启发了后续CSS组件化和工程化的发展。

但这些命名规范需要“手工处理”：手工定义各种名称，手工抽象CSS文件等。一个人开发还好，如果是多人协作团队开发，还要让每个人遵守规则，检查代码，这就成了一个麻烦的问题(少量规范有工具)。另外规范给出的类名大多很长，虽然更容易识别代码含义，但也造成了代码冗长，代码传输速度慢。

另外很多命名规范都有这样一个冲突：如果规范将CSS代码分类和组织的太过明确，这会造成应用范围小，很多工程根本不适用。如果规范CSS代码分类和组织的太模糊，那代码就太随心所欲了，与没定义差不多。因此我们最好根据每个工程的具体实际情况定义合适的规范和抽象。

还有很多CSS命名规范比较老，跟不上时代发展。有些老旧的规范并不适应部分新内容：例如新的CSS布局方案，CSS变量，前端框架，CSS Modules，CSS代码格式规范（有自动化工具）等。CSS命名规范也存在互相吸收想法和思路的，晚出的方案相对更完善一些，但没有早出的方案更知名。

## 参考
- 为什么 CSS in JS 这样的解决方案在国外很火，在国内却热度特别低？\
  https://www.zhihu.com/question/452075622
- 如何看待 CSS 中 BEM 的命名方式？\
  https://www.zhihu.com/question/21935157
- BEM 文档\
  https://getbem.com/
- CSS 模块化方案探讨（BEM、OOCSS、CSS Modules、CSS-in-JS ...）\
  https://juejin.cn/post/6947335144894103583
- CSS 管理方案CSS Modules、CSS-in-JS 和 Tailwind CSS\
  https://juejin.cn/post/7529660423999848500
- 快收藏！4种大厂常用的CSS命名法(Ⅰ)：BEM\
  https://juejin.cn/post/7377683176229224475
- BEM方法论：构建可维护的前端CSS架构\
  https://juejin.cn/post/7564304007763591220
- 优秀框架都在使用的CSS规范: BEM、OOCSS、SMACSS\
  https://juejin.cn/post/7438994542769520680
- Object Oriented CSS\
  https://github.com/stubbornella/oocss/wiki
- CSS 架构之OOCSS\
  https://juejin.cn/post/7021067874139635726
- SMACSS 文档\
  https://smacss.com/
- 4种大厂常用的CSS命名法(Ⅲ)：SMACSS\
  https://juejin.cn/post/7402987272504754228
- 漫谈 SMACSS\
  https://juejin.cn/post/6844903426585804813
- CSS优先级，没有想的那么简单！全面介绍影响CSS优先级的各类因素\
  https://jzplp.github.io/2024/css-specificity.html
- ITCSS模板 GitHub\
  https://github.com/itcss/itcss-netmag
- AMCSS 网站\
  https://amcss.github.io/
- AMCSS 文档 GitHub\
  https://github.com/amcss/attribute-module-specification
- CSS 架构之 ITCSS\
  https://juejin.cn/post/7025903094202368036
- 简述BEM, OOCSS，AMCSS，SMACSS，SUITCSS，ITCSS\
  https://juejin.cn/post/6844904035649077256
- SUITCSS 网站\
  https://suitcss.github.io/
- SUITCSS GitHub\
  https://github.com/suitcss/suit
- 介绍两种 CSS 方法论 SUITCSS和SMACSS\
  https://juejin.cn/post/6914279543716970509
- SUITCSS 命名规范\
  https://github.com/suitcss/suit/blob/master/doc/naming-conventions.md
- SUITCSS 文档\
  https://github.com/suitcss/suit/blob/master/doc/README.md
