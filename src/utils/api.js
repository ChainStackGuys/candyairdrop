/**
 * 开发接口列表
 */

// 基本数据接口
const baseApi = {
  appName: process.env.VUE_APP_APPNAME,
  domain: '', // 根域名

  getWxConfig: '/base/wxConfig', // 获取微信jssdk配置
  relayPacketMetaTx: '/base/relayPacketMetaTx', // 进行元交易
  relaySecretPacketMetaTx: '/base/relaySecretPacketMetaTx', // 进行元交易
  checkWords: '/base/checkWords', // 进行元交易
  getVcode: '/packet/vcode', // 获取验证码
  login: '/packet/login', // 登录
  getVcodev2: '/packet/vcodev2', // 获取验证码
  loginv2: '/packet/loginv2', // 登录

  getUserData: '/packet/user', // 获取用户信息
  getCurrencies: '/packet/currencies', // 获取币种列表
  sendPrize: '/packet/send', // 发红包
  getPrizeStatus: '/packet/status', // 获取红包状态
  openPrize: '/packet/claim', // 领红包
  getPrizeDetail: '/packet/detail', // 获取糖包详情
  getPrizeRecord: '/packet/records', // 获取单个糖包的领取记录
  getSendRecord: '/packet/mySendRecords', // 发红包记录
  getOpenRecord: '/packet/myClaimRecords', // 抢红包记录

  error: '/api/hb/error', // 错误日志
  statClick: '/api/stat/click' // 事件统计
}

module.exports = baseApi
