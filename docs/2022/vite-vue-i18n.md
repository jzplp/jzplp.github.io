
# 使用vite和vue-i18n，实现部署后更新多语言功能

vue-i18n是Vue.js的国际化插件，用于实现多语言功能。但是vue-i18n文档中提供的示例用法仅仅是开发时才可以添加/修改多语言。如果希望在打包部署后实现多语言的修改甚至增加语言，不需要修改源码或者重新打包，类似于我们常见的多语言包扩展，又该如何实现呢？

## 功能和工程结构
### 工程结构
为了方便后续说明，首先提供一下我这边整个项目的目录结构。目录结构中省略了与本次说明不相关的文件。这里使用的是Vue3，但是方法对vue2也适用。
```
|-- app
    |-- package.json
    |-- tsconfig.json
    |-- tsconfig.node.json
    |-- vite.config.ts
    |-- plugins
    |   |-- rollup-plugin-i18n-build
    |       |-- index.ts
    |-- src
        |-- main.ts
        |-- i18n
        |   |-- ar-SA.yaml
        |   |-- de-DE.yml
        |   |-- en_US.json
        |   |-- es-ES.json5
        |   |-- index.ts
        |   |-- zh_CN.json
        |-- pages
            |-- subject.vue
```

### 代码中的多语言
开发时多语言默认存放在`src/i18n`文件夹中，也可以存放到其他位置。文件夹中存放各个语言的语言文件，以语言key命名。支持的文件格式有：
* json
* yaml
* yml
* json5

代码会自动查找上述后缀的文件作为语言文件。非上述后缀的文件，例如`.ts .js`多语言生成时会被忽略。

文件格式如下，使用vue-i18n接受的格式即可。可以嵌套结构，也可以平铺。
```json
{
  "abc": {
    "def": "你好"
  },
  "def": "你好js",
  "common": {
    "delete": "删除"
  }
}
```
```yaml
abc.def: hello
def: hello js
common.delete: delete
```

### 构建包(dist)中的多语言目录
为了统一后端寻址，生成的的多语言文件默认统一放置在`dist/assets/i18n`，也可以存放到其他位置。生成后多语言的文件统一为平铺的json格式，方便同事进行翻译。
```
|-- dist
    |-- index.html
    |-- assets
        |-- vite.svg
        |-- i18n
            |-- ar-SA.json
            |-- de-DE.json
            |-- en_US.json
            |-- es-ES.json
            |-- zh_CN.json
```
如果希望增加/修改多语言，就在构建包的多语言目录中增加/修改多语言文件即可，不需要修改代码或重新打包。


## 获取多语言的实现
代码执行时，多语言这边分为两种获取方式，开发模式从代码中的多语言中获取，生产版本从dist中获取。
### 开发模式获取多语言
```ts
// src/i18n/index.ts

import { createI18n } from 'vue-i18n'
import axios from 'axios'
import jsyaml from 'js-yaml'
import json5 from 'json5'

interface DeepRecord {
  [key: string]: DeepRecord | string
}

// 根据不同格式转换文件内容
function transFile(fileData: string, suffix: string): DeepRecord {
  switch (suffix) {
    case 'json':
    case 'json5':
      return json5.parse(fileData) as DeepRecord
    case 'yaml':
    case 'yml':
      return jsyaml.load(fileData) as DeepRecord
  }
  return {}
}

function getDevLanguages() {
  const reg = /.*i18n\/(.*)\.(json5?|yaml|yml)/
  const messages: Record<string, any> = {}
  const components = import.meta.glob(
    ['@/i18n/*.json5', '@/i18n/*.json', '@/i18n/*.yaml', '@/i18n/*.yml'],
    {
      as: 'raw',
      eager: true,
    },
  )
  Object.keys(components).forEach((key: string) => {
    const regMatch = key.match(reg)
    if (!regMatch) return
    const langKey = regMatch[1] || ''
    const suffix = regMatch[2] || ''
    if (!langKey || !suffix) return
    messages[langKey] = transFile(components[key], suffix)
  })
  return messages
}

// 默认多语言
const i18n = createI18n({
  locale: 'zh_CN',
  legacy: false,
  messages: getDevLanguages(),
})

export default i18n
```
开发模式下使用`import.meta.glob`自动查找`src/i18n`下的所有多语言文件。根据不同的文件后缀对文件内容解析为Object，createI18n时作为messages提供。

### 生产版本获取多语言
生产版本下，把多语言文件做为静态资源，使用接口获取。
```ts
// src/i18n/index.ts
const distPath = `${import.meta.env.VITE_NAMESPACE}/assets/i18n/`

async function getLanguage(lang: string) {
  const reqUrl = `${distPath}${lang}.json`
  const res = await axios.get(reqUrl)
  return res.data
}

// 默认多语言 代码上面已经提供了
const i18n = createI18n('...')

// build后从静态资源中获取
export async function renderI18n(langKey = 'zh_CN') {
  if (import.meta.env.DEV) {
    i18n.global.locale.value = langKey
  } else {
    const message = await getLanguage(langKey)
    i18n.global.locale.value = langKey
    i18n.global.setLocaleMessage(langKey, message)
  }
}
renderI18n()
```
设置多语言时调用renderI18n函数即可。入参是多语言key，把静态资源作为接口请求，获取到多语言文件，设置i18n对象为所需要的语言。

## rollup插件生成构建包(dist)多语言
虽然标题写了vite（因为vite对于Vue开发者更熟悉），但插件本身并没有使用vite特性，所以它是一个同时支持vite和rollup的插件。

### 调用方式
```ts
// vite.config.ts
import { defineConfig, ConfigEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import i18nBuildPlugin from './plugins/rollup-plugin-i18n-build'

export default ({ mode }: ConfigEnv) => {
  return defineConfig({
    plugins: [vue(), i18nBuildPlugin(mode)],
    ...['其它vite配置']
  })
}
```

插件入参
* `mode`      模式，只在生产模式`production`时执行插件
* `srcPath`   代码中多语言目录，默认`src/i18n`
* `distPath`  构建包(dist)中的多语言目录，默认`dist/assets/i18n`

### 代码实现
```ts
// plugins/rollup-plugin-i18n-build/index.ts
import fs from 'fs'
import path from 'path'
import jsyaml from 'js-yaml'
import json5 from 'json5'

interface DeepRecord {
  [key: string]: DeepRecord | string
}

// 递归展平
function objDeepEachKey(obj: DeepRecord, keyPre: string): Record<string, string> {
  const i18nJson: Record<string, string> = {}
  Object.keys(obj).forEach((key: string) => {
    if (Object.prototype.toString.call(obj[key]) === '[object Object]') {
      Object.assign(i18nJson, objDeepEachKey(obj[key] as DeepRecord, keyPre + key + '.'))
    } else {
      //@ts-ignore
      i18nJson[keyPre + key] = obj[key]
    }
  })
  return i18nJson
}

// 把嵌套的多语言字符串展平
function i18nFlat(obj: DeepRecord): string {
  const i18nJson: Record<string, string> = objDeepEachKey(obj, '')
  return JSON.stringify(i18nJson)
}

// 根据不同格式转换文件内容
function transFile(fileData: string, suffix: string): DeepRecord {
  switch (suffix) {
    case 'json':
    case 'json5':
      return json5.parse(fileData) as DeepRecord
    case 'yaml':
    case 'yml':
      return jsyaml.load(fileData) as DeepRecord
  }
  return {}
}

const reg = /(.*)\.(json5?|yaml|yml)$/
// 把dev模式下的多语言文件保存在dist下
function setDevLangs(srcPath: string, distPath: string) {
  const dir = fs.readdirSync(srcPath)
  dir.forEach(async (name: string) => {
    const regMatch = name.match(reg)
    if (!regMatch) return
    const langKey = regMatch[1] || ''
    const suffix = regMatch[2] || ''
    if (!langKey || !suffix) return
    const data = fs.readFileSync(path.join(srcPath, name), 'utf8')
    const mes = i18nFlat(transFile(data, suffix))
    fs.writeFileSync(path.join(distPath, langKey + '.json'), mes)
  })
}

export default function i18nBuildPlugin(
  mode: string,
  srcPath = path.join('src', 'i18n'),
  distPath = path.join('dist', 'assets', 'i18n'),
) {
  return {
    name: 'i18nBuildPlugin',
    async closeBundle() {
      if (mode !== 'production') {
        return
      }
      fs.mkdirSync(distPath)
      setDevLangs(srcPath, distPath)
    },
  }
}
```

### 实现说明
1. 插件在使用closeBundle钩子，是rollup钩子中的最后一步。[rollup钩子说明](https://rollupjs.org/guide/en/#output-generation-hooks)。触发closeBundle钩子的时候，打包已经结束，dist目录中已经已经有了打包后的文件。选择钩子时，注意必须在新的dist文件生成之后才能执行。
2. 这时候setDevLangs函数`srcPath`中的多语言文件。这里的代码是打包时执行，是node环境，不是浏览器环境，不能使用`import.meta.glob`，因此使用fs读取文件。
3. 读取后根据后缀名读取文件内容。这部分的代码基本和`src/i18n/index.ts`中开发时获取多语言的方式一致。
4. objDeepEachKey函数递归展平多语言key。开发时为了方便，多语言key是嵌套的，但是展平的key对后续翻译和其他地方归档更方便。
5. 生成的多语言对象作为json存储在`distPath`中。

## 注意示项和问题

### Vue3和Vue2的实现差异
* 实现方式从Vue3改为Vue2非常简单：
```ts
// src/i18n/index.ts
// vue3实现
i18n.global.locale.value = langKey
i18n.global.setLocaleMessage(langKey, message)

// vue2实现
i18n.locale = langKey
i18n.setLocaleMessage(langKey, message)
```
这两句是vue-i18n切换语言和设置message的方法。

### 同一种语言没有使用多个文件描述
其实一开始我是想每一种多语言一个文件夹，文件夹中可以有多个描述文件，用index.ts作为导出接口。
```
// 一开始设想的实现方式
src
├── i18n
│    ├── zh_CN
│    │  ├── index.ts
│    │  ├── abc.ts
│    ├── en_US
│    │  ├── index.ts
│    │  ├── abc.ts
│    ├── index.ts
```

这样方便开发人员查找多语言，提交代码也不容易冲突。但这在实现上有一些问题：  
* 代码多语言目录中同一份代码文件既在浏览器端执行，又在插件中的node端执行。`tsconfig.json`和`tsconfig.node.json`中的`include`不能添加相同的的目录。
* js/ts文件中的内容是不可控的，可能用户在代码中添加了一些浏览器端中的特性，比如`import.meta.glob`，作为插件没办法控制，只能报错。
* 插件的代码中可以使用静态路径的`import`或者`require`导入代码多语言目录的js/ts文件，而且js/ts文件中包含的import也能正常导入。我可以先使用fs获取目录列表，然后在单个导入。但是，插件中的`import`或者`require`导入只能静态解析，不能写动态路径，例如`src/i18n/${key}`。如果使用fs读取js/ts文件，则需要自己解析执行，如果遇到import还需要自己查找依赖再用fs引入。这样越来越复杂了，遂放弃。
* 如果在多语言目录中多一个`i18n.ts`文件，对每个语言目录中的`index.ts`手动引入（无法使用`import.meta.glob`这种自动查找方法），在插件中再手动引入`i18n.ts`，这样就能避免上一个问题。但是这样实现只能说太不优雅了（虽然目前也并不优雅...）。
* 后来，我看到了[vitesse](https://github.com/antfu/vitesse)和[vite-plugin-vue-i18n](https://github.com/intlify/bundle-tools/tree/main/packages/vite-plugin-vue-i18n)。发现这里面的插件也是每个语言只有一个文件。我想开了，一个就一个吧。

### 直接使用静态资源目录存放
* 如果每个语言一个文件，其实有更好的实现方式： 既然我们用的是json/yaml等配置文件，直接在public文件（或者专门设置一个静态资源目录）中放置语言文件就行了。这样开发模式和生产模式都去解析静态资源即可，这样也不用写插件，甚至也不用区分开发模式和生产模式，也同样能实现部署后更新多语言功能。那么上面的方法相比静态资源目录存放有什么优势呢？
* 自动识别转换语言文件格式为json
* 自动展平多语言key
* distPath任意指定。例如是使用静态资源目录，又想存放到`assets/i18n/`中，我们的静态资源目录需要是`public/assets/i18n/`，这样写起来不太好看。

## 参考

- 适用于Vue2的vue-i18n  
  https://kazupon.github.io/vue-i18n/zh/
- 适用于Vue3的vue-i18n  
  https://vue-i18n.intlify.dev/
- rollup钩子说明  
  https://rollupjs.org/guide/en/#output-generation-hooks
- Vitesse Vue3工程模板  
  https://github.com/antfu/vitesse
- vite-plugin-vue-i18n Vue3的i18n插件  
  https://github.com/intlify/bundle-tools/tree/main/packages/vite-plugin-vue-i18n
