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

### 自定义custom-variant
custom-variant可以自定义包裹类的一段CSS规则，实际上就是前面类名中冒号的用法。这里我们举个例子。创建一个custom-variant。

```CSS
@custom-variant abc {
  &:hover:active {
    @slot;
  }
}
```

其中的slot表示使用时，冒号后面的CSS规则会被填充进这里。我们使用试一下：

```jsx
export default function App() {
  return <div className="abc:text-blue-500">jzplp2</div>;
}
```

​![](/2026/atomic-css-18.png)

custom-variant可以接收任意条件组合。这里再举一个例子，不仅用了媒体查询，还增加了元素样式。

```CSS
@custom-variant abc {
  @media screen and (max-width: 600px) {
    @slot;
    & {
      background: red;
    }
  }
}

/* 类名：abc:text-blue-500 */
.abc\:text-blue-500 {
  @media screen and (max-width: 600px) {
    color: var(--color-blue-500);
    background: red;
  }
}
```

## UnoCSS‌接入和构建特性
UnoCSS是一个原子CSS引擎，它本身不包含类名模板，而是通过各种各样的规则和预设实现各种风格的原子化CSS样式。当然其中也包含Tailwind CSS的样式。

### 接入方式
这里还是使用Vite，尝试在React中接入。首先执行命令行：

```sh
# 创建工程
npm create vite@latest
# 安装UnoCSS相关包
npm add -D unocss @unocss/preset-wind4
```

修改vite.config.js，接入UnoCSS。

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import UnoCSS from "unocss/vite";

export default defineConfig({
  plugins: [UnoCSS(), react()],
});
```

创建文件uno.config.ts，这是UnoCSS的配置文件。我们引入presetWind4这个预设，它恰恰就是我们前面介绍的Tailwind CSS V4的样式。

```ts
import { defineConfig, presetWind4 } from "unocss";

export default defineConfig({
  presets: [presetWind4()],
});
```

然后在入口文件main.tsx中引入这一句，这样接入就完成了。

```js
import 'virtual:uno.css'
```

我们在App.tsx中尝试几个Tailwind CSS的类名，通过浏览器可以看到成功应用到元素中了。

```jsx
export default function App() {
  return (
    <div>
      <div className="bg-amber-500">jzplp1</div>
      <div className="hover:text-sky-500">jzplp2</div>
    </div>
  );
}
```

​![](/2026/atomic-css-19.png)

虽然应用成功，但可以看到具体CSS规则的实现方式是不一样的。head元素中也发现了一个style标签，里面有重置初始样式的代码，以及我们写入的类名所引入的CSS代码。

### Tailwind的特性UnoCSS能用么
在前面接入方式中，我们引入了@unocss/preset-wind4预设，使得UnoCSS的类名和表现接近于Tailwind CSS V4。那么到底有多接近呢？Tailwind CSS的特性在UnoCSS中可以使用么？这里我们来尝试一下。

| 特性类别 | 类名举例 | 是否支持 |
| - | - | - |
| 伪类 | focus:bg-amber-500 | 支持 |
| 伪元素 | placeholder:text-amber-500 | 支持 |
| 带参数的伪类 | not-focus:bg-amber-500 | 支持 |
| 大括号参数的伪类 | `has-[div]:text-left` | 支持 |
| 组合伪类 | `hover:not-[a]:border-red-500` | 支持 |
| 媒体查询 | `min-[100px]:bg-blue-400` | 支持 |
| 媒体查询 | `pointer-fine:italic` | 不支持 |
| 颜色透明度 | bg-sky-500/60 | 支持 |
| 颜色透明度 | `bg-sky-500/[66.6%]` | 支持 |
| 使用任意值 | `w-[10.5px]` | 支持 |
| 使用CSS变量 | bg-(--jzplp-color) | 不支持 |
| after伪元素 | `after:content-['hello']` | 支持 |

可以看到，绝大部分直接使用的类名是支持的。只有少部分特殊类名，以及自定义CSS变量相关的不支持。这里再列举一下其它非预设类名相关特性的支持情况：

| 特性类别 | 举例 | 是否支持 |
| - | - | - |
| CSS文件中使用预设变量 | `color: var(--color-sky-500)` | 不支持 |
| 修改预设CSS变量 | `--colors-sky-500: red` | 支持 |
| @theme | - | 不支持 |
| @utility | - | 不支持 |
| @custom-variant | - | 不支持 |

可以看到，对于非预设的类名，尤其是通过各种Tailwind CSS中CSS指令实现的特性，UnoCSS都不支持。我们咋一看@unocss/preset-wind4和Tailwind CSS很像，但深入使用会发现，两者的区别很大。那是否说明UnoCSS的灵活性不高，不能自定义使用方式呢？

不是的。UnoCSS的名称叫做“原子化CSS引擎”，那么它必然有很强的扩展能力，只不过扩展和自定义方式与Tailwind CSS不一样。在后面的部分中我们会逐一介绍UnoCSS的扩展能力。

### 零运行时构建特性
在描述构建特性之前，我们先把重置初始样式的CSS代码删除，不然影响我们后面查看效果。设置uno.config.ts：

```js
import { defineConfig, presetWind4 } from "unocss";

export default defineConfig({
  presets: [
    presetWind4({
      preflights: { reset: false, },
    }),
  ],
});
```

然后进行构建。对应的React组件源码和生成的CSS代码如图所示。确实基本只剩下了我们引入的类相关的CSS规则了。从这个CSS代码也可以看到，UnoCSS生成的代码体积比Tailwind CSS‌更大。

​![](/2026/atomic-css-20.png)

与Tailwind CSS‌一致，UnoCSS也是零运行时的，在构建时扫描源码文件内容，寻找能匹配上的类名，然后注入CSS规则。这里我们依然试一下只引入字符串，不作为类名：

```jsx
const data = "text-orange-500";
console.log(data);
export default function App() {
  return <div className="text-sky-500">jzplp1</div>;
}
```
通过结果可以看到，虽然text-orange-500没有作为类名使用，但生成代码中还是包含对应的CSS规则。

​![](/2026/atomic-css-21.png)

UnoCSS并非扫描所有文件，在默认情况下他会扫描.jsx, .tsx, .vue, .md, .html等文件。这不包含.ts和.js文件。如果希望将这两种文件包含进来，可以修改uno.config.ts：

```js
import { defineConfig, presetWind4 } from "unocss";

export default defineConfig({
  content: {
    pipeline: {
      include: [
        // 默认扫描文件类型
        /\.(vue|svelte|[jt]sx|vine.ts|mdx?|astro|elm|php|phtml|marko|html)($|\?)/,
        // 新增的文件类型
        'src/**/*.{js,ts}',
      ],
    },
  },
  presets: [
    presetWind4({
      preflights: { reset: false, },
    }),
  ],
});
```

注意，这里的include配置是完全覆盖的，如果我们没设置默认的扫描类型，它将不会扫描这些默认类型对应的文件。那么是不是这里可以增加任意类型文件呢？我们创建一个src/abc.txt文件，内容为text-orange-500，同时在默认扫描文件类型中增加txt。再次构建，发现成果中并没有text-orange-500相关的CSS规则，这说明没有被扫描到。这是因为pipeline配置仅仅扫描从构建工具流水线中获取到的文件内容，txt文件构建工具根本不会读取，因此更不会扫描了。如果希望扫描，需要增加filesystem配置，将txt文件纳入到构建工具处理中。

```js
import { defineConfig, presetWind4 } from "unocss";

export default defineConfig({
  content: {
    pipeline: {
      include: [
        // 默认扫描文件类型
        /\.(vue|svelte|[jt]sx|vine.ts|mdx?|astro|txt|elm|php|phtml|marko|html)($|\?)/,
        // 新增的文件类型
        "src/**/*.{js,ts}",
      ],
    },
    filesystem: ["src/**/*.txt"],
  },
  presets: [
    presetWind4({
      preflights: { reset: false },
    }),
  ],
});
```

对于txt这种构建工具默认没有处理的文件类型，需要同时设置pipeline和filesystem才可以生效。通过查看构建结果，发现text-orange-500相关的CSS规则已经生效，这里就不提供图片了。UnoCSS还提供了其他方式可以增加扫描内容，内联文本时以其中一种方式，它可以支持直接字符串，或者函数返回形式，函数可以是异步的：

```js
import { defineConfig, presetWind4 } from "unocss";

export default defineConfig({
  content: {
    inline: [
      // 文本字符串
      'text-sky-500',
      // 函数形式
      () => {
        return 'text-orange-500'
      }
    ]
  },
  presets: [
    presetWind4({
      preflights: { reset: false },
    }),
  ],
});
```

另外，UnoCSS还支持白名单safelist，可以传入字符串数字，数组内的类名会加入编译生成CSS规则。我认为它和inline内联文本的形式非常像，而且inline的形式更灵活：

```js
import { defineConfig, presetWind4 } from "unocss";

export default defineConfig({
  safelist: ["text-sky-500", "text-orange-500"],
  presets: [
    presetWind4({
      preflights: { reset: false },
    }),
  ],
});
```

## UnoCSS的自定义相关 todo




## 总结

Windi CSS已经逐渐停止维护，这里不再介绍了，UnoCSS是Windi CSS的精神继承者。



## 参考

- Tailwind CSS‌ 文档\
  https://tailwindcss.com/
- Tailwind CSS‌ GitHub\
  https://github.com/tailwindlabs/tailwindcss
- Windi CSS 文档\
  https://windicss.org/
- Windi CSS GitHub\
  https://github.com/windicss/windicss
- Windi CSS is Sunsetting\
  https://windicss.org/posts/sunsetting.html
- UnoCSS 文档\
  https://unocss.dev/
- UnoCSS GitHub\
  https://github.com/unocss/unocss
