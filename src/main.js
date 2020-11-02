import Vue from 'vue'
import App from './App.vue'
import router from './router/router.js'
import './plugins/element.js'
import TreeTable from 'vue-table-with-tree-grid' // 第三方组件-表格
import VueQuillEditor from 'vue-quill-editor' // 引入插件,富文本编辑器
// 引入样式表
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme

// 全局导入element-ui
// import ElementUI from 'element-ui'
// import 'element-ui/lib/theme-chalk/index.css'
// Vue.use(ElementUI)

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

Vue.config.productionTip = false

// 全局注册表格插件
Vue.component('tree-table', TreeTable)

// 注册全局过滤器(日期)
Vue.filter('dateFormat', function (originVal) {
  const dt = new Date(originVal)
  // 年份
  const y = dt.getFullYear()
  // 月份，如果不足两位，补一个0
  const m = (dt.getMonth() + 1 + '').padStart(2, '0')
  // 日期，如果不足两位，补一个0
  const d = (dt.getDate() + '').padStart(2, '0')

  const hh = (dt.getHours() + '').padStart(2, '0')
  const mm = (dt.getMinutes() + '').padStart(2, '0')
  const ss = (dt.getSeconds() + '').padStart(2, '0')

  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})
// 注册全局可用组件
Vue.use(VueQuillEditor)
new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
