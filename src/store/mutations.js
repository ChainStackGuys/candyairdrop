import utils from '@/utils/utils'

// 初始化网页环境
export const initEnv = (state) => {
  let env = {}
  let ua = window.navigator.userAgent
  // platform info
  if (ua.indexOf('Android') > -1 || ua.indexOf('Adr') > -1) {
    env.platform = 'android'
  } else if (ua.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)) {
    env.platform = 'ios'
  } else {
    env.platform = 'desktop'
  }
  // rrex info
  let mat = ua.match(/rrex\/(ios|android)\/(\d+\.\d+\.\d+)(\/lang\/(\w{1,}))?/)
  if (mat) {
    env.isInRrexApp = true
    env.appPlatform = mat[1]
    env.appVersion = mat[2]
    env.appLanguage = mat[4] ? mat[4] : 'cn'
  } else {
    env.isInRrexApp = false
  }
  // wx info
  if (/MicroMessenger/i.test(ua)) {
    env.isInWx = true
  } else {
    env.isInWx = false
  }
  state.env = env
}

// 登录、退出
export const logIn = (state, token) => {
  localStorage.setItem('token', token)
  state.token = token
  utils.addCookie('token', token)
}
export const logOut = (state) => {
  localStorage.removeItem('token')
  state.token = ''
  utils.deleteCookie('token')
}
// 更新登录状态
export const updateLoginStatus = (state) => {
  let token = localStorage.getItem('token')
  if (token) {
    state.token = token
  }
  if (!token) {
    token = utils.getCookie('token')
    if (token) {
      state.token = token
    }
  }
}

// 记录用户首次进入的链接 （ios端微信分享兼容性需要）
export const setEntryUrl = (state, url) => {
  state.entryUrl = url
}

// 缓存红包类型
export const updatePrizeType = (state, payload) => {
  state.prizeType = payload
}

// 更新用户信息
export const updateUserData = (state, payload) => {
  state.userData = { ...payload }
}

// 更新键盘是否显示的状态
export const updateKeyboardStatus = (state, status) => {
  state.keyboardStatus = status
}
