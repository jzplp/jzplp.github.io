# 原子化CSS(未完成)

在普通前端项目中，大部分你开发者会使用class名来作为CSS规则，但是这需要定义很多类名，起名字成了困难的事情。虽然类名可以复用，但是大部分类实际上是独一无二的，没有复用机会。CSS in JS可以解决部分问题，但是依然需要在项目中写大量的CSS代码。

有没有一种工具，可以预置基础的CSS基类，元素只需要引用，不用再思考类名和写大量CSS代码呢？ 原子化CSS（Atomic CSS）就能做到。它将CSS规则简化为一个个简短的原子化类名，通过拼合这些原子化类名，实现我们想要的CSS效果，同时以另一个角度看，它也基本实现了CSS in JS的效果。

## Tailwind CSS‌接入和构建特性
Tailwind CSS‌是最知名的原子化CSS工具，我们首先介绍下它的接入和使用方式。

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
### 伪类/伪元素/媒体查询
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

对于带参数的前缀，可以使用XXX-。这里举几个例子，就不再截图浏览器效果了：

```CSS
/* 
类名：not-focus:bg-amber-500
对应CSS规则示意： 
*/
.not-focus\:bg-amber-500 {
  &:not(*:focus) {
    background-color: var(--color-amber-500) /* oklch(76.9% 0.188 70.08) */;
  }
}

/* 
类名：has-[div]:text-left
对应CSS规则示意： 
*/
.has-\[div\]\:text-left {
  &:has(*:is(div)) {
    text-align: left;
  }
}
```

todo 媒体查询




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
