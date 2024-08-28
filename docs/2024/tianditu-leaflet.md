# 使用天地图与Leaflet，轻松创建出免费地图应用(未完成)

天地图又叫做地理信息公共服务平台，是提供给公众免费使用的地理信息平台，提供了多种形式的地图开发资源，使用天地图，可以构建免费的地图应用。Leaflet是一个开源的Javascript地图库，我们使用它来进行地图的展示和交互。

## 注册天地图

首先打开天地图网站（见参考部分），然后点击下面的“开发资源”，进入开发者页面，然后根据步骤进行即可。

![](/2024/tianditu-1.png)

首先注册用户，申请成为开发者。开发者分个人开发者与企业开发者，其中个人开发者无需条件，但是发部分接口调用次数每天只有一万次。

注册之后是申请应用，如果是在公共网络上运行服务，记得需要加域名白名单。创建好之后会给一个key，后面请求接口会使用这个key作为验证。如果只是用于本地测试，可以不加白名单，等上线前换成待白名单的key即可。

![](/2024/tianditu-2.png)

天地图提供了很多地图相关的API，包括各类地图瓦片API，网页API，服务端API和数据API等。

## 使用Leaflet展示地图

这里使用vue3为例，描述下如何使用Leaflet展示地图。

### 引入地图

首先安装依赖，命令函执行：`npm install leaflet`。然后在vue文件中放置一个div容器，设置好宽高等CSS：

```vue
<template>
  <div id="map" style="height: 600px; width: 600px"></div>
</template>
```

然后在script中引入Leaflet，注意CSS样式也要一起引入。为了方便描述，我们将地图相关逻辑都放到了`./leaflet.js`中。注意创建地图时DOM容器需要存在，因此我们在vue的onMounted中创建。

```vue
<script lang="ts" setup>
import { onMounted } from 'vue';
import "leaflet/dist/leaflet.css";
import { createMap } from './leaflet';

onMounted(() => {
  createMap();
})
</script>
```

我这里是在VitePress中引入的，



<TiandituLeaflet />

## 增加交互？

## 总结

## 参考
- 天地图\
  https://www.tianditu.gov.cn/
- 天地图 服务调用配额说明\
  https://console.tianditu.gov.cn/api/traffic
- Leaflet 一个开源并且对移动端友好的交互式地图 JavaScript 库\
  https://leafletjs.com/
- Leaflet 中文文档\
  https://leafletjs.cn/


<script setup>
import TiandituLeaflet from '../../components/tiandituLeaflet/index.vue'
</script>
