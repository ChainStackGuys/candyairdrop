<template>
  <section>
    <div class="popup">
      <img class="popup-arrow" src="@/assets/img/icons/arrow_top_right.png">
      <p class="popup-text" v-html="$t('text.common_wechatShare')"></p>
      <p class="popup-btn" @click='closePopup'>{{ $t('text.common_getIt') }}</p>
    </div>
  </section>
</template>

<script>
export default {
  name: 'popupShare',
  data () {
    return {
    }
  },
  methods: {
    closePopup () {
      this.$emit('closePopup')
    }
  }
}
</script>

<style lang="scss" scoped>
.popup {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 999;
  background-color: rgba(0, 0, 0, .6);
  .popup-arrow {
    position: absolute;
    width: .5rem;
    height: .76rem;
    top: .32rem;
    right: .8rem;
  }
  .popup-text {
    position: absolute;
    top: 1.1rem;
    right: .5rem;
    text-align: center;
    color: #fff;
    font-size: .36rem;
    line-height: .6rem;
  }
  .popup-btn {
    position: absolute;
    top: 2.56rem;
    right: 1.28rem;
    padding: 0 .5rem;
    height: .86rem;
    border: dashed 1px #fff;
    border-radius: .1rem;
    text-align: center;
    color: #fff;
    font-size: .36rem;
    line-height: .86rem;
  }
}
</style>
