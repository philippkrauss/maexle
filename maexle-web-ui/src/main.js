import Vue from 'vue'
import App from './App.vue'
import VueRouter from 'vue-router'
import Clipboard from 'v-clipboard'
import Maexle from '@/components/Maexle'

Vue.use(VueRouter)
Vue.use(Clipboard)

Vue.config.productionTip = false
const router = new VueRouter({
  mode: 'history',
  routes: [
    {path: '/', component: Maexle},
  ]
})

new Vue({
  render: h => h(App),
  router,
}).$mount('#app')
