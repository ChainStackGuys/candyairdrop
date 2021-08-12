<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style lang="scss">
@import "./assets/scss/base.scss";

// 引入DIN字体
@font-face {
  font-family: "dinMedium";
  src: url('./assets/fonts/din_medium/DIN-Medium.eot'); /* IE9*/
  src: url('./assets/fonts/din_medium/DIN-Medium.eot') format('embedded-opentype'), /* IE6-IE8 */
  url('./assets/fonts/din_medium/DIN-Medium.woff') format('woff'),
  url('./assets/fonts/din_medium/DIN-Medium.ttf') format('truetype'), /* chrome, firefox, opera, Safari, Android, iOS 4.2+*/
  url('./assets/fonts/din_medium/DIN-Medium.svg') format('svg'); /* iOS 4.1- */
}
.dinMedium {
  font-family:"dinMedium" !important;
  font-style:normal;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

html, body {
  max-width: 500px;
  height: 100%;
  margin: 0 auto;
  font-size: 0;
  color: #333;
  position: relative;
}
.page-container {
  min-height: 100vh;
}
#app {
  height: 100%;
}

// common
.common-btn {
  display: block;
  height: .88rem;
  background-color: $mainColor;
  font-size: .3rem;
  line-height: .88rem;
  color: #fff;
  font-weight: 500;
  text-align: center;
  &:active {
    opacity: .8;
  }
  &:disabled {
    background-color: #ccc;
  }
}
// 加载更多指示器
.common-loading-icon {
  position: absolute;
  left: 50%;
  bottom: .5rem;
  transform: translateX(-50%);
}
.common-loading-over {
  position: absolute;
  left: 0;
  right: 0;
  bottom: .5rem;
  font-size: .3rem;
  color: #aaa;
  text-align: center;
}

// 修改 mint-msgbox UI 样式
.mint-indicator-wrapper {
  z-index: 9999;
}
.mint-msgbox-wrapper {
  .mint-msgbox-header {
    padding-top: .7rem;
  }
  .mint-msgbox-title {
    padding: 0 .48rem;
    font-size: 0.34rem;
    line-height: .5rem;
    color: #333333;
  }
  .mint-msgbox-content {
    padding: .24rem .48rem 0;
    min-height: 0;
    border-bottom: none;
  }
  .mint-msgbox-message {
    font-size: 0.28rem;
    color: #666;
    line-height: .4rem;
    word-break: break-all;
    user-select: all;
  }
  .mint-msgbox-btns {
    margin-top: .6rem;
    border-top: solid 1px RGBA(238, 238, 238, .5);
    height: 1rem;
  }
  .mint-msgbox-btn {
    font-size: .32rem;
    color: #508CEE;
    line-height: 1rem;
  }
  .mint-msgbox-cancel {
    color: #C4C4C4;
    border-right: solid 1px RGBA(238, 238, 238, .5);
  }
}
.mint-loadmore-text {
  font-size: .26rem;
  color: #9E9E9E;
}

// 通用动画
.bcvZoomIn-enter-active,
.bcvZoomIn-leave-active {
  transition: all .3s cubic-bezier(0.35, 2.43, 0.54, 0.27);
  transform: scale(1);
  // opacity: 1;
}
.bcvZoomIn-enter,
.bcvZoomIn-leave-to {
  transform: scale(.7);
  // opacity: 0;
}
</style>
