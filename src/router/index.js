import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'SingleThreshold',
    meta: {
      title: "单一阈值"
    },
    component: () => import(/* webpackChunkName: "about" */ '../views/SingleThreshold.vue')
  },
  {
    path: '/otsu',
    name: 'OTSU',
    meta: {
      title: "OTSU法"
    },
    component: () => import(/* webpackChunkName: "about" */ '../views/OTSU.vue')
  },
  {
    path: '/sauvola',
    name: 'Sauvola',
    meta: {
      title: "Sauvola法"
    },
    component: () => import(/* webpackChunkName: "about" */ '../views/Sauvola.vue')
  }
]

const router = new VueRouter({
  routes
})

router.beforeEach((to, from, next) => {
  if (to.meta.title) {
    document.title = `${to.meta.title} - PSO SEG🌈`
  }
  next()
})

export default router
