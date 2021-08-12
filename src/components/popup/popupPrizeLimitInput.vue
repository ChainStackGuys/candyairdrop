<template>
  <section class="popup" v-show='wrapStatus' @touchmove.prevent>
    <transition name="zoomIn"  @before-enter="beforeEnter" v-on:after-leave="afterLeave">
      <div class="popup-content-wrap" v-show='status'>
        <div class="popup-close" @click='closePopup'></div>
        <div class="popup-content">
          <h3 class="title">请输入重置的数量</h3>
          <div class="input-wrap">
            <p v-show="prefix" class="prefix">{{ prefix }}</p>
            <input v-resetInput class="input" type="number" v-model.number="num" placeholder="0">
            <p v-show="suffix" class="suffix">{{ suffix }}</p>
          </div>
          <a class="btn-confirm" href="javascript:;" @click="confirmResetNum">确认</a>
        </div>
      </div>
    </transition>

  </section>
</template>

<script>
export default {
  data () {
    return {
      wrapStatus: false, // 外层显示状态
      num: ''
    }
  },
  props: {
    status: Boolean,
    keyName: String,
    defaultNum: [Number, String],
    prefix: String,
    suffix: String
  },
  methods: {
    beforeEnter () {
      this.num = this.defaultNum || ''
      this.wrapStatus = true
    },
    afterLeave () {
      this.wrapStatus = false
    },
    closePopup () {
      this.$emit('closePopup')
    },
    confirmResetNum () {
      if (this.num > 100000 || this.num < 0.0001) return this.$toast('数量需在 0.0001 - 100000 之间')
      this.$emit('confirmResetNum', { keyName: this.keyName, num: this.num })
      this.closePopup()
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
  background-color: rgba(0, 0, 0, .7);
  .popup-content-wrap {
    position: absolute;
    top: 3rem;
    left: .58rem;
    right: .58rem;
  }
  .popup-close {
    position: absolute;
    top: .3rem;
    right: .32rem;
    z-index: 3;
    width: .26rem;
    height: .26rem;
    background-image: url('../../assets/img/icons/icon_close5.png');
    background-size: 100% 100%;
  }
  .popup-content {
    border-radius: .1rem;
    background-color: #fff;
    padding: 0 .4rem .6rem;
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

.title {
  padding: .24rem 0 0;
  font-size: .32rem;
  line-height: .4rem;
  color: #212121;
  font-weight: 500;
  text-align: center;
}
.input-wrap {
  display: flex;
  align-items: center;
  height: 1rem;
  margin: .48rem 0 0;
  padding: 0 .3rem;
  border-radius: .1rem;
  background-color: #F8F8F8;
  .input {
    flex: 1;
    width: 3rem;
    font-size: .44rem;
    line-height: .52rem;
  }
  .suffix {
    font-size: .32rem;
    line-height: .44rem;
    color: #333333;
  }
  .prefix {
    padding-right: .16rem;
    font-size: .4rem;
    line-height: .44rem;
    color: #333333;
  }
}
.btn-confirm {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3.28rem;
  height: .8rem;
  margin: .4rem auto 0;
  border-radius: .4rem;
  background-color: #EF4E4C;
  font-size: 0.32rem;
  line-height: 1;
  color: #fff;
  font-weight: normal;
  box-shadow: 0rem .14rem .2rem 0rem rgba(239,78,76,0.25);
}
</style>
