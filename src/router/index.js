import Vue from 'vue'
import Router from 'vue-router'
import routes from './routes'
import api from '@/utils/api'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: `/${api.appName}`,
  routes,
  scrollBehavior (to, from, savedPosition) {
    return { x: 0, y: 0 }
  }
})
