import request from '@/request'
import Mint from 'mint-ui'
import api from '@/utils/api'
import wx from '@/assets/libs/wxJsSdk/jweixin-1.4.0-forwebpack.js'

// 获取用户信息
export const getUserData = (context, opts) => {
  opts = opts || {
    refresh: false
  }
  return new Promise((resolve, reject) => {
    if (!opts.refresh && context.state.userData) {
      resolve(context.state.userData)
    } else {
      request.get(api.getUserData)
        .then(res => {
          if (res.data.errcode == 0) {
            context.commit('updateUserData', res.data.data)
            resolve(context.state.userData)
          } else {
            Mint.Toast(`提示：${res.data.errmsg}`)
          }
        })
    }
  })
}

// 配置 微信 JSSDK config流程
export const wxSdkConfig = (context) => {
  return new Promise((resolve, reject) => {
    if (context.state.env.isInWx) {
      let wxJsUrl = '' // 验证签名所需URL
      if (context.state.env.platform == 'ios' && !/wechatdevtools/i.test(navigator.userAgent)) {
        // 微信浏览器&&苹果设备, 取出记录的第一次访问的URL
        wxJsUrl = context.state.entryUrl.split('#')[0]
      } else {
        wxJsUrl = location.href.split('#')[0] // 当前页面URL
      }
      request.get(api.getWxConfig, { params: { url: wxJsUrl } })
        .then(res => {
          // 向服务器端请求jssdk签名
          if (res.data.errcode == 0) {
            wx.config({
              debug: false,
              appId: res.data.data.appId,
              timestamp: res.data.data.timestamp,
              nonceStr: res.data.data.nonceStr,
              signature: res.data.data.signature,
              jsApiList: ['updateTimelineShareData', 'updateAppMessageShareData', 'onMenuShareAppMessage', 'onMenuShareTimeline', 'onMenuShareQQ']
            })
            wx.ready(() => {
              resolve()
            })
            wx.error(() => {
              // reject(new Error('分享配置失败，请返回重试：' + res.errMsg))
            })
          } else {
            reject(new Error(`提示：${res.data.errmsg}`))
            // Mint.Toast(`网络错误，可能会导致微信分享失败，请刷新重试 (错误信息：${res.data.errmsg})`)
          }
        })
        .catch(err => {
          reject(err)
        })
    }
  })
}
