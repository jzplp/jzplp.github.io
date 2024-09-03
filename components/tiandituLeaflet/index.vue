<template>
  <div id="map" style="height: 600px; width: 600px; border: 1px solid grey"></div>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue';
import "leaflet/dist/leaflet.css";

const props = defineProps(['type']);

onMounted(() => {
  import('./leaflet1').then((module) => {
    const createMap = module.default;
    createMap();
  });
})
</script>
