<template>
  <section class="popup" v-show='wrapStatus' @touchmove.prevent>
    <transition name="zoomIn"  @before-enter="beforeEnter" v-on:after-leave="afterLeave">
      <div class="popup-content-wrap" v-show='status'>
        <div class="popup-close" @click='closePopup'></div>
        <div class="popup-content">
          <i class="icon"></i>
          <h3 class="title">很遗憾～<br>只有定向人群可以领取</h3>
          <p class="desc">{{ limitDesc }}</p>
          <a class="btn-confirm" href="javascript:;" @click="closePopup">确认</a>
        </div>
      </div>
    </transition>

  </section>
</template>

<script>
export default {
  data () {
    return {
      wrapStatus: false // 外层显示状态
    }
  },
  props: {
    status: Boolean,
    limitDesc: String
  },
  methods: {
    beforeEnter () {
      this.wrapStatus = true
    },
    afterLeave () {
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
  background-color: rgba(0, 0, 0, .7);
  .popup-content-wrap {
    position: absolute;
    top: 3rem;
    left: 1.08rem;
    right: 1.08rem;
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
    padding: .36rem 0 .56rem;
    text-align: center;
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

.icon {
  display: inline-block;
  width: 1.1rem;
  height: 1.2rem;
  background-image: url('~@/assets/img/icons/icon_prizeLimited.png');
  background-size: 100% 100%;
}
.title {
  padding: .28rem 0 0;
  font-size: .28rem;
  line-height: .42rem;
  color: #333;
  font-weight: 500;
}
.desc {
  padding-top: .2rem;
  font-size: .22rem;
  line-height: .24rem;
  color: #999999;
}
.btn-confirm {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.42rem;
  height: .8rem;
  margin: .44rem auto 0;
  border-radius: .4rem;
  background-color: #EF4E4C;
  font-size: 0.32rem;
  line-height: 1;
  color: #fff;
  font-weight: normal;
  box-shadow: 0rem .14rem .2rem 0rem rgba(239,78,76,0.25);
}
</style>
