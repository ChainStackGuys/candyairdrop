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
            <input
              type="tel"
              class="telephone-input"
              placeholder="请输入您的手机号"
              v-model.trim="telephone"
            />
          </div>
          <div v-if="loginType == 'email'" class="telephone">
            <input
              type="email"
              class="telephone-input"
              placeholder="请输入您的邮箱"
              v-model.trim="email"
            />
          </div>
          <div class="vcode">
            <input
              type="tel"
              class="vcode-input"
              placeholder="请输入验证码"
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
            >确认</a
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
      tabs: [
        this.$t('text.page_user_bindMobile'),
        this.$t('text.page_user_bindEmail')
      ],
      nation: '+86', // 选中的国家号
      telephone: null, // 电话输入框
      vcode: null, // 验证码输入框
      canGetVcode: true, // 是否可以发送验证码，倒计时结束才可以继续发送
      countTime: 60, // 到计时的时间

      captcha: null, // 待初始化的图形验证码插件
      ticket: null, // 图形验证码票据
      randstr: null, // 图形验证码随机字符串
      timer: null, // 定时器
      loginType: 'mobile',
      email: '',
      showInd: 0
    }
  },
  props: {
    status: Boolean,
    id: String
  },
  computed: {
    // 验证码发送状态
    vcodeStatusText () {
      if (this.canGetVcode) {
        return this.$t('text.page_login_getVcode')
      } else {
        return `${this.countTime}s`
      }
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
        this.$http
          .post(this.$api.getVcode, {
            mobile: this.telephone,
            nation: this.nation.substring(1),
            ticket: this.ticket,
            randstr: this.randstr,
            type: 'bindMobile'
          })
          .then((res) => {
            if (res.data.errcode == 0) {
              this.$toast('验证码已发送...')
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
                  this.ticket = null
                  this.randstr = null
                }
              }, 1000)
            } else {
              this.$toast(`提示：${res.data.errmsg}`)
              this.ticket = null
              this.randstr = null
            }
          })
      }
    },
    submitTel () {
      if (this.checkForm()) {
        this.$indicator.open('正在校验中...')
        this.$http
          .post(this.$api.bindMobile, {
            mobile: this.telephone,
            vcode: this.vcode,
            nation: this.nation.substring(1),
            packetNum: this.id
          })
          .then((res) => {
            this.$indicator.close()
            if (res.data.errcode == 0) {
              this.$store.commit('updateUserInfo', res.data.data)
              this.$emit('closePopup')
              // 如果是新人红包，加上新人红包标签
              if (res.data.data.isNew) {
                this.$emit('bindSuccess', { isNew: true })
              }
              this.$messagebox({
                title: '恭喜领取成功',
                message: '已领取到 RREx 红利账户'
              })
            } else {
              this.$toast(`提示：${res.data.errmsg}`)
            }
          })
          .catch(() => {
            this.$indicator.close()
          })
      }
    },
    checkTel () {
      if (!this.telephone) {
        this.$toast('请输入手机号')
        return false
      }
      if (!/^[0-9]{7,11}$/.test(this.telephone)) {
        this.$toast('请输入正确的手机号')
        return false
      }
      return true
    },
    checkForm () {
      if (!this.checkTel()) {
        return false
      }
      if (!this.vcode) {
        this.$toast('请输入验证码')
        return false
      }
      if (!/^\d{4}$/.test(this.vcode)) {
        this.$toast('验证码为四位数字')
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
