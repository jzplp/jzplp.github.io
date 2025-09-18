# SourceMap（未完成）

## SourceMap简介
### 什么是SourceMap
SourceMap，中文名叫“源映射”。在前端开发中，打包后的文件中除了我们写的代码与npm包的代码之外，经常还会出现一个后缀名为.map的文件。这就是SourceMap文件，也是我们今天要讲的主题。

我们写的代码一般并不直接作为成果提供，而且使用各类框架后，大多数代码也没办法直接在浏览器运行。代码通常需要经过转义，打包，压缩，混淆等操作，最后作为成果提供。但这时候生成的代码与我们写的代码相比，已经面目全非了（尤其是代码量很多的项目）。如果这时候代码在运行中报错，我们很难找到错误原因，以及原来代码中的位置。

因此，很多前端工具在修改完代码后，会生成一个SourceMap文件，这个文件中记录了我们写的源代码和生成代码中标识符(主要包含变量名，属性名，js关键字等)的文件位置对应关系。有了这个关系之后，当代码出错时，浏览器或者其它工具可以将出错位置定位到源代码的具体位置上，方便排查运行时问题。如果没有这个文件，则只能定位到生成代码的位置。例如这是经过压缩后的部分jQuery代码，在这种生成代码中排查问题太难了。

![图片](/2025/sourcemap-1.png)

### SourceMap的历史
历史内容基本来源于网络。其中部分描述现在可能还不太了解，别担心，我们在后面会逐渐介绍。

* 在2009年时，Google推出了一个JavaScript代码压缩工具Cloure Compiler。在推出时，还附带了一个浏览器调试插件Closure Inspector，方便调试生成的代码。这个工具就是SourceMap的雏形。（第一版）
* 在2010年时，Closure Compiler Source Map 2.0中，SourceMap确定了统一的JSON格式，使用Base64编码等，这时候的SourceMap已经基本成型。（第二版）
* 在2011年，Source Map Revision 3 Proposal中，此时SourceMap已经脱离了Closure Compiler，成为了独立的工具。这一代使用Base64 VLQ编码，压缩了文件体积。这是第三版，也是现在广泛流行的，作为标准使用的版本。

这三个版本的map文件文件体积逐渐缩小，但即使是第三版，也要比源文件更大。SourceMap一开始作为一款Cloure Compiler的辅助小工具诞生，最后却被当作标准广泛应用，名气比Cloure Compiler本身要大的多。

## 使用工具生成sourcemap

### babel生成sourcemap

### terser生成sourcemap

## 浏览器使用sourcemap

### 正常使用
这里我们故意写一个代码出错的场景，然后对代码进行压缩，并生成SourceMap。


可以看到代码压缩后，变成了一整行，而且变量名都变了。文件的最后有一行注释，指示了map文件的存放位置。这里我们在浏览上对比下，使用和不使用souercemap文件的区别
### 请求相关

什么时机请求sourcemap的（验证打开浏览器调试工具）

## sourcemap文件内容

## Webpack中的sourcemap选项

## sourcemap生成工具使用

## sourcemap生成原理

## 实际从生成到解析的例子

最后用一个简单的例子实际生成sourcemap到解析sourcemap

## 参考
- sourcemap这么讲，我彻底理解了\
  https://juejin.cn/post/7199895323187347514
- JavaScript Source Map 详解\
  https://www.ruanyifeng.com/blog/2013/01/javascript_source_map.html
- 万字长文：关于sourcemap，这篇文章就够了\
  https://juejin.cn/post/6969748500938489892
- Source Map Github\
  https://github.com/mozilla/source-map
- HTTP标头 SourceMap MDN\
  https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Reference/Headers/SourceMap
- terser Github\
  https://github.com/terser/terser
- node-source-map-support Github\
  https://github.com/evanw/node-source-map-support
- SourceMap详解\
  https://juejin.cn/post/6948951662144782366
- 深入浅出之 Source Map\
  https://juejin.cn/post/7023537118454480904
- 绝了，没想到一个 source map 居然涉及到那么多知识盲区\
  https://juejin.cn/post/6963076475020902436
- tenser 文档\
  https://terser.org/
- Closure Compiler Source Map 2.0\
  https://docs.google.com/document/d/1xi12LrcqjqIHTtZzrzZKmQ3lbTv9mKrN076UB-j3UZQ
- Source Map Revision 3 Proposal\
  https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k