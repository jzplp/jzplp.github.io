# 如何编写一个自己的web前端脚手架

## 脚手架简介
脚手架是创建前端项目的命令行工具，集成了常用的功能和配置，方便我们快速搭建项目，目前网络上也有很多可供选择的脚手架。

一个"简单脚手架"的构成其实非常少，即 代码模板 + 命令行工具。其中代码模板是脚手架需要生成给用户的工程代码，命令行工具的作用是提供命令行界面，根据用户输入的信息和代码模板生成工程。

代码模板根据脚手架功能的不同而不同，但是不同脚手架命令行工具相似性较大。今天就来聊一下如何编写一个脚手架。

## 脚手架使用方式
先看一下我们编写的脚手架的使用方式。

### 启动脚手架
```sh
npm create xxx
# 或者
npx create-xxx
```
其中npx方式可以接收更多参数：
```sh
# 查看脚手架版本
npx create-xxx -v
# 指定生成的工程名称
npx create-xxx -n appname
```
命令行执行命令后，会自动下载我们的`create-xxx`包，并执行。

### 命令行界面和生成代码
脚手架启动后，会出现一个交互式命令行界面，有若干个输入项或选择项等，这个根据不同脚手架的功能而不同。例如`create-xxx@0.0.1`的选项。

![图片](/2023/web-cli.png)

在用户输入和选择全部完成后，脚手架会把代码生成到本地，同时提示用户启动方式。

## 第一版工程结构
首先我们创建脚手架工程的第一版。
```sh
|-- create-xxx@0.0.1
    |-- package.json
    |-- src
        |-- appName.js
        |-- create.js
        |-- index.js
        |-- prompt.js
        |-- setFileConfig.js
    |-- templates
        |-- auto-element
            |-- ...
        |-- lite-element
            |-- ...
        |-- trad-element
            |-- ...
```
其中`src`是脚手架工具命令行工具部分，`templates`是代码模板部分。

## 第一版代码和说明

### 启动方式
首先来看一下`package.json`。
```json
{
  "name": "create-xxx",
  "version": "0.0.1",
  "description": "",
  "main": "src/index.js",
  "bin": {
    "create-xxx": "src/index.js"
  },
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "jiazhen",
  "dependencies": {
    "chalk": "^4",
    "commander": "^10.0.0",
    "inquirer": "^8.0.0",
    "ora": "^5"
  }
}
```
注意，这里所有的依赖都是`dependencies`，即生产环境依赖。

这里设置了`bin`字段，值为工具的入口文件，可以使用该命令启动。同时设置为create-xxx，可以使用`npm create xxx`的方式启动。不过，使用npx会在全局自动缓存该npm包，因此启动时后面带个`@latest`表示最新版本更好。否则你上传了新版本，用户依然还会使用本地缓存的旧版本。

```sh
# 建议
npx create-xxx@latest
```

我们在第一版开发时，还不是一个完整的包，因此本地调试可以直接使用node执行：
```sh
node src/index.js
```
后续代码中所有的模块引入都使用的`require`，也就是`CommonJS`规范。这种规范可以让代码在`Node.js`中直接执行。如果使用`ES Modules`规范，即`import`，使用`Node.js`中直接执行会报错。

### 主要流程

#### 入口文件

先看代码，首先是入口文件`src/index.js`。
```js
#! /usr/bin/env node
const { program } = require("commander");
const { createDir, getCmdName } = require("./appName");
const package = require("../package.json");
const { getPromptValue } = require("./prompt");
const create = require("./create");
const ora = require("ora");
const chalk = require("chalk");

// 创建成功后的提示
function succConsole(configs) {
  console.log('');
  console.log(chalk.cyan(`  ${chalk.gray("$")} cd ${configs.name}`));
  console.log(chalk.cyan(`  ${chalk.gray("$")} npm install`));
  console.log(chalk.cyan(`  ${chalk.gray("$")} npm run dev`));
}

// 主函数
async function main() {
  program.option("-n, --name <value>", "app name");
  program.version(package.version, "-v");
  program.parse();
  const options = program.opts();
  // 从命令行中获取AppName
  let name = getCmdName(options, program);
  // 检测名称并创建文件夹
  name = await createDir(name);
  // 获取脚手架选项
  const promptValue = await getPromptValue();
  const configs = {
    ...promptValue,
    name,
  };

  const spinner = ora("工程正在创建中");
  // 创建工程
  await create(configs);
  console.log('');
  spinner.succeed("工程创建完成！");
  succConsole(configs);
}

main();
```

#### 流程说明
1. 使用`commander`库获取命令行参数，主要有name和version。
2. 检测名称并创建工程文件夹。
3. 用户交互式的输入脚手架选项。
4. 复制代码，并根据脚手架选项调整代码。
5. 生成结束，输出成功提示。

#### 注意示项
* 脚本说明  
首先是代码的第一句`#! /usr/bin/env node`，这表示将用node脚本执行该命令。如果没有这一句，后面作为一个npm包被执行的时候会报错。
* 获取版本  
版本信息我们直接使用`package.json`中的版本号即可。把它作为一个模块引入，直接取值。

### 获取工程名称

文件`src/appName.js`。
```js
const inquirer = require("inquirer");
const fs = require("fs");
const namePrompt = [
  {
    type: "input",
    name: "name",
    message: "请输入工程名称",
    default: "xxx-app",
  },
];

// 检测名称并创建文件夹
async function createDir(appName) {
  while (1) {
    if (!appName) {
      const res = await inquirer.prompt(namePrompt);
      appName = res.name;
    }
    try {
      // 创建文件夹
      const res = fs.mkdirSync(appName);
      break;
    } catch (e) {
      console.log("error: 工程名称与现有文件夹重名，请重新输入！");
      appName = null;
    }
  }
  return appName;
}

// 从命令行中获取AppName
function getCmdName(options, program) {
  // 输入了name参数优先取name
  if (options.name) return options.name;
  // 没有name参数则使用第一个输入项
  if (program.args && program.args.length > 0) return program.args[0];
  return null;
}

module.exports = {
  createDir,
  getCmdName,
};
```

我们把工程名称作为后面放置工程代码所创建的文件夹名称，因此这个名称特别重要。
1. 首先我们尝试从命令行参数中获取工程名称。如果没有获取到则提示用户输入工程名称。
2. 这里还对工程名称做了校验，校验内容是————是否与当前已有的文件重名，如果重名则提示用户重新输入。
3. 文件名校验成功则创建文件夹。

### 获取脚手架选项
文件`src/prompt.js`。
```js
const inquirer = require("inquirer");
const promptList = [
  {
    type: "list",
    message: "请选择模板类型",
    name: "tamplate",
    default: "auto",
    choices: [
      {
        name: "自动版 (推荐首选,集成vue3生态新功能)",
        value: "auto",
      },
      {
        name: "精简版 (无多语言/多皮肤等功能)",
        value: "lite",
      },
      {
        name: "传统版 (不使用各类按需引入插件)",
        value: "trad",
      },
    ],
  },
  {
    type: "input",
    name: "namespace",
    message: "请输入组件上下文，即公共基础路径",
    default: "/",
  },
];

async function getPromptValue() {
  const res = await inquirer.prompt(promptList);
  return res;
}

module.exports = {
  getPromptValue,
};
```
这部分非常简单，按照`inquirer`库的格式做好需要用户输入的内容，取得用户输入的值即可。

### 获取模板代码
#### 代码模板和脚手架一起存放
文件`src/create.js`。
```js
const path = require("path");
const fs = require("fs");
const { setTargetConfig  } = require('./setFileConfig')

// 获取模板代码
async function getTempLateCodes(configs) {
  // 包中的代码位置
  let srcPath = path.join(
    __dirname,
    "../templates",
    `${configs.tamplate}-element`
  );
  // 代码要放置的目标工程位置
  const targetPath = path.join(process.cwd(), configs.name);
  // 复制代码到工程中
  // node.js 16.7 Aug 18,2021发布
  fs.cpSync(srcPath, targetPath, { recursive: true });
  // 根据配置修改模板文件
  await setTargetConfig(targetPath, configs)
}

// 创建工程的主函数
async function create(configs) {
  getTempLateCodes(configs);
}

module.exports = create;
```
有了这些配置之后，我们就可以获取模板代码了。我这里需要根据不同的配置而使用不同的代码模板。通过查看上面的工程结构，我们看到代码模板是和脚手架代码放置在同一个npm包中的，因此直接使用fs复制文件即可。相比于分开存放，放置在通过一个npm包中复制文件速度更快。而分开存放一半需要通过网络下载代码模板，速度慢一些。

使用这种方式，需要注意两个路径：
* npm包路径  
脚手架代码所在的位置的路径，这个路径可以用`__dirname`获取。  
从这个路径内获取模板代码。
* 工作目录  
当前执行脚手架命令所在的目录。这个路径可以用`process.cwd()`获取。  
这个路径+工程名称就是工程的存放位置。模板代码要放置到这里。

#### 代码模板和脚手架分开存放
代码模板是和脚手架代码放置在同一个npm包中，脚手架版本会和模板版本强绑定。如果不希望绑定，可以脚手架一个npm包，代码模板使用另外一个npm包。这样假设代码模板有多个版本，可以使用同一个脚手架安装不同版本的模板。甚至可以模板放置在git上，脚手架启动时直接去git上下载代码。

### 根据脚手架选项调整代码

文件`src/setFileConfig.js`。
```js
const path = require("path");
const fs = require("fs");
const { promisify } = require("util");

// 回调转promise版本
const fsWriteFile = promisify(fs.writeFile);
const fsReadFile = promisify(fs.readFile);

// 根据配置修改模板文件
async function setTargetConfig(targetPath, configs) {
  await Promise.all([
    setPackageJson(targetPath, configs),
    setReadme(targetPath, configs),
    setEnv(targetPath, configs),
  ]);
}

// 修改package.json
async function setPackageJson(targetPath, configs) {
  const objPath = path.join(targetPath, "package.json");
  const package = require(objPath);
  package.name = configs.name;
  const jsonData = JSON.stringify(package, null, 2);
  await fsWriteFile(objPath, jsonData);
}

// 修改README.md
async function setReadme(targetPath, configs) {
  const objPath = path.join(targetPath, "README.md");
  let data = await fsReadFile(objPath, "utf8");
  data = data.replace("XXX-APP-NAME", configs.name);
  await fsWriteFile(objPath, data);
}

// 修改.env
async function setEnv(targetPath, configs) {
  let namespace = configs.namespace;
  // 完善namespace数据
  if(!namespace.length) {
    namespace = '/'
  }
  if(namespace[0] !== '/') {
    namespace = '/' + namespace
  }
  if(namespace[namespace.length - 1] !== '/') {
    namespace = namespace +  '/'
  }
  // 写入文件
  const objPath = path.join(targetPath, ".env");
  let data = await fsReadFile(objPath, "utf8");
  // 正则中.不包含换行符，这里正好截取一行
  data = data.replace(
    /VITE_NAMESPACE.*/g,
    `VITE_NAMESPACE = ${namespace}`
  );
  await fsWriteFile(objPath, data);
}

module.exports = {
  setTargetConfig,
};
```
* 这里也非常简单，我们把模板代码当作普通文件去读，根据配置修改文件内容，再写入即可。  
* 我们可以把模板的可变部分使用特殊的字符串标记，方便我们使用正则查找并替换。如果修改的内容较复杂，甚至可以使用一些模板引擎。
* 读文件是耗时操作，可以使用`Promise.all`一起执行多个。如果操作更复杂耗时，甚至可以考虑引入多线程技术。

### 打包上传

写好之后并测试完成后，我们就可以把我们的脚手架作为一个npm包发布，这样用户才能下载使用。
```sh
# 发布包
npm publish
# 删除包
npm unpublish create-xxx@0.0.1
```
在公共网络发布npm包需要先注册。


## 第二版工程结构

第一版的工程，已经可以作为一个脚手架来使用了。但是还有几个小问题可以改进：
1. 所有依赖都是生产依赖，这意味着用户在启动脚手架时，还需要额外下载很多npm包，需要等待一段时间。
2. 脚手架代码可以进行压缩。

针对这两个问题，我对第一版脚手架工程进行了改进，改进后的工程结构如下：

```sh
|-- create-xxx@0.0.2
    |-- package.json
    |-- bin
        |-- index.js
    |-- dist
        |-- index.cjs
    |-- src
        |-- appName.js
        |-- create.js
        |-- index.js
        |-- prompt.js
        |-- setFileConfig.js
    |-- templates
        |-- auto-element
            |-- ...
        |-- lite-element
            |-- ...
        |-- trad-element
            |-- ...
    |-- .eslintignore
    |-- .eslintrc.js
    |-- .gitignore
    |-- .npmrc
    |-- .prettierignore
    |-- .prettierrc.js
    |-- build.config.js
```

## 第二版的改动

### 使用unbuild打包
第一版代码没有经过打包直接发布，第二版如果希望去除生产环境的依赖，那么就必须进行打包。我参考`create-vite`，使用了`unbuild`作为打包工具。这是一个轻量级的，基于rollup的工具。  
看一下打包配置`build.config.js`:
```js
import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  // 入口文件
  entries: ['src/index'],
  clean: true,
  // 生成ts声明文件
  declaration: false,
  // 警告是否会引发报错
  failOnWarn: false,
  // rollup配置
  rollup: {
    // 生成cjs
    emitCJS: true,
    inlineDependencies: true,
    esbuild: {
      // 压缩代码
      minify: true,
    },
    resolve: {
      exportConditions: ['node'],
    },
  },
})
```

打包和压缩代码都是`unbuild`完成的。打包之后会生成一个dist文件夹，里面有`index.cjs`和`index.mjs`。我们使用的是cjs，即`CommonJS`规范的文件。

### 更新依赖
来看一下`package.json`。
```json
{
  "name": "create-xxx",
  "version": "0.0.2",
  "description": "xxx脚手架",
  "main": "bin/index.js",
  "bin": {
    "create-xxx": "bin/index.js"
  },
  "scripts": {
    "build": "unbuild",
    "lint": "eslint src --fix",
    "pretty": "prettier --write ."
  },
  "author": "jiazhen",
  "devDependencies": {
    "commander": "^10.0.0",
    "unbuild": "^1.1.2",
    "prompts": "^2.4.2",
    "eslint": "^8.30.0",
    "prettier": "^2.8.1",
    "eslint-config-prettier": "^8.5.0",
    "eslint-define-config": "^1.12.0",
    "eslint-plugin-prettier": "^4.2.1"
  },
  "files": [
    "templates",
    "dist/index.cjs",
    "bin/index.js"
  ]
}
```
可以看到，没有了生产依赖，全部换成开发依赖了。而且功能代码直接使用的依赖只剩下两个必须的：`commander`和`prompts`。`package.json`还有其它改动，后面再说。

为啥要换依赖？因为我们要打包后要成为一个`CommonJS`规范，无任何依赖的`Node.js可执行文件`，但是很多包并不支持这种打包方式。原因可能有很多，可能是使用了某些浏览器才有的属性，可能引入了不能打包的依赖等等。就算同一个npm包，也可能部分版本支持，部分版本不支持。

比如我们使用的`prompts`，就在文档里说明了依赖非常少：
> Simple: prompts has no big dependencies nor is it broken into a dozen tiny modules that only work well together.

关于依赖的选用，可以参考对应npm包的文档说明、issues等，也可以参考其它实现该方式的脚手架。

换了有些依赖，部分功能需要稍微修改一下，比如从`inquirer`换为`prompts`，就需要改部分配置。

注意：对于不支持的依赖，我出现过打包成功，但是dist中出现`reuqire('string_decoder/')`这种不存在的依赖的报错。

### 更换库引入方式
我试过`rollup系列`的打包工具，包括vite，rollup和unbuild，对于`require`，即`CommonJS`规范引入的依赖不处理，即依然作为一个外部依赖，而不是直接打包进成果物。可能是这些工具不支持，也可能是由于我没配置对的原因，后续我再研究一下。目前先全部转为`ES Modules`规范。需要改动的地方很少，大致只有引入和导出的方式。

```js
// CommonJS规范 示例
const { program } = require("commander");
const { createDir, getCmdName } = require("./appName");
const package = require("../package.json");
const { getPromptValue } = require("./prompt");
const create = require("./create");
const ora = require("ora");
const chalk = require("chalk");

module.exports = {
  createDir,
  getCmdName,
};

// ES Modules规范 示例
import { program } from 'commander'
import { createDir, getCmdName } from './appName'
import packageData from '../package.json'
import { getPromptValue } from './prompt'
import create from './create'

export { createDir, getCmdName }
```

`Node.js`本身自带的库可以保持原样，依然使用`CommonJS`规范。因为只要安装了`Node.js`(不安装啥也用不了)，就可以直接使用这些工具，不需要被打包。而且这些工具部分是使用C++写的，也不能打包到前端成果中。
```js
// 部分Node.js本身自带的库
const path = require('path')
const fs = require('fs')
const { promisify } = require('util')
```

### 固定入口文件
通过上面的改动，我们已经可以生成一个包含依赖的文件`dist/index.cjs`了。但是我们注意到，即使我们在入口文件`src/index.js`中写了`#! /usr/bin/env node`，生成的文件中也不包含这一句。因为这一句被当作注释删掉了。

因此我们再新建一个文件`bin/index.js`来引入：
```js
#!/usr/bin/env node
require('../dist/index.cjs')
```
注意这个文件不需要被打包，而是固定的，直接引入打包后的文件。这里执行的环境是`Node.js`，因此需要使用`CommonJS`规范。

更新`package.json`，这个文件直接作为bin中的启动入口文件。

### 其它改动
* `npm publish`时仅仅上传必须的文件，比如`bin/index.js`，`dist/index.cjs`和`templates`模板文件夹。在`package.json`中使用`files`指定。上传的内容越少，执行时下载的速度越快。
* 加入Eslint和Prettier，方便进行语法检查和代码格式化。可以看到对应的依赖和命令。
* 使用npm配置文件`.npmrc`，上传时不用切换仓库。

## 参考
这个脚手架的实现有参考`create-vite`和其它脚手架等，在这里表示感谢~

- create-vite  vite项目脚手架  
  https://github.com/vitejs/vite/tree/main/packages/create-vite
- Prompts  
  https://github.com/terkelg/prompts
- unbuild  
  https://github.com/unjs/unbuild
