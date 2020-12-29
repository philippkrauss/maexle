import Vue from 'vue'
import App from './App.vue'
import VueRouter from 'vue-router'
import OpenGame from '@/components/OpenGame'

Vue.use(VueRouter)
Vue.config.productionTip = false
const router = new VueRouter({
  mode: 'history',
  routes: [
    {path: '/', component: OpenGame},
  ]
})

new Vue({
  render: h => h(App),
  router,
}).$mount('#app')
