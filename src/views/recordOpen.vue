<template>
  <section class="prize-received">
    <div class="navbar">
      <router-link to="recordOpen" replace class="navbar-item active">{{ $t("text.page_record_prizeReceived") }}</router-link>
      <router-link to="recordSend" replace class="navbar-item">{{ $t("text.page_record_prizeSent") }}</router-link>
    </div>

    <section v-if="pageStatus == 'ok'">
      <ul v-if="pageData.pageList && pageData.pageList.length" class="list" v-infinite-scroll='loadMore' infinite-scroll-distance='10'>
        <li v-for='(item, index) in pageData.pageList' :key='index' @click='goPrizeDetail(item)' class="item">
          <img class="sender" :src='item.token.logoURI'>
          <div class="item-info">
            <p class="from text-hidden-one">来自 <span class="name">{{ item.owner }}</span></p>
          </div>
          <div class="item-value">
            <p class="count dinMedium text-hidden-one">{{ +item.myAmount }} {{ item.token.symbol }}</p>
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
import { getPacketInfo, getMyAmount } from '../utils/tokenPrize'
import utils from '../utils/utils'
import { BigNumber, FixedNumber } from '@ethersproject/bignumber'
export default {
  name: 'recordOpen',
  data () {
    return {
      pageStatus: '',
      pageData: {},
      mypackets: [],
      isLoading: false, // 是否正在加载
      isLoadOver: false, // 是否加载完毕
      currentPage: 1, // 当前页面
      perPage: 20 // 每页显示的数量
    }
  },
  async created () {
    try {
      let that = this
      await getWeb3Promise.then(
        async () => {
          let pkey = utils.getAddressPrefix(this.$store.state.web3.defaultAccount) + '_opened'
          let packets = localStorage.getItem(pkey)
          if (!(packets = JSON.parse(packets))) {
            packets = {}
          }
          Object.keys(packets).forEach(async function (key) {
            let packetItem = packets[key]
            let packetInfo = await getPacketInfo(packetItem.packetId)

            if (parseInt(packetInfo.packetId) > 0) {
              packetInfo.seed = packetItem.seed
              packetInfo.token = getTokenInfo(packetInfo.token)

              if (packetInfo.remainAmount > 0) {
                packetInfo.status = 'doing'
              } else if ((packetInfo.claimCount == packetInfo.packetCmount) && packetInfo.remainCount == 0) {
                packetInfo.status = 'empty'
              } else if (packetInfo.remainCount == 0) {
                packetInfo.status = 'recall'
              }
              packetInfo.owner = utils.formatShortHash(packetInfo.owner)
              packetInfo.remainAmount = FixedNumber.from(BigNumber.from(packetInfo.remainAmount).mul(BigNumber.from(10000)).div(that.getMultiplier(packetInfo.token))).divUnsafe(FixedNumber.from(10000))
              packetInfo.packetAmount = FixedNumber.from(BigNumber.from(packetInfo.packetAmount).mul(BigNumber.from(10000)).div(that.getMultiplier(packetInfo.token))).divUnsafe(FixedNumber.from(10000))
              let balance = await getMyAmount(packetInfo.packetId)
              packetInfo.myAmount = FixedNumber.from(BigNumber.from(balance).mul(BigNumber.from(10000)).div(that.getMultiplier(packetInfo.token))).divUnsafe(FixedNumber.from(10000))
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
    // this.$http.get(this.$api.getOpenRecord, {
    //   params: {
    //     page: this.currentPage,
    //     perPage: this.perPage
    //   }
    // })
    //   .then(res => {
    //     if (res.data.errcode) {
    //       this.$toast(`${this.$t('text.common_notice')}: ${res.data.errmsg}`)
    //     } else {
    //       this.pageData = res.data.data
    //       this.pageStatus = 'ok'
    //     }
    //   })
  },
  methods: {
    getMultiplier (token) {
      const decimals = BigNumber.from(token.decimal)
      return BigNumber.from(10).pow(decimals)
    },
    loadMore () {
      // if (this.isLoading || this.isLoadOver) return
      // this.isLoading = true
      // this.$http.get(this.$api.getOpenRecord, {
      //   params: {
      //     page: this.currentPage + 1,
      //     perPage: this.perPage
      //   }
      // })
      //   .then(res => {
      //     this.isLoading = false
      //     if (res.data.errcode == 0) {
      //       if (!res.data.data.pageList.length) {
      //         this.isLoadOver = true
      //         return
      //       }
      //       this.currentPage++
      //       this.pageData.pageList.push(...res.data.data.pageList)
      //     } else {
      //       this.$toast(`提示: ${res.data.errmsg}`)
      //     }
      //   })
      //   .catch(() => {
      //     this.isLoading = false
      //   })
    },

    goPrizeDetail (item) {
      this.$router.push(`prizeDetail?packetId=${item.packetId}&seed=${item.seed}`)
    }
  }
}
</script>

<style lang="scss" scoped>
.prize-received {
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
    align-items: center;
    padding: .26rem .32rem .26rem 0;
    @include bt-1px(#F2F2F2);
    .sender {
      width: .5rem;
      height: .5rem;
      flex: 0 0 .5rem;
      border-radius: 50%;
    }
    .item-info {
      flex: 0 0 3rem;
      width: 3rem;
      margin-left: .24rem;
      .from {
        font-size: .24rem;
        line-height: .24rem;
        color: #B9B9B9;
        .name {
          font-size: .32rem;
          line-height: .44rem;
          color: #14181F;
          font-weight: bold;
        }
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
    }
  }
}
</style>
