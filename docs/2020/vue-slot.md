# Vue.js同名的组件插槽slot会不会冲突?

看Vue.js的官网文档中组件插槽的部分时，我有一个疑问，每个插槽都需要一个名字，通过名字来识别不同的插槽位置。那么同名插槽会不会起冲突导致Vue无法正常识别？尤其是看到官网文档中v-for渲染的列表中也包含插槽，这不会冲突么？我决定验证一下。

## 多个同名插槽且显示默认内容
首先看看如果有多个同名插槽，且使用默认插槽内容时的情况：

父组件
```vue
<template>
  <div id="app">
    <HelloWorld :list="list">
    </HelloWorld>
  </div>
</template>
 
<script>
import HelloWorld from "./components/HelloWorld.vue";
export default {
  name: "App",
  components: {
    HelloWorld,
  },
  data() {
    return {
      list: [
        {
          title: "nihao1",
          data: "12345678901",
        },
        {
          title: "nihao2",
          data: "12345678902",
        },
        {
          title: "nihao3",
          data: "12345678903",
        },
      ],
    };
  },
  methods: {},
};
</script>
```
子组件
```vue
<template>
  <div class="hello">
    <ul>
      <li v-for="item in list" :key="item.title">
        <slot name="slotTitle">
          {{ item.title }}
        </slot>
        <slot name="slotData">
          {{ item.data }}
        </slot>
      </li>
    </ul>
  </div>
</template>
 
<script>
export default {
  name: "HelloWorld",
  inhertAttrs: true,
  props: {
    list: Array,
  },
  data: function () {
    return {};
  },
  methods: {},
};
</script>
```
网页效果：
​​![](/2020/slot-1.png)
可以看到，在v-for列表中如果有多个相同插槽，且显示默认内容，插槽的识别也不会有冲突，显示的是不同的内容。

## 多个同名插槽且显示自定义相同内容
父组件
```vue
<template>
  <div id="app">
    <HelloWorld :list="list">
      <template v-slot:slotTitle>
        123
      </template>
      <template v-slot:slotData>
        456
      </template>
    </HelloWorld>
  </div>
</template>
 
<script>
import HelloWorld from "./components/HelloWorld.vue";
export default {
  name: "App",
  components: {
    HelloWorld,
  },
  data() {
    return {
      list: [
        {
          title: "nihao1",
          data: "12345678901",
        },
        {
          title: "nihao2",
          data: "12345678902",
        },
        {
          title: "nihao3",
          data: "12345678903",
        },
      ],
    };
  },
  methods: {},
};
</script>
```
子组件未变，仅仅父组件增加的插槽的自定义内容。网页效果：
​​![](/2020/slot-2.png)
我们在父组件指定插槽的自定义内容时，同一个插槽名实际上对应多个插槽，Vue把所有同名插槽的内容都变为了自定义内容，因此显示是相同的。

## 多个同名插槽且有不同插槽prop
父组件
```vue
<template>
  <div id="app">
    <HelloWorld :list="list">
      <template v-slot:slotTitle="slotScope">
        {{slotScope.item.title + 'qwe'}}
      </template>
      <template v-slot:slotData="slotScope">
        {{slotScope.item.data + 'qwe'}}
      </template>
    </HelloWorld>
  </div>
</template>
 
<script>
import HelloWorld from "./components/HelloWorld.vue";
export default {
  name: "App",
  components: {
    HelloWorld,
  },
  data() {
    return {
      list: [
        {
          title: "nihao1",
          data: "12345678901",
        },
        {
          title: "nihao2",
          data: "12345678902",
        },
        {
          title: "nihao3",
          data: "12345678903",
        },
      ],
    };
  },
  methods: {},
};
</script>
```
子组件
```vue
<template>
  <div class="hello">
    <ul>
      <li v-for="item in list" :key="item.title">
        <slot name="slotTitle" v-bind:item="item">
          {{ item.title }}
        </slot>
        <slot name="slotData" v-bind:item="item">
          {{ item.data }}
        </slot>
      </li>
    </ul>
  </div>
</template>
 
<script>
export default {
  name: "HelloWorld",
  inhertAttrs: true,
  props: {
    list: Array,
  },
  data: function () {
    return {};
  },
  methods: {},
};
</script>
```
网页效果：
​​![](/2020/slot-3.png)

插槽定义中包含了prop，且每个prop内容不同，此时即使是同名插槽，Vue也能区分并且正常显示。

## 结论
Vue可以很好的区分同名但是内容不同的插槽，不会起冲突。但是同名插槽无法在父组件作出区分，除非使用插槽prop传递不同的变量。
