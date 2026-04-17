# css-in-js（未完成）

CSS作为前端代码中的重要组成部分，在工程中一般是以独立CSS文件的形式存在的。而CSS in JS，顾名思义，是在JavcaScvript中写CSS代码。尤其是React框架的流行，JavaScript和HTML模板都在JavaScript文件中描述了，只有CSS代码的组织还比较疏离。因此出现了很多CSS in JS的开源库，帮助我们将CSS放到JavcaScvript代码中，实现React组件代码的耦合性。

## React工程示例

首先我们先展示一下React工程中是如何使用CSS的，以及React本身有没有CSS in JS的能力。

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
使用类名控制样式变化可以生效，但这算是间接控制样式。有没有直接可以在JavaScript代码中控制CSS的方式呢？有的，React提供了内联样式，可以让我们直接控制：

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

对style属性设置为对象，对象的key是CSS属性驼峰形式，可以实现对HTML中内联样式的直接控制。看起来这样挺好用的，但是它的限制还是非常大。例如不能使用伪类或者媒体查询这种CSS规则。

直接操作DOM可以使用CSS规则，但这不优雅也失去了使用React的优势。因此，如果想要实现真正的CSS in JS，还是要看专门的工具。

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

此时在浏览器上可以看到生效的结果。通过代码可以看到，styled-components是利用了‌ECMAScript中模板字符串的“标签模板字符串”特性。因此我们提供的CSS字符串可以被styled-components对应的函数解析，最终生成样式。

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
前面的例子中CSS代码全是字符串，但使用模板字符串除了能换行之外，好像也没有什么优势。使用标签模板字符串的优势在于传参。组件可以根据不同的传参切换样式：

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

通过结果可以看到，组件的参数和子组件都有自己的参数，子组件也可以使用父组件的参数，可以同时生效。

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

### 零运行时中的参数
前面我们说过零运行时的库，会把CSS提前编译好放到文件中。对于固定的CSS代码来说非常容易，但当CSS中出现变量参数时，即CSS代码不确定时，应该怎么实现呢？这里我们举个例子看一下：

```jsx
import { styled } from "@linaria/react";

const Div1 = styled.div`
  color: ${(props) => props.color || "yellow"};
`;

export default function App() {
  return (
    <div>
      <Div1>jzplp1</Div1>
      <Div1 color="red">jzplp1</Div1>
      <Div1 color="blue">jzplp1</Div1>
    </div>
  );
}
```
通过代码可以看到，传参方式和其它库基本一致。但是查看生成的代码，却发现不一致之处。运行时的库会直接生成完整的CSS代码提供，并且有一个自己专属的类名。但零运行时的库却将参数作为一个CSS变量引用。同时在对应组件的style属性中提供对应的CSS属性值，以此代码的零运行时特性。

​![](/2026/css-in-js-27.png)

打包后查看生成代码，也可以看到生成的带变量的CSS规则代码，以及我们根据处理props属性生成CSS变量的函数。这个函数只能在运行时处理。

​![](/2026/css-in-js-28.png)

### CSS变量参数的限制
CSS变量虽然有效，但它的逻辑并不是字符串匹配，因此使用方式还是和运行时库有区别。我们先举一个普通的CSS代码作为例子，尝试了三种变量组合的场景。

```css
.class1 {
  --classVar1: 21px;
  font-size:var(--classVar1);
}
.class2 {
  --classVar1: 21;
  font-size:var(--classVar1)px;
}
.class3 {
  --classVar1: 1px;
  font-size: 2var(--classVar1);
}
```

然后是对应的React代码：

```jsx
import "./App.css";

export default function App() {
  return (
    <div>
      <div className="class1">jzplp1</div>
      <div className="class2">jzplp2</div>
      <div className="class3">jzplp3</div>
    </div>
  );
}
```

​![](/2026/css-in-js-29.png)

看可以看到只有第一个例子生效了，是21px整个作为CSS变量值。将这个值拆开是不能生效的，更不能像字符串那样随意拼合。那利用CSS变量作为参数方案的linaria呢？我们试一下：

```jsx
import { styled } from "@linaria/react";

const Div1 = styled.div`
  font-size: ${(props) => props.size + "px"};
`;

const Div2 = styled.div`
  font-size: ${(props) => props.size}px;
`;

const Div3 = styled.div`
  font-size: ${(props) => props.size}1px;
`;

const Div4 = styled.div`
  font-size: 2${(props) => props.size}px;
`;

export default function App() {
  return (
    <div>
      <Div1 size={21}>jzplp1</Div1>
      <Div2 size={21}>jzplp2</Div2>
      <Div3 size={2}>jzplp3</Div3>
      <Div4 size={1}>jzplp4</Div4>
    </div>
  );
}
```

​![](/2026/css-in-js-30.png)

通过例子可以看到，21px整个作为参数与21作为参数都是可以的，2或者1单独作为参数就不行了，会造成CSS代码解析错误。这里21生效应该是linaria特殊处理过，把后面的px拼接上了。

### CSS声明块作为参数
linaria也可以接收CSS生命块作为模板参数：

```jsx
import { styled } from "@linaria/react";

const cssObj = {
  color: "red",
  fontSize: "20px",
}
const cssStr = `
  color: red;
  font-size: 20px;
`;

const Div1 = styled.div`
  background: yellow;
  ${cssObj}
`;
const Div2 = styled.div`
  background: yellow;
  ${cssStr}
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

​![](/2026/css-in-js-31.png)

可以看到，不管是字符串模板还是对象形式都是支持的。但整个块对象不能是由函数返回的，即只能在编译时处理完成，不能有运行时特性。这还是由于前面CSS变量作为实现方案的原因，导致无法生效。这里举个例子：

```jsx
import { styled } from "@linaria/react";

const cssObj = {
  color: "red",
  fontSize: "20px",
}
const cssStr = `
  color: red;
  font-size: 20px;
`;

const Div1 = styled.div`
  background: yellow;
  ${() => cssObj}
`;
const Div2 = styled.div`
  background: yellow;
  ${() => cssStr}
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

​![](/2026/css-in-js-32.png)

通过结果看到，用函数包裹起来（假设它是接收props之后运行时计算的CSS代码）并未生效。这里为了方便查看效果，我们打个包看一下构建成果：

​![](/2026/css-in-js-33.png)

通过生产代码可以看到，这个函数逻辑以及返回值被原封不动的保留下来返回了，但是linaria却无法识别整个CSS声明，因此不能生效。

## linaria中的css片段
linaria中也有css方法，使用方式与其它库类似，而且支持不在React框架中使用。

### 纯JavaScript接入方式
这里我们抛弃React，使用纯JavaScript的方式接入linaria。使用linaria必须要编译，这里依然选用Vite。首先执行命令行：

```sh
npm init -y
npm add -D vite @wyw-in-js/vite 
npm add @linaria/core
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
    <title>jzplp的linaria实验</title>
  </head>
  <body>
    <script src="./index.js" type="module"></script>
  </body>
</html>
```

然后是index.js的实现：

```js
import { css } from '@linaria/core';

function genEle(test, className) {
  const div = document.createElement("div");
  div.className = className;
  div.textContent = test;
  document.body.appendChild(div);
}

const cssData = css`
  color: red;
  font-size: 20px;
`;

console.log(data);
genEle('jzplp', cssData);

/* 输出结果
cf71da1
*/
```

可以看到，css函数也是使用模板字符串来写CSS规则，返回值是一个类名，可以直接用在元素上。使用linaria还要修改打包配置，创建vite.config.js：

```js
import { defineConfig } from "vite";
import wyw from "@wyw-in-js/vite";

export default defineConfig({
  plugins: [wyw()],
});
```

然后执行npm run dev，开发模式下正常生效：

​![](/2026/css-in-js-34.png)

然后我们执行npm run build，查看打包后的生成代码：

​![](/2026/css-in-js-35.png)

可以看到，我们用css函数生成的CSS代码，已经被放到独立的CSS文件中，css函数使用的位置，已经直接变成了class类名。这也是零运行时库的效果，在编译时就将CSS代码生成完毕。

### 全局样式
linaria也支持创建全局样式，这里我们试一下。

```js
import { css } from "@linaria/core";

function genEle(test, className) {
  const div = document.createElement("div");
  div.className = className;
  div.textContent = test;
  document.body.appendChild(div);
}

css`
  :global() {
    div {
      color: red;
    }
    .class1 {
      background: yellow;
    }
  }
`;

const cssData = css`
  font-size: 20px;
`;

console.log(cssData);
genEle("jzplp1", "class1");
genEle("jzplp2", cssData);
```

​![](/2026/css-in-js-36.png)

将全局特性包裹在:global()中，即可生效。这段CSS甚至都不需要被哪个标签引用。我们再看看打包后的结果：

​![](/2026/css-in-js-37.png)

可以看到，对应的这段css函数代码没有了，全局特性转移到了CSS文件中。


## vanilla-extract
vanilla-extract是另一个CSS in JS库，正如它的名字，vanilla表示不使用框架的纯JavaScript。vanilla-extract这个库是框架无关的，同样他也是一个零运行时库。

### 接入方式
我们还是使用Vite接入，但这次试一下Vite提供的vanilla模板。执行命令行：

```sh
npm create vite@latest
# 选择 Vanilla + TypeScript模板
npm add @vanilla-extract/css @vanilla-extract/vite-plugin
```

创建vite.config.js文件，内容如下：

```js
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';

export default {
  plugins: [vanillaExtractPlugin()]
};
```

创建src/styles.css.ts文件，内容为创建样式，并导出。

```ts
import { style } from '@vanilla-extract/css';

export const cls1 = style({
  color: 'red'
});
```

然后删除无用的文件，修改src/main.js的内容为引入创建的样式，并作为类名放到HTML标签上。

```js
import { cls1 } from "./styles.css.ts";

function genEle(test: string, className: string) {
  const div = document.createElement("div");
  div.className = className;
  div.textContent = test;
  document.body.appendChild(div);
}

genEle("jzplp", cls1);
```

​![](/2026/css-in-js-38.png)

在开发模式运行，通过浏览器可以看到，也是在head中插入了style标签提供样式。我们再打包看看生成文件：

​![](/2026/css-in-js-39.png)

通过生成文件可以看到，vanilla-extract也是在编译时就生成独立的样式文件引入，不需要运行时处理。

### 独立.css.ts文件
vanilla-extract与其它CSS in JS方案不同点在于，虽然它确实是用JavaScript写CSS代码，但却要求独立的文件类型“.css.ts”。如果在其它文件中写入会造成错误。这里我们试一试，修改前面的src/main.js：

```ts
import { style } from '@vanilla-extract/css';

const cls1 = style({
  color: 'red'
});

function genEle(test: string, className: string) {
  const div = document.createElement("div");
  div.className = className;
  div.textContent = test;
  document.body.appendChild(div);
}

genEle("jzplp", cls1);
```

这时候开发模式打开浏览器，会看到报错，元素也没有正常展示：

​![](/2026/css-in-js-40.png)

回想起使用CSS in JS方案的重要原因就是希望CSS代码与组件的联系更紧密。这样强制的独立.css.ts文件，看起来没有增加紧密感。

### 生成style
vanilla-extract使用style创建样式，返回对应的类名。style方法接收对象形式的CSS规则，但是与常规CSS写法有点不同，这里介绍部分不同点。

#### px单位
首先是如果属性值的单位是px，可以省略，写成数字形式。这里举个例子：

```js
export const cls1 = style({
  fontSize: 10,
  margin: 20,
  padding: "10px",
  flex: 1,
});

/* 生成结果
.r9osg00 {
  flex: 1;
  margin: 20px;
  padding: 10px;
  font-size: 10px;
}
*/
```

我们直接对代码打包，观察生成的CSS文件。可以看到vanilla-extract并不是所有数字都会转换，而是跑来除了那些没有单位的CSS属性。

#### 浏览器引擎前缀写法
在对象中写CSS属性需要以camelCase驼峰命名法，但对于浏览器引擎前缀这种最前面带中划线的形式，vanilla-extract要求使用PascalCase帕斯卡命名法，即最前面大写。

```js
export const cls1 = style({
  WebkitTapHighlightColor: "rgba(0, 0, 0, 0)",
});

/* 生成结果
.r9osg00 {
  -webkit-tap-highlight-color: #0000;
}
*/
```

#### 媒体查询/容器查询/@layer等
它们的写法多了一层嵌套：

```js
import { style } from "@vanilla-extract/css";

export const cls1 = style({
  "@container": {
    "(min-width: 768px)": {
      padding: 10,
    },
  },
  "@media": {
    "screen and (min-width: 768px)": {
      padding: 10,
    },
    "(prefers-reduced-motion)": {
      transitionProperty: "color",
    },
  },
  "@layer": {
    typography: {
      fontSize: "1rem",
    },
  },
  "@supports": {
    "(display: grid)": {
      display: "grid",
    },
  },
});

/* 生成结果
@layer typography {
  .r9osg00 {
    font-size: 1rem;
  }
}
@media screen and (width>=768px) {
  .r9osg00 {
    padding: 10px;
  }
}
@media (prefers-reduced-motion) {
  .r9osg00 {
    transition-property: color;
  }
}
@supports (display: grid) {
  .r9osg00 {
    display: grid;
  }
}
@container (width>=768px) {
  .r9osg00 {
    padding: 10px;
  }
}
*/
```

#### 后备值
在之前讲[PostCSS中postcss-custom-properties插件](https://jzplp.github.io/2025/postcss-intro.html#postcss-custom-properties)的时候，我们提到过当浏览器读取到一个不支持的CSS属性值时，如果这个属性前面已经有一个后备值了，那就使用那个后备值，不会应用不支持的属性值。

但以对象的形式写CSS属性，key同一个的情况下，没办法写两个值。这里vanilla-extract接收一个值数组，实现后备值功能：

```js
export const cls1 = style({
  overflow: ['auto', 'overlay']
});

/* 生成结果
.r9osg00 {
  overflow: auto;
  overflow: overlay;
}
*/
```

### CSS变量
vanilla-extract支持使用CSS变量，需要在vars属性内部。创建后的CSS变量可以在任意位置使用，但需要满足选择器的条件。

```js
import { style } from "@vanilla-extract/css";

export const cls1 = style({
  vars: {
    "--jzplp1": "red",
  },
  color: "var(--jzplp1)",
});

export const cls2 = style({
  color: "var(--jzplp1)",
  fontSize: 20,
});

/* 生成结果
.r9osg00 {
  --jzplp1: red;
  color: var(--jzplp1);
}
.r9osg01 {
  color: var(--jzplp1);
  font-size: 20px;
}
*/
```

还可以通过createVar方法创建带有哈希的模块化CSS变量，在使用的位置引用即可。

```js
import { style, createVar } from "@vanilla-extract/css";

const cssVar = createVar();

export const cls1 = style({
  vars: {
    [cssVar]: "red",
  },
  color: cssVar,
});

export const cls2 = style({
  color: cssVar,
  fontSize: 20,
});

/* 生成结果
.r9osg01 {
  --r9osg00: red;
  color: var(--r9osg00);
}
.r9osg02 {
  color: var(--r9osg00);
  font-size: 20px;
}
*/
```

### 嵌套选择器
vanilla-extract支持使用嵌套选择器，但是有一些特殊的规则。

#### 顶层使用
对于简单的无参数的伪类或者伪元素选择器，可以与其它CSS属性放在一起顶层使用。

```js
import { style } from "@vanilla-extract/css";

export const cls1 = style({
  color: "red",
  ":hover": {
    background: "yellow",
  },
  "::before": {
    content: "jzplp",
  },
});

/* 生成结果
.r9osg00 {
  color: red;
}
.r9osg00:hover {
  background: #ff0;
}
.r9osg00:before {
  content: "jzplp";
}
*/
```

可以看到，与属性一同使用时可以省略&符号。但是这里不能添加带参数或者复杂的组合选择器，否则会编译报错：

```js
import { style } from "@vanilla-extract/css";

export const cls1 = style({
  color: "red",
  "&:hover": {
    background: "yellow",
  },
  ":not(.cls)": {
    content: "jzplp",
  },
});

/* 分别报错
error TS2353: Object literal may only specify known properties, and '"&:hover"' does not exist in type 'ComplexStyleRule'.
error TS2353: Object literal may only specify known properties, and '":not(.cls)"' does not exist in type 'ComplexStyleRule'.
*/
```

#### selectors中使用
在selectors属性中可以编写复杂的选择器，但要自己写&符号。

```js
import { style } from "@vanilla-extract/css";

export const cls1 = style({
  color: "red",
  selectors: {
    "&:hover": {
      background: "yellow",
    },
    "&:not(.cls)": {
      content: "jzplp",
    },
    ".abc &": {
      fontSize: 20
    },
  },
});

/* 生成结果
.r9osg00 {
  color: red;
}
.r9osg00:hover {
  background: #ff0;
}
.r9osg00:not(.cls) {
  content: "jzplp";
}
.abc .r9osg00 {
  font-size: 20px;
}
*/
```

#### 禁止场景
选择器也不是随便写都行的，vanilla-extract要求选择器必须作用于当前类。如果作用于其它类，那么编译时也会报错：

```js
import { style } from "@vanilla-extract/css";

export const cls1 = style({
  color: "red",
  selectors: {
    ":hover": {
      background: "yellow",
    },
    "& .abc": {
      fontSize: 20
    },
  },
});

/* 分别报错
Error: Invalid selector: :hover
Error: Invalid selector: & .abc
Style selectors must target the '&' character (along with any modifiers), e.g. `${parent} &` or `${parent} &:hover`.
*/
```

它会实际分析CSS规则，并不是把&写在什么位置就能避开的。

#### 传入类名
嵌套选择器也支持传入其它style函数生成的类名，同样需要遵守选择器必须作用于当前类。

```js
import { style } from "@vanilla-extract/css";

const cls = style({
  color: 'red',
})

export const cls1 = style({
  selectors: {
    [`.${cls} &`]: {
      background: "yellow",
    },
    [`&:not(.${cls})`]: {
      fontSize: 20
    },
  },
});

/* 生成结果
.r9osg00 {
  color: red;
}
.r9osg00 .r9osg01 {
  background: #ff0;
}
.r9osg01:not(.r9osg00) {
  font-size: 20px;
}
*/
```

### 全局样式
vanilla-extract可通过globalStyle函数创建全局样式，第一个参数是选择器，第二是样式对象。

```js
import { globalStyle } from "@vanilla-extract/css";

globalStyle("body", {
  vars: {
    "--jzplp": "10px",
  },
  margin: 0,
});

globalStyle(".abc .bcd:hover", {
  color: "red",
});

/* 生成结果
body {
  --jzplp: 10px;
  margin: 0;
}
.abc .bcd:hover {
  color: red;
}
*/
```

全局样式中也能包含使用style函数生成的模块化类名，这时候就没有选择器作用限制了：

```js
import { globalStyle, style } from "@vanilla-extract/css";

const cls = style({
  color: "red",
});

globalStyle(`body .${cls}`, {
  margin: 0,
});

globalStyle(`.${cls} :not(div)`, {
  fontSize: 10,
});

/* 生成结果
.r9osg00 {
  color: red;
}
body .r9osg00 {
  margin: 0;
}
.r9osg00 :not(div) {
  font-size: 10px;
}
*/
```

### 主题
#### 创建主题
vanilla-extract支持使用createTheme方法创建主题，主题实际上就是一组预设CSS变量。首先我们创建主题并直接打包，看下输出结果：

```js
import { createTheme } from "@vanilla-extract/css";

const [theme1, vars] = createTheme({
  color: {
    banner: "red",
    font: "blue",
  },
  size: {
    margin: "20px",
  },
});

console.log(theme1);
console.log(vars);

/* 打包命令行输出
r9osg00
{
  color: { banner: 'var(--r9osg01)', font: 'var(--r9osg02)' },
  size: { margin: 'var(--r9osg03)' }
}
*/

/* 打包后CSS文件内容
.r9osg00 {
  --r9osg01: red;
  --r9osg02: blue;
  --r9osg03: 20px;
}
*/
```

上面创建了一个主题。其中vars表示这个主题模式的对象，其中包含变量的引用。theme1是类名，使用这个类即可对这些CSS变量提供值。

#### 使用主题
下面我们再来看使用方式。首先是styles.css.ts，除了创建主题之外还创建了样式，其中引用了vars中的变量。

```js
import { createTheme, style } from "@vanilla-extract/css";

const [theme1, vars] = createTheme({
  color: {
    banner: "red",
    font: "blue",
  },
  size: {
    margin: "20px",
  },
});

const cls1 = style({
  color: vars.color.font,
});

export { theme1, cls1 };

/* 生成结果
.r9osg00 {
  --r9osg01: red;
  --r9osg02: blue;
  --r9osg03: 20px;
}
.r9osg04 {
  color: var(--r9osg02);
}
*/
```

然后是main.js，将主题类放到body中，再将应用主题的类放到div上。这样div会使用body上的变量，使主题生效。

```js
import { theme1, cls1 } from './styles.css';

document.body.className = theme1;

function genEle(test: string, className: string) {
  const div = document.createElement("div");
  div.className = className;
  div.textContent = test;
  document.body.appendChild(div);
}

genEle("jzplp", cls1);
```

​![](/2026/css-in-js-41.png)

#### 复用主题
既然是主题，那么应该不会只有一个，主题应该是同变量但是值不同的一组结构，这时候可以复用vars继续创建主题。

```js
import { createTheme } from "@vanilla-extract/css";

const [theme1, vars] = createTheme({
  color: {
    banner: "red",
    font: "blue",
  },
  size: {
    margin: "20px",
  },
});

const theme2 = createTheme(vars, {
  color: {
    banner: "yrllow",
    font: "pink",
  },
  size: {
    margin: "30px",
  },
});

export { theme1, theme2 };

/* 生成结果
.r9osg00 {
  --r9osg01: red;
  --r9osg02: blue;
  --r9osg03: 20px;
}
.r9osg04 {
  --r9osg01: yellow;
  --r9osg02: pink;
  --r9osg03: 30px;
}
*/
```

可以看到，创建的theme2应该遵守同样的结构，但是值不同。theme2仅生成类名，在对应的标签上赋值即可实现主题切换。

#### 仅创建vars
通过上面的例子可以看到，vars表示主题的结构和引用，生成的类名表示实际的主题值。但是现在创建主题结构和创建主题值合二为一了，如果希望分开生成，vanilla-extract提供了createThemeContract方法。可以将上面的代码改下如下，效果不变。

```js
import { createTheme, createThemeContract } from "@vanilla-extract/css";

const vars = createThemeContract({
  color: {
    banner: "",
    font: "",
  },
  size: {
    margin: "",
  },
});

const theme1 = createTheme(vars, {
  color: {
    banner: "red",
    font: "blue",
  },
  size: {
    margin: "20px",
  },
});

const theme2 = createTheme(vars, {
  color: {
    banner: "yellow",
    font: "pink",
  },
  size: {
    margin: "30px",
  },
});

export { theme1, theme2 };
```

## 总结
### 库列表
前面我们介绍了四个CSS in JS的库，但这仅仅是九牛一毛。社区中CSS in JS的库非常非常多，这里用表格列举一些知名度较高的:

| 库名称 | 零运行时 | 纯JS | 适配React框架 | 备注 |
| - | - | - | - | - |
| styled-components | 否 | 不支持 | 支持 | 本文已介绍 |
| Emotion | 否 | 支持 | 支持 | 本文已介绍 |
| linaria | 是 | 支持 | 支持 | 本文已介绍 |
| vanilla-extract | 是 | 支持 | 不支持 | 本文已介绍 |
| Panda CSS | 是 | 支持 | 支持 | - |
| Compiled | 是 | 不支持 | 支持 | - |
| Radium | 否 | 不支持 | 支持 | 已停止维护 |
| JSS | 插件支持 | 支持 | 支持 | 已停止维护 |

### 特点总结
本文只是简单介绍了几个CSS in JS库的使用方式和特点，并未详细探究原理和区别。事实上关于CSS in JS库还有很多值得探讨的主题，例如服务端渲染，性能优化等。根据介绍的几个CSS in JS库以及网络上相关分析，这里我们总结一下CSS in JS的特点，其中有优点，也有缺点：

* 使用方式和API各有特色，但也有很多相似之处
  * 可以看到很多API设计都是类似的，例如styled组件、css的props、模板字符串、对象作为CSS规则表示，这些API在很多库中都以类似的方式出现
  * 但很多库的设计都有自己的特点和使用方式，并没有千篇一律
* 虽然CSS in JS的设计各有特色，但还是可以大致分成 运行时库和零运行时库两类
  * 运行时库对于CSS传参的灵活性高，但是运行时生成CSS，有额外的性能损失
  * 零运行时库在编译时生成CSS文件，没有运行时性能损失，但有对于CSS参数等灵活性低。
* CSS in JS库对于类型检查和提示更友好，支持TypeScript更完善
* 由于CSS是在JavaScript中撰写的，因此控制和切换CSS要更方便。
* CSS in JS的类名时根据hash生成的，自带模块化类名，省去了起名的烦恼，也防止了CSS污染
* 类名是自动生成的，因此有些开发者认为比较难看，不方便查找元素等。相比较CSS Modules可以配置原类名+hash，可以轻松识别类名
* 在JavaScript中写CSS，更方便组织代码，例如将CSS与HTML和JS放在一起，以组件化的形式组织
* 对于运行时CSS，CSS代码只有在需要的时候才加载，对于部分页面场景，具有更小的首屏文件体积和其它优势
* 使用独立的CSS文件我们不清楚哪些样式是真正使用的，哪些样式没有被用到。而CSS in JS的CSS规则引用关系明显，我们可以轻松找到未被使用的样式，也可以利用tree-shark等技术编译时去掉不需要的样式
* 有些人很喜欢CSS in JS来组织CSS代码，但是有些人却觉得多此一举。萝卜青菜，各有所爱
* CSS in JS在React框架使用居多，Vue框架有自己的方案（组件作用域CSS，我们之前介绍过），基本不需要CSS in JS

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
- PostCSS完全指南：功能/配置/插件/SourceMap/AST/插件开发/自定义语法
  https://jzplp.github.io/2025/postcss-intro.html
- Compiled 文档\
  https://compiledcssinjs.com/
- Radium GitHub\
  https://github.com/FormidableLabs/radium
- CSS Modules完全指南：CSS模块化的特性，生态工具和实践\
  https://jzplp.github.io/2026/css-modules.html
  