<template>
  <div class="page-container">

    <!-- 红包界面 -->
    <section v-if="pageStatus === 'ok'" class="prize-ctn">
      <transition name="bcvZoomIn">
        <section v-show='prizeVisible' class="prize" :class="{ 'prize-custom': false }">
          <!-- 区分默认红包与定制红包 -->
          <div class="prize-bg">
            <div class="prize-bg-header"></div>
          </div>
          <div class="prize-custom-bg">
            <img class="prize-custom-img" src="@/assets/img/avatar.jpg" alt="">
            <div class="prize-custom-footer">
              <div class="prize-custom-footer-decorate"></div>
              <div class="prize-custom-footer-color"></div>
            </div>
          </div>

          <div class="prize-info">
            <div class="avatar"><img :src="token.logoURI"></div>
            <p class="nickname">{{ token.symbol }}</p>
            <p v-if="packetId && this.owner" class="desc">{{ this.owner }} 的红包</p>

            <div v-else class="input-prizeSecret">
              <input v-resetInput v-watchKeyboard @change="checkWords" @blur="checkWords" type="text" max='256' class="sinput" :placeholder="$t('text.page_prizeSend_input_phrase')" v-model="secret">
              <button class="btn" @click="openPrize">{{$t("text.page_title_openNow")}}</button>
            </div>

            <template v-if="pageData.status === 'doing'">
              <button class="btn" @click="openPrize">{{$t("text.page_title_openNow")}}</button>
            </template>
            <template v-else-if="pageData.status === 'empty' || pageData.status == 'recall'">
              <!-- 手慢了红包已被抢光 -->
              <p class="status">{{ $t('text.page_prizeOpen_prizeHaveBeenReceived') }}</p>
            </template>
            <template v-else-if="pageData.status === 'overdue'">
              <!-- 红包已超过24小时 已失效 -->
              <p class="status">{{ $t('text.page_prizeShare_prizeMoreThan24h') }}<br>{{ $t('text.page_prizeShare_expired') }}</p>
            </template>
          </div>
        </section>
      </transition>

      <!-- 红包领取记录 -->
      <prizeRecordList
        v-show="addresses.length"
        :packetId="parseInt(packetId)"
        :isSender="pageData.isSender"
        :noRecordVisible="false"
      ></prizeRecordList>
    </section>
    <section v-else-if="!account" class="prize-ctn">
      <transition name="bcvZoomIn">
        <section class="prize" :class="{ 'prize-custom': false }">
          <!-- 区分默认红包与定制红包 -->
          <div class="prize-bg">
            <div class="prize-bg-header"></div>
          </div>
          <div class="prize-custom-bg">
            <img class="prize-custom-img" src="@/assets/img/avatar.jpg" alt="">
            <div class="prize-custom-footer">
              <div class="prize-custom-footer-decorate"></div>
              <div class="prize-custom-footer-color"></div>
            </div>
          </div>

          <div class="prize-info">
            <div class="avatar"><img :src="token.logoURI"></div>
            <p class="nickname">{{token.symbol}}</p>
            <p class="desc"></p>

            <template>
              <button class="btn" @click="connect">{{$t("text.page_prizeSend_connect_wallet")}}</button>
            </template>
          </div>
        </section>
      </transition>
    </section>
    <pageLoading v-else color="#EF4E4C"></pageLoading>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import prizeRecordList from '@/components/prizeRecordList'
import { getTokenInfo, getTokenInfoBySymbol, getWalletConnectWeb3, initWeb3Config } from '../utils/getToken'
import { getPacketIdBySeed, getPacketIdBySecret, getClaimAddress, getPacketInfo } from '../utils/tokenPrize'
import { claimPacket, claimSecretPacket } from '../utils/sendPrize'
import { getWeb3 } from '../utils/getWeb3'
import utils from '../utils/utils'

const getWeb3PromiseRelay = getWeb3(false).then(async (web3Config) => {
  initWeb3Config(web3Config)
  // console.log('web3 loaded')
}).catch((e) => {
  // Mint.Toast('Please Connect Wallet first')
})
export default {
  name: 'prizeOpen',
  data () {
    return {
      pageStatus: '',
      pageData: {},
      // status 红包状态 { doing: '可抢', empty: '抢完', overdue: '24h过期' }
      prizeVisible: false,
      seed: parseInt(this.$route.query.seed), // 红包ID
      secret: this.$route.query.secret,
      packetId: this.$route.query.packetId,
      symbol: this.$route.query.symbol ?? '数字资产',
      shareInfo: null,
      token: this.$route.query.symbol ? getTokenInfoBySymbol(this.$route.query.symbol) : null,
      account: '',
      owner: '',
      addresses: []
    }
  },
  computed: {
    ...mapState(['env'])
  },
  components: {
    prizeRecordList
  },
  created () {
    this.fetchPageData()
  },
  methods: {
    initSymbol () {
      if (!this.symbol) {
        this.symbol = 'HBTC'
      }
      this.token = getTokenInfoBySymbol(this.symbol)
    },
    async connect () {
      if (this.env.isInWx) {
        this.$toast('微信中请在浏览器中打开，谢谢')
        return
      }
      getWalletConnectWeb3(true)
      var that = this
      const interval = setInterval(async () => {
        if (that.$store.state.web3.web3Instance) {
          that.account = utils.formatShortHash(that.$store.state.web3.defaultAccount)
          await that.reloadData()
          clearInterval(interval)
        }
      }, 2000)
    },
    checkWords () {
      if (!this.secret) {
        return
      }
      this.$http.post(this.$api.checkWords, {
        words: this.secret
      })
        .then(res => {
          if (res.data.data.code == 0) {
            // this.$toast(res.data.data.msg)
          } else {
            this.secret = ''
            this.$toast(`${this.$t('text.common_notice')}: ${res.data.data.msg}`)
          }
        })
        .catch(() => {
          // this.$toast('出错了')
        })
    },
    async reloadData () {
      console.log(this.$store.state.web3)
      if (this.$store.state.web3.web3Instance) {
        if (this.seed || this.secret) {
          let packetId = 0
          if (this.seed) {
            packetId = await getPacketIdBySeed(this.seed)
          } else {
            packetId = await getPacketIdBySecret(this.secret)
          }
          if (packetId) {
            this.packetId = packetId

            this.addresses = await getClaimAddress(this.packetId)
            console.log(this.addresses)
            for (let idx in this.addresses) {
              if (this.addresses[idx] === this.$store.state.web3.defaultAccount) {
                if (this.seed) {
                  this.$router.replace(`prizeDetail?ring=1&symbol=${this.symbol}&packetId=${this.packetId}&seed=` + this.seed)
                } else {
                  this.$router.replace(`prizeDetail?ring=1&symbol=${this.symbol}&packetId=${this.packetId}&secret=` + this.secret)
                }
                return
              }
            }
            let packetInfo = await getPacketInfo(packetId)
            if (packetInfo.owner == this.$store.state.web3.defaultAccount) {
              this.pageData.isSender = true
            }
            console.log(packetInfo)
            if (packetInfo.remainCount == 0 && packetInfo.claimCount == packetInfo.packetCount) {
              this.pageData.status = 'empty'
            } else if (packetInfo.remainCount > 0) {
              this.pageData.status = 'doing'
            } else if (packetInfo.remainCount == 0) {
              this.pageData.status = 'recall'
            }
            this.owner = utils.formatShortHash(packetInfo.owner)
            this.token = getTokenInfo(packetInfo.token)
            this.pageStatus = 'ok'
            console.log(this.token)
            this.initShareInfo()
            this.$nextTick(() => {
              this.prizeVisible = true
            })
          }
        }
        this.pageStatus = 'ok'
      }
      if (!this.seed) {
        this.initShareInfo()
        this.$nextTick(() => {
          this.prizeVisible = true
        })
      }
      this.env.isInWx && this.wxConfigAndShare()
    },
    async  fetchPageData () {
      try {
        this.initSymbol()
        await getWeb3PromiseRelay.then(async () => {
          this.reloadData()
        })
      } catch (e) {
        console.error('getPacketInfo', e)
      }
    },

    initShareInfo () {
      const title = this.$t('text.page_prizeShare_tokenPrizeFrom', { name: '', token: this.symbol })
      const desc = '红包上链 好运连连'
      let url = `${window.location.origin}${this.$router.options.base}/${this.$i18n.locale}/prizeOpen`
      let textKey = ''
      if (this.seed) {
        textKey = 'text.page_prizeShare_iSentABigPrize'
        url = url + `?seed=${this.seed}&packetId=${this.packetId}&symbol=${this.symbol}`
      } else if (this.secret) {
        textKey = 'text.page_prizeShare_iSentABigSecretPrize'
        url = url + `?secret=${this.secret}&symbol=${this.symbol}`
      }
      const thumb = 'https://bitcv.kingco.tech/fe_rrex_candy_shareIcon.png'
      const textCopy = this.$t(textKey, { token: this.symbol, secret: this.secret }) + url

      this.shareInfo = {
        title,
        desc,
        url,
        thumb,
        textCopy
      }
    },
    wxConfigAndShare () {
      // wxsdk config
      let desc = ''
      if (this.seed) {
        desc = '红包上链 好运连连'
      } else if (this.secret) {
        desc = '领取口令:' + this.secret
      }
      let url = `${window.location.origin}${this.$router.options.base}/${this.$i18n.locale}/prizeOpen`
      if (this.seed) {
        url = url + `?seed=${this.seed}&packetId=${this.packetId}&symbol=${this.symbol}`
      } else if (this.secret) {
        url = url + `?secret=${this.secret}&symbol=${this.symbol}`
      } else {
        url = url + `?symbol=${this.symbol}`
      }
      const thumb = 'https://bitcv.kingco.tech/fe_rrex_candy_shareIcon.png'
      let title = ''
      if (this.seed) {
        title = '火币生态链 ' + this.symbol + '红包'
      } else if (this.secret) {
        title = '火币生态链 ' + this.symbol + '口令红包'
      }

      this.$store.dispatch('wxSdkConfig')
        .then(res => {
          let shareInfo = {
            title: title,
            imgUrl: thumb,
            desc: desc,
            link: url
          }
          this.$wx.onMenuShareAppMessage(shareInfo)
          this.$wx.onMenuShareTimeline(shareInfo)
          this.$wx.onMenuShareQQ(shareInfo)
          // wxsdk 1.4.0 更新内容
          this.$wx.updateAppMessageShareData(shareInfo)
          this.$wx.updateTimelineShareData(shareInfo)
        })
        .catch(err => {
          this.$toast(err)
        })
    },
    parseLink (content) {
      const reg = /(http:\/\/|https:\/\/)((\w|=|\?|\.|\/|&|-)+)/g
      const matches = content.match(reg)
      if (matches && matches.length) {
        let url = matches[0]
        let idx = url.indexOf('?')
        if (idx !== -1) {
          let params = new URLSearchParams(url.substr(idx))
          this.packetId = params.get('packetId')
          this.seed = params.get('seed')
          if (this.packetId && this.seed) {
            return true
          }
        }
      }
      return false
    },
    async openPrize () {
      if (this.seed) {
        this.$indicator.open('红包开启中...')
        claimPacket(this.seed, this.packetId)
      } else if (this.secret) {
        if (this.parseLink(this.secret)) {
          this.$indicator.open('红包链接解析成功，开启中...')
          claimPacket(this.seed, this.packetId)
        } else {
          this.$indicator.open('口令红包，开启中...')
          this.packetId = await getPacketIdBySecret(this.secret)
          if (parseInt(this.packetId) == 0) {
            this.$indicator.close()
            this.$toast('红包口令不正确')
            return
          }
          claimSecretPacket(this.secret)
        }
      } else {
        this.$toast('您的输入可能有误')
      }
      let tseed = this.seed
      let tpacketId = this.packetId
      const interval = setInterval(() => {
        console.log('get status')
        let openObj = this.$store.state.open
        if (openObj.txs && openObj.txs[0]) {
          this.$indicator.close()
          if (openObj.txs[0].status != 'mined') {
            this.$toast(openObj.txs[0].name)
          } else {
            this.$toast('领取上链成功：' + utils.formatShortHash(openObj.txs[0].hash))
            if (this.seed) {
              this.$router.push(`prizeDetail?seed=${this.seed}&packetId=${this.packetId}&symbol=${this.symbol}`)
            } else {
              this.$router.push(`prizeDetail?secret=${this.secret}&packetId=${this.packetId}&symbol=${this.symbol}`)
            }
            clearInterval(interval)

            let pkey = utils.getAddressPrefix(this.$store.state.web3.defaultAccount) + '_opened'
            let packets = localStorage.getItem(pkey)
            if (!(packets = JSON.parse(packets))) {
              packets = {}
            }
            packets[tpacketId] = {
              seed: tseed,
              packetId: tpacketId
            }
            localStorage.setItem(pkey, JSON.stringify(packets))
          }
        } else {
          if (this.$store.state.open.myAmount == -1 || this.$store.state.open.myAmount == -3 || this.$store.state.open.myAmount == -5) {
            clearInterval(interval)
            this.$router.push(`prizeDetail?seed=${this.seed}&packetId=${this.packetId}&symbol=${this.symbol}`)
          } else if (this.$store.state.open.myAmount == -2 || this.$store.state.open.myAmount == -4 || this.$store.state.open.myAmount == -6) {
            clearInterval(interval)
            this.$router.push(`prizeDetail?secret=${this.secret}&packetId=${this.packetId}&symbol=${this.symbol}`)
          } else if (this.$store.state.open.myAmount < 0 && this.packetId && this.symbol) {
            clearInterval(interval)
            this.$router.push(`prizeDetail?packetId=${this.packetId}&symbol=${this.symbol}`)
          } else if (this.$store.state.open.myAmount < 0) {
            clearInterval(interval)
            this.$router.push('prizeSend')
          }
        }
        console.log(this.$store.state.open)
      }, 3000)
    },

    loginSuccess () {
      this.pageData.loginStatus = 1
      this.openPrize()
    }
  }
}
</script>

<style lang="scss" scoped>
.page-container {
  background-color: #F5F5F5;
}
.prize-ctn {
  box-sizing: border-box;
  position: relative;
  padding-top: 1.5rem;
}

.prize {
  position: relative;
  overflow: hidden;
  height: 7.4rem;
  width: 5.5rem;
  margin: 0 auto 1rem;
  border-radius: .14rem;
  will-change: transform;

  .prize-bg {
    width: 100%;
    height: 100%;
    background: linear-gradient(180deg,rgba(222,68,68,1) 0%,rgba(219,66,66,1) 32%,rgba(183,36,36,1) 100%);
    .prize-bg-header {
      width: 100%;
      height: 2.36rem;
      background-image: url('~@/assets/img/elements/prizeShare_header.png');
      background-size: 100% 100%;
    }
  }
  .prize-custom-bg {
    position: relative;
    height: 100%;
    height: 100%;
    box-sizing: border-box;
    padding-top: .12rem;
    background-color: #B10000;
    .prize-custom-img {
      display: block;
      width: 5.26rem;
      margin: 0 auto;
    }
    .prize-custom-footer {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      width: 100%;
      .prize-custom-footer-decorate {
        width: 100%;
        height: .5rem;
        background-image: url('~@/assets/img/elements/prizeShare_footer_decorate.png');
        background-size: 100% 100%;
      }
      .prize-custom-footer-color {
        margin-top: -2px;
        height: 2.52rem;
        background: linear-gradient(180deg,rgba(222,68,68,1) 0%,rgba(183,36,36,1) 100%);
      }
    }
  }
  .prize-custom-bg {
    display: none;
  }

  .prize-info {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    width: 100%;
    z-index: 1;
    text-align: center;
    .avatar {
      width: 1.2rem;
      height: 1.2rem;
      margin: 1.6rem auto 0;
      display: flex;
      justify-content: center;
      align-items: center;
      border-radius: 50%;
      background: linear-gradient(180deg,rgba(255,180,126,1) 0%,rgba(243,107,7,1) 100%);
      box-shadow: 0 .12rem 0 rgba(140, 0, 0, .2);
      img {
        width: .96rem;
        height: .96rem;
        border-radius: 50%;
      }
    }
    .nickname {
      padding-top: .14rem;
      font-size: .28rem;
      line-height: .4rem;
      color: #fff;
      font-weight: 500;
    }
    .desc {
      padding-top: .34rem;
      font-size: .34rem;
      line-height: .48rem;
      color: #FF9344;
      font-weight: 500;
    }
    .input-prizeSecret {
      margin-top: 1rem;
      height: 0.8rem;
      width: 90%;
      margin-left:5%;
      padding-top: 0.3rem;
      // padding: .4rem .3rem;
      border-radius: .1rem;
      background-color: #F8F8F8;
        .sinput {
          font-size: .28rem;
          margin-left:4%;
          width: 80%;
          line-height: .36rem;
          color: darkgray;
          &::-webkit-input-placeholder {
            color: #ccc;
        }
      }
    }
    .btn {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 3.18rem;
      height: .8rem;
      margin: 1.14rem auto 0;
      border-radius: .4rem;
      background: linear-gradient(180deg,rgba(255,180,126,1) 0%,rgba(219,109,29,1) 100%);
      font-size: .32rem;
      line-height: .44rem;
      color: #fff;
      font-weight: 500;
      transition: opacity .3s;
      box-shadow: 0 .14rem 0 rgba(140, 0, 0, .2);
      &:active {
        opacity: .8;
      }
    }
    .status {
      margin-top: 1.14rem;
      display: flex;
      justify-content: center;
      align-items: center;
      height: .8rem;
      font-size: .3rem;
      line-height: .4rem;
      color: #FF9344;
    }
  }

  // 带有封面图效果
  &.prize-custom {
    .prize-bg {
      display: none;
    }
    .prize-custom-bg {
      display: block;
    }
    .prize-info {
      .avatar {
        visibility: hidden;
      }
      .nickname {
        visibility: hidden;
      }
      .desc {
        visibility: hidden;
      }
    }
  }
}

.musicBox {
  display: none;
}
</style>
