# 使用天地图与Leaflet，轻松创建免费地图应用

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

<TiandituLeaflet type="1" />

## 地图瓦片概念

### 瓦片介绍

我们上面展示的展示的地图，是可以通过大小缩放查看的，既可以展示整个大陆轮廓，也可以展示建筑物和街道细节。通过提供不同放大级别的地图图片，即可实现缩放地图功能。在看大陆轮廓时，我们提供一张小小的图片表示整个世界。在观察建筑物和街道细节时，我们又提供一张“非常大”的图片，使用户可以看清细节。但是这张非常大的图片是无法直接提供给用户的（用户的下载和解析时间会非常非常长）

这可以通过地图瓦片来实现。首先设置一个瓦片为256*256像素的图片。如下图所示，在第0层中，由一张图片表示整个地图；在第1层中，由四张图片表示整个地图；在第2层中，由16张图片整个地图。第n层级的图片数量为2^n。通过这种形式，把不同层级的大图片切分成小图片，用户只请求当前查看的那部分区域的几张小图。因此，地图瓦片可以实现地图缩放时查看不同细节程度的地图。

![](/2024/tianditu-4.png)

上面我们请求瓦片图层的接口，实际上是URL模板，其中`TILEMATRIX={z}&TILEROW={y}&TILECOL={x}`表示x,y,z三个变量。x和y表示瓦片坐标，即横向和纵向的瓦片标号，z表示瓦片层级。

地球是一个球体，是无法直接转化为平面的地图形式的，是通过投影来实现的。不同的投影方式有不同的优缺点，而我们Leaflet是使用的墨卡托投影，具体采用EPSG3857坐标系。关于投影和坐标系的知识这里就不描述了，感兴趣可以自行学习一下。可以参考下这篇文章：[Web GIS 开发入门](https://mp.weixin.qq.com/s/Wg3V-yamQ7NzpGBdQI4h8Q)。

### 使用Leaflet展示瓦片层级

在这里展示一个小的Demo，里面标出了每个瓦片的标号（x,y）和层级（z）。我们缩放和拖动地图，可以看到瓦片也随之变化和移动。

<TiandituLeaflet type="2" />

它的实现是扩展了一个瓦片图层类，在createTile方法中创建div元素，放置文字内容和边框。最后创建一个我们扩展的瓦片图层对象，并附加到地图上即可。实际上这就是Leaflet教程的其中一个： [扩展 Leaflet: Layers](https://leafletjs.cn/examples/extending/extending-2-layers.html)。

```js
export function showMapTile(map) {
  // 扩展瓦片图层
  L.GridLayer.DebugCoords = L.GridLayer.extend({
    createTile: function (coords) {
      // 创建一个div元素
      var tile = document.createElement("div");
      // 里面放瓦片标号
      tile.innerHTML = `x:${coords.x}, y:${coords.y}, z:${coords.z}`;
      // 设置边框
      tile.style.outline = "1px solid red";
      return tile;
    },
  });
  // 创建扩展的瓦片图层对象，并附加到地图上
  (new L.GridLayer.DebugCoords()).addTo(map)
}

// 调用
showMapTile(map);
```

## 添加地图元素和交互
Leaflet提供了一些地图相关的交互形式和方法，这里我们举几个简单的例子。

### 添加标记、圆和多边形
这里列举了添加部分元素的方法:

- 标记: 设定点的位置
- 圆: 设定圆心位置和半径（以米为单位）
- 多边形: 设定多边形的每个角的位置

```js
// 添加地图元素
export function showElement(map) {
  // 添加标记
  L.marker([24.1, 109.2]).addTo(map);
  // 添加圆
  L.circle([24.101, 109.201], {
    // 边框颜色
    color: "red",
    // 填充颜色
    fillColor: "#f03",
    // 填充的不透明度
    fillOpacity: 0.5,
    // 圆的半径，以米为单位
    radius: 50,
  }).addTo(map);
  // 添加多边形
  L.polygon([
    [24.0995, 109.1991],
    [24.0994, 109.1994],
    [24.0997, 109.1993],
  ]).addTo(map);
}
```

最后是实际展示我们创建的元素：

<TiandituLeaflet type="3" />

### 点击与Popups交互
Leaflet提供了Popups，这是一种简单的弹出窗口，通过元素调用bindPopup函数即可实现。同时还提供了包括点击事件在内的很多事件，可以监听并触发操作。这里截图了点击事件可以收到的信息，还是非常多的，具体字段含义可以看API文档。

![](/2024/tianditu-5.png)


这里我们在上一节添加地图元素的基础上，增加了部分交互。
- 点击圆出现Popups弹窗
- 地图任意位置点击事件
- 点击多边形，在地图上添加标记

```js
export function interactive(map) {
  // 添加圆
  const circle = L.circle([24.101, 109.201], {
    // 边框颜色
    color: "red",
    // 填充颜色
    fillColor: "#f03",
    // 填充的不透明度
    fillOpacity: 0.5,
    // 圆的半径，以米为单位
    radius: 50,
  }).addTo(map);
  // Popups弹窗
  circle.bindPopup("我是一个圆");

  // 点击事件
  map.on("click", (e) => {
    console.log(e);
  });

  // 添加多边形
  const polygon = L.polygon([
    [24.1, 109.1990],
    [24.1005, 109.2005],
    [24.0992, 109.1993],
  ]).addTo(map);
  // 点击多边形时添加标记
  polygon.on('click', (e) => {
    // 在点击位置添加
    L.marker(e.latlng).addTo(map);
  });
}
```

我们看一下实际效果：

<TiandituLeaflet type="4" />

### 使用GeoJSON

> GeoJSON是一种用于常见的，用于编码各种地理数据结构的格式。它定义了几种类型的JSON对象，以及将它们组合起来表示有关地理特征、属性和空间范围的数据的方式。

这里简单的介绍一下GeoJSON的几种类型，更详细的介绍请看文末的参考链接。

首先，所有的数据类型都包含在`type: "Feature"`的结构内，如下面的代码示例，外面的结构都是重复的。properties中是一些元数据信息，我们可以自行定义key和value，供我们自己处理数据使用。geometry中就是我们的具体的结构表示了。下面代码中举了三种例子：Point, LineString, Polygon。其中的coordinates每种类型各不相同的，但其中的基本元素都是坐标值。


```js
const point = {
  type: "Feature",
  geometry: {
    // 点
    type: "Point",
    // 点的坐标值
    coordinates: [109.201, 24.101],
  },
  properties: {
    name: "Point",
  },
};
const lineString = {
  type: "Feature",
  geometry: {
    // 线
    type: "LineString",
    // 线的端点坐标值 可以是折线，有多个端点
    coordinates: [
      [109.2, 24.1],
      [109.2015, 24.1012],
      [109.201, 24.1012],
    ],
  },
  properties: {
    name: "LineString",
  },
};

const polygon = {
  type: "Feature",
  geometry: {
    // 多边形
    type: "Polygon",
    // 多边形的顶点坐标，注意第一个点和最后一个点是一样的，即首尾相连
    coordinates: [
      [
        [109.199, 24.1],
        [109.2005, 24.1005],
        [109.1993, 24.0992],
      ],
    ],
  },
  properties: {
    name: "Polygon",
  },
};
```

我们把这些GeoJSON数据，放到地图中展示：

```js
L.geoJSON(point).addTo(map);
L.geoJSON(lineString, {
  // 可以设置样式
  style: {
    color: "#ff7800",
    weight: 5,
  },
}).addTo(map);
L.geoJSON(polygon).addTo(map);
```

最后数据展示在地图上的效果如下：

<TiandituLeaflet type="5" />

GeoJSON中还有一些其它类型，比如FeatureCollection，MultiPoint，MultiLineString，MultiPolygon等，这里就不一一介绍了，感兴趣的同学可以查看最后的参考文档。

## 总结

这里只是简单介绍了Leaflet的使用方式，但这个地图库还有很多很多用法，也有很多第三方插件扩展功能。

通过上述的代码可以看到，我们引入地图，做一些简单的应用是并不复杂的。而且包括天地图、百度、高德等在内，很多互联网地图是直接提供网页API的，即我们使用`<script>`的方式直接引入预设好的代码，不需要自己引入地图引擎去适配地图接口进行展示。例如天地图的网页API：

![](/2024/tianditu-6.png)

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
- Web GIS 开发入门\
  https://mp.weixin.qq.com/s/Wg3V-yamQ7NzpGBdQI4h8Q
- 地图投影方式\
  https://pro.arcgis.com/zh-cn/pro-app/latest/help/mapping/properties/list-of-supported-map-projections.htm
- 聊聊GIS中的坐标系\
  https://zhuanlan.zhihu.com/p/98839097
- Leaflet教程: 扩展Leaflet: Layers\
  https://leafletjs.cn/examples/extending/extending-2-layers.html
- Leaflet教程: 在 Leaflet 中使用 GeoJSON\
  https://leafletjs.cn/examples/geojson/
- RFC 7946 The GeoJSON Format\
  https://datatracker.ietf.org/doc/html/rfc7946
- WebGIS 标准数据格式 GeoJSON 格式介绍及数据处理、可视化工具推荐\
  https://juejin.cn/post/7138434147449569317

<script setup>
import TiandituLeaflet from '../../components/tiandituLeaflet/index.vue'
</script>
