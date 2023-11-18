# 使用vite和Element Plus，实现部署后不修改代码/打包，新增主题/皮肤包

Web前端界面切换主题/皮肤，是一个常见的需求。如果希望在打包部署后实现皮肤的修改甚至增加皮肤，不需要修改源码或者重新打包，类似于我们常见的皮肤包扩展，又该如何实现呢？
我使用类似上一期多语言包功能中介绍的方法来实现。

这个方法对Vue2和Vue3都适用，甚至可以适用于非Vue的前端框架。但是如果项目使用了组件库，皮肤包一般配合UI组件库使用，所以需要UI组件库的支持。目前Element Plus(Vue3)可以直接支持这种模式，Element(Vue2)和Ant Design Vue的支持程度不好。

## 目录
[[toc]]

## 功能和工程结构
### 工程结构
为了方便后续说明，首先提供一下我这边整个项目的目录结构。目录结构中省略了与本次说明不相关的文件。
```
├─app
    ├─package.json
    ├─tsconfig.json
    ├─tsconfig.node.json
    ├─vite.config.ts
    ├─src
    |  ├─App.vue
    |  ├─main.ts
    |  ├─style
    |  |   ├─style.scss
    |  |   └─var.scss
    |  ├─skin
    |  |  ├─index.ts
    |  |  ├─whiteSkin
    |  |  |    ├─bcd.css
    |  |  |    └─index.css
    |  |  ├─redSkin
    |  |       ├─abc.css
    |  |       └─index.css
    |  └─pages
    |     └─subject.vue
    └─plugins
       └─rollup-Plugin-skin-build
               └─index.ts
```

### 代码中的皮肤
开发时皮肤默认存放在`src/skin`文件夹中，也可以存放到其他位置。其中`index.ts`是皮肤的获取逻辑，剩下的每个文件夹都是一种皮肤。皮肤使用`index.css`引入。里面可以包含任意的子文件夹和文件，只要它们能被`index.css`获取到。例如：
```
├─whiteSkin
|  ├─index.css
|  ├─font
|  |    ├─font1.eot
|  |    └─font2.ttf
|  ├─tool
|       ├─tool1.css
|       └─tool2.css
```

注意皮肤里面不能使用需要编译的格式，必须是纯css文件。里面可以定义CSS变量。

```css
/* 引入同一皮肤下的其他css文件 */
@import './bcd.css';

/* element-plus 变量 */
:root {
 --el-color-primary: #409eff;
}

/* 自定义 变量 */
:root {
  /*  背景 */
  --grey-background-color: rgba(0, 0, 0, 0.07);
  /*  文字颜色 */
  --grey-font-color: rgba(0, 0, 0, 0.7);
}
```

然后在页面中引用变量，这时候使用纯css或者其他工具（例如scss, less）都可以。

```html
<style lang="scss" scoped>
  .test {
    color: var(--test-color);
  }
</style>

<style scoped>
  .item-label {
    color: var(--grey-font-color);
  }
</style>
```

这就需要我们前端开发页面的时候，需要抽象出一些可供换肤的皮肤变量。除了皮肤变量之外，我们也可以在皮肤中写一些css样式，也能够进行覆盖。

### 支持的UI组件库类型
读到这里，我们也能够清楚，这种方法适用于那些支持css全局变量换肤的组件库。我们通过覆盖全局变量的值实现换肤。是否支持打开浏览器的调试就能看到。例如：

* Element Plus：

![](/2022/vite-element-skin-1.png)

其中Element Plus官方也说明了这种换肤方式: [通过CSS变量设置](https://element-plus.gitee.io/zh-CN/guide/theming.html#通过CSS变量设置)

### 构建包(dist)中的皮肤目录
为了统一后端寻址，dist中的皮肤文件默认统一放置在`dist/assets/skin`，也可以存放到其他位置。目录中即是开发`src/skin`中的每个皮肤的文件夹，内容也一致。

```
├─dist
|   ├─index.html
|   └─assets
|      ├─vite.svg
|      └─skin
|         ├─whiteSkin
|         |    ├─bcd.css
|         |    └─index.css
|         └─redSkin
|             ├─abc.css
|             └─index.css
```

如果希望增加/修改皮肤，就在构建包的皮肤目录中增加/修改皮肤文件即可，不需要修改代码或重新打包。

## 切换皮肤
切换皮肤开发模式和生产模式基本相同，因此一起介绍。

### 代码实现
```ts
// src/skin/index.ts

const distPath = `${import.meta.env.VITE_NAMESPACE}/assets/skin/`

// 使用路径引入css
function loadCSSPath(path: string, name: string) {
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

// dev模式下获取皮肤
async function getDevSkin(skinKey: string) {
  const reg = /.*skin\/(.*)\/index\.css/
  const modules = import.meta.glob('@/skin/*/index.css', { as: 'url' })
  Object.keys(modules).forEach(async (key: string) => {
    const regMatch = key.match(reg)
    if (!regMatch) return
    const skinKeyGet = regMatch[1] || ''
    if (skinKeyGet !== skinKey) return
    // 找到真实的url路径
    const path = await modules[key]()
    loadCSSPath(path, skinKey)
  })
}

// prod模式下获取皮肤
async function getProdSkin(skinKey: string) {
  const reqUrl = `${distPath}${skinKey}/index.css`
  loadCSSPath(reqUrl, skinKey)
}

// 切换皮肤调用函数
export async function renderSkin(skinKey: string) {
  if (import.meta.env.DEV) {
    getDevSkin(skinKey)
  } else {
    getProdSkin(skinKey)
  }
}

// 默认皮肤
renderSkin('whiteSkin')
```

### 实现切换皮肤的方式
切换皮肤的函数是`loadCSSPath`，使用原生的javascript的DOM操作，在`<head>`中创建一个`<link>`标签，放置CSS文件的URL地址即可。这个方法参考了其他人的方法。

如果在开发模式下加载CSS文件，有更简单的方式：
```ts
await import(`./${skinKey}/index.css`)
```
但是这种动态import方法对同一种皮肤只能生效一次，第二次再引入同样的文件就无效了。因此还是上面的DOM操作更合适。

### 开发模式和生产模式的区别
* 生产模式很简单，我们知道URL地址，直接赋值即可。
* 开发模式下不知道url，反而麻烦一点。需要用`import.meta.glob`把皮肤文件作为URL加载，再进行赋值。

## rollup插件生成构建包(dist)皮肤
同样的，虽然标题写了vite（因为vite对于Vue开发者更熟悉），但插件本身并没有使用vite特性，所以它是一个同时支持vite和rollup的插件。

### 调用方式
```ts
// vite.config.ts
import { defineConfig, ConfigEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import skinBuildPlugin from './plugins/rollup-plugin-skin-build'

export default ({ mode }: ConfigEnv) => {
  return defineConfig({
    plugins: [vue(), skinBuildPlugin(mode)],
    ...['其它vite配置']
  })
}
```

插件入参
* `mode`  
模式，只在生产模式`production`时执行插件
* `srcPath`  
代码中皮肤目录，默认`src/skin`
* `distPath`  
构建包(dist)中的皮肤目录，默认`dist/assets/skin`

### 代码实现
```ts
// plugins/rollup-plugin-skin-build/index.ts
import fs from 'fs-extra'
import path from 'path'

function setDevSkins(srcPath: string, distPath: string) {
  const dir = fs.readdirSync(srcPath)
  dir.forEach(async (name: string) => {
    const srcNamePath = path.join(srcPath, name)
    const distNamePath = path.join(distPath, name)
    const stats = fs.lstatSync(srcNamePath)
    if (stats.isDirectory()) {
      fs.mkdirSync(distNamePath)
      fs.copy(srcNamePath, distNamePath)
    }
  })
}

export default function skinBuildPlugin(
  mode: string,
  srcPath = path.join('src', 'skin'),
  distPath = path.join('dist', 'assets', 'skin'),
) {
  return {
    name: 'skinBuildPlugin',
    async closeBundle() {
      if (mode !== 'production') {
        return
      }
      fs.mkdirSync(distPath)
      setDevSkins(srcPath, distPath)
    },
  }
}
```

### 实现说明
皮肤的插件比生成多语言还要简单一点。这里还是复制了部分多语言插件中的说明。

1. 皮肤文件实际上就是原封不动的从`srcPath`放到`distPath`目录而已。
2. 插件在使用closeBundle钩子，是rollup钩子中的最后一步。[rollup钩子说明](https://rollupjs.org/guide/en/#output-generation-hooks)。触发closeBundle钩子的时候，打包已经结束，dist目录中已经已经有了打包后的文件。选择钩子时，注意必须在新的dist文件生成之后才能执行。
3. 插件中的代码是打包时执行，是node环境，不是浏览器环境，不能使用`import.meta.glob`，因此使用fs读取文件。
4. 复制整个文件夹的操作使用node.js原生的`fs.cpSync`更合适。但是这个功能在node.js 16.7版本才有，考虑到很多人的node版本号小于16.7，因此还是引入了`fs-extra`。

## 参考
- 使用vite和vue-i18n，实现部署后新增多语言包功能  
  https://blog.csdn.net/qq278672818/article/details/128187194
- Element Plus组件库 通过CSS变量设置换肤  
  https://element-plus.gitee.io/zh-CN/guide/theming.html#通过CSS变量设置
- rollup钩子说明  
  https://rollupjs.org/guide/en/#output-generation-hooks
