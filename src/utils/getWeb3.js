import Web3 from 'web3'
const Gsn = require('@opengsn/gsn')

async function getWeb3NetworkResult (netId) {
  let netIdName, trustApiName, explorerUrl, mainSymbol, mainDecimal, results
  // console.log('netId', netId)
  switch (parseInt(netId)) {
    case 1:
      netIdName = 'Foundation'
      trustApiName = 'api'
      explorerUrl = 'https://etherscan.io'
      // console.log('This is Foundation', netId)
      mainSymbol = 'ETH'
      mainDecimal = 18
      break
    case 3:
      netIdName = 'Ropsten'
      trustApiName = 'ropsten'
      explorerUrl = 'https://ropsten.etherscan.io'
      // console.log('This is Ropsten', netId)
      mainSymbol = 'ETH'
      mainDecimal = 18
      break
    case 4:
      netIdName = 'Rinkeby'
      trustApiName = 'rinkeby'
      explorerUrl = 'https://rinkeby.etherscan.io'
      // console.log('This is Rinkeby', netId)
      mainSymbol = 'ETH'
      mainDecimal = 18
      break
    case 42:
      netIdName = 'Kovan'
      trustApiName = 'kovan'
      explorerUrl = 'https://kovan.etherscan.io'
      // console.log('This is Kovan', netId)
      mainSymbol = 'ETH'
      mainDecimal = 18
      break
    case 99:
      netIdName = 'POA Core'
      trustApiName = 'poa'
      explorerUrl = 'https://poaexplorer.com'
      // console.log('This is Core', netId)
      mainSymbol = 'ETH'
      mainDecimal = 18
      break
    case 77:
      netIdName = 'POA Sokol'
      trustApiName = 'https://trust-sokol.herokuapp.com'
      explorerUrl = 'https://sokol.poaexplorer.com'
      // console.log('This is Sokol', netId)
      mainSymbol = 'ETH'
      mainDecimal = 18
      break
    case 128:
      netIdName = 'HECO Mainet'
      trustApiName = 'HECO'
      explorerUrl = 'https://scan.hecochain.com'
      mainSymbol = 'HT'
      mainDecimal = 18
      break
    case 256:
      netIdName = 'HECO Testnet'
      trustApiName = 'HECOTest'
      explorerUrl = 'https://scan-testnet.hecochain.com'
      mainSymbol = 'HT'
      mainDecimal = 18
      break
    default:
      netIdName = 'Unknown'
      // console.log('This is an unknown network.', netId)
      mainSymbol = 'ETH'
      mainDecimal = 18
  }
  document.title = `${netIdName} - Hizone Prize dApp`
  const accounts = await window.web3.eth.getAccounts()
  var defaultAccount = accounts[0] || null
  if (defaultAccount === null) {
    return false
  }
  results = {
    web3Instance: window.web3,
    netIdName,
    netId,
    injectedWeb3: true,
    defaultAccount,
    trustApiName,
    explorerUrl,
    mainSymbol,
    mainDecimal
  }
  // console.log(results)
  return results
}
let getWeb3 = (needRelay) => {
  return new Promise(function (resolve, reject) {
    // Wait for loading completion to avoid race conditions with web3 injection timing.
    window.addEventListener('load', async function () {
      var results
      // Use Mist/MetaMask's provider.
      // var web3 = window.web3
      if (window.web3) {
        // web3 = new window.Web3(web3.currentProvider)
        let ua = window.navigator.userAgent
        if (ua.toLowerCase().indexOf('bitkeep') === -1) {
          if (window.ethereum) {
            window.web3 = new Web3(window.ethereum)
            await window.ethereum.enable()
          } else if (window.web3) {
            window.web3 = new Web3(window.web3.currentProvider)
          }
        } else {
          if (window.web3) {
            window.web3 = new Web3(window.web3.currentProvider)
          } else if (window.ethereum) {
            window.web3 = new Web3(window.ethereum)
            await window.ethereum.enable()
          }
        }
        if (needRelay) {
          let RelayProvider = Gsn.RelayProvider
          const gsnConfig = {
            loggerConfigration: {
              logLevel: 'debug'
            },
            paymasterAddress: process.env.VUE_APP_RELAY_PAYMASTER
          }
          var provider = RelayProvider.newProvider({ provider: window.web3.currentProvider, config: gsnConfig })
          await provider.init()
          window.web3.setProvider(provider)
        }

        if (window.web3.version && window.web3.version.getNetwork) {
          window.web3.version.getNetwork((err, netId) => {
            if (err) {
              reject(new Error('Get network error'))
            } else {
              results = getWeb3NetworkResult(netId)
              if (!results) {
                reject(new Error('Please unlock your metamask and refresh the page'))
              }
              resolve(results)
            }
          })
        } else {
          if (window.web3.eth.net) {
            var networkId = await window.web3.eth.net.getId()
            results = await getWeb3NetworkResult(networkId)
            if (!results) {
              reject(new Error('Please unlock your metamask and refresh the page'))
            }
            resolve(results)
          }
        }
        // console.log('Injected web3 detected.')
      } else {
        // Fallback to localhost if no web3 injection.
        const errorMsg = `Metamask is not installed. Please go to
        https://metamask.io and return to this page after you installed it`
        reject(new Error(errorMsg))
        // console.log('No web3 instance injected, using Local web3.')
        // console.error('Metamask not found')
      }
    })
  })
}

export {
  getWeb3,
  getWeb3NetworkResult
}
