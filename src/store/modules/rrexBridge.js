import rrexBridge from '@/utils/rrexBridge/index'

export default {
  namespaced: true,

  state: () => ({
  }),

  mutations: {
  },

  actions: {
    /**
     * 登录
     * 成功登录返回 true，不强制登录且没有登录成功返回 false
     * 其他情况抛出错误
     */
    async login ({ commit }, data) {
      return new Promise(async (resolve, reject) => {
        rrexBridge.getUserToken(data, res => {
          if (res.code === 0) {
            commit('logIn', res.data.token, { root: true })
            resolve(true)
          } else {
            if (data && !data.forceLogin) {
              resolve(false)
            } else {
              reject(new Error(`登录失败: ${res.msg}`))
            }
          }
        })
      })
    },
    /**
     * 分享链接
     */
    async mediaShareWithLink (_, data) {
      return new Promise(async (resolve, reject) => {
        rrexBridge.mediaShareWithLink(data, res => {
          if (res.code === 0) {
            resolve(res.data)
          } else if (res.code === -1) {
            reject(new Error('取消分享'))
          } else {
            reject(new Error(`分享失败: ${res.msg}`))
          }
        })
      })
    },
    /**
     * 分享图片
     */
    async mediaShareWithImg (_, data) {
      return new Promise(async (resolve, reject) => {
        rrexBridge.mediaShareWithImg(data, res => {
          if (res.code === 0) {
            resolve(res.data)
          } else if (res.code === -1) {
            reject(new Error('取消分享'))
          } else {
            reject(new Error(`分享失败: ${res.msg}`))
          }
        })
      })
    },

    /**
     * 跳转 APP
     */
    async openUrl (_, data) {
      return new Promise(async (resolve, reject) => {
        rrexBridge.openUrl(data, res => {
          if (res.code === 0) {
            resolve(res.data)
          } else {
            reject(new Error(`跳转失败: ${res.msg}`))
          }
        })
      })
    },

    /**
     * 使用新Webview打开页面
     */
    async openNewWebview (_, data) {
      return new Promise(async (resolve, reject) => {
        rrexBridge.openNewWebview(data, res => {
          if (res.code === 0) {
            resolve(res.data)
          } else {
            reject(new Error(`打开失败: ${res.msg}`))
          }
        })
      })
    },
    /**
     * 关闭Webview并返回到上一层
     */
    async closeWebview (_, data) {
      return new Promise(async (resolve, reject) => {
        rrexBridge.closeWebview(data, res => {
          if (res.code === 0) {
            resolve(res.data)
          } else {
            reject(new Error(`返回失败: ${res.msg}`))
          }
        })
      })
    },

    /**
     * 修改 navbar
     */
    async pageInit (_, data) {
      return new Promise(async (resolve, reject) => {
        rrexBridge.pageInit(data, res => {
          if (res.code === 0) {
            resolve(res.data)
          } else {
            reject(new Error(`navbar 配置失败: ${res.msg}`))
          }
        })
      })
    }
  }
}
