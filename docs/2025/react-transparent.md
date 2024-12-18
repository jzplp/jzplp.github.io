# 如何使用React，透传各类组件能力/属性？（未完成）
在23年的时候，我主要使用的框架还是Vue，当时写了一篇“[如何二次封装一个Vue3组件库？](https://jzplp.github.io/2023/component-lib.html)”的文章，里面涉及了一些如何使用Vue透传组件能力的方法。在我24年接触React之后，我发现这种扩展组件能力的方式有一个专门的术语：高阶组件（HOC）。但在Vue开发中，这个词很少听到。

这篇文章中会描述使用React透传组件各类能力的方式。这些透传方式经常在高阶组件中使用，但并不只有高阶组件会用到它们。React有类式组件和函数式组件两种，我们会分别介绍。

## 问题描述
首先我们列举下简单的场景，说明我们为什么需要透传组件能力。这里以函数式组件为例。

```js
// 问题示例，这段代码是不正确的
import { useRef } from "react";

function FunComp() {
  return <input />;
}

function FunComp2() {
  return <div><input /></div>;
}

function App() {
  const refFun = useRef(null);
  const handleClick = () => {
    console.log("click");
  };
  const handleClickFocus = () => {
    if (refFun.current) refFun.current?.focus();
  };
  return (
    <div>
      <FunComp
        ref={refFun}
        style={{ background: "red" }}
        onClick={handleClick}
      />
      <div onClick={handleClickFocus}>点我聚焦</div>
    </div>
  );
}
export default App;
```

假设我们想创建一个自定义组件（FunComp），里面封装了另外一个组件（例如这里的input），希望使用这个自定义组件增强原组件的能力，或者预先设定一些样式等等，自定义组件可能直接返回该组件，也可能被处理过（例如FunComp2被div包裹）。

虽然原组件被封装了，但是还希望原组件的能力直接被透传给自定义组件。例如我们在自定义组件上操作props, 事件，ref等，希望就像操作原组件一样。在Vue3中，很多能力可以直接使用[Attributes继承](https://cn.vuejs.org/guide/components/attrs)特性，但是React却没有，需要我们自己实现。

## 函数式组件-透传Props和事件
在函数式组件中，prop实际上就是组件的入参，且所有prop是被包含在同一个参数中的，因此很容易透传给子组件。且事件本身实际上也是prop，可以一并透传。

```js
function FunComp(props) {
  return <input {...props} />;
}

function App() {
  const handleClick = () => {
    console.log("click");
  };
  return (
    <div>
      <FunComp style={{ background: "red" }} onClick={handleClick} />
    </div>
  );
}

export default App;
```

使用`{...props}`可以实现透传Props和事件。




## 参考
- 如何二次封装一个Vue3组件库？\
  https://jzplp.github.io/2023/component-lib.html
- Vue3 透传Attributes\
  https://cn.vuejs.org/guide/components/attrs


