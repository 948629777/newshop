import Vue from 'vue'
import App from './App.vue'
import router from './router'
import ZkTable from 'vue-table-with-tree-grid'
import VueQuillEditor from 'vue-quill-editor'  
// require styles 导入富文本编辑器对应的样式
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
Vue.use(VueQuillEditor)
// 注册树形表格
Vue.use(ZkTable)
Vue.component('tree-table',ZkTable)
Vue.config.productionTip = false
// 导入组件库
import ElementUI from 'element-ui';
// 导入组件相关样式
import 'element-ui/lib/theme-chalk/index.css';
// 配置  Vue 插件
Vue.use(ElementUI);
import axios from 'axios'
//axios设置响应拦截器
axios.interceptors.response.use(response => {
  return  response.data //拦截处理响应结果，直接返回需要的数据
})
//axios设置请求拦截器
axios.interceptors.request.use(config => {
  const str = sessionStorage.getItem('shopToken')
  config.headers.Authorization = str //设置请求头
  return config
})

// 配置请求的基准URL地址
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'

Vue.prototype.$axios=axios


new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
