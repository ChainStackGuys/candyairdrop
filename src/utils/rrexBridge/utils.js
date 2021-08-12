import env from './env'
let responseCallbacks = {} // 回调函数队列
let uniqueId = 1 // 独立id，用做识别事件的 callback
let messageHandlers = {} // 注册给客户端用的事件函数集合

// 调用中抛出错误
function throwError (errData, message) {
  if (message.callbackId) {
    // 模拟 APP 回调并抛出错误
    let callbackData = {
      handlerName: message.handlerName,
      responseId: message.callbackId,
      data: { ...errData }
    }
    dispatchFromNative(JSON.stringify(callbackData))
  } else {
    alert(errData.msg)
  }
}

// 调用 APP
function dispatchFromWeb (message) {
  // 检查环境
  if (!env.isInRrexApp) {
    throwError({
      code: 101,
      msg: '请在 RREx APP 中使用此功能',
      data: {}
    }, message)
    return
  }
  // 开始执行命令
  let messageJSON = JSON.stringify(message)
  if (env.appPlatform === 'android') {
    if (window.JSBridge && window.JSBridge.dispatchFromWeb) {
      window.JSBridge.dispatchFromWeb(messageJSON)
    } else {
      throwError({
        code: 102,
        msg: '未找到该方法，请升级到 APP 最新版本使用该功能',
        data: {}
      }, message)
    }
  } else if (env.appPlatform === 'ios') {
    if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.dispatchFromWeb && window.webkit.messageHandlers.dispatchFromWeb.postMessage) {
      window.webkit.messageHandlers.dispatchFromWeb.postMessage(messageJSON)
    } else {
      throwError({
        code: 102,
        msg: '未找到该方法，请升级到 APP 最新版本使用该功能',
        data: {}
      }, message)
    }
  } else {
    throwError({
      code: 101,
      msg: '请在 RREx APP 中使用此功能',
      data: {}
    }, message)
  }
}

// APP 回调
export function dispatchFromNative (messageJSON) {
  setTimeout(() => {
    let message = JSON.parse(messageJSON)
    if (message.responseId) {
      // 有 responseId 说明为回调事件
      let responseCallback = responseCallbacks[message.responseId]
      if (responseCallback) {
        responseCallback(message.data)
        delete responseCallbacks[message.responseId]
      }
    } else {
      // 没有 responseId 说明为主动调用 web 事件
      let responseCallback
      if (message.callbackId) {
        // 设置回调用函数
        responseCallback = responseData => {
          dispatchFromWeb({
            handlerName: message.handlerName,
            responseId: message.callbackId,
            data: responseData
          })
        }
      } else {
        responseCallback = () => {}
      }
      let handler = messageHandlers[message.handlerName]
      if (!handler) {
        alert(`RREx Bridge 操作失败：未注册 ${message.handlerName} 方法`)
      } else {
        handler(message.data, responseCallback)
      }
    }
  })
}

// 调用app方法
export function callHandler (handlerName, data = {}, callback) {
  typeof data !== 'object' && (data = {})
  let dispatchData = {
    handlerName,
    data
  }
  // 当有回调时，设置回调队列
  if (callback && typeof callback === 'function') {
    let callbackId = 'cb_' + (uniqueId++) + '_' + new Date().getTime()
    responseCallbacks[callbackId] = callback
    dispatchData.callbackId = callbackId
  }
  dispatchFromWeb(dispatchData)
}

// 给app注册方法
export function registerHandler (handlerName, handler) {
  messageHandlers[handlerName] = handler
}
