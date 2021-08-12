import dayjs from 'dayjs'
import i18n from '@/lang'
import env from './rrexBridge/env'

let utils = {}

// 根据vue-router中matched数组遍历出meta中相关key的值
utils.getMatchedMetaValue = (matched, key) => {
  for (let i = matched.length - 1; i >= 0; i--) {
    if (matched[i].meta && matched[i].meta[key]) {
      return matched[i].meta[key]
    }
  }
}
utils.formatShortHash = (hash) => {
  return hash.substr(0, 6) + '...' + hash.substr(hash.length - 6)
}

utils.getAddressPrefix = (address) => {
  return address.substr(address.length - 6)
}
// 动态修改网页 title，兼容微信
utils.setDocumentTitle = (title) => {
  document.title = title
}

// 判断是否是数字
utils.isNumber = (n) => {
  return !isNaN(n) && typeof n === 'number'
}

// 获取数字精度，小数点后几位
utils.getNumberPrecision = (num) => {
  num = +num
  if (num >= 1) {
    return 0
  } else {
    return num.toString().split('.')[1].length
  }
}

// 根据数字精度获取默认占位符样式
utils.getNumberPlaceholderText = (num) => {
  if (num === 0) {
    return '0'
  } else {
    let text = '0.'
    for (let i = 0; i < num; i++) {
      text += '0'
    }
    return text
  }
}

// timestamp 时间转化为 **以前 形式
// 例如：20秒前，4小时前，超出30天显示具体日期“10-26 12:37”
utils.timestamp2agoText = (timestamp) => {
  let minute = 1000 * 60
  let hour = minute * 60
  let day = hour * 24
  let diffValue = dayjs().diff(dayjs(timestamp))

  let dayC = diffValue / day
  let hourC = diffValue / hour
  let minC = diffValue / minute
  let result = ''

  if (hourC > 24) {
    result = parseInt(dayC) + '天前'
  } else if (hourC >= 1) {
    result = parseInt(hourC) + '小时前'
  } else if (minC >= 1) {
    result = parseInt(minC) + '分钟前'
  } else {
    result = '刚刚'
  }
  return result
}
utils.date2agoText = utils.timestamp2agoText

/*
 * dateTime 时间转化
 * 是今天 时间格式  13:23:56（精确到秒）
 * 不是今天 时间格式  4月17日 13:23（精确到分）
 */
utils.dateFormat = (timestamp) => {
  if (dayjs().isSame(timestamp, 'day')) {
    return dayjs(timestamp).format('HH:mm:ss')
  } else {
    return dayjs(timestamp).format('M月D日 HH:mm')
  }
}

// 手机号隐藏中间4位
utils.hideTelephone = (tel) => {
  return tel.substr(0, 3) + '****' + tel.substr(7)
}

// 获取页面相对路径，除了host部分
utils.getUrlRelativePath = () => {
  let url = location.href.toString()
  let arrUrl = url.split('//')
  let start = arrUrl[1].indexOf('/')
  let relUrl = arrUrl[1].substring(start)
  return relUrl
}

// 添加 cookie
// utils.addCookie = (name, value) => {
//   let exp = new Date()
//   exp.setTime(exp.getTime() + 1000 * 60 * 60 * 24 * 30)
//   document.cookie = `${name}=${value};expires=${exp.toGMTString()};path=/`
// }
utils.addCookie = (name, value, expireHours = 24 * 30) => {
  var cookieString = name + '=' + value
  // var cookieString = name + '=' + escape(value)
  // 判断是否设置过期时间
  if (expireHours > 0) {
    var date = new Date()
    date.setTime(date.getTime + expireHours * 3600 * 1000)
    cookieString = cookieString + '; expire=' + date.toGMTString()
  }
  document.cookie = cookieString
}

utils.getCookie = (name) => {
  var strCookie = document.cookie
  var arrCookie = strCookie.split('; ')
  for (var i = 0; i < arrCookie.length; i++) {
    var arr = arrCookie[i].split('=')
    if (arr[0] == name) return arr[1]
  }
  return ''
}

utils.deleteCookie = (name) => {
  var date = new Date()
  date.setTime(date.getTime() - 10000)
  document.cookie = name + '=v; expire=' + date.toGMTString()
}

/**
 * 使用循环的方式判断一个元素是否存在于一个数组中
 * @param {Object} arr 数组
 * @param {Object} value 元素值
 */
utils.isInArray = (arr, value) => {
  for (var i = 0; i < arr.length; i++) {
    if (value === arr[i]) {
      return true
    }
  }
  return false
}

// 跳转到红包增强展示页面
utils.goPrizeExtend = () => {
  window.location.href = 'https://www.bitcv.com/applyCooperation/prizeExtend/funShow?packetId=3'
}

// 跳转下载页面
utils.downloadApp = () => {
  if (env.platform == 'desktop') {
    window.location.href = 'https://rrex.com/index.html#/register'
  } else {
    window.location.href = 'https://rrex.com/pages/appDownload?action=autoDownload'
  }
}

utils.getPrizeLimitDesc = (limitType) => {
  let text = ''
  switch (limitType) {
    case 0:
      text = i18n.t('text.common_noLimited')
      break
    case 1:
      text = i18n.t('text.common_newUser')
      break
    case 2:
      text = i18n.t('text.common_qualifyUser')
      break
    case 3:
      text = i18n.t('text.common_genMember')
      break
    case 4:
      text = i18n.t('text.common_lockMember')
      break
    case 5:
      text = i18n.t('text.common_contractMember')
      break
    default:
      text = i18n.t('text.common_noLimited')
  }
  return text
}

export default utils
