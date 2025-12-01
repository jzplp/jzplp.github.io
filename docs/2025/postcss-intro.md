# PostCSS（未完成）
## PostCSS是什么
PostCSS是一个转义CSS代码的工具，它的输入为（广义的）CSS文件，输出也是CSS文件。在其中把CSS转换为抽象语法树AST，用户使用插件语法树进行修改，最后生成新的CSS代码。它的作用非常像JavaScript中的Babel。

在CSS领域，存在感更强的是SCSS和Less，它们是CSS的预处理器，扩充了CSS的语法和功能，可以编写复用性更强的代码。预处理器经过编译后，是CSS代码。而PostCSS正如它的名字，最常被用做CSS的后处理器，做一些兼容性功能。例如添加浏览器引擎的前缀，转换CSS代码以兼容不支持的浏览器等。预处理器和后处理器的关系类似于这样：

![图片](/2025/postcss-1.png)

对比JavaScript的生态位，SCSS和Less像TypeScript扩充语法，PostCSS像Babel转义兼容语法。但PostCSS允许我们自定义语法规则，因此用作预处理器，甚至只用PostCSS也是可以的。

## PostCSS使用
这里我们以最常用的插件Autoprefixer举例，这是一个根据兼容性设置添加浏览器引擎前缀的插件。首先创建`css/index.css`，作为我们要转义的CSS代码。

```css
::placeholder {
  color: gray;
}

.image {
  width: stretch;
}
```

### API方式
首先试一下JavaScriptAPI的方式使用PostCSS。执行下面的代码：

```js
const fs = require("fs");
const autoprefixer = require("autoprefixer");
const postcss = require("postcss");

const originData = fs.readFileSync("./css/index.css", "utf-8");

postcss([autoprefixer])
  .process(originData, { from: "css/index.css", to: "out.css" })
  .then((res) => {
    console.log(res.css);
    fs.writeFileSync('out.css', res.css);
  });
```

我们读取CSS文件为字符串，放入PostCSS中进行转义，最后手动写入输出文件。虽然PostCSS要求指定from和to表示输入输出的文件路径，但实际上它们是给SourceMap用的，并不会真正帮我们读取写入（但还是要求必须指定）。最后生成的结果如下：

```css
::-moz-placeholder {
  color: gray;
}

::placeholder {
  color: gray;
}

.image {
  width: -webkit-fill-available;
  width: -moz-available;
  width: stretch;
}
```

可以看到生成的CSS代码中的部分属性添加了浏览器前缀了。具体哪些前缀被添加，要根据Browserslist浏览器兼容范围确定。（在后面介绍插件的部分会提到）

### 命令行方式
使用PostCSS CLI可以支持以命令行方式转义CSS文件。首先需要安装postcss-cli依赖。然后命令行执行：

```sh
# 单个文件
postcss css/index.css -u autoprefixer -o out.css --no-map
# 目录
postcss css -u autoprefixer -d output --no-map
```

PostCSS CLI支持转义单个文件或者目录，目录会转义其中的每个文件。其中-u表示传入的插件名，-o表示输出的文件名，-d表示输出目录，--no-map表示不输出SourceMap。经过转义后，输出结果与上面API方式一致。如果更多配置，则需要使用PostCSS配置文件，我们在后面单独介绍。

## Webpack中使用PostCSS
在Webpack中使用PostCSS，主要依靠postcss-loader。

### 创建Webpack项目
这里我们先创建一个Webpack项目，可以打包CSS，但不包含PostCSS。

```sh
# 创建项目
npm init -y
# 安装依赖
npm add webpack webpack-cli style-loader css-loader
```

创建src/index.css，内容为即为前面的CSS代码。再创建src/index.js，引入CSS文件：

```js
import "./index.css";
console.log("你好，jzplp");
```

然后在创建Webapck配置文件webpack.config.js：

```js
const path = require("path");

module.exports = {
  mode: "production",
  entry: "./src/index.js",
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "dist"),
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
};
```

其中最关键的是style-loader和css-loader，这是引入CSS文件的必要loader。loader是从后向前链式调用，先css-loader，再style-loader。然后在package.json中增加命令：

```json
"scripts": {
  "build": "webpack"
},
```

最后执行`npm run build`,结果输出到dist/main.js中。结果较长，这里只截取包含CSS的部分。可以看到，CSS被打包进JavaScript代码中，其内容未变。

![图片](/2025/postcss-2.png)

### 引入postcss-loader
安装三个相关依赖：postcss postcss-loader autoprefixer。然后修改webpack.config.js，引入postcss：

```js
module.exports = {
  mode: "production",
  entry: "./src/index.js",
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "dist"),
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [
          "style-loader",
          "css-loader",
          {
            loader: "postcss-loader",
            options: {
              postcssOptions: {
                plugins: ['autoprefixer'],
              },
            },
          },
        ],
      },
    ],
  },
};
```

注意其中重点是新增加了postcss-loader，它的位置在数组的最后。意味着CSS文件先经过它处理，然后再给css-loader和style-loader。postcssOptions选项中可以配置插件。postcss-loader也支持使用配置文件postcss.config.js。

重新执行`npm run build`后，查看结果发现，除了原有代码外，还增加了浏览器前缀，说明代码成功被PostCSS转义了。(下图为了方便用两行展示CSS字符串，实际为一行)

![图片](/2025/postcss-3.png)

## 配置文件postcss.config.js
在命令行或Webapck方式使用PostCSS时，都支持postcss.config.js作为配置文件。但是这两种配置文件的居然是不一样的，部分场景互相不兼容。因此这里分别介绍两种方式的配置文件。

### 命令行方式配置文件
#### 引入插件
命令行仅支持直接引入插件对象的方式。例如前面我们列举的例子，使用配置文件内容如下：

```js
const autoprefixer = require("autoprefixer");
module.exports = {
  plugins: [autoprefixer],
};
```

然后执行的命令进行修改，输出效果一致。

```sh
# 原命令
postcss css/index.css -u autoprefixer -o out.css --no-map
# 新命令
postcss css/index.css -o out.css
```

#### 插件参数
为了描述插件参数，我们换一个postcss-color-gray插件。配置文件内容如下，先不使用插件参数：

```js
const postcssColorGray = require("postcss-color-gray");
module.exports = {
  plugins: [postcssColorGray],
};
```

然后使用插件语法，重新写一段CSS代码，转义后的代码也在下面列出：

```css
/* 源CSS代码 */
.jzplp {
  color: gray(0 / 90%);
}

/* 转义后CSS代码 */
.jzplp {
  color: rgba(0,0,0,0.9);
}
```

可以看到插件生效了。然后我们修改配置文件，增加插件参数：

```js
const postcssColorGray = require("postcss-color-gray");
module.exports = {
  plugins: [postcssColorGray({ preserve: true })],
};
```

重新执行命令行，转义后的代码发生了变化，保留了gray函数，参数生效了。

```css
/* 转义后CSS代码 */
.jzplp {
  color: rgba(0,0,0,0.9);
  color: gray(0 / 90%);
}
```

#### 配置文件名称和格式
虽然PostCSS CLI中仅仅提到了配置文件名称为postcss.config.js，但我参考隔壁postcss-loader的文件名对PostCSS CLI进行了尝试，发现居然是支持的！这里我们描述一下。

首先是JavaScript类的配置文件，包括.postcssrc.js, .postcssrc.cjs, postcss.config.cjs等，PostCSS CLI是支持的，文件内容和执行效果都与postcss.config.js一致。

然后是JSON格式的配置文件，例如.postcssrc, .postcssrc.json等，PostCSS CLI也是支持的，但是由于插件必须直接引入插件对象，因此JSON格式实际上并不能用。它的报错和在postcss.config.js中直接写插件名称字符串的报错是一致的，因此判定文件本身被读取了，但不支持插件。这里举例下配置文件内容，以.postcssrc.json为例：

```json
{
  "plugins": [["postcss-color-gray", { "preserve": true }]]
}
```

然后报错内容如下，可以看到是在读插件过程中的错误。使用yaml类的文件格式，报错也是一致的。

![图片](/2025/postcss-3.png)

#### 读取上下文
配置文件还可以导出一个函数，函数可以接收上下文入参，最终返回配置对象。这里我们给出配置文件的示例：

```js
const postcssColorGray = require("postcss-color-gray");
module.exports = (ctx) => {
  console.log(ctx);
  return {
    plugins: [
      postcssColorGray(ctx.env === "development" ? { preserve: true } : {}),
    ],
  };
};

/* 输出结果
{
  cwd: 'E:\\testProj\\postcss-test\\apitest',
  env: undefined,
  options: {
    map: { inline: true },
    parser: undefined,
    syntax: undefined,
    stringifier: undefined
  },
  file: {
    dirname: 'E:\\testProj\\postcss-test\\apitest\\css',
    basename: 'index.css',
    extname: '.css'
  }
}
*/
```

通过上面代码可以看到，可以根据上下文入参调整配置对象的内容。这里简单说明上下文入参含义：

* env: 为process.env.NODE_ENV的值
* file: 文件名相关参数
  * dirname: 文件路径
  * basename: 文件名
  * extname: 文件扩展名
* options: 命令行中输入的选项

### Webpack方式配置文件
#### 引入插件
Webpack方式不仅支持直接引入插件对象的方式，还支持直接写插件名称字符串。两种方式这里都列举下：

```js
// 直接引入插件对象
const autoprefixer = require("autoprefixer");
module.exports = {
  plugins: [autoprefixer],
};

// 直接写插件名称字符串
module.exports = {
  plugins: ['autoprefixer'],
};
```

然后删除Webapck配置中的插件配置，效果一致。Webapack中配置可以是这样（仅展示相关片段）：

```js
module: {
  rules: [
    {
      test: /\.css$/i,
      use: ["style-loader", "css-loader", "postcss-loader"],
    },
  ],
},
```

#### 插件参数
这里还使用前面命令行中插件参数一节里面的postcss-color-gray插件和CSS代码。这里尝试用两种插件配置方式：

```js
// 直接引入插件对象
const autoprefixer = require("autoprefixer");
const postcssColorGray = require("postcss-color-gray");
module.exports = {
  plugins: [autoprefixer, postcssColorGray({ preserve: true })],
};

// 直接写插件名称字符串
module.exports = {
  plugins: ['autoprefixer', ['postcss-color-gray', { preserve: true }]],
};
```

查看结果，两种方式都能正常接收参数，结果与命令行方式一致。这里还举例了传入多个插件的方式。

#### 配置文件名称和格式
Webpack方式的配置文件，支持多种配置文件格式和文件名，包括.postcssrc, .postcssrc.json, .postcssrc.yaml, .postcssrc.js, postcss.config.cjs等等，具体可以看postcss-loader的文档。其中JSON和YAML类的格式仅支持直接写插件名称字符串，这里示例下配置文件的格式，首先是JSON格式：

```json
{
  "plugins": [
    "autoprefixer",
    ["postcss-color-gray", { "preserve": true }]
  ]
}
```

然后是YAML格式，实际内容一致：

```yaml
plugins:
  - autoprefixer
  - - postcss-color-gray
    - preserve: true
```

#### 读取上下文
Webpack方式的配置文件也可以导出一个函数，函数可以接收上下文入参，最终返回配置对象。这里我们给出配置文件的示例：

```js
module.exports = (ctx) => {
  console.log(ctx);
  return {
    plugins: [["postcss-color-gray", ctx.mode === "development" ? { preserve: true } : {}]],
  };
};

/* 输出结果
{
  mode: 'production',
  file: 'E:\\testProj\\postcss-test\\webpacktest\\src\\index.css',
  webpackLoaderContext: {} // 内容很多，这里省略
  env: 'production',
  options: { plugins: [ 'autoprefixer' ] }
*/
```

这里的输出与命令行方式类似，但不完全一样，这里简单说明上下文入参含义：

* env和mode: 为process.env.NODE_ENV的值
* file: 文件路径
* options: Webpack配置中的postcssOptions选项
* webpackLoaderContext:  Webpack loader的上下文，内容很多

### 其余参数
这些配置文件都可以接收PostCSS的API中ProcessOptions的参数，除了from和to。这里列举几个：

* parser 传入解析AST的方法
* stringifier 传入从AST生成字符串的方法
* syntax 传入AST解析和生成的方法，相当于parser + stringifier
* map SourceMap选项

这些参数的具体用法会在后面介绍到。

### 不同点总结
从上面命令行方式与Webpack方式配置文件的描述，我们可以明确两种方式配置文件的不同点：

* 最主要的不同是引入插件方式的不同：命令行仅支持直接引入插件对象的方式，Webpack方式还支持直接写插件名称字符串。这导致了插件传参方式和配置文件格式的限制。
* 其次是读取上下文参数的不同。这是由于两者运行方式不同，命令行与Webpack方式可以接收到的配置数据不同，因此上下文参数不一样。

## 各类插件简介
### Autoprefixer
Autoprefixer是PostCSS中最知名的插件，它的作用是根据浏览器兼容性，添加浏览器引擎前缀。浏览器引擎前缀是浏览器为了给实验性或者浏览器引擎独有的非标准CSS属性添加的前缀，这样这个实验属性就不会影响到其它浏览器，开发者也能识别这是针对某种浏览器做的优化。常见的前缀有：

* -webkit-: 基于WebKit内核的浏览器，例如Chrome、Safari等
* -moz-: 火狐浏览器
* -o-: 旧版(WebKit之前的)Opera浏览器
* -ms-: IE 浏览器

这里举一个例子，transition属性用上面的浏览器引擎前缀可以写为：

```css
div {
  /* 原属性 */
  transition: all 4s ease;
  /* 增加浏览器引擎前缀 */
  -webkit-transition: all 4s ease;
  -moz-transition: all 4s ease;
  -ms-transition: all 4s ease;
  -o-transition: all 4s ease;
}
```

现在添加浏览器引擎前缀经常是为了兼容性，为了在旧版本浏览器也可以使用较新的CSS特性。而Autoprefixer插件就可以帮我们做到这件事。这个插件没有浏览器兼容配置，而是读取工程的Browserslist配置。这里举个例子。首先给出我们要转义的CSS代码：

```css
.jzplp {
  display: flex;
  width: stretch;
}
```

通过在package.json中设置不同的Browserslist配置，我们能得到不同的代码生成结果，这对应的是不同浏览器版本的兼容性。兼容的版本越多，那么需要处理的就越多。

```css
/* 配置 "browserslist": "> 1%" 的生成结果 */ 
.jzplp {
  display: flex;
  width: -webkit-fill-available;
  width: stretch;
}

/* 配置 "browserslist": "> 0.01%" 的生成结果 */
.jzplp {
  display: -moz-box;
  display: flex;
  width: -webkit-fill-available;
  width: -moz-available;
  width: stretch;
}
```

### cssnano

### postcss-custom-properties

### postcss-use


介绍部分常用插件 

PostCSS plugins列表\
  https://github.com/postcss/postcss/blob/main/docs/plugins.md

## 是否任何都能转义 todo

postcss-preset-env

## postcss与scss和less

## PostCSS AST

## PostCSS的SourceMap

map: true 生成， 可以配置  SourceMapOptions 选项

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
- GitHub Autoprefixer\
  https://github.com/postcss/autoprefixer
- GitHub PostCSS CLI\
  https://github.com/postcss/postcss-cli
- GitHub postcss-loader\
  https://github.com/webpack/postcss-loader
- Webpack文档\
  https://webpack.js.org/
- Webpack中文文档\
  https://webpack.docschina.org/
- MDN 浏览器引擎前缀\
  https://developer.mozilla.org/zh-CN/docs/Glossary/Vendor_Prefix
