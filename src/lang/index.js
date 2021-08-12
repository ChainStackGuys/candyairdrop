import Vue from 'vue'
import VueI18n from 'vue-i18n'

Vue.use(VueI18n)
export function getLang () {
  let lang = 'cn'
  if (navigator.languages != undefined) { lang = navigator.languages[0] } else { lang = navigator.language }
  lang = lang.substr(0, 2)
  if (lang === 'zh') lang = 'cn'
  if (lang !== 'cn' && lang !== 'en' && lang !== 'jp') {
    lang = 'en'
  }
  return lang
}
VueI18n.locale = getLang()
export default new VueI18n({
  locale: getLang(),
  fallbackLocale: 'cn',
  messages: {
    cn: require('./' + getLang()) // 默认中文语言包，其他语言包异步加载
  }
})
