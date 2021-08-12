import { getWeb3Promise, getGasPrices } from './getToken'
import store from '../store'
import Mint from 'mint-ui'
import ERC20ABI from '../abis/ERC20ABI'

import Web3Utils from 'web3-utils'
import { BigNumber, FixedNumber } from '@ethersproject/bignumber'
let proxyPrizedropAddress = process.env.VUE_APP_PROXY_CANDYDROP

async function getDecimals (address) {
  try {
    const web3 = store.state.web3.web3Instance
    const token = new web3.eth.Contract(ERC20ABI, address)
    let decimals = await token.methods.decimals().call()
    store.state.prize.tokenDecimal = decimals
    return decimals
  } catch (e) {
    Mint.Toast('Cannot get decimals for token contract.\n Please make sure you are on the right network and token address exists')
  }
}

async function getBalance () {
  try {
    const web3 = store.state.web3.web3Instance
    const token = new web3.eth.Contract(ERC20ABI, store.state.prize.tokenAddress)
    let defAccTokenBalance = await token.methods.balanceOf(store.state.web3.defaultAccount).call()
    defAccTokenBalance = FixedNumber.from(BigNumber.from(defAccTokenBalance).mul(BigNumber.from(100000)).div(multiplier())).divUnsafe(FixedNumber.from(100000)).toString()
    store.state.prize.defAccTokenBalance = defAccTokenBalance
    return defAccTokenBalance
  } catch (e) {
    Mint.Toast(`${store.state.web3.defaultAccount} doesn't have token balance.\n Please make sure you are on the right network and token address exists`)
  }
}
async function getEthBalance () {
  try {
    const web3 = store.state.web3.web3Instance
    let ethBalance = await web3.eth.getBalance(store.state.web3.defaultAccount)
    ethBalance = Web3Utils.fromWei(ethBalance)
    ethBalance = FixedNumber.from(ethBalance).round(3).toString()
    store.state.prize.ethBalance = ethBalance
    return ethBalance
  } catch (e) {
    Mint.Toast('Get eth balance error')
  }
}
async function getTokenSymbol (address) {
  try {
    const web3 = store.state.web3.web3Instance
    const token = new web3.eth.Contract(ERC20ABI, address)
    let tokenSymbol = await token.methods.symbol().call()
    store.state.prize.tokenSymbol = tokenSymbol
    return tokenSymbol
  } catch (e) {
    Mint.Toast('Token with this Address doesnt exist.\n Please make sure you are on the right network and token address exists')
  }
}
async function getAllowance () {
  try {
    const web3 = store.state.web3.web3Instance
    const token = new web3.eth.Contract(ERC20ABI, store.state.prize.tokenAddress)
    let allowance = await token.methods.allowance(store.state.web3.defaultAccount, proxyPrizedropAddress).call()
    allowance = FixedNumber.from(BigNumber.from(allowance).mul(BigNumber.from(100000)).div(multiplier())).divUnsafe(FixedNumber.from(100000)).toString()
    store.state.prize.allowance = allowance
    return allowance
  } catch (e) {
    Mint.Toast(`Token address doesn't have allowance method.\n Please make sure you are on the right network and token address exists.\n
         Your account: ${store.state.web3.defaultAccount}`)
  }
}
async function getPacketIdBySeed (seed) {
  try {
    if (!seed) {
      return
    }
    const prizedroper = store.state.web3.prizedroper
    let packetId = await prizedroper.methods.getSeedPacketId(seed).call()
    packetId = parseInt(packetId)
    // console.log(packetId)
    return packetId
  } catch (e) {
    Mint.Toast('getPacketIdBySeed Error')
  }
}
async function getPacketIdBySecret (secret) {
  try {
    if (!secret) {
      return
    }
    const prizedroper = store.state.web3.prizedroper
    let packetId = await prizedroper.methods.getSecretPacketId(secret).call()
    packetId = parseInt(packetId)
    // console.log(packetId)
    return packetId
  } catch (e) {
    Mint.Toast('getPacketIdBySecret Error')
  }
}
async function getMyAmount (packetId) {
  try {
    if (!packetId) {
      return
    }
    const prizedroper = store.state.web3.prizedroper
    let myAmount = await prizedroper.methods.getMyAmount(packetId, store.state.web3.defaultAccount).call()
    if (!myAmount) {
      myAmount = 0
    }
    store.state.open.myAmount = myAmount
    // console.log(myAmount)
    return myAmount
  } catch (e) {
    Mint.Toast('getMyAmount Error')
  }
}
async function getPacketInfo (packetId) {
  try {
    if (!packetId) {
      return
    }
    const prizedroper = store.state.web3.prizedroper
    let packet = await prizedroper.methods.packets(packetId).call()
    // console.log(packet)
    return packet
  } catch (e) {
    Mint.Toast('getPacketInfo Error')
  }
}
async function getMyPackets () {
  try {
    const prizedroper = store.state.web3.prizedroper
    const currentUser = store.state.web3.defaultAccount
    let packetIds = await prizedroper.methods.getUserPackets(currentUser).call()
    // console.log(packet)
    return packetIds
  } catch (e) {
    // console.error(e)
    Mint.Toast('获取历史红包失败，您可能没有发过红包')
  }
}
async function getClaimAddress (packetId) {
  try {
    if (!packetId) {
      return
    }
    const prizedroper = store.state.web3.prizedroper
    let addresses = await prizedroper.methods.getPacketAddresses(packetId).call()
    // console.log(addresses)
    return addresses
  } catch (e) {
    Mint.Toast('getClaimAddress Error')
  }
}
async function getClaimedAmounts (packetId) {
  try {
    if (!packetId) {
      return
    }
    const prizedroper = store.state.web3.prizedroper
    let balances = await prizedroper.methods.getClaimedAmounts(packetId).call()
    // console.log(balances)
    return balances
  } catch (e) {
    Mint.Toast('getClaimedAmounts Error')
  }
}
async function getClaimedTimestamps (packetId) {
  try {
    if (!packetId) {
      return
    }
    const prizedroper = store.state.web3.prizedroper
    let balances = await prizedroper.methods.getClaimedTimestamps(packetId).call()
    // console.log(balances)
    return balances
  } catch (e) {
    Mint.Toast('getClaimedTimestamps Error')
  }
}
async function getCurrentFee () {
  try {
    await getWeb3Promise.then(async () => {
      const prizedroper = store.state.web3.prizedroper
      let currentFee = await prizedroper.methods.currentFee(store.state.web3.defaultAccount).call()
      currentFee = Web3Utils.fromWei(currentFee)
      store.state.prize.currentFee = currentFee
      return currentFee
    })
  } catch (e) {
    // console.error(e)
    Mint.Toast('getCurrentFee Error')
  }
}

async function setTokenAddress (tokenAddress) {
  await getWeb3Promise.then(async () => {
    await getGasPrices()
    if (Web3Utils.isAddress(store.state.web3.defaultAccount) && tokenAddress !== '0x000000000000000000000000000000000000bEEF') {
      store.state.prize.tokenAddress = tokenAddress
      await getDecimals(tokenAddress)
      await getBalance()
      await getAllowance()
      await getCurrentFee()
      getTokenSymbol(tokenAddress)
      getEthBalance()
    } else {
      store.state.prize.tokenAddress = tokenAddress
      await getCurrentFee()
      await getEthBalance()

      store.state.prize.tokenSymbol = store.state.web3.mainSymbol
      store.state.prize.tokenDecimal = store.state.web3.mainDecimal
      store.state.prize.defAccTokenBalance = store.state.prize.ethBalance
    }
  })
}

function setTokenPrize (tokenAddress, packetType, packetAmount, packetCount, secret, limitToken, limitAmount) {
  store.state.prize.packetType = packetType
  store.state.prize.packetAmount = packetAmount
  store.state.prize.packetCount = packetCount
  store.state.prize.totalBalance = packetAmount
  store.state.prize.secret = secret
  if (tokenAddress === '0x000000000000000000000000000000000000bEEF') {
    store.state.prize.allowance = packetAmount
  }
  if (limitToken === '0x0000000000000000000000000000000000000000') {
    store.state.prize.limitToken = '0x000000000000000000000000000000000000bEEF'
  } else {
    store.state.prize.limitToken = limitToken
  }
  store.state.prize.limitAmount = limitAmount
}
function setDecimals (decimals) {
  store.state.prize.tokenDecimal = decimals
}
function resetToken () {
  store.state.prize.tokenDecimal = ''
  store.state.prize.tokenAddress = ''
  store.state.prize.defAccTokenBalance = ''
  store.state.prize.allowance = ''
  store.state.prize.currentFee = ''
  store.state.prize.tokenSymbol = ''
  store.state.prize.ethBalance = ''
  store.state.prize.totalBalance = '0'
  store.state.prize.packetType = 0
  store.state.prize.packetAmount = 0
  store.state.prize.packetCount = 0
  store.state.prize.secret = ''
}
function totalBalanceWithDecimals () {
  let result = FixedNumber.from(store.state.prize.totalBalance).mulUnsafe(FixedNumber.from(multiplier())).round(0).toString()
  if (result.indexOf('.') !== -1) {
    result = result.split('.')[0]
  }
  return result
}

function totalApproveAmount () {
  let result = FixedNumber.from(Math.ceil(store.state.prize.totalBalance)).mulUnsafe(FixedNumber.from(5)).mulUnsafe(FixedNumber.from(multiplier())).round(0).toString()
  if (result.indexOf('.') !== -1) {
    result = result.split('.')[0]
  }
  return result
}

function multiplier () {
  const decimals = BigNumber.from(store.state.prize.tokenDecimal)
  return BigNumber.from(10).pow(decimals)
}

// function totalCostInEth () {
//   const standardGasPrice = Web3Utils.toWei(store.state.prize.selectedGasPrice.toString(), 'gwei')
//   const currentFeeInWei = Web3Utils.toWei(store.state.prize.currentFee)
//   const tx = BigNumber.from(standardGasPrice).mul(BigNumber.from('50000'))
//   const txFeeMiners = tx
//   let contractFee = BigNumber.from(currentFeeInWei)
//   return Web3Utils.fromWei(txFeeMiners.plus(contractFee).toString(10))
// }

function standardInHex () {
  const toWei = Web3Utils.toWei(store.state.prize.selectedGasPrice.toString(), 'gwei')
  return Web3Utils.toHex(toWei)
}
function setSelectedGasPrice (value) {
  store.state.prize.selectedGasPrice = value
}

//   getDecimals,
//    getBalance,
//    getEthBalance,
//   getTokenSymbol,
//  getAllowance,
//   getCurrentFee,
// setDecimals,
//  reset,
// totalBalanceWithDecimals,
//    multiplier,
// totalCostInEth,
//  getGasPrices,
// standardInHex,
// setSelectedGasPrice,

export {
  setTokenAddress,
  resetToken,
  totalBalanceWithDecimals,
  totalApproveAmount,
  standardInHex,
  setTokenPrize,
  setDecimals,
  // totalCostInEth,
  getGasPrices,
  setSelectedGasPrice,
  getClaimAddress,
  getPacketInfo,
  getClaimedAmounts,
  getClaimedTimestamps,
  getPacketIdBySeed,
  getPacketIdBySecret,
  getMyAmount,
  getMyPackets
}
