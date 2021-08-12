import Web3 from 'web3'
import ERC20ABI from '../abis/ERC20ABI'
import { getWeb3, getWeb3NetworkResult } from './getWeb3'
import tokens from '../assets/tokens.json'
import PrizedropAbi from '../abis/Prizedrop.json'

import GetBalancerAbi from '../abis/BalanceChecker.json'
import store from '../store'
import Mint from 'mint-ui'
import { BigNumber, FixedNumber } from '@ethersproject/bignumber'
import WalletConnectProvider from '@walletconnect/web3-provider'
const Gsn = require('@opengsn/gsn')

let proxyGetBalancerAddress = process.env.VUE_APP_PROXY_GETBALANCER
let proxyPrizedropAddress = process.env.VUE_APP_PROXY_CANDYDROP

// let gasPricesArray = [
//   { label: 'fast', value: '21' },
//   { label: 'standard', value: '21' },
//   { label: 'slow', value: '21' },
//   { label: 'instant', value: '21' }
// ]

const getTokenDecimals = async ({ web3Instance, tokenAddress }) => {
  const web3 = new Web3(web3Instance.currentProvider)
  const token = new web3.eth.Contract(ERC20ABI, tokenAddress)
  return await token.methods.decimals().call()
}

async function getGasPrices () {
  store.state.prize.selectedGasPrice = 2 // data.slow
  // let gasPricePromise = fetch('https://gasprice.poa.network/').then((response) => {
  //   return response.json()
  // }).then((data) => {
  //   gasPricesArray.map((v) => {
  //     v.value = data[v.label]
  //     v.label = `${v.label}: ${data[v.label]} gwei`
  //     return v
  //   })
  //   store.state.prize.selectedGasPrice = 2 // data.slow
  // }).catch((e) => {
  //   Mint.Toast('get Gas Prices ' + e)
  //   // console.error(e)
  // })

  // return gasPricePromise
}
async function initWeb3Config (web3Config) {
  const { web3Instance, defaultAccount } = web3Config
  store.state.web3.defaultAccount = defaultAccount
  const web3 = new Web3(web3Instance.currentProvider)
  store.state.web3.web3Instance = web3
  store.state.web3.prizedroper = new web3.eth.Contract(PrizedropAbi, proxyPrizedropAddress)
  store.state.web3.explorerUrl = web3Config.explorerUrl
  store.state.web3.mainSymbol = web3Config.mainSymbol
  store.state.web3.userTokens = await getUserTokens(defaultAccount)
  store.state.web3.mainDecimal = web3Config.mainDecimal
  getGasPrices()
}

const getWeb3Promise = getWeb3().then(async (web3Config) => {
  initWeb3Config(web3Config)
  // console.log('web3 loaded')
}).catch((e) => {
  // Mint.Toast('Please Connect Wallet first')
})

let getWalletConnectWeb3 = async (needRelay) => {
  let provider
  try {
    provider = new WalletConnectProvider({
      rpc: {
        128: 'https://http-mainnet-node.huobichain.com',
        256: 'https://http-testnet.hecochain.com'
      },
      qrcodeModalOptions: {
        mobileLinks: [
          'bitkeep',
          'metamask',
          'tokenpocket',
          'huobi',
          'aolink',
          'rrstore',
          'trust',
          'onto'
        ]
      }
    }
    )
    provider.on('accountsChanged', async (accounts) => {
      if (accounts.length > 0) {
        store.state.web3.defaultAccount = accounts[0]
        // console.log(store.state.web3)
      }
    })
    // Subscribe to chainId change
    provider.on('chainChanged', (chainId) => {
      // console.log(chainId)
    })
    // Subscribe to session connection
    provider.on('connect', async () => {
      // console.log('connect')
    })

    // Subscribe to session disconnection
    provider.on('disconnect', (code, reason) => {
      // console.log(code + reason)
    })
    // if (this.env.isInWx) {
    //   this.$toast('Some wallet need to be open in browser')
    // }
    if (!provider.wc.connected) {
      await provider.wc.createSession({
        chainId: 128
      })
    }
    await provider.enable()

    //  Create Web3
    const interval = setInterval(async () => {
      if (store.state.web3.defaultAccount) {
        let web3 = new Web3(provider)
        if (needRelay) {
          let RelayProvider = Gsn.RelayProvider
          const gsnConfig = {
            loggerConfigration: {
              logLevel: 'debug'
            },
            paymasterAddress: process.env.VUE_APP_RELAY_PAYMASTER
          }
          var reprovider = RelayProvider.newProvider({ provider: web3.currentProvider, config: gsnConfig })
          await reprovider.init()
          web3.setProvider(reprovider)
        }
        window.web3 = web3
        store.state.web3.web3Instance = web3
        store.state.web3.prizedroper = new web3.eth.Contract(PrizedropAbi, proxyPrizedropAddress)
        // console.log(JSON.stringify(store.state.web3.defaultAccount))
        let chainId = await web3.eth.getChainId()
        // console.log(chainId)
        let web3Config = await getWeb3NetworkResult(chainId)
        initWeb3Config(web3Config)
        // console.log(store.state.web3.defaultAccount)
        clearInterval(interval)
      }
    }, 3000)
  } catch (e) {
    const errorMsg = 'Cannot collect wallet connect'
    Mint.Toast(errorMsg)
    // console.log(errorMsg + e)
    return
  }
  return provider
}
function getTokenInfoBySymbol (symbol) {
  for (let idx in tokens) {
    let token = tokens[idx]
    if (symbol && token.symbol.toLowerCase() == symbol.toLowerCase()) {
      return token
    }
  }
}
function getTokenInfo (tokenAddress) {
  for (let idx in tokens) {
    let token = tokens[idx]
    if (tokenAddress.toLowerCase() == '0x000000000000000000000000000000000000beef') {
      if (token.address == '0x0000000000000000000000000000000000000000') {
        return token
      }
    } else {
      if (token.address.toLowerCase() == tokenAddress.toLowerCase()) {
        return token
      }
    }
  }
}

async function getUserTokens (defaultAccount) {
  const getbalancer = new store.state.web3.web3Instance.eth.Contract(GetBalancerAbi, proxyGetBalancerAddress)

  let addresses = []
  let addressmap = {}
  for (let token in tokens) {
    addresses.push(tokens[token].address)
    addressmap[tokens[token].address] = tokens[token]
  }

  let result = await getbalancer.methods.balances([defaultAccount], addresses).call()
  let userTokens = []
  for (let i in result) {
    if (parseInt(result[i]) > 0) {
      let decimal = BigNumber.from(tokens[i].decimal)

      let balance = FixedNumber.from(BigNumber.from(result[i]).mul(BigNumber.from(1000)).div(BigNumber.from(10).pow(decimal)).toNumber()).divUnsafe(FixedNumber.from(1000))
      let value = tokens[i].address
      let label = tokens[i].symbol + '-' + value + '(' + balance + ')'
      if (value === '0x0000000000000000000000000000000000000000') {
        value = '0x000000000000000000000000000000000000bEEF'
        label = 'HT - HECO Native Currency'
      }

      userTokens.push({
        label,
        value,
        balance,
        currency: tokens[i].symbol,
        iconUrl: tokens[i].logoURI,
        decimal: tokens[i].decimal,
        precision: 4,
        minAmount: 0,
        address: value
      })
    }
  }
  // console.log(result)
  return userTokens
}

export {
  getTokenDecimals,
  getUserTokens,
  getWeb3Promise,
  getTokenInfo,
  getTokenInfoBySymbol,
  getGasPrices,
  initWeb3Config,
  getWalletConnectWeb3
}
