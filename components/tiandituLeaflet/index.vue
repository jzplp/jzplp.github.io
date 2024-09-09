<template>
  <div :id="'map' + props.type" style="height: 600px; width: 600px; border: 1px solid grey"></div>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue';
import "leaflet/dist/leaflet.css";

const props = defineProps(['type']);

onMounted(() => {
  import('./leaflet.js').then((module) => {
    const { createMap, showMapTile, showElement } = module;
    const map = createMap(props.type);
    if (props.type === '2') {
      showMapTile(map);
    }
    if(props.type === '3') {
      showElement(map);
    }
  });
})
</script>
