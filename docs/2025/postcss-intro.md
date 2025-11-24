# PostCSS（未完成）
## PostCSS是什么
PostCSS是一个转义CSS代码的工具，它的输入为（广义的）CSS文件，输出也是CSS文件。在其中把CSS转换为抽象语法树AST，用户使用插件语法树进行修改，最后生成新的CSS代码。它的作用非常像JavaScript中的Babel。

在CSS领域，存在感更强的是SCSS和Less，它们是CSS的预处理器，扩充了CSS的语法和功能，可以编写复用性更强的代码。预处理器经过编译后，是CSS代码。而PostCSS正如它的名字，最常被用做CSS的后处理器，做一些兼容性功能。例如添加浏览器厂商的前缀，转换CSS代码以兼容不支持的浏览器等。预处理器和后处理器的关系类似于这样：

![图片](/2025/postcss-1.png)

对比JavaScript的生态位，SCSS和Less像TypeScript扩充语法，PostCSS像Babel转义兼容语法。但PostCSS允许我们自定义语法规则，因此用作预处理器，甚至只用PostCSS也是可以的。

## PostCSS使用
以最常用的插件举例

### API使用

### Webpack中使用

## 各类插件简介
介绍部分常用插件

PostCSS plugins列表\
  https://github.com/postcss/postcss/blob/main/docs/plugins.md

## 是否任何都能转义 todo

## postcss与scss和less

## PostCSS AST

## PostCSS的SourceMap

## 插件开发

https://github.com/postcss/postcss/blob/main/docs/writing-a-plugin.md
（github同级目录有更多文档）

https://postcss.org/docs/writing-a-postcss-plugin

## 编写自定义语法规则

  https://postcss.org/docs/how-to-write-custom-syntax


postcss runner 是啥，是运行程序么

查cssdb

## 参考
- PostCSS 文档\
  https://postcss.org/
- GitHub PostCSS\
  https://github.com/postcss/postcss
- PostCSS 中文文档\
  http://postcss.docschina.org/
- AST explorer\
  https://astexplorer.net/
- PostCSS plugins列表\
  https://github.com/postcss/postcss/blob/main/docs/plugins.md
- PostCSS writing a plugin\
  https://github.com/postcss/postcss/blob/main/docs/writing-a-plugin.md
- 各位前端大神能不能通俗的说一下PostCSS到底能做什么？对于手写css的优势在哪？\
  https://www.zhihu.com/question/46312839/answer/190520136

