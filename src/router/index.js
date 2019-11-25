import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'SingleThreshold',
    component: () => import(/* webpackChunkName: "about" */ '../views/SingleThreshold.vue')
  },
  {
    path: '/otsu',
    name: 'OTSU',
    component: () => import(/* webpackChunkName: "about" */ '../views/OTSU.vue')
  },
  {
    path: '/sauvola',
    name: 'Sauvola',
    component: () => import(/* webpackChunkName: "about" */ '../views/Sauvola.vue')
  }
]

const router = new VueRouter({
  routes
})

export default router
