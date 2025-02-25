# web前端自动生成动态面包屑导航的方法，以vue为例

## 面包屑简介

面包屑（Breadcrumb）是网页中一个常见的模块，用于显示用户在网站中当前的所处的位置，并且可以向上导航。常见的前端组件库都会包含这个组件，例如：  
- [Element UI Breadcrumb 面包屑](https://element.eleme.cn/#/zh-CN/component/breadcrumb)  
- [Ant Design Vue Breadcrumb 面包屑](https://www.antdv.com/components/breadcrumb-cn)

面包屑的代码：  

```html
<el-breadcrumb separator="/">
  <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
  <el-breadcrumb-item :to="{ path: '/' }">活动管理</el-breadcrumb-item>
  <el-breadcrumb-item :to="{ path: '/' }">活动列表</el-breadcrumb-item>
  <el-breadcrumb-item :to="{ path: '/' }">活动详情</el-breadcrumb-item>
</el-breadcrumb>
```

这种一项一项手写面包屑的方法带来了很多重复性工作，比如每个页面中都需要写一遍“首页”的面包屑，所有“活动管理”下的所有页面，也都需要写一遍“活动管理”。这时如果路由需要调整，那么所有页面的面包屑都要进行修改，非常繁琐。因此如果可以自动生成面包屑，就能够减轻很多重复性工作，也方便代码维护。

下面代码部分均使用Vue3 + TypeScript + Ant Design Vue + Vue Router实现，但是方法思路可以适用于其他框架和组件库。

## 方法1 嵌套路由
我们首先想到使用嵌套路由解决这个问题。嵌套路由本身就是带有层级的，天然适合自动生嵌套路由。Vue Router中对嵌套路由有[文档说明](https://router.vuejs.org/zh/guide/essentials/nested-routes.html)。

### 方法描述
1. 按照Vue Router规范设置多级路由表，meta标签中放置面包屑名称。
2. 面包屑实现代码中使用route.matched获取多级路由，直接显示即可。

### 优点和缺点
#### 优点 
1. 实现最简单，最方便。
2. 能够适应多种情形，无论是刷新页面还是直接访问子页面URL，都能保证面包屑的一致性。
3. 能够保存路由参数，query和定义在路由中的params都可以保存下来，上级跳转功能的体验较好。

#### 缺点 
1. 要求存在可以手写的路由表，使用自动生成路由的工程难以使用。例如vite-plugin-pages插件使用文件目录自动生成路由表，虽然可以自动生成嵌套路由，但是不方便设置meta。
2. 要求路由必须是清晰的树形结构，必须使用多级路由表。如果不路由结构不方便设置为树形，或者是网状结构，则不能使用此方法。

嵌套路由的这个方法基本是自动生成路由的首选方法，可以较好的实现功能。但是我使用了vite-plugin-pages插件，因此还是要寻求其他方法。  

## 方法2 缓存和计算新面包屑
使用LocalStorage存储已有的面包屑，跳转到新的页面后，对原有面包屑进行计算，展示修改后新的面包屑。

### 方法描述
1. 进入首页时，生成初始面包屑列表。
2. 当前面包屑列表和当前页面path缓存到LocalStorage中。
3. 跳转到其他页面前，缓存到新页面时的面包屑处理方式，既现有面包屑的删除数量。
4. 跳转到新页面后，计算新面包屑：  
  判断新页面path和缓存path是否一致，如果一致则认为是刷新页面，直接使用缓存面包屑。  
  如果不一致则说明是跳转，根据缓存和处理方式生成新的面包屑，显示并重新缓存。

### LocalStorage缓存结构
![图片](/2022/vue-breadcrumb-1.png)

breadcrumb中存放的是面包屑列表的缓存，routerPush中是跳转使用的处理方式，其中formPath指当前页面path，step指新页面删除面包屑的数量，0代表不删除，-1代表删除一项，-2代表删除两项。删除一般表示面包屑向上导航。

```typescript
// 文件路径 @/utils/breadcrumb.ts

import { getStorage, setStorage } from '@/utils/localStor'
const ModuleName = 'breadcrumb'

// 获取面包屑
export function getBreadcrumb(): Array<ANTD.Route> {
  const rou = getStorage(ModuleName) || {}
  return rou.breadcrumb || []
}

// 保存面包屑
export function setBreadcrumb(arr: Array<ANTD.Route>) {
  setStorage(ModuleName, { breadcrumb: arr })
}

// 保存当前路由跳转项
export function setRouterPush(path: string, step: number) {
  setStorage(ModuleName, {
    routerPush: {
      formPath: path,
      step,
    },
  })
}

// 获取路由跳转项
export function getRouterPush(): any {
  const rou = getStorage(ModuleName) || {}
  return rou.routerPush || {}
}

// 处理面包屑 step小于等于0
export function handleBreadcrumb(step: number): Array<ANTD.Route> {
  let arr: Array<ANTD.Route> = getBreadcrumb()
  if (!arr.length || !step) {
    return arr
  } else if (arr.length <= -step) {
    arr = []
  } else {
    arr.length = arr.length + step
  }
  return arr
}
```

`@/utils/localStor`是通用的处理LocalStorage方法，为了方便参考这里也列出：  
```typescript
// 文件路径 @/utils/localStor.ts

// localStorage的存取 只适用于整个对象的存储
export function getStorage(type: string) {
  return JSON.parse(localStorage.getItem(type) || '{}')
}

export function setStorage(type: string, data: any) {
  const oldData = getStorage(type)
  localStorage.setItem(type, JSON.stringify(Object.assign({}, oldData, data)))
}
```

### 简单包装路由
每次路由跳转之前，都需要增加一个缓存面包屑处理方式的步骤，需要传step到缓存中。  
#### 路由传参的局限性
首先我想到使用全局的前置路由守卫beforeEach，在跳转前统一缓存。[路由守卫文档参考](https://router.vuejs.org/zh/guide/essentials/dynamic-matching.html)。但是step要如何传给路由守卫？  
- 肯定不能放置在URL中，这样1是URL太难看影响观感，2是刷新时也会携带step，可能会造成刷新的误判和错误处理面包屑。
- 使用params，且不使用路径参数可以做到。但使用了vite-plugin-pages自动生成路由表，路由跳转时使用path更直观，这时候params就失效了。
- meta，prop等等也都试了，都无法实现不借助query/params实现动态传参。

如果项目方便统一使用name跳转路由，那么params是最好的传参处理方式，直接在路由守卫中统一进行缓存处理即可，基本不会影响原有的界面的代码。  
但是我这边无法使用params，因此我在原有的路由上简单包装了一层，用来实现自己的功能。

#### 包装路由
```typescript
// 文件路径 @/hooks/common/routerPlus.ts

import { useRouter, useRoute } from 'vue-router'
import { setRouterPush } from '@/utils/breadcrumb'

// 为了给路由传参，包装一层
export default function useRouterPlus() {
  const router = useRouter()
  const route = useRoute()

  function routerPush(rou: any, config: any) {
    const curPath = route.fullPath
    if (rou.path === curPath) {
      // 路由相同，不处理不跳转
      return
    }
    // 保存跳转信息
    setRouterPush(curPath, config.step || 0)
    router.push(rou)
  }

  return {
    router,
    route,
    routerPush,
  }
}
```
经过包装后，路由跳转使用`routerPush`，而不是原有的`router.push`，参考示例如下：  
```typescript
<script setup lang="ts">
import useRouterPlus from '@/hooks/common/routerPlus'
const { routerPush } = useRouterPlus()
function editA(record: AMOD.Item) {
  routerPush(
    {
      path: '/editA',
      query: { id: record.id, },
    },
    { step: 0 },
  )
}
function returnList() {
  routerPush(
    { path: '/listA', },
    { step: -2 },
  )
}
</script>
```
这样就可以实现路由跳转前的通用处理步骤。不过这样需要改变每一个页面中的跳转方法，不是太优雅。

### 处理面包屑
这里直接放出页头components的代码。
```html
<template>
  <a-page-header
    class="page-header"
    :title="pageInfo.name"
    :backIcon="pageInfo.showBack ? null : false"
    @back="backClick"
  >
    <template #breadcrumb>
      <a-breadcrumb>
        <a-breadcrumb-item v-for="item in breadList" :key="item.path">
          <span class="breadcrumb-name" @click="routerJump(item.path, item.step || 0)">
            {{ item.breadcrumbName }}
          </span>
        </a-breadcrumb-item>
      </a-breadcrumb>
    </template>
  </a-page-header>
</template>

<script setup lang="ts">
  // 文件路径 @/components/pageHeader.vue
  import { Ref } from 'vue'
  import useRouterPlus from '@/hooks/common/routerPlus'
  import {
    handleBreadcrumb,
    getBreadcrumb,
    setBreadcrumb,
    getRouterPush,
    setRouterPush,
  } from '@/utils/breadcrumb'

  interface EMITS {
    (e: 'backClick'): void
  }
  const emit = defineEmits<EMITS>()

  interface PROPS {
    pageInfo: PAGEINFO
  }
  const { routerPush, route } = useRouterPlus()
  const props = defineProps<PROPS>()
  const breadList: Ref<Array<BreadRoute>> = ref([])

  onMounted(() => {
    handleBread()
  })

  // 处理面包屑
  function handleBread() {
    if (props.pageInfo.notShowBread) {
      return
    }
    const curPath = route.fullPath
    let list: Array<BreadRoute> = []
    if (props.pageInfo.breadBegins) {
      list = props.pageInfo.breadBegins
      list.push({
        path: curPath,
        breadcrumbName: props.pageInfo.name,
      })
    } else {
      const config = getRouterPush()
      if (config.formPath === curPath) {
        //from的path和当前path相同，说明是在刷新，不处理面包屑
        list = getBreadcrumb()
      } else {
        list = handleBreadcrumb(config.step)
        list.push({
          path: curPath,
          breadcrumbName: props.pageInfo.name,
        })
      }
    }

    // 设置当前页面
    setRouterPush(curPath, 0)
    setBreadcrumb(list)
    for (let i = 0; i < list.length; ++i) {
      list[i].step = i - list.length
    }
    breadList.value = list
  }

  function routerJump(path: string, step: number) {
    routerPush({ path: path || '' }, { step })
  }

  function backClick() {
    if (props.pageInfo.customBackFun) {
      emit('backClick')
    } else {
      routerPush(
        { path: props.pageInfo.backRouter || '' },
        {
          step: -2,
        },
      )
    }
  }
</script>

<style lang="less">
  .ant-layout-header {
    padding: 0px;
  }
  .ant-page-header.has-breadcrumb {
    padding-top: 0px;
  }
  .ant-breadcrumb + .ant-page-header-heading {
    margin-top: 0px;
  }
  .page-header {
    padding-bottom: 0px;
    padding-top: 0px;
    background: #fff;
    height: 100%;
  }
  .breadcrumb-name:hover {
    color: #40a9ff;
  }
</style>
```

也给出对应ts类型：
```typescript
// 文件路径 @/components/types/common.d.ts

declare namespace ANTD {
  type Route = import('ant-design-vue/lib/breadcrumb/Breadcrumb').Route
}

// 面包屑项类型
interface BreadRoute extends ANTD.Route {
  step?: number
}

// 页面基本信息，使用在页头
interface PAGEINFO {
  name: string
  showBack: boolean
  backRouter?: string
  customBackFun?: boolean
  breadBegins?: Array<ANTD.Route>
  notShowBread?: boolean 
}
```

其中最重要的部分是handleBread面包屑处理函数，在onMounted中执行，思路如下：
1. notShowBread为true表示不显示面包屑。
2. breadBegins存在表示需要对面包屑初始化，适用于应用首页。首页如果只需要单层面包屑可以提供空数组，如果需要前置面包屑，比如首页时展示（xxx平台 > 首页）的多层形式，breadBegins可以放前置的面包屑（xxx平台），“首页”还是需要根据当前页面信息自动添加。
3. 不需要初始化的情况下，取出缓存的routerPush。判断formPath是否与当前的路径相同，如果相同说明是在刷新，直接使用缓存的面包屑作为当前面包屑。
4. 如果不属于刷新情况，则取出缓存面包屑，根据step减去后，与当前页面的信息相加，作为新的面包屑。
5. 无论哪种条件都适用的：
   1. 缓存当前页面URL， 当前页面的面包屑。
   2. 对面包屑本身计算跳转时使用的step，从后往前每一层的step都比上一层小1。

页面使用示例，首页部分
```html
<template>
  <a-layout>
    <a-layout-header><pageHeader :pageInfo="pageInfo" /></a-layout-header>
    <a-layout-content>
      <div>
        <a-button type="primary" @click="goAdd">
          <template #icon><plus-outlined /></template>
          添加
        </a-button>
      </div>
    </a-layout-content>
    <a-layout-footer>Footer</a-layout-footer>
  </a-layout>
</template>

<script setup lang="ts">
  import useRouterPlus from '@/hooks/common/routerPlus'
  const { routerPush } = useRouterPlus()
  const pageInfo: PAGEINFO = {
    name: '页面A',
    showBack: false,
    breadBegins: [
      {
        path: '/list',
        breadcrumbName: '首页',
      },
    ],
  }

  function goAdd() {
    routerPush(
      {
        path: '/editA',
        query: {
          oper: 'add',
        },
      },
      { step: 0 },
    )
  }
</script>
```

页面使用示例，需要缓存的普通页面
```html
<template>
  <a-layout>
    <a-layout-header><pageHeader :pageInfo="pageInfo" /></a-layout-header>
    <a-layout-content>
    </a-layout-content>
    <a-layout-footer>Footer</a-layout-footer>
  </a-layout>
</template>

<script setup lang="ts">
  import useRouterPlus from '@/hooks/common/routerPlus'
  const { routerPush } = useRouterPlus()
  const pageInfo: PAGEINFO = {
    name: 'C页面',
    showBack: true,
    backRouter: '/nameB',
  }

  function returnList() {
    routerPush(
      { path: '/nameB' },
      {
        step: -2,
      },
    )
  }
</script>
```
展示情况：  
![图片](/2022/vue-breadcrumb-2.png)

注意，返回上一级时，step是-2，因为实际上是减去当前页面和当前页面的上一级。到了上一级页面之后，又根据当前页面重新生成一级面包屑。而到下一级时，step是0，表示不减。

### 优点和缺点
#### 优点
1. 限制较小，不需要对路由本身做要求和限制，无论是path还是name，手写路由表还是自动生成都能适用。
2. 能够保存路由参数，query和定义在路由中的params都可以保存下来，上级跳转功能的体验较好。
3. 可以适应网状的甚至混乱的路由结构。

#### 缺点
1. 实现麻烦，需要用到LocalStorage和增加路由处理步骤。
2. 用户直接访问子页面URL时，因为没有上级缓存，所以无法加载正确的面包屑
3. 在无法使用params情况下，不能直接使用原有的router方法，需要自己包装一层。


## 树形和网状的路由结构
上面的优缺点中，我们提到路由结构由树形和网状，我先来说明一下这两种情况。

### 树形路由结构
树形路由和我们一般看到的嵌套路由结构类似，页面路由就像一棵树：  
![图片](/2022/vue-breadcrumb-3.png)

和树节点的定义相同，其中每个子页面只能有一个上级页面。可以从上级页面路由到下级，也可以从下级页面路由到上级，可以保持面包屑与用户访问的路径一致，如果没有按照树的路径访问，则不能保证面包屑与用户的操作一致。注意，操作不一致不代表不能跳转，实际上任意界面的跳转没有任何影响。举例几个用户的访问操作：

- 用户访问： 首页 -> A页面 -> AB页面  
  面包屑 首页 > A页面 > AB页面
- 用户访问： 首页 -> AB页面  
  面包屑 首页 > A页面 > AB页面

可以看到，面包屑是固定的，不会根据用户的访问和跳转顺序而改变。

### 网状路由结构
![图片](/2022/vue-breadcrumb-4.png)

从图中可以看到，路由不仅可以在上下级中跳转，而且还可以跨子树跳转，且面包屑也能根据跳转的不同而显示不同的路径。甚至可以直接是混乱的网状结构，也能正确显示。举例几个用户的访问操作：
- 用户访问： 首页 -> A页面 -> AB页面  
  面包屑 首页 > A页面 > AB页面
- 用户访问： 首页 -> AB页面  
  面包屑 首页 > AB页面
- 用户访问： 首页 -> C页面 -> CA页面  
  面包屑 首页 > C页面 > CA页面 
- 用户访问： 首页 -> B页面 -> CA页面  
  面包屑 首页 > B页面 > CA页面 

可以看到，无论用户怎么访问，面包屑都能正确的显示用户的操作路径。

### 树形路由显示网状面包屑的方法
当然，如果真的需要使用树形的路由结构，但是又希望能够显示网状的面包屑，这也不是不能解决，方法就是对同一个页面设置多个不同的路由项，如果这个路由项属于A子树，面包屑就显示带A子树的路径，如果路由项属于B子树，面包屑就显示带B子树的路径。 

这样虽然能解决问题，但是容易造成路由表管理混乱，不太推荐使用。

## 方法3 递归处理路由表
对于用户自行设置路由表，又不使用嵌套路由的场景，且路由可以设置成树形结构的场合，可以使用递归处理路由表的方式，在每个页面独立计算面包屑。

### 方法描述
1. 在普通的路由表项中添加一个上层路由name项prevName，表示路由的上一层的name，breadcrumb表示面包屑名称。
```js
  {
    'name': 'index',
    'path': '/index',
    'component': 'index',
    'breadcrumb': '首页',
    'prevName': null,
  },
  {
    'name': 'nameA',
    'path': '/nameA',
    'component': 'nameA',
    'breadcrumb': 'A页面',
    'prevName': 'index',
  },
  {
    'name': 'nameB',
    'path': '/nameB',
    'component': 'nameB',
    'breadcrumb': 'B页面',
    'prevName': 'index',
  },
  {
    'name': 'nameAA',
    'path': '/nameAA',
    'component': 'nameAA',
    'breadcrumb': 'AA页面',
    'prevName': 'nameA',
  },
```
2. 每个页面独立处理面包屑，首先取得整个路由表和当前的路由信息。再根据当前的prevName递归查找路由表，一直找到prevName为空的路由项，即根结点。然后整个查找路径就组成了面包屑列表。如果觉得列表查找耗时，可以先处理成key/value结构，查找的时间复杂度低一些。

### 优点和缺点
#### 优点
1. 实现简单，只需要在路由表中加一项prevName，处理生成面包屑的规则即可。
2. 能够适应多种情形，无论是刷新页面还是直接访问子页面URL，都能保证面包屑的一致性。
3. 不要求使用嵌套路由结构，路由表设置更简单，path可以分隔符任意使用无限制。

#### 缺点
1. 要求路由必须是清晰的树形结构，每个结点只能有一个prevName。
2. 不能保存路由参数。query和params无法保存，点击面包屑向上级跳转时可能发生错误。
3. 要求存在可以手写的路由表，使用自动生成路由的工程难以使用。

## 参考

- Element UI 组件库中的 Breadcrumb 面包屑  
  https://element.eleme.cn/#/zh-CN/component/breadcrumb
- Ant Design Vue 组件库中的 Breadcrumb 面包屑  
  https://www.antdv.com/components/breadcrumb-cn
- Vue Router 嵌套路由  
  https://router.vuejs.org/zh/guide/essentials/nested-routes.html
- Vue Router 路由守卫  
  https://router.vuejs.org/zh/guide/essentials/dynamic-matching.html
