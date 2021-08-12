<template>
  <section class="popup" v-show='wrapStatus' @touchmove.prevent>
    <div class="mask" @click='closePopup'></div>
    <transition name="zoomIn"  @before-enter="beforeEnter" v-on:after-leave="afterLeave">
      <div class="popup-content-wrap" v-show='status'>
        <div class="popup-content">
          <a class="poster-wrap" @click="goAdPosterLink">
            <img class="poster" :src="image" alt="">
          </a>
          <div class="popup-close" @click='closePopup'></div>
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
    image: String,
    link: String
  },
  computed: {
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
    },
    goAdPosterLink () {
      if (!this.link) return
      window.location.href = this.link
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
    top: 1.5rem;
    left: 0;
    right: 0;
  }
  .mask {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
  }
  .popup-close {
    margin: .6rem auto 0;
    width: .3rem;
    height: .3rem;
    background-image: url('../../assets/img/icons/icon_close6.png');
    background-size: 100% 100%;
    opacity: .6;
  }
  .popup-content {
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

.poster-wrap {
  display: block;
  width: 5.68rem;
  height: 7.24rem;
  margin: 0 auto;
  .poster {
    width: 100%;
    height: 100%;
    border-radius: .1rem;
  }
}
</style>
