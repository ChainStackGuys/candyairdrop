<template>
  <section class="page-container">

    <!-- 选择币种框 -->
    <tokenSelect
      v-show="showTokenSelect"
      :initCurrency="initCurrency"
      :selectedToken="selectedTokenItem"
      @closeTokenSelect="showTokenSelect = false"
      @confirmChangeToken="confirmChangeToken"
    ></tokenSelect>

    <popupLimit
      :status="popupLimit.status"
      :amount="popupLimit.amount"
      :symbol="popupLimit.symbol"
      :desc="popupLimit.desc"
      @closePopup="popupLimit.status = false"
      @confirmLimit="confirmLimit"
    ></popupLimit>

    <section v-if="pageStatus == 'ok'" class="container">
      <!-- 顶部用户信息 -->
      <section class="user">
        <!--img class="avatar" :src="userData.avatar" alt=""-->
        <div class="user-total">
          <p class="amount dinMedium">{{ totalAmount ? totalAmount : '0' }} {{ selectedTokenItem.currency }}
            <span v-if="account" class="wallet-connect">{{account}}</span>
            <span v-else @click="connect" class="wallet-connect">{{ $t("text.page_prizeSend_connect_wallet") }}</span>
          </p>
          <p class="text">{{ $t("text.page_prizeSend_sendInTotal_short") }}</p>

        </div>
      </section>
       <section class="top-operate">
        <div class="operate-btns">
          <router-link :to="`/${this.$i18n.locale}/prizeOpen?symbol=HT`" class="operate-send"></router-link>
        </div>
      </section>

      <!-- 发送表单 -->
      <section class="prize-form">
        <div class="input-prizeAmount">
          <div class="field-wrap">
            <p class="field">{{ prizeAmountText }}</p>
            <i v-show="shareType == 'lucky'" class="tag"></i>
          </div>
          <div class="input-wrap">
            <input v-resetInput v-watchKeyboard type="number" class="input dinMedium" :placeholder="selectedTokenItem.inputPlaceholder" v-model.number="prizeAmount" @blur='checkPrizeAmount'>
            <div class="token-selector" :class="{ 'active': showTokenSelect }" @click='handleChangeToken'>
              <img class="token-logo" :src="selectedTokenItem.iconUrl" alt="">
              <p class="token-symbol">{{ selectedTokenItem.currency }}</p>
            </div>
          </div>
        </div>

        <div class="input-type">
          <p class="prize-type" @click='changeType'><span>{{ $t("text.page_prizeSend_changeTo") }} </span>{{ shareType == 'lucky' ? $t("text.page_prizeSend_normalMode") : $t("text.page_prizeSend_luckMode") }}</p>
          <p class="asset">{{ selectedTokenItem.currency }} {{$t("text.page_prizeSend_balanceAvailable")}}<span class="amount">{{ isNaN(selectedTokenItem.balance)?$t("text.page_prizeSend_balanceGetting"):+selectedTokenItem.balance }}</span></p>
        </div>

        <div class="input-prizeCount">
          <p class="field">
            {{ $t("text.page_prizeSend_prizeNum") }}
            <span v-if="$te('text.page_prizeSend_prizeUnit')" class="unit">({{ $t("text.page_prizeSend_prizeUnit") }})</span>
          </p>
          <input v-resetInput v-watchKeyboard type="number" class="input dinMedium" placeholder="1-200" v-model.number="prizeCount" @blur='checkPrizeCount'>
        </div>

        <div class="input-prizeSecret">
          <input v-resetInput v-watchKeyboard @blur="checkWords" type="text" max='16' class="input" :placeholder="$t('text.page_prizeSend_enrichYouALot')" v-model="prizeSecret" @change='checkPrizeSecret'>
        </div>

        <!-- 选择红包封面 DEL -->
        <div v-if="false" class="prizeCover">
          <div class="title-wrap">
            <h3 class="title-text">选择封面</h3>
            <p @click="showMoreCover" class="more">查看更多<span class="arrow"></span></p>
          </div>
          <ul class="prizeCover-list">
            <!-- 默认封面 -->
            <li class="prizeCover-item" :class="{ active: coverType == 'default' }" @click="togglePrizeCover('default')">
              <img class="prizeCover-img" src="@/assets/img/elements/prize_cover_default.png" alt="">
              <p class="prizeCover-img-tag text-hidden-one">默认</p>
            </li>

            <!-- 定制封面  -->
            <li v-if="selectedTokenItem.canCustom" class="prizeCover-item" :class="{ active: coverType == 'custom' }" @click="togglePrizeCover('custom')">
              <img class="prizeCover-img" :src="`${selectedTokenItem.coverUrl}?imageView2/2/w/200/h/200/q/75/interlace/1|imageslim`" alt="">
              <p class="prizeCover-img-tag">定制</p>
            </li>
            <li v-else class="prizeCover-item prizeCover-custom" @click="goPrizeExtend">
              <img class="icon" src="@/assets/img/icons/add.png" alt="">
              <p class="text">定制专属<br>封面</p>
            </li>

            <!-- 扩展封面 -->
            <li v-for="item in pageData.coverList" :key="item.coverId" class="prizeCover-item" :class="{ active: coverType == 'extend' && coverId == item.coverId }" @click="togglePrizeCover('extend', item.coverId)">
              <img class="prizeCover-img" :src="`${item.coverUrl}?imageView2/2/w/200/h/200/q/75/interlace/1|imageslim`" alt="">
              <p class="prizeCover-img-tag">{{ item.nickname }}</p>
            </li>
            <li class="gap"></li>
          </ul>
        </div>
      </section>

      <section class="operation" :class="{ noFixed: env.platform === 'android' && keyboardStatus }">
        <!-- 记录 -->
        <div class="record-wrap">
          <router-link class="prize-record" to="recordSend">
            <i class="icon"></i>
            <p class="text">{{$t("text.page_prizeSend_history")}}</p>
          </router-link>
        </div>
        <!-- 红包定向人群 -->
        <div class="input-limit" @click="showPopupLimit(prizeLimit.token, prizeLimit.limitAmount)">
          <p class="field">{{$t("text.page_prizeSend_specialFor")}}</p>
          <p class="limit-text">{{ prizeLimitDesc }}</p>
          <i class="icon"></i>
        </div>

        <button class="common-btn btn-gen" :disabled="!canGenPrize" @click='beginSendPrize'>{{ $t("text.page_prizeSend_genPrize") }}</button>

      </section>
    </section>

    <page-loading v-else color="#EF4E4C"></page-loading>
  </section>
</template>

<script>
import tokenSelect from '@/components/tokenSelect'
import { mapState } from 'vuex'
import { setTokenPrize, getPacketIdBySecret } from '../utils/tokenPrize'
import { doSend } from '../utils/sendPrize'
import popupLimit from '@/components/popup/popupLimit'
import { getWeb3Promise, getWalletConnectWeb3, getTokenInfo } from '../utils/getToken'
import utils from '../utils/utils'

export default {
  name: 'prizeSend',
  data () {
    return {
      pageStatus: '',
      pageData: {},

      initCurrency: this.$route.query.currency, // 预选择的币种名称
      selectedTokenItem: {}, // 选中币种的信息
      showTokenSelect: false, // 币种类型选择框是否折叠

      shareType: this.$route.query.shareType || 'lucky', // 红包类型  equal-普通红包  lucky-拼手气红包
      prizeAmount: +this.$route.query.prizeAmount || '',
      prizeCount: +this.$route.query.prizeCount || '',
      prizeSecret: this.$route.query.prizeSecret || '',
      isPrizeGening: false, // 是否正在生成红包

      coverType: '',
      chkNoBack: true,
      noBackMsg: this.$t('text.page_prizeSend_noBack'),
      coverId: '',
      account: '',
      popupLimit: {
        status: false
      },
      prizeLimit: {
        token: null,
        limitAmount: 0
      }
    }
  },
  computed: {
    ...mapState(['userData', 'keyboardStatus', 'env']),
    // 根据不同红包类型改变输入框类型及文案
    prizeAmountText () {
      if (this.shareType == 'lucky') {
        return this.$t('text.page_prizeSend_totalToken') // 代币总量
      } else {
        return this.$t('text.page_prizeSend_eachAmount') // 单个总量
      }
    },
    // 红包中单个红包的平均金额
    singleAmount () {
      if (this.prizeAmount) {
        if (this.shareType === 'lucky') {
          return this.$numeral(this.prizeAmount).divide(this.prizeCount).value()
        } else {
          return this.prizeAmount
        }
      } else {
        return 0
      }
    },
    // 红包中总共的金额
    totalAmount () {
      if (this.prizeAmount) {
        if (this.shareType === 'lucky') {
          return this.prizeAmount
        } else {
          return this.$numeral(this.prizeAmount).multiply(this.prizeCount).value()
        }
      } else {
        return 0
      }
    },
    // 是否可以点击生成红包按钮
    canGenPrize () {
      if (this.prizeAmount && this.prizeCount <= 200) {
        return true
      } else {
        return false
      }
    },
    prizeLimitDesc () {
      if (this.prizeLimit.limitAmount == 0) {
        return '无最低持仓量'
      } else {
        return '当前持仓量限制:' + this.prizeLimit.limitAmount + ' ' + this.prizeLimit.token.symbol
      }
    }
  },
  components: {
    tokenSelect,
    popupLimit
  },

  created () {
    this.fetchPageData()
  },
  methods: {
    async connect () {
      if (this.env.isInWx) {
        this.$toast('微信中请在浏览器中打开，谢谢')
        return
      }
      getWalletConnectWeb3()
      const interval = setInterval(async () => {
        if (this.$store.state.web3.defaultAccount) {
          this.account = utils.formatShortHash(this.$store.state.web3.defaultAccount)
          clearInterval(interval)
        }
      }, 2000)
    },
    checkWords () {
      if (!this.prizeSecret) {
        return
      }
      this.$http.post(this.$api.checkWords, {
        words: this.prizeSecret
      })
        .then(res => {
          if (res.data.data.code == 0) {
            // this.$toast(res.data.data.msg)
          } else {
            this.prizeSecret = ''
            this.$toast(`${this.$t('text.common_notice')}: ${res.data.data.msg}`)
          }
        })
        .catch(() => {
          // this.$toast('出错了')
        })
    },
    async fetchPageData () {
      try {
        await getWeb3Promise.then(
          async () => {
            if (this.$store.state.web3.defaultAccount) {
              this.account = utils.formatShortHash(this.$store.state.web3.defaultAccount)
            }
            this.pageStatus = 'ok'
          })
      } catch (e) {
        console.error('getWeb3', e)
      }
      // Promise.all([this.$store.dispatch('getUserData')])
      //   .then(([userData]) => {
      //     this.pageStatus = 'ok'
      //   })
    },

    /**
     * 页面各交互方法
     */
    // 折叠币种选择框
    handleChangeToken () {
      this.showTokenSelect = true
      this.$utils.setDocumentTitle(this.$t('text.page_prizeSend_chooseToken'))
    },
    // 更改币种
    confirmChangeToken (tokenItem) {
      this.selectedTokenItem = tokenItem
      this.$utils.setDocumentTitle(this.$t('text.page_title_prizeSend'))
    },
    changeType () {
      if (this.shareType == 'lucky') {
        this.shareType = 'equal'
      } else {
        this.shareType = 'lucky'
      }
    },
    showPopupLimit (item, limit) {
      if (limit > 0) {
        let tokenAddr = item.address
        if (tokenAddr.toLowerCase() == '0x000000000000000000000000000000000000beef') {
          tokenAddr = '0x0000000000000000000000000000000000000000'
        }
        let token = getTokenInfo(tokenAddr)
        this.popupLimit.desc = '当前持仓量限制:' + limit + ' ' + token.symbol
        this.popupLimit.amount = limit
        this.popupLimit.symbol = token.symbol
      } else {
        this.popupLimit.desc = '当前没有设置最低持仓量'
        this.popupLimit.amount = 0
        this.popupLimit.symbol = ''
      }

      this.popupLimit.status = true
    },
    confirmLimit (params) {
      this.prizeLimit.token = params.token
      this.prizeLimit.limitAmount = params.limit
    },

    /**
     * 表单相关方法
     */
    // 检查代币总量数目
    checkPrizeAmount (e) {
      // 校验是否输入正确的数量: 请输入正确的{type}
      if (!this.prizeAmount) {
        this.$toast(this.$t('text.page_prizeSend_enterRigthType', { type: this.prizeAmountText }))
        e.target.value = ''
        return false
      }
      if (this.prizeAmount < +this.selectedTokenItem.minAmount) {
        // 例：代币总量应不小于1个BTC
        // {type}应不小于{amount}个{token}
        this.$toast(this.$t('text.page_prizeSend_noLessThanWithPlaceholder', { type: this.prizeAmountText, amount: +this.selectedTokenItem.minAmount, token: this.selectedTokenItem.currency }))
        this.prizeAmount = +this.selectedTokenItem.minAmount
        return false
      } else if (this.prizeAmount > +this.selectedTokenItem.maxAmount) {
        // 例：代币总量应不大于1个BTC
        // {type}应不大于{amount}个{token}
        this.$toast(this.$t('text.page_prizeSend_noGreaterThanWithPlaceholder', { type: this.prizeAmountText, amount: +this.selectedTokenItem.maxAmount, token: this.selectedTokenItem.currency }))
        this.prizeAmount = +this.selectedTokenItem.maxAmount
        return false
      } else {
        this.prizeAmount = parseFloat(this.prizeAmount.toFixed(this.selectedTokenItem.precision))
        return true
      }
    },
    // 检查红包份数
    checkPrizeCount (e) {
      // 校验是否输入正确的数量: 请输入正确的红包个数
      if (!this.prizeCount || this.prizeCount % 1 != 0) {
        this.$toast(this.$t('text.page_prizeSend_enterRigthType', { type: this.$t('text.page_prizeSend_prizeNum') }))
        this.prizeCount = ''
        e.target.value = ''
        return false
      }
      if (this.prizeCount <= 0) {
        // 红包个数应不小于{num}个
        this.$toast(this.$t('text.page_prizeSend_prizeNumNoLessThan', { num: 1 }))
        this.prizeCount = 1
        return false
      }
      if (this.prizeCount > this.selectedTokenItem.maxCount) {
        // 红包个数应不大于{num}个
        this.$toast(this.$t('text.page_prizeSend_prizeNumNoGreaterThan', { num: this.selectedTokenItem.maxCount }))
        this.prizeCount = this.selectedTokenItem.maxCount
        return false
      }
      return true
    },
    // 检查红包数据是否正常
    checkPrizeStatus () {
      if (this.checkPrizeAmount() && this.checkPrizeCount()) {
        if (this.singleAmount < +this.selectedTokenItem.minAmount) {
          // 单个红包金额不低于{amount}，请重新填写金额
          this.$toast(this.$t('text.page_prizeSend_prizeAmountNoLessThan', { amount: +this.selectedTokenItem.minAmount }) + ', ' + this.$t('text.page_prizeSend_enterAmountAgain'))
        } else if (this.totalAmount > +this.selectedTokenItem.balance) {
          this.$messagebox({
            title: ' ',
            message: `您的币币账户 ${this.selectedTokenItem.currency} 不足，请前往充值或划转`
          })
        } else {
          return true
        }
      }
      return false
    },
    async checkPrizeSecret () {
      if (this.prizeSecret.length > 0) {
        if (this.prizeSecret.length > 16) {
          this.$toast(this.$t('text.page_prizeSend_tooManyNotes'))
          return false
        }
        let packetId = await getPacketIdBySecret(this.prizeSecret)
        if (packetId) {
          this.$toast(this.$t('text.page_prizeSend_phrase_exists'))
          return false
        }
        this.checkWords()
        return true
      } else {
        return true
      }
    },
    // 输入支付密码
    async beginSendPrize () {
      if (this.canGenPrize && this.checkPrizeStatus() && (await this.checkPrizeSecret())) {
        this.$indicator.open('开始生成链上红包，请授权确认')
        let packetType = this.shareType == 'lucky' ? 1 : 2
        let limitToken = this.prizeLimit.token
        if (limitToken) {
          limitToken = limitToken.address
        } else {
          limitToken = '0x0000000000000000000000000000000000000000'
        }
        setTokenPrize(this.selectedTokenItem.address, packetType, this.totalAmount, this.prizeCount, this.prizeSecret, limitToken, this.prizeLimit.limitAmount)
        console.log(this.$store.state)
        doSend()
        const interval = setInterval(() => {
          console.log('get status')
          let sendObj = this.$store.state.send
          if (sendObj.txs && sendObj.txs[sendObj.txs.length - 1]) {
            if (sendObj.txs[sendObj.txs.length - 1].name.indexOf('Approval') === -1) {
              this.$indicator.close()
              if (sendObj.txs[sendObj.txs.length - 1].status != 'mined') {
                this.$toast(sendObj.txs[sendObj.txs.length - 1].name)
              } else {
                if (this.prizeSecret) {
                  this.$toast('口令红包上链成功：' + utils.formatShortHash(sendObj.txs[0].hash))
                  this.$router.push(`prizeShare?secret=${this.prizeSecret}&symbol=${this.selectedTokenItem.currency}`)
                } else {
                  let seed = sendObj.seed
                  this.$toast('红包上链成功：' + utils.formatShortHash(sendObj.txs[0].hash))
                  this.$router.push(`prizeShare?seed=${seed}&symbol=${this.selectedTokenItem.currency}`)
                }
                clearInterval(interval)
              }
            }
          }
          console.log(this.$store.state.send)
        }, 3000)
      }
    },
    // 跳转到红包增强
    goPrizeExtend () {
      this.$utils.goPrizeExtend()
    }
  }
}
</script>

<style lang="scss" scoped>
.page-container {
  box-sizing: border-box;
  padding-bottom: 4rem;
}
.container {
  position: relative;
}
.top-operate {
  position: relative;
  z-index: 30;
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

  }
}
.user {
  display: flex;
  align-items: center;
  padding: .4rem 0 .4rem .32rem;
  .avatar {
    width: .98rem;
    height: .98rem;
    flex: 0 0 .98rem;
    border-radius: 50%;
    background-color: #ccc;
  }

  .user-total {
    flex: 1;
    width: 0;
    margin-left: .34rem;
    .amount {
      font-size: .44rem;
      line-height: .5rem;
      color: #14181F;
      font-weight: 500;
    }
    .text {
      padding-top: .06rem;
      font-size: .24rem;
      line-height: .34rem;
      color: #999999;
    }
    .wallet-connect{
      float:right;
      margin-top: 0.1rem;
      font-size: .24rem;
      line-height: .34rem;
      color: #2370FB;
      margin-right: 0.5rem;
    }
  }
}

// 发送表单
.prize-form {
  padding: 0 .3rem 0;
  .input-prizeAmount {
    padding: .26rem .3rem .38rem;
    border-radius: .1rem;
    background-color: #F8F8F8;
    .field-wrap {
      display: flex;
      align-items: center;
      .field {
        font-size: .28rem;
        line-height: .34rem;
        color: #101010;
        font-weight: 500;
      }
      .tag {
        margin-left: .24rem;
        width: 1.14rem;
        height: .34rem;
        background-image: url('~@/assets/img/icons/tag_lucky.png');
        background-size: 100% 100%;
      }
    }
    .input-wrap {
      margin-top: .3rem;
      display: flex;
      .input {
        margin-top: .06rem;
        width: 3rem;
        flex: 1;
        font-size: .56rem;
        line-height: .58rem;
        color: $mainColor;
        &::-webkit-input-placeholder {
          color: #ccc;
        }
      }
      .token-selector {
        display: flex;
        align-items: center;
        .token-logo {
          width: .48rem;
          height: .48rem;
          border-radius: 50%;
        }
        .token-symbol {
          position: relative;
          height: .36rem;
          margin-left: .16rem;
          padding-right: .34rem;
          font-size: .32rem;
          line-height: .36rem;
          color: #101010;
          &:after {
            content: '';
            position: absolute;
            right: .12rem;
            top: 0.08rem;
            width: .14rem;
            height: .2rem;
            background-image: url('~@/assets/img/icons/arrow_right_02.png');
            background-size: 100% 100%;
            transition: transform .3s;
          }
        }
        &.active {
          .token-symbol:after {
            transform: rotate(90deg);
          }
        }
      }
    }
  }
  .input-type {
    padding: .28rem .28rem .4rem;
    display: flex;
    .prize-type {
      flex: 1;
      font-size: .24rem;
      line-height: .28rem;
      color: #2370FB;
      span {
        color: #999;
      }
    }
    .asset {
      font-size: .24rem;
      line-height: .28rem;
      color: #999;
      .amount {
        color: #101010;
        font-weight: 500;
      }
    }
  }
  .input-prizeCount {
    display: flex;
    align-items: center;
    padding: .32rem .3rem;
    border-radius: .1rem;
    background-color: #F8F8F8;
    .field {
      font-size: .28rem;
      line-height: .32rem;
      color: #101010;
      font-weight: 500;
      .unit {
        padding-left: .16rem;
        color: #B9B9B9;
      }
    }
    .input {
      width: 3rem;
      flex: 1;
      font-size: .56rem;
      line-height: .58rem;
      color: $mainColor;
      text-align: right;
      &::-webkit-input-placeholder {
        color: #ccc;
      }
    }
  }

  .upgrade-prizeCount {
    padding: .3rem .3rem 0;
    .upgrade-prizeCount-link {
      font-size: .24rem;
      line-height: 1.1;
      color: #2370FB;
      text-align: right;
    }
  }
  .input-prizeSecret {
    margin-top: .4rem;
    padding: .4rem .3rem;
    border-radius: .1rem;
    background-color: #F8F8F8;
    .input {
      width: 100%;
      font-size: .28rem;
      line-height: .36rem;
      color: #333333;
      &::-webkit-input-placeholder {
        color: #ccc;
      }
    }
  }

  .prizeCover {
    padding-top: .6rem;
    margin-right: -.3rem;
    .title-wrap {
      padding: 0 .5rem 0 .2rem;
      display: flex;
      align-items: center;
      .title-text {
        flex: 1;
        font-size: .32rem;
        line-height: .34rem;
        color: #101010;
        font-weight: 500;
      }
      .more {
        position: relative;
        margin-right: .2rem;
        font-size: .24rem;
        line-height: .3rem;
        color: #2370FB;
        .arrow {
          @include arrow-right(#2370FB);
        }
      }
    }
    .prizeCover-list {
      padding: .42rem 0 .4rem .2rem;
      display: flex;
      overflow-x: auto;
      .prizeCover-item {
        position: relative;
        width: 1.4rem;
        height: 1.4rem;
        flex: 0 0 1.4rem;
        margin-right: .3rem;
        background-color: #eee;
        .prizeCover-img {
          width: 100%;
          height: 100%;
        }
        .prizeCover-img-tag {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background-color: rgba(0, 0, 0, .5);
          font-size: .24rem;
          line-height: .42rem;
          color: #FFFFFF;
          text-align: center;
        }
        &.active:after {
          content: '';
          position: absolute;
          left: -0.1rem;
          top: -0.1rem;
          right: -0.1rem;
          bottom: -0.1rem;
          border: solid 1px #EF4E4C;
        }
        &.prizeCover-custom {
          background-color: #E6F1FE;
          text-align: center;
          .icon {
            margin-top: .22rem;
            width: .36rem;
            height: .36rem;
          }
          .text {
            padding-top: .12rem;
            font-size: .2rem;
            line-height: .3rem;
            color: #2370FB;
          }
        }
      }
      .gap {
        width: .3rem;
        flex: 0 0 .3rem;
      }
    }
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
  .input-limit {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 0.24rem;
    line-height: .28rem;
    .field {
      color: #A4A8B3;
    }
    .limit-text {
      padding-left: .2rem;
      color: #2370FB;
    }
    .icon {
      margin-left: .1rem;
      width: .11rem;
      height: .18rem;
      background-image: url('~@/assets/img/icons/arrow_right_01.png');
      background-size: 100% 100%;
    }
  }
  .btn-gen {
    width: 6.2rem;
    margin: .6rem auto 0;
  }
}
.input-noback {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 0.24rem;
    line-height: .28rem;
    margin-top:10px;
    .field{
      width:16px;
      height:16px;
      margin-right:5px;
    }
    input{
      appearance: checkbox;
      -moz-appearance: checkbox;
      -webkit-appearance: checkbox;
    }
    label{
      color: #2370FB;
    }
  }
</style>
