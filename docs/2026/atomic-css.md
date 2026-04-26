# 原子化CSS(未完成)

在普通前端项目中，大部分你开发者会使用class名来作为CSS规则，但是这需要定义很多类名，起名字成了困难的事情。虽然类名可以复用，但是大部分类实际上是独一无二的，没有复用机会。CSS in JS可以解决部分问题，但是依然需要在项目中写大量的CSS代码。

有没有一种工具，可以预置基础的CSS基类，元素只需要引用，不用再思考类名和写大量CSS代码呢？ 原子化CSS（Atomic CSS）就能做到。它将CSS规则简化为一个个简短的原子化类名，通过拼合这些原子化类名，实现我们想要的CSS效果，同时以另一个角度看，它也基本实现了CSS in JS的效果。

## Tailwind CSS‌接入和构建特性
Tailwind CSS‌是最知名的原子化CSS工具，我们首先介绍下它的接入和使用方式。这里使用的是Tailwind CSS V4。

### 接入方式
使用Tailwind CSS并不限定框架，甚至不使用框架的Vanilla JS代码可以使用，而且接入方式一样。Tailwind CSS需要编译，这里我们选用Vite创建工程。

```sh
# 创建工程
npm create vite@latest
# 安装Tailwind CSS相关包
npm add tailwindcss @tailwindcss/vite
```

创建vite.config.js（如果已有Vite配置文件则添加对应配置）：

```js
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [tailwindcss()],
});
```

在项目入口创建一个CSS文件，写入如下内容（已有文件则添加内容）：

```css
@import "tailwindcss";
```

上面的接入代码对于不同框架来说都是相同的，下面尝试分别在Vanilla JS和React中接入使用Tailwind CSS。首先是Vanilla JS：

```js
import "./index.css";

function genEle(test, className) {
  const div = document.createElement("div");
  div.className = className;
  div.textContent = test;
  document.body.appendChild(div);
}

genEle("jzplp1", "text-xl font-bold text-orange-500");
```

​![](/2026/atomic-css-1.png)

Tailwind CSS预设了很多原子化的CSS类名，通过它的文档可以查到。通过浏览器效果可以看到，这些类名附加的样式一作用在元素上生效了。我们再试一下React框架：

```js
// 引入index.css的代码放到React入口文件了
export default function App() {
  return <div className='text-xl font-bold text-orange-500'>jzplp1</div>;
}
```

​![](/2026/atomic-css-2.png)

虽然框架不同，但不同的类名作用效果一模一样。

### 零运行时构建特性
以开发模式运行前面的工程，在浏览器中可以看到head里面有一个style标签，里面是Tailwind CSS‌注入的CSS代码。代码比较长，是CSS Reset重置初始样式的代码。除此之外，还包含我们写入的类名所引入的CSS代码：

​![](/2026/atomic-css-3.png)

Tailwind CSS中预设的原子类名非常多，这里的style标签没有全部引入所有CSS规则，而是只引入了我们代码中需要的类名对应的CSS规则。我们再打包一下，在构建的结果代码中，类名没有变更，而且只有我们使用的类名对应的CSS规则才被引入。（当然还有初始样式的代码也被打包进来了）

​![](/2026/atomic-css-4.png)

类名就是一个字符串，而且可能是通过变量动态赋值的。Tailwind CSS能识别放在变量中的类名么？我们举一个例子，一开始元素中没有类名，点击后通过React的state赋值类名。

```jsx
import { useState } from "react";

const cls = "text-orange-500";

export default function App() {
  const [clsState, setState] = useState("");
  return (
    <div>
      <div className={clsState}>jzplp1</div>
      <div onClick={() => setState(cls)}>点击赋值类名</div>
    </div>
  );
}
```

​![](/2026/atomic-css-5.png)

可以看到点击后是正常生效的。观察点击前，发现这个类名仅仅作为一个字符串常量，没有真正被提供给元素时，就已经被Tailwind CSS识别到，添加对应的CSS规则了。这里我们再试一个例子，将这个字符串常量拆开：

```jsx
import { useState } from "react";

const cls1 = "text-oran";
const cls2 = "ge-500";

export default function App() {
  const [clsState, setState] = useState("");
  return (
    <div>
      <div className={clsState}>jzplp1</div>
      <div onClick={() => setState(cls1 + cls2)}>点击赋值类名</div>
    </div>
  );
}
```

​![](/2026/atomic-css-6.png)

这时候，点击前在CSS中搜不到类名，点击后样式也没有正常生效。这说明，Tailwind CSS识别的方式是在代码中搜索符合预置类名的字符串，如果搜到了就添加对应的CSS规则，搜不到就不添加。我们将一个字符串拆开成两个，因此Tailwind CSS就找不到了。为了证实我们的想法，再举个例子，这此只创建字符串，但不引用到元素中：

```jsx
const cls = "text-orange-500";
console.log(cls);

export default function App() {
  return (
    <div>
      <div>jzplp1</div>
    </div>
  );
}
```

​![](/2026/atomic-css-7.png)

通过结果可以看到，我们创建的普通字符串并没有作为类名，但是因为这个字符串值符合Tailwind CSS的预置类名，因此对应的CSS规则也就被添加了。因此Tailwind CSS识别类名的方式是代码静态分析，搜到哪个字符串就添加，而并不会实际执行代码看真正应用到元素中的是哪些类。而我们打包后，对应的CSS规则便预置在代码中，生产模式运行时并不需要Tailwind CSS的参与。从这个角度看，Tailwind CSS是“零运行时”的CSS库。

这里说“预置类名”是为了方便理解，实际上Tailwind CSS是在编译时匹配类名模式，然后实际生成对应的CSSS规则。后面还会看到Tailwind CSS中组合生成的规则，以及根据类名模式生成任意值的规则。

### VSCode插件
Tailwind CSS有非常非常多的预设类命名，在文档网站中可以查到，类名虽然有规律，但对于刚接触的使用者来说还是有点困难，需要经常对照查找。因此Tailwind CSS提供了相关的编辑器插件，例如在VSCode中是Tailwind CSS IntelliSense。

​![](/2026/atomic-css-8.png)

安装上之后，写类名时会有补全提示。鼠标放到类名上时，可以看到类名对应的CSS规则。

​![](/2026/atomic-css-9.png)

## Tailwind CSS‌使用
### 伪类/伪元素/媒体查询/容器查询
大部分没有参数的伪类和伪元素，都可以通过前面加xxx:来使用。例如hover:就相当于&:hover。这里举个例子：

```jsx
export default function App() {
  return (
    <div>
      <div className='hover:text-blue-800'>jzplp1</div>
      <div className='focus:bg-amber-500'>jzplp1</div>
      <input type='text' className='placeholder:text-amber-500' placeholder='你好' />
    </div>
  );
}
```

​![](/2026/atomic-css-10.png)

对于带参数的前缀，可以使用XXX-。例如has-xxx相当于:has(xxx)。这里举几个例子，就不再截图浏览器效果了，直接给出类名和生成的CSS规则效果代码示意。

```CSS
/* 类名：not-focus:bg-amber-500 */
.not-focus\:bg-amber-500 {
  &:not(*:focus) {
    background-color: var(--color-amber-500) /* oklch(76.9% 0.188 70.08) */;
  }
}

/* 类名：has-[div]:text-left */
.has-\[div\]\:text-left {
  &:has(*:is(div)) {
    text-align: left;
  }
}
```

前面的伪类和伪元素可以任意组合使用，效果同时生效。例如：

```CSS
/* 类名：focus:active:font-medium */
.focus\:active\:font-medium {
  &:focus {
    &:active {
      font-weight: var(--font-weight-medium);
    }
  }
}

/* 类名：hover:not-[a]:border-red-500 */
.hover\:not-\[a\]\:border-red-500 {
  &:hover {
    @media (hover: hover) {
      &:not(*:is(a)) {
        border-color: var(--color-red-500);
      }
    }
  }
}
```

再来看下媒体查询相关的类名，这里Tailwind CSS‌根据查询内容的不同有不同的类名模板。这里具几个例子：

* sm 表示	@media (width >= 40rem)
* xl 表示	@media (width >= 80rem)
* max-md 表示	@media (width < 48rem)
* min-[...]	表示 @media (width >= ...)
* pointer-fine 表示 @media (pointer: fine)

```CSS
/* 类名：sm:text-center */
.sm\:text-center {
  @media (width >= 40rem) {
    text-align: center;
  }
}

/* 类名：min-[100px]:bg-blue-400 */
.min-\[100px\]\:bg-blue-400 {
  @media (width >= 100px) {
    background-color: var(--color-blue-400);
  }
}

/* 类名：pointer-fine:italic */
.pointer-fine\:italic {
  @media (pointer: fine) {
    font-style: italic;
  }
}
```

还有容器查询也是类似，就是在媒体查询部分类名的基础上加@符号，这里只给出对应关系，例子就省略了。

* @sm 表示 @container (width >= 24rem)
* @max-md 表示 @container (width < 28rem)
* @max-[...] 表示 @container (width < ...)

### 主题变量
从前面的很多例子中我们可以看到，Tailwind CSS‌使用了很多CSS变量来设置属性。像是前面的text-orange-500的颜色值并不是我们想要的，sm和xl值和我们希望的宽度也不一致。使用主题变量功能，即可在不修改类名的情况下，切换内部的CSS值。

我们修改index.css文件，增加@theme，这是Tailwind CSS的自定义指令，我们在内部设置CSS变量即可：

```css
@theme {
  --color-orange-500: red;
}
```

我们将橘色500设置为红色，然后分别设置了文字颜色，背景色，边框色都为orange-500，可以看到引用的变量还是color-orange-500，但实际都变为红色了。

```jsx
export default function App() {
  return (
    <div>
      <div className="text-orange-500">jzplp1</div>
      <div className="bg-orange-500">jzplp2</div>
      <div className="border-orange-500 border-2">jzplp3</div>
    </div>
  );
}
```

​![](/2026/atomic-css-11.png)

不仅颜色可以改，其它的很多单位都可以改，例如字号大小，间距，宽高等等。这里再举一个前面媒体查询的例子，默认的sm表示的40rem，这里改成了30rem。

```css
/* 设置主题变量 */
@theme {
  --breakpoint-sm: 30rem;
}

/* 对应结果 */
/* 类名：sm:text-center */
.sm\:text-center {
  @media (width >= 30rem) {
    text-align: center;
  }
}

/* 类名：max-sm:text-center */
.max-sm\:text-center {
  @media (width < 30rem) {
    text-align: center;
  }
}
```

可以看到，对应媒体查询相关的sm条件都一起改掉了。注意这里的查询条件并不是以CSS变量形式实现的，而是读取主题变量后，经过编译处理的。因此虽然主题变量看起来很像CSS，但确实要包裹在@theme中经过编译处理，而不是直接作为真正的CSS变量。

当然部分属性也是可以通过CSS变量修改覆盖的，例如前面的颜色，我们直接在根组件上覆盖CSS变量值，可以看到浏览器上结果是生效的。

```css
:root {
  --color-orange-500: red;
}
```

​![](/2026/atomic-css-12.png)

### 颜色变量
对于已有的颜色变量，可以设置透明度，首先介绍一种设置方式：

```CSS
/* 类名：bg-sky-500/60 */
.bg-sky-500\/60 {
  background-color: color-mix(in oklab, var(--color-sky-500) 60%, transparent);
}
```

透明度百分比在/符号后设置，这里设置了60%。在浏览器执行后，可以看到计算过程和结果：

​![](/2026/atomic-css-13.png)

上面的方式只支持百分比整数。还有几种方式，可以接收任意值或者CSS变量，这里举例一下：

```CSS
/* 类名：bg-sky-500/[66.6%] */
.bg-sky-500\/\[66\.6\%\] {
  background-color: color-mix(in oklab, var(--color-sky-500) 66.6%, transparent);
}

/* 预置CSS变量 */
:root {
  --abc-value: 88.8%;
}
/* 类名：bg-sky-500/(--abc-value) */
.bg-sky-500\/\(--abc-value\) {
  background-color: color-mix(in oklab, var(--color-sky-500) var(--abc-value), transparent);
}
```

前面了解到Tailwind CSS‌预设了很多颜色值，这些值也可以在普通用CSS中被使用。例如--color-sky-500是预设的颜色之一，我们在CSS代码中直接使用。

```CSS
.cls1 {
  color: var(--color-sky-500);
}
```

Tailwind CSS在编译时也会读取并识别这个CSS变量，并把对应的变量值提供出来。我们直接使用这个类名放到元素标签上，实测可以生效：

```jsx
export default function App() {
  return <div className="cls1">jzplp1</div>;
}
```

​![](/2026/atomic-css-14.png)

除了使用已有预设颜色之外，我们还可以定义自己的颜色值，并且拥有对应颜色值的各种类名：

```CSS
@theme {
  --color-jzplp: blue;
}
```

首先预设一个颜色值，以--color-开头，后面是自定义名字jzplp。然后我们可以在各种类名模板中使用这个新名字，通过浏览器查看都可以生效。

```jsx
export default function App() {
  return (
    <div>
      <div className="text-jzplp">jzplp1</div>
      <div className="bg-jzplp">jzplp2</div>
      <div className="border-jzplp border-1">jzplp3</div>
    </div>
  );
}
```

​![](/2026/atomic-css-15.png)

### 使用任意值
有些时候我们需要一些任意值，例如长度宽度位置等，有时候因为不通用，所以没有定义变量的必要。这时候Tailwind CSS提供了自定义值的相关语法，在[]中写入值即可。

```CSS
/* 类名：bg-[red] */
.bg-\[red\] {
  background-color: red;
}

/* 类名：bg-[#123456] */
.bg-\[\#123456\] {
  background-color: #123456;
}

/* 类名：w-[10.5px] */
.w-\[10\.5px\] {
  width: 10.5px;
}
```

也可以接收CSS变量，包裹在()里面。

```CSS
/* 类名：h-(--jzplp-height) */
.bg-\[red\] {
  background-color: red;
}

/* 类名：bg-(--jzplp-color) */
.bg-\(--jzplp-color\) {
  background-color: var(--jzplp-color);
}
```

我注意到，有些不同含义的类名模板是相同的，例如 text-。它可以可以接收数字，也可以接收颜色值等，在接收不同的值时它作用的属性不同，Tailwind CSS‌内部会处理这些：

```CSS
/* 类名：text-[10px] */
.text-\[10px\] {
  font-size: 10px;
}

/* 类名：text-[red] */
.text-\[red\] {
  color: red;
}
```

但如果接收的是CSS变量，值是不确定的，这时候Tailwind CSS就无法处理了，需要我们指定数据类型：

```CSS
/* 类名：text-(length:--jzplp-value) */
.text-\(length\:--jzplp-value\) {
  font-size: var(--jzplp-value);
}

/* 类名：text-(color:--jzplp-value) */
.text-\(color\:--jzplp-value\) {
  color: var(--jzplp-value);
}
```

最后再列举一个after伪元素的示例：

```jsx
export default function App() {
  return <div className="after:content-['hello']">jzplp1 </div>;
}

/* 类名：after:content-['hello']
.after\:content-\[\'hello\'\] {
  &::after {
    --tw-content: 'hello';
    content: var(--tw-content);
  }
}
*/
```

​![](/2026/atomic-css-16.png)

### 自定义utility
utility像是一个加强版的类名，可以用作类使用，也可以创建类模板。首先我们先列举一个简单的例子。

```css
@utility abc {
  color: blue;
  .bcd {
    color: red;
  }
}
```

首先我们创建了一个utility名叫abc，它就像一个正常的CSS规则，可以写CSS属性，嵌套CSS规则，使用时就是正常的类名。

```jsx
export default function App() {
  return (
    <div className="abc">
      jzplp1 <div className="bcd">jzplp2</div>
    </div>
  );
}
```

​![](/2026/atomic-css-17.png)

utility不仅能作为普通类名，还可以和前面介绍的内容组合，例如伪类。普通类名就无法组合。

```CSS
/* 类名：hover:abc */
.hover\:abc {
  &:hover {
    @media (hover: hover) {
      color: blue;
      .bcd {
        color: red;
      }
    }
  }
}
```

utility名称中还可以接收*号，此时它就变为“类名模板”，可以根据名称中的参数动态生成CSS样式。在utility代码中，使用--value()可以读取值，里面放的是值类型。以下面这种形式只能接收number, integer, ratio, percentage四种类型。然后我们在类名中提供相应的值即可。

```css
@utility abc-* {
  flex-grow: --value(number);
}

/* 类名：abc-2 */
.abc-2 {
  flex-grow: 2;
}

/* 类名：hover:abc-3 */
.hover\:abc-3 {
  &:hover {
    @media (hover: hover) {
      flex-grow: 3;
    }
  }
}
```

还可以给出一个字符串选项，这样可以接受字符串参数：

```CSS
@utility abc-* {
  text-align: --value('left', 'center', 'right');
}

/* 类名：abc-center */
.abc-center {
  text-align: center;
}
```

如果使用自定义属性语法，便可以接收非常多类型的参数，例如颜色，长度，位置，数字，url等等。这里举例长度和颜色的形式：

```CSS
@utility abc-* {
  width: --value([length]);
}
/* 类名：abc-[10px] */
.abc-\[10px\] {
  width: 10px;
}

@utility abc-* {
  color: --value([color]);
}
/* 类名：abc-[red] */
.abc-\[red\] {
  color: red;
}
```

参数值也可以用来组合成CSS变量：

```CSS
@utility abc-* {
  color: --value(--color-sky-*);
  background: --value(--color-sky-*);
}

/* 类名：abc-500 */
.abc-500 {
  color: var(--color-sky-500);
  background: var(--color-sky-500);
}
```

通过utility功能，我们可以更灵活的定制自己工程的类名，满足各种组合需求。

## Windi CSS

## UnoCSS

## 总结


## 参考

- Tailwind CSS‌ 文档\
  https://tailwindcss.com/
- Tailwind CSS‌ GitHub\
  https://github.com/tailwindlabs/tailwindcss
- Windi CSS 文档\
  https://windicss.org/
- Windi CSS GitHub\
  https://github.com/windicss/windicss
- UnoCSS 文档\
  https://unocss.dev/
- UnoCSS GitHub\
  https://github.com/unocss/unocss
