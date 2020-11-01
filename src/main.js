import Vue from 'vue'
import App from './App.vue'
import router from './router/router.js'
import './plugins/element.js'
import TreeTable from 'vue-table-with-tree-grid' // 第三方组件-表格

// 全局导入element-ui
// import ElementUI from 'element-ui'
// import 'element-ui/lib/theme-chalk/index.css'

// 导入字体图标
import './assets/fonts/iconfont.css'

// 导入全局样式表
import './assets/css/global.css'

import axios from 'axios'
// 配置请求的根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// axios请求拦截，通过axios请求拦截器添加token，保证拥有获取数据的权限
axios.interceptors.request.use(config => {
  // 为请求头对象，添加token验证的Authorization字段
  config.headers.Authorization = window.sessionStorage.getItem('token')
  // 必须return config
  return config
})
// 将axios挂载到Vue的原型对象上，方便在组件中使用
Vue.prototype.$http = axios

// Vue.use(ElementUI)
Vue.config.productionTip = false

Vue.component('tree-table', TreeTable) // 全局注册

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
