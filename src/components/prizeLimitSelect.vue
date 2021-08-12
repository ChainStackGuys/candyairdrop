<template>
  <section class="limit-select" @touchmove.prevent>
    <ul class="limit-list">
      <li class="limit-item" :class="{ active: limitType === 0}" @click="changeLimitType(0)">
        <div class="text-wrap">
          <p class="text">{{$t("text.common_noLimited")}}</p>
        </div>
        <i class="icon"></i>
      </li>
      <li class="limit-item" :class="{ active: limitType === 1}" @click="changeLimitType(1)">
        <div class="text-wrap">
          <p class="text">{{$t("text.common_newUser")}}</p>
        </div>
        <i class="icon"></i>
      </li>
      <li class="limit-item" :class="{ active: limitType === 2}" @click="changeLimitType(2)">
        <div class="text-wrap">
          <p class="text">{{$t("text.common_qualifyUser")}}</p>
        </div>
        <i class="icon"></i>
      </li>
      <li class="limit-item" :class="{ active: limitType === 3}" @click="changeLimitType(3)">
        <div class="text-wrap">
          <p class="text">{{$t("text.common_genMember")}}</p>
        </div>
        <i class="icon"></i>
      </li>
      <li class="limit-item" :class="{ active: limitType === 4}" @click="changeLimitType(4)">
        <div class="text-wrap">
          <p class="text">{{$t("text.common_lockMember")}}</p>
        </div>
        <i class="icon"></i>
      </li>
      <li class="limit-item" :class="{ active: limitType === 5}" @click="changeLimitType(5)">
        <div class="text-wrap">
          <p class="text">{{$t("text.common_contractUser")}}</p>
        </div>
        <i class="icon"></i>
      </li>
    </ul>

    <a class="common-btn btn-confirm" href="javascript:;" @click="confirmPrizeLimit">{{$t("text.common_confirm")}}</a>
  </section>
</template>

<script>
export default {
  name: 'prizeLimitSelect',
  data () {
    return {
      limitType: 0
    }
  },
  components: {
  },
  computed: {
  },
  created () {
  },
  methods: {
    changeLimitType (type) {
      this.limitType = type
    },
    confirmPrizeLimit () {
      this.$emit('confirmPrizeLimit', { limitType: this.limitType })
      this.$emit('closeSelect')
    }
  }
}
</script>

<style lang="scss" scoped>
// 选择币种弹出框
.limit-select {
  z-index: 10;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #fff;
}

.limit-list {
  padding-left: .32rem;
  .limit-item {
    display: flex;
    align-items: center;
    height: 1rem;
    padding-right: .32rem;
    @include bb-1px(#eee);
    .text-wrap {
      flex: 1;
      display: flex;
      align-items: center;
      .text {
        font-size: .28rem;
        line-height: .4rem;
        color: #14181F;
        font-weight: 500;
      }
      .number {
        padding-left: .1rem;
        font-size: .28rem;
        line-height: .4rem;
        color: #DF4242;
        font-weight: 500;
      }
      .btn-reset {
        box-sizing: border-box;
        margin-left: .24rem;
        width: .7rem;
        height: .3rem;
        border: solid 1px rgba(35, 112, 251, 1);
        border-radius: .15rem;
        font-size: .18rem;
        line-height: .26rem;
        color: #2370FB;
        text-align: center;
      }
    }
    .icon {
      width: .42rem;
      height: .42rem;
      background-image: url('../assets/img/icons/icon_select2.png');
      background-size: 100% 100%;
    }

    &.active {
      .icon {
        background-image: url('../assets/img/icons/icon_select3_active.png');
      }
    }
  }
}

.btn-confirm {
  position: absolute;
  left: .6rem;
  right: .6rem;
  bottom: 1rem;
}
</style>
