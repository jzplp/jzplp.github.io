<template>
  <div id="map" style="height: 600px; width: 600px; border: 1px solid grey"></div>
</template>

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
