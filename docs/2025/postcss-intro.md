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
PostCSS中提供了非常多的插件，作用各不相同，这里列举几个进行介绍：

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

### postcss-custom-properties
postcss-custom-properties是一个增加CSS变量兼容性的插件，对于不支持的CSS var的浏览器提供后备值。这里来举例试一下：

```css
/* 源CSS代码 */
.jzplp {
  background: var(--jza);
  color: var(--jzb, red);
}

/* 生成CSS代码 */
.jzplp {
  background: var(--jza);
  color: red;
  color: var(--jzb, red);
}
```

通过上面例子可以看到，如果提供了CSS var的后备值，那么插件将会生成一个不带CSS var的版本。如果不支持的浏览器读取到不带CSS var的版本，可以正常展示；支持的浏览器则使用var的版本覆盖前一个不支持的属性值。这样实现了CSS var的浏览器兼容性处理。如果我们没有提供后备值，则不会生成兼容性代码。

但是如果在同一个文件中提供了CSS变量的值，那么即使var函数中没提供后备值，也可以生成兼容性代码。我们看一下例子：

```css
/* 源CSS代码 */
:root {
  --jza: blue;
}
.jzplp {
  background: var(--jza);
  color: var(--jzb);
}

/* 生成CSS代码 */
:root {
  --jza: blue;
}
.jzplp {
  background: blue;
  background: var(--jza);
  color: var(--jzb);
}
```

可以看到例子中--jza提供了变量值，因此生成了兼容性代码；jzb没有则不会生成。变量值必须与使用变量的代码在同一个文件中才有效。

### postcss-global-data
在前面postcss-custom-properties插件中我们看到，只有在同一个文件中提供了CSS变量值，才能生成兼容性代码。但是工程中的全局变量与使用位置一般不会在一个文件内，这会导致postcss-custom-properties插件无法识别。而postcss-global-data就可以解决这个问题。

postcss-global-data插件允许我们提供一些全局CSS文件，作为每个被编译文件的的附加数据使用。但这些全局文件的编译结果会在输出前被移除，因此不会使每个编译后文件的代码体积增加。我们来看一下例子，首先是PostCSS配置文件, 注意postcss-global-data插件必须在前：

```js
const postcssCustomProperties = require("postcss-custom-properties");
const postcssGlobalData = require("@csstools/postcss-global-data");

module.exports = (ctx) => {
  return {
    plugins: [
      postcssGlobalData({
        files: ["./global.css"],
      }),
      postcssCustomProperties,
    ],
  };
};
```

然后是要编译的文件index.css和全局CSS文件global.css：

```css
/* global.css */
:root {
  --jza: blue;
}

/* index.css */
.jzplp {
  background: var(--jza);
}
```

最后我们看下编译的结果：

```css
/* 未使用postcss-global-data插件 */
.jzplp {
  background: var(--jza);
}

/* 已使用postcss-global-data插件 */
.jzplp {
  background: blue;
  background: var(--jza);
}
```

可以看到在使用postcss-global-data插件的情况下，生成代码中增加了兼容性代码，读取了全局CSS文件中的变量值。但是全局CSS文件global.css中的CSS代码却没有包含进来。

### cssnano
cssnano是一个代码压缩工具，将CSS代码进行语义化压缩。与gzip等纯压缩工具的不一样的是，他会根据代码语义对代码本社内进行改动，例如去掉注释，去掉重复属性，合并选择器等等。这里我们举例试试：

```css
/* 源CSS代码 */
.jzplp {
  color: red;
  /* 我是注释 */
  color: red;
}
.jzplp {
  width: 20px;
}

/* 生成CSS代码 */
.jzplp{color:red;width:20px}
```

可以看到，同样的选择器被合并，同样的属性值被合并了，注释和中间的换行符空格都去掉了。cssnano还支持预设或者插件，这里就不描述了。

## PostCSS兼容性插件
### 使用postcss-preset-env
前面介绍了几个PostCSS的插件，但有一个插件却留到了这一节介绍：postcss-preset-env。类似与Babel中的@babel/preset-env预设，postcss-preset-env中包含了很多PostCSS浏览器兼容性的插件。它会读取我们配置的浏览器兼容版本，根据CSSDB上面的特性列表以及我们代码使用了哪些新特性，选择应用哪些插件，从而在浏览器不支持某些CSS新特性的情况下，允许使用新特性。

首先接入插件，由于postcss-preset-env是做兼容性处理的，因此需要放在其它插件的后面，让兼容性插件最后处理：

```js
const postcssPresetEnv = require("postcss-preset-env");
module.exports = {
  plugins: [
    // 其他插件
    postcssPresetEnv({ /* 插件参数 */ }),
  ],
};
```

postcss-preset-env插件也是读取工程中的Browserslist配置。这里我们提供一段CSS源代码，让postcss-preset-env插件在不同浏览器配置下编译试试。

```css
/* 源CSS代码 */
.jzplp {
  width: stretch;
  color: #01020380;
}

/* 转义后CSS代码 "browserslist": "> 1%" */
.jzplp {
  width: -webkit-fill-available;
  width: stretch;
  color: #01020380;
}

/* 转义后CSS代码 "browserslist": "> 0.1%" */
.jzplp {
  width: -webkit-fill-available;
  width: -moz-available;
  width: stretch;
  color: rgba(1,2,3,0.50196);
}
```

通过上面的结果，我们可以看到不同的浏览器兼容性配置，会生成不同的代码。postcss-preset-env中包含了Autoprefixer，因此会自动添加浏览器引擎前缀。此外，还会根据支持程度添加其它兼容性代码。

例如#rrggbbaa，是分别以两个16进制数字表示红R绿G蓝B透明度A表示颜色的方式，只在相对较新的浏览器中支持。当browserslist>1%时不进行转义，当>0.1%时就转义为rgba函数的形式。

### 是否任何语法都能转义
postcss-preset-env插件可以根据源CSS代码使用的特性来转义代码，增加兼容性。那么是不是什么特性都能转义，转义后的效果是不是与转义前一致？这很显然是否定的。即使是JavaScript代码，转义和Polyfill也做不到将所有新特性的兼容模式运行和新特性完全一致。例如Vue3之所以不兼容IE的一个原因，就是无法兼容JavaScript语法中Proxy的所有特性。至于CSS兼容性的限制就更大了。这里我们依然使用之前的CSS变量代码来举例：

```css
/* 源CSS代码 */
.jzplp {
  background: var(--jza, red);
  color: var(--jzb);
}

/* 生成CSS代码 "browserslist": "> 0.001%" */
.jzplp {
  background: red;
  background: var(--jza, red);
  color: var(--jzb);
}
```

即使浏览器兼容性配置的要求很高，生成的代码也是这样。当我们提供了后备值时，插件会为我们生成兼容性的固定值background: red。如果没提供，那插件则无能为例。不管有没有生成固定值，这段代码在不支持CSS变量的浏览器运行时，效果与支持的浏览器不一样：因为变量的运行时变更功能无法被兼容。因此这明显可以得出：转义插件并不是任何属性都能转义，相反它不能做到的事情特别多，只能够尽量。

## PostCSS与SCSS和Less
这一部分我们以Webapck作为环境，从直接引入SCSS与Less开始，再到用PostCSS做后处理器，再直接用PostCSS解析甚至编译SCSS与Less。

### Webapck引入SCSS
首先尝试在Webpack中引入SCSS。还是前面创建的Webpack工程，安装依赖sass和sass-loader，然后修改webpack.config.js：

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
      {
        test: /\.scss$/i,
        use: ["style-loader", "css-loader", "sass-loader"],
      },
    ],
  },
};
```

可以看到，增加了一条规则，匹配SCSS文件，先使用sass-loader把SCSS解析成CSS，然后再用常规的CSS处理。我们要打包的代码如下。首先是入口文件，其中引入了CSS和SCSS文件。

```js
import "./index.scss";
import "./index.css";
console.log("你好，jzplp");
```

然后是CSS和SCSS文件内容：

```css
/* index.css */
.jzplp {
  color: blue;
}

/* index.scss */
$jzabc: red;
div {
  color: $jzabc;
}
```

SCSS文件中使用了变量的特性，SCSS在编译后会变成它的实际值，我们看看打包结果。文件较长，仅展示相关部分：

```js
i.push([e.id, ".jzplp {\n  color: blue;\n}", ""]);
i.push([e.id, "div{color:red}", ""]);
console.log("你好，jzplp");
```

可以看到，SCSS文件被编译成功，也打包进了最终成果中。

### Webapck引入Less
再尝试在Webpack中引入Less。安装依赖less和less-loader，然后修改webpack.config.js，这里只列出module部分，其它和Webapck引入SCSS一致：

```js
const path = require("path");

module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.less$/i,
        use: ["style-loader", "css-loader", "less-loader"],
      },
    ],
  },
};
```

然后将创建index.less，内容如下：

```less
@jzabc: red;
div {
  color: @jzabc;
}
```

在index.js中引入index.less：`import "./index.less";`。其它内容和上面一致，然后进行打包，生成结果如下（仅展示相关部分）。可以看到，Less文件也被编译成功，也打包进了最终成果中。

```js
i.push([e.id, "div {\n  color: red;\n}\n", ""]);
i.push([e.id, ".jzplp {\n  color: blue;\n}", ""]);
console.log("你好，jzplp");
```

### 用PostCSS做后处理器

### PostCSS直接解析SCSS与Less

### PostCSS直接编译Less

## PostCSS的AST

## PostCSS的SourceMap

map: true 生成， 可以配置  SourceMapOptions 选项

## 插件开发

https://github.com/postcss/postcss/blob/main/docs/writing-a-plugin.md
（github同级目录有更多文档）

https://postcss.org/docs/writing-a-postcss-plugin

## 编写自定义语法规则

  https://postcss.org/docs/how-to-write-custom-syntax


postcss runner 是啥，是运行程序么

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
- GitHub postcss-custom-properties\
  https://github.com/csstools/postcss-plugins/tree/main/plugins/postcss-custom-properties
- MDN CSS var()\
  https://developer.mozilla.org/zh-CN/docs/Web/CSS/Reference/Values/var
- GitHub cssnano\
  https://github.com/cssnano/cssnano
- cssnano 文档\
  https://cssnano.github.io/cssnano/
- GitHub postcss-preset-env\
  https://github.com/csstools/postcss-plugins/tree/main/plugin-packs/postcss-preset-env
- MDN CSS hex-color\
  https://developer.mozilla.org/zh-CN/docs/Web/CSS/Reference/Values/hex-color
- GitHub postcss-scss\
  https://github.com/postcss/postcss-scss
- GitHub postcss-less\
  https://github.com/shellscape/postcss-less
- GitHub postcss-less\
  https://github.com/shellscape/postcss-less
- GitHub postcss-less-engine\
  https://github.com/Crunch/postcss-less
- Less文档\
  https://lesscss.org/
- SCSS文档\
  https://sass-lang.com/
