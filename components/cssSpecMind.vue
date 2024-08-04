<template>
  <div id="jsmind_container" style="width: 640px; height: 500px;"></div>
</template>

<script lang="ts" setup>
import 'jsmind/style/jsmind.css';
import { onMounted } from 'vue';

var mind = {
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
      { "id": "sub1", "topic": "属性位置顺序" },
      { "id": "sub2", "topic": "选择器权重和", children: [] }
    ]
  }
};
var options = {
  container: 'jsmind_container',
  theme: 'primary',
  editable: true,
};
onMounted(() => {
  import('jsmind').then((module) => {
    const jsMind = module.default;
    const jm = new jsMind(options);
    jm.show(mind);
  })
})
</script>