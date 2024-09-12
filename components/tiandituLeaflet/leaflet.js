import L from "leaflet";

export function createMap(type) {
  const map = L.map(`map${type}`, {
    center: [24.1, 109.2], // 中心点
    zoom: 18, // 当前展示的层级
    maxZoom: 18, // 最大层级
    minZoom: 1, // 最小层级
    attributionControl: false, // 不展示版权信息
  });

  L.tileLayer(
    "http://t0.tianditu.gov.cn/vec_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=vec&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=719e9003d95b01e8ae561717a1f9600e"
  ).addTo(map);
  L.tileLayer(
    "http://t0.tianditu.gov.cn/cva_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cva&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=719e9003d95b01e8ae561717a1f9600e"
  ).addTo(map);
  return map;
}

// 展示瓦片层级
export function showMapTile(map) {
  L.GridLayer.DebugCoords = L.GridLayer.extend({
    createTile: function (coords) {
      var tile = document.createElement("div");
      tile.innerHTML = `x:${coords.x}, y:${coords.y}, z:${coords.z}`;
      tile.style.outline = "1px solid red";
      return tile;
    },
  });
  new L.GridLayer.DebugCoords().addTo(map);
}

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

// 添加交互
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
  circle.bindPopup("我是一个圆");

  // 点击事件
  map.on("click", (e) => {
    console.log(e);
  });

  // 添加多边形
  const polygon = L.polygon([
    [24.1, 109.199],
    [24.1005, 109.2005],
    [24.0992, 109.1993],
  ]).addTo(map);
  // 点击多边形时添加标记
  polygon.on("click", (e) => {
    L.marker(e.latlng).addTo(map);
  });
}

// 添加GeoJSON
export function showGeoJson(map) {
  const point = {
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [109.201, 24.101],
    },
    properties: {
      name: "Point",
    },
  };
  const lineString = {
    type: "Feature",
    geometry: {
      type: "LineString",
      coordinates: [
        [109.2, 24.1],
        [109.2015, 24.1012],
      ],
    },
    properties: {
      name: "LineString",
    },
  };

  const polygon = {
    type: "Feature",
    geometry: {
      type: "Polygon",
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

  L.geoJSON(point).addTo(map);
  L.geoJSON(lineString, {
    style: {
      color: "#ff7800",
      weight: 5,
    },
  }).addTo(map);
  L.geoJSON(polygon).addTo(map);
}
