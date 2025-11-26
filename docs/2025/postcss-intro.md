# PostCSS（未完成）
## PostCSS是什么
PostCSS是一个转义CSS代码的工具，它的输入为（广义的）CSS文件，输出也是CSS文件。在其中把CSS转换为抽象语法树AST，用户使用插件语法树进行修改，最后生成新的CSS代码。它的作用非常像JavaScript中的Babel。

在CSS领域，存在感更强的是SCSS和Less，它们是CSS的预处理器，扩充了CSS的语法和功能，可以编写复用性更强的代码。预处理器经过编译后，是CSS代码。而PostCSS正如它的名字，最常被用做CSS的后处理器，做一些兼容性功能。例如添加浏览器厂商的前缀，转换CSS代码以兼容不支持的浏览器等。预处理器和后处理器的关系类似于这样：

![图片](/2025/postcss-1.png)

对比JavaScript的生态位，SCSS和Less像TypeScript扩充语法，PostCSS像Babel转义兼容语法。但PostCSS允许我们自定义语法规则，因此用作预处理器，甚至只用PostCSS也是可以的。

## PostCSS使用
这里我们以最常用的插件Autoprefixer举例，这是一个根据兼容性设置添加浏览器厂商标识的插件。首先创建`css/index.css`，作为我们要转义的CSS代码。

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


### 不同点总结



## 各类插件简介

### Autoprefixer
Autoprefixer 通过 Browserslist 修改。

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
