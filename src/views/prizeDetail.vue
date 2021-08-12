<template>
  <section>
    <!-- 分享提示界面 -->
    <popupShare
      v-if='popupShare.status'
      @closePopup='popupShare.status = false'
    ></popupShare>

    <template v-if="pageStatus === 'ok'">
      <!-- 顶部固定元素 -->
      <section class="top-operate">
        <audio class="musicBox" preload="metadata" ref="musicBox">
          <source src="@/assets/media/prizeOpen.mp3" type="audio/mp3">
        </audio>
        <!-- 我要定制红包按钮 -->
        <!-- <div class="custom-prizeCover" @click="$utils.goPrizeExtend">
          <p class="text">我要定制封面</p>
          <i class="icon"></i>
        </div> -->
        <div class="operate-btns">
          <router-link :to="`/${this.$i18n.locale}/prize/send`" class="operate-send"></router-link>
          <button v-if="env.isInWx" class="prize-share" @click='shareCandy'></button>
          <button v-else class="prize-share prizeShareText" v-clipboard:copy="shareInfo.textCopy" v-clipboard:success="copySuccess" v-clipboard:error="copyError"></button>

        </div>
      </section>

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
          <div class="avatar"><img :src="this.token.logoURI"></div>
          <p class="nickname">{{ this.owner }}</p>
          <div class="amount-wrap" v-if="pageData.myAmount">
            <p class="amount dinMedium">{{ +pageData.myAmount }}<span class="unit"> {{ this.token.symbol }}</span></p>

          </div>
          <!--a v-if="pageData.myAmount" href="javascript:;" class="common-btn btn-view" @click='downloadApp'>{{$t("text.page_prizeShare_view")}}</a-->
        </div>
      </section>

      <div v-if="pageData.myAmount" class="operate-goapp">
        <p class="text">{{$t("text.page_user_assetHasSaved")}} <span><a :href="explorerUrl">({{this.userAddress }})</a></span></p>
      </div>

      <!-- 红包领取记录 -->
      <prizeRecordList
        v-show="addresses.length"
        :packetId="parseInt(packetId)"
        :isSender="pageData.isSender"
        :noRecordVisible="false"
      ></prizeRecordList>

      <section class="operation" :class="{ noFixed: env.platform === 'android' && keyboardStatus }">
        <!-- 记录 -->
        <div class="record-wrap">
          <router-link class="prize-record" to="recordSend">
            <i class="icon"></i>
            <p class="text">{{$t("text.page_prizeSend_history")}}</p>
          </router-link>
        </div>

      </section>

      <!-- 红包底部广告 banner 区域 -->
      <!-- <section class="ad-banner-wrap">
        <img v-if="prize.bannerUrl" :src="prize.bannerUrl" class="ad-banner" @click="clickAdBanner" alt="">
        <a v-else href="javascript:;" class="ad-banner-upgrade" @click="$utils.goPrizeExtend">
          <img class="icon" src="@/assets/img/icons/add2.png" alt="">
          <p class="text">上传广告图 实现精准引流</p>
        </a>
      </section> -->
    </template>
    <pageLoading v-else color="#EF4E4C"></pageLoading>
  </section>
</template>

<script>
import { mapState } from 'vuex'
import popupShare from '@/components/popup/popupShare'
import prizeRecordList from '@/components/prizeRecordList'
import { getWeb3Promise, getTokenInfo, getTokenInfoBySymbol, getWalletConnectWeb3 } from '../utils/getToken'
import { getPacketIdBySeed, getPacketIdBySecret, getClaimAddress, getPacketInfo, getMyAmount } from '../utils/tokenPrize'
import utils from '../utils/utils'

import { BigNumber, FixedNumber } from '@ethersproject/bignumber'
export default {
  name: 'prizeDetail',
  data () {
    return {
      pageStatus: '',
      pageData: {},
      // status 红包状态 { doing: '可抢', empty: '抢完', overdue: '未领完已过期' }
      packetId: this.$route.query.packetId, // 红包ID
      seed: parseInt(this.$route.query.seed),
      secret: this.$route.query.secret,
      symbol: this.$route.query.symbol ?? '数字资产',
      isLoading: false, // 是否正在加载
      isLoadOver: false, // 是否加载完毕
      perPage: 20, // 每页显示的数量
      userAddress: '',
      explorerUrl: '',

      shareInfo: null, // 分享信息
      popupShare: {
        status: false
      },
      saveMsg: this.$t('text.page_user_qualifyUserCanWithdraw'),
      token: this.$route.query.symbol ? getTokenInfoBySymbol(this.$route.query.symbol) : null,
      owner: '',
      addresses: []
    }
  },
  computed: {
    ...mapState(['env', 'keyboardStatus', 'userData'])
  },
  created () {
    this.fetchPageData()
    // this.$store.dispatch('getUserData')
  },
  components: {
    popupShare,
    prizeRecordList
  },
  methods: {
    getMultiplier () {
      const decimals = BigNumber.from(this.token.decimal)
      return BigNumber.from(10).pow(decimals)
    },
    async reloadData () {
      if (!parseInt(this.packetId)) {
        if (this.seed) {
          this.packetId = await getPacketIdBySeed(this.seed)
        } else if (this.secret) {
          this.packetId = await getPacketIdBySecret(this.secret)
        }
      }
      let packetInfo = await getPacketInfo(this.packetId)
      if (parseInt(packetInfo.packetId) != parseInt(this.packetId)) {
        this.$toast('invalid packetId')
        this.$router.replace('prizeSend')
      }
      this.token = getTokenInfo(packetInfo.token)
      this.addresses = await getClaimAddress(this.packetId)
      for (let idx in this.addresses) {
        if (this.addresses[idx] == this.$store.state.web3.defaultAccount) {
          this.pageData.myAmount = await getMyAmount(this.packetId)
          if (!this.pageData.myAmount) {
            this.pageData.myAmount = 0
          }
          this.pageData.myAmount = FixedNumber.from(BigNumber.from(this.pageData.myAmount).mul(BigNumber.from(10000)).div(this.getMultiplier())).divUnsafe(FixedNumber.from(10000))
          break
        }
      }
      if (packetInfo.owner == this.$store.state.web3.defaultAccount) {
        this.pageData.isSender = true
      }
      console.log(packetInfo)
      if (packetInfo.remainCount > 0) {
        this.pageData.status = 'doing'
      } if (packetInfo.claimCount == packetInfo.packetCount && packetInfo.remainCount == 0) {
        this.pageData.status = 'empty'
      } else {
        this.pageData.status = 'recall'
      }
      this.owner = utils.formatShortHash(packetInfo.owner)

      this.userAddress = utils.formatShortHash(this.$store.state.web3.defaultAccount)
      this.explorerUrl = this.$store.state.web3.explorerUrl + '/address/' + this.$store.state.web3.defaultAccount
      console.log(this.token)
      this.pageStatus = 'ok'
      this.playRing()
      this.initShareInfo()
      this.$nextTick(() => {
        this.prizeVisible = true
      })
    },
    async fetchPageData () {
      try {
        await getWeb3Promise.then(async () => {
          if (this.$store.state.web3.web3Instance) {
            this.reloadData()
          } else {
            getWalletConnectWeb3()
            let count = 0
            const interval = setInterval(async () => {
              if (this.$store.state.web3.web3Instance) {
                this.account = utils.formatShortHash(this.$store.state.web3.defaultAccount)
                this.reloadData()
                clearInterval(interval)
              }
              count++
              if (count > 5) {
                this.$router.replace(`prizeOpen?packetId=${this.packetId}&seed=` + this.seed + '&symbol=' + this.symbol)
              }
            }, 2000)
          }
        })
        this.env.isInWx && this.wxConfigAndShare()
      } catch (e) {
        console.error('getPacketInfo', e)
      }
      // this.$http.get(this.$api.getPrizeDetail, {
      //   params: {
      //     packetNum: this.id,
      //     perPage: this.perPage
      //   }
      // })
      //   .then(res => {
      //     if (res.data.errcode) {
      //       this.$toast(`${this.$t('text.common_notice')}: ${res.data.errmsg}`)
      //     } else {
      //       this.pageData = res.data.data
      //       // 用户名限制10个字符
      //       if (this.pageData.senderData.nickname.length > 10) this.pageData.senderData.nickname = this.pageData.senderData.nickname.substr(0, 10) + '...'
      //       if (this.pageData.noBack) {
      //         this.saveMsg = this.$t('text.page_user_loginUserCanWithdraw')
      //       }

      //       // 分享配置
      //       this.initShareInfo()
      //       this.env.isInWx && this.wxConfigAndShare()

      //       this.pageStatus = 'ok'
      //     }
      //   })
    },

    initShareInfo () {
      const title = this.$t('text.page_prizeShare_tokenPrizeFrom', { name: this.owner, token: this.symbol })
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
    // 分享红包
    shareCandy () {
      if (this.env.isInWx) {
        this.popupShare.status = true
      }
    },
    // TODO_FEATURE 活动绑定手机号时，绑定成功事件，给新人红包添加标记
    bindSuccess (opt) {
    },

    playRing () {
      if (this.$route.query.ring == 1) {
        try {
          this.$refs.musicBox.play()
            .catch(() => {
              console.warn('浏览器不支持自动播放声音')
            })
        } catch (err) {
          console.warn('浏览器不支持自动播放声音')
        }
      }
    },
    copySuccess () {
      this.$toast(this.$t('text.page_prizeShare_shareLinkCopied')) // 分享链接已复制，可以直接粘贴给朋友
    },
    copyError () {
      this.$messagebox({ title: this.$t('text.page_prizeShare_longTap2copy'), message: this.shareInfo.textCopy }) // 长按复制下面分享链接
    }
  }
}
</script>

<style lang="scss" scoped>
.top-operate {
  position: relative;
  z-index: 30;
  // 我要定制红包按钮
  .custom-prizeCover {
    position: fixed;
    top: .24rem;
    left: .3rem;
    width: 2rem;
    height: .44rem;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: .22rem;
    background-color: rgba(0, 0, 0, .4);
    .text {
      font-size: .2rem;
      line-height: .24rem;
      color: #FFF;
      font-weight: 500;
    }
    .icon {
      margin-left: .1rem;
      width: .08rem;
      height: .14rem;
      background-image: url('~@/assets/img/icons/arrow_right_white.png');
      background-size: 100% 100%;
    }
  }
  .operate-btns {
    position: fixed;
    top: 1rem;
    right: .4rem;
    .operate-send {
      display: block;
      width: .84rem;
      height: .84rem;
      border-radius: 50%;
      background-color: #EF4E4C;
      box-shadow: 0 0 .16rem rgba(183, 91, 91, 0.4);
      background-image: url('~@/assets/img/icons/icon_prize_send.png');
      background-size: 100% 100%;
    }

    .prize-share {
      margin-top: .42rem;
      display: block;
      width: .84rem;
      height: .84rem;
      border-radius: 50%;
      background-color: #fff;
      box-shadow: 0 0 .16rem RGBA(171, 171, 171, 0.4);
      background-image: url('~@/assets/img/icons/icon_prize_share.png');
      background-size: 100% 100%;
    }
  }
}

.prize {
  position: relative;
  .prize-bg {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    width: 100%;
    background: linear-gradient(180deg,rgba(222,68,68,1) 0%,rgba(218,65,65,1) 38%,rgba(183,36,36,1) 100%);
    .prize-bg-header {
      width: 100%;
      height: 2.42rem;
      background-image: url('~@/assets/img/elements/prizeShare_header.png');
      background-size: 100% 100%;
    }
  }
  .prize-custom-bg {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    width: 100%;
    .prize-custom-img {
      display: block;
      width: 100%;
    }
    .prize-custom-footer {
      .prize-custom-footer-decorate {
        position: absolute;
        left: 0;
        right: 0;
        top: 6.9rem;
        width: 100%;
        height: .68rem;
        background-image: url('~@/assets/img/elements/prizeDetail_footer_decorate.png');
        background-size: 100% 100%;
      }
      .prize-custom-footer-color {
        position: absolute;
        left: 0;
        right: 0;
        top: 7.56rem;
        bottom: 0;
        width: 100%;
        background:linear-gradient(180deg,rgba(216,63,63,1) 0%,rgba(183,36,36,1) 100%);
      }
    }
  }
  .prize-custom-bg {
    display: none;
  }

  .prize-info {
    box-sizing: border-box;
    position: relative;
    z-index: 1;
    padding-top: 1.44rem;
    padding-bottom: .44rem;
    text-align: center;
    .avatar {
      width: 1.2rem;
      height: 1.2rem;
      margin: 0 auto;
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
    .amount {
      margin-top: .24rem;
      font-size: .68rem;
      line-height: .7rem;
      color: #fff;
      .unit {
        position: relative;
        bottom: .04rem;
        padding-left: .04rem;
        font-size: .24rem;
      }
    }
    .value {
      padding-top: .16rem;
      font-size: .24rem;
      line-height: .34rem;
      color: #FFFFFF;
    }
    .desc {
      padding-top: .24rem;
      font-size: .24rem;
      line-height: .34rem;
      color: #F29A59;
    }
    .btn-view {
      width: 1.1rem;
      height: .42rem;
      margin: .36rem auto 0;
      border-radius: .21rem;
      background-color: #fff;
      font-size: .24rem;
      line-height: .42rem;
      color: #C93333;
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
      padding-top: 6.2rem;
    }
  }
}

.operate-goapp {
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: center;
  height: .88rem;
  background-color: #FFE6E6;
  .text {
    font-size: .22rem;
    line-height: .3rem;
    color: #B71717;
    font-weight: 500;
  }
}
// 底部操作
.operation {
  position: fixed;
  bottom: 1rem;
  left: 0;
  width: 100%;
  &.noFixed {
    margin-top: 1rem;
    position: static;
  }
  .record-wrap {
    display: flex;
    justify-content: flex-end;
    .prize-record {
      box-sizing: border-box;
      display: block;
      width: 1rem;
      height: 1rem;
      margin-right: .32rem;
      padding-top: .18rem;
      border-radius: 50%;
      text-align: center;
      background-color: #fff;
      box-shadow:0rem 0rem 0.2rem 0rem rgba(7,0,138,0.16);
      .icon {
        display: inline-block;
        width: .36rem;
        height: .4rem;
        margin-left: 0.02rem;
        background-image: url('~@/assets/img/icons/icon_record.png');
        background-size: 100% 100%;
      }
      .text {
        margin-top: .04rem;
        font-size: .2rem;
        line-height: .28rem;
        color: #14181F;
        font-weight: 500;
      }
    }
  }
}
.musicBox {
  display: none;
}
.ad-banner-wrap {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 50;
  .ad-banner {
    display: block;
    width: 7.5rem;
    height: 1.1rem;
    margin: 0 auto;
  }
  .ad-banner-upgrade {
    display: flex;
    justify-content: center;
    align-items: center;
    height: .78rem;
    background-color: #E6F1FE;
    .icon {
      width: .43rem;
      height: .43rem;
    }
    .text {
      padding-left: .14rem;
      font-size: .28rem;
      line-height: .3rem;
      color: #2370FB;
      font-weight: 500;
    }
  }
}

.zoomIn-enter-active,
.zoomIn-leave-active {
  transition: all .3s cubic-bezier(0.37, 1.93, 0.72, 0.57);
  transform: scale(1);
  transform-origin: 80% top;
  // opacity: 1;
}
.zoomIn-enter,
.zoomIn-leave-to {
  transform: scale(.7);
  // opacity: 0;
}
</style>
