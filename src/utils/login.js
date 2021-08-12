/**
 * RREx 登录跳转
 */
export default function login () {
  if (process.env.NODE_ENV === 'production') {
    window.location.replace(`/pages/webLogin/?rurl=${encodeURIComponent(window.location.href)}`)
  } else {
    alert('需要登录，请把 token 放入 localStorage 中进行测试，如： token: Bearer 12345.abcde.ABCDE')
  }
}
