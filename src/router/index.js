import Vue from 'vue'
import VueRouter from 'vue-router'
import login from '../views/login.vue'
import home from '../components/home.vue'
import users from '../components/user/users.vue'
import roles from '../components/roles/roles.vue'
import goodslist from '../components/goods/goods.vue'
import goodsparams from '../components/goods/params.vue'
import rights from '../components/roles/rights.vue'
import orders from '../components/orders/orders.vue'
import categories from '../components/goods/categories.vue'
import addGoods from '../components/goods/addGoods.vue'
import reports from '../components/reports/reports.vue'
Vue.use(VueRouter)

const routes = [
  {path:'/',redirect:'/login'},
  {path:'/login',name:'login',component:login},
  {path:'/home',name:'home',component:home,
    children:[
      {path:'/home',redirect:'/home/users'},
      {path:'/home/users',component:users},
      {path:'/home/roles',component:roles},
      {path:'/home/rights',component:rights},
      {path:'/home/goods',component:goodslist},
      {path:'/home/params',component:goodsparams},
      {path:'/home/orders',component:orders},
      {path:'/home/categories',component:categories},
      {path:'/home/add',component:addGoods},
      {path:'/home/reports',component:reports}
    ]
  }
]


const router = new VueRouter({
  routes
})
// 配置token路由导航守卫
//设置路由导航守卫
router.beforeEach((to, from, next) => {
  // to要去的页面 from从哪里来 next放行 
  if(to.path==='/login') next()
  var tokenStr = sessionStorage.getItem('shopToken')
  if(!tokenStr) next('/login')
  else next()
})



export default router
