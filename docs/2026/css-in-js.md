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

## @emotion/styled
下面来介绍一下Emotion这个库。这个库有好几种使用方式，首先我们从类似styled-components，即styled组件的使用方式开始介绍，主要使用@emotion/styled这个包。

### 接入方式
首先安装@emotion/styled依赖，然后修改src/App.jsx：

```jsx
import styled from "@emotion/styled";

const Div = styled.div`
  color: red;
  background: ${(props) => props.bg};
`;

export default function App() {
  return (
    <div>
      <Div bg="blue">你好，jzplp</Div>
      <Div bg="yellow">你好，jzplp</Div>
    </div>
  );
}
```

上面代码的使用方式与styled-components一模一样，换个包名也能生效。效果也一样，区别在于开发模式下@emotion/styled有两个style标签，如下图。生产模式与styled-components一样，都是一个style标签且看不到内容。

​![](/2026/css-in-js-14.png)

### CSS片段
不仅接入方式，@emotion/styled的大部分特性都和styled-components一样，包括继承，嵌套选择器等。但CSS片段有些不一样：

```jsx
import styled from "@emotion/styled";
import { css } from '@emotion/react';

// 错误方式
const commonStyle1 = css`
  font-size: 20px;
  background: ${(props) => props.bg};
`;

const commonStyle2 = (props) => css`
  font-size: 20px;
  background: ${props.bg};
`;

const Div1 = styled.div`
  color: red;
  ${commonStyle1}
`;

const Div2 = styled.div`
  color: green;
  ${commonStyle2}
`;

export default function App() {
  return (
    <div>
      <Div1 bg="yellow">你好，jzplp1</Div1>
      <Div2 bg="yellow">你好，jzplp2</Div2>
    </div>
  );
}
```

​![](/2026/css-in-js-15.png)

首先CSS片段的函数是在另一个包@emotion/react中引入的。commonStyle1是用styled-components模式引入的，将函数直接放到CSS片段中，是不生效的。必须要将片段本身放到一个大函数内部才行，如commonStyle2的形式。

### 函数入参
@emotion/styled中的组件也支持函数作为入参，而非模板字符串。函数可以返回style对象，也能返回拼好的字符串。

```jsx
import styled from "@emotion/styled";

const Div1 = styled.div((props) => {
  return {
    color: "red",
    background: props.bg,
  };
});

const Div2 = styled.div((props) => {
  return `
    color: pink;
    background: ${props.bg};
  `;
});

export default function App() {
  return (
    <div>
      <Div1 bg="yellow">你好，jzplp1</Div1>
      <Div1 bg="green">你好，jzplp2</Div1>
      <Div2 bg="yellow">你好，jzplp3</Div2>
      <Div2 bg="green">你好，jzplp4</Div2>
    </div>
  );
}
```

​![](/2026/css-in-js-16.png)

## @emotion/react
### 接入css属性
Emotion除了styled组件使用方式之外，也可以使用组件css属性（css Prop）的使用方式。这种方式是在React中JSX的组件上增加一个css属性。因此这种方式需要修改React编译相关参数。这里以vite@8和@vitejs/plugin-react@6为例来说明。首先安装依赖@emotion/react。然后修改vite.config.js配置文件：

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react({
      // 指定转换jsx语法的模块
      jsxImportSource: '@emotion/react',
    })],
})
```

然后就可以使用了。如果需要TypeScript类型正确提示，则需要修改tsconfig.json：

```json
{
  "compilerOptions": {
    // types在原有基础上新增"@emotion/react/types/css-prop"
    "types": ["...", "@emotion/react/types/css-prop"],
    "jsxImportSource": "@emotion/react",
  },
}
```

然后我们修改App.jsx，内容如下：

```jsx
export default function App() {
  return (
    <>
      <div
        css={{
          color: "red",
          "&:hover": {
            background: "green",
          },
        }}
      >
        你好 jzplp
      </div>
    </>
  );
}
```

可以看到，我们直接以对象的形式对组件JSX的css属性赋值，而且还包含hover伪类，最后在开发模式和生产模式都可以正常生效。

​![](/2026/css-in-js-17.png)

除了对象形式之外，css属性还支持CSS片段的形式：

```jsx
import {css} from "@emotion/react";
export default function App() {
  return (
    <>
      <div
        css={css`
          color: red;
          &:hover {
            background: green;
          }
        `}
      >
        你好 jzplp
      </div>
    </>
  );
}
```

### css属性继承
从前面的接入例子中我们看到，css属性还是通过class名的形式生效的。因此它的优先级低于style属性，即内联样式。如果父组件提供了css属性想让子组件生效，则需要传入className参数。那么如果父子组件都有css属性，他们的优先级如何呢？这里举个例子：

```jsx
function Comp1({ className }) {
  return (
    <div
      css={{
        background: 'yellow',
        color: "red",
      }}
      className={className}
    >
      你好 jzplp
    </div>
  );
}

function Comp2() {
  return (
    <Comp1
      css={{
        fontSize: "20px",
        color: "blue",
      }}
    >
      你好 jzplp
    </Comp1>
  );
}

export default function App() {
  return (
    <>
      <Comp1 />
      <Comp2 />
    </>
  );
}
```

这里创建了两个组件，Comp1是自组件，Comp2是父组件。子组件和父组件中的CSS属性不冲突的可以同时生效，冲突属性以父组件的为准，例如这里的color。

​![](/2026/css-in-js-18.png)

### 样式对象
前面我们演示过，不管是styled组件，css属性还是CSS片段，都可以接收对象类型的样式数据。关于对象类型还有其它特性，这里我们一起描述一下。首先是数组类型，这里列举了两个例子：

```jsx
import styled from "@emotion/styled";

const styleList = [
  {
    color: "red",
  },
  {
    fontSize: "20px",
  },
];

const Comp1 = styled.div(styleList);

function Comp2() {
  return <div css={styleList}>你好 jzplp2</div>;
}

export default function App() {
  return (
    <>
      <Comp1>你好 jzplp1</Comp1>
      <Comp2 />
    </>
  );
}
```

styled组件也同时支持多个入参：

```jsx
import styled from "@emotion/styled";

const Comp1 = styled.div(
  {
    color: "red",
  },
  (props) => {
    return {
      fontSize: `${props.size}px`,
    };
  },
);

export default function App() {
  return <Comp1 size={20}>你好 jzplp1</Comp1>;
}
```

样式对象还支持回退值（默认值）。通过对属性值传入一个数组，最后面的值优先级最高，如果不存在则取前面的值：

```jsx
function Div1({ color, children }) {
  return (
    <div
      css={{
        color: ["red", color],
      }}
    >{children}</div>
  );
}

export default function App() {
  return (
    <>
      <Div1>你好 jzplp1</Div1>
      <Div1 color="blue">你好 jzplp2</Div1>
    </>
  );
}
```

​![](/2026/css-in-js-19.png)

### 全局样式
@emotion/react支持创建全局样式，也是使用组件的形式。当组件被渲染时，全局样式生效，组件不被渲染时则不生效。

```jsx
import { useState } from "react";
import { Global } from "@emotion/react";

export default function App() {
  const [state, setState] = useState(0);
  return (
    <>
      <Global
        styles={{
          ".class1": {
            color: "red",
          },
        }}
      />
      {!!(state % 2) && (
        <Global
          styles={{
            ".class2": {
              background: "yellow",
            },
          }}
        />
      )}
      <div className="class1 class2">你好 jzplp</div>
      <div onClick={() => setState(state + 1)}>按下变换</div>
    </>
  );
}
```

​![](/2026/css-in-js-20.png)

使用全局样式时，我们只要使用普通类名即可生效。当我们切换state的状态时，黄色的背景颜色也在变化。对应Global组件不渲染时，插入的CSS代码会被移除，渲染时会被引入。

## @emotion/css
前面我们描述Emotion相关包，都是使用在React框架之内的。在React之外，还提供了@emotion/css包，用法和前面类似。

### 接入方式
首先我们创建一个工程接入@emotion/css。这里选用Vite。首先执行命令行：

```sh
npm init -y
npm add -D vite
npm add @emotion/css
```

然后在package.json的scripts中增加三个命令，分别是开发模式运行，打包和预览打包后的成果。

```json
{
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
}
```

然后创建index.html，为浏览器入口文件，其中引入了index.js。

```html
<html>
  <meta charset="UTF-8">
  <head>
    <title>jzplp的@emotion/css实验</title>
  </head>
  <body>
    <script src="./index.js" type="module"></script>
  </body>
</html>
```

然后是index.js的实现，引入了@emotion/css：

```js
import { css } from '@emotion/css'

function genEle(test, className) {
  const div = document.createElement("div");
  div.className = className;
  div.textContent = test;
  document.body.appendChild(div);
}

const styles1 = css`
  color: red;
`;
const styles2 = css({
  color: 'blue',
});

console.log(styles1, styles2);
genEle('test1', styles1);
genEle('test2', styles2);

/* 输出结果
css-qm6gfa css-14ksm7b
*/
```

最后执行npm run dev命令，在浏览器查看结果。可以看到，我们和在React中使用一样，还是用模板字符串或者样式对象创建，但是创建后得到的结果是类名，我们直接放到DOM元素上即可。

​![](/2026/css-in-js-21.png)

### 样式数据
除了上面的模板字符串和样式对象之外，@emotion/css也支持数组类型以及嵌套选择器等属性，这里举例看一下。

```js
import { css } from "@emotion/css";

function genEle(test, className) {
  const div = document.createElement("div");
  div.className = className;
  div.textContent = test;
  document.body.appendChild(div);
}

const styles1 = css`
  color: red;
  &:hover {
    background: yellow;
  }
`;
const styles2 = css([
  {
    color: "blue",
  },
  {
    "&:hover": {
      background: "yellow",
    },
  },
]);

console.log(styles1, styles2);
genEle("test1", styles1);
genEle("test2", styles2);
```

### 全局样式
@emotion/css也支持全局样式，但是引入方式不一样：

```js
import { injectGlobal  } from "@emotion/css";

function genEle(test, className) {
  const div = document.createElement("div");
  div.className = className;
  div.textContent = test;
  document.body.appendChild(div);
}

injectGlobal`
  .class1 {
    color: red;
    &:hover {
      background: yellow;
    } 
  }
`;

genEle("test1", 'class1');
```

### cx优先级处理
@emotion/css提供了一个cx方法，它的作用和知名的classnames包一样，都是合并class类名的。但是这个cx提供了优先级功能，即后面的类中的样式优先级比前面的高：

```js
import { cx, css } from "@emotion/css";

function genEle(test, className) {
  const div = document.createElement("div");
  div.className = className;
  div.textContent = test;
  document.body.appendChild(div);
}

const cls1 = css`
  font-size: 20px;
  background: green;
`;
const cls2 = css`
  font-size: 20px;
  background: blue;
`;

genEle("test1", cx(cls1, cls2));
genEle("test2", cx(cls2, cls1));
```

这里我们创建了两个样式，其中背景颜色是冲突的。然后我创建了两个div，使用cx方法合并类名，但是连接各个div合并的顺序相反。在浏览器查看效果发现，实际展示的背景色也不一样，以后面的类名为准。

​![](/2026/css-in-js-22.png)

## linaria与React
前面介绍的styled-components和@emotion，都是运行时CSS，即对应的生成样式的代码执行到的时候，这段CSS才会生成。因此这种库需要在打包后的代码中保留注入CSS的逻辑。还有另一类CSS in JS的库是零运行时的，即编译时生成CSS文件，在生产代码中直接引入即可，无需额外注入。这里先介绍linaria，它就是一个零运行时的库。

### 接入方式
我们依然以vite为例接入。linaria的背后依赖WyW-in-JS，它是一个零运行时CSS库的辅助工具包。首先执行命令行：

```sh
npm create vite@latest
npm add @linaria/core @linaria/react @wyw-in-js/vite
```

修改vite.config.ts，增加wyw配置：

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import wyw from '@wyw-in-js/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), wyw()],
})
```

然后修改App.tsx，接入linaria：

```tsx
import { styled } from "@linaria/react";

const Div1 = styled.div`
  color: red;
`;

const Div2 = styled.div`
  color: blue;
  &:hover {
    background: yellow;
  }
`;

export default function App() {
  return (
    <div>
      <Div1>jzplp1</Div1>
      <Div2>jzplp2</Div2>
    </div>
  );
}
```


可以看到，这个使用方式就是styled组件的使用方式，和前面的库基本一致。以开发模式在浏览器中运行效果如下：

​![](/2026/css-in-js-23.png)

### 零运行时特性
在前面的接入方式中，我们并没有看到它与其它CSS in JS库的不同点。这一节我们专门看一下零运行时和前面的库究竟有什么不一样。首先修改App.tsx：

```tsx
import { useState } from "react";
import { styled } from "@linaria/react";

const Div1 = styled.div`
  color: red;
`;

const Div2 = styled.div`
  color: blue;
  &:hover {
    background: yellow;
  }
`;

export default function App() {
  const [state, setState] = useState(0);

  return (
    <div>
      <Div1>jzplp1</Div1>
      {state % 2 === 1 && <Div2>jzplp2</Div2>}
      <div onClick={() => setState(state + 1)}>按下切换</div>
      <div>当前state {state}</div>
    </div>
  );
}
```

在代码中我们设置了变化的state状态，一开始为0时不展示Div2，当按下切换时，Div2才被执行和创建。注意当一开始Div2没被执行的时候，运行时的CSS in JS库是不会创建Div2对应的CSS代码的（因为代码都没执行到那里）。但linaria却会将CSS代码全都创建和引入，即使这些代码没有被使用。我们看下初始化时，linaria的效果：

​![](/2026/css-in-js-24.png)

注意看浏览器网络请求中有一个CSS请求，它的内容为当前引入的CSS代码，包括没由被创建的元素的CSS代码：

​![](/2026/css-in-js-25.png)

然后我们将代码打包（npm run build）后，查看一下打包文件。可以看到我们在JavaScript中写的CSS代码，已经被编译成一个独立的CSS文件被引入到HTML中了，变成了普通CSS的形式。

​![](/2026/css-in-js-26.png)

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
- Vite 文档\
  https://cn.vitejs.dev/
- linaria 网站\
  https://linaria.dev/
- linaria GitHub\
  https://github.com/callstack/linaria
- Vanilla-extract 文档\
  https://vanilla-extract.style/
- Vanilla-extract GitHub\
  https://github.com/vanilla-extract-css/vanilla-extract
- WyW-in-JS 文档\
  https://wyw-in-js.dev/
