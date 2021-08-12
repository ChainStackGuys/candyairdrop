<template>
  <section class="popup" v-show="wrapStatus" @touchmove.prevent>
    <transition
      name="zoomIn"
      @before-enter="beforeEnter"
      v-on:after-leave="afterLeave"
    >
      <div class="popup-content-wrap" v-show="status">
        <div class="popup-close" @click="closePopup"></div>
        <div class="popup-content">
          <ul class="tabs">
          <li
            v-for="(val, ind) in tabs"
            :key="ind"
            @click="setInd(ind)"
            :class="{ active: showInd == ind }"
          >
            {{ val }}
          </li>
        </ul>
          <div v-if="loginType == 'mobile'" class="telephone">
            <div class="nation">
              <p class="nation-text">{{ nation }}</p>
              <select v-model="nation">
                <option v-for="(value, key) in nations" :key="key" :value="key">
                  {{ value }}
                </option>
              </select>
            </div>
            {{ mobileTip = $t("text.page_login_enterPhoneNum") }}
            <input
              type="tel"
              class="telephone-input"
              :placeholder="mobileTip"
              v-model.trim="telephone"
            />
          </div>
          <div v-if="loginType == 'email'" class="telephone">
            {{ emailTip = $t("text.page_login_enterEmail") }}
            <input
              type="email"
              class="telephone-input"
              :placeholder="emailTip"
              v-model.trim="email"
            />
          </div>

          <div class="vcode">
            {{ vcodeTip = loginType === "mobile"?$t("text.page_login_enterVcode"):$t("text.page_login_enterVcode_email") }}
            <input
              type="tel"
              class="vcode-input"
              :placeholder="vcodeTip"
              v-model.trim="vcode"
            />
            <p
              class="get-vcode"
              :class="{ disabled: !(telephone && canGetVcode) }"
              @click.prevent="getVcode"
            >
              {{ vcodeStatusText }}
            </p>
          </div>

          <a
            class="btn-confirm"
            :class="{ disabled: !(telephone && vcode) }"
            href="javascript:;"
            @click="submitTel"
            >{{$t("text.common_confirm")}}</a
          >
        </div>
      </div>
    </transition>
  </section>
</template>

<script>
import { nationsCn } from '@/utils/data'

export default {
  data () {
    return {
      wrapStatus: false, // 外层显示状态

      nations: nationsCn, // 手机号区号表
      nation: '+86', // 选中的国家号
      telephone: null, // 电话输入框

      vcode: null, // 验证码输入框
      canGetVcode: true, // 是否可以发送验证码，倒计时结束才可以继续发送
      countTime: 60, // 到计时的时间
      timer: null, // 定时器

      email: '',
      loginType: 'mobile',
      tabs: [
        this.$t('text.page_user_bindMobile'),
        this.$t('text.page_user_bindEmail')
      ],
      showInd: 0
    }
  },
  props: {
    status: Boolean
  },
  computed: {
    // 验证码发送状态
    vcodeStatusText () {
      if (this.canGetVcode) {
        if (this.loginType == 'mobile') {
          return this.$t('text.page_login_getVcode')
        } else {
          return this.$t('text.page_login_getVcode_email')
        }
      } else {
        return `${this.countTime}s`
      }
    }
  },
  mounted () {
    if (this.$i18n.locale !== 'cn') {
      this.setInd(1)
    }
  },
  created () {},
  methods: {
    beforeEnter () {
      this.pageInit()
      this.wrapStatus = true
    },
    afterLeave () {
      this.wrapStatus = false
      clearInterval(this.timer)
    },
    closePopup () {
      this.$emit('closePopup')
    },
    pageInit () {},
    getVcode () {
      if (this.canGetVcode && this.checkTel()) {
        let params = {}
        if (this.loginType == 'mobile') {
          params = {
            mobile: this.telephone,
            nation: this.nation.substring(1),
            vtype: this.loginType
          }
        } else if (this.loginType == 'email') {
          params = {
            email: this.email,
            vtype: this.loginType
          }
        }
        this.$http
          .get(this.$api.getVcodev2, {
            params: params
          })
          .then((res) => {
            if (res.data.errcode == 0) {
              this.$toast(this.$t('text.page_login_vcodeHasSent'))
              this.canGetVcode = false
              clearInterval(this.timer)
              this.countTime = 60
              this.timer = setInterval(() => {
                if (this.countTime) {
                  this.countTime--
                } else {
                  clearInterval(this.timer)
                  this.canGetVcode = true
                  this.countTime = 60
                }
              }, 1000)
            } else {
              this.$toast(`提示：${res.data.errmsg}`)
            }
          })
      }
    },
    submitTel () {
      if (this.checkForm()) {
        this.$indicator.open(this.$t('text.page_title_login'))
        let params = {}
        if (this.loginType == 'mobile') {
          params = {
            mobile: this.telephone,
            nation: this.nation.substring(1),
            vcode: this.vcode,
            vtype: this.loginType
          }
        } else if (this.loginType == 'email') {
          params = {
            email: this.email,
            vcode: this.vcode,
            vtype: this.loginType
          }
        }
        this.$http
          .post(this.$api.loginv2, params)
          .then((res) => {
            this.$indicator.close()
            if (res.data.errcode == 0) {
              this.$store.commit('logIn', res.data.data.token)
              this.$emit('loginSuccess')
              this.$emit('closePopup')
            } else {
              this.$toast(this.$t('text.common_notice') + `：${res.data.errmsg}`)
            }
          })
          .catch(() => {
            this.$indicator.close()
          })
      }
    },
    checkEmail () {
      if (!this.email) {
        this.$toast(this.$t('text.page_login_enterEmail'))
        return false
      }
      /* eslint-disable */
      const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      if (!re.test(this.email)) {
        this.$toast(this.$t('text.page_login_pleaseEnterRightEmail'))
        return false
      }
      return true
    },
    checkTel () {
      if (this.loginType == 'email') {
        return this.checkEmail()
      }
      if (!this.telephone) {
        this.$toast(this.$t('text.page_login_enterPhoneNum'))
        return false
      }
      if (!/^[0-9]{7,11}$/.test(this.telephone)) {
        this.$toast(this.$t('text.page_login_pleaseEnterRightPhoneNum'))
        return false
      }
      return true
    },
    checkForm () {
      if (!this.checkTel()) {
        return false
      }
      if (!this.vcode) {
        this.$toast(this.$t('text.page_login_enterVcode'))
        return false
      }
      if (!/^\d{6}$/.test(this.vcode)) {
        this.$toast(this.$t('text.page_login_verifyCodeTip'))
        return false
      }
      return true
    },
    setInd (ind) {
      const indMap = {
        0: 'mobile',
        1: 'email'
      }
      this.showInd = ind
      this.loginType = indMap[ind]
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
  background-color: rgba(0, 0, 0, 0.7);
  .popup-content-wrap {
    position: absolute;
    top: 2.44rem;
    left: 0.58rem;
    right: 0.58rem;
  }
  .popup-close {
    position: absolute;
    top: 0.3rem;
    right: 0.32rem;
    z-index: 3;
    width: 0.26rem;
    height: 0.26rem;
    background-image: url("../../assets/img/icons/icon_close5.png");
    background-size: 100% 100%;
  }
  .popup-content {
    border-radius: 0.1rem;
    background-color: #fff;
    padding: 0.48rem 0.54rem 0.66rem;
  }
}

.zoomIn-enter-active,
.zoomIn-leave-active {
  transition: all 0.5s;
  transform: scale(1);
  opacity: 1;
}
.zoomIn-enter,
.zoomIn-leave-to {
  transform: scale(0.3);
  opacity: 0;
}
.tabs {
    padding: 0.21rem 0 0.43rem;
    font-size: 0.3rem;
    font-weight: 400;
    color: rgba(20, 24, 31, 1);
    line-height: 0.8rem;
    display: flex;
    li {
      padding-right: 0.3rem;
    }
    .active {
      font-weight: 500;
      font-size: 0.36rem;
    }
  }
.title {
  font-size: 0.38rem;
  line-height: 0.54rem;
  color: #212121;
  text-align: center;
}
.telephone {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  margin-top: 0.6rem;
  height: 0.98rem;
  padding: 0 0.2rem;
  border-radius: 0.1rem;
  background-color: #F2F2F2;
  .nation {
    position: relative;
    width: 1.4rem;
    flex: 0 0 1.4rem;
    height: 0.44rem;
    border-right: solid 1px #bfbfbf;
    .nation-text {
      position: relative;
      display: inline-block;
      font-size: 0.3rem;
      line-height: 0.44rem;
      color: #212121;
      &:after {
        position: absolute;
        right: -0.3rem;
        top: 0.16rem;
        content: "";
        width: 0;
        height: 0;
        border-left: 0.06rem solid transparent;
        border-right: 0.06rem solid transparent;
        border-top: 0.09rem solid #212121;
      }
    }
    select {
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      opacity: 0;
      display: block;
      width: 100%;
    }
  }
  .telephone-input {
    flex: 1;
    width: 4rem;
    height: 0.44rem;
    padding-left: 0.28rem;
    color: #212121;
    font-size: 0.36rem;
    line-height: 0.44rem;
  }
}

.vcode {
  margin: 0.3rem 0 0;
  display: flex;
  .vcode-input {
    box-sizing: border-box;
    flex: 1;
    width: 3rem;
    height: 0.98rem;
    padding: 0 0.2rem;
    border-radius: 0.1rem;
    background-color: #F2F2F2;
    color: #212121;
    font-size: 0.36rem;
    line-height: 0.44rem;
  }
  .get-vcode {
    box-sizing: border-box;
    margin-left: 0.2rem;
    width: 2.1rem;
    flex: 0 0 2.1rem;
    height: 0.98rem;
    padding-top: 0.26rem;
    border-radius: 0.06rem;
    background-color: #EF4F4C;
    font-size: 0.32rem;
    line-height: 0.44rem;
    color: #fff;
    font-weight: 500;
    text-align: center;
    &.disabled {
      background-color: #CACACA;
      color: #6B6B6B;
    }
    &:active {
      opacity: 0.9;
    }
  }
}

.btn-confirm {
  box-sizing: border-box;
  display: block;
  width: 2.92rem;
  height: 0.98rem;
  margin: 0.5rem auto 0;
  border-radius: 0.59rem;
  background-color: #EF4F4C;
  font-size: 0.36rem;
  line-height: 0.98rem;
  color: #fff;
  font-weight: 500;
  text-align: center;
  &.disabled {
    background-color: #CACACA;
    color: #6B6B6B;
  }
  &:active {
    opacity: 0.9;
  }
}

input::-webkit-input-placeholder,
textarea::-webkit-input-placeholder {
  color: #BFBFBF;
  font-size: 0.32rem;
}
</style>
