import { totalApproveAmount /* standardInHex */ } from './tokenPrize'
import { getTokenInfo } from './getToken'
import store from '../store'
import Mint from 'mint-ui'
import Web3Utils from 'web3-utils'
import ERC20ABI from '../abis/ERC20ABI'
import Vue from 'vue'
// import request from '@/request'
// import api from '@/utils/api'

import { BigNumber } from '@ethersproject/bignumber'
let proxyPrizedropAddress = process.env.VUE_APP_PROXY_CANDYDROP

async function resetSend () {
  store.state.send.txs = []
  store.state.send.txHashToIndex = {}
  store.state.send.approval = ''
  store.state.send.seed = 0
  store.state.send.secret = ''
  store.state.send.keepRunning = false
  clearInterval(store.state.send.interval)
}

async function resetOpen () {
  store.state.open.txs = []
  store.state.open.txHashToIndex = {}
  store.state.open.keepRunning = false
  clearInterval(store.state.open.interval)
}

function doApprove () {
  store.state.send.keepRunning = true
  store.state.send.txs = []
  store.state.send.approval = ''
  if (store.state.prize.totalBalance > store.state.prize.allowance) {
    _approve()
    const interval = setInterval(() => {
      const index = store.state.send.txHashToIndex[store.state.send.approval]
      // console.log('checking autorun', index, store.state.send.approval, store.state.send.txHashToIndex, store.state.send.txs)
      if (store.state.send.approval) {
        if (store.state.send.txs[index] && store.state.send.txs[index].status === 'mined') {
          clearInterval(interval)
          setTimeout(() => {
            sendPrize()
          }, 1000)
        }
      }
    }, 3000)
    store.state.send.interval = interval
  } else {
    Vue.$indicator.close()
    Mint.Toast(`You have already approved the use of ${store.state.prize.tokenSymbol} with ${store.state.prize.totalBalance}`)
  }
}

async function doSend () {
  store.state.send.keepRunning = true
  store.state.send.txs = []
  store.state.send.approval = ''
  if (store.state.prize.totalBalance > store.state.prize.allowance) {
    doApprove()
  } else {
    sendPrize()
  }
}

async function _approve () {
  const index = store.state.send.txs.length
  const web3 = store.state.web3.web3Instance
  const token = new web3.eth.Contract(ERC20ABI, store.state.prize.tokenAddress)
  try {
    return token.methods['approve(address,uint256)'](proxyPrizedropAddress, totalApproveAmount())
      .send({ from: store.state.web3.defaultAccount, gasPrice: 1000000000 /* standardInHex() */ })
      .on('transactionHash', (hash) => {
        store.state.send.approval = hash
        store.state.send.txHashToIndex[hash] = index
        store.state.send.txs[index] = { status: 'pending', name: `Hizone Prize Approval to spend ${store.state.prize.totalBalance} ${store.state.prize.tokenSymbol}`, hash }
        getTxStatus(hash)
      })
      .on('error', (error) => {
        Vue.$indicator.close()
        Mint.Toast('In _approve:' + error.message)
        // console.error(error)
      })
  } catch (e) {
    //    console.error(e)
    Vue.$indicator.close()
    Mint.Toast('Out _approve:' + e)
  }
}

async function sendPrize () {
  if (!store.state.send.keepRunning) {
    return
  }
  const tokenAddress = store.state.prize.tokenAddress
  let { packetType, packetAmount, packetCount, currentFee, totalBalance, secret, limitToken, limitAmount } = store.state.prize
  let lToken = getTokenInfo(limitToken)
  let lDecimal = lToken.decimal
  limitAmount = BigNumber.from(parseInt(limitAmount * 100000)).mul(BigNumber.from(10).pow(lDecimal)).div(BigNumber.from(100000))
  if (limitAmount.isZero()) {
    limitToken = '0x0000000000000000000000000000000000000000'
  } else if (lToken.address == '0x0000000000000000000000000000000000000000') {
    limitToken = '0x000000000000000000000000000000000000bEEF'
  } else {
    limitToken = lToken.address
  }

  const decimals = BigNumber.from(store.state.prize.tokenDecimal)
  packetAmount = BigNumber.from(parseInt(packetAmount * 100000)).mul(BigNumber.from(10).pow(decimals)).div(BigNumber.from(100000))

  let ethValue
  if (tokenAddress === '0x000000000000000000000000000000000000bEEF') {
    ethValue = parseFloat(currentFee) + totalBalance
  } else {
    ethValue = currentFee
  }
  const web3 = store.state.web3.web3Instance
  const prizedroper = store.state.web3.prizedroper
  if (secret) {
    try {
      let encodedData = await prizedroper.methods.sendSecretPacketWithLimit(tokenAddress,
        secret, packetType, packetAmount, packetCount, limitToken, limitAmount).encodeABI({ from: store.state.web3.defaultAccount })
      let gas = await web3.eth.estimateGas({
        from: store.state.web3.defaultAccount,
        data: encodedData,
        value: Web3Utils.toHex(Web3Utils.toWei(ethValue.toString())),
        to: proxyPrizedropAddress
      })
      prizedroper.methods.sendSecretPacketWithLimit(tokenAddress, secret, packetType, packetAmount, packetCount, limitToken, limitAmount)
        .send({
          from: store.state.web3.defaultAccount,
          gasPrice: 5000000000,
          value: Web3Utils.toHex(Web3Utils.toWei(ethValue.toString())),
          gas: Web3Utils.toHex(gas)
        })
        .on('transactionHash', (hash) => {
          store.state.send.txHashToIndex[hash] = store.state.send.txs.length
          store.state.send.txs.push({
            status: 'pending',
            name: `生成 ${packetCount} 个总额度为 ${store.state.prize.packetAmount}  ${store.state.prize.tokenSymbol} 的口令红包中...`,
            hash
          })
          getTxStatus(hash)
          // console.log(packetId)
        })
        .on('error', (error) => {
          Vue.$indicator.close()
          Mint.Toast('In sendPrize:' + error.message)
          // console.log(error)
        })
    } catch (e) {
      // console.error(e)
      Vue.$indicator.close()
      if (e.message.indexOf('insufficient') !== -1) {
        Mint.Toast('您的矿工和服务费(0.1HT)可能不足')
      } else {
        Mint.Toast('Out sendPrize:' + e)
      }
    }
  } else {
    try {
      let seed = Math.ceil(Math.random() * 1000000)
      store.state.send.seed = seed
      let encodedData = await prizedroper.methods.sendSeedPacketWithLimit(tokenAddress,
        seed, packetType, packetAmount, packetCount, limitToken, limitAmount).encodeABI({ from: store.state.web3.defaultAccount })
      let gas = await web3.eth.estimateGas({
        from: store.state.web3.defaultAccount,
        data: encodedData,
        value: Web3Utils.toHex(Web3Utils.toWei(ethValue.toString())),
        to: proxyPrizedropAddress
      })
      // console.log('gas', gas)
      prizedroper.methods.sendSeedPacketWithLimit(tokenAddress, seed, packetType, packetAmount, packetCount, limitToken, limitAmount)
        .send({
          from: store.state.web3.defaultAccount,
          gasPrice: 5000000000, // standardInHex(),
          // gasLimit: 250000,
          gas: Web3Utils.toHex(gas),
          value: Web3Utils.toHex(Web3Utils.toWei(ethValue.toString()))
        })
        .on('transactionHash', (hash) => {
          store.state.send.txHashToIndex[hash] = store.state.send.txs.length
          store.state.send.txs.push({
            status: 'pending',
            name: `生成 ${packetCount} 个总额度为 ${store.state.prize.packetAmount}  ${store.state.prize.tokenSymbol} 的红包中...`,
            hash
          })
          getTxStatus(hash)
          // console.log(packetId)
        })
        .on('error', (error) => {
          Vue.$indicator.close()
          Mint.Toast('In sendPrize:' + error.message)
          // console.log(error)
        })
    } catch (e) {
      Vue.$indicator.close()
      if (e.message.indexOf('insufficient') !== -1) {
        Mint.Toast('您的矿工和服务费(0.1HT)可能不足')
      } else {
        Mint.Toast('Out sendPrize:' + e)
      }
    }
  }
}
async function claimSecretPacket (secret) {
  resetOpen()
  store.state.open.keepRunning = true
  const web3 = store.state.web3.web3Instance
  const prizedroper = store.state.web3.prizedroper
  try {
  //  console.log(store.state.web3)
    let encodedData = await prizedroper.methods.claimSecretPacket(secret).encodeABI({ from: store.state.web3.defaultAccount })
    let gas = await web3.eth.estimateGas({
      from: store.state.web3.defaultAccount,
      data: encodedData,
      to: proxyPrizedropAddress
    })
    // console.log('gas', gas)
    prizedroper.methods.claimSecretPacket(secret)
      .send({
        from: store.state.web3.defaultAccount,
        gasPrice: 2000000000, // standardInHex(),
        gas: Web3Utils.toHex(gas)
      })
      .on('transactionHash', (hash) => {
        store.state.open.txHashToIndex[hash] = store.state.send.txs.length
        store.state.open.txs.push({
          status: 'pending',
          name: '正在打开红包中...',
          hash
        })
        getOpenTxStatus(hash)
      })
      .on('error', (error) => {
        Vue.$indicator.close()
        // console.error(error)
        Mint.Toast('您可能不符合持仓限制或者稍后重试：' + error.message)
        // Mint.Toast('In claimSecretPacket:' + error.message)
      })
  } catch (e) {
    // console.error(e)
    if (e.message.indexOf('only claim once') !== -1) {
      Vue.$indicator.close()
      Mint.Toast('您已经领取过了')
      store.state.open.myAmount = -2
    } else if (e.message.indexOf('no remain left') !== -1) {
      Vue.$indicator.close()
      Mint.Toast('已经被抢光了')
      store.state.open.myAmount = -4
    } else if (e.message.indexOf('balance not fit the need') !== -1) {
      Vue.$indicator.close()
      Mint.Toast('您不符合持仓限制')
      store.state.open.myAmount = -6
    } else {
      Vue.$indicator.close()
      Mint.Toast('您可能已经领取过了或者抢光了')
      store.state.open.myAmount = -8
    }
    // console.error(e)
  }
}

async function claimPacket (seed, packetId) {
  resetOpen()
  store.state.open.keepRunning = true
  const web3 = store.state.web3.web3Instance
  const prizedroper = store.state.web3.prizedroper
  try {
  //  console.log(store.state.web3)
    let encodedData = await prizedroper.methods.claimSeedPacket(packetId, seed).encodeABI({ from: store.state.web3.defaultAccount })
    let gas = await web3.eth.estimateGas({
      from: store.state.web3.defaultAccount,
      data: encodedData,
      to: proxyPrizedropAddress
    })
    // console.log('gas', gas)
    prizedroper.methods.claimSeedPacket(packetId, seed)
      .send({
        from: store.state.web3.defaultAccount,
        gasPrice: 2000000000, // standardInHex(),
        gas: Web3Utils.toHex(gas)
      })
      .on('transactionHash', (hash) => {
        store.state.open.txHashToIndex[hash] = store.state.send.txs.length
        store.state.open.txs.push({
          status: 'pending',
          name: '正在打开红包中...',
          hash
        })
        getOpenTxStatus(hash)
      })
      .on('error', (error) => {
        Vue.$indicator.close()
        Mint.Toast('In claimPacket:' + error.message)
      //    console.log(error)
      })
  } catch (e) {
    // console.error(e)
    if (e.message.indexOf('only claim once') !== -1) {
      Vue.$indicator.close()
      Mint.Toast('您已经领取过了')
      store.state.open.myAmount = -1
    } else if (e.message.indexOf('no remain left') !== -1) {
      Vue.$indicator.close()
      Mint.Toast('已经被抢光了')
      store.state.open.myAmount = -3
    } else if (e.message.indexOf('balance not fit the need') !== -1) {
      Vue.$indicator.close()
      Mint.Toast('您不符合持仓限制')
      store.state.open.myAmount = -5
    } else {
      Vue.$indicator.close()
      Mint.Toast('您可能已经领取过了或者抢光了')
      store.state.open.myAmount = -7
    }
    // console.error(e)
  }
}

async function setPacketLimit (packetId, limitToken, limitAmount) {
  store.state.chainop.keepRunning = true
  const web3 = store.state.web3.web3Instance
  const prizedroper = store.state.web3.prizedroper
  try {
  //  console.log(store.state.web3)
    let lToken = getTokenInfo(limitToken)
    let lDecimal = lToken.decimal
    let lAmount = BigNumber.from(parseInt(limitAmount * 100000)).mul(BigNumber.from(10).pow(lDecimal)).div(BigNumber.from(100000))
    if (lAmount.isZero()) {
      lToken = '0x0000000000000000000000000000000000000000'
    } else if (lToken.address == '0x0000000000000000000000000000000000000000') {
      lToken = '0x000000000000000000000000000000000000bEEF'
    } else {
      lToken = lToken.address
    }
    let encodedData = await prizedroper.methods.setPacketLimit(packetId, lToken, lAmount).encodeABI({ from: store.state.web3.defaultAccount })
    let gas = await web3.eth.estimateGas({
      from: store.state.web3.defaultAccount,
      data: encodedData,
      to: proxyPrizedropAddress
    })
    // console.log('gas', gas)
    prizedroper.methods.setPacketLimit(packetId, lToken, lAmount)
      .send({
        from: store.state.web3.defaultAccount,
        gasPrice: 1000000000, // standardInHex(),
        // gasLimit: 250000
        gas: Web3Utils.toHex(gas)
      })
      .on('transactionHash', (hash) => {
        store.state.chainop.hash = hash
        store.state.chainop.status = 'pending'
        store.state.chainop.message = '正在设置限额中...'
        getOpTxStatus(hash)
      })
      .on('error', (error) => {
        // console.error(error)
        Vue.$indicator.close()
        Mint.Toast('In setPacketLimit:' + error.message)
        // console.log(error)
      })
  } catch (e) {
    // console.error(e)
    Vue.$indicator.close()
    Mint.Toast('out setPacketLimit' + e)
  }
}

async function recallPacket (packetId) {
  store.state.chainop.keepRunning = true
  const web3 = store.state.web3.web3Instance
  const prizedroper = store.state.web3.prizedroper
  try {
  //  console.log(store.state.web3)
    let encodedData = await prizedroper.methods.claimMyPacket(packetId).encodeABI({ from: store.state.web3.defaultAccount })
    let gas = await web3.eth.estimateGas({
      from: store.state.web3.defaultAccount,
      data: encodedData,
      to: proxyPrizedropAddress
    })
    // console.log('gas', gas)
    prizedroper.methods.claimMyPacket(packetId)
      .send({
        from: store.state.web3.defaultAccount,
        gasPrice: 1000000000, // standardInHex(),
        // gasLimit: 250000
        gas: Web3Utils.toHex(gas)
      })
      .on('transactionHash', (hash) => {
        store.state.chainop.hash = hash
        store.state.chainop.status = 'pending'
        store.state.chainop.message = '正在撤回中...'
        getOpTxStatus(hash)
      })
      .on('error', (error) => {
        Vue.$indicator.close()
        Mint.Toast('In recallPacket:' + error.message)
        // console.log(error)
      })
  } catch (e) {
    Vue.$indicator.close()
    Mint.Toast('out recallPacket' + e)
  }
}

async function getTxReceipt (hash) {
  // console.log('getTxReceipt')
  try {
    const web3 = store.state.web3.web3Instance
    const res = await web3.eth.getTransaction(hash)
    return res
  } catch (e) {
    // console.error(e)
    Vue.$indicator.close()
    Mint.Toast('getTxReceipt' + e)
  }
}
async function getOpTxStatus (hash) {
  // console.log('GET OPEN TX STATUS', hash)
  if (!store.state.chainop.keepRunning) {
    return
  }
  setTimeout(() => {
    const web3 = store.state.web3.web3Instance
    web3.eth.getTransactionReceipt(hash, (error, res) => {
      if (error) {
        // console.log(error)
        Vue.$indicator.close()
        Mint.Toast('getOpTxStatus' + error)
      } else {
        if (res && res.blockNumber) {
          if (res.status === '0x1' || res.status === true) {
            store.state.chainop.status = 'mined'
          } else {
            store.state.chainop.status = 'mined'
            store.state.chainop.message = 'Mined but with errors. Perhaps out of gas'
          }
        } else {
          getOpTxStatus(hash)
        }
      }
    }
    )
  }, 3000)
}

async function getOpenTxStatus (hash) {
  // console.log('GET OPEN TX STATUS', hash)
  if (!store.state.open.keepRunning) {
    return
  }
  setTimeout(() => {
    const web3 = store.state.web3.web3Instance
    web3.eth.getTransactionReceipt(hash, (error, res) => {
      if (error) {
        // console.log(error)
        Vue.$indicator.close()
        Mint.Toast('getOpenTxStatus' + error)
      } else {
        if (res && res.blockNumber) {
          if (res.status === '0x1' || res.status === true) {
            const index = store.state.open.txHashToIndex[hash]
            store.state.open.txs[index].status = 'mined'
          } else {
            const index = store.state.open.txHashToIndex[hash]
            store.state.open.txs[index].status = 'error'
            store.state.open.txs[index].name = 'Mined but with errors. Perhaps out of gas'
          }
        } else {
          getOpenTxStatus(hash)
        }
      }
    }
    )
  }, 3000)
}
async function getTxStatus (hash) {
  // console.log('GET TX STATUS', hash)
  if (!store.state.send.keepRunning) {
    return
  }
  setTimeout(() => {
    const web3 = store.state.web3.web3Instance
    web3.eth.getTransactionReceipt(hash, (error, res) => {
      if (error) {
        // console.log(error)
        Vue.$indicator.close()
        Mint.Toast('getTxStatus' + error)
      } else {
        if (res && res.blockNumber) {
          if (res.status === '0x1' || res.status === true) {
            const index = store.state.send.txHashToIndex[hash]
            store.state.send.txs[index].status = 'mined'
          } else {
            const index = store.state.send.txHashToIndex[hash]
            store.state.send.txs[index].status = 'error'
            store.state.send.txs[index].name = 'Mined but with errors. Perhaps out of gas'
          }
        } else {
          getTxStatus(hash)
        }
      }
    }
    )
  }, 3000)
}

export {
  doSend,
  resetSend,
  getTxReceipt,
  resetOpen,
  recallPacket,
  claimPacket,
  claimSecretPacket,
  setPacketLimit
}
