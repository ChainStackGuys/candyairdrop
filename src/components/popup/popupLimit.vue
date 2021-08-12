<template>
  <!-- 选择币种框 -->
  <section class="popup" v-show='wrapStatus' @touchmove.prevent>
       <allTokenSelect
      v-show="showAllTokenSelect"
      :selectedToken="selectedTokenItem"
      @closeAllTokenSelect="showAllTokenSelect = false"
      @confirmChangeToken="confirmChangeToken"
    ></allTokenSelect>
    <transition name="zoomIn"  @before-enter="beforeEnter" v-on:after-leave="afterLeave">
      <div class="popup-content-wrap" v-show='status'>
        <div class="popup-close" @click='closePopup'></div>
        <div class="popup-content">
          <h3 class="title">{{ $t("text.page_record_popup_limit_title") }}</h3>
          <div class="info-wrap">
            <p class="info">{{ desc }}</p>
          </div>
          <div class="input-prizeAmount">
            <div class="field-wrap">
                <p class="field">{{$t("text.page_record_limit_popup_amount_title")}}</p>
            </div>
            <div class="input-wrap">
                <input v-resetInput v-watchKeyboard type="number" class="input dinMedium" :placeholder="selectedTokenItem.inputPlaceholder" v-model.number="limitAmount">
                <div class="token-selector" :class="{ 'active': showAllTokenSelect }" @click='handleChangeToken'>
                    <img class="token-logo" :src="selectedTokenItem.logoURI" alt="">
                    <p class="token-symbol">{{ selectedTokenItem.symbol }}</p>
                </div>
            </div>
            <a class="common-btn btn-confirm" href="javascript:;" @click="confirmLimit">确定</a>
          </div>
        </div>
      </div>
    </transition>

  </section>
</template>

<script>
import { mapState } from 'vuex'
import allTokenSelect from '@/components/allTokenSelect'
import { getTokenInfoBySymbol } from '../../utils/getToken'
export default {
  name: 'pageLimit',
  data () {
    return {
      wrapStatus: false, // 外层显示状态
      isConfirmed: false,
      showAllTokenSelect: false, // 币种类型选择框是否折叠
      selectedTokenItem: {},
      limitAmount: 0,
      currentTitle: document.title
    }
  },
  props: {
    status: Boolean,
    amount: [Number, String],
    symbol: String,
    desc: {
      type: String,
      default: '支付'
    },
    extraParas: {
      type: Object,
      default () {
        return {}
      }
    }
  },
  components: {
    allTokenSelect
  },
  computed: {
    ...mapState(['env'])
  },
  mounted () {
  },
  methods: {
    beforeEnter () {
      this.wrapStatus = true
      if (this.symbol) {
        this.selectedTokenItem = getTokenInfoBySymbol(this.symbol)
      }
      this.limitAmount = this.amount
    },
    afterLeave () {
      this.wrapStatus = false
    },
    closePopup () {
      this.$emit('closePopup')
    },
    handleChangeToken () {
      this.showAllTokenSelect = true
      this.$utils.setDocumentTitle(this.$t('text.page_prizeSend_chooseToken'))
    },
    // 更改币种
    confirmChangeToken (tokenItem) {
      // console.log(tokenItem)
      this.selectedTokenItem = tokenItem
      this.$utils.setDocumentTitle(this.currentTitle)
    },
    confirmLimit () {
      this.$emit('confirmLimit', {
        token: this.selectedTokenItem,
        limit: this.limitAmount
      })
      this.$emit('closePopup')
    }
  }
}
</script>

<style lang="scss" scoped>
.popup {
  z-index: 100;
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(0, 0, 0, .4);
  .popup-content-wrap {
    position: absolute;
    top: 1.8rem;
    left: .7rem;
    right: .7rem;
    border-radius: .1rem;
    background-color: #fff;
  }
  .popup-close {
    position: absolute;
    top: .3rem;
    right: 0rem;
    width: .56rem;
    height: .56rem;
    z-index: 101;

    &:before {
      content: '';
      position: absolute;
      top: .14rem;
      width: .3rem;
      height: .03rem;
      background-color: #ccc;
      transform: rotate(-45deg);
    }
    &:after {
      content: '';
      position: absolute;
      top: .14rem;
      width: .3rem;
      height: .03rem;
      background-color: #ccc;
      transform: rotate(45deg);
    }
  }
  .popup-content {
    padding-bottom: .56rem;
    .title {
      @include bb-1px(#F1F1F1);
      padding: .34rem 0;
      font-size: .32rem;
      line-height: 1;
      color: #212121;
      text-align: center;
    }
    .info-wrap {
      text-align: center;
      .info {
        padding-top: .3rem;
        font-size: .3rem;
        line-height: 1;
        color: #B9B9B9;
      }
      .amount {
        position: relative;
        padding-top: .3rem;
        display: inline-block;
        font-size: .9rem;
        line-height: 1;
        color: #212121;
        font-weight: bold;
      }
      .symbol {
        position: absolute;
        bottom: 0.1rem;
        padding-left: .1rem;
        font-size: .32rem;
        line-height: 1;
        color: #212121;
        font-weight: normal;
      }
    }
    .password {
      position: relative;
      margin: .4rem auto 0;
      width: 4.92rem;
      border: solid 1px #B9B9B9;
      background-color: #F1F1F1;
      display: flex;
      justify-content: space-between;
      .block {
        position: relative;
        display: inline-block;
        width: .8rem;
        flex: 1 0 .8rem;
        height: .8rem;
        font-size: .9rem;
        line-height: 1;
        color: $blackColor;
        text-align: center;
        &+.block {
          border-left: solid 1px #DFDFDF;
        }
        &.filled:after {
          position: absolute;
          content: '';
          top: .3rem;
          left: .32rem;
          width: .2rem;
          height: .2rem;
          border-radius: 50%;
          background-color: #000;
        }
      }
      .input {
        display: block;
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        opacity: 0;
        color: transparent;
        text-indent: -999em;
        margin-left: -100%;
        width: 200%;
      }
    }
  }
}

.btn-confirm {
  margin: .3rem .68rem 0;
  background-color: #015EF5;
}
.input-wrap {
      margin-top: .3rem;
      display: flex;
      .input {
        margin-top: .06rem;
        width: 3rem;
        margin-left: 1rem;
        font-size: .56rem;
        color: #B9B9B9;
        line-height: .58rem;
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

.zoomIn-enter-active,
.zoomIn-leave-active {
  transition: all .5s;
  transform: scale(1);
  opacity: 1;
}
.zoomIn-enter,
.zoomIn-leave-to {
  transform: scale(.3);
  opacity: 0;
}
</style>
