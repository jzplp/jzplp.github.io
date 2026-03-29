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

## styled-components初步
styled-components是最知名的CSS in JS工具，可以在React中使用。

### 接入方式
首先安装依赖styled-components，然后删除App.css，我们不再需要独立的CSS文件了。修改App.tsx：

```jsx
import styled from "styled-components";

const Div = styled.div`
  color: red;
  font-size: 14px;
`;
const Button = styled.button`
  color: blue;
  font-size: 14px;
`;

export default function App() {
  return (
    <div>
      <Div>你好 jzplp</Div>
      <Button>你好 jzplp</Button>
    </div>
  );
}
```

此时在浏览器上可以看到生效的结果。通过代码可以看到，styled-components是利用了EcmaScript中模板字符串的“标签模板字符串”特性。因此，我们提供的CSS字符串可以被styled-components对应的函数解析，最终生成样式。

### 实现方式
上面的代码是如何生效的呢？这里我们修改一下代码，增加不同状态：

```jsx
import styled from "styled-components";
import { useState } from "react";

const Div0 = styled.div``;
const Div = styled.div`
  color: red;
  font-size: 14px;
`;
const Button = styled.button`
  color: blue;
  font-size: 14px;
`;

export default function App() {
  const [state, setState] = useState(0);

  return (
    <div>
      <Div0>1你好 jzplp</Div0>
      <Div>2你好 jzplp</Div>
      {state % 2 === 1 && <Button>3你好 jzplp</Button>}
      <div onClick={() => setState(state + 1)}>按下+1</div>
    </div>
  );
}
```

​![](/2026/css-in-js-1.png)

首先看下初始状态的效果。这里有Div0和Div两个组件，都是用styled-components生成的，因此都有一个sc-开头的类名，但这个类名上并不包含样式。Div因为有了样式，所以有另一个类名，这个类名的具体样式写在head中的style标签里面。Button组件因为没有展示，所以对应的样式也没有注入。我们再切换状态试试：

​![](/2026/css-in-js-2.png)

切换状态之后，Button组件展示并附带着样式。注意style标签中增加了一行，正是Button的样式。此时如果再次切换状态将Button组件销毁，style标签中对应的样式并不会删除。

通过对于浏览器现象的观察，我们发现了styled-components的实现方式：当组件被渲染时，将JavaScript中的CSS属性集合放到style标签中，同时动态提供hash类名。将类名提供给HTML标签作为属性渲染。这样就实现了JavaScript控制CSS代码，且在组件被渲染时才注入CSS。此时我们执行如下命令：

```sh
npm run build
npm run preview
```

然后查看打包后生产模式的效果，发现style标签中并没有CSS代码了，但样式还是生效的，也是通过hash类名。且在浏览器调试工具上点击类的来源，也能点到那个style标签，只不过浏览器上看不到其中的内容。

### 传参方式
前面的例子中CSS代码全是字符串，这些例子使用模板字符串除了能换行之外，好像也没有什么优势。使用标签模板字符串的优势在于传参。组件是要可以根据不同的传参切换样式：

```tsx
import styled from "styled-components";

interface DivProps {
  bgColor: string;
  lineHeight?: number;
}

const Div = styled.div<DivProps>`
  color: red;
  background: ${props => props.bgColor};
  font-size: 14px;
  line-height: ${props => props.lineHeight || 20}px;
`;

export default function App() {
  return (
    <div>
      <Div bgColor="blue" lineHeight={30}>2你好 jzplp</Div>
      <Div bgColor="yellow">2你好 jzplp</Div>
    </div>
  );
}
```

可以看到，首先我们在styled对应标签的函数中增加了props入参的泛型TypeScript类型。然后在模板字符串的插值中传入函数，函数的入参为props，返回对应场景下的CSS代码值。由于我们使用的“标签模板字符串”功能，因此标签函数可以读取并处理模板字符串中的插值，最后整合成完整的CSS代码。我们看下浏览器效果：

​![](/2026/css-in-js-3.png)

可以看到，不同的入参会生成不同的类名。这里我有一个疑问，如果我们的入参一直在变化，会不会一直生成类名？我们试一下：

```tsx
import styled from "styled-components";
import { useState } from "react";

interface DivProps {
  color: number;
}

const Div = styled.div<DivProps>`
  color: #${(props) => props.color};
`;

export default function App() {
  const [state, setState] = useState(0);
  return (
    <div>
      <Div color={state}>你好 {state}</Div>
      <div onClick={() => setState(state + 1)}>按下+1</div>
    </div>
  );
}
```

在上面代码中，点击一下state值加1，同时Div中的入参也会变化，生成的CSS值也会不一样。我们多点几次看看效果：

​![](/2026/css-in-js-4.png)

通过浏览器效果可以看到，我们每点击一次，就会生成一个新的类名和CSS规则。旧的CSS规则虽然永远不会被使用到了，但依然保存在浏览器中。不过代码其实不知道我们的CSS规则今后会不会被使用到。

## styled-components特性
前面我们引入了styled-components，简单介绍了实现方式和传参。这里再介绍一下更多特性。

### 组件继承
类似于面对对象，使用styled-components生成的组件也有继承特性，子组件可以继承父组件的样式。我们举个例子：

```jsx
import styled from "styled-components";

const Div = styled.div`
  color: red;
`;
const DivChild = styled(Div)`
  background: yellow;
`;

export default function App() {
  return (
    <div>
      <Div>你好 jzplp</Div>
      <DivChild>你好 jzplp</DivChild>
      <Div as="p">你好 jzplp</Div>
    </div>
  );
}
```

我们定义了Div父组件，DivChild继承并提供了自己的样式，通过结果可以看到，两个样式都生效了。第三个组件我们使用了as属性，它可以在使用预定义styled组件的同时，修改标签名。

​![](/2026/css-in-js-5.png)

父组件的props参数，子组件也是继承的，同时子组件也可以有自己的参数。我们看下例子：

```jsx
import styled from "styled-components";

const Div = styled.div`
  color: red;
  font-size:${(props) => props.size}px;
`;
const DivChild = styled(Div)`
  background: yellow;
  line-height: ${(props) => props.size + 10}px;
  border: ${(props) => props.borderSize}px solid blue;
`;

export default function App() {
  return (
    <div>
      <Div size={20}>你好 jzplp</Div>
      <DivChild size={30} borderSize={2}>你好 jzplp</DivChild>
    </div>
  );
}
```

​![](/2026/css-in-js-6.png)

通过结果可以看到，组件的参数和子组件都有自己的参数，同时子组件也可以使用父组件的参数，可以同时生效。

### 与React组件继承
前面我们看到的是styled组件互相的继承关系。事实上，它与普通React组件也可以互相继承。首先是普通React组件作为父组件：

```jsx
import styled from "styled-components";

function Comp({ state, className }) {
  return <div className={className}>{state}</div>;
}

const DivComp = styled(Comp)`
  color: ${(props) => props.color};
  font-size: 20px;
`;

export default function App() {
  return (
    <div>
      <Comp state={1} />
      <DivComp state={2} color='red' />
    </div>
  );
}
```

​![](/2026/css-in-js-7.png)

可以看到，作为父组件的Comp组件，需要提供className参数，并在组件内部恰当位置作为属性。这样子组件和父组件的props都可以正常使用，styled-components会将接收到的属性透传给父组件。然后我们再看下普通React组件作为子组件的场景：

```jsx
import styled from "styled-components";

const Div = styled.div`
  color: ${(props) => props.color};
  font-size: 20px;
`;

function Comp(props = {}) {
  return <Div {...props}>{props.state}</Div>;
}

export default function App() {
  return (
    <div>
      <Div color="red">1</Div>
      <Comp state={2} color="yellow" />
    </div>
  );
}
```

​![](/2026/css-in-js-8.png)

当普通React组件作为子组件时，我们需要手动处理透传需要的prop到子组件中。

### 嵌套选择器
前面使用React内联样式的时候，我们提到内联样式并不支持嵌套选择器，这其实是直接用React做CSS in JS的最大阻碍。 styled-components引入了stylis工具来处理，支持使用嵌套选择器。这里举下例子：

```jsx
import styled from "styled-components";

const Div = styled.div`
  color: red;
  &:hover {
    background: yellow;
  }
  &.class1 {
    border: 2px solid blue;
  }
  .class2 & {
    border: 2px solid green;
  }
`;

export default function App() {
  return (
    <div>
      <Div>1 jzplp</Div>
      <Div>2 jzplp</Div>
      <Div className="class1">3 jzplp</Div>
      <div className="class2">
        <Div>4 jzplp</Div>
      </div>
    </div>
  );
}
```

​![](/2026/css-in-js-9.png)

通过例子可以看到，无论是伪类，还是各种选择器都可以，其中使用&标识本标签的选择器。也能生效到子元素中，非styled组件：

```jsx
import styled from "styled-components";

const Div = styled.div`
  color: red;
  .class1 {
    border: 2px solid blue;
  }
`;

export default function App() {
  return (
    <div>
      <Div>
        <div className="class1">3 jzplp</div>
      </Div>
    </div>
  );
}
```

​![](/2026/css-in-js-10.png)

### CSS片段
styled-components支持创建一个CSS片段，可以提供给组件使用，并且可以带参数，使用css方法即可。

```jsx
import styled, { css } from "styled-components";

const jzCss = css`
  color: blue;
  font-size: ${props => props.size}px;
`

const Div = styled.div`
${
  props => {
    if(props.type === 1) return jzCss;
    else return `
      color: red;
      background: green;
    `;
  }
}
`;

export default function App() {
  return (
    <div>
      <Div type={1} size={20}>jzplp 1</Div>
      <Div type={1} size={30}>jzplp 2</Div>
      <Div type={2}>jzplp 3</Div>
    </div>
  );
}
```

​![](/2026/css-in-js-11.png)

可以看到代码中先创建了一个带参数的CSS片段，然后在组件字符串插值的返回中传入这个片段，参数可以正常生效渲染。else情况则直接返回了字符串CSS属性，看浏览器上也可以生效。那是不是说不需要css函数处理，直接返回模板字符串就可以了？这是肯定不行的，我们举个例子：

```jsx
import styled from "styled-components";

const Div = styled.div`
  ${() => {
    return `
        color: blue;
        font-size: ${(props) => props.size}px;
      `;
  }}
`;

export default function App() {
  return (
    <div>
      <Div size={20}>jzplp 1</Div>
    </div>
  );
}
```

​![](/2026/css-in-js-12.png)

在浏览器中可以看到，模板字符串中的插值并没有被成功处理，而是被直接转为了普通字符串，最后成了错误的CSS代码。因此必须使用css函数创建CSS片段。

### CSS动画
styled-components也支持创建@keyframes的CSS动画，同时在CSS中被引用。

```jsx
import styled, { keyframes } from "styled-components";

const colorChange = keyframes`
  0% {
    color: red;
  }
  50% {
    color: blue;
  }
  100% {
    color: red;
  }
`;

const Div = styled.div`
  animation: ${colorChange} 2s infinite;
`;

export default function App() {
  return (
    <div>
      <Div>你好，jzplp</Div>
    </div>
  );
}
```

可以看到我们使用keyframes方法创建了一个keyframes动画，在需要的CSS位置中，当作animation-name属性插入动画即可。效果如下：

​![](/2026/css-in-js-13.gif)

这里只是简单介绍了styled-components的部分特性，如果希望深入了解请看styled-components相关文档。

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
- 模板字符串 带标签的模板 MDN\
  https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Template_literals#%E5%B8%A6%E6%A0%87%E7%AD%BE%E7%9A%84%E6%A8%A1%E6%9D%BF