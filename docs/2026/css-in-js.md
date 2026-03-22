# css-in-js（未完成）
CSS作为前端代码中的重要组成部分，在工程中一般是以独立CSS文件的形式存在的。而CSS in JS，顾名思义，是在JavcaScvript中写CSS代码。尤其是React框架的流行，JavaScript和HTML模板都在JavaScript文件中描述了，只有CSS代码的组织还比较疏离。因此出现了很多CSS in JS的开源库，帮助我们将CSS放到JavcaScvript代码中，实现React组件代码的耦合性。

## React工程示例
首先我们先展示一下React工程中是如何使用CSS的，React本身有没有CSS in JS的能力。

### 不使用CSS in JS
首先使用Vite创建React工程，执行命令行：

```sh
# 选择React
npm create vite@latest
# 安装依赖
npm install
# 启动开发服务
npm run dev
```

然后将src/App.jsx文件修改为如下内容，这是一个React组件。

```jsx
import "./App.css";
export default function App() {
  return <div className="class1">你好 jzplp</div>;
}
```

然后是对应的src/App.css内容：

```css
.class1 {
  color: red;
  font-size: 15px;
}
```

打开浏览器，可以看到对应的组件样式是生效的。这就是普通React工程中CSS的使用方式，在独立文件中被引用。像CSS Modules, Less和SCSS等也都是类似这种使用模式。那如果CSS样式本身需要根据不同的场景变化呢？可以根据不同的场景提供不同的类名。这里修改下App.jsx作为示例，就不展示App.css文件了。

```jsx
import "./App.css";
export default function App({ state }) {
  return <div className={state === 1 ? "class1" : "class2"}>你好 jzplp</div>;
}
```


### 内联样式
使用类名控制样式变化可以生效，但这算是简介控制样式。有没有直接可以在JavaScript代码中控制CSS的方式呢？有的，React提供了内联样式，可以让我们直接控制：

```jsx
import "./App.css";
export default function App({ state }) {
  return (
    <div
      style={{
        color: state === 1 ? "red" : "blue",
        fontSize: "14px",
      }}
    >
      你好 jzplp
    </div>
  );
}
```

对style属性设置为对象，对象的key是CSS属性驼峰形式，可以实现对HTML中内联样式的直接控制。看起来这样挺好用的，但是它的限制还是非常大。例如不能使用伪类或者媒体查询这种CSS规则。直接操作DOM可以，但是这不优雅也失去了使用React的优势。因此，如果想要实现真正的CSS in JS，还是要看专门的工具。

## styled-components

## Emotion

## 非运行时CSS in JS
Panda CSS ?

## 各类方案比较


## 总结
vue有自己的方案，基本不需要CSS in JS。


## 参考
- styled-components 文档\
  https://styled-components.com/
- Github styled-components\
  https://github.com/styled-components/styled-components
- CSS in JS 简介 阮一峰\
  https://www.ruanyifeng.com/blog/2017/04/css_in_js.html
- 为什么 CSS in JS 这样的解决方案在国外很火，在国内却热度特别低？\
  https://www.zhihu.com/question/452075622
- CSS in JS Playground\
  https://www.cssinjsplayground.com/
- Emotion 文档\
  https://emotion.sh/
- Github Emotion\
  https://github.com/emotion-js/emotion
- 为什么我们正在放弃 CSS-in-JS\
  https://juejin.cn/post/7158712727538499598
- React CSS-In-JS 方案 : Linaria Vs Styled-Components\
  https://juejin.cn/post/7153146950701973518
- Github css-in-js-benchmark\
  https://github.com/geeky-biz/css-in-js-benchmark
- CSS in JS 各种方案比较\
  http://michelebertoli.github.io/css-in-js/
- CSS in JS的好与坏\
  https://juejin.cn/post/6844904051369328648
- JSS项目列表 GitHub\
  https://github.com/cssinjs
- JSS 文档\
  https://cssinjs.org/
- CSS-in-JS 到底是什么？\
  https://juejin.cn/post/7237053697527824440
- css-in-js这类框架解决什么痛点问题？\
  https://www.zhihu.com/question/652579845
- Panda CSS 文档\
  https://panda-css.com/
- Panda CSS GitHub\
  https://github.com/chakra-ui/panda
