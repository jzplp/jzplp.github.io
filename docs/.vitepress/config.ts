import { defineConfig } from "vitepress";

const CONFIG = {
  // 是否展示年度总结
  showAnnualSummary: true,
};

// 目录列表
const sidebarLists = [
  {
    text: "2025",
    items: [
      {
        text: "SourceMap数据生成原理（没开始）",
        link: "/2025/sourcemap-principle",
      },
      {
        text: "Webpack中各种devtool配置的含义与SourceMap生成逻辑",
        link: "/2025/webpack-sourcemap",
      },
      {
        text: "快速定位源码问题：SourceMap的生成/使用/文件格式与历史",
        link: "/2025/js-sourcemap",
      },
      {
        text: "解锁Babel核心功能：从转义语法到插件开发",
        link: "/2025/babel-intro",
      },
      {
        text: "JavaScript语法树简介：AST/CST/词法/语法分析/ESTree/生成工具",
        link: "/2025/js-ast",
      },
      {
        text: "清除浮动/避开margin折叠：前端CSS中BFC的特点与限制",
        link: "/2025/css-bfc",
      },
      {
        text: '让数据"流动"起来！Node.js实现流式渲染/流式传输与背后的HTTP原理',
        link: "/2025/node-stream-render",
      },
      {
        text: "聊一下CSS中的标准流，浮动流，文本流，文档流",
        link: "/2025/css-float",
      },
      {
        text: "(非技术)从一公里到半程马拉松：我的一年跑步经历",
        link: "/2025/run-half-marathon",
      },
      {
        text: "谈一谈前端构建工具的本地代理配置(Webpack与Vite)",
        link: "/2025/web-proxy",
      },
    ],
  },
  {
    text: "2024",
    items: [
      {
        text: "2024年度总结：生活新起点",
        link: "/2024/2024-summary",
        tags: ["ANNUAL_SUMMARY"],
      },
      {
        text: "如何使用React，透传各类组件能力/属性？",
        link: "/2024/react-transparent",
      },
      { text: "JavaScript中的this, 究竟指向什么？", link: "/2024/js-this" },
      {
        text: "使用天地图与Leaflet，轻松创建免费地图应用",
        link: "/2024/tianditu-leaflet",
      },
      {
        text: "CSS优先级，没你想的那么简单！全面介绍影响CSS优先级的各类因素",
        link: "/2024/css-specificity",
      },
      {
        text: "Vue中的事件总线(EventBus)是什么？它有什么优点和缺点？",
        link: "/2024/vue-eventbus",
      },
    ],
  },
  {
    text: "2023",
    items: [
      {
        text: "带你搞懂JavaScript中的原型和原型链",
        link: "/2023/prototype-chain",
      },
      { text: "简单理解Vue2的响应式原理", link: "/2023/vue2-reactivity" },
      { text: "如何二次封装一个Vue3组件库？", link: "/2023/component-lib" },
      {
        text: "圣杯布局/双飞翼布局/flex/grid等，实现CSS三列自适应布局的几种方法",
        link: "/2023/three-layout",
      },
      {
        text: "超详细！手把手带你实现一个完整的Promise",
        link: "/2023/promise-intro",
      },
      {
        text: "谈一谈浏览器与Node.js中的JavaScript事件循环，宏任务与微任务机制",
        link: "/2023/macro-micro-task",
      },
      { text: "浏览器中Cookie的全面介绍", link: "/2023/cookie-intro" },
      {
        text: "什么情形下应该使用BFF？带你了解BFF的优势，即服务于前端的后端",
        link: "/2023/bff-intro",
      },
      {
        text: "使用VitePress和Github搭建个人博客，可以自动构建和发布",
        link: "/2023/blog-github",
      },
      {
        text: "使用Vite虚拟模块功能重写多语言和多皮肤插件",
        link: "/2023/vite-virtual-plugin",
      },
      { text: "如何编写一个自己的web前端脚手架", link: "/2023/web-cli" },
    ],
  },
  {
    text: "2022",
    items: [
      {
        text: "使用vite和Element Plus，实现部署后不修改代码/打包，新增主题/皮肤包",
        link: "/2022/vite-element-skin",
      },
      {
        text: "使用vite和vue-i18n，实现部署后更新多语言功能",
        link: "/2022/vite-vue-i18n",
      },
      {
        text: "web前端自动生成动态面包屑导航的方法，以vue为例",
        link: "/2022/vue-breadcrumb",
      },
      {
        text: "GitLab持续集成部署CI/CD初探：如何自动构建和发布个人前端博客",
        link: "/2022/gitlab-cicd",
      },
      {
        text: "使用Canvas手画不规则多边形，并限制相交线和凹多边形",
        link: "/2022/canvas-polygon",
      },
      { text: "Vue和VuePress支持显示LaTeX公式方法", link: "/2022/vue-latex" },
      { text: "Web前端如何启动本地可执行文件", link: "/2022/web-exe" },
    ],
  },
  {
    text: "2021",
    items: [
      { text: "读书评价《HTTP权威指南》", link: "/2021/book-http-guide" },
      {
        text: "Base64编码详解与URL安全的Base64编码",
        link: "/2021/base64-safe",
      },
      { text: "读书评价《操作系统导论》OSTEP", link: "/2021/book-ostep" },
      { text: "读书评价《MySQL必知必会》", link: "/2021/book-ostep" },
      {
        text: "Cookie，sessionStorage，localStorage与浏览器新开窗口window.open的关系",
        link: "/2021/cookie-storage",
      },
      {
        text: "读书评价《编码: 隐匿在计算机软硬件背后的语言》",
        link: "/2021/book-code",
      },
      {
        text: "后端开启https服务的方法，以OpenSSL和Egg.js为例",
        link: "/2021/htttps-eggjs",
      },
      {
        text: "Oauth第三方登录GitLab实现，用Egg.js做后端",
        link: "/2021/oauth-eggjs",
      },
      { text: "存储卡规格等级全解！SD卡TF卡都能用", link: "/2021/memory-card" },
    ],
  },
  {
    text: "2020",
    items: [
      {
        text: "正则表达式应用“如何判断字符串中不包含连续重复的数字或者字母”",
        link: "/2020/regex-password",
      },
      {
        text: "读书评价《鸟哥的Linux私房菜 基础学习篇》第四版",
        link: "/2020/book-linux",
      },
      { text: "Vue.js同名的组件插槽slot会不会冲突?", link: "/2020/vue-slot" },
      {
        text: "JavaScript中fetch的最简单实现示例，最简单的跨域请求方式",
        link: "/2020/fetch-cros",
      },
      {
        text: "JSONP的最简单实现，前端跨域请求的方式",
        link: "/2020/jsonp-web",
      },
      { text: "AJAX技术示例，Web前端后端实现", link: "/2020/ajax-web" },
      {
        text: "读书评价《Node学习指南》第二版 Learning Node",
        link: "/2020/book-learn-node",
      },
      { text: "用Node.js和Redis实现简单消息队列", link: "/2020/node-redis" },
      {
        text: "Node.js中QueryString库的使用注意事项",
        link: "/2020/node-querystring",
      },
      { text: "读书评价《ES6标准入门》阮一峰", link: "/2020/es6-ruan" },
      {
        text: "两个月 如何从零入门Web前端开发（个人经历）",
        link: "/2020/beg-web",
      },
      {
        text: "“知识屏蔽“是什么？阅读知识屏蔽的书有什么好处？",
        link: "/2020/know-mask",
      },
      { text: "Node.js定时器中的ref函数和unref函数", link: "/2020/time-ref" },
      {
        text: "天坑还是新技术？机械硬盘中的SMR叠瓦盘技术究竟如何？",
        link: "/2020/drive-smr",
      },
      {
        text: "JavaScript中Promise对象的部分使用特点",
        link: "/2020/js-promise",
      },
    ],
  },
];

function handleConfig(list) {
  list.forEach((year) => {
    if (!year?.items.length) return;

    // 转换tags为key-value结构
    year?.items?.forEach((item) => {
      if (item?.tags?.length) {
        const tags = {};
        item?.tags?.forEach((tag) => {
          tags[tag] = true;
        });
        item.tags = tags;
      }
    });

    // 针对配置进行过滤
    year.items = year?.items?.filter((item) => {
      if (!CONFIG.showAnnualSummary && item?.tags?.ANNUAL_SUMMARY) return false;
      return true;
    });
  });
  return list;
}

// https://vitepress.dev/reference/site-config
export default defineConfig({
  lang: "zh-CN",
  title: "漂流瓶jz的博客",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [{ text: "首页", link: "/" }],
    sidebar: handleConfig(sidebarLists),
    socialLinks: [{ icon: "github", link: "https://github.com/jzplp" }],
    outline: {
      level: "deep",
    },
  },
});
