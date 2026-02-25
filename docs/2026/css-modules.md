# 自动实现CSS模块化和组件化：CSS Modules技术详解（未完成）
todo 标题后面看一下如何优化

## 简介
在之前的文章中，我们了解了很多CSS命名规范：[BEM、OOCSS、SMACSS、ITCSS、AMCSS、SUITCSS：CSS命名规范简介](https://jzplp.github.io/2026/css-name.html)。它们可以解决CSS样式全局生效容易引发污染和冲突的问题。但方案基本都是写一个前缀或后缀，通过手写命名的方式避免类名重复。但这在多人协作或引入大量外部库时，依然不能完全避免问题，还需依赖团队规范管理。那么，是否有工具可以自动做这件事，而且完全避免组件内的类名与其它组件重复？有的，这就是CSS Modules。

默认情况下，我们定义的CSS类名标识符是全局的。使用CSS Modules之后，每个类名将变为唯一的全局名称，包含不会重复的哈希值。引入CSS文件时，我们可以拿到CSS文件导出的类名到全局名称的对应关系，从而在HTML中提供相应的类名。

对于希望共享的类名，CSS Modules也提供了方案使其全局生效。同时CSS Modules还提供了定制标识符，class组合等功能。要想实现CSS Module的功能，代码需要经过打包，而且由于不同前端框架代码的组织方式不一样，CSS Module的具体使用也有区别，下面我们逐一介绍一下。

## 纯JavaScript使用方式
首先我们抛开各种前端框架，在纯粹的JavaScript代码中演示CSS Modules的效果。这里我们选用Vite，首先命令行执行代码，创建项目：

```sh
npm init -y
npm add -D vite
```




## CSS Modules特性


## React使用方式


## Vue使用方式

## Webpack使用方式
css-loader

## Vite使用方式
背后是  postcss-modules 和 Lightning CSS

## Postcss相关插件

## 参考
- CSS Modules 用法教程 阮一峰\
  https://www.ruanyifeng.com/blog/2016/06/css_modules.html
- CSS 模块化方案探讨（BEM、OOCSS、CSS Modules、CSS-in-JS ...）\
  https://juejin.cn/post/6947335144894103583
- CSS 管理方案CSS Modules、CSS-in-JS 和 Tailwind CSS\
  https://juejin.cn/post/7529660423999848500
- React 文档\
  https://react.docschina.org/
- Vue 文档\
  https://cn.vuejs.org/
- 单文件组件 Vue文档\
  https://cn.vuejs.org/guide/scaling-up/sfc
- postcss-modules GitHub\
  https://github.com/css-modules/postcss-modules
- CSS modules Lightning CSS文档\
  https://lightningcss.dev/css-modules.html
- css-loader Webpack文档\
  https://webpack.docschina.org/loaders/css-loader/
- CSS Modules Vite文档\
  https://cn.vitejs.dev/guide/features#css-modules
