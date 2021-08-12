<template>
  <section class="prize-sent">

    <popupLimit
      :status="popupLimit.status"
      :amount="popupLimit.amount"
      :symbol="popupLimit.symbol"
      :desc="popupLimit.desc"
      @closePopup="popupLimit.status = false"
      @confirmLimit="confirmLimit"
    ></popupLimit>

    <div class="navbar">
      <router-link to="recordOpen" replace class="navbar-item">{{ $t("text.page_record_prizeReceived") }}</router-link>
      <router-link to="recordSend" replace class="navbar-item active">{{ $t("text.page_record_prizeSent") }}</router-link>
    </div>

    <section v-if="pageStatus == 'ok'">
      <ul v-if="pageData.pageList && pageData.pageList.length" class="list">
        <li v-for='(item, index) in pageData.pageList' :key='index'  class="item">
          <div class="item-info" @click='goPrizeDetail(item)'>
            <p v-if="item.packetType === '1'" class="type">拼手气红包</p>
            <p v-else-if="item.packetType === '2'" class="type">普通红包</p>
          </div>
          <div class="item-value">
            <p class="count dinMedium text-hidden-one">{{ +item.packetAmount }} {{ item.token.symbol }}</p>
            <p v-if="item.status === 'doing'" class="status">{{ $t('text.page_record_received') }}{{ item.claimCount }}/{{ item.packetCount }}
              <a class="btn-recall" @click="recall(item)">{{ $t('text.page_record_btn_recall') }}</a>
              <a class="btn-recall" @click="setting(item)">{{ $t('text.page_record_btn_limit') }}</a></p>
            <p v-else-if="item.status === 'empty'" class="status">{{ $t('text.page_record_allReceived') }}</p>
            <p v-else-if="item.status === 'recall'" class="status">{{ $t('text.page_record_allRecalled') }}</p>
          </div>
        </li>
        <mt-spinner v-if='isLoading' color='#aaa' class='common-loading-icon' type="triple-bounce"></mt-spinner>
        <p v-if='isLoadOver' class="common-loading-over">{{$t("text.common_noMore")}}</p>
      </ul>

      <!-- 没有数据的情况 -->
      <no-data v-else />
    </section>

    <pageLoading v-else color="#EF4E4C" />
  </section>
</template>

<script>

import { getWeb3Promise, getTokenInfo } from '../utils/getToken'
import popupLimit from '@/components/popup/popupLimit'
import { getPacketInfo, getMyPackets } from '../utils/tokenPrize'
import { recallPacket, setPacketLimit } from '../utils/sendPrize'
import utils from '../utils/utils'
import { BigNumber, FixedNumber } from '@ethersproject/bignumber'
export default {
  name: 'recordSend',
  data () {
    return {
      pageStatus: '',
      pageData: {},
      mypackets: [],
      isLoading: false, // 是否正在加载
      isLoadOver: false, // 是否加载完毕
      currentPage: 1, // 当前页面
      perPage: 20, // 每页显示的数量
      popupLimit: {
        status: false,
        selPacketId: 0,
        selLimitToken: '',
        selLimitAmount: 0
      }
    }
  },
  components: {
    popupLimit
  },
  async created () {
    try {
      let that = this
      await getWeb3Promise.then(
        async () => {
          let pkey = utils.getAddressPrefix(this.$store.state.web3.defaultAccount) + '_packets'
          let packets = localStorage.getItem(pkey)
          if (!(packets = JSON.parse(packets))) {
            packets = {}
          }
          console.log(packets)
          let packetIds = await getMyPackets()
          for (let i in packetIds) {
            if (!packets[packetIds[i]]) {
              packets[packetIds[i]] = {
                packetId: packetIds[i],
                seed: ''
              }
            }
          }
          Object.keys(packets).forEach(async function (key) {
            let packetItem = packets[key]
            let packetInfo = await getPacketInfo(packetItem.packetId)
            if (parseInt(packetInfo.packetId) > 0) {
              packetInfo.seed = packetItem.seed
              packetInfo.token = getTokenInfo(packetInfo.token)

              if (packetInfo.remainAmount > 0) {
                packetInfo.status = 'doing'
              } else if ((packetInfo.claimCount == packetInfo.packetCount) && packetInfo.remainCount == 0) {
                packetInfo.status = 'empty'
              } else if (packetInfo.remainCount == 0) {
                packetInfo.status = 'recall'
              }
              packetInfo.remainAmount = FixedNumber.from(BigNumber.from(packetInfo.remainAmount).mul(BigNumber.from(10000)).div(that.getMultiplier(packetInfo.token))).divUnsafe(FixedNumber.from(10000))
              packetInfo.packetAmount = FixedNumber.from(BigNumber.from(packetInfo.packetAmount).mul(BigNumber.from(10000)).div(that.getMultiplier(packetInfo.token))).divUnsafe(FixedNumber.from(10000))

              that.mypackets.push(packetInfo)
            }
          })
        })
    } catch (e) {
      console.error('getWeb3', e)
    }
    let count = 0
    const interval = setInterval(() => {
      count++
      if (this.mypackets.length > 0) {
        this.pageData.pageList = this.mypackets
        clearInterval(interval)
        console.log(this.pageData.pageList)
        this.pageStatus = 'ok'
      }
      if (count > 5) {
        this.pageStatus = 'ok'
        clearInterval(interval)
      }
    }, 1000)
  },
  methods: {
    async recall (item) {
      let confirmTitle = '您确定要撤回此红包吗，请确认'
      let action = await this.$messagebox({
        title: confirmTitle,
        showCancelButton: true
      })
      if (action === 'cancel') {
        return
      }
      this.$indicator.open('发起撤回红包')
      recallPacket(item.packetId)

      const interval = setInterval(() => {
        console.log(this.$store.state.chainop)
        if (this.$store.state.chainop.message && this.$store.state.chainop.status != 'mined') {
          this.$indicator.close()
          this.$toast(this.$store.state.chainop.message)
        } else if (this.$store.state.chainop.message && this.$store.state.chainop.status == 'mined') {
          this.$indicator.close()
          this.$toast('撤回成功：' + utils.formatShortHash(this.$store.state.chainop.hash))
          window.location.reload()
          clearInterval(interval)
        }
      }, 1000)
    },
    setting (item) {
      if (item.limitAmount > 0) {
        let tokenAddr = item.limitToken
        if (tokenAddr.toLowerCase() == '0x000000000000000000000000000000000000beef') {
          tokenAddr = '0x0000000000000000000000000000000000000000'
        }
        let token = getTokenInfo(tokenAddr)
        const decimals = BigNumber.from(token.decimal)
        const multiplier = BigNumber.from(10).pow(decimals)
        let amount = FixedNumber.from(BigNumber.from(item.limitAmount).mul(BigNumber.from(100000)).div(multiplier)).divUnsafe(FixedNumber.from(100000))
        this.popupLimit.desc = '当前持仓量限制:' + amount + ' ' + token.symbol
        this.popupLimit.amount = amount.toString()
        this.popupLimit.symbol = token.symbol
        this.popupLimit.selLimitAmount = this.popupLimit.amount
        this.popupLimit.selLimitToken = item.limitToken
      } else {
        this.popupLimit.desc = '当前没有设置最低持仓量'
        this.popupLimit.amount = 0
        this.popupLimit.symbol = ''
      }
      this.popupLimit.selPacketId = item.packetId
      this.popupLimit.status = true
    },
    getMultiplier (token) {
      const decimals = BigNumber.from(token.decimal)
      return BigNumber.from(10).pow(decimals)
    },
    confirmLimit (params) {
      let token = params.token
      let limit = params.limit

      let tokenAddr = token.address
      if (tokenAddr.toLowerCase() == '0x0000000000000000000000000000000000000000') {
        tokenAddr = '0x000000000000000000000000000000000000beef'
      }
      if (this.popupLimit.selLimitToken.toLowerCase() == tokenAddr.toLowerCase() && parseInt(limit * 100000) == parseInt(this.popupLimit.selLimitAmount * 100000)) {
        this.$toast('没有变化')
        return
      }
      this.$indicator.open('发起设置限额')
      setPacketLimit(this.popupLimit.selPacketId, token.address, limit)
      const interval = setInterval(() => {
        console.log(this.$store.state.chainop)
        if (this.$store.state.chainop.message && this.$store.state.chainop.status != 'mined') {
          this.$indicator.close()
          this.$toast(this.$store.state.chainop.message)
        } else if (this.$store.state.chainop.message && this.$store.state.chainop.status == 'mined') {
          this.$indicator.close()
          this.$toast('设置限额成功：' + utils.formatShortHash(this.$store.state.chainop.hash))
          window.location.reload()
          clearInterval(interval)
        }
      }, 1000)
      // recallPacket(item.packetId)

      // const interval = setInterval(() => {
      //   console.log(this.$store.state.chainop)
      //   if (this.$store.state.chainop.message && this.$store.state.chainop.status != 'mined') {
      //     this.$indicator.close()
      //     this.$toast(this.$store.state.chainop.message)
      //   } else if (this.$store.state.chainop.message && this.$store.state.chainop.status == 'mined') {
      //     this.$indicator.close()
      //     this.$toast('撤回成功：' + utils.formatShortHash(this.$store.state.chainop.hash))
      //     window.location.reload()
      //     clearInterval(interval)
      //   }
      // }, 1000)
    },
    goPrizeDetail (item) {
      this.$router.push(`prizeDetail?packetId=${item.packetId}&seed=${item.seed}&symbol=${item.token.symbol}`)
    }
  }
}
</script>

<style lang="scss" scoped>
.prize-sent {
  background-color: #f9f9f9;
  min-height: 100%;
  box-sizing: border-box;
  padding-bottom: 1rem;
}

.navbar {
  display: flex;
  margin-bottom: .18rem;
  justify-content: space-between;
  align-items: center;
  background-color: #fff;
  .navbar-item {
    position: relative;
    flex: 1;
    padding: .2rem 0 .32rem;
    font-size: .32rem;
    line-height: .44rem;
    font-weight: 500;
    color: #8E929B;
    text-align: center;
    &.active {
      color: #14181F;
      &:after {
        content: '';
        position: absolute;
        bottom: .16rem;
        left: 50%;
        width: .44rem;
        height: .08rem;
        margin-left: -.22rem;
        border-radius: .04rem;
        background-color: $mainColor;
      }
    }
  }
}

.list {
  position: relative;
  padding: 0 0 1rem .32rem;
  background-color: #fff;
  .item {
    display: flex;
    padding: .26rem .32rem .26rem 0;
    @include bb-1px(#F2F2F2);
    .item-info {
      .type {
        font-size: .32rem;
        line-height: .44rem;
        color: #14181F;
        font-weight: bold;
      }
      .time {
        padding-top: .08rem;
        font-size: .24rem;
        line-height: .34rem;
        color: #A4A8B3;
      }
    }
    .item-value {
      flex: 1;
      width: 0;
      text-align: right;
      .count {
        font-size: .32rem;
        line-height: .44rem;
        color: #14181F;
        font-weight: 500;
      }
      .value {
        padding-top: .08rem;
        font-size: .24rem;
        line-height: .34rem;
        color: #A4A8B3;
      }
      .status {
        padding-top: .08rem;
        font-size: .24rem;
        line-height: .34rem;
        color: #A4A8B3;
        &.status3 {
          color: #FD6565;
        }
        .btn-recall {
          padding-left:0.1rem;
          flex: 1;
          font-size: .24rem;
          line-height: .28rem;
          color: #2370FB;
          span {
            color: #999;
          }
        }
      }
    }
  }
}
</style>
