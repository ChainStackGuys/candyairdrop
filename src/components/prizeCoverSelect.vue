<template>
  <section class="prize-cover-select" @touchmove.prevent>
    <popupPrizeCoverShow
      :status="popupPrizeCoverShow.status"
      :coverData="popupPrizeCoverShow.coverData"
      @closePopup="popupPrizeCoverShow.status = false"
      @selectPrizeCover="selectPrizeCover"
    ></popupPrizeCoverShow>

    <ul class="cover-list">
      <li v-for="item in coverList" :key="item.coverId" class="cover-item" @click="showPrizeCover(item)">
        <div class="demo">
          <img class="cover-img" :src="item.coverUrl" alt="">
          <div class="cover-el"></div>
          <!-- <div class="card-tip"></div> -->
          <!-- <div class="lock"></div> -->
        </div>
        <p class="name text-hidden-one">{{ item.nickname }}</p>
      </li>
    </ul>
  </section>
</template>

<script>
import popupPrizeCoverShow from '@/components/popup/popupPrizeCoverShow'
export default {
  name: 'pirzeCoverSelect',
  data () {
    return {
      popupPrizeCoverShow: {
        status: false,
        coverData: {}
      }
    }
  },
  props: {
    coverList: {
      type: Array,
      default () {
        return []
      }
    }
  },
  components: {
    popupPrizeCoverShow
  },
  computed: {
  },
  created () {
  },
  methods: {
    showPrizeCover (coverData) {
      this.popupPrizeCoverShow.coverData = coverData
      this.popupPrizeCoverShow.status = true
    },
    selectPrizeCover (coverData) {
      this.$emit('selectPrizeCover', coverData)
      this.$emit('closeSelect')
    }
  }
}
</script>

<style lang="scss" scoped>
.prize-cover-select {
  z-index: 10;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #fff;
}

.cover-list {
  display: flex;
  flex-wrap: wrap;
  padding: .32rem 0 0 .4rem;
  .cover-item {
    width: 2.1rem;
    flex: 0 0 2.1rem;
    margin-right: .2rem;
    margin-bottom: .28rem;
    .demo {
      position: relative;
      box-sizing: border-box;
      width: 100%;
      height: 2.76rem;
      padding-top: .04rem;
      border-radius: .06rem;
      background-color: #EE4D4C;
      text-align: center;
    }
    .cover-img {
      width: 2.02rem;
      height: 2.02rem;
    }
    .cover-el {
      position: relative;
      margin-top: -.46rem;
      width: 2.1rem;
      height: .8rem;
      background-image: url('../assets/img/prizeCover/demo_el_s.png');
      background-size: 100% 100%;
    }
    .card-tip {
      position: absolute;
      top: 0;
      right: 0;
      width: 1.16rem;
      height: .66rem;
      background-image: url('../assets/img/prizeCover/card_tip.png');
      background-size: 100% 100%;
    }
    .lock {
      position: absolute;
      top: 1.06rem;
      left: 50%;
      width: .64rem;
      height: .64rem;
      margin-left: -.32rem;
      background-image: url('../assets/img/prizeCover/icon_lock.png');
      background-size: 100% 100%;
    }
    .name {
      padding-top: .1rem;
      font-size: .24rem;
      line-height: .34rem;
      color: #212121;
      text-align: center;
    }
  }
}
</style>
