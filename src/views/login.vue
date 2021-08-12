<template>
  <section class="page-container">
    <template v-if="!env.isInRrexApp">
      <!--div class="tab">
        <p class="tab-item" :class="{active: loginType == 'vcode'}" @click="loginType = 'vcode'">{{ $t('text.page_login_loginWithVcode') }}</p>
        <p class="tab-item" :class="{active: loginType == 'pw'}" @click="loginType = 'pw'">{{ $t('text.page_login_loginWithPw') }}</p>
      </div-->
      <form v-if="loginType == 'vcode'" class="login-form" @submit.stop.prevent action="#">
        <img class="title-icon" src="@/assets/img/icons/login_vcode.png" alt="">
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
        <div  v-if="accountType == 'mobile'" class="telephone input-wrap">
          <div class="nation input-field">
            <p class="nation-text">{{ nation }}</p>
            <select v-model="nation">
              <option v-for='(value, key) in nations' :key="key" :value="key">{{ value }}</option>
            </select>
          </div>
          <input type="tel" class="input-value" :placeholder="$t('text.page_login_enterPhoneNum')" v-model.trim="telephone">
        </div>
        <div  v-if="accountType == 'email'" class="telephone input-wrap">
           <p class="input-field">{{ $t('text.page_login_email') }}</p>
           <input type="email" class="input-value" :placeholder="$t('text.page_login_enterEmail')" v-model.trim="email">
        </div>
        <div class="vcode input-wrap" :class="$i18n.locale">
          <p class="input-field">{{ $t('text.page_login_vcode') }}</p>
          <input type="tel" class="input-value" :placeholder="$t('text.page_login_enterVcode')" v-model.trim="vcode">
          <p class="get-vcode" :class="{ active: hasInputTel && canGetVcode  }" @click.prevent='getVcode'>{{ vcodeStatusText }}</p>
        </div>
      </form>

      <form v-if="loginType == 'pw'" class="login-form" @submit.stop.prevent action="#">
        <img class="title-icon" src="@/assets/img/icons/login_pw.png" alt="">
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
        <div v-if="accountType == 'mobile'"  class="telephone input-wrap">
          <div class="nation input-field">
            <p class="nation-text">{{ nation }}</p>
            <select v-model="nation">
              <option v-for='(value, key) in nations' :key="key" :value="key">{{ value }}</option>
            </select>
          </div>
          <input type="tel" class="input-value" :placeholder="$t('text.page_login_enterPhoneNum')" v-model.trim="telephone">
        </div>
        <div v-if="accountType == 'email'"  class="telephone input-wrap">
          <p class="input-field">{{ $t('text.page_login_email') }}</p>
          <input type="email" class="input-value" :placeholder="$t('text.page_login_enterEmail')" v-model.trim="email">
        </div>
        <div class="pw input-wrap" :class="$i18n.locale">
          <p class="input-field">{{ $t('text.page_login_passwrod') }}</p>
          <input type="password" class="input-value" :placeholder="$t('text.page_login_enterPassword')" v-model.trim="pw">
        </div>
      </form>

      <a class="common-btn btn-confirm" href="javascript:;" @click='submitTel'>{{ $t('text.common_confirm') }}</a>
    </template>

    <pageLoading v-else color="#EF4E4C" />
  </section>
</template>

<script>
import { mapState } from 'vuex'
import { nationsCn, nationsEn, nationsTc, nationsJp } from '@/utils/data'
import login from '@/utils/login'

export default {
  name: 'user',
  data () {
    return {
      loginType: 'vcode', // vcode 验证码、pw 密码

      nations: null, // 手机号区号表
      nation: '+86', // 选中的国家号
      telephone: null, // 电话输入框
      hasInputTel: false, // 是否开始输入手机号

      vcode: null, // 验证码输入框
      canGetVcode: true, // 是否可以发送验证码，倒计时结束才可以继续发送
      countTime: 60, // 到计时的时间
      timer: null, // 定时器

      pw: '', // 输入的密码,
      email: '',
      accountType: 'mobile',
      tabs: [
        this.$t('text.page_user_bindMobile'),
        this.$t('text.page_user_bindEmail')
      ],
      showInd: 0
    }
  },
  computed: {
    ...mapState(['env', 'token']),
    // 验证码发送状态
    vcodeStatusText () {
      if (this.canGetVcode) {
        return this.$t('text.page_login_getVcode') // 获取验证码
      } else {
        return `${this.countTime}s`
      }
    }
  },
  watch: {
    telephone (newValue, oldValue) {
      if (newValue.length > 5) {
        this.hasInputTel = true
      } else {
        this.hasInputTel = false
      }
    }
  },
  created () {
    // 检查是否登录成功
    if (this.token) {
      this.goBeforeLoginUrl()
      return
    }
    // 如果是 RREx APP 内，则使用 rrex 登录
    if (this.env.isInRrexApp) {
      login()
    }

    // 修改选择区号的语言
    if (this.$i18n.locale == 'en') {
      this.nations = nationsEn
    } else if (this.$i18n.locale == 'tc') {
      this.nations = nationsTc
    } else if (this.$i18n.locale == 'jp') {
      this.nations = nationsJp
    } else {
      this.nations = nationsCn
    }

    // 加入防抖的 getVcode 方法
    this.getVcode = this.$debounce(300, this._getVcode)
  },
  methods: {
    _getVcode () {
      if (this.canGetVcode && this.checkTel()) {
        let params = {}
        if (this.accountType == 'mobile') {
          params = {
            mobile: this.telephone,
            nation: this.nation.substring(1),
            vtype: this.accountType
          }
        } else if (this.accountType == 'email') {
          params = {
            email: this.email,
            vtype: this.accountType
          }
        }
        this.$http.get(this.$api.getVcodev2, {
          params: params
        })
          .then(res => {
            if (res.data.errcode) {
              this.$toast(`${this.$t('text.common_notice')}: ${res.data.errmsg}`)
            } else {
              this.$toast(this.$t('text.page_login_vcodeHasSent')) // 验证码已发送...
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
            }
          })
      }
    },
    submitTel () {
      if (this.checkForm()) {
        this.$indicator.open(this.$t('text.page_title_login'))
        let params = {}
        if (this.accountType == 'mobile') {
          params = {
            mobile: this.telephone,
            nation: this.nation.substring(1),
            vcode: this.loginType == 'vcode' ? this.vcode : undefined,
            passwd: this.loginType == 'pw' ? this.pw : undefined,
            vtype: this.accountType
          }
        } else if (this.accountType == 'email') {
          params = {
            email: this.email,
            vcode: this.loginType == 'vcode' ? this.vcode : undefined,
            passwd: this.loginType == 'pw' ? this.pw : undefined,
            vtype: this.accountType
          }
        }
        this.$http.post(this.$api.loginv2, params)
          .then(res => {
            this.$indicator.close()
            if (res.data.errcode == 0) {
              this.$store.commit('logIn', res.data.data.token)
              this.goBeforeLoginUrl()
            } else {
              this.$toast(`${this.$t('text.common_notice')}: ${res.data.errmsg}`)
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
      if (this.accountType == 'email') {
        return this.checkEmail()
      }
      if (!this.telephone) {
        this.$toast(this.$t('text.page_login_enterPhoneNum')) // 请输入手机号
        return false
      }
      if (!(/^[0-9]{7,11}$/.test(this.telephone))) {
        this.$toast(this.$t('text.page_login_pleaseEnterRightPhoneNum')) // 请输入正确的手机号
        return false
      }
      return true
    },
    checkForm () {
      if (!this.checkTel()) {
        return false
      }
      if (this.loginType == 'vcode') {
        if (!this.vcode) {
          this.$toast(this.$t('text.page_login_enterVcode')) // 请输入验证码
          return false
        }
        if (!(/^\d{6}$/.test(this.vcode))) {
          this.$toast(this.$t('text.page_login_verifyCodeTip'))
          return false
        }
      } else if (this.loginType == 'pw') {
        if (!this.pw) {
          this.$toast(this.$t('text.page_login_enterPassword')) // 请输入密码
          return false
        }
      }
      return true
    },

    goBeforeLoginUrl () {
      let beforeLoginUrl = localStorage.getItem('beforeLoginUrl') || '/'
      if (beforeLoginUrl.indexOf('login') > -1) beforeLoginUrl = '/'
      // 如果为绝对路径直接跳转，相对路径调用 vue-router 跳转
      if (/^http/.test(beforeLoginUrl)) {
        window.location.href = beforeLoginUrl
      } else {
        this.$router.replace(beforeLoginUrl)
      }
    },
    setInd (ind) {
      const indMap = {
        0: 'mobile',
        1: 'email'
      }
      this.showInd = ind
      this.accountType = indMap[ind]
    }
  }
}
</script>

<style lang="scss" scoped>
.tab {
  display: flex;
  background-color: #F7F7F7;
  .tab-item {
    position: relative;
    flex: 1;
    box-sizing: border-box;
    height: .88rem;
    padding-top: .32rem;
    font-size: .32rem;
    line-height: .32rem;
    text-align: center;
    &.active {
      color: $mainColor;
      font-weight: 500;
      &:after {
        content: '';
        position: absolute;
        left: 50%;
        bottom: 0;
        margin-left: -0.37rem;
        width: .74rem;
        height: .07rem;
        background-color: $mainColor;
        border-radius: .04rem;
      }
    }
  }
}

.login-form {
  margin: 0 .5rem;
  padding-top: .4rem;
  .title-icon {
    display: block;
    margin: 0 auto;
    width: 2.2rem;
    height: 2.2rem;
  }
  .input-wrap {
    display: flex;
    align-items: center;
    .input-field {
      position: relative;
      width: 1.4rem;
      flex: 0 0 1.4rem;
      height: .44rem;
      border-right: solid 1px #bfbfbf;
      font-size: .3rem;
      line-height: .44rem;
      color: #212121;
    }
    .input-value {
      box-sizing: border-box;
      flex: 1;
      width: 4rem;
      height: .44rem;
      padding-left: .28rem;
      color: #212121;
      font-size: .36rem;
      line-height: .44rem;
    }
  }

  .telephone {
    margin-top: .56rem;
    .nation {
      .nation-text {
        display: inline-block;
        position: relative;
        font-size: .3rem;
        line-height: .44rem;
        color: #212121;
        &:after {
          position: absolute;
          right: -.3rem;
          top: .16rem;
          content: '';
          width: 0;
          height: 0;
          border-left: .06rem solid transparent;
          border-right: .06rem solid transparent;
          border-top: .09rem solid #212121;
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
  .vcode {
    margin-top: .6rem;
    .input-value {
      width: 3rem;
    }
    .get-vcode {
      font-size: .28rem;
      line-height: .44rem;
      color: #8B8B8B;
      &.active {
        color: $mainColor;
      }
    }
    &.en .input-field {
      font-size: .24rem;
    }
  }
  .pw {
    margin-top: .6rem;
    &.jp .input-field {
      font-size: .24rem;
    }
  }
}

.btn-confirm {
  margin: 1.4rem auto 0;
  width: 6.2rem;
}

input::-webkit-input-placeholder,
textarea::-webkit-input-placeholder {
  color: #B9B9B9;
  font-size: 0.28rem;
  line-height: .44rem;
}
</style>
