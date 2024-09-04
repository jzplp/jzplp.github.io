import L from "leaflet";

export function createMap() {
  const map = L.map("map", {
    center: [24.1, 109.2], // 中心点
    zoom: 10, // 当前展示的层级
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
