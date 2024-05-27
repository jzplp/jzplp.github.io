# Webpack分包（todo 标题待起）

## 简介 todo
Webpack是一个JavaScript应用程序的模块打包工具。虽然市场上出现了很多打包速度更快的竞争者，例如Vite和Turbopack等，但Webpack依然是目前市场上占有率最高的打包工具。
（为啥要webpack分包 todo）

## 创建工程
为了方便后续操作演示，首先要创建前端工程。
```sh
# 创建项目
npm init
# 安装webpack
npm install -D webpack webpack-cli
# 安装webpack插件，作用在后面解释
npm install -D html-webpack-plugin
```

创建如下目录结构的文件：
```sh
|-- webpack-demo
    |-- package.json
    |-- pnpm-lock.yaml
    |-- webpack.config.js
    |-- dist
    |   |-- main.js
    |-- src
        |-- index.js
        |-- module1
            |-- index.js
```

对应的文件内容：
```js
// src/index.js
import module1 from './module1'

console.log('index.js');
module1();

// src/module1/index.js
export default function module1() {
    console.log('module1');
}
```


然后是webpack配置.其中每个配置我都做了解释。( todo 增加常用配置和注释)
```js
// webpack.config.js
const HtmlWebpackPlugin = require('html-webpack-plugin');

const config = {
  // 入口
  entry: "./src/index.js",
  output: {
    // 输出文件名
    filename: "main.js",
    // 在生成文件之前清空 output 目录
    clean: true,
  },
  // 生产模式
  mode: "production",
  plugins: [
    // 生成HTML入口文件
    new HtmlWebpackPlugin(),
  ],
};
module.exports = config;
```


在package.json的scripts中增加`"build": "webpack"`。最后执行命令行`npm run build`，可以看到dist文件夹生成了构建后的成果：
```js
// dist/main.js
(()=>{"use strict";console.log("index.js"),console.log("module1")})();
```
可以看到，webpack确实把入口文件和模块一起打包了。执行成功，说明我们创建项目顺利完成啦。

## 参考
- Webpack官方中文文档\
  https://webpack.docschina.org
- webpack笔记1-概念篇-入口起点 (以及后面的更多笔记)\
  https://juejin.cn/post/6862291332052811790
