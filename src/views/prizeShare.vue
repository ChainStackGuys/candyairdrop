<template>
  <section class="page-container">
    <!-- 分享提示界面 -->
    <popupShare
      v-if='popupShare.status'
      @closePopup='popupShare.status = false'
    ></popupShare>
     <!-- 分享前界面 -->
    <template v-if="pageStatus === 'ok'">
      <section v-if='!isPrizeShared' class="prize-unshared">
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
              <p class="desc">{{ token.name }}</p>
              <!-- 微信中使用微信转发分享，其他浏览器使用复制文案分享 -->
               <template v-if="env.isInWx">
                <button class="btn" @click="shareInWx">{{$t("text.page_title_prizeShare")}}</button>
                <p class="note">{{ $t('text.page_prizeShare_clickTheUpperRightCorner') }} {{ $t('text.page_prizeShare_canBeShared') }}</p><!-- 点击右上角 可分享到好友或朋友圈 -->
              </template>
              <template v-else>
                <button class="btn" v-clipboard:copy="shareInfo.textCopy" v-clipboard:success="copySuccess" v-clipboard:error="copyError">{{$t("text.page_title_prizeShare")}}</button>
              </template>
            </div>
          </section>
        </transition>

        <!-- TODO_FEATURE -->
        <!-- <router-link v-if="env.isInRrexApp" class="share-poster" :to="`sharePoster?id=${id}`">分享红包海报</router-link> -->
      </section>
      <section class="operation" :class="{ noFixed: env.platform === 'android' && keyboardStatus }">
        <!-- 记录 -->
        <div class="record-wrap">
          <router-link class="prize-record" to="recordSend">
            <i class="icon"></i>
            <p class="text">{{$t("text.page_prizeSend_history")}}</p>
          </router-link>
        </div>
      </section>
      <!-- 分享后界面 -->
      <section v-if='isPrizeShared' class="prize-shared">
        <img class="icon" src="@/assets/img/icons/tip_success.png">
        <p class="text">{{ $t('text.page_prizeShare_shareSuccess') }}</p>
        <router-link :to="`prizeOpen?/id=${id}`" class="common-btn btn-view">{{ $t('text.page_prizeShare_view') }}</router-link>
        <router-link :to="`prizeSend`" class="onemore">{{ $t('text.page_prizeShare_sendAnother') }}</router-link>
      </section>
  </template>
  <pageLoading v-else color="#EF4E4C"></pageLoading>
  </section>
</template>

<script>
import { mapState } from 'vuex'
import { getWeb3Promise, getTokenInfo, getTokenInfoBySymbol } from '../utils/getToken'
import { getPacketIdBySeed, getPacketIdBySecret, getPacketInfo } from '../utils/tokenPrize'
import popupShare from '@/components/popup/popupShare'
import utils from '../utils/utils'

export default {
  name: 'prizeShare',
  data () {
    return {
      pageStatus: '',
      pageData: null,
      prizeVisible: false,
      seed: parseInt(this.$route.query.seed),
      secret: this.$route.query.secret,
      symbol: this.$route.query.symbol ?? '数字资产',
      isPrizeShared: false, // 是否分享成功的状态
      token: this.$route.query.symbol ? getTokenInfoBySymbol(this.$route.query.symbol) : null,
      shareInfo: null, // 分享信息
      packetId: 0,
      popupShare: {
        status: false
      }
    }
  },
  computed: {
    ...mapState(['env', 'keyboardStatus'])
  },
  components: {
    popupShare
  },
  created () {
    this.fetchPageData()
  },
  methods: {
    async fetchPageData () {
      try {
        await getWeb3Promise.then(async () => {
          if (this.$store.state.web3.web3Instance) {
            let packetId = 0
            if (this.seed) {
              packetId = await getPacketIdBySeed(this.seed)
            } else if (this.secret) {
              packetId = await getPacketIdBySecret(this.secret)
            }
            if (parseInt(packetId)) {
              this.packetId = packetId
              let packetInfo = await getPacketInfo(packetId)
              console.log(packetInfo)
              this.token = getTokenInfo(packetInfo.token)
              console.log(this.token)
              this.pageStatus = 'ok'
              this.initShareInfo()

              this.$nextTick(() => {
                this.prizeVisible = true
              })
              if (packetInfo.owner.toLowerCase() == this.$store.state.web3.defaultAccount.toLowerCase()) {
                let pkey = utils.getAddressPrefix(this.$store.state.web3.defaultAccount) + '_packets'
                let packets = localStorage.getItem(pkey)
                if (!(packets = JSON.parse(packets))) {
                  packets = {}
                }
                packets[this.packetId] = {
                  seed: this.seed,
                  secret: this.secret,
                  packetId: this.packetId
                }
                localStorage.setItem(pkey, JSON.stringify(packets))
              }
            } else {
              this.$toast('invalid packetId')
              this.$router.replace('prizeSend')
            }
          } else {
            if (this.seed) {
              this.$router.replace(`prizeOpen?packetId=${this.packetId}&seed=` + this.seed + '&symbol=' + this.symbol)
            } else if (this.secret) {
              this.$router.replace('prizeOpen?symbol=' + this.symbol)
            }
          }
        })
        this.env.isInWx && this.wxConfigAndShare()
      } catch (e) {
        console.error('getPacketInfo', e)
      }
      // this.$http.get(this.$api.getPrizeStatus, {
      //   params: {
      //     packetNum: this.id
      //   }
      // })
      //   .then(res => {
      //     if (res.data.errcode) {
      //       this.$toast(`${this.$t('text.common_notice')}: ${res.data.errmsg}`)
      //     } else {
      //       // 非自己发的红包会自动跳转到开红包页面
      //       if (!res.data.data.isSender) {
      //         this.$router.replace(`prizeOpen?id=${this.id}`)
      //         return
      //       }
      //       this.pageData = res.data.data
      //       this.pageStatus = 'ok'
      //       this.initShareInfo()
      //       this.env.isInWx && this.wxConfigAndShare()
      //       this.$nextTick(() => {
      //         this.prizeVisible = true
      //       })
      //     }
      //   })
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
      } else {
        url = url + `?symbol=${this.symbol}`
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
    shareInWx () {
      this.popupShare.status = true
    },
    shareInRrexApp () {
      this.$store.dispatch('rrexBridge/mediaShareWithLink', {
        linkTitle: this.shareInfo.title,
        linkDesc: this.shareInfo.desc,
        linkUrl: this.shareInfo.url,
        linkThumb: this.shareInfo.thumb,
        textCopy: this.shareInfo.textCopy
      })
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
.page-container {
  height: 100%;
}
.prize-unshared {
  box-sizing: border-box;
  position: relative;
  height: 100%;
  padding-top: 1.5rem;
  background-color: #faf0e7;
}
.prize {
  height: 7.4rem;
  width: 5.5rem;
  margin: 0 auto;
  position: relative;
  border-radius: .14rem;
  overflow: hidden;
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
    .note {
      margin-top: .54rem;
      font-size: .24rem;
      line-height: .34rem;
      color: #FF9344;
      font-weight: 500;
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
.share-poster {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: .64rem auto 0;
  width: 3.8rem;
  height: .88rem;
  border-radius: .44rem;
  background-color: #FFCC3E;
  font-size: .28rem;
  line-height: .32rem;
  font-weight: bold;
  color: #C46A0A;
  &:active {
    opacity: .9;
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
// 分享成功界面
.prize-shared {
  padding-top: 1.5rem;
  .icon {
    display: block;
    margin: 0 auto;
    width: 1.82rem;
    height: 2.02rem;
  }
  .text {
    padding-top: .6rem;
    font-size: .36rem;
    line-height: .4rem;
    color: #14181F;
    font-weight: 500;
    text-align: center;
  }
  .btn-view {
    width: 5rem;
    border-radius: .44rem;
    margin: 1.6rem auto 0;
  }
  .onemore {
    display: block;
    margin-top: .34rem;
    font-size: .3rem;
    line-height: .42rem;
    text-align: center;
    color: #A4A8B3;
    text-decoration: underline;
  }
}
</style>
