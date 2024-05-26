# Webpack分包（todo 标题待起）

## 简介 todo
1. webpack简介
2. 目前使用webpack
3. 为啥要webpack分包

## 创建工程
为了方便后续操作演示，首先要创建前端工程。
```sh
# 创建项目
npm init
# 安装webpack
npm install -D webpack webpack-cli
```

创建如下目录结构的文件：（todo 找哪个包可以生成）
```

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


然后是webpack配置 todo 增加常用配置和解释：
```js
// webpack.config.js
const config = {
    entry: './src/index.js',
    output: {
        filename: 'main.js',
    },
    mode: 'production',
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
