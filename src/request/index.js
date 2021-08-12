import axios from 'axios'
import Mint from 'mint-ui'
import { i18n, getLang } from '@/lang'
import store from '@/store'
import router from '@/router'

const baseRequest = axios.create({
  baseURL: process.env.VUE_APP_API_DOMAIN
})
const request = axios.create({
  baseURL: process.env.VUE_APP_API_DOMAIN
})

/**
 * 全局请求拦截器
 */
const axiosRequestFunc = config => {
  if (store.state.token && !config.headers.Authorization) {
    config.headers.Authorization = store.state.token
  }
  if (!config.headers.lang) {
    config.headers.lang = getLang()
  }
  return config
}
const axiosResponseFunc = (response) => {
  // 接口未登录和过期拦截，RREx 接口风格
  if (response.data.code === 101) {
    // 获取 vue-router 的路由
    const pathStartIndex = location.href.indexOf(router.options.base) + router.options.base.length
    const beforeLoginUrl = location.href.substring(pathStartIndex)
    localStorage.setItem('beforeLoginUrl', beforeLoginUrl)
    store.commit('logOut')
    router.replace('login')
    return Promise.reject(new Error(i18n.t('text.common_notLogin'))) // 未登录
  }
  return response
}
const axiosResponseErrFunc = (error) => {
  if (error.response) {
    Mint.Toast(`${i18n.t('text.common_serverErr')}(${error.response.status})`) // 服务器不稳定，请重试（err）
  } else {
    Mint.Toast(`${i18n.t('text.common_slowNetwork')}(${error})`) // 网络慢，请重试(err)
  }
  return Promise.reject(error)
}
request.interceptors.request.use(axiosRequestFunc)
request.interceptors.response.use(axiosResponseFunc, axiosResponseErrFunc)

export {
  baseRequest,
  request
}
export default request
