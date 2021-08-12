<template>
  <section class="popup" v-show='wrapStatus' @touchmove.prevent>
    <div class="mask" @click='closePopup'></div>
    <transition name="zoomIn"  @before-enter="beforeEnter" v-on:after-leave="afterLeave">
      <div class="popup-content-wrap" v-show='status'>
        <div class="popup-content">
          <div class="popup-close" @click='closePopup'></div>
          <div class="cover">
            <img class="cover-img" :src="coverData.coverUrl" alt="">
            <div class="cover-el"></div>
          </div>
          <div class="operation">
            <a class="btn-ope" href="javascript:;" @click="selectPrizeCover">立即使用</a>
            <!-- <p class="card-note">持有权益通卡免费使用<a class="btn-buycard" href="">去获得<span class="arrow"></span></a></p> -->
          </div>
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
    coverData: {
      type: Object,
      default () {
        return {}
      }
    }
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
    selectPrizeCover () {
      this.$emit('selectPrizeCover', this.coverData)
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
  background-color: rgba(0, 0, 0, .5);
  .popup-content-wrap {
    position: absolute;
    top: 2rem;
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
  .popup-content {
    .popup-close {
      position: absolute;
      top: -.7rem;
      right: .86rem;
      width: .58rem;
      height: .58rem;
      background-image: url('../../assets/img/prizeCover/icon_close.png');
      background-size: 100% 100%;
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

.cover {
  box-sizing: border-box;
  display: block;
  width: 4.8rem;
  height: 6.32rem;
  margin: 0 auto;
  padding-top: .08rem;
  border-radius: .12rem;
  background-color: #EF4F4C;
  text-align: center;
  .cover-img {
    width: 4.64rem;
    height: 4.64rem;
  }
  .cover-el {
    position: relative;
    margin-top: -1.04rem;
    width: 4.8rem;
    height: 1.84rem;
    background-image: url('../../assets/img/prizeCover/demo_el_l.png');
    background-size: 100% 100%;
  }
}
.operation {
  padding-top: .5rem;
  .btn-ope {
    box-sizing: border-box;
    display: block;
    width: 3.78rem;
    height: .88rem;
    margin: 0 auto;
    padding-top: .22rem;
    background-image: url('../../assets/img/prizeCover/btn_bg.png');
    background-size: 100% 100%;
    font-size: .3rem;
    line-height: .42rem;
    color: #FF793E;
    font-weight: 500;
    text-align: center;
  }
  .card-note {
    padding-top: .4rem;
    font-size: .24rem;
    line-height: .34rem;
    color: #FFFFFF;
    text-align: center;
    .btn-buycard {
      position: relative;
      margin: 0 .2rem;
      color: #00DBFF;
      .arrow {
        @include arrow-right(#00DBFF);
      }
    }
  }
}
</style>
