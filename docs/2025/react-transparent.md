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
```

使用`{...props}`可以实现透传Props和事件。上述例子中，子组件可以接收到样式属性和事件。

## 函数式组件-透传子节点
React中有一个特殊的属性children，表示父组件中包含的子节点。这也是需要透传的。

### 直接渲染children属性

```js
function FunComp(props) {
  return <div>左 {props.children} 右</div>;
}

function App() {
  return (
    <div>
      <FunComp>子节点</FunComp>
      <FunComp />
    </div>
  );
}
```

可以看到，直接渲染props.children，即可透传子节点。即使没有子节点，这种透传也是没问题的。如果子组件本身已经透传了props，透传的对象又是

### 使用透传Props实现透传子节点
既然children也是Props之一，那么直接使用透传Props的方法是否可以呢? 我们试一下。

```js
function FunComp(props) {
  return <div>左 {props.children} 右</div>;
}

function FunComp1(props) {
  return <div {...props} />;
}

function FunComp2(props) {
  return <FunComp {...props} />;
}

function App() {
  return (
    <div>
      <FunComp1>子节点</FunComp1>
      <FunComp1 children="子节点" />
      <FunComp2>子节点</FunComp2>
      <FunComp2 children="子节点" />
    </div>
  );
}

/* 页面效果
子节点
子节点
左 子节点 右
左 子节点 右
*/
```

FunComp1包含的子组件是一个非自定义组件div，FunComp2包含的时自定义组件FunComp，可以看到我们使用`{...props}`进行Props透传，children实际上都被成功渲染了，甚至对父组件直接设置children属性也可以。

### 冲突场景
既然Props透传即可实现，那我们为什么还要强调一遍直接渲染props.children呢，因为有时候子组件不只渲染children，还有其它内容。如果Props和直接设置的子节点冲突，那么还是直接设置的子节点优先级更高。

```js
function FunComp(props) {
  return <div {...props}>左 {props.children} 右</div>;
}

function App() {
  return (
    <div>
      <FunComp>子节点</FunComp>
      <FunComp children="子节点" />
    </div>
  );
}

/* 页面效果
左 子节点 右
左 子节点 右
*/
```

我们同时透传了Props，也直接设置了子节点（其中包含其它内容），最后直接设置的子元素生效了。

## 函数式组件-透传ref
使用ref可以操作访问DOM节点，获取DOM元素上的属性或者方法。ref也是可以透传的。

### 透传全部属性

```js
import { forwardRef, useRef } from "react";

const FunComp = forwardRef(function (props, ref) {
  return <input ref={ref} />;
});

function App() {
  const inputRef = useRef(null);
  function handleClick() {
    console.log(inputRef.current?.style);
    inputRef.current?.focus();
  }
  return (
    <div>
      <FunComp ref={inputRef} />
      <div onClick={handleClick}>点击聚焦</div>
    </div>
  );
}
```

使用forwardRef，可以透传ref属性。我们尝试了聚焦输入框，以及console输出style属性，都是正常生效的。

### 仅暴露部分属性
有时候我们不想暴露全部属性，仅希望暴露我们希望用户使用的部分属性，使用useImperativeHandle可以做到。

```js
import { forwardRef, useRef, useImperativeHandle } from "react";

const FunComp = forwardRef(function (props, ref) {
  const inputRef = useRef(null);
  useImperativeHandle(ref, () => {
    return {
      focus() {
        inputRef.current?.focus();
      },
    };
  });
  return <input ref={inputRef} />;
});

function App() {
  const inputRef = useRef(null);
  function handleClick() {
    // 无法输出
    console.log(inputRef.current?.style);
    inputRef.current?.focus();
  }
  return (
    <div>
      <FunComp ref={inputRef} />
      <div onClick={handleClick}>点击聚焦</div>
    </div>
  );
}
```

我们仅向外层的ref暴露了focus，因此外层组件focus可以正常调用，但是却拿不到style属性了。使用这种形式还可以对方法进行额外的包装，或者创建一些新的ref方法。



## 参考
- 如何二次封装一个Vue3组件库？\
  https://jzplp.github.io/2023/component-lib.html
- Vue3 透传Attributes\
  https://cn.vuejs.org/guide/components/attrs
- React 使用ref操作DOM\
  https://zh-hans.react.dev/learn/manipulating-the-dom-with-refs
