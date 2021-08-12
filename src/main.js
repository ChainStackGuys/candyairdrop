import Vue from 'vue'
import App from '@/App.vue'
import router from '@/router'
import store from '@/store'
import i18n from '@/lang'
import { request } from '@/request'

// UI框架 mint-ui
import Mint from 'mint-ui'
import 'mint-ui/lib/style.css'

// 框架类库
import wx from '@/assets/libs/wxJsSdk/jweixin-1.4.0-forwebpack.js'
import numeral from 'numeral'
import VueClipboard from 'vue-clipboard2'

// 工具
import utils from '@/utils/utils'
import api from '@/utils/api'
import { debounce } from 'throttle-debounce'
import parseQueryString from '@/utils/parseQueryString'

// 全局组件
import pageLoading from '@/components/pageLoading'
import noData from '@/components/noData'

Vue.use(Mint)
Vue.use(VueClipboard)
Vue.component('pageLoading', pageLoading)
Vue.component('noData', noData)

Vue.prototype.$http = request
Vue.prototype.$numeral = numeral
Vue.prototype.$utils = utils
Vue.prototype.$api = api
Vue.prototype.$wx = wx
Vue.prototype.$debounce = debounce
Vue.config.productionTip = false

// vue 过滤器
Vue.filter('date2agoText', utils.date2agoText)
Vue.filter('hideTelephone', utils.hideTelephone)
Vue.filter('dateFormat', utils.dateFormat)

// 修复移动端点击效果
document.body.addEventListener('touchstart', function () {})
// polyfill location.origin
if (!window.location.origin) {
  window.location.origin = window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':' + window.location.port : '')
}
// v-resetInput 指令
// 修复在ios微信中 input blur 后页面不自动归位的 bug
Vue.directive('resetInput', {
  inserted (el) {
    if (store.state.env.platform == 'android') return
    el.__reset_input_handler = () => {
      setTimeout(() => {
        window.scrollTo(0, document.documentElement.scrollTop || document.body.scrollTop)
      }, 10)
    }
    el.addEventListener('blur', el.__reset_input_handler)
  },
  unbind (el) {
    if (store.state.env.platform == 'android') return
    el.removeEventListener('blur', el.__reset_input_handler)
    delete el.__reset_input_handler
  }
})
// v-watchKeyboard 指令
// 监听键盘是否弹起，配合修复 Android 上键盘会顶起 fixed 元素问题
Vue.directive('watchKeyboard', {
  inserted (el) {
    el.__keyboardShow = () => {
      store.commit('updateKeyboardStatus', 1)
    }
    el.__keyboardHide = () => {
      store.commit('updateKeyboardStatus', 0)
    }
    el.addEventListener('focus', el.__keyboardShow)
    el.addEventListener('blur', el.__keyboardHide)
  },
  unbind (el) {
    el.removeEventListener('focus', el.__keyboardShow)
    el.removeEventListener('blur', el.__keyboardHide)
    delete el.__keyboardShow
    delete el.__keyboardHide
  }
})

// 更新store状态
store.commit('updateLoginStatus')
store.commit('initEnv')
let urlQs = parseQueryString()
if (urlQs.prizeType) store.commit('updatePrizeType', urlQs.prizeType)

// 多语言版本懒加载
const loadedLanguages = ['cn'] // our default language that is preloaded
function setI18nLanguage (lang) {
  i18n.locale = lang
  request.defaults.headers.common.lang = lang
  return lang
}
function loadLanguageAsync (lang) {
  if (!utils.isInArray(store.state.supportLanguages, lang)) {
    return Promise.resolve('cn')
  }
  if (i18n.locale !== lang) {
    if (!utils.isInArray(loadedLanguages, lang)) {
      return import(/* webpackChunkName: "lang-[request]" */ '@/lang/' + lang)
        .then(msgs => {
          i18n.setLocaleMessage(lang, msgs)
          loadedLanguages.push(lang)
          return setI18nLanguage(lang)
        })
    }
    return Promise.resolve(setI18nLanguage(lang))
  }
  return Promise.resolve(lang)
}
Vue.prototype.$loadLanguageAsync = loadLanguageAsync

// 路由前置守卫，权限控制，登录拦截
router.beforeEach((to, from, next) => {
  // 记录第一次进入的URL,兼容spa应用ios上微信分享问题
  if (!store.state.entryUrl) {
    store.commit('setEntryUrl', window.location.href)
  }
  // 语言包懒加载
  if (to.params.lang) {
    loadLanguageAsync(to.params.lang)
      .then(() => {
        goNextStep()
      })
      .catch(() => {
        goNextStep()
      })
  } else {
    goNextStep()
  }

  function goNextStep () {
    // 登录权限判断，权限在 routes.js 中做了说明
    // TODO_FEATURE
    let authLevel = 0
    to.matched.forEach(function (item) {
      if (item.meta && item.meta.authLevel > authLevel) {
        authLevel = item.meta.authLevel
      }
    })
    next()
  }
})
// 路由后置守卫，动态修改标题，配置微信jssdk
router.afterEach((to, from) => {
  // 动态修改标题
  let title = utils.getMatchedMetaValue(to.matched, 'title')
  title && utils.setDocumentTitle(i18n.t(title))
})

// 路由加载错误时 replace 页面
router.onError(() => {
  Mint.Toast('加载中...')
  setTimeout(() => {
    const currentPath = router.history.current.fullPath
    router.replace(currentPath)
  }, 1000)
})

new Vue({
  router,
  store,
  i18n,
  render: h => h(App)
}).$mount('#app')
