# CSS优先级，没你想的那么简单！全面介绍影响CSS优先级的各类因素

## 简介
CSS的中文名称叫做“层叠样式表”，其中的层叠就是指根据各类优先级规则来处理冲突的样式。层叠是CSS的一个重要特性，优先级也是CSS学习中一项非常重要的内容。

提到CSS优先级，我们首先会想到各类的选择器，例如ID选择器，类选择器，元素选择器等等。这些选择器有不同的优先级分数，可以根据得分轻松判断出CSS样式的优先级。

但是CSS优先级真的这么简单么？其实不是。在实践中，有很多很多会覆盖CSS样式或者改变优先级顺序的语法和现象，CSS优先级的判断是非常复杂的。可以看这个思维导图，里面展示了会影响CSS优先级表现的不同主题：

[CSS优先级思维导图](./css-specificity-mindmap) (由于思维导图比较大，这个页面展示不开，因此放到单独的页面展示)

CSS优先级的判断，牵涉了太多CSS中的不同主题。可以说优先级的概念，贯穿了整个CSS领域。下面我们就来分别聊一下，这些主题是如何影响到CSS优先级的。

## CSS浏览器调试
在描述具体的优先级规则之前，我们先来看一下在页面上如何确定生效的是哪个CSS，以及如何调试CSS。

对于我们学习CSS优先级来说，在页面上如何确定生效的是哪个CSS是很容易的：我们只要设置一些非常明显的CSS样式即可，例如背景颜色，字体颜色等。不同的代码控制的颜色不同，就可以很明显的看到是哪段代码生效。但是在实践中，有部分不容易直接观察到的CSS，或者有一定的触发条件，这时候使用浏览器调试功能，可以更方便的查看和调试CSS。

例如在Chrome浏览器中，我们在页面上右键点击想要查看的区域，选择检查，在调试面板中选择Elements，即可看到对应的HTML元素和CSS样式。

![](/2024/css-1.png)

在右侧的Style中，我们可以看到不同选择器的样式规则和生效情况，以及内联样式，甚至是用户代理样式表（浏览器默认样式），和继承样式等，右侧还给出了代码来源。

![](/2024/css-2.png)

把鼠标放到选择器上，可以看到选择器具体的优先级数值。而那些画了删除线的样式，则是因为优先级低而不生效的样式。

![](/2024/css-3.png)

我们可以任意修改样式，查看效果，甚至可以新增或者删除样式。点击任意选择器，会出现新增属性的输入位置。点击任意属性，会发现属性key和值都可以变为编辑态。而且属性前会出现一个checkbox，取消勾中则该属性就不生效了。如果该属性恰好覆盖了其他属性，当取消勾中时，之前被覆盖属性的删除线会消失，属性变为生效状态。

![](/2024/css-4.png)

通过这些工具可以轻松的验证CSS属性的优先级和生效情况。当然，浏览器中CSS相关的调试工具还有很多，这里就不一一介绍了。

## 属性前后顺序
CSS属性的前后位置顺序是一个很容易理解，但也很重要的一条规则。之所以最早描述，是因为这条规则影响着其他所有的规则。不仅适用于CSS属性，也适用于选择器，@layer，!important等有先后顺序的其它CSS规则。这条规则就是： 如果有多个CSS规则，且其他规则指定的优先级相同，则后面出现的规则比前面出现的规则优先级高。

例如：
```css
p {
  color: blue;
}
p {
  color: green;
  color: red;
}
```

同样的两个元素选择器，后面的优先级就比前面的高。而在一个选择器中，对同一个属性进行赋值，也是后面的优先级更高。因此，在上述的代码中， 优先级实际为：`red > green > blue`。查看浏览器，可以看到具体的生效样式。把red禁用后，也可以看到下一个生效的是green。

![](/2024/css-5.png)

## 属性覆盖规则
虽然优先级比较的是选择器，但每个属性是单独生效的。没有和其它选择器冲突的属性，并不会因为优先级低被覆盖。这里举个例子：

```css
p {
  color: blue;
  font-size: 10px;
}
p {
  color: green;
}
```

对比前后顺序，第二个选择器的优先级比第一个要高。这样第一个选择器是不是因为优先级低，所以里面的属性全都不生效？不是的。被覆盖的仅仅是高优先级选择器中被重复赋值的属性（在这个例子中是color），而没有被重复赋值的属性依然是生效的，（在这个例子中是font-size）。

## 各类选择器与权重和
各类选择器和组合是我们平时接触最多的关于CSS优先级的内容。先来描述一下各种选择器的优先级。

### 选择器的权重
选择器分为三种：

1. 元素选择器(`p`)和伪元素选择器(`::before`)
2. 类选择器(`.example`)，属性选择器(`[type="radio"]`)和伪类选择器(`:hover`)
3. ID选择器(`#example`)

它们的优先级是 第1种 < 第2种 < 第3种。对应的，优先级越高，实际上选择器越精确，例如ID选择器是唯一的，精确性相对最高。类是开发者自己指定的，类选择器精确性一般比元素选择器要高。在具体计算中，每一种选择器都对应一个权重分量：

| 选择器类型 | 对应权重 |
| - | - |
| 元素选择器 | 0-0-1 |
| 类/属性选择器 | 0-1-0 |
| ID选择器 | 1-0-0 |

权重分量数值越大，表示优先级越高，例如 1-0-0 > 0-1-0 > 0-0-1。

### 组合选择器
假设一个选择器是由多个选择器组合而成的，那么这个选择器的权重和是由其中各个选择器的单独权重相加而成。不管使用哪种组合器甚至组合多层（存在特殊情况，后面描述）。例如：

| 选择器示例 | 组合器类型 | 包含选择器类型 | 对应权重和 |
| - | - | - | - |
| `#id` | 无 | 单个ID选择器 | 1-0-0 |
| `.a.b` | 交集选择器 | 两个类选择器 | 0-2-0 |
| `p>.a` | 直接子代选择器 | 元素选择器+类选择器 | 0-1-1 |
| `#id~.a [type="radio"]` | 兄弟组合器+后代组合器 | ID选择器+类选择器+属性选择器 | 1-2-0 |

通过计算单独选择器的加和，我们可以轻松的比较出各种选择器组合的优先级。可以看到，使用哪种组合选项器类型或者组合了多少层，都是不影响选择器的优先级的。

可以看到选择器权重和是相加的，那么会不会有进位现象呢？即：

- 0-0-12 是否等于 0-1-2
- 0-21-0 是否大于 2-0-0

答案都是否，没有进位规则；而且低权重的选择器无论出现多少个，优先级也不会比高权重的选择器更高。这里的权重和可以在Chrome浏览器中观察到（见**CSS浏览器调试**一节）。

### 特殊的选择器
有部分特殊的选择器类型，和上面介绍的规则并不一致，我们来看一下：

**通用选择器 `*`**
通用选择器是可以选择所有元素的选择器，优先级为 0-0-0。通用选择器比上面介绍的任何选择器的优先级都要低。

**并集选择器 `.a, .b`**
并集选择器也是一种组合选择器，是一个由逗号分隔的选择器列表，例如`.a, .b, p`。如果其中任意选择器与元素匹配，这个选择器组合即与该元素匹配。它的优先级规则和其他组合选择器不同：是由选择器列表中生效的优先级最高的选择器决定该选择器的优先级。我们来看一个例子：

```html
<body>
  <p id="ida" class="a b c">hello, jzplp</p>
</body>
<style>
  p, #idb.a.b.c, .a, .b.c {
    color: blue;
  }
  #ida {
    color:red;
  }
</style>
```

对于body中的p元素分析下选择器的优先级情况。首先是`p, #idb.a.b.c, .a, .b.c`，我们把选择器列表拆开分析：

| 选择器 | 是否命中 | 权重和 |
| - | - | - |
| `p` | 是 | 0-0-1 |
| `#idb.a.b.c` | 否 | 1-3-0 |
| `.a` | 是 | 0-1-0 |
| `.b.c` | 是 | 0-2-0 |

然后是#ida选择器，成功命中，权重和为1-0-0。我们把这段代码放到浏览器中，可以看到生效的是#ida选择器。

![](/2024/css-6.png)

虽然并集选择器中权重和最高的为1-3-0，比#ida选择器更高，但在没命中的情况下并不生效，选择器优先级是在生效的情况下比较。

### CSS嵌套
样式嵌套常见于各类CSS预处理器，比如Less和SCSS等等。到后来CSS本身也有了CSS嵌套(CSS nesting)，目前较新的浏览器版本才支持:

![](/2024/css-9.png)

CSS嵌套虽然写法上不一样了，但实际上仅仅是语法糖，本质上并没有增加新的选择器，例如：
```css
/*（1）*/
.a {
  color: red;
  .b {
    color: blue;
  }
}
/*（1）相当于：*/
.a {
  color: red;
}
.a .b {
  color: blue;
}

/*（2）*/
.a {
  > .b {
    color: blue;
  }
}
/*（2）相当于：*/
.a > .b {
  color: blue;
}

/*（3）*/
.a {
  .b + & {
    color: blue;
  }
}
/*（3）相当于：*/
.b + .a {
  color: blue;
}
```

因此还是可以利用上面的权重和计算方法来计算CSS嵌套中各层的优先级。

### 总结
通过上面的描述，我们已经知道了基础的优先级比较原则，即根据权重和计算得出。为什么这么设计，实际是遵循了一个原则：选择器越“精确”，优先级越高。这个原则不仅适用于权重和计算，对于后面提到的更多优先级规则也适用。

## 伪类
### 普通伪类
伪类有函数式伪类和非函数式伪类，我们先来说一下非函数式伪类。非函数式伪类与其他选择器一样，也有着优先级权重。权重为： 0-1-0。这些选择器例如：`:root`, `:empty`, `:link` 等等。

### 接收非选择器的函数式伪类
有好多个函数式伪类，函数参数接受的是非选择器形式的伪类，比如：`:dir(ltr)`, `:lang(en-US)`, `:nth-child(1)`等等。这些伪类与普通伪类一样，优先级权重为： 0-1-0。

### `:is()`伪类
`:is()` 接受一个可容错的选择器列表，例如`:is(p, .a, #b)`。如果列表中任意选择器命中，则该伪类命中。这个伪类的作用与并集选择器类似，但是优先级规则却不一样：

* 并集选择器的优先级为：列表中生效的优先级最高的选择器
* `:is()`的优先级为：列表中优先级最高的选择器

即使列表中最高优先级的选择器没有生效，`:is()`依然会使用它作为优先级。这里举个例子：

```html
<html>
  <body>
    <p id="ida" class="a b c">hello, jzplp</p>
  </body>
  <style>
    :is(.a.b.c, #idb.a.b, p) {
      color: red;
    }
    #ida {
      color: blue;
    }
  </style>
</html>
```

我们计算下其中出现的选择器权重和：

| 选择器 | 是否命中 | 权重和 |
| - | - | - |
| `.a.b.c` | 是 | 0-3-0 |
| `#idb.a.b` | 否 | 1-2-0 |
| `p` | 是 | 0-0-1 |
| `#ida` | 是 | 1-0-0 |
| `:is(.a.b.c, #idb.a.b, p)` | 是 | 1-2-0 |

可以看到，`:is()`中优先级最高的选择器`#idb.a.b`并未命中，可是`:is(.a.b.c, #idb.a.b, p)`依然选择了这个未命中的选择器作为其权重和。在浏览器中执行也可以验证效果：（可以看到权重和1-0-0的选择器`#ida`未生效）

![](/2024/css-7.png)

###  `:not()`伪类
`:not()`接受一个选择器列表，例如`:not(p, .a, #b)`。如果列表中的选择器都没有被命中，则该伪类命中。在命中的情况下，`:not()`优先级为选择器列表中优先级最高的一个选择器。

在实践中有时候会利用这个特性提高选择器的优先级：
* 原选择器 `.a` 优先级 0-1-0
* 提高后选择器 `.a:not(#anyAbsentID)` 优先级 1-1-0

我们取一个页面中并不存在的id（或者其他并不存在但是优先级高的选择器），作为`:not()`的参数，再和原选择器进行组合，即可提高原选择器的优先级，但是实际命中的元素相同。

### `:has()`伪类
`:has()`接受一个相对选择器列表，如果列表中任意选择器命中，则该伪类命中。这个“相对选择器”，实际上就是组合选择器去掉了前面的元素，因此这个伪类的形式类似于`p:has(+.a, +.b)`。意思是如果`p+.a`或者`p+.b`，命中，则该选择器命中。但是它与`:is(p+.a, p+.b)`的不同点在于，命中后样式生效的元素不一样：
* `:is(p+.a, p+.b)` 样式生效的选择器为`p`后面的`.a`或`.b`。
* `p:has(+.a, +.b)` 样式生效的选择器为`p`本身，不是后面的`.a`或`.b`。

也就是说，`:has()`仅仅是提供了一个限制条件，真正样式生效的元素还是`:has()`前的选择器。我们还是举个例子来看：

```html
<html>
  <body>
    <div>
      <p id="ida">123</p>
      <p class="a b c">hello, jzplp</p>
    </div>
  </body>
  <style>
    p:has(+.a.b.c, +#idb.a.b, +p) {
      color: red;
    }
    :is(p+.a.b.c, p+#idb.a.b, p+p) {
      color: yellow;
    }
    #ida {
      color: blue;
    }
  </style>
</html>
```

例子中`p:has(+.a.b.c, +#idb.a.b, +p)`和`:is(p+.a.b.c, p+#idb.a.b, p+p)`实际的命中规则相同，命中的都是第一个和第二个p元素的组合。但是生效元素不同。（其中真正对于命中起作用的是`p+.a.b.c`）
* `p:has(+.a.b.c, +#idb.a.b, +p)` 实际生效元素是`<p id="ida">123</p>`
* `:is(p+.a.b.c, p+#idb.a.b, p+p)` 实际生效元素是`<p class="a b c">hello, jzplp</p>`

![](/2024/css-8.png)

通过上面的例子，也可以看到`:has()`的优先级判断规则与`:is()`是一致的：选择列表中优先级最高的选择器作为其优先级。

`p:has(+.a.b.c, +#idb.a.b, +p)`与`#ida`生效的都是`<p id="ida">123</p>`元素。虽然`:has()`中的`+#idb.a.b`没有命中，但还是用它的1-2-0作为优先级权重和，与`p`组合后为1-2-1，大于`#ida`的1-0-0。因此在例子中`#ida`被覆盖了。

### `:where()`伪类
`:where()`同样是一个函数式伪类，也接受一个选择器列表做入参，而且用法和`:is()`一样，列表中的任意选择器命中，则该伪类命中。

但是它的优先级规则和`:is()`却不一样：`:where()`一直是0-0-0，不管其中的选择器列表的优先级如何。

## 伪元素

### 伪元素的优先级
伪元素在MDN和其他资料中描述的优先级都是 0-0-1。但是在Chrome浏览器中查看优先级，却不是这样的：

![](/2024/css-10.png)

通过浏览器调试，发现`::after`伪元素的优先级是 0-1-0，而不是0-0-1。不仅`::after`，其它伪元素的优先级也是如此。

### 伪元素的实际优先效果
我们再来看看伪元素的实际优先效果。先举个例子：
```html
<html>
  <body>
      <p>hello, jzplp</p>
  </body>
  <style>
    ::after {
      content: 'value';
      color: red;
    }
    :not(#ida) {
      color: blue;
    }
  </style>
</html>
```
p元素内部生成了一个`::after`伪元素，同时也命中了`:not(#ida)`，且优先级为1-0-0，比伪元素要高。但是查看实际效果，却发现`::after`中的内容实际没有命中`:not(#ida)`，仅p标签本身命中了：

![](/2024/css-11.png)

通过浏览器调试可以看到，`:not(#ida)`被当成了继承于p元素的样式属性，而不是`::after`自己的属性。虽然`::after`实际上是p标签内部的元素，且`:not(#ida)`在这个场景下是可以命中任何元素的，但是`::after`把它作为了继承而没有生效。

那我们再举一个无法作为继承，确实可以命中选择器的伪元素`::first-line`作为例子：
```html
<html>
  <body>
      <p>hello, jzplp</p>
  </body>
  <style>
    ::first-line { color: red; }
    :not(#ida) { color: blue; }
  </style>
</html>
```
这里根据浏览器调试栏的结果，`:not(#ida)`的优先级为1-0-0，`::first-line`的优先级为0-1-0，都命中了p元素。且`:not(#ida)`没被作为继承，也没有被划去。但是这时候，生效的却是优先级更低的`::first-line`。

![](/2024/css-12.png)

我们再换种测试方式：

```html
<html>
  <body>
      <p class="pp"><span class="sss">hello</span>, jzplp</p>
  </body>
  <style>
    .pp::first-line { color: red; }
    span { color: green; }
  </style>
</html>
```

![](/2024/css-51.png)

`.pp::first-line`的优先级毫无疑问比span优先级高，但是这时候span中的元素却是绿色，没有被更高优先级的覆盖。span元素之外的文字却是红色的，说明伪元素是生效的。

这说明，虽然伪元素表面上优先级不高，但在伪元素的“作用范围内”却可能将优先级更高的样式覆盖掉。我们对待伪元素，不能像对待普通选择器那样比较优先级，而应该具体问题具体分析。

## 内联样式
上面我们介绍的各类CSS，都是写在单独的`<style>`元素中的，作为选择器对HTML元素进行匹配的，叫做“内部样式表”。但是还有一种CSS写法，不需要匹配HTML元素，而是直接在HTML元素上作为style属性出现，这就是内联样式，也叫做行内样式。

由于内联样式不需要匹配，所以在“精确度”上是高于各种选择器的，因此优先级也比“内部样式表”更高。看一个例子：

```html
<html>
  <body>
    <p id="idp" style="color: blue">hello, jzplp</p>
  </body>
  <style>
    #idp { color: red; }
  </style>
</html>
```

虽然`#idp`选择器的优先级是1-0-0，但是依然不如style属性优先级更高。内联样式在Chrome的调试栏中作为`element.style`出现：

![](/2024/css-13.png)

## 继承属性
在CSS中，父元素的属性值可以被子元素继承，分为默认继承和主动继承，这里分别介绍一下。

### 默认继承
#### 默认继承规则
默认继承指的是CSS的默认行为，不需要主动声明继承关系或者设置什么。我们来看一个例子：

```html
<html>
  <body>
    <p id="idp"><span>hello, jzplp</span></p>
  </body>
  <style>
    #idp { color: red; }
  </style>
</html>
```

`<span>`的父元素为`<p>`，虽然`<span>`本身并没有设置颜色，但是父元素设置了颜色，因此`<span>`继承了父元素的红色。在Chrome浏览器的调试栏中，`Inherited from XXX` 就表示该属性继承于元素XXX。

![](/2024/css-14.png)

同时继承也是可以一层一层传递的。我们再来看一个例子：
```html
<html>
  <body>
    <div id="idp">
      <p><span>hello, jzplp</span></p>
    </div>
  </body>
  <style>
    #idp {
      color: red;
    }
  </style>
</html>
```

`<span>`以及它的父元素`<p>`都没有设置color，但是更上层的`<div>`设置了color，因此`<div>`继承给`<p>`，`<p>`再继承给`<span>`，因此`<span>`中的内容也是红色。

#### 仅部分属性默认继承
并不是所有的属性都会被默认继承，只有部分属性存在默认继承现象。这里举几个例子：

* 默认继承的属性：color, font-size, text-align, visibility 等等。
* 不默认继承的属性：height, width, border, overflow, opacity 等等。

属性是否默认继承是由CSS规则决定的，背后的原因是希望CSS在默认情况下使用方便一些：
>  一些属性是不能继承的 —— 举个例子如果你在一个元素上设置width为50%，所有的后代不会是父元素的宽度的50%。如果这个也可以继承的话，CSS就会很难使用了！

#### 默认继承的优先级
默认继承的优先级，仅在继承元素未设置该CSS属性时生效，一旦设置了属性，无论权重和的高低，优先级都比默认继承要高。这个也非常好理解：继承而来的属性，在“精确性”上肯定不如明确设置的属性要高。我们看个例子：

```html
<html>
  <body>
    <div id="idp"> <span>hello, jzplp</span> </div>
  </body>
  <style>
    span { color: blue; }
    #idp { color: red; }
  </style>
</html>
```
`#idp`的优先级为1-0-0，由div继承给了span。span自己命中的选择器权重和只有0-0-1，可是依然生效了，优先级比任何继承属性都要高。

![](/2024/css-15.png)

当然，如果父元素就存在CSS样式优先级竞争的情况，那么父元素优先级最高的，也就是父元素生效的属性才会被继承。即自己内部先决出胜负再说。

### 显式继承
由上面默认继承的部分可知，仅有部分CSS属性可以默认继承，而且继承的优先级是比较低的。那么如果我们希望提高继承的优先级，或者希望继承那些没有默认继承的属性呢？这时候就需要显式继承了。对于显式继承，这里只介绍inherit，all属性以及其他取值后面部分会单独介绍。

#### 显式继承规则
我们举个例子，看一下显式继承的用法：

```html
<html>
  <body>
    <div id="idp">
      <p>hello, jzplp</p>
    </div>
  </body>
  <style>
    #idp {
      width: 50%;
      border: 1px solid red;
    }
    p {
      width: inherit;
      border: inherit;
    }
  </style>
</html>
```

width和border都是不会显式继承的属性，我们显式声明了继承，因此这两个属性被继承到了`<p>`中。

![](/2024/css-16.png)

#### 显式继承的优先级
默认继承优先级很低，但显式继承却不一样。显式继承由于是我们自己设置的，因此优先级跟我们设置的位置有关。这里举个例子：

```html
<html>
  <body>
    <div id="idp">
      <p class="pclass" id="idpp" style="opacity: 0.9">hello, jzplp</p>
    </div>
  </body>
  <style>
    #idp {
      width: 50%;
      border: 1px solid red;
      opacity: 0.7;
      color: red;
    }
    .pclass {
      width: 100%;
      border: 1px solid blue;
      color: blue;
    }
    #idpp {
      width: inherit;
      border: inherit;
      opacity: inherit;
      color: inherit;
    }
  </style>
</html>
```

* width和border属性：#idpp中显式继承了父元素的值，而.pclass中又明确设置了不同的属性值。但由于#idpp的优先级比.pclass更高，因此还是显式继承生效。
* opacity属性：#idpp中显式继承了父元素的值，但是行内style又设置了新值，比选择器更高，因此这时候显式继承就失效了。
* color属性：color原本是默认继承的属性，但.pclass中设置了属性值，因此继承失效。而在后面#idpp中又显式继承了，且优先级更高，因此这里是显式继承生效。

![](/2024/css-17.png)

## 用户代理样式表
在页面中，不仅开发者自己提供的代码会引入样式（作者样式），浏览器本身也会提供一些CSS样式，这个样式叫做“用户代理样式表”，英文名叫做“user agent stylesheeet”。这就是浏览器提供的默认样式。例如`<p>`是块级元素，`<i>`中的文字会被展示成斜体，都是用户代理样式表来提供的样式。

CSS官方有推荐浏览器实现的用户代理样式表，这里可以参考一下：[Default style sheet for HTML 4](https://www.w3.org/TR/CSS21/sample.html)。我们在Chrome浏览器的调试栏中，也是可以直接看到浏览器提供的用户代理样式表的，如下图在样式的右侧标明了“user agent stylesheeet”。

![](/2024/css-18.png)

用户代理样式表既然是浏览器提供的一种默认样式，那么优先级是比较低的：它比开发者明确设置的各类样式（作者样式）优先级低，但是比默认继承的优先级要高。这里我们看个例子：

```html
<html>
  <body>
    <div>
     <i> hello, jzplp </i>
    </div>
  </body>
  <style>
    div { font-style: normal; }
  </style>
</html>
```

font-style是一个可以被默认继承的样式，因此`<i>`继承了属性值。但是用户代理样式表也给`<i>`提供了一个不一样的值，这时候用户代理样式表胜出了。

![](/2024/css-19.png)

有很多开发者并不想要浏览器提供的默认样式，这时会使用一个CSS reset样式表把常见的属性值转为确定状态，网络上有一些这类工具或者样式代码提供。当引入之后，reset样式表就成为了开发者明确设置的样式，优先级比用户代理样式表更高，因此可以实现覆盖。

## 属性初始值
### 初始值规则
除了继承和用户代理样式表之外，在CSS中还有一个“默认值”，叫做属性初始值。这个初始值和浏览器类型无关，也和HTML元素本身无关。每个CSS属性都有一个初始值（当然有些是空）。例如：为什么我们没有配置过color，但是字体颜色还是黑色；为什么我们没有设置过font-size，但是文字却有一个确定的大小。这就是属性初始值的作用。在CSS相关的查询网站上可以查到CSS的初始值，例如font-size和font-style。

![](/2024/css-20.png)

### 初始值优先级
属性初始值的优先级是非常低的，低于用户代理样式表和默认继承。这个也很容易理解：如果属性初始值的优先级高于用户代理样式表或默认继承，那么后两者将永远不可能生效。由于默认继承的优先级比属性初始值更高，所以实际上对于默认继承属性，初始值只能被用于没有指定值的根元素上，非根元素的值是继承的。

属性初始值并不会因为HTML元素的变化而改变。实际上，在我们没有设置任何CSS样式的情况下，一般样式的来源就是这两种：属性初始值和用户代理样式表。属性初始值在Chrome浏览器调试栏的Style中并不会展示，但在Computed中勾上`Show all`，可以看到置灰的样式，其中大部分都是默认值。（有些是计算得出的）

![](/2024/css-21.png)

### 显式设置初始值
如果我们希望提高属性初始值的优先级，可以使用initial实现。它的用法与inherit是一致的，优先级规则也一样。这里我们举个例子，看一下显式设置初始值的用法：

```html
<html>
  <body>
    <div> <i class="ic"> hello, jzplp </i> </div>
  </body>
  <style>
    div { font-style: normal; }
    .ic { font-style: initial; }
  </style>
</html>
```
父元素`<div>`又将font-style设置为normal；`<i>`元素本身的用户代理样式表，又将文字设置为斜体；而.ic又将样式设置为了初始值作用在`<i>`元素上。由于.ic的优先级最高，因此生效。在浏览器调试栏中，其他的值都被划去了。

![](/2024/css-22.png)

从上面例子也可以看到，属性初始值和用户代理样式表确实是两种值：一个是正常，一个是斜体。在在浏览器调试栏的Computed中，也可以看到最终使用的值依然是normal。

![](/2024/css-23.png)

## all属性

all属性是一种显式控制所有属性的手段，可以将属性值设置为初始值，继承值或者其他类型值。（注意：all不能控制unicode-bidi与direction属性，下面的章节中不再特意说明这一点。）它的用法类似于这样：

```css
div { all: initial; }
```

通过主动声明，控制`<div>`所有属性的值为初始值。它的优先级也依照设置的“位置”决定，即优先级规则与显式继承和显式设置初始值一致。例如在这里就是div选择器的优先级。all属性的取值有四种：

* initial
* inherit
* unset
* revert

其中的两种我们上面已经讨论过，它在all属性中的含义与上面描述的含义相同。不仅如此，这几个值其实都可以赋值给任意属性。下面我们分别描述一下这些取值的含义。

### initial值
initial在上面的显式设置初始值一节已经描述过，任意属性的值为initial，它的实际值就是该属性的初始值。而`all: initial`表示把所有属性设置为初始值。

### inherit值
inherit在上面的显式继承一节已经描述过，任意属性的值为inherit，它的实际值就是该属性的继承值，即父属性的值。而`all: initial`表示把所有属性设置为继承值，不区分是否默认继承属性。

### unset值
使用unset作为属性值时，分为两种情况：
- 对于默认继承属性，使用unset的行为类似于inherit值。即值为该属性的继承值。
- 对于非默认继承属性，使用unset的行为类似于initial值。即值为该属性的初始值。

那么既然有这两个值，为什么还要使用unset呢？unset实际上就是为了`all：unset`而准备的。对于单个属性，我们可以明确的知道是不是默认继承属性，不需要用unset。但假设希望将元素的所有属性都设置为“默认值”，即默认继承使用继承值，非默认继承使用初始值。这时候就不用每个属性都设置一遍，使用一句`all：unset`即可。我们来看一个例子：

```html
<html>
  <body>
    <div> <i class="cla"> hello, jzplp </i> </div>
  </body>
  <style>
    div { color: red; }
    .cla {
      color: blue;
      all: unset;
    }
  </style>
</html>
```

![](/2024/css-24.png)

首先看color属性，它是默认继承属性，`<i>`默认继承了父元素的red，但是`.cla`却又设置了blue，覆盖了red，red上面显示划去的标识。但是`all：unset`使得blue不生效（注意这时候blue并没有划去）。而默认继承red生效了。

再看下font-style属性，用户代理样式表中提供了斜体，但是`all：unset`优先级更高，虽然是默认继承属性但父级和更上层都无继承值，因此相当于使用默认值normal，覆盖了斜体。注意这里的`font-style: italic`也没有被划去。因此在Chrome中没被划去不代表样式真正生效，尤其使用all的时候。

### revert值
使用initial，inherit或者unset值的属性，直接作用于该元素与该属性的用户代理样式表都是不生效的。例如对于`<em style="font-style: unset">hello</em>`来说，无论font-style取上面三个中的哪个值，em本身的用户代理样式表中的斜体都不会生效。但是用户代理样式表也属于一种默认值，有没有让这种默认值生效的语法呢？revert就能办到。

revert本身可以作用在任意属性上，对单个CSS属性属性生效，也可以作用在all上面，例如`all: revert`，对所有属性生效。revert的作用根据revert所在位置的不同有关。这里先明确几个概念：

- 作者样式：网页本身的样式，即开发者提供的样式。（前面介绍过）
- 用户代理样式表：浏览器提供的样式默认值。（前面介绍过）
- 用户自定义样式：用户在浏览器中自己配置的样式。（后面章节介绍）

然后是revert的作用说明：

1. 如果在用户代理样式表中使用revert：属性值回滚到unset效果。即默认继承属性使用继承值，非默认继承属性使用属性初始值。
2. 如果在用户自定义样式中使用revert：属性值如果在用户代理样式表中有定义，则回滚到用户代理样式表效果；否则回滚到unset效果（即与第一条相同）
3. 如果在作者样式中使用revert：属性值如果在用户自定义样式中有定义，则回滚到用户自定义样式效果；否则回滚到第二条的效果。

简单的说，revert的效果是把当前的样式回滚一层（只回滚一层）。即作者样式回滚到用户自定义样式；用户自定义样式回滚到用户代理样式表；用户代理样式表回滚到unset。这里看一个简单的例子：

```html
<html>
  <body>
    <div> <i class="cla"> hello, jzplp </i> </div>
  </body>
  <style>
    div { color: red; }
    .cla {
      color: blue;
      font-style: normal;
      all: revert;
    }
  </style>
</html>
```

![](/2024/css-25.png)

首先看color属性：父元素设置了red，`<i>`继承了属性，但是被.cla中的blue覆盖了。然后是`all: revert`，回滚到用户自定义样式（没有），回滚到用户代理样式表（没有），回滚到unset，color是默认继承属性，因此继承生效。

然后看font-style属性：用户代理样式表中设置了italic，被.cla中的normal覆盖了。然后是`all: revert`，回滚到用户自定义样式（没有），回滚到用户代理样式表（有），因此italic生效。注意这里的`color: red`和`font-style: italic`在Chrome调试栏中都是划去状态，但实际都生效了。这又说明了，划去不一定代表不生效。

虽然在用户代理样式表中设置revert可以回滚，但实际上不会有哪个浏览器会在用户代理样式表中设置该属性值。而且用户代理样式表在Chrome浏览器中无法修改，因此我们只能按照规范说明效果，不能实际测试。

## 浏览器调试样式
很多浏览器都有调试栏，里面都有可以调试CSS的工具。那么我们在调试栏中写的样式，是如何生效的呢？这些样式的优先级如何？这里以Chrome浏览器为例，研究一下这些问题。

首先打开一个示例页面，这部分的所有例子都采用这个页面。
```html
<html>
  <body>
    <div class="cla">hello, jzplp</div>
  </body>
  <style>
    .cla { color: red; }
  </style>
</html>
```

### 删除和增加属性
在浏览器中取消勾选一个属性，该属性变为不生效的状态，上面出现删除线。如图所示：

![](/2024/css-26.png)

这时候我们把浏览器调试栏转到Sources，选中我们的页面，发现这条属性变成了注释。因此可以清楚，浏览器是把这个属性注释来实现删除属性的。注意看此时Elements出现的页面元素中，是没有被注释的。我们再往选择器中增加一个属性`font-style:italic`:

![](/2024/css-27.png)

可以看到Sources中增加了我们刚刚在调试栏中写的属性。而Elements中依然是没有的（不会变化）。

### 同文件增加选择器
我们把鼠标放到Style中.cla选择器，在样式右下方出现加号，我们点击一下，就出现了一个同名选择器。这时候我们往里面添加属性`font-style:italic`试试：

![](/2024/css-28.png)

创建完选择器之后，右上角出现了与选择器原页面同样的名称的文件名，但是行号不一样。我们点击这个文件名或者查看Sources，可以看到在原文件的样式下方确实出现了一个新的同名选择器，里面有我们添加的样式。

### 元素增加class
点击调试栏Styles中右上角的.cls，然后添加一个类名clb。左侧对应的Elements中class确实增加了，但是Sources中却无变化。

![](/2024/css-29.png)

### 创建新样式文件
点击调试栏Styles中右上角的加号，Styles中会出现一个选择器，右侧表示为`inspector-stylesheet`来源。我们在其中填写`color: blue`，发现颜色变成了蓝色。

![](/2024/css-30.png)

查看Sources，发现新增了一个样式文件`inspector-stylesheet`，里面是我们填写的样式。

### 调试样式优先级
调试样式的优先级，与作者样式（即开发者提供的样式）优先级一致。具体优先级根据我们增加的位置和选择器优先级确定。我们先看下同文件的优先级情况。原页面的作者样式只有一个`color:red`。我们在调试栏中增加了几个样式。

![](/2024/css-31.png)

* red: 原页面的作者样式
* blue: 调试样式，在red前，优先级低于red
* yellow: 调试样式，在red后，优先级高于red
* brown：调试样式，在red后，且非同一个选择器，优先级高于red。最后生效。

再来看看新样式文件的调试样式：

![](/2024/css-32.png)

* red: 原页面的作者样式，选择器权重0-1-0
* blue: 新样式文件调试样式，选择器权重0-0-1，比red低。
* yellow: 新样式文件调试样式，选择器优先级0-1-0，但位置在red之后。最后生效。

可以看到，不管我们在原文件上增加调试样式，还是创建新的样式文件来调试，它的优先级都与作者样式相同，我们可以用上面常规的样式优先级计算方法，例如选择器权重来计算。在位置方面，新样式文件调试样式是在原文件后面，因此同权重下优先级更高。

浏览器为什么要这么设计？这些调试样式不应该是浏览器用户添加的么？应该属于“用户样式”，优先级低于作者样式才对。我想了想，这里属于开发者工具，一般都是前端开发者使用。既然是页面的开发者，那么作为作者样式也有道理。而且在这里增删样式，一般都是为了调试这个页面，假如我们新增的调试样式优先级太低，增加了样式也不生效，这个调试功能也就不好用了。

## 浏览器插件注入样式
很多浏览器都提供了插件的功能，在插件里可以往页面注入样式。这些样式的优先级如何呢？这里以Chrome浏览器为例，研究一下浏览器插件注入样式。

### 制作插件，注入样式
首先创建一个文件夹，里面包含两个文件：`custom.css`与`manifest.json`。

`custom.css`是我们要注入的样式，例如：
```css
/* custom.css */
.cla {
  color: blue;
}
.clb {
  font-style: normal;
}
.clc {
  font-weight: bolder;
}
```

`manifest.json`是我们的插件配置文件。其中各项配置的含义可以参考网络上的配置文档。这里的`"file:///*/*"`是为了我们本地测试加的，我们打开电脑上的一个html文件，协议就是这个。

```json
{
   "content_scripts": [{
      "css": ["custom.css"],
      "all_frames": true,
      "matches": [ "http://*/*", "https://*/*", "file:///*/*" ]
   }],
   "description": "Custom css",
   "name": "Custom CSS",
   "version": "1.0",
   "manifest_version": 3
}
```

到这里我们插件就制作好了。在Chrome浏览器中输入`chrome://extensions/`，到管理插件的页面。点击“加载已解压的扩展程序”，选中我们刚才制作好的文件夹，然后可以看到插件被引入了。

![](/2024/css-33.png)

打开一个可以命中我们插件里的css选择器的页面，在页面调试栏中可以看到名称叫做“inject stylesheet”(注入样式)的样式来源，内容和插件中写的样式是匹配的。

![](/2024/css-34.png)

### 注入样式优先级
插件注入的样式在Chrome中具有独立的样式来源说明，那么它的优先级如何呢？结论是：和作者样式（即开发者提供的样式）优先级一致。但是注入样式的位置是在页面的CSS之前。我们来看个例子：

```html
<html>
  <body>
    <div class="cla clb clc">hello, jzplp</div>
  </body>
  <style>
    div { color: red; }
    .clb { font-style: italic; }
    div.clc { font-weight: normal; }
  </style>
</html>
```

![](/2024/css-35.png)

这个例子分了三个属性，我们分别来看：
* color属性：注入样式为blue，权重0-1-0。作者样式为red，权重0-0-1。注入样式权重更高，胜出。
* font-style属性：注入样式为normal，权重0-1-0。作者样式为italic，权重0-1-0。但是作者样式位置在后面，作者样式胜出。
* font-weight属性：注入样式为bolder，权重0-1-0。作者样式为normal，权重0-1-1。作者样式权重更高，胜出。

通过例子可以看到，作者样式和注入样式的优先级确实是相同的，仅仅注入样式有位置劣势。遇到比较时，还是用权重和等上面介绍的方法来比较。

为什么插件的注入样式优先级会和作者样式一致呢？假设调试样式是为了页面调试使用所以一致，那么插件的使用者又不是开发者，为什么还是一致。我个人觉得，插件样式既然存在，那么很可能是为了覆盖某些作者样式的作用。如果优先级太低，那么插件样式依然是一个鸡肋的功能，用处不大。

在目前市场上已有的插件中，我们甚至可以看到有些插件把注入的样式设置为!important(后面会介绍)，致使注入样式的优先级非常高，影响用户正常使用。

## 用户自定义样式
在revert值我们提到过用户自定义样式，它一般是在浏览器中由用户配置的一种样式表。按照CSS规范，它的优先级应该高于默认继承，高于用户代理样式表；优先级低于作者样式。

但是，在Chrome浏览器中我没有找到设置用户自定义样式的地方。上网搜索了一下，网上有部分文章提到Chrome33+就不能自定义样式了，然后提供了浏览器插件的方案。不管是浏览器插件还是调试样式，都与CSS规范中用户自定义样式的优先级不同，不能看作是用户自定义样式。我搜索了一下其他浏览器，例如Firefox，也没有找到如何设置的方法。因此，对于用户自定义样式，在本文中仅按照规范介绍，就无法拿来实际举例实验了。

## !important标识
!important是在属性值后面的标识，形式是`color: red !important;`表示这个CSS样式是重要的。它的优先级非常高，优先级几乎高于所有不带!important标识的CSS属性（正在过渡的样式优先级更高，后面部分会介绍）。我们来看一个例子，具体分析下!important的优先级：

```html
<html>
  <body>
    <div class="cla" style="color: yellow; font-style: normal !important">hello, jzplp</div>
  </body>
  <style>
    div {
      color: red  !important;
    }
    .cla {
      color: blue;
      font-style: italic !important;
    }
  </style>
</html>
```

![](/2024/css-36.png)

- color属性: red的权重为0-0-1，比blue的权重0-1-0要低。但是因为!important，导致red优先级更高。yellow虽然是内联样式，但优先级也没有使用!important的red更高，因此red生效。
- font-style属性：.cla选择器设置了italic，内联样式设置了normal，两个都带着impoortant，这时候按照它原有的比较方式进行比较，内联大于选择器，因此normal生效。

!important的优先级说明：
- 带!important标识与不带标识的比较，带标识的优先级更高。
- 正在过渡的样式，优先级比带!important标识的优先级更高。
- 同样带!important标识的属性互相比较，按照原有的优先级比较方式比较。
- 作者样式，用户自定义样式，用户代理样式表相比较：
  - 同样不带!important标识，优先级为 作者样式 > 用户自定义样式 > 用户代理样式表
  - 存在一个带!important标识，优先级为 带!important标识的更高
  - 存在多个带!important标识，那么!important标识的进行比较。优先级为 用户代理!impoortant样式表 > 用户自定义!impoortant样式 > 作者!impoortant样式

通过上面说明可以看出，对于大部分CSS优先级规则，带!important标识的属性互相比较时与普通样式比较时规则一致。但是作者样式、用户自定义样式、用户代理样式表的!important标识互相比较时，优先级与不带标识时正好相反。不过用户自定义样式现在的浏览器基本无法配置，用户代理样式表也不会出现!important标识，因此这个优先级规则实际上是用不到的。

## CSS动画与优先级
CSS动画（CSS animations）可以实现一种CSS样式在一段时间内转换到另外一种样式的过程。CSS动画的内容比较多，这里仅描述一下与优先级相关的部分属性。

### 简单CSS动画
CSS动画的优先级判断很简单：正在动画时的样式比所有普通样式优先级高，比!important标识的优先级低（动画也比正在过渡的样式优先级低）。首先我们来举一个简单的动画例子，看一下CSS优先级的实际效果：

```html
<html>
  <body>
    <div class="cla" style="color: yellow">hello, jzplp</div>
  </body>
  <style>
    @keyframes change {
      0% {
        color: red;
        background-color: red;
      }
      100% {
        color: blue;
        background-color: blue;
      }
    }
    .cla {
      animation: change 5s 2s;
    }
    div {
      background-color: green !important;
    }
  </style>
</html>
```

在上面的例子中，@keyframes定义了动画的规则，里面设定了动画的关键帧。这里设置了color和background-color从red变化到blue。@keyframes内部不能使用!important。animation属性应用动画规则，实际上他是一个组合属性：例子中的5s是animation-duration，指动画一个周期的时间；2s是animation-delay，指元素加载完成之后到动画开始前的延时时间。然后我们分析下效果：

![](/2024/css-37.png)

首先是color属性：内联样式设置了yellow，当动画执行前的2s，以及动画执行结束后，color都是yellow生效。虽然动画animation属性本身的优先级要低于内联样式，但在动画执行过程中，动画的优先级高于内联样式。因此我们可以看到文字的颜色变化。

然后再看看background-color属性，同样设置了动画。但是在选择器div中设置了green，且带!important标识，优先级比动画更高。因此我们不会看到背景的颜色变化。

### animation-play-state属性
animation-play-state属性可以暂停动画和恢复动画的执行。在暂停时依然处于“正在动画时”，遵守动画时的优先级规则。我们来看个例子：

```html
<html>
  <body>
    <div class="cla" style="color: yellow">hello, jzplp</div>
  </body>
  <style>
    @keyframes change {
      0% {
        color: red;
      }
      100% {
        color: blue;
      }
    }
    .cla {
      animation: change 5s;
      animation-play-state: paused;
    }
    .cla:hover{
      animation-play-state: running;
    }
  </style>
</html>
```

![](/2024/css-38.png)

这个例子中的动画依旧是color变化。动画默认是暂停的，只有我们鼠标悬停在元素上，动画才会进行。当动画暂停时（就算默认是暂停状态也算暂停），color也是动画的color，而不是内联样式yellow。

### animation-fill-mode属性
在简单样式中我们提到过，在动画前的延时以及动画执行完成后，动画的样式不再生效；而animation-fill-mode属性可以让这两个时间内的动画样式依旧是生效状态。在动画前的延时时，使用的时0%时的样式。动画执行完成后，使用的是100%时的样式。animation-fill-mode属性有四个取值：

* none: 默认值，动画前后都不生效
* backwards: 动画前生效，动画后不生效
* forwards: 动画前不生效，动画后生效
* both: 动画前后都生效

在取值为both时，比正在动画的样式优先级低的CSS样式，就再也没有生效的机会了。我们看一个例子：

```html
<html>
  <body>
    <div class="cla" style="color: yellow">hello, jzplp</div>
  </body>
  <style>
    @keyframes change {
      0% {
        color: red;
      }
      100% {
        color: blue;
      }
    }
    .cla {
      animation: change 5s 2s;
      animation-fill-mode: both;
    }
  </style>
</html>
```

这里先说明下时间线：0-2s 动画前的延时；2s-7s 动画中；7s后 动画后。我们使用不同的animation-fill-mode取值，可以观察到现象：

* none: 0-2s yellow；2s-7s 由red到blue；7s后 yellow
* backwards: 0-2s red；2s-7s 由red到blue；7s后 yellow
* forwards: 0-2s yellow；2s-7s 由red到blue；7s后 blue
* both: 0-2s red；2s-7s 由red到blue；7s后 blue

## CSS过渡与优先级
### CSS过渡
平时在CSS中改变某个属性的值，页面都是立即变化的。例如原本是红色`div { color: red }`，悬停时变为蓝色`div:hover { color: blue }`。当我们鼠标放到元素上时，颜色会立即变为蓝色。那么有没有一种方法，可以将样式变化在一段时间内逐渐进行，而不是突变呢？这就是CSS过渡(CSS transitions)。

CSS过渡与CSS动画有些类似，都可以控制样式在一段时间内逐渐变化，但CSS动画是在@keyframes里单独设定动画的规则，功能也更强大。CSS过渡则是检测元素本身样式的变化，进行过渡。我们举一个例子：

```html
<html>
  <body>
    <div class="cla">hello, jzplp</div>
  </body>
  <style>
    .cla {
      color: red;
      transition-property: color;
      transition-duration: 5s;
      transition-delay: 2s;
    }
    .cla:hover {
      color: blue;
    }
  </style>
</html>
```

- transition-property: 需要过渡的属性，可以是一个或多个，甚至是all
- transition-duration: 过渡的时间长度
- transition-delay: 过渡开始前的延时

默认color为red；鼠标放到元素上时为blue。例子中增加了CSS过渡的属性，让颜色变化是逐渐进行的：鼠标放到元素上时，先延时两秒，然后可以看到5秒的由red变blue的过程。最后是blue。如果在过渡中或者结束后鼠标离开元素，还可以看到两秒延时后，颜色由逐渐变回red。

![](/2024/css-39.png)

### CSS过渡的优先级
CSS过渡的样式，本身就来源于样式（优先级）变化导致的属性改变，CSS过渡本身也没有创造新的属性值。但是当CSS过渡正在进行中时，它的优先级却是最高的，比!important还要高。我们来看一个例子：

```html
<html>
  <body>
    <div class="cla" style="color: yellow">hello, jzplp</div>
  </body>
  <style>
    .cla {
      color: red !important;
      transition-property: color;
      transition-duration: 5s;
      transition-delay: 2s;
    }
    .cla:hover {
      color: blue !important;
    }
  </style>
</html>
```

![](/2024/css-40.png)

可以看到，red和blue都加了!important，它的过渡也是正常进行的。至于内联样式yellow，因为优先级相对太低，没有出场的机会了。

## 层叠顺序
在描述了那么多CSS优先级相关的内容后，终于来到了层叠部分。这部分的内容在前面都已经零零散散的提到过，这里算是一个小总结。CSS将不同来源的样式分为了8个层级，这8个层级的优先级从低到高分别为：

1. 用户代理样式表
2. 用户自定义样式
3. 作者样式（即页面开发者提供的样式）
4. 正在进行的动画样式
5. 作者!important样式
6. 用户自定义!important样式
7. 用户代理!important样式表
8. 正在进行的过渡样式

层级高的样式一定比层级低的样式优先级高。遇到样式冲突，先看层级，层级高的直接胜出；如果层级相等，再使用比较权重和等方法。哪怕层级低的样式权重和更高，它的优先级也是更低的。

我们还可以注意到（在前面!important部分也已经描述过）：作者样式、用户自定义样式、用户代理样式表的!important标识互相比较时，优先级与不带标识时正好相反。

- 不带标识时：作者样式 > 用户自定义样式 > 用户代理样式表
- 带!important标识时：作者!important样式 < 用户自定义!important样式 < 用户代理!important样式表

!important标识这种相反的优先级规则，在后面层叠层的介绍中也可以看到。

## 外部样式表
我们上面涉及到的样式全都是内联样式，或者是内部样式表`<style>`标签，那么外部样式表的优先级如何呢？

### 外部样式优先级
这里先给出结论：外部样式表的优先级与内部样式表一致。我们来看个例子：

```html
<html>
  <body>
    <div class="cla">hello, jzplp</div>
    <style>
      .cla {
        color: red;
        font-style: italic;
      }
    </style>
    <link rel="stylesheet" href="./styles.css" />
  </body>
</html>
```
然后是外部样式表styles.css：
```css
.cla {
  color: blue;
}
div {
  font-style: normal;
}
```

![](/2024/css-41.png)

首先看color，内部样式表中是red；外部样式表blue的权重和一致，且位置靠后，因此blue生效。再看font-style，内部样式表权重和为0-1-0，外部样式表为0-0-1，外部样式表优先级低，italic生效。如果此时把内部样式表和外部样式表的元素位置交换，那么生效的则是red和italic。

### 使用js延时插入样式表
如果外部样式表是后插入的，并不是一开始就存在的，那么现象如何呢？我们看个例子：

```html
<html>
  <body>
    <div class="cla">hello, jzplp</div>
    <script>
      setTimeout(() => {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "./styles.css";
        document.body.insertBefore(link, document.body.firstChild);
      }, 1000);
    </script>
    <style>
      div {
        color: red;
        font-style: italic;
      }
    </style>
  </body>
</html>
```

例子中的`<script>`代码作用为 延时一秒后，在`<body>`的第一个元素前插入外部样式表`<link rel="stylesheet" href="./styles.css" />`。在刚打开页面时，外部样式表还没有插入，只有内部样式表`<style>`生效。此时页面是红色斜体。当一秒后，外部样式表插入。注意外部样式表的插入位置在内部样式表的前面。

![](/2024/css-42.png)

此时看color属性，外部样式表的权重和更高，因此文字变为blue。再看font-style属性，内部和外部样式表权重和一致，但是由于内部样式表位置更靠后，所以依然是italic生效。可以看出，CSS前后顺序的优先级原则不依赖于元素插入的时间，即使是更晚时间插入样式，但在DOM中依然更靠前，CSS的优先级规则不会变化。

### 使用Node服务延时提供样式表
外部样式表一般都是一个链接，是一个独立的HTTP请求，那么如果这个请求的响应时间较长，会有什么现象呢？会不会影响优先级？我们使用一个Node服务来控制请求的响应时间，实验一下。

```js
const http = require('http');
const fs = require('fs');

http.createServer((req, res) => {
  let data = '';
  console.log(`request url: ${req.url}`);
  if(req.url === '/') {
    data = fs.readFileSync('./index.html');
    res.end(data);
  } else if(req.url === '/styles.css') {
    setTimeout(() => {
      data = fs.readFileSync('./styles.css');
      res.end(data);
    }, 1000);
  }
}).listen(8000, () => {
  console.log('server start!');
});
```

把上述代码放到js文件中，然后将index.html与styles.css放置在同一目录内。用命令行启动`node main.js`，一个最简单的Node服务就启动了。在浏览器中输入`localhost:8000`就可以看到我们的页面了。其中styles.css并不需要修改内容，但是可以看到服务端代码里写了中延迟了一秒才返回样式文件。index.html的内容如下：

```html
<html>
  <head>
    <link rel="stylesheet" href="./styles.css" />
    <style>
      .cla {
        color: red;
        font-style: italic;
      }
    </style>
  </head>
  <body>
    <div id="cla" class="cla">hello, jzplp</div>
    <!-- 外部样式表放这里可以先渲染页面 -->
  </body>
</html>
```

我们启动服务，在浏览器访问地址，可以看到页面在一秒钟之后才渲染完成。为什么这么慢？这是因为外部样式表的获取是阻塞渲染的，也就是说必须等收到styles.css的数据，才能继续渲染其余的页面。由于我们的外部样式表是写到`<head>`中的，因此还没等`<body>`中的内容开始渲染，就阻塞了。这这时我们把外部样式表调整到`<body>`的最后，再重新启动服务，就可以先渲染再等待外部样式表了。

我们在浏览器中可以看到文字先是红色斜体，这时候外部样式表还没有加载成功，仅仅是内部样式表起作用。一秒后文字变成蓝色，依然是斜体。这时候样式位置和属性都与“外部样式优先级”部分中的例子一致，现象也是一样的。这说明，外部样式表数据收到的时间并不会影响优先级，只是在收到数据前不会生效。

## @import
### @import优先级
与外部样式表类似，@import也是一种引入样式表的方法，但它是在CSS语句中引入，且必须在其它CSS语句的最上面（除某些特殊语句外）。我们来看一个例子。先是index.html：

```html
<html>
  <head>
    <style>
      @import url('./styles.css');
      .cla {
        color: red;
      }
      div {
        font-style: normal;
      }
    </style>
  </head>
  <body>
    <div class="cla">hello, jzplp</div>
  </body>
</html>
```

然后再是styles.css：

```css
.cla {
  color: blue;
  font-style: italic;
}
```

可以看到，在`<style>`的最上面使用@import引入了styles.css。@import规则引入的样式，与其他样式的优先级规则是相同的。但由于必须在最上面引入，在前后顺序方面有些劣势。我们来看下优先级比较：

![](/2024/css-43.png)

首先看color，@import中提供了blue，权重和0-1-0。后面`<style>`中又直接设置了red，权重和一致，但是位靠后，因此red生效。然后看font-style，@import中权重和为0-0-1，`<style>`中直接设置了italic，权重和0-1-0，因此italic生效。

### 使用Node服务延时提供@import
@import是可以提供url的，那么像外部样式表一样，会受到网络影响。如果这个请求的响应时间较长，会有什么现象呢？我们使用一个Node服务来控制请求的响应时间，实验一下。Node服务的代码直接使用外部样式表中的代码，不需要改动。

执行后，在浏览器中输入localhost:8000打开页面。在一秒之后，页面才展示。这是因为@import会阻塞页面渲染，而对应的`<style>`又在`<body>`上面，因此先收到数据再继续渲染页面。我们改一下html：

```html
<html>
  <head>
    <style>
      .cla {
        color: red;
      }
      div {
        font-style: normal;
      }
    </style>
  </head>
  <body>
    <div class="cla">hello, jzplp</div>
    <style>
      @import url('./styles.css');
    </style>
  </body>
</html>
```

这时候有两个`<style>`，第一个`<style>`提供了样式，但没有请求url，不会阻塞，第二个在`<body>`最后，因此不会阻塞页面元素的呈现。我们执行试一下：

![](/2024/css-44.png)

这时候可以看到一开始第一个`<style>`生效，是红色normal，一秒后收到@import数据，且优先级更高，因此变为蓝色斜体。

## 层叠层@layer

在中大型项目或者引入组件库，前端框架或其他第三方的样式中，我们经常会遇到其他人写的样式，这些样式可能与我们自己写的样式是冲突的，我们不得不提高优先级，甚至使用important处理，覆盖这些第三方样式。

我们上面描述过层叠的概念，一共分为8个层级。这些第三方样式与我们自己写的样式都在“作者样式”这个层级中，因此造成了优先级冲突的问题。而层叠层，就是为了解决这个问题而出现的。

### 层叠层的用法
层叠层允许我们自己定义层级。我们看几个例子，了解下用法：
```css
/* 创建层layout1 */
@layer layout1;
/* 可同时创建多个层 */
@layer layout2, layout3;
/* 创建层，并添加样式 */
@layer layout4 {
  div {
    color: red;
  }
}
/* 层名称相同时，实际是同一个层 */
@layer layout2, layout3;
/* 可以先创建，后添加添加样式 */
@layer layout1 {
  div {
    color: red;
  }
}
/* 可以对同一层多次添加样式 */
@layer layout4 {
  .cla {
    font-style: normal;
  }
}
/* 创建匿名层 */
@layer {
  div {
    color: red;
  }
}
/* 创建另一个匿名层 */
@layer {
  div {
    color: red;
  }
}
/* 未分层样式 */
div {
  color: red;
}
```

使用@layer，可以创建层叠层，并且在层中提供样式。提供的样式可以正常的命中HTML元素，但是优先级有特殊规则（后面部分描述）。@layer后面可跟层的名称，如果多次出现同一个名称，实际属于同一个层。

如果不提供名称，那么创建的就是匿名层。如果多次不提供名称，那么会创建多个不同的匿名层。因此，匿名层是无法多次添加样式的。如果样式没有被包含到层中，就属于未分层样式。

### 层叠层与@import
使用@import可以引入其他文件的样式表，前面我们已经描述过。层叠层可以与@import配合使用，将引入的样式表直接放到一个层中。我们看几个例子，了解下用法：

```css
/* 创建层layout1，导入样式并放到层中 */
@import url('./styles.css') layer(layout1);
/* 先创建层，再导入样式 */
@layer layout2, layout3;
@import url('./styles.css') layer(layout2);
/* 先创建层layout4并导入样式，再添加样式 */
@import url('./styles.css') layer(layout4);
@layer layout4 {
  /* 注意实际@import上面不能出现样式 */
  div {
    color: red;
  }
};
/* 对同一层多次导入样式 */
@import url('./styles1.css') layer(layout5);
@import url('./styles2.css') layer(layout5);
/* 创建匿名层，并导入样式 */
@import url('./styles.css') layer();
/* 导入到未分层样式 */
@import url('./styles.css')
```

通过例子可以看到，@import导入的样式可以直接放到层中，也可以对层多次添加/导入样式，或者导入到匿名层中。

### 层叠层的优先级
聊一下层叠层与普通样式（即非!important样式）的优先级关系。我们创建的层是在作者样式中的，但不仅作者样式可以包含层叠层，用户自定义样式，用户代理样式表都可以包含，用法和优先级规则都是一样的。但是用户自定义样式目前大部分浏览器无法创建，没有哪个浏览器会在用户代理样式表中创建层叠层，因此大部分层叠层的使用场景还是在作者样式中。这里先描述下层叠层的优先级规则：

* 未分层样式优先级大于分层样式
* 分层样式的优先级依照它们创建的顺序确定，创建位置越靠后优先级越高
* 优先级比较：内联样式 > 未分层样式 > 分层样式
* 分层样式的优先级符合之前描述的层叠顺序的规则，即属于作者样式的分层样式与为分层样式都符合作者样式的层叠优先级规则。优先级规则可以整理为：正在进行的过渡样式 > !important样式 > 正在进行的动画样式 > 作者样式(包含内联样式/未分层样式/分层样式等) > 用户自定义样式 > 用户代理样式表

这里描述的优先级规则是高于权重和规则的，即使未分层样式的权重和为0-0-1，也比权重和为1-0-0的分层样式优先级更高。我们来看一下实际的例子：

```html
<html>
  <head>
    <style>
      @layer layout1, layout2;
      div {
        font-style: normal;
        font-size: 16px;
      }
      @layer layout2 {
        div {
          color: red;
          background-color: yellow;
        }
      }
      @layer layout1 {
        div {
          color: blue;
          font-style: italic;
        }
        #ida {
          font-size: 14px;
        }
      }
    </style>
  </head>
  <body>
    <div id="ida" style="background-color: green">hello, jzplp</div>
  </body>
</html>
```

![](/2024/css-45.png)

可以看到，在浏览器调试栏中会明确标注出样式所在的层级来源。这个例子涉及四种属性，我们分别来描述：

* color属性: layout1先创建，后添加属性；layout2后创建，先添加属性。但是优先级是按照创建层的顺序，越靠后优先级越高，因此layout2中的red胜出。
* font-style属性: normal是在未分层样式中设置，italic是在layout1中，且权重和都是0-0-1。未分层样式优先级更高，因此normal胜出。
* font-size属性：16px是在未分层样式中设置，权重和0-0-1；14px是在layout1中，权重和为1-0-0。虽然分层样式权重和更高，但是未分层样式优先级更高，比权重和更重要，因此16px胜出。
* background-color属性：yellow在layout2中，green在内联样式。内联样式优先级更高，因此胜出。

### 层叠层与!important
之前我们描述过!important，除了正在进行的过渡样式之外，!important样式大于所有的非!important样式。加上层叠层之后，规则也是一样的。对于同样!important样式之间的比较，内联样式/权重和等规则也是适用的。

那么多个分层样式都存在带!important标识的同样属性，优先级规则是如何呢？规则非常类似于之前描述的层叠顺序，即!important标识的分层样式互相比较时，优先级与不带标识时正好相反。不带!important标识的分层样式，创建位置越靠后优先级越高；而带!important标识的分层样式相反，创建位置越靠前优先级越高。

未分层!important标识样式的优先级，低于带!important标识的分层样式。内联!important样式的优先级高于于带!important标识的分层样式，也高于未分层!important标识样式。即 未分层!important标识样式 < 带!important标识的分层样式 < 内联!important样式。这里举个例子看下，其中所有属性都带!important标识：

```html
<html>
  <head>
    <style>
      @layer layout1 {
        div {
          color: red !important;
          font-style: italic !important;
        }
      }
      @layer layout2 {
        div {
          color: blue !important;
          font-size: 14px !important;
        }
      }
      div {
        font-style: normal !important;
      }
    </style>
  </head>
  <body>
    <div style="font-size: 16px !important">hello, jzplp</div>
  </body>
</html>
```

![](/2024/css-46.png)

* color属性: layout1与layout2都分别设置了red和blue，layout1的red更靠前，因此优先级更高。注意这里浏览器（Chrome127版本）的调试栏中是错的，调试栏中是layout2的蓝色生效，红色被划去了。
* font-style属性: layout1中设置了italic，未分层样式设置了normal。这里分层样式的优先级比未分层样式更高，因此italic生效。注意这里浏览器（Chrome127版本）的调试栏中也是错的，调试栏中normal生效，italic被划去了。
* font-size属性: layout1中设置了14px，内联样式设置了16px。内联样式优先级更高，16px生效。

## 嵌套层叠层
我们在作者样式中设置的层叠层，其实很像作者样式中的“嵌套层”。而我们设置的层叠层，也能包含嵌套层。

### 嵌套层叠层的用法
嵌套层叠层实际上就是在层叠层中在创建层叠层。我们来看一下用法：

```css
/* 层layout1  */
@layer layout1 {
  /* 层layout1的样式 */
  div {
    color: red;
  }
  /* 层layout1中的嵌套层layout11 */
  @layer layout11 {
    div {
      color: blue;
    }
  }
  /* 可以创建多个嵌套层 */
  @layer layout12, layout13;
  /* 可以对嵌套层多次添加样式 */
  @layer layout11 {
    div {
      font-style: italic;
    }
  }
  /* 匿名嵌套层 */
  @layer {
    div {
      color: blue;
    }
  }
}
/* 层layout2  */
@layer layout2 {
  /* 层layout2中的嵌套层layout21 */
  @layer layout21 {
    div {
      font-style: italic;
    }
  }
}
/* 直接创建嵌套层：layout3中的嵌套层layout31  */
@layer layout3.layout31 {
  div {
    font-style: italic;
  }
}
/* 层layout4  */
@layer layout4 {
  /* 层layout4中的嵌套层layout41 */
  @layer layout41 {
    /* 层layout4中的嵌套层layout41的嵌套层layout411 */
    @layer layout411 {
      /* 层layout4中的嵌套层layout41的嵌套层layout411的嵌套层layout4111 */
      @layer layout4111 {
        div {
          font-style: italic;
        }
      }
    }
  }
}
```

可以看到，我们在声明的层叠层中创建新层，即属于那个层叠层的嵌套层。嵌套层的创建方法与层叠层本身并没有什么区别。有一个不同点是，我们可以直接创建嵌套层，例如`@layer layout3.layout31`。即使layout3不存在，也会同时被创建。嵌套层叠层也可以包含更深的嵌套层。

### 嵌套层叠层与@import
之前我们描述过，可以将@import引入的样式直接放到层叠层中，作为分层样式。嵌套层叠层也可以做到。我们来看一下用法：

```css
/* 创建层layout1.layout11，导入样式并放到层中 */
@import url('./styles.css') layer(layout1.layout11);
/* 先创建层叠层，再导入样式 */
@layer layout2.layout21;
@import url('./styles.css') layer(layout2.layout21);
/* 导入样式后再添加样式 */
@layer layout2.layout21 {
  div {
    color: blue;
  }
}
```

可以看到，@import导入样式到嵌套层叠层，与引入到层叠层是基本一致的，直接指定嵌套层叠层的名称即可。如果@import导入的样式本身就包含层呢？这个层会直接作为嵌套层存在。这里列举下用法：

首先是styles.css的文件内容：

```css
@layer layout11 {
  div {
    font-style: italic;
  }
}
```

然后我们引入styles.css的方式：

```css
/* 引入样式放到layout1中，实际存在嵌套层layout1.layout11 */
@import url('./styles.css') layer(layout1);
/* 直接引入样式，不放到层中  实际存在层layout11 */
@import url('./styles.css');
/* 引入样式放到layout2.layout21中，实际存在嵌套层layout2.layout21.layout11 */
@import url('./styles.css') layer(layout2.layout21);
```

可以看到，如果@import后指定了层叠层，且引入的样式本身就包含层，这个层会作为指定的层叠层的嵌套层叠层存在。

### 嵌套层叠层的优先级
嵌套的层叠层的优先级与层叠层规则一致。首先，嵌套层叠层属于它的父层级的一部分，符合它父层级的优先级规则。一个父层的多个嵌套层叠层，他们之间的规则优先级规则可以按照层叠层的优先级规则来看：即分层样式的优先级依照它们创建的顺序确定，创建位置越靠后优先级越高。父层直接所属的样式可以看作是嵌套层叠层的“未分层样式”，优先级比分层样式更高。我们来看一下例子：

```html
<html>
  <head>
    <style>
      @layer layout1 {
        @layer layout12, layout11;
        @layer layout11 {
          div {
            color: red;
            font-style: normal;
          }
        }
        @layer layout12 {
          div {
            color: blue;
            font-size: 14px;
          }
        }
        div {
          font-size: 16px;
        }
      }
      @layer layout2.layout21 {
        div {
          font-style: italic;
        }
      }
    </style>
  </head>
  <body>
    <div>hello, jzplp</div>
  </body>
</html>
```

![](/2024/css-47.png)

* color属性: layout1.layout11中设置了red，layout1.layout12中设置了blue。注意创建顺序，layout12比layout11更早，因此layout11优先级更高，red生效。
* font-style属性: layout1.layout11中设置了normal，layout2.layout21中设置了italic。由于父层就不同，因此按照父层的优先级确定。layout2创建顺序靠后，优先级更高，italic生效。
* font-size属性: layout1.layout12中设置了14px，layout1中设置了16px。layout1属于layout1.layout12的未分层样式，优先级更高，因此16px生效。

### 嵌套层叠层与!important
嵌套层叠层与!important的关系也与层叠层一致，即!important标识的分层样式互相比较时，优先级与不带标识时正好相反。带!important标识的分层样式创建位置越靠前优先级越高。而未分层!important标识样式的优先级，低于带!important标识的分层样式。内联!important样式的优先级高于于带!important标识的分层样式。我们来看一下例子，实际上就是上一节的例子中每个属性都带了!important：

```html
<html>
  <head>
    <style>
      @layer layout1 {
        @layer layout12, layout11;
        @layer layout11 {
          div {
            color: red !important;
            font-style: normal !important;
          }
        }
        @layer layout12 {
          div {
            color: blue !important;
            font-size: 14px !important;
          }
        }
        div {
          font-size: 16px !important;
        }
      }
      @layer layout2.layout21 {
        div {
          font-style: italic !important;
        }
      }
    </style>
  </head>
  <body>
    <div>hello, jzplp</div>
  </body>
</html>
```

![](/2024/css-48.png)

* color属性: layout1.layout11中设置了red，layout1.layout12中设置了blue。注意创建顺序，layout12比layout11更靠前，因此layout12优先级更高，blue生效。注意这里浏览器（Chrome127版本）的调试栏中是划去的是错的。
* font-style属性: layout1.layout11中设置了normal，layout2.layout21中设置了italic。由于父层就不同，因此按照父层的优先级确定。layout1创建顺序靠前，优先级更高，normal生效。注意这里浏览器（Chrome127版本）的调试栏中是划去的是错的。
* font-size属性: layout1.layout12中设置了14px，layout1中设置了16px。layout1属于layout1.layout12的未分层样式，优先级更低，因此14px生效。

## 其他不会影响CSS优先级的内容
### 元素接近度
假设有下面这样一个例子，有两个选择器`div span`和`body span`，这两个选择器的权重和相同。但是从DOM树上看，div比body更接近于命中的span元素，因此`div span`比`body span`是“更精确的”，因此`div span`的优先级是否会更高呢？

```html
<html>
  <head>
    <style>
      div span {
        color: red;
      }
      body span {
        color: blue;
      }
    </style>
  </head>
  <body>
    <div>
      <span>hello, jzplp</span>
    </div>
  </body>
</html>
```

![](/2024/css-49.png)

答案是否定的，`div span`与`body span`的权重和一样，所属的层也是相同的，因此他们的优先级取决于出现的先后顺序，`body span`更靠后，因此优先级更高。CSS的优先级与元素接近度无关，只根据CSS明确列出的规则来确定。

### class属性值顺序
一个元素可以绑定多个class，以空格分隔。元素的class属性中值出现的先后顺序与优先级有关么？在下面这个例子中，`class="cla clb"`与`class="clb cla"`对优先级是否有影响？

```html
<html>
  <head>
    <style>
      .cla {
        color: red;
      }
      .clb {
        color: blue;
      }
    </style>
  </head>
  <body>
    <div class="cla clb">hello, jzplp</div>
  </body>
</html>
```

![](/2024/css-50.png)

答案是没有影响，我们切换class值的顺序，结果都是.clb生效。因为class属性值顺序与优先级无关。这里.clb选择器出现的位置靠后，因此优先级更高。

也正因为class值的顺序没有影响，所以像classnames等npm包，以及Vue等框架可以使用这种class的写法，不用担心优先级冲突：

```js
// classnames
classNames('foo', { bar: true, duck: false }, 'baz', { quux: true })
// Vue
<div :class="{ active: true, foo: false }"></div>
```

## 总结
前面描述了非常多的影响CSS优先级的因素，这里总结一下CSS优先级的整个顺序表。其中序号数字越大，代表优先级越高。

- 1 属性初始值
- 2 默认继承属性值
- 3 用户代理样式表
- 4 用户自定义样式
- 5 作者样式
  - 5.1 属性前后顺序
  - 5.2 选择器权重和
  - 5.3 层叠层顺序
  - 5.4 嵌套层叠层顺序
  - 5.5 未分层样式
  - 5.6 内联样式
- 6 正在进行的动画样式
- 7 作者!important样式
  - 5.1 属性前后顺序
  - 5.2 选择器权重和
  - 5.3 未分层!important样式
  - 5.4 层叠层顺序(相反)
  - 5.5 嵌套层叠层顺序(相反)
  - 5.6 内联!important样式
- 8 用户自定义!important样式
- 9 用户代理!important样式表
- 10 正在进行的过渡样式

其中用户代理样式表与用户自定义样式都可以像做作者样式一样有细分的优先级，因为重复所以这里省略了。而且除了这些之外，还有手动调整选择器优先级值的方法，比如initial, inherit, unset, revert等。

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
- MDN CSS 选择器\
  https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_selectors
- MDN CSS 伪类\
  https://developer.mozilla.org/zh-CN/docs/Web/CSS/Pseudo-classes
- MDN CSS 伪元素\
  https://developer.mozilla.org/zh-CN/docs/Web/CSS/Pseudo-elements
- MDN CSS :is()伪类\
  https://developer.mozilla.org/zh-CN/docs/Web/CSS/:is
- MDN CSS :not()伪类\
  https://developer.mozilla.org/zh-CN/docs/Web/CSS/:not
- MDN CSS :has()伪类\
  https://developer.mozilla.org/zh-CN/docs/Web/CSS/:has
- MDN CSS :where()伪类\
  https://developer.mozilla.org/zh-CN/docs/Web/CSS/:where
- MDN CSS 嵌套\
  https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_nesting
- MDN CSS 继承\
  https://developer.mozilla.org/zh-CN/docs/Web/CSS/Inheritance
- MDN CSS inherit\
  https://developer.mozilla.org/zh-CN/docs/Web/CSS/inherit
- MDN CSS initial\
  https://developer.mozilla.org/zh-CN/docs/Web/CSS/initial
- Default style sheet for HTML 4\
  https://www.w3.org/TR/CSS21/sample.html
- MDN CSS 层叠\
  https://developer.mozilla.org/zh-CN/docs/Web/CSS/Cascade
- MDN CSS font-size\
  https://developer.mozilla.org/zh-CN/docs/Web/CSS/font-size
- MDN CSS font-style\
  https://developer.mozilla.org/zh-CN/docs/Web/CSS/font-style
- MDN CSS 初始值\
  https://developer.mozilla.org/zh-CN/docs/Web/CSS/initial_value
- 有趣的CSS优先级\
  https://juejin.cn/post/7050723289194299399
- MDN CSS all属性\
  https://developer.mozilla.org/zh-CN/docs/Web/CSS/all
- MDN CSS unset\
  https://developer.mozilla.org/zh-CN/docs/Web/CSS/unset
- 【译】理解CSS关键字：“Initial”，“Inherit”和“Unset”\
  https://juejin.cn/post/6948600225900691464
- MDN CSS revert\
  https://developer.mozilla.org/en-US/docs/Web/CSS/revert
- 图解 CSS：CSS 层叠和继承\
  https://juejin.cn/post/7321558573518815258
- Chrome Version33+ 设置自定义CSS的方法\
  https://blog.csdn.net/lyl_studio/article/details/21324605
- 解决“该扩展程序未列在 Chrome 网上应用店中，并可能是在您不知情的情况下添加的”的方法\
  https://blog.csdn.net/W_Fe5/article/details/137104126
- MDN CSS !important\
  https://developer.mozilla.org/en-US/docs/Web/CSS/important
- MDN Using CSS animations\
  https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_animations/Using_CSS_animations
- 深入浅出 CSS 动画\
  https://juejin.cn/post/7052506940777168927
- MDN CSS @keyframes\
  https://developer.mozilla.org/zh-CN/docs/Web/CSS/@keyframes
- MDN CSS transitions\
  https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_transitions
- [译] 使用 CSS transitions（MDN）\
  https://juejin.cn/post/6844903859324715021
- MDN link 外部资源链接元素\
  https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/link
- MDN CSS @import\
  https://developer.mozilla.org/zh-CN/docs/Web/CSS/@import
- jsMind 一个显示/编辑思维导图的纯javascript类库\
  http://hizzgdev.github.io/jsmind/
- MDN CSS @layer\
  https://developer.mozilla.org/zh-CN/docs/Web/CSS/@layer
