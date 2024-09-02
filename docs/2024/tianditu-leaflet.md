# 使用天地图与Leaflet，轻松创建出免费地图应用(未完成)

天地图又叫做地理信息公共服务平台，是提供给公众免费使用的地理信息平台，提供了多种形式的地图开发资源，使用天地图，可以构建免费的地图应用。Leaflet是一个开源的Javascript地图库，我们使用它来进行地图的展示和交互。

## 注册天地图

首先打开天地图网站（见参考部分），然后点击下面的“开发资源”，进入开发者页面，然后根据步骤进行即可。

![](/2024/tianditu-1.png)

首先注册用户，申请成为开发者。开发者分个人开发者与企业开发者，其中个人开发者无需条件，但是发部分接口调用次数每天只有一万次。

注册之后是申请应用，如果是在公共网络上运行服务，记得需要加域名白名单。创建好之后会给一个key，后面请求接口会使用这个key作为验证。如果只是用于本地测试，可以不加白名单，等上线前换成待白名单的key即可。

![](/2024/tianditu-2.png)

天地图提供了很多地图相关的API，包括各类地图瓦片API，网页API，服务端API和数据API等。

## 引入Leaflet库

这里使用vue3为例。首先安装依赖，命令函执行：`npm install leaflet`。然后在vue文件中放置一个div容器，设置好宽高等CSS：

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

我这里是在VitePress中引入的。由于SSR功能，VitePress使用假定在导入时处于浏览器环境的代码，需要动态导入，因此改了一下引入方式。不改的话，本地dev模式可以启动，但是打包会报错。

```vue
<script lang="ts" setup>
import { onMounted } from 'vue';
import "leaflet/dist/leaflet.css";

onMounted(() => {
  import('./leaflet').then((module) => {
    const createMap = module.default;
    createMap();
  });
})
</script>
```

## 展示天地图
然后再来看下`./leaflet.js`中的逻辑。首先我们创建地图：

```js
import L from 'leaflet';

export default function createMap() {
  const map = L.map('map');
}
```

然后引入瓦片图层。天地图提供了很多瓦片类型，可以看：[天地图 地图API文档](http://lbs.tianditu.gov.cn/server/MapService.html)。同时Leaflet中多个瓦片图层可以叠加，我们这里放一层矢量底图，再放一层矢量注记。

```js
const map = L.map('map');
L.tileLayer(
  "http://t0.tianditu.gov.cn/vec_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=vec&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=您的密钥"
).addTo(map);
L.tileLayer(
  "http://t0.tianditu.gov.cn/cva_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cva&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=您的密钥"
).addTo(map);
```

注意这里选择球面墨卡托投影。文档最下面有请求示例，但是部分内容需要我们自己修改，比如密钥(上面我们申请过啦)，图层类型和LAYER。LAYER和其它取值可以在地图元数据查询中查到，例如我引入的两个图层的地图元数据地址：

```
http://t0.tianditu.gov.cn/vec_w/wmts?request=GetCapabilities&service=wmts
http://t0.tianditu.gov.cn/cva_w/wmts?request=GetCapabilities&service=wmts
```

![](/2024/tianditu-3.png)

上图是元数据中部分内容的截图，可以看到不仅有调用需要的参数值，还标明了有多少图层/版本等很多描述信息。

在提供瓦片图层后，地图目前还不能访问，需要我们提供部分配置：

```js
const map = L.map("map", {
  center: [24.1, 109.2], // 中心点
  zoom: 10, // 当前展示的层级
  maxZoom: 18, // 最大层级
  minZoom: 1, // 最小层级
  attributionControl: false, // 不展示版权信息
});
```

其中最大最小层级是地图元数据中提供的，zoom是当前展示的层级。中心点是`[纬度, 经度]`的一个点，可以随便设置。这时候地图就可以在我们的应用中展示啦~ 拖动可以平移地图，滑动滚轮可以缩放地图。

![](/2024/tianditu-4.png)

## 地图瓦片概念

我们上面展示的展示的地图，是可以通过大小缩放查看的，既可以展示整个大陆轮廓，也可以展示建筑物和街道细节。这是通过地图瓦片来实现的。首先设置一个瓦片为256*256像素的图片。如下图所示，在第0层中，由一张图片表示整个地图；在第1层中，由四张图片表示整个地图；在第2层中，由16张图片整个地图。第n层级的图片数量为2^n。通过这种形式，可以实现地图缩放时查看不同细节程度的地图。

![](/2024/tianditu-5.png)

上面我们请求瓦片图层的接口，实际上是URL模板，其中`TILEMATRIX={z}&TILEROW={y}&TILECOL={x}`表示x,y,z三个变量。x和y表示瓦片坐标，即横向和纵向的瓦片标号，z表示瓦片层级。

（todo  瓦片标号图搞一张）

地球是一个球体，是无法直接转化为平面的地图形式的，是通过投影来实现的。不同的投影方式有不同的优缺点，而我们Leaflet是使用的墨卡托投影，具体采用EPSG3857坐标系。关于投影和坐标系的知识这里就不描述了，感兴趣可以自行学习一下。

(todo  引用增加 投影和坐标系 知识链接)

## 增加交互？


<TiandituLeaflet />

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
- VitePress SSR兼容性\
  https://vitepress.dev/zh/guide/ssr-compat
- 天地图 地图API\
  http://lbs.tianditu.gov.cn/server/MapService.html

<script setup>
import TiandituLeaflet from '../../components/tiandituLeaflet/index.vue'
</script>
