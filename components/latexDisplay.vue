<template>
  <span ref="latex" class="katex" v-html="rawHTML"></span>
</template>

<script lang="ts" setup>
import katex from "katex";
import "katex/dist/katex.css";
import { useSlots, onMounted } from 'vue'
const slots = useSlots()
const anyFun = () => {
  return [{
    children: ''
  }]
}
const rawHTML: string = katex.renderToString((slots.default || anyFun)()[0].children, {
  throwOnError: false,
})
</script>
