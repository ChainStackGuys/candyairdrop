import Vue from 'vue'
import Vuex from 'vuex'
import * as actions from './actions'
import * as mutations from './mutations'
import rrexBridge from './modules/rrexBridge'

Vue.use(Vuex)

export default new Vuex.Store({
  actions,
  mutations,
  state: {
    token: '',
    // 网页启动的环境
    env: null,
    // 用户信息
    userData: null,
    // 记录用户首次进入的链接（ios端微信分享兼容性需要）
    entryUrl: '',
    // 目前支持的多语言选项 TODO_FEATURE
    // supportLanguages: ['cn', 'en', 'tc', 'jp'],
    supportLanguages: ['cn'],
    // 红包类型
    prizeType: 0, // { 0: '无特殊情况' },
    // 键盘是否显示的状态
    keyboardStatus: 0,
    // 保存web3账户信息
    web3: {
      defaultAccount: '',
      web3Instance: null,
      userTokens: [],
      explorerUrl: '',
      mainSymbol: '',
      mainDecimal: 0,
      prizedroper: null
    },
    prize: {
      tokenAddress: '',
      tokenDecimal: 0,
      defAccTokenBalance: 0,
      allowance: 0,
      ethBalance: 0,
      totalBalance: 0,
      currentFee: 0,
      tokenSymbol: '',
      selectedGasPrice: 0,
      packetType: 0,
      packetAmount: 0,
      packetCount: 0,
      secret: '',
      limitToken: '',
      limitAmount: 0
    },
    send: {
      txs: [],
      txHashToIndex: {},
      approval: '',
      keepRunning: false,
      interval: null,
      seed: 0,
      packetId: 0
    },
    open: {
      txs: [],
      txHashToIndex: {},
      keepRunning: false,
      interval: null,
      myAmount: 0
    },
    chainop: {
      hash: '',
      status: '',
      message: '',
      keepRunning: false
    }
  },
  modules: {
    rrexBridge
  }
})
