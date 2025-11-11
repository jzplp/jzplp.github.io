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

最后还有一个解析SourceMap数据的工具，这里我们直接采用这篇文章中使用的解析SourceMap工具代码即可，[Webpack中各种devtool配置的含义与SourceMap生成逻辑](https://jzplp.github.io/2025/webpack-sourcemap.html)。注意要修改下文件路径。

source-map中的行号从1开始，列号从0开始。但是我们为了符合SourceMap数据规范，后面所有的标号都从0开始，包括行号和列号。因此我们对代码稍作改造，后面都按照这个标准来计算。这里解析上面生成的SourceMap数据结果如下：

```
生成代码行0  列0  源代码行0  列0  源名称-            源文件:src/index.js
生成代码行0  列4  源代码行1  列2  源名称-            源文件:src/index.js
生成代码行0  列10 源代码行1  列8  源名称sum          源文件:src/index.js
生成代码行0  列12 源代码行1  列14 源名称jzplp        源文件:src/index.js
生成代码行0  列18 源代码行1  列22 源名称-            源文件:src/index.js
生成代码行0  列20 源代码行2  列0  源名称-            源文件:src/index.js
生成代码行0  列21 源代码行2  列2  源名称-            源文件:src/index.js
生成代码行0  列27 源代码行2  列9  源名称err          源文件:src/index.js
生成代码行0  列30 源代码行3  列2  源名称console      源文件:src/index.js
生成代码行0  列38 源代码行3  列10 源名称log          源文件:src/index.js
生成代码行0  列42 源代码行3  列14 源名称err          源文件:src/index.js
生成代码行1  列0  源代码行4  列2  源名称-            源文件:src/index.js
生成代码行1  列6  源代码行4  列8  源名称err          源文件:src/index.js
生成代码行1  列7  源代码行5  列0  源名称-            源文件:src/index.js
```

注意source-map中的行号从1开始，列号从0开始。我们后面都按照这个标准来计算。

## 整理对应关系
首先第一步，我们分析源代码和生成代码，将对应关系整理出来。首先我们整理一下对应关系拥有的字段，这些字段值对于SourceMap转换来说是必须的。

* 源代码文件名
* 源代码行号
* 源代码列号
* 源代码标识符
* 生成代码文件名
* 生成代码行号
* 生成代码列号
* 生成代码标识符

| 源代码文件名 | 源代码标识符 | 源代码行号 | 源代码列号  | 生成代码文件名 | 生成代码标识符 | 生成代码行号 | 生成代码列号 |
| - | - | - | - | - | - | - | - |
| src/index.js | sum | 1 | 8 | dist.js | o | 0 | 10 |
| src/index.js | jzplp | 1 | 14 | dist.js | jzplp | 0 | 12 |
| src/index.js | err | 2 | 9 | dist.js | o | 0 | 27 |
| src/index.js | console | 3 | 2 | dist.js | console | 0 | 30 |
| src/index.js | log | 3 | 10 | dist.js | log | 0 | 38 |
| src/index.js | err | 3 | 14 | dist.js | o | 0 | 42 |
| src/index.js | err | 4 | 8 | dist.js | o | 1 | 6 |

可以看到这个表格和上面我们解析SourceMap数据得到的值是一样的。但是前面SourceMap中还多了一些没有标识符的对应关系数据，通过对比了解那是代码中其它内容的对应，这里我们忽略，按照标准的标识符关系来计算。此时我们创建一个JSON，存放我们生成的SourceMap数据。现在里面只有版本号：

```json
{
  "version": 3,
}
```

## 文件名精简
首先是生成代码文件名，这个字段无需表示，因为SourceMap数据是从生成文件的注释中指定的，那么SourceMap数据对应的生成文件就是这个指定的文件，无需标明。

然后是源代码文件名，这个我们用一个专门的数组存放，取名叫做sources。此时我们的SourceMap内容如下：

```json
{
  "version": 3,
  "sources": ["src/index.js"],
}
```

然后记录表格中的源代码文件名变成数组的下标，从0开始。这时我们的表格变成了这样：

| 源代码文件名 | 源代码标识符 | 源代码行号 | 源代码列号  | 生成代码标识符 | 生成代码行号 | 生成代码列号 |
| - | - | - | - | - | - | - |
| 0 | sum | 1 | 8 | o | 0 | 10 |
| 0 | jzplp | 1 | 14 | jzplp | 0 | 12 |
| 0 | err | 2 | 9 | o | 0 | 27 |
| 0 | console | 3 | 2 | console | 0 | 30 |
| 0 | log | 3 | 10 | log | 0 | 38 |
| 0 | err | 3 | 14 | o | 0 | 42 |
| 0 | err | 4 | 8 | o | 1 | 6 |


## 源代码标识符精简



## SourceMap生成原理


## 生成测试
用我们自己计算得到的SourceMap数据解析和在浏览器实际使用试试。


## 参考
- 快速定位源码问题：SourceMap的生成/使用/文件格式与历史\
  https://jzplp.github.io/2025/js-sourcemap.html
- Webpack中各种devtool配置的含义与SourceMap生成逻辑\
  https://jzplp.github.io/2025/webpack-sourcemap.html
- Terser 文档
  https://terser.org/
- sourcemap 这么讲，我彻底理解了\
  https://juejin.cn/post/7199895323187347514
