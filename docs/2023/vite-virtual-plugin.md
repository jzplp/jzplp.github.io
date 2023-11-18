# 使用Vite虚拟模块功能重写多语言和多皮肤插件

## 目录
[[toc]]

## 背景
为了处理在Vite和Vue3场景下，打包部署后实现多语言和皮肤的更换和修改的功能，我开发了两个vite插件。插件在构建结束前，把资源文件转换和复制到dist中，再使用HTTP请求读取资源，解决了多语言包和多皮肤包扩展的问题。
* [使用vite和vue-i18n，实现部署后新增多语言包功能](/2022/vite-vue-i18n)
* [使用vite和Element Plus，实现部署后新增主题/皮肤包](/2022/vite-element-skin)

但是，当时的实现形式有点“稚嫩”，仅仅是做了文件的转换和复制功能。而开源生态中的插件，例如`vite-plugin-pages`,`@intlify/vite-plugin-vue-i18n`等，提供了非常方便的资源引入功能，只需要简单引入插件，就能实现页面路由，多语言文件等资源的快速导入。我的插件也希望拥有这样的功能。

## 旧插件的问题
首先，我们需要了解旧插件有什么问题，那些地方需要优化。
1. 插件直接写在业务工程代码中，没有作为一个独立npm包
2. 插件配置功能不完善，使用不便
3. 如果用户修改了Vite中构建成果输出路径和静态资源路径，插件默认distPath将会报错
4. 插件未提供开发模式和生产模式下多语言资源引入的功能，需要用户在工程中编写较多引入资源的代码
5. 插件未提供切换皮肤的功能，同样需要用户在工程中自己编写
6. 插件使用Axios获取生产模式多语言资源，需要额外引入依赖（使用fetch不需要引入）
7. 多语言功能引入了解析json5、yaml等格式的依赖包，在生产模式中也被包含，使构建包体积变大
8. 部分场景要求多语言后缀，例如`.msg .name`，如果直接在Object的key中包含`.`，vue-i18n并不支持

下面我们一个一个来解决这些问题。**虽然标题的重点是“Vite虚拟模块功能”，但是为了方便理解，实际上文章会按照顺序介绍整个插件的重写过程。**

## 工程结构
新的多语言和多皮肤插件有了自己的独立工程，成为了独立的npm包。这两个插件都可以在工程中独立安装使用，甚至在非vue框架下使用。

### 多语言插件结构
```sh
|-- vite-plugin-i18n-xxx
    |-- .eslintignore         # eslint忽略文件
    |-- .eslintrc.js          # eslint配置
    |-- .gitignore            # git提交忽略文件
    |-- .npmrc                # npm配置
    |-- .prettierignore       # prettier忽略文件
    |-- .prettierrc.js        # prettier配置
    |-- build.config.ts       # unbuild构建配置
    |-- client.d.ts           # 虚拟模块声明文件
    |-- package.json          # nodejs项目配置
    |-- tsconfig.json         # typescript配置
    |-- dist                  # 构建成果
    |   |-- index.cjs         # 插件入口文件
    |   |-- index.d.ts        # 插件声明文件
    |   |-- index.mjs         # 插件esmodule入口文件
    |-- src                   # 插件源码
    |   |-- buildI18n.ts      # 构建多语言包逻辑
    |   |-- getDistI18n.ts    # 获取构建包多语言逻辑
    |   |-- index.ts          # 源码入口文件
    |   |-- types.d.ts        # 源码声明
    |   |-- virtualModule.ts  # 虚拟模块相关逻辑
    |-- virtualCode           # 虚拟模块使用的代码
        |-- emptyI18n.js      # 输出空函数
        |-- fetchI18n.js      # 获取构建包多语言
```

### 多皮肤插件结构
```sh
|-- vite-plugin-skin-xxx
    |-- .eslintignore         # eslint忽略文件
    |-- .eslintrc.js          # eslint配置
    |-- .gitignore            # git提交忽略文件
    |-- .npmrc                # npm配置
    |-- .prettierignore       # prettier忽略文件
    |-- .prettierrc.js        # prettier配置
    |-- build.config.ts       # unbuild构建配置
    |-- client.d.ts           # 虚拟模块声明文件
    |-- package.json          # nodejs项目配置
    |-- tsconfig.json         # typescript配置
    |-- dist                  # 构建成果
    |   |-- index.cjs         # 插件入口文件
    |   |-- index.d.ts        # 插件声明文件
    |   |-- index.mjs         # 插件esmodule入口文件
    |-- src                   # 插件源码
    |   |-- buildSkin.ts      # 构建多皮肤包逻辑
    |   |-- changeSkin.ts     # 获取和变更皮肤逻辑
    |   |-- index.ts          # 源码入口文件
    |   |-- types.d.ts        # 源码声明
    |   |-- virtualModule.ts  # 虚拟模块相关逻辑
    |-- virtualCode           # 虚拟模块使用的代码
        |-- getBuildSkin.js   # 开发模式获取皮肤
        |-- getDevSkin.js     # 生产模式获取皮肤
```

这两个插件的工程结构基本一致，实际开发的方法和使用也基本一致。

## 构建和npm包
两个插件都从业务工程中独立出来，成为了独立的npm包。原来的插件代码放到`src/index.ts`中，内容未改变，依然使用ts编写。

### unbuild构建
和脚手架工程一致，这里使用了unbuild作为构建工具，入口即是原来的插件代码。
```ts
// build.config.ts
import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  // 入口文件
  entries: ['src/index'],
  clean: true,
  // 生成ts声明文件
  declaration: true,
  // 警告是否会引发报错
  failOnWarn: false,
  // rollup配置
  rollup: {
    // 生成cjs
    emitCJS: true,
    esbuild: {
      // 压缩代码
      minify: false,
    },
  },
})
```
* 这里未压缩代码，因为压缩后代码很难被人类阅读，排查问题困难。作为一个在工程开发模式使用的工具，本身代码量也不大，因此决定不压缩了。
* 最后构建后的成果在dist目录中，入口为`index.cjs`。
* 同时还这里还生成了ts声明文件`index.d.ts`，提供给用户使用。

### 独立npm包
这里以多语言插件的`package.json`为例说明，多皮肤插件的配置基本一致。
```json
{
  "name": "vite-plugin-i18n-xxx",
  "version": "0.0.5",
  "author": "jiazhen",
  "main": "dist/index.cjs",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs"
    },
    "./client": {
      "types": "./client.d.ts"
    }
  },
  "scripts": {
    "build": "unbuild",
    "lint": "eslint src --fix",
    "pretty": "prettier --write ."
  },
  "devDependencies": {
    "@types/js-yaml": "^4.0.5",
    "@types/node": "^18.15.11",
    "@typescript-eslint/eslint-plugin": "^5.47.1",
    "eslint": "^8.30.0",
    "eslint-config-prettier": "^8.5.0",
    "eslint-define-config": "^1.12.0",
    "eslint-plugin-prettier": "^4.2.1",
    "js-yaml": "^4.1.0",
    "json5": "^2.2.1",
    "prettier": "^2.8.1",
    "unbuild": "^1.1.2",
    "@typescript-eslint/parser": "^5.47.1",
    "typescript": "^4.9.3"
  },
  "files": [
    "dist",
    "client.d.ts",
    "virtualCode"
  ]
}
```
主要改动：
* exports npm包的导出配置
  * 默认导出的是整个插件的入口文件。
  * client 中导出的是虚拟模块的类型声明文件，在后面会描述
* types 默认导出的类型声明文件，这里导出插件整体的类型文件
* files 设置npm包上传的文件，仅仅只上传需要的文件即可，源码和工程配置不必上传
* devDependencies 所有的依赖都是开发依赖，打包之后该插件的使用不再需要依赖支持。
  * `js-yaml`和`json5`是功能需要使用的依赖，打包时直接被打包进dist中。
  * `unbuild`是打包使用的工具，dist中不需要包含。
  * 其他的声明文件，`eslint`,`prettier`,`typescript`等配置都是仅开发时才使用的，也不需要也不会打包进dist。

其实多语言和多皮肤插件本身在用户业务工程中使用时，除了虚拟模块中导出的内容会进入到构建包中，其它插件代码在打包后是不会进入构建包的。

这样，我们就解决了问题1，作为一个独立npm包。问题7解决了一半，原有构建部分使用依赖包被包含到独立npm包中了，但是业务工程中引入代码中多语言时依然需要这两个依赖。

## 使用Vite虚拟模块，引入多语言资源

### 虚拟模块简介
虚拟模块实际上是Vite背后的打包器Rollup的功能。在Rollup和Vite官方文档中都有关于虚拟模块的示例：
* [Rollup 虚拟模块示例](https://cn.rollupjs.org/plugin-development/#a-simple-example)
* [Vite 虚拟模块示例](https://cn.vitejs.dev/guide/api-plugin.html#virtual-modules-convention)

简单来说，我们在工程代码中普通引入一个模块，这个模块是需要真实存在的。但是使用虚拟模块，我们引入的模块可以不用真实存在，而是一个在插件中生成的新内容。通过虚拟模块，我们可以传入一些编译时信息。目前开源的很多vite生态插件都使用了该功能。

### 引入多语言资源
该功能的思路和实现基本是仿照了`@intlify/vite-plugin-vue-i18n`插件。代码中简化了部分该章节不涉及的内容，且在后面的章节还会有改动。
```ts
// src/index.ts
import { getVirtualId, getJsonCode } from './virtualModule'
// 虚拟文件的的key
const MessageVirtualId = 'vite-plugin-i18n-xxx:messages'

export default function i18nBuildPlugin(
  // 源码中多语言目录位置
  srcPath = path.join('src', 'i18n'),
  // 构建包中多语言位置
  distPath = path.join('dist', 'assets', 'i18n')
) {
  srcPath = path.join(process.cwd(), srcPath)
  distPath = path.join(process.cwd(), distPath)
  let isProduction = false
  return {
    name: 'vite-plugin-i18n-xxx',
    resolveId(id: string) {
      // 虚拟模块插件前缀
      if (id === MessageVirtualId) {
        return getVirtualId(MessageVirtualId)
      }
    },
    load(id: string) {
      if (id === getVirtualId(MessageVirtualId)) {
        const messages: I18nFlat = getDevLangs(srcPath)
        return getJsonCode(messages)
      }
    },
  }
}
```

```ts
// src/virtualModule.ts
// 获取虚拟模块的id
export function getVirtualId(id: string) {
  return '\0' + id
}
// Object输出为json文件
export function getJsonCode(data: any) {
  return `export default ${JSON.stringify(data)}`
}
```

```ts
// src/buildI18n.ts
// 获取dev模式下的多语言，并组成json集合
export function getDevLangs(srcPath: string): I18nFlat {
  const messages: I18nFlat = {}
  const dir = fs.readdirSync(srcPath)
  dir.forEach(async (name: string) => {
    const nameAnalysis: I18nFileName = handleFileName(name)
    if (!nameAnalysis) return
    const data = fs.readFileSync(path.join(srcPath, name), 'utf8')
    const mes = i18nFlat(transFile(data, nameAnalysis.suffix))
    messages[nameAnalysis.langKey] = mes
  })
  return messages
}
```
代码中部分原插件已经实现的功能在这里没有重复写。

在`src/index.ts`中的虚拟模块流程和官方文档中的示例类似，基本是固定的。我们使用的模块名称`vite-plugin-i18n-xxx:messages`。resolveId钩子中为插件加入前缀`\0`，用来区别虚拟模块。

load钩子中传入该虚拟模块应该引入的“代码”，也就是想让业务工程使用的内容。在这里，我们把业务工程代码中的多语言目录中的所有文件引入，转换成json，并且把多语言字符串key展平成一层的Object。以文件名作为key（它也是语言key），值为展平的每个语言的Object，组成一个大对象并导出。这个格式恰好是vue-i18n需要的格式。

我们在提供模块内容时，在`getJsonCode`函数中对这个对象进行了JSON序列化。这并不是因为用户需要使用序列化后的内容，而是我们提供的虚拟模块“代码”需要被Vite/Rollup解析成为对象，在解析之前我们需要提供字符串形式的内容。使用`export default ${JSON.stringify(data)}`，解析后恰好就是导出这个对象。

### 使用方法
在业务工程中使用时，直接引入该模块，即可引入全部多语言文件，可以直接被vue-i18n接收。
```ts
import messages from 'vite-plugin-i18n-xxx:messages'
const i18n = createI18n({
  locale: 'zh_CN',
  legacy: false,
  messages: messages,
  warnHtmlMessage: false,
})
```

导出对象的格式类似于这样：
```json
{
  "zh_CN": {
    "abc.def": "你好",
    "def": "你好js",
    "common.delete": "删除"
  },
  "en_US": {
    "abc.def": "hello",
    "def": "hello js",
    "common.delete": "delete"
  },
}
```

### 展平以支持多语言后缀
部分场景下，每个多语言字符串要求有后缀，例如`.msg .name`。如果直接在多语言对象的最后一级key中直接加`.name`，vue-i18n并不支持。
```json
// vue-i18n不支持的多语言格式
{
  "abc": {
    "def.name": "你好"
  },
}
```
而我们的插件会把上述的对象展平为一层的对象结构，这样vue-i18n就可以识别了。
```json
// 插件转换后的格式，vue-i18n可以支持
{
  "abc.def.name": "你好"
}
```

到这里，我们又解决了问题7和8。不管是开发态还是打包时，解析json5、yaml等格式都使用插件执行，业务工程并不需要引入这些依赖，也不会打包到构建包中。


## 修改插件入参，完善默认路径逻辑
通过上一节的插件入参srcPath和distPath，我们可以发现：
* 配置不方便，如果希望只配置distPath，却必须配置srcPath，无法使用默认值。
* 部分场景下，不需要生成多语言/多皮肤包，需要提供该配置选项。
* distPath默认路径为`dist/assets/skin`。如果vite配置的成果输出路径和静态资源路径改变，这个默认路径就失效了

下面来解决这些问题，这里以多皮肤插件来举例。代码依然简化了部分该章节不涉及的内容。

### 修改入参格式
```ts
// src/index.ts
import { PathConfig, OptionConfig } from './types'
export default function skinBuildPlugin(
  pathConfig: PathConfig = {},
  optionConfig: OptionConfig = {}
) {
  // ...插件内容
}
```
```ts
// src/types.d.ts
export interface PathConfig {
  srcPath?: string
  distPath?: string
}
export interface OptionConfig {
  distGen?: boolean
}
```

插件配置被分成了两类：
* pathConfig 路径相关配置
* optionConfig 其它配置项

这样我们可以单独或者组合使用每一种默认值：
```ts
import skinPlugin from 'vite-plugin-skin-xxx'
{
  // 默认，不开启皮肤包功能
  plugins: [skinPlugin(),]
  // 开启皮肤包功能
  plugins: [skinPlugin({}, { distGen: true }),]
  // 开启皮肤包，且自定义路径
  plugins: [skinPlugin({ distPath：'skin123' }, { distGen: true }),]
}
```

### 获取Vite配置修改路径
```ts
// src/index.ts
import { getOutDir, getBase, setDevSkins, setDistPath, getAssetsDir } from './buildSkin'

export default function skinBuildPlugin(
  pathConfig: PathConfig = {},
  optionConfig: OptionConfig = {}
) {
  // 源码皮肤目录位置
  const srcPath = pathConfig.srcPath || path.join('src', 'skin')
  // 构建包中皮肤目录位置
  let distPath = pathConfig.distPath
  // 构建成果输出路径
  let outDir = 'dist'
  // 静态资源的存放路径
  let assetsDir = 'assets'
  // base 公共基础路径
  let base = '/'
  // 是否是生产模式
  let isProduction = false
  return {
    name: 'vite-plugin-skin-xxx',
    config(config, env) {
      outDir = getOutDir(config)
      assetsDir = getAssetsDir(config)
      base = getBase(config)
      // 拼合输出路径
      distPath = setDistPath(distPath, assetsDir)
      // 获取当前的构建模式
      if (env.mode === 'production') isProduction = true
    },
    async closeBundle() {
      if (!isProduction || !optionConfig.distGen) {
        return
      }
      // 拼合成果物输出路径
      const distDirPath = path.join(process.cwd(), outDir, distPath)
      const srcDirPath = path.join(process.cwd(), srcPath)
      fs.mkdirSync(distDirPath)
      setDevSkins(srcDirPath, distDirPath)
    },
  }
}
```

```ts
// src/buildSkin.ts
import fs from 'fs'
import path from 'path'

// 获取输出路径
export function getOutDir(config: any): string {
  return config?.build?.outDir || 'dist'
}
// 静态资源的存放路径
export function getAssetsDir(config: any): string {
  return config?.build?.assetsDir || 'assets'
}
// 拼合输出路径 如果有配置则使用配置；否则使用 静态资源路径/skin
export function setDistPath(distPath: string, assetsDir: string) {
  return distPath || path.join(assetsDir, 'skin')
}
// 获取服务的公共基础路径
export function getBase(config: any): string {
  return config?.base || '/'
}
// 源码目录中的皮肤文件放到构建包中
export function setDevSkins(srcPath: string, distPath: string) {
  const dir = fs.readdirSync(srcPath)
  dir.forEach(async (name: string) => {
    const srcNamePath = path.join(srcPath, name)
    const distNamePath = path.join(distPath, name)
    const stats = fs.lstatSync(srcNamePath)
    if (stats.isDirectory()) {
      fs.mkdirSync(distNamePath)
      // node.js 16.7
      fs.cpSync(srcNamePath, distNamePath, { recursive: true })
    }
  })
}
```
原有的distPath默认值为：`dist/assets/skin`，但是这个默认目录结构与Vite打包配置有关：
 * dist 构建包默认输出路径 vite配置 `build.outDir`
 * assets 构建包静态资源路径 vite配置 `build.assetsDir`
 * skin 构建包中的皮肤文件夹

相关含义和配置可以参考[vite官方文档](https://cn.vitejs.dev/config/build-options.html#build-outdir)

因此，我们最好启动时读取vite配置，给予插件正确的路径默认值。另外用户配置的base值也与读取构建包中多语言多皮肤有关，这里也要获取到。

在Vite独有钩子中，config正好可以接收用户的配置，我们使用`getOutDir, getAssetsDir, getBase`获取相关配置值，如果获取不到则提供默认值。

经过处理后，现有的配置逻辑为：
* 用户未设置distPath  `构建包输出路径/静态资源路径/skin`
* 用户已设置distPath  `构建包输出路径/用户设置distPath`

经过这一节的处理，我们解决了问题2，问题3。

## 使用vite虚拟模块，获取构建包多语言
在旧插件中，我们把代码中多语言文件展平，转换为json文件并放在构建包中的多语言目录中。但是读取构建包多语言目录的逻辑依然需要在用户的业务工程中自行编写。这一部分，我们把这个代码也放到插件中。

### 功能实现

代码依然简化了部分该章节不涉及的内容。

```ts
// src/index.ts
import getDistI18n from './getDistI18n'
const GetDistI18nVirtualId = 'vite-plugin-i18n-xxx:getDistI18n'

export default function i18nBuildPlugin() {
  return {
    name: 'vite-plugin-i18n-xxx',
    resolveId(id: string) {
      // 虚拟模块插件前缀
      if (id === GetDistI18nVirtualId) {
        return getVirtualId(GetDistI18nVirtualId)
      }
    },
    load(id: string) {
      if (id === getVirtualId(GetDistI18nVirtualId)) {
        // url前缀 注意文件路径分隔符和url可能不同
        const urlBase = path.join(base, distPath).replace(/\\/g, '/')
        // 返回空函数
        if (!isProduction || !optionConfig.distGen) return getDistI18n(false, urlBase)
        // 返回生成逻辑
        return getDistI18n(true, urlBase)
      }
    },
  }
}
```

```ts
// src/getDistI18n.ts
import fs from 'fs'
import path from 'path'
export default function getDistI18n(distGen: boolean, urlBase: string) {
  let filePath = path.join(__dirname, '../virtualCode')
  if (!distGen) {
    filePath = path.join(filePath, 'emptyI18n.js')
  } else {
    filePath = path.join(filePath, 'fetchI18n.js')
  }
  let data = fs.readFileSync(filePath, 'utf8')
  data = data.replace('<<DistPath>>', urlBase)
  return data
}
```

```js
// virtualCode/emptyI18n.js
export default function fetchI18n(lang) {
  return {}
}
```

```js
// virtualCode/fetchI18n.js
export default async function fetchI18n(lang) {
  const reqUrl = `<<DistPath>>/${lang}.json`
  const res = await fetch(reqUrl)
  const jsonData = await res.json()
  return jsonData
}
```
这里又新增了一个vite虚拟模块，名字叫做`vite-plugin-i18n-xxx:getDistI18n`，提供了生产模式下的多语言包的读取功能。虽然是生产模式下读取，但是开发模式下，这个模块也会被构建，因此我们需要处理两种模式。

在getDistI18n函数中，我们将一些js文件以文本文件的形式读取，进行了部分内容替换，然后提供给了vite。

* 为什么以文本文件的形式读取js文件？  
  因为这个代码需要被vite解析，作为一个代码被用户的业务工程执行，而不是被插件直接执行。
* 为什么用js而不用ts？  
  因为用户的业务工程可能并不是ts，我们也要考虑纯js项目的需求。
* 为什么开发模式下要返会空的对象？  
  如上所述，开发模式下这个模块也会被引入（虽然不会被使用）。这时我们没有构建包，无法返回数据，只能返回空对象了。
* 为什么开发模式下还要与生产模式同样的入参？  
  虽然文件是用js写的，但是我们依然需要导出类型，以便于使用的ts的用户。因此两边的入参需要一致。

js文件中写了如何获取多语言包的实际逻辑。和旧插件的使用类似，也是通过HTTP请求从静态资源中读取，转换为json。与旧插件不一致的地方在于，这里使用fetch，而不是Axios。因为fetch浏览器原生支持，不需要安装依赖；而如果使用Axios，则需要强迫用户安装。注意这些js文件在插件打包时是不会被包含进去的，这些文件需要同时上传到npm包中。另外文件分隔符和URL路径分隔符不一定相同，可能需要转换。

看到这里，部分同学会有一个较大的疑问：**这些逻辑使用普通的函数导出不可以么，为什么要使用Vite虚拟模块？**

问题出在distPath上。我们想要使用HTTP请求的方式获取构建包中的多语言，那我们必须要知道用户配置的distPath是什么，还要知道vite配置的base值。这些的配置如果作为函数的入参，让用户自己输入，那确实就不需要虚拟模块了。但是那样实现有点太不优雅了，同一个配置还需要用户再写一遍。因此我采用了虚拟模块实现。

### 使用方法
这里依然以vue-i18n为例：
```ts
import getDistI18n from 'vite-plugin-i18n-xxx:getDistI18n'

async function renderI18n(langKey = 'zh_CN') {
  i18n.global.locale.value = langKey
  if (!import.meta.env.DEV) {
    const message = await getDistI18n(langKey)
    i18n.global.setLocaleMessage(langKey, message)
  }
}
```
getDistI18n模块的入参为语言key，插件会自动请求多语言文件并返回。返回的结果是平铺的多语言对象，可以直接被vue-i18n使用。

到这里，我们又解决了问题4和问题6。

## 使用vite虚拟模块，实现皮肤切换
旧插件中的皮肤切换方法也是直接写在用户业务工程中的，我们把这一部分也放到插件中。

### 功能实现
```ts
// src/index.ts
import changeSkin from './changeSkin'
// 虚拟模块key
const ChangeVirtualId = 'vite-plugin-skin-xxx:change'

export default function skinBuildPlugin() {
  return {
    name: 'vite-plugin-skin-xxx',
    resolveId(id: string) {
      // 虚拟模块插件前缀
      if (id === ChangeVirtualId) {
        return getVirtualId(ChangeVirtualId)
      }
    },
    load(id: string) {
      if (id === getVirtualId(ChangeVirtualId)) {
        // url前缀 注意文件路径分隔符和url可能不同
        const urlBase = path.join(base, distPath).replace(/\\/g, '/')
        const srcPathBase = srcPath.replace(/\\/g, '/')
        // 返回生成逻辑
        if (isProduction && optionConfig.distGen) {
          return changeSkin('build', srcPathBase, urlBase)
        } else {
          return changeSkin('src', srcPathBase, urlBase)
        }
      }
    },
  }
}
```

```ts
// src/changeSkin.ts
import fs from 'fs'
import path from 'path'

export default function changeSkin(mode: string, srcPathBase: string, urlBase: string) {
  let filePath = path.join(__dirname, '../virtualCode')
  if (mode === 'build') {
    filePath = path.join(filePath, 'getBuildSkin.js')
    let data = fs.readFileSync(filePath, 'utf8')
    data = data.replace('<<DistPath>>', urlBase)
    return data
  } else {
    filePath = path.join(filePath, 'getDevSkin.js')
    let data = fs.readFileSync(filePath, 'utf8')
    data = data.replace('<<SrcPath>>', srcPathBase)
    return data
  }
}
```

```ts
// virtualCode/getBuildSkin.js
// 获取皮肤
export default function fetchSkin(skinKey) {
  const reqUrl = `<<DistPath>>/${skinKey}/index.css`
  loadCSSPath(reqUrl, skinKey)
}
// 使用路径引入css
function loadCSSPath(path, name) {
  const head = document.getElementsByTagName('head')[0]
  const linkId = `skin-${name}`
  const linkEle = document.getElementById(linkId)
  if (linkEle) linkEle.parentNode?.removeChild(linkEle)
  const skinCssEle = document.createElement('link')
  skinCssEle.href = path
  skinCssEle.rel = 'stylesheet'
  skinCssEle.type = 'text/css'
  skinCssEle.setAttribute('id', linkId)
  head.appendChild(skinCssEle)
}
```

```ts
// virtualCode/getDevSkin.js
// 省略了loadCSSPath函数，与virtualCode/getBuildSkin.js中一致。
// dev模式下获取皮肤
export default function fetchSkin(skinKey) {
  const reg = /.*\/(.*)\/index\.css/
  const modules = import.meta.glob('/<<SrcPath>>/*/index.css', { as: 'url' })
  Object.keys(modules).forEach(async (key) => {
    const regMatch = key.match(reg)
    if (!regMatch) return
    const skinKeyGet = regMatch[1] || ''
    if (skinKeyGet !== skinKey) return
    // 找到真实的url路径
    const path = await modules[key]()
    loadCSSPath(path, skinKey)
  })
}
```

这里的实现方式与上面获取生产模式多语言包功能非常相似。依然是区分了开发模式和生产模式。虚拟模块的主要逻辑在`changeSkin`中，同样也是在两个模式下读取了不同的js文件，替换了路径并返回给vite。

js文件中，实现替换皮肤的核心函数是loadCSSPath，开发模式和生产模式一致，都是使用和旧插件一样的引入新标签的方法。但是获取css文件路径的方式就不同了：
* 生产模式下，直接拼合构建包中的皮肤路径和皮肤key即可。
* 开发模式下，多皮肤在源码中，我们vite导入文件的形式`import.meta.glob`来获取源码中的url路径。

开发模式下的方法也是之前直接写在用户业务工程中的方法，现在直接转移到了插件中。

### 使用方法
切换皮肤的使用方法特别简单。
```ts
import fetchSkin from 'vite-plugin-skin-xxx:change'
// 切换皮肤
fetchSkin('whiteBlue')
```
该功能在不同状态下使用的皮肤文件有区别：
* 开发模式下 使用`srcPath`中的多皮肤文件
* 生产模式下，未开启`distGen` 使用`srcPath`中的多皮肤文件
* 生产模式下，已开启`distGen` 使用`distPath`中的多皮肤文件

这一节，我们又解决了问题5。

## ts声明
### 插件主体声明文件
插件主体的ts声明使用unbuild自带的生成配置，直接导出即可。但插件中和在普通业务工程中使用声明文件有点区别。

**普通业务工程中使用声明文件**
```ts
// types/types.d.ts
interface DeepRecord {
  [key: string]: DeepRecord | string
}
```

```ts
// src/buildI18n.ts
function objDeepEachKey(obj: DeepRecord, keyPre: string): Record<string, string> {}
```

**插件工程中使用声明文件**
```ts
// src/types.d.ts
export interface DeepRecord {
  [key: string]: DeepRecord | string
}
```

```ts
import { DeepRecord } from './types'
// src/buildI18n.ts
function objDeepEachKey(obj: DeepRecord, keyPre: string): Record<string, string> {}
```

* 在普通业务工程中，声明文件无需导出，使用该声明的代码处无需刻意引入。
* 在插件工程中，声明文件需要导出，使用该声明的代码处需要刻意引入。

在插件工程中如果不导出声明文件，使用该声明的代码处不引入，我们开发时IDE不会报错；但是打包后生成的声明文件并不会包含我们自己声明的类型。

### 虚拟模块声明文件
插件打包时并不会为我们生成虚拟模块的声明文件，因此虚拟模块的声明还需要单独给出。
```ts
// 多语言插件 client.d.ts
declare module 'vite-plugin-i18n-xxx:messages' {
  const messages: any
  export default messages
}

declare module 'vite-plugin-i18n-xxx:getDistI18n' {
  const fetchI18n: (lang: string) => Promise<any>
  export default fetchI18n
}
```

```ts
// 多皮肤插件 client.d.ts
declare module 'vite-plugin-skin-xxx:change' {
  const fetchSkin: (skinKey: string) => null
  export default fetchSkin
}
```

上面分别是两个插件用到的声明，需要我们手写导出的具体类型。声明放到`client.d.ts`，一起放到npm包中。前面看到的`package.json`中的配置也要修改。这样额外导出的虚拟模块声明，在用户业务工程中也要特殊配置一下。注意是用户工程（非插件工程）中。
```json
// tsconfig.json
{
  "compilerOptions": {
    "types": ["vite-plugin-skin-xxx/client", "vite-plugin-i18n-xxx/client"]
  } 
}
```

## 使用pnpm本地引用插件
至此，开始提出的8个问题已经全部解决。插件工程本身还使用了ESLint和Prettier进行语法检查和代码格式化。

上述的内容全部完成后，还需要试用插件的效果。如果在本地测试，以往我们还需要`npm link`。但是这两个插件是在一个脚手架大仓库中的子项目。这个仓库使用pnpm，所有的子项目都在`pnpm-workspace.yaml`中记录，能够较方便的解决项目间引用的问题。
```yaml
packages:
  - 'templates/*'
  - 'docs'
  - 'create-xxx'
  - 'vite-plugin-i18n-xxx'
  - 'vite-plugin-skin-xxx'
```
使用pnpm，templates目录中的模板工程安装这两个插件，即可直接引用当前开发的这两个工程，而不是从npm仓库中下载包。经测试后，可以直接上传npm仓库了。

```sh
# 上传npm包
npm publish
```

我们上传后，再打开模板工程，安装依赖，发现我们依然引用的是本地两个插件工程。如果希望测试我们上传的npm包的功能呢？这时候删掉`pnpm-workspace.yaml`中的两个插件名称，重新安装依赖，这时候引用的就是下载的npm包插件了。

## 参考
- 使用vite和vue-i18n，实现部署后新增多语言包功能  
  https://blog.csdn.net/qq278672818/article/details/128187194
- 使用vite和Element Plus，实现部署后新增主题/皮肤包  
  https://blog.csdn.net/qq278672818/article/details/128344032
- vite-plugin-pages 基于文件系统的路由  
  https://github.com/hannoeru/vite-plugin-pages
- @intlify/vite-plugin-vue-i18n vue-i18n的Vite插件  
  https://github.com/intlify/bundle-tools/tree/main/packages/vite-plugin-vue-i18n
- Vite文档 虚拟模块示例  
  https://cn.vitejs.dev/guide/api-plugin.html#virtual-modules-convention
- Rollup文档 虚拟模块示例  
  https://cn.rollupjs.org/plugin-development/#a-simple-example
- Vite文档 outDir与assetsDir  
  https://cn.vitejs.dev/config/build-options.html#build-outdir
