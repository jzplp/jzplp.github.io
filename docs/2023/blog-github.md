# 使用VitePress和Github搭建个人博客网站，可以自动构建和发布

之前我们写过一篇关于如何自动构建和发布个人博客的文章，当时是使用VuePress和GitLab。[GitLab持续集成部署CI/CD初探：如何自动构建和发布个人前端博客](/2022/gitlab-cicd)

现在换了Vue3和Vite，使用VitePress在Github上又搭建了一个博客。下面就介绍一下，如何使用这几个工具创建个人博客。

## 使用VitePress搭建博客工程
VitePress是一个静态网站生成器，内容使用Markdown语法，配置简单，同时附带了一个默认主题，即使不需要写前端代码，也可以生成一个静态网站。底层使用Vite和Vue3，前端开发者可方便的进行修改或定制。
::: tip
下面所述的安装过程和版本说明皆参考与对应工具的官网，后续可能会有更新或变动，以官网为准。
:::

### 安装过程
1. 首先需要本地安装Node.js，需要16版本及以上。
2. 推荐使用pnpm，命令行安装`npm install -g pnpm`。
2. 创建工程，安装VitePress。首先创建文件夹，并打开命令行。
```shell
# 初始化node工程
pnpm init
# 安装vitepress
pnpm add -D vitepress
# 初始化vitepress
pnpm exec vitepress init
```

**初始化vitepress时的注意事项**
* 初始化时会要求填入配置目录位置，填入`./docs`
* 选择主题时，推荐采用默认主题
  * 如果不后续希望改动主题，选择`Default Theme`。
  * 如果希望后续修改主题，选择`Default Theme + Customization`
* 要加入VitePress npm scripts到`package.json`中

初始化之后再查看`package.json`，发现scripts中有了几条命令，这里说明下使用方法：
```shell
# 安装依赖
pnpm install
# 开发模式启动
pnpm docs:dev
# 手动构建
pnpm docs:build
# 预览构建成果
pnpm docs:preview
```

启动开发模式，把命令行中出现的网址复制到浏览器中，即可预览效果。

### 工程结构
为了方便参考，这里列出我博客的工程目录。
```txt
jzplp.github.io
├─.github           # github配置
│  └─workflows      # 自动构建部署配置
├─bin               # 执行脚本
├─components        # vue组件
├─docs              # 博客内容
│   ├─.vitepress    
│   │  ├─config.ts  # vitepress配置
│   │  ├─cache      # 缓存文件，可忽略提交
│   │  ├─dist       # 构建包，可忽略提交
│   │  └─theme      # 样式和主题
│   ├─index.md      # 博客首页
│   ├─2023          # 按照年份存放博文
│   ├─2022
│   ├─...           # 更多博客目录
│   └─public        # 博客使用的静态资源
├─node_modules      # 依赖目录，可忽略提交
├─.gitignore        # git提交忽略配置
├─package.json      # node.js配置
├─pnpm-lock.yaml    # 依赖的锁定版本号
└─README.md         # 工程说明
```
目录中部分文件的作用会在下面描述。

## 撰写博客

### 撰写文章
启动后可以看到，默认提供了一个首页和几个内页的参考。可以在`docs`目录内创建Markdown文件，撰写文章，在`docs/.vitepress/config.ts`中配置菜单路由。配置示例：

```ts
import { defineConfig } from 'vitepress'
export default defineConfig({
  lang: 'zh-CN',
  title: "漂流瓶jz的博客",
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
    ],
    sidebar: [
      {
        text: '2023',
        items: [
          { text: '使用VitePress和Github搭建个人博客，可以自动构建和发布', link: '/2023/blog-github' },
        ],
      },
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/jzplp/jzplp.github.io' }
    ]
  }
})
```

对应的文章在目录中的位置：`docs/2023/blog-github.md`。

VitePress在Markdown功能的基础上也进行了很多扩展，可以参考[VitePress文档](https://vitepress.dev/)。

### 修改主题
如果默认主题不符合你的需要，可以对主题进行修改。注意修改主题需要前端的CSS知识。`docs/.vitepress/theme/style.css`中是主题的CSS样式。

可以用浏览器提供的检查元素功能查看希望调整的CSS变量/属性，进行修改。例如希望使左边的导航栏宽度增加：
```css
:root {
  --vp-sidebar-width: 340px;
}
```

### 在MarkDown中使用Vue
如果希望使博客有更好的展示效果，或者有一些特殊的需求，可以使用Vue来实现。注意该功能需要前端开发知识。

首先VitePress在MarkDown中即支持Vue的Template语法，MarkDown本身也支持HTML。例如：
```vue
{{ 1 + 1 }}
<span v-for="i in 3">{{ i }}</span>
```

同时也支持在MarkDown中使用`<script>`和`<style>`等单文件组件的写法，也支持引入Components等。

例如在我的博客中，使用Component来渲染Latex公式。文件位置：`components/latexDisplay.vue`
```vue
<template>
  <span ref="latex" class="katex" v-html="rawHTML"></span>
</template>

<script lang="ts" setup>
import katex from "katex";
import "katex/dist/katex.css";
import { useSlots, onMounted } from 'vue'
const slots = useSlots()
const anyFun = () => {
  return [{
    children: ''
  }]
}
const rawHTML: string = katex.renderToString((slots.default || anyFun)()[0].children, {
  throwOnError: false,
})
</script>
```
使用Component，文件位置：`docs/2022/vue-latex.md`
```vue
<latexDisplay> c = \pm\sqrt{a^2 + b^2} </latexDisplay>

<script setup>
import latexDisplay from '../../components/latexDisplay.vue'
</script>
```
效果：
<latexDisplay> c = \pm\sqrt{a^2 + b^2} </latexDisplay>

## 构建和发布博客网站
当构建好博客之后，我们现在本地进行构建和预览。命令在上面的[安装过程](#安装过程)一节中有描述。

### 创建GitHub仓库
在GitHub上创建仓库，对于名称有特殊要求，为`用户名.github.io`。例如我的用户名为jzplp，仓库名称则为`jzplp.github.io`。

创建仓库后，将我们刚刚创建的博客工程上传到GitHub仓库中。注意并不是所有文件都需要上传，因此我们先需要在工程根目录创建`.gitignore`，写入我们要忽略提交的文件，再进行上传。
```
node_modules
docs/.vitepress/cache
docs/.vitepress/dist
```

上传工程代码的命令：
```shell
git add .
git commit -m "创建博客工程"
git push
```

### 构建和上传dist
上一步我们上传的仅仅是工程的源代码。还需要上传构建成果，才能发布博客网站。我们在工程根目录创建文件`bin/autoDeploy.bat`，这是一个Windows系统下使用的脚本文件。
```shell
call pnpm docs:build
cd docs/.vitepress/dist

git init
git add -A
git commit -m "auto construct blog"

git push -f https://github.com/jzplp/jzplp.github.io.git master:gh-pages
```
注意里面的push地址需要改成你自己的。

文件内容即是我们的构建和发布流程：
1. 构建工程，生成dist，并进入dist目录。
2. 将dist目录中的内容上传至`gh-pages`分支中。

如果使用非Windows系统，对该脚本文件后缀名和内容进行适当修改即可。

我们在`package.json`的`scripts`中增加一条命令：
```json
"deploy:win": "powershell bin/autoDeploy.bat"
```

此时可以执行这条命令，即可完成dist构建包的上传。
```shell
pnpm deploy:win
```

### 发布博客网站
我们进入你创建的GitHub仓库的配置，具体位置在`Settings -> Pages -> Build and deployment -> Source`。来源选择`Deploy from a branch`，即选择一个分支。

选择我们刚刚上传的`gh-pages`分支，根目录，然后保存。

![](/2023/blog-1.png)

然后就可以进入我们的博客网站查看效果啦。网站地址即是我们刚刚建立的仓库名称，即是`用户名.github.io`。例如我的网站是`jzplp.github.io`。

## 使用GitHub Actions进行自动构建和发布
使用上面描述的方法，我们每次写完博客，提交工程代码后，还需要手动构建，更新分支并发布。构建过程在本地电脑上。

那么有没有方法让每次提交工程代码后，自动构建并发布呢？我们使用GitHub Actions就能做到这一点。而且GitHub还提供了服务器，我们可以把构建过程放到服务器中进行。

首先创建配置文件，位置`.github/workflows/deploy.yml`。
```yml
name: Deploy

on:
  # Runs on pushes targeting the default branch
  push:
    branches: ["master"]

  # Allows you to run this workflow manually from the Actions tab
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      pages: write
      id-token: write
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0
      - uses: pnpm/action-setup@v2
        with:
          version: 7
      - uses: actions/setup-node@v3
        with:
          node-version: 16
          cache: pnpm
      - run: pnpm install
      - name: Build
        run: pnpm run docs:build
      - uses: actions/configure-pages@v2
      - uses: actions/upload-pages-artifact@v1
        with:
          path: docs/.vitepress/dist
      - name: Deploy
        id: deployment
        uses: actions/deploy-pages@v1
```
GitHub Actions的环境中提供了很多预置的配置和工具，例如Node.js，pnpm等等，我们直接使用即可。如果你的配置和文中上述流程一致，那么直接复制该文件内容到你的工程即可。之后上传到工程代码GitHub仓库中。如果想了解更多，可以参考[GitHub Actions文档](https://docs.github.com/zh/actions)以及其他人的配置。

然后打开GitHub配置，位置依旧在`Settings -> Pages -> Build and deployment -> Source`。将之前设置的`Deploy from a branch`，修改为`GitHub Actions`。
![](/2023/blog-2.png)

这时候我们每次写完博客，将工程代码push到GitHub仓库之后，GitHub会自动触发构建和发布流程，更新博客网站。上一节中的手动[构建和上传dist](#构建和上传dist)步骤就不需要执行了。

截止到这里，我们的博客就完成啦。

## 在GitHub用户首页展示个人简介
查看很多用户的GitHub首页时，都会发现首页会有一个区域可以展示用户自定义的内容，一般都是用户的个人简介。例如我的：
![](/2023/blog-3.png)
 
制作这样一个简介也很简单，下面就描述一下方法。

1. 首先创建一个GitHub仓库，仓库名称必须和用户名相同。这时候GitHub就会提示你，这是一个特殊的仓库，会作为你的个人简介使用。记得勾上创建`README.md`。
2. 然后在`README.md`中使用MarkDown语法写入个人简介，并提交。

然后返回GitHub用户首页，就可以看到你的个人简介啦。

3. 如果希望生成靠右的代码提交统计，可以加入如下代码：
```html
<img align="right" src="https://github-readme-stats.vercel.app/api?username=jzplp&show_icons=true&icon_color=CE1D2D&text_color=718096&bg_color=ffffff&hide_title=true" />
```
注意其中的jzplp要改成你自己的用户名。

## 参考
- GitLab持续集成部署CI/CD初探：如何自动构建和发布个人前端博客  
  https://jzplp.github.io/2022/gitlab-cicd
- VitePress文档  
  https://vitepress.dev/
- GitHub Actions文档  
  https://docs.github.com/zh/actions
- 漂流瓶jz的个人博客  
  https://jzplp.github.io/


<script setup>
import latexDisplay from '../../components/latexDisplay.vue'
</script>
