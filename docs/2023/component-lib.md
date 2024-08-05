# 如何二次封装一个Vue3组件库？

## 为什么要二次封装组件库
目前开源的Vue3组件库有很多，包括Element Plus、Ant Design Vue、Naive UI、Vuetify、Varlet等等。

在大部分场景中，我们直接使用现有组件库中的组件即可实现功能。如果遇到部分组件的特殊配置或者特殊逻辑，或者当前的组件库不满足需求，需要部分组件组合成为一个更大的组件，例如IP输入框、带固定样式的对话框等等，甚至我们有一些和组件库无关的自定义组件。如果这些组件在工程中有多处复用，我们一般都会将组件单独写到工程的Components中，方便各个页面调用。

假设这时候有多个独立的工程，这些工程都需要复用我们之前在Components中写的自定义组件。这时候，我们可以选择在每个工程都复制一份代码使用，但是这样做不方便维护。如果我们发现组件有一些BUG，我们需要在一个工程中修复，然后复制同步给其它工程。这样维护低效而且容易遗漏。而且如果其它工程的开发者修改了组件（也许有需求但是并未通知我们），那么我们同步复制代码之后，就会把其它开发者的代码覆盖掉。

这时候，更好的方式是将这些在不同的工程中复用的组件抽出来，封装为一个独立的组件库。这样我们的可复用组件代码在一个地方修改和维护。同时也有文档和版本控制等功能，方便其它工程集成。

甚至有时候可以做一个扩展组件库，扩展现有的组件库的能力，给大家提供更多的通用组件。

## 依赖说明
### 依赖种类
开发npm包与开发前端页面工程不同，对于依赖有着更精细的控制：
- 开发前端页面工程：安装到`dependencies`和`devDependencies`无区别。因为工程都要经过构建成dist成果物，本身是不需要依赖安装的。因此前端需要安装依赖的只有开发模式。
- 开发npm包：开发模式，生产模式有区别，依赖还区分作为自身依赖还是宿主依赖。

注：上述描述是针对大部分工程，如果项目中配置了特殊模式，依赖安装方式也有区别。

这里简述一下`package.json`中我们会使用的依赖种类：

#### **`dependencies`生产依赖**
这类依赖在开发环境，生产环境都会被安装。在npm包被集成到宿主工程时，会作为npm包本身的依赖被安装。
```sh
npm add vue
```

#### **`devDependencies`开发依赖**
只在开发环境被安装的依赖，生产环境不安装。在npm包被集成到宿主工程时，也不会被安装。
```sh
pnpm add -D vue
```

#### **`peerDependencies`对等依赖**
我觉得也可以叫做“宿主依赖”。这类依赖在开发环境会被安装，但生产构建时不会打包进成果物中。在npm包被集成到宿主工程时，也不会被安装（npm部分版本会自动安装）。但是会提示要求宿主工程本身安装这个依赖。
```sh
pnpm add --save-peer vue
```

### 如何选择依赖种类

#### 以vue为例
既然是要作Vue3的库，肯定需要安装vue这个依赖了。那么我们应该怎么选择依赖种类呢？

- `devDependencies` 排除\
  生产模式下，我们的组件库也是需要vue作为依赖的。（或许不用也行，但是目前不选择那种方式）
- `dependencies` 可以但不建议\
  生产模式和开发模式下都会安装，可以保证我们的组件库一直都能引用到。
- `peerDependencies` 推荐\
  生产模式下会安装，开发模式下被安装到宿主工程中，与宿主工程共享同一个vue依赖。

如果选择`dependencies`，那么我们的组件库本身会安装一个vue依赖，宿主工程也会安装一个vue依赖，实际上安装了两个vue。这明显会浪费开发者的磁盘空间，而且降低了依赖安装的效率。(现在大部分包管理器都能处理这种情况，不会实际安装两个，但是这种设计显然不好)因此我们选择`peerDependencies`。

#### 以`@vueuse/core`为例

那么，是不是宿主工程可能有的依赖，我们就一定要选择`peerDependencies`呢？并不是。比如`@vueuse/core`，这是一个基于vue的前端使用工具集合。我们在组件库中，仅需要使用其中的几个工具。例如`useResizeObserver`。这个依赖宿主工程可能会用，也可能用不到。

- `peerDependencies` 排除\
我们需要将其设定为`peerDependencies`，强制要求开发者必须安装么？当然不行。\
为什么不行？因为这样会影响开发者使用。试着想开发者装了一个包，会提示开发者再手动安装几个依赖包。装完这些依赖包之后又会提示开发者装一堆依赖。虽然这些依赖可能是必要的，但是都手动让开发者装也太不方便了。
- `dependencies` 可以\
生产模式和开发模式下都会安装，且在宿主工程中时，会作为依赖本身的包进行安装。
- `devDependencies` 可以\
仅仅开发模式安装也可以？？？ 是的，但是需要加入构建流程。通过构建使依赖中的代码打入我们的成果物中，就不再需要生产依赖了。

#### 以Vite为例
Vite是一个前端构建工具，大部分Vue3页面工程就是用它打包的。同样的我们的组件库也会使用Vite打包。构建工具仅仅在开发和构建时需要安装，构建之后作为npm包引入时就不需要了。因此Vite适合作为`devDependencies`依赖安装。

## 封装简单组件
我们先从最简单开始，实现一个不需要构建流程，也不需要引入组件库的简单组件。

### 初始化工程
首先创建工程：
```sh
# 初始化项目
pnpm init
# 安装依赖
pnpm add --save-peer vue
```
创建必要的目录结构。我这里以一个简单的表示状态的圆圈组件功能为例。
```
|-- .gitignore
|-- package.json
|-- pnpm-lock.yaml
|-- src
    |-- index.js
    |-- components
        |-- StatusCircle.vue
```

### 组件实现
首先是`src/components/StatusCircle.vue`的实现。我们先不使用TypeScript。通过代码可以看到，这就和正常写单文件组件一样。
```vue
<script setup>
defineProps({
  type: {
    // 类型 实际控制颜色
    // 'default' | 'error' | 'warning' | 'success' | 'info'
    type: String,
    default: 'default'
  },
  size: {
    // 圆圈的大小
    type: Number,
    default: 10
  }
})
</script>

<template>
  <span class="circle" :class="[type]" :style="{ width: `${size}px`, height: `${size}px` }" />
</template>

<style scoped>
.circle {
  display: inline-block;
  margin-right: 8px;
  border-radius: 50%;
}
.default {
  background-color: #363636;
}
.error {
  background-color: #d03050;
}
.warning {
  background-color: #f0a020;
}
.success {
  background-color: #18a058;
}
.info {
  background-color: #2080f0;
}
</style>
```
再写下`src/index.js`。
```js
export { default as StatusCircle } from './components/StatusCircle.vue'
```
如果还有其它给用户使用的辅助函数，其它单文件组件等等也可以在这里导出。

### package.json配置(1)
- 配置程序入口，module为ESModule引入方式的程序入口文件：
```json
"module": "src/index.js"
```
- 需要配置给用户使用的npm包中包含哪些文件，只有配置过的文件才会出现在发布包中。目前我们只有一个src文件夹。
```json
"files": [ "src" ]
```
然后再修改下部分必要的配置，例如包名称和版本号。
```json
"name": "sec-test",
"version": "1.0.0",
```

然后就可以直接发布npm包了：
```sh
pnpm publish --no-git-checks
```

### 工程中尝试引入
发布之后，我们就可以在Vue3页面工程中尝试引用了。
```sh
# 安装依赖
pnpm add -D sec-test
```
```vue
<script setup>
import { StatusCircle } from 'sec-test'
</script>

<template>
  <div>
    <StatusCircle type="warning" />
    <StatusCircle type="success" />
  </div>
</template>
```
此时页面工程中，就成功集成了我们自己的组件库了。

## 引入组件库
我们的文章标题叫做“二次封装组件库”，那么需要引入一个“一次封装”的组件库作为组件来源。这里使用Naive UI组件库作为示例。

### 选择依赖种类
“一次封装”的组件库应该作为哪种依赖呢？首先要明确使用场景。二次封装的组件库，一般都作为“一次封装”的主要组件库的补充，即可以理解为，使用二次封装组件库的开发者，在项目中都会引入主要组件库。

而且组件库包的体积一般都比较大。因此可以将“一次封装”的组件库作为`peerDependencies`引入。

```sh
pnpm add --save-peer naive-ui
```

### 目录结构(1)
我们保留上一节的代码为基础。再用一个很简单的，需要二次封装的场景来举例————带提示的按钮组件，由NButton, NPopover组合而成，为按钮添加悬浮提示文本。

```
|-- .gitignore
|-- package.json
|-- pnpm-lock.yaml
|-- src
    |-- index.js
    |-- components
        |-- StatusCircle.vue
        |-- TipButton.vue
```

### TipButton组件源码
```vue
<script setup>
import { NPopover, NButton } from 'naive-ui'
import { computed, useSlots } from 'vue'

defineOptions({ inheritAttrs: false })

const props = defineProps({
  // popover 的触发方式
  tipTrigger: {
    type: String,
    default: 'hover',
  },
  // popover 的弹出位置
  tipPlacement: {
    type: String,
    default: 'top',
  },
  // popover 内容
  tip: {
    type: String,
    default: '',
  },
  // 是否禁用 popover
  tipDisabled: {
    type: Boolean,
    default: false,
  },
  // --- 剩余属性继承 HButton
})
const slots = useSlots()

const tipDisabledComp = computed(() => {
  // 手动设置 禁用时肯定禁用
  if (props.tipDisabled) return props.tipDisabled
  // slot有值不禁用
  if (slots.tip) return false
  // props有值不禁用
  if (props.tip) return false
  // 无值的时候禁用
  return true
})
</script>

<template>
  <NPopover :trigger="tipTrigger" :placement="tipPlacement" :disabled="tipDisabledComp">
    <template #trigger>
      <NButton tag="div" v-bind="$attrs">
        <template v-for="(item, key, index) in $slots" :key="index" #[key]>
          <slot v-if="key !== 'tip'" :name="key" />
        </template>
      </NButton>
    </template>
    <slot name="tip">
      <template v-if="tip">
        {{ tip }}
      </template>
    </slot>
  </NPopover>
</template>
```

在index.js中导出：
```js
export { default as StatusCircle } from './components/StatusCircle.vue'
export { default as TipButton } from './components/TipButton.vue'
```

然后把版本号增加一下，直接发布版本即可。

### TipButton使用方式
我们把“一次封装”组件库中的NButton和NPopover组合而成了TipButton，给按钮提供了悬浮提示的扩展能力，而且不影响按钮原本的已有能力，即按钮本身的Props、事件、Slots都能正常使用。

```vue
<template>
  <!-- 多语言使用 -->
  <TipButton style="margin-right: 8px" :tip-disabled="true" type="primary" @click="addProject">
    <template #icon>
      <NIcon><AddOutline /></NIcon>
    </template>
    <template #tip>创建项目</template>
    新增
  </TipButton>
  <TipButton secondary tip="删除项目" :disabled="!keySelection.length" @click="deleteProject(keySelection)">
    <template #icon>
      <n-icon><TrashBinOutline /></n-icon>
    </template>
    删除
  </TipButton>
</template>

<script setup>
import { TipButton } from 'sec-test'
</script>
```

可以看到在大部分场景下，我们只需要将之前写的NButton标签改名为TipButton，不用修改其它代码。再增加tip相关属性即可。

在tip属性方面，同时提供了prop形式和slot形式。Props形式适用于简单的一句话形式的悬浮提示，slot形式适用于更复杂的自定义提示内容。同时针对NPopover在提示内容为空时，依然展示空的悬浮提示的情况，我们根据prop和slot是否存在内容判断是否展示悬浮提示，如果都不存在则禁用。

有人会说，哪里的按钮需要提示就自己加NPopover就好了，这样封装多此一举。是的，如果只有一个地方的按钮需要用到悬浮提示，这样做确实多余。但是假设如果你有10-20个位置需要这种悬浮提示按钮，而且多个工程都需要，这样的封装就有意义了。这种封装简化了代码结构，并未增加多少心智负担。我们列出了最简单的使用情况，经过封装确实简洁很多。

```html
<!-- 使用封装 -->
<TipButton tip="创建项目">新增</TipButton>
<!-- 未封装 -->
<NPopover>
  <template #trigger>
    <NButton>新增</NButton>
  </template>
  <span>创建项目</span>
</NPopover>
```

## 透传能力
像上面这样，在原有组件库的基础上进行封装和扩展的情况还有很多。在扩展能力的同时，也需要注意依然提供原有的组件库能力。通过上面的例子，我们来整理一下如何提供能力。

### 透传Props
关于这部分我们可以参考Vue3文档中的[透传 Attributes](https://cn.vuejs.org/guide/components/attrs.html)。这分为两种情况：

1. 希望透传Props的组件正好是二次封装组件的根元素上，那么可以直接利用Vue的透传attribute特性，透传到原有组件的Props上。

```html
<!-- 封装后使用 -->
<SecButton type="primary" />

<!-- 二次封装组件 -->
<template>
  <NButton />
</template>

<!-- 实际透传后效果 -->
<NButton type="primary" />
```

2. 希望透传Props的组件并不是二次封装组件的根元素。这样需要禁用Attributes继承，然后手动指定继承位置。例如上面的TipButton就是这样。简化一下：

```vue
<!-- 二次封装组件 -->
<template>
  <NPopover>
    <template #trigger>
      <!-- 指定透传元素 -->
      <NButton v-bind="$attrs" />
    </template>
  </NPopover>
</template>

<script setup>
// 禁用Attributes继承
defineOptions({ inheritAttrs: false })
</script>
```
可以看到，手动指定了继承位置，因此我们的attributes会透传给NButton，作为Props接收。

```html
<!-- 封装后使用 -->
<TipButton type="primary" />

<!-- 实际透传后效果 -->
<NPopover>
  <template #trigger>
    <NButton type="primary" />
  </template>
</NPopover>
```

如果不禁止根元素Attributes继承，但同时指定了NButton继承，那么根元素（NPopover）和NButton会同时继承attributes。在大部分场景下，这是冲突的。看一个例子：

```html
<!-- 不禁止根元素Attributes继承的示例 -->
<!-- 封装后使用 -->
<TipButton class="button-class" :disabled="true" />

<!-- 实际透传后效果 -->
<NPopover class="button-class" :disabled="true" >
  <template #trigger>
    <NButton class="button-class" :disabled="true" />
  </template>
</NPopover>
```

可以看到，class同时被绑定到了NPopover和NButton上。更严重的是，由于NPopover和NButton的禁用prop都是disabled，希望禁用NButton的时候，也会同时禁用NPopover。因此解决方案是禁止根元素Attributes继承，然后为NPopover的disabled重新起一个名字传递。

### 透传事件
透传事件和透传Props的规则是一致的，都使用Attributes继承的规则，这里不重复描述了。但是事件和class、style类似，都有合并的规则。即自身定义了事件处理器，又透传了事件处理器，可以同时生效。

```html
<!-- 封装后使用 -->
<SecButton @click="click1" />

<!-- 二次封装组件 -->
<template>
  <NButton @click="click2" />
</template>
```

可以看到在二次封装时，在NButton上定义了click事件处理器。我们透传的attributes又提供了一个click事件处理器。这两个并不会覆盖，而是会同时生效。对于手动继承Attributes的场景也一样，也会同时生效。

```html
<!-- 封装后使用 -->
<TipButton @click="click1" />

<!-- 二次封装组件 -->
<template>
  <NPopover>
    <template #trigger>
      <!-- 指定透传元素 -->
      <NButton v-bind="$attrs" @click="click2" />
    </template>
  </NPopover>
</template>
```

### 透传插槽Slots
对于插槽，Vue提供了$slots表示父组件所传入插槽的对象。我们遍历这个对象，用对象key来匹配原组件的slot，然后在内部抛出二次封装组件库的slot。（有点绕口，来看下例子）

```html
<!-- 封装后使用 -->
<SecButton>
  <template #icon>
    <AddOutline />
  </template>
  <span>创建项目</span>
<SecButton>

<!-- 二次封装组件 -->
<NButton>
  <template v-for="(item, key, index) in $slots" :key="index" #[key]>
    <slot :name="key" />
  </template>
</NButton>

<!-- 实际透传后效果 -->
<NButton>
  <template #icon>
    <AddOutline />
  </template>
  <template #default>
    <span>创建项目</span>
  </template>
</NButton>
```

使用v-for遍历$slots，key是插槽的key。`<template>`那一层表示的是匹配NButton的slot，即`<template>`内部的内容就是被嵌入进NButton内部的插槽中。下一层的slot，是我们二次封装的组件抛出给外部的插槽。因此，外部实际传入的插槽内容就被展示到slot处，而slot被`<template>`包裹，实际上被嵌入进NButton内部的插槽中。

### 透传实例方法
在Vue3的组合式写法中，我们使用defineExpose暴露属性和方法。然后使用ref访问。那么在二次封装的组件中，如果想要透传抛出给外部呢？

很遗憾，我没有在Vue3中找到类似`$slots,$attrs`这种可以获取到组件暴露的全部属性和方法的对象。因此只能手动一个一个转发了。

```vue
<script setup>
const popoverRef = ref(null)
// 手动转发
defineExpose({
  tipSetShow: (show) => popoverRef.value?.setShow(show),
  tipSyncPosition: () => popoverRef.value?.syncPosition(),
})
</script>
<template>
  <NPopover ref="popoverRef" />
</template>
```

## 加入构建流程

### 使用构建的理由
既然不通过构建就能开发npm包，为何要进行构建呢？

1. 例如上面提到的`@vueuse/core`，将部分依赖直接集成到构建包中，减少生产时的依赖项。利用Treeshaking，只把依赖中用到的代码打进构建包中。
2. 经过构建和压缩，可以减少代码体积，提高下载速度。
3. 如果是非开源的代码库，可以隐藏源码。虽然即使经过打包和压缩依然是js代码，还是可以分析出来。但是至少分析的难度提高了一点。
4. 通过构建时的polyfill等配置，可以提高代码在浏览器中运行的兼容性。
5. 将typescript代码翻译为js代码，使开发者不需要ts也能正常使用。

### 目录结构(2)
我们依然使用之前的代码，在此基础上加入构建模式。这是加入构建流程后的目录结构。

```
|-- .gitignore
|-- package.json
|-- pnpm-lock.yaml
|-- vite.config.js
|-- dist
|   |-- index.mjs
|   |-- style.css
|-- src
    |-- index.js
    |-- components
        |-- StatusCircle.vue
        |-- TipButton.vue
```

### Vite构建配置
我们使用vite作为构建工具。所有构建工具基本都是`devDependencies`。安装必要的依赖：
```sh
pnpm add -D vite @vitejs/plugin-vue
# CSS预处理器，用于扩展CSS的功能，可以安装其它工具，也可以不装
pnpm add -D sass
```

创建根目录创建vite.config.js。
```js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  build: {
    // 库模式配置
    lib: {
      // 入口文件
      entry: './src/index.js',
      // ESModule模式 
      formats: ['es'],
      // 输出的文件名
      fileName: 'index'
    },
    rollupOptions: {
      // 外部化处理那些你不想打包进库的依赖
      external: ['vue', 'naive-ui'],
      output: {
        // 为外部化的依赖提供一个全局变量
        globals: {
          vue: 'Vue'
        }
      }
    }
  },
  // 构建插件
  plugins: [vue()]
})
```

在Vite中有一种库模式，是专门为了开发库工具的构建模式：[Vite文档-库模式](https://cn.vitejs.dev/guide/build.html#library-mode)

库模式不使用HTML作为入口，而是用一个js/ts文件做入口。我们还要配置模式（提供给浏览器的一般是es模式）以及一些其他配置。在`peerDependencies`中的那些不构建的依赖则需要在rollupOptions中声明。上面的配置中都写了对应的注释。

### package.json配置(2)
配置好Vite之后，还要修改下项目package.json。首先增加执行构建的脚本：
```json
"scripts": {
  "build": "vite build"
},
```

然后就可以尝试进行构建了。执行脚本：
```sh
pnpm build
```
可以看到新增了dist文件夹，里面有构建后的代码逻辑和导出的css。这个dist文件夹属于成果物，并不属于代码，因此在`.gitignore`中要排除这个目录。

既然有了构建流程，那么我们提供给开发者集成的就是构建后的dist文件夹而不是src，因此还要继续修改导出配置。
```json
"module": "dist/index.mjs",
"files": [ "dist" ],
```
这样发布包中就不包含src源码了。然后把版本号增加一下，直接发布版本即可。

注意，开发者在集成我们的npm包时，需要单独引入css，整个项目中引入一次即可。
```js
import 'sec-test/dist/style.css'
```

## 支持TypeScript
很多人开发前端工程都喜欢使用TypeScript，它可以提供类型检查，提高代码的规范性和可维护性。虽然网络上对于TypeScript有些争议，但是既然有大量的开发者使用TS，那也应该提供对应的支持。

### 目录结构(3)
我们依然使用之前的代码，在此基础上增加对TypeScript的支持。这是完成后的目录结构。
```
|-- .gitignore
|-- package.json
|-- pnpm-lock.yaml
|-- tsconfig.json
|-- tsconfig.tsbuildinfo
|-- vite.config.ts
|-- dist
|   |-- index.mjs
|   |-- style.css
|-- dts
|   |-- tsconfig.tsbuildinfo
|   |-- src
|       |-- index.d.ts
|       |-- components
|           |-- StatusCircle.vue.d.ts
|           |-- TipButton.vue.d.ts
|-- src
    |-- index.ts
    |-- components
        |-- StatusCircle.vue
        |-- TipButton.vue
```

### 配置TypeScript
首先安装typescript依赖。TypeScript相关的依赖也只是开发模式下使用。还有安装一下vue相关的ts配置文件扩展。
```sh
pnpm add -D typescript
pnpm add -D @vue/tsconfig
```

然后在根目录下创建`tsconfig.json`，写入相关配置。这里直接使用了`@vue/tsconfig`提供的配置预设。
```json
{
  "extends": "@vue/tsconfig/tsconfig.dom.json",
  "include": ["src/**/*", "src/**/*.vue"],
  "outDir": "dts",
  "compilerOptions": {
    "composite": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```
其中的outDir是类型文件的输出位置，下面会用到。


### 使用TypeScript改写代码

首先是`TipButton.vue`。
```vue
<script lang="ts" setup>
import { NPopover, NButton } from 'naive-ui'
import { computed, useSlots } from 'vue'

defineOptions({ inheritAttrs: false })

interface Props {
  // popover 的触发方式
  tipTrigger?: 'hover' | 'click' | 'focus' | 'manual'
  // popover 的弹出位置
  tipPlacement?: 'top-start' | 'top' | 'top-end' | 'right-start' | 'right' | 'right-end' | 'bottom-start' | 'bottom' | 'bottom-end' | 'left-start' | 'left' | 'left-end'
  // popover 内容
  tip?: string
  // 是否禁用 popover
  tipDisabled?: boolean
  // --- 剩余属性继承 HButton
}

const props = withDefaults(defineProps<Props>(), {
  tipTrigger: 'hover',
  tipPlacement: 'top',
  tip: '',
  tipDisabled: false,
})
const slots = useSlots()

const tipDisabledComp = computed(() => {
  // 手动设置 禁用时肯定禁用
  if (props.tipDisabled) return props.tipDisabled
  // slot有值不禁用
  if (slots.tip) return false
  // props有值不禁用
  if (props.tip) return false
  // 无值的时候禁用
  return true
})
</script>

<template>
  <NPopover :trigger="tipTrigger" :placement="tipPlacement" :disabled="tipDisabledComp">
    <template #trigger>
      <NButton tag="div" v-bind="$attrs">
        <template v-for="(item, key, index) in $slots" :key="index" #[key]>
          <slot v-if="key !== 'tip'" :name="key" />
        </template>
      </NButton>
    </template>
    <slot name="tip">
      <template v-if="tip">
        {{ tip }}
      </template>
    </slot>
  </NPopover>
</template>
```

然后是`StatusCircle.vue`。
```vue
<script lang="ts" setup>
interface Props {
  // 类型 实际控制颜色
  type?: "default" | "error" | "warning" | "success" | "info";
  // 圆圈的大小
  size?: number;
}
withDefaults(defineProps<Props>(), {
  type: "default",
  size: 10,
});
</script>

<template>
  <span class="circle" :class="[type]" :style="{ width: `${size}px`, height: `${size}px` }" />
</template>

<style scoped>
.circle {
  display: inline-block;
  margin-right: 8px;
  border-radius: 50%;
}
.default {
  background-color: #363636;
}
.error {
  background-color: #d03050;
}
.warning {
  background-color: #f0a020;
}
.success {
  background-color: #18a058;
}
.info {
  background-color: #2080f0;
}
</style>
```
目前工程中的其它部分文件可以直接改个文件后缀名，将js改成ts即可。这个可以参考目录结构中的名字。另外在`vite.config.ts`中把入口文件名改掉：
```js
entry: './src/index.ts',
```

### 生成类型文件
虽然把文件改写成了ts的形式，但是提供给用户的依然是js文件，文件本身是不带类型的。因为我们的工程也要适配那些不使用ts的开发者。我们以单独类型文件的形式提供。所以构建流程和入口文件不变，但是多了一步生成类型文件的步骤。

继续安装生成类型文件的依赖，使用vue提供的vue-tsc。
```sh
pnpm add -D vue-tsc
```

然后修改package.json，加入生成类型文件的相关脚本，构建的时候也一起生成类型。
```json
"scripts": {
  "build": "vite build && pnpm build:dts",
  "build:dts": "vue-tsc --declaration --emitDeclarationOnly"
}
```
然后尝试生成类型：
```sh
pnpm build:dts
```

然后会发现，在dts文件夹（上面配置的目录）中生成了一些类型文件。其中的dts/src/index.d.ts是对应的类型入口文件。

### package.json最后配置
package.json中有专门提供ts类型文件的位置，配置为类型入口文件：
```json
"types": "dts/src/index.d.ts",
"files": [ "dist", "dts/src" ]
```
现在的发布包中不仅要包含构建后的代码，还要包含类型文件。上面脚本配置构建时，也同时生成了类型文件。因此我们把版本号增加一下，直接进行构建，发布版本即可。

提供一下package.json最后的配置。

```json
{
  "name": "sec-test",
  "version": "1.0.0",
  "description": "",
  "module": "dist/index.mjs",
  "types": "dts/src/index.d.ts",
  "scripts": {
    "build": "vite build && pnpm build:dts",
    "build:dts": "vue-tsc --declaration --emitDeclarationOnly"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "peerDependencies": {
    "naive-ui": "^2.35.0",
    "vue": "^3.3.4"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^4.4.0",
    "@vue/tsconfig": "^0.4.0",
    "typescript": "^5.2.2",
    "vite": "^4.5.0",
    "vue-tsc": "^1.8.22"
  },
  "files": [ "dist", "dts/src" ]
}
```

## 总结
上面提到的，仅仅是在封装vue组件库时一些基础的工程化方法。了解这些就可以开发基础的二次封装组件库了。

但实际上不管是组件库还是前端工程化都是一个比较复杂的主题。对于组件库封装，要考虑如何设计组件，还有交互样式、抛出的API、版本兼容、换肤、换不同国家和地区的差异等等。对于工程化，要考虑依赖关系、工程组织、体积优化、按需引入、TreeShaking等等。真正成熟的组件库要复杂的多。

## 参考
- Element Plus 基于Vue3，面向设计师和开发者的组件库\
[https://element-plus.org/zh-CN/](https://element-plus.org/zh-CN/)
- Ant Design Vue\
[https://www.antdv.com/components/overview-cn](https://www.antdv.com/components/overview-cn)
- Naive UI 一个 Vue 3 组件库\
[https://www.naiveui.com/zh-CN/os-theme](https://www.naiveui.com/zh-CN/os-theme)
- Vuetify 一个功能强大的 Vue 组件框架\
[https://vuetifyjs.com/zh-Hans/](https://vuetifyjs.com/zh-Hans/)
- Varlet 基于 Vue3 开发的 Material 风格移动端组件库\
[https://varlet.gitee.io/varlet-ui/#/zh-CN/index](https://varlet.gitee.io/varlet-ui/#/zh-CN/index)
- 探索Vue 3世界中的12个流行组件库\
[https://juejin.cn/post/7250091744526647352](https://juejin.cn/post/7250091744526647352)
- pnpm 文档\
[https://www.pnpm.cn/cli/add](https://www.pnpm.cn/cli/add)
- VueUse Collection of Vue Composition Utilities 文档\
[https://vueuse.org/](https://vueuse.org/)
- Vue文档 透传 Attributes\
[https://cn.vuejs.org/guide/components/attrs.html](https://cn.vuejs.org/guide/components/attrs.html)
- Vite文档 构建生产版本 库模式\
[https://cn.vitejs.dev/guide/build.html#library-mode](https://cn.vitejs.dev/guide/build.html#library-mode)
- Vite文档 构建选项 build-lib\
[https://cn.vitejs.dev/config/build-options.html#build-lib](https://cn.vitejs.dev/config/build-options.html#build-lib)
- 前端工程化学习笔记\
[https://static.kancloud.cn/cyyspring/webpack/3064323](https://static.kancloud.cn/cyyspring/webpack/3064323)
