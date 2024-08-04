<template>
  <div id="jsmind_container" style="width: 640px; height: 1000px"></div>
</template>

<script lang="ts" setup>
import 'jsmind/style/jsmind.css';
import { onMounted } from 'vue';

const mind = {
  "meta": {
    "name": "css specificity",
    "author": "jzplp",
    "version": "1"
  },
  "format": "node_tree",
  "data": {
    "id": "root",
    "topic": "CSS优先级",
    "children": [
      { "id": "1", "topic": "属性位置顺序", "direction": "left" },
      {
        "id": "2", "topic": "选择器权重和", "direction": "left", children:
          [
            { "id": "2.0", "topic": "0-0-0的*选择器" },
            { "id": "2.1", "topic": "0-0-1的选择器" },
            { "id": "2.2", "topic": "0-1-0的选择器" },
            { "id": "2.3", "topic": "1-0-0的ID选择器" },
            { "id": "2.4", "topic": "组合选择器" },
            { "id": "2.5", "topic": "CSS嵌套" },
          ]
      },
      {
        "id": "3", "topic": "伪类", "direction": "left", children:
          [
            { "id": "3.1", "topic": "普通伪类" },
            { "id": "3.2", "topic": "接收非选择器的函数式伪类" },
            {
              "id": "3.3", "topic": "接收选择器的函数式伪类", children:
                [
                  { "id": "3.3.1", "topic": ":is()伪类" },
                  { "id": "3.3.2", "topic": ":not()伪类" },
                  { "id": "3.3.3", "topic": ":has()伪类" },
                  { "id": "3.3.4", "topic": ":where()伪类" },
                ]
            }
          ]
      },
      { "id": "4", "topic": "伪元素", "direction": "left" },
      { "id": "5", "topic": "内联样式", "direction": "left" },
      {
        "id": "6", "topic": "继承", "direction": "left", children: [
          { "id": "6.1", "topic": "默认继承" },
          { "id": "6.2", "topic": "显式继承" },
        ]
      },
      { "id": "7", "topic": "用户代理样式表", "direction": "left" },
      {
        "id": "8", "topic": "属性初始值", "direction": "left", children: [
          { "id": "8.1", "topic": "初始值优先级" },
          { "id": "8.2", "topic": "显式设置初始值" },
        ]
      },
      {
        "id": "9", "topic": "显式控制属性值", "direction": "left", children: [
          { "id": "9.1", "topic": "单个属性" },
          { "id": "9.2", "topic": "all所有属性" },
          { "id": "9.3", "topic": "initial值" },
          { "id": "9.4", "topic": "inherit值" },
          { "id": "9.5", "topic": "unset值" },
          { "id": "9.6", "topic": "revert值" },
        ]
      },
      { "id": "10", "topic": "用户自定义样式" },
      { "id": "11", "topic": "!important标识" },
      {
        "id": "12", "topic": "CSS动画", children: [
          { "id": "12.1", "topic": "@keyframes" },
          { "id": "12.2", "topic": "animation-duration属性" },
          { "id": "12.3", "topic": "animation-delay属性" },
          { "id": "12.4", "topic": "animation-play-state属性" },
          { "id": "12.5", "topic": "animation-fill-mode属性" },
        ]
      },
      { "id": "13", "topic": "CSS过渡" },
      { "id": "14", "topic": "层叠顺序" },
      {
        "id": "15", "topic": "层叠层@layer", children: [
          { "id": "15.1", "topic": "层叠层顺序" },
          { "id": "15.2", "topic": "层叠层与@import" },
          { "id": "15.3", "topic": "层叠层与!important" },
          { "id": "15.4", "topic": "嵌套层叠层" },
        ]
      },
      {
        "id": "19", "topic": "不会影响CSS优先级的内容", children: [
          { "id": "19.1", "topic": "外部样式表" },
          { "id": "19.2", "topic": "@import插入样式" },
          { "id": "19.3", "topic": "使用js插入样式" },
          { "id": "19.4", "topic": "延时提供样式文件" },
          { "id": "19.5", "topic": "元素接近度" },
          { "id": "19.6", "topic": "class属性值顺序" },
        ]
      },
      {
        "id": "20", "topic": "浏览器调试", children: [
          { "id": "20.1", "topic": "浏览器调试样式" },
          { "id": "20.2", "topic": "浏览器插件注入样式" },
        ]
      },
    ]
  }
};
const options = {
  container: 'jsmind_container',
  theme: 'primary',
  view: {
    hmargin: 0, // 设置思维导图距容器外框的最小水平距离为 100 像素
    vmargin: 0,  // 设置思维导图距容器外框的最小垂直距离为 50 像素
  }
};
onMounted(() => {
  import('jsmind').then((module) => {
    const jsMind = module.default;
    const jm = new jsMind(options);
    jm.show(mind);
  })
})
</script>