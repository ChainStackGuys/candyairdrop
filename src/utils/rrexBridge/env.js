// base variable and method
const ua = navigator.userAgent.toLowerCase() // navigator
// alert(ua)
let env = {}
// platform info
if (ua.indexOf('android') > -1 || ua.indexOf('Adr') > -1) {
  env.platform = 'android'
} else if (ua.indexOf('iphone') > -1 || ua.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)) {
  env.platform = 'ios'
} else {
  env.platform = 'desktop'
}
// alert(env.platform)
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

export default env
