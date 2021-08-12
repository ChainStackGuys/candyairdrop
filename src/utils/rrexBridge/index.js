/**
 * RREx JS & APP 交互方法
 * v2.0 - 20200422
 * 文档说明: https://fhrxq1y4dg.larksuite.com/docs/docusOKVqrZOdkyqMoLaeiHKBqh#
 */

import { callHandler, registerHandler, dispatchFromNative } from './utils'
import env from './env'

// 将 dispatchFromNative 暴露给 APP
if (!window.JSBridge) window.JSBridge = {}
window.JSBridge.dispatchFromNative = dispatchFromNative

/**
 * @description 获取用户 Token
 * @param {Object} params 当前传递空对象即可
 */
export function getUserToken (params = {}, cb) {
  callHandler('getUserToken', params, cb)
}

/**
 * @description 下载
 * @param {String} params.type 下载类型，当前可取 'img'
 * @param {String} params.url 链接，或图片的base64格式
 */
export function download (params = {}, cb) {
  callHandler('download', params, cb)
}

/**
 * @description 分享
 * @param {Object} params 见文档
 */
export function mediaShare (params = {}, cb) {
  callHandler('mediaShare', params, cb)
}

/**
 * @description 便捷分享图片
 * @param {String} params.imageUrl 图标 URL 或 base64
 */
export function mediaShareWithImg ({ imageUrl }, cb) {
  callHandler('mediaShare', {
    shareList: [
      {
        type: 'wechatSession',
        shareType: 'image',
        imageUrl: imageUrl
      },
      {
        type: 'wechatTimeLine',
        shareType: 'image',
        imageUrl: imageUrl
      },
      {
        type: 'downloadImage',
        imageUrl: imageUrl
      }
    ]
  }, cb)
}

/**
 * @description 便捷分享链接
 * @param {String} params.linkTitle 链接标题，默认当前页标题
 * @param {String} params.linkDesc 链接描述
 * @param {String} params.linkUrl 链接地址，默认当前网址
 * @param {String} params.linkThumb 分享图标地址
 * @param {String} params.textCopy 用于复制的网址
 */
export function mediaShareWithLink (
  {
    linkTitle = document.title,
    linkDesc,
    linkUrl = window.location.href,
    linkThumb,
    textCopy
  },
  cb) {
  callHandler('mediaShare', {
    shareList: [
      {
        type: 'wechatSession',
        shareType: 'link',
        linkTitle: linkTitle,
        linkDesc: linkDesc || linkUrl,
        linkUrl: linkUrl,
        linkThumb: linkThumb
      },
      {
        type: 'wechatTimeLine',
        shareType: 'link',
        linkTitle: linkTitle,
        linkDesc: linkDesc || linkUrl,
        linkUrl: linkUrl,
        linkThumb: linkThumb
      },
      {
        type: 'copyText',
        textCopy: textCopy || linkUrl
      }
    ]
  }, cb)
}

/**
 * @description 跳转 APP 内页
 * @param {String} params.url 跳转到 APP 内 url 的地址，见文档
 */
export function openUrl (params = {}, cb) {
  callHandler('openUrl', params, cb)
}

/**
 * @description 跳转 APP 内页，此方法为重定向拦截形势，不具有回调功能
 */
export function goUrl (path) {
  window.location.href = `rrex://${path}`
}

/**
 * @description 页面配置、导航栏配置
 */
export function pageInit (params, cb) {
  callHandler('pageInit', params, cb)
  registerHandler('navbarItemCallback', params.navbarItemCallback)
}

/**
 * @description 使用新Webview打开页面
 * @param {String} params.url 跳转链接
 */
export function openNewWebview (params, cb) {
  callHandler('openNewWebview', params, cb)
}

/**
 * @description 关闭当前 webview
 * @param {String} params.passParams 传递给上层的参数
 */
export function closeWebview (params, cb) {
  callHandler('closeWebview', params, cb)
}

export default {
  env,
  registerHandler,
  getUserToken,
  download,
  mediaShare,
  mediaShareWithImg,
  mediaShareWithLink,
  openUrl,
  goUrl,
  pageInit,
  openNewWebview,
  closeWebview
}
