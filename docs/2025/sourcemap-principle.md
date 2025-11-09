# SourceMap数据生成原理（未完成）

## 简述
SourceMap提供了从源代码到生成代码之间的转换关系，通过它使得各类代码生成工具生成的代码调试变得简单。前面我们写过两篇文章描述过SourceMap的历史，使用方式和生成工具等，对SourceMap有了一定的了解：
* [快速定位源码问题：SourceMap的生成/使用/文件格式与历史](https://jzplp.github.io/2025/js-sourcemap.html)
* [Webpack中各种devtool配置的含义与SourceMap生成逻辑](https://jzplp.github.io/2025/webpack-sourcemap.html)

但是对于SourceMap数据中最重要的内容，记录着转换前后代码中变量/属性名的位置关系的mappings字段却没有介绍。这也是SourceMap的核心生成原理。那么它是是如何关联位置的，以及如何生成和解析这段字符串，这篇文章将会一一解答。

## 创建SourceMap示例
在正式的介绍之前，为了方便后面描述，首先让我们创建一个SourceMap的示例，后面的解析采用这个例子。这里采用Terser生成，首先看下源代码：

```js
// src/index.js
try {
  const sum = jzplp + 10;
} catch (err) {
  console.log(err);
  throw err;
}
```

然后执行命令，生成代码和SourceMap。注意这里为了展示两行场景，没有开启代码压缩。semicolons=false表示不采用分号，而使用换行符。

```sh
terser src/index.js --mangle --format semicolons=false -o dist.js --source-map url=dist.js.map
```

然后看下生成的结果：

```js
// dist.js
try{const o=jzplp+10}catch(o){console.log(o)
throw o}
//# sourceMappingURL/* 防止报错 */=dist.js.map

// dist.js.map
{
  "version": 3,
  "names": ["sum", "jzplp", "err", "console", "log"],
  "sources": ["src/index.js"],
  "mappings": "AAAA,IACE,MAAMA,EAAMC,MAAQ,EACtB,CAAE,MAAOC,GACPC,QAAQC,IAAIF;AACZ,MAAMA,CACR",
  "ignoreList": []
}
```

还有一个index.html，后面在浏览器中查看效果使用：

```html
<html>
  <script src="./dist.js"></script>
</html>
```

最后还有一个解析SourceMap数据的工具，这里我们直接采用这篇文章中使用的解析SourceMap工具代码即可，[Webpack中各种devtool配置的含义与SourceMap生成逻辑](https://jzplp.github.io/2025/webpack-sourcemap.html)。注意要修改下文件路径，这里解析上面生成的SourceMap数据结果如下：

```
生成代码行1  列0  源代码行1  列0  源名称-            源文件:src/index.js
生成代码行1  列4  源代码行2  列2  源名称-            源文件:src/index.js
生成代码行1  列10 源代码行2  列8  源名称sum          源文件:src/index.js
生成代码行1  列12 源代码行2  列14 源名称jzplp        源文件:src/index.js
生成代码行1  列18 源代码行2  列22 源名称-            源文件:src/index.js
生成代码行1  列20 源代码行3  列0  源名称-            源文件:src/index.js
生成代码行1  列21 源代码行3  列2  源名称-            源文件:src/index.js
生成代码行1  列27 源代码行3  列9  源名称err          源文件:src/index.js
生成代码行1  列30 源代码行4  列2  源名称console      源文件:src/index.js
生成代码行1  列38 源代码行4  列10 源名称log          源文件:src/index.js
生成代码行1  列42 源代码行4  列14 源名称err          源文件:src/index.js
生成代码行2  列0  源代码行5  列2  源名称-            源文件:src/index.js
生成代码行2  列6  源代码行5  列8  源名称err          源文件:src/index.js
生成代码行2  列7  源代码行6  列0  源名称-            源文件:src/index.js
```

## SourceMap生成原理

## 实际从生成到解析的例子

最后用一个简单的例子实际生成SourceMap到解析SourceMap

## 参考
- 快速定位源码问题：SourceMap的生成/使用/文件格式与历史\
  https://jzplp.github.io/2025/js-sourcemap.html
- Webpack中各种devtool配置的含义与SourceMap生成逻辑\
  https://jzplp.github.io/2025/webpack-sourcemap.html
- Terser 文档
  https://terser.org/