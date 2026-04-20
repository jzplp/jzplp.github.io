# 原子化CSS(未完成)

在普通前端项目中，大部分你开发者会使用class名来作为CSS规则，但是这需要定义很多类名，起名字成了困难的事情。虽然类名可以复用，但是大部分类实际上是独一无二的，没有复用机会。CSS in JS可以解决部分问题，但是依然需要在项目中写大量的CSS代码。

有没有一种工具，可以预置基础的CSS基类，元素只需要引用，不用再思考类名和写大量CSS代码呢？ 原子化CSS（Atomic CSS）就能做到。它将CSS规则简化为一个个简短的原子化类名，通过拼合这些原子化类名，实现我们想要的CSS效果，同时以另一个角度看，它也基本实现了CSS in JS的效果。

## Tailwind CSS‌初步
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

### 构建特性
以开发模式运行前面的工程，在浏览器中可以看到head里面有一个style标签，里面是Tailwind CSS‌注入的CSS代码。代码比较长，是CSS Reset重置初始样式的代码。除此之外，还包含我们写入的类名所引入的CSS代码：

​![](/2026/atomic-css-3.png)

Tailwind CSS中预设的原子类名非常多，这里的style标签没有全部引入所有CSS规则，而是只引入了我们代码中需要的类名对应的CSS规则。我们再打包一下，在构建的结果代码中，类名没有变更，而且只有我们使用的类名对应的CSS规则才被引入。（当然还有初始样式的代码也被打包进来了）

​![](/2026/atomic-css-4.png)

todo  看看没有用到的和变量的特性

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
