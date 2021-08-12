<template>
  <section class="popup" v-show='wrapStatus' @touchmove.prevent>
    <transition name="zoomIn"  @before-enter="beforeEnter" v-on:after-leave="afterLeave">
      <div class="popup-content-wrap" v-show='status'>
        <div class="popup-close" @click='closePopup'></div>
        <div class="popup-content">
          <h3 class="title">{{ $t("text.page_pay_enterPayPw") }}</h3>
          <div class="info-wrap">
            <p class="info">{{ desc }}</p>
            <p class="amount dinMedium">{{ +amount }}<span class="symbol">{{ symbol }}</span></p>
          </div>
          <div class="password">
            <p class="block" :class="password.length >= 1 ? 'filled': ''"></p>
            <p class="block" :class="password.length >= 2 ? 'filled': ''"></p>
            <p class="block" :class="password.length >= 3 ? 'filled': ''"></p>
            <p class="block" :class="password.length >= 4 ? 'filled': ''"></p>
            <p class="block" :class="password.length >= 5 ? 'filled': ''"></p>
            <p class="block" :class="password.length >= 6 ? 'filled': ''"></p>
            <input type="tel" class="input" autofocus="autofocus" v-model='password'>
          </div>
        </div>
      </div>
    </transition>

  </section>
</template>

<script>
import { mapState } from 'vuex'
export default {
  data () {
    return {
      wrapStatus: false, // 外层显示状态
      password: '',
      isConfirmed: false
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
  computed: {
    ...mapState(['userData'])
  },
  watch: {
    password (newVal, oldVal) {
      if (newVal && !(/^[0-9]{0,6}$/.test(newVal))) {
        if (oldVal) {
          this.password = oldVal
        } else {
          this.password = ''
        }
      }
      if (/^[0-9]{6}$/.test(newVal)) {
        if (this.isConfirmed == false) {
          this.$emit('confirmPw', { extraParas: { ...this.extraParas }, password: this.password, amount: this.amount })
          this.isConfirmed = true
          this.$emit('closePopup')
        } else {
          this.password = ''
        }
      }
    }
  },
  methods: {
    beforeEnter () {
      if (this.userData.hasPaywd) {
        this.password = ''
        this.isConfirmed = false
        this.wrapStatus = true
      } else {
        this.$messagebox({
          title: '提示',
          message: '您还未设置支付密码',
          confirmButtonText: '去设置'
        })
          .then(action => {
            if (action === 'confirm') {
              this.$store.dispatch('rrexBridge/openUrl', { url: 'rrex://security' })
                .then(res => {
                  this.$store.dispatch('getUserData')
                })
                .catch(err => this.$toast(err))
            }
          })
        this.closePopup()
      }
    },
    afterLeave () {
      this.password = ''
      this.wrapStatus = false
    },
    closePopup () {
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
