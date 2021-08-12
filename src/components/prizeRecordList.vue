<template>
  <section v-if="prizeRecord && (prizeRecord.recordList.length || noRecordVisible)" class="receive">
    <div class="receive-title">
      <!-- 正在领取中 -->
      <p v-if="prizeRecord.status == 'doing'" class="info-text">
        <!-- 已经取 {领取个数}/{总个数}, 剩余{剩余金额}/{总金额} -->
        {{ $t('text.page_prizeDetail_received') }} {{ prizeRecord.packetCount - prizeRecord.remainCount }}/{{ prizeRecord.packetCount }}
        <span v-if='isSender'>, {{ $t('text.page_prizeDetail_remaining') }} {{ +prizeRecord.remainAmount }}/{{ +prizeRecord.packetAmount }}</span>
      </p>
      <!-- 已领完并且没有退回 -->
      <p v-else-if="prizeRecord.status === 'empty'" class="info-text">
        {{ prizeRecord.packetCount }} {{$t("text.page_prizeDetail_numTokens_tip")}}，
        <span v-if='isSender'>{{$t("text.page_prizeDetail_total_tip")}} {{ +prizeRecord.packetAmount }} {{ token.symbol }}</span>
        {{$t("text.page_prizeDetail_airdropTime_tip")}}
      </p>
      <p v-else-if="prizeRecord.status === 'recall'" class="info-text">
        {{ prizeRecord.claimCount }}/{{ prizeRecord.packetCount }} {{$t("text.page_prizeDetail_numTokens_tip")}}，
        <span v-if='isSender'>{{$t("text.page_prizeDetail_total_tip")}} {{ +prizeRecord.packetAmount }} {{ token.symbol }}</span>
        {{$t("text.page_prizeDetail_airdropRecall_tip")}}
      </p>
    </div>

    <ul class="receive-list" v-infinite-scroll='loadMore' infinite-scroll-distance='10'>
      <li v-for='(item, index) in prizeRecord.recordList' :key="index" class="receive-item">
        <img class="avatar" src="https://bitcv.kingco.tech/defaultavatar.png">
        <div class="info-l">
          <p class="name">
            <span class="name-text text-hidden-one">{{ item.addr }}</span>
            <!--span v-if="item.isNew" class="badge">新</span-->
          </p>
          <p class="time">{{ item.ts * 1000 | dateFormat }}</p>
        </div>
        <div class="info-r">
          <div class="amount-wrap">
            <p class="amount text-hidden-one dinMedium">{{ +item.amount }} {{ token.symbol }}</p>
          </div>
          <!--p class="rmb-value text-hidden-one" v-if='+item.value >= 0'>≈{{ $t("text.common_currencySymbol") }}{{ +item.value }}</p-->
          <p v-if='item.isLucky' class="lucky"><span class="icon"></span><span class="text">{{ $t('text.page_prizeDetail_luckiest') }}</span></p>
        </div>
      </li>
      <mt-spinner v-if='isLoading' color='#aaa' class='common-loading-icon' type="triple-bounce"></mt-spinner>
      <p v-if='isLoadOver' class="common-loading-over">{{$t("text.common_noMore")}}</p>
    </ul>
  </section>
</template>

<script>
import { getWeb3Promise, getTokenInfo } from '../utils/getToken'

import { getClaimedAmounts, getClaimedTimestamps, getPacketInfo, getClaimAddress } from '../utils/tokenPrize'
import utils from '../utils/utils'

import { BigNumber, FixedNumber } from '@ethersproject/bignumber'
export default {
  name: 'prizeRecordList',
  props: {
    packetId: Number,
    isSender: {
      type: [Boolean, Number],
      default: false
    },
    // 没有记录时是否展示
    noRecordVisible: {
      type: Boolean,
      default: true
    }
  },
  data () {
    return {
      prizeRecord: {
        recordList: []
      },
      // recordList.status 领取记录状态 { claimed: '已领取', confrmed: '已领取并合格过', cancelled: '已退回' }
      token: null,
      isLoading: false, // 是否正在加载
      isLoadOver: false, // 是否加载完毕
      perPage: 20, // 每页显示的数量
      addresses: []
    }
  },
  mounted () {
    this.getPrizeRecord()
  },
  methods: {
    getMultiplier () {
      const decimals = BigNumber.from(this.token.decimal)
      return BigNumber.from(10).pow(decimals)
    },
    async getPrizeRecord () {
      await getWeb3Promise.then(
        async () => {
          if (this.packetId) {
            this.addresses = await getClaimAddress(this.packetId)
            let balances = await getClaimedAmounts(this.packetId)
            let timestamps = await getClaimedTimestamps(this.packetId)

            this.prizeRecord = await getPacketInfo(this.packetId)
            this.token = getTokenInfo(this.prizeRecord.token)
            if (this.prizeRecord.remainCount > 0) {
              this.prizeRecord.status = 'doing'
            } else if (this.prizeRecord.remainCount == 0 && this.prizeRecord.claimCount == this.prizeRecord.packetCount) {
              this.prizeRecord.status = 'empty'
            } else if (this.prizeRecord.remainCount == 0) {
              this.prizeRecord.status = 'recall'
            }
            this.prizeRecord.remainAmount = FixedNumber.from(BigNumber.from(this.prizeRecord.remainAmount).mul(BigNumber.from(100000)).div(this.getMultiplier())).divUnsafe(FixedNumber.from(100000))
            this.prizeRecord.packetAmount = FixedNumber.from(BigNumber.from(this.prizeRecord.packetAmount).mul(BigNumber.from(100000)).div(this.getMultiplier())).divUnsafe(FixedNumber.from(100000))
            this.prizeRecord.recordList = []
            let isLucky = false
            let ts = 0
            for (let idx in this.addresses) {
              isLucky = false
              if (this.addresses[idx] == this.prizeRecord.maxAddress) {
                isLucky = true
              }
              ts = timestamps[idx]
              // console.log(ts)
              // var d = new Date(ts * 1000)
              // var ds = (d.getFullYear()) + '-' + (d.getMonth() + 1) + '-' + (d.getDate()) + ' ' + (d.getHours()) + ':' + (d.getMinutes()) + ':' + (d.getSeconds())
              // console.log(isLucky)
              this.prizeRecord.recordList.push({
                addr: utils.formatShortHash(this.addresses[idx]),
                amount: FixedNumber.from(BigNumber.from(balances[idx]).mul(BigNumber.from(100000)).div(this.getMultiplier())).divUnsafe(FixedNumber.from(100000)),
                isLucky: isLucky,
                ts
              })
            }
          }
        })
    },
    loadMore () {
    },

    spendTime () {
      // diffSecond 为秒，计算均按秒计
      const minute = 60
      const hour = minute * 60
      const minC = this.prizeRecord.diffSecond / minute
      const hourC = this.prizeRecord.diffSecond / hour
      if (minC < 1) {
        return this.prizeRecord.diffSecond + ' ' + this.$tc('text.common_second', this.prizeRecord.diffSecond) // * 秒
      } else if (hourC < 1) {
        return Math.ceil(minC) + ' ' + this.$tc('text.common_minute', Math.ceil(minC)) // * 分钟
      } else {
        return Math.ceil(hourC) + ' ' + this.$tc('text.common_hour', Math.ceil(hourC)) // * 小时
      }
    }
  }
}
</script>

<style lang="scss" scoped>
// 领取列表
.receive {
  background-color: #fff;
  position: relative;
  .receive-title {
    padding: .3rem .32rem .26rem;
    @include bb-1px(RGBA(165, 165, 165, .2));
    .info-text {
      font-size: .24rem;
      line-height: .34rem;
      color: #909090;
    }
  }
  .receive-list {
    position: relative;
    padding: 0 0 1.2rem .32rem;
    .receive-item {
      display: flex;
      padding: .24rem .32rem .24rem 0;
      @include bb-1px(#EEEEEE);
      .avatar {
        width: .88rem;
        height: .88rem;
        flex: 0 0 .88rem;
        border-radius: 50%;
      }
      .info-l {
        flex: 1;
        width: 0;
        padding-left: .24rem;
        .name {
          padding-top: .02rem;
          display: flex;
          align-items: center;
          .name-text {
            font-size: .32rem;
            line-height: .44rem;
            color: #14181F;
            font-weight: bold;
          }
          .badge {
            flex-shrink: 0;
            margin-left: .16rem;
            padding: 0 .16rem;
            height: .3rem;
            background-color: rgba(1, 94, 245, .1);
            border-radius: .15rem;
            font-size: .18rem;
            line-height: .3rem;
            color: #015EF5;
            font-weight: 500;
            text-align: center;
          }
        }
        .time {
          padding-top: .08rem;
          font-size: .24rem;
          line-height: .34rem;
          color: #A4A8B3;
        }
      }
      .info-r {
        flex: 1;
        width: 0;
        text-align: right;
        .amount-wrap {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          .badge {
            flex-shrink: 0;
            margin-right: .16rem;
            padding: 0 .16rem;
            height: .3rem;
            background-color: rgba(255, 0, 0, .1);
            border-radius: .15rem;
            font-size: .18rem;
            line-height: .3rem;
            color: #FF4444;
            font-weight: 500;
            text-align: center;
          }
          .amount {
            padding-top: .02rem;
            font-size: .34rem;
            line-height: .44rem;
            color: #14181F;
          }
        }
        .rmb-value {
          padding-top: .08rem;
          font-size: .24rem;
          line-height: .34rem;
          color: #A4A8B3;
        }
        .lucky {
          display: inline-flex;
          align-items: center;
          margin-top: .12rem;
          padding: 0 .16rem;
          height: .32rem;
          border-radius: .16rem;
          background-color: rgba(255, 148, 43, .1);
          .icon {
            position: relative;
            bottom: .02rem;
            width: .18rem;
            height: .18rem;
            background-image: url('~@/assets/img/icons/lucky.png');
            background-size: 100% 100%;
          }
          .text {
            margin-left: .08rem;
            font-size: .18rem;
            line-height: .24rem;
            color: #FF942B;
            font-weight: 500;
          }
        }
      }
    }
  }
}
</style>
