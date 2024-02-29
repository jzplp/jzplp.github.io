
# Vue中的事件总线(EventBus)是什么？(未完成)

作为一名使用Vue的前端开发者，有时候会听到事件总线(EventBus)这个名词。但可能是我入行比较晚，我在Vue网站中并没有看到过事件总线的介绍，在项目中也没有使用过。那究竟什么是事件总线？事件总线可以解决什么问题？

## 目录
[[toc]]

## 事件总线简介
事件总线是一种组件通信方式，用于在工程的中的任意组件中进行事件触发和数据传递。

通过在全局创建一个事件总线，所有组件（无论他们的关系是父子还是兄弟还是不相关）都可以使用同一个总线发送事件和监听事件，传输数据。这样通信就可以不受组件间关系限制，实现灵活的通信能力。

## Vue2实现事件总线

### 创建总线
首先创建一个Vue2项目，可以使用`Vue CLI`。然后在`src/main.js`中创建一个事件总线。创建的方式有两种：

1. 新创建一个Vue示例
```js
import Vue from 'vue'
import App from './App.vue'

Vue.prototype.$EventBus = new Vue()
new Vue({ render: h => h(App), }).$mount('#app')
```

2. 使用已有的Vue示例
```js
import Vue from 'vue'
import App from './App.vue'

new Vue({
  render: h => h(App),
  beforeCreate() { Vue.prototype.$EventBus = this; }
}).$mount('#app')
```

### 触发/接收事件
我们假设有两个组件A和B，A触发事件，B接收事件。

* 组件A
```vue
<template>
  <div> <p @click="add"> 点击增加 </p> </div>
</template>
<script>
export default {
  name: 'Add',
  data() { return { sum: 1, addNum: 1 } },
  methods: {
    add() {
      this.sum += this.addNum;
      this.addNum++;
      this.$EventBus.$emit('add', this.sum);
    }
  }
}
</script>
```

* 组件B
```vue
<template>
  <div> <h1>收到数据： {{ sum }}</h1> </div>
</template>
<script>
export default {
  name: 'HelloWorld',
  data() { return { sum: 1, } },
  mounted() {
    this.$EventBus.$on('add', (sum) => { this.sum = sum })
  },
  beforeDestroy() {
    this.$EventBus.$off('add')
  },
}
</script>
```

可以看到事件总线的实现方式实际上非常简单，就是把一个Vue实例挂载为一个全局属性，在这个实例上触发事件，监听事件即可。如果不需要监听时，要记得销毁监听事件。

## 其它组件通信方式
Vue2有很多组件间的通信方式，这里总结一下：

1. **组件Props** 父组件向子组件传递数据
2. **组件事件Emit** 子组件触发事件；父组件监听事件，接收数据
3. **组件v-model** 通过props和事件实现父子组件数据的双向绑定
4. **依赖注入** 父组件向后代组件传递数据
5. **Attributes** 没有被组件声明为props或emits的属性；父组件向子组件传递数据
6. **状态管理** 全局共享的数据管理，一般使用Pinia或者Vuex等工具
7. **事件总线** 全局组件共享的事件管理
8. **模板引用ref** 父组件主动调用子组件方法，可传递数据
9. **其它方式** 可以存放数据的公共位置，比如Storage, Window等。

## 事件总线的优缺点
通过事件总线的实现，我们可以了解到事件总线可以非常简单的实现全局组件共享的事件管理，传递数据等。既然如此简单，那Vue为什么没有推荐作为官方的组件通信方式？为什么即使Vue官方并无推荐，但却有很多开发者使用事件总线。我们结合上面的其它组件通信方式，来讨论下事件总线的优缺点。

### 优点
1. **实现全局任意组件共享的数据传输**\
查看上面的通信方式，我们可以看到Vue提供的大部分方式都有组件关系的限制，大部分是父组件向子组件向后代组件之间传递。而事件总线却没有任何限制。
2. **实现非常简单**\
使用状态管理工具也可以实现数据传递，但是这些工具都要引入依赖库，有自己的使用方式。虽然并不麻烦，但是都没有事件总线使用这么简单。
3. **全局的事件管理器**\
组件通信除了传递数据，另一个作用是实时触发事件，针对事件进行操作。查看上面的组件通信方式，我们发现除事件总线外，全局的通信只是数据的传递，没有事件的触发。通过监听状态管理和Storage数据等，可以变相实现事件的管理，但是并没有事件总线清晰和直接。

### 缺点
主要是使用不慎带来的很多问题。例如：
**销毁事件监听器后，其它组件监听的同名事件也会被销毁。**\
比如B组件和C组件都监听了同一事件'add'。B组件销毁了'add'

