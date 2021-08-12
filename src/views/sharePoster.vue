<template>
  <section class="page-container">
    <section v-if="pageStatus == 'ok'" class="container">
      <section class="poster">
        <img class="avatar" :src="pageData.senderInfo.avatarUrl" alt="">
        <p class="nickname">{{ pageData.senderInfo.nickname }}</p>
        <p class="message text-hidden-one">{{ pageData.packetMsg }}</p>
        <div class="qrcode-wrap">
          <vue-qr class="qrcode" :text="prizeLink" :size='260' :dotScale="1" :margin='0'></vue-qr>
        </div>
        <p class="note">长按识别红包</p>
      </section>

      <!-- TODO_FEATURE: 微信内保存图片 -->
      <!-- <section v-if="!env.isInRrexApp && showShareTips" class="share-tips">
        <p class="share-tips-text">长按保存图片<br>分享给您的好友</p>
        <a href="javascript:;" class="share-tips-btn" @click="showShareTips = false">知道了</a>
      </section> -->
    </section>

    <page-loading v-else color="#EF4E4C"></page-loading>
  </section>
</template>

<script>
// import html2canvas from 'html2canvas'
import VueQr from 'vue-qr'
import { mapState } from 'vuex'
import downloadImg from '@/utils/downloadImg'

export default {
  name: 'sharePoster',
  data () {
    return {
      pageStatus: '',
      pageData: {},
      id: this.$route.query.id,

      prizeLink: ''
    }
  },
  components: {
    VueQr
  },
  computed: {
    ...mapState(['env'])
  },
  mounted () {
    this.$http.post(this.$api.getPacketStatus, { packetId: this.id })
      .then(res => {
        if (res.data.errcode == 0) {
          this.pageData = res.data.data
          this.prizeLink = `${location.protocol}//${location.host}/${this.$i18n.locale}/prizeOpen/${this.id}`
          this.pageStatus = 'ok'
          this.$nextTick(() => {
            this.shareScreenshot()
          })
        } else {
          this.$toast(`${this.$t('text.common_notice')}: ${res.data.errmsg}`)
        }
      })
  },
  methods: {
    shareScreenshot () {
      let bgUrl = require('@/assets/img/elements/prize_poster_bg.jpg')
      let avatar = this.pageData.senderInfo.avatarUrl || 'http://www.bitcv.com/prize_static/imgs/common/avatar_default.png'

      Promise.all([downloadImg(bgUrl), downloadImg(avatar)])
        .then(() => {
          setTimeout(() => {
            this.$store.dispatch('shareWithScreenshot')
          }, 1000)
        })
        .catch(err => {
          this.$toast(err)
        })
    }
  }
}
</script>

<style lang="scss" scoped>
.page-container {
  box-sizing: border-box;
  background-color: #fff;
}
.container {
  position: relative;
}

.poster {
  position: relative;
  box-sizing: border-box;
  height: 12.85rem;
  padding-top: 2.56rem;
  background-image: url('~@/assets/img/elements/prize_poster_bg.jpg');
  background-size: 100% 12.85rem;
  text-align: center;
  .avatar {
    width: 1rem;
    height: 1rem;
    border-radius: 50%;
  }
  .nickname {
    max-width: 5rem;
    margin: 0 auto;
    padding-top: .32rem;
    font-size: .24rem;
    line-height: .26rem;
    color: #FDEFAE;
  }
  .message {
    max-width: 5rem;
    margin: 0 auto;
    padding-top: .5rem;
    font-size: .32rem;
    line-height: .34rem;
    color: #F4E506;
    font-weight: 500;
  }
  .qrcode-wrap {
    width: 1.84rem;
    height: 1.84rem;
    margin: 2.84rem auto 0;
    border-radius: .1rem;
    background-color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    .qrcode {
      width: 1.58rem;
      height: 1.58rem;
    }
  }
  .note {
    margin-top: .3rem;
    font-size: .32rem;
    line-height: .34rem;
    color: #fff;
    font-weight: 500;
  }
}

.share-tips {
  position: absolute;
  z-index: 30;
  bottom: .8rem;
  left: .4rem;
  right: .4rem;
  display: flex;
  align-items: center;
  padding: .46rem .5rem .4rem;
  border-radius: .16rem;
  background-color: #fff;
  .share-tips-text {
    flex: 1;
    border-right: dotted 1px #D8D8D8;
    font-size: 0.32rem;
    line-height: .44rem;
    color: #FF7D00;
    font-weight: 500;
  }
  .share-tips-btn {
    padding-left: .54rem;
    font-size: .32rem;
    line-height: .5rem;
    color: #5B5B5B;
    font-weight: 500;
  }
}
</style>
