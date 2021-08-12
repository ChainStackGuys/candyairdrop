<template>
  <section class="token-select-list">
    <form class="search-wrap" @submit.stop.prevent action="#" @touchmove.prevent>
      <div class="search">
        <div class="search-ctn">
          <i class="search-icon"></i>
          <input v-resetInput v-watchKeyboard class="search-input" type="search" placeholder="请输入搜索内容" v-model="searchStr">
          <i v-show="searchStr" @click="searchStr = ''" class="search-clear"></i>
        </div>
        <a class="search-close" href="javascript:;" @click="closeTokenSelect">取消</a>
      </div>
    </form>

    <!-- token列表 没有搜索时 -->
    <section v-show="!searchStr">
      <div v-if="allTokenList.length" class="token-list-wrap">
        <ul class="token-list">
          <li v-for="item in allTokenList" :key="item.currency" class="token-item" :class="{active: selectedToken.currency == item.currency}" @click="selectToken(item)">
            <img class="icon" :src="item.iconUrl" alt="">
            <p class="symbol">{{ item.currency }}</p>
            <p class="symbol">{{ item.balance }}</p>
            <i class="status"></i>
          </li>
          <mt-spinner v-if='isLoading' color='#4583FF' class='loading-icon' type="triple-bounce"></mt-spinner>
        </ul>
      </div>

      <page-loading color="#4583FF" v-else></page-loading>
    </section>

    <!-- token列表 搜索时 -->
    <section v-show="searchStr">
      <div v-if="searchTokenList.length" class="token-list-wrap">
        <ul class="token-list">
          <li v-for="item in searchTokenList" :key="item.currency" class="token-item" :class="{active: selectedToken.currency == item.currency}" @click="selectToken(item)">
            <img class="icon" :src="item.iconUrl" alt="">
            <p class="symbol">{{ item.currency }}</p>
            <p class="symbol">{{ item.balance }}</p>
            <i class="status"></i>
          </li>
          <mt-spinner v-if='isLoading' color='#EF4E4C' class='loading-icon' type="triple-bounce"></mt-spinner>
        </ul>
      </div>
      <page-loading v-else-if="isInSearching" color="#EF4E4C"></page-loading>

      <!-- 没有搜索到 -->
      <div v-else class="no-data">
        <img class="no-data-icon" src="@/assets/img/elements/el_notoken.png" alt="">
        <p class="no-data-intro">未搜索到相关币种</p>
      </div>
    </section>
  </section>
</template>

<script>
import { debounce } from 'throttle-debounce'
import { getWeb3Promise } from '../utils/getToken'

import { setTokenAddress } from '../utils/tokenPrize'

export default {
  name: 'tokenSelect',
  data () {
    return {
      allTokenList: [], // 全部的币种列表，带有分页
      searchTokenList: [], // 搜索中的币种列表，不带分页

      isLoading: false, // 是否正在加载
      isLoadOver: false, // 是否加载完毕
      currentPage: 1, // 当前页面
      perPage: 20, // 每页显示的数量

      searchStr: '',
      isInSearching: false // 是否正在搜索中
    }
  },
  props: {
    selectedToken: Object,
    initCurrency: String
  },
  computed: {
  },
  watch: {
    searchStr (newSearch, oldSearch) {
      this.isInSearching = true
      this.searchTokenList = []
      this.debouncedSearchToken()
    }
  },
  created () {
    // 搜索方法防抖
    this.debouncedSearchToken = debounce(1000, this.searchToken)
    this.fetchTokenList()
  },
  methods: {
    async fetchTokenList ({ hasInit } = { hasInit: false }) {
      await getWeb3Promise.then(
        async () => {
          // console.log(this.$store.state.web3)
          if (this.$store.state.web3.userTokens.length) {
            this.allTokenList = this.$store.state.web3.userTokens
            !hasInit && this.selectToken(this.allTokenList[0])
          } else {
            let that = this
            const interval = setInterval(async () => {
              if (that.$store.state.web3.userTokens.length) {
                // console.log(that.$store.state.web3)
                this.allTokenList = this.$store.state.web3.userTokens
                !hasInit && this.selectToken(this.allTokenList[0])
                clearInterval(interval)
              }
            }, 2000)
          }
        }
      )
    },
    searchToken () {
      if (!this.searchStr) return
      if (!this.allTokenList || this.allTokenList.length == 0) return
      for (let i in this.allTokenList) {
        if (this.allTokenList[i].currency.toLowerCase().indexOf(this.searchStr.toLowerCase()) !== -1) {
          this.searchTokenList.push(this.allTokenList[i])
        }
      }
      this.isInSearching = false
    },

    // 格式化 tokenList ，添加占位符等信息
    formatTokenItem (tokenItem) {
      let tokenItemCopy = { ...tokenItem }
      if (+tokenItemCopy.minAmount <= 0) {
        // this.$toast(`${tokenItemCopy.currency}的最小红包数量配置不正确`)
        tokenItemCopy.minAmount = '0.0001'
      }
      tokenItemCopy.precision = this.$utils.getNumberPrecision(tokenItemCopy.minAmount)
      tokenItemCopy.inputPlaceholder = this.$utils.getNumberPlaceholderText(tokenItemCopy.precision)
      return tokenItemCopy
    },
    selectToken (item) {
      setTimeout(() => {
        this.$emit('confirmChangeToken', this.formatTokenItem(item))
        setTokenAddress(item.address)
        this.closeTokenSelect()
      }, 50)
    },
    closeTokenSelect () {
      this.$emit('closeTokenSelect')
    }
  }
}
</script>

<style lang="scss" scoped>
// 选择币种弹出框
.token-select-list {
  z-index: 10;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #fff;
}

.search {
  padding: .2rem .3rem;
  display: flex;
  align-items: center;
  box-shadow: 0rem 0.1rem 0.1rem 0rem rgba(0,0,0,0.04);
  .search-ctn {
    box-sizing: border-box;
    display: flex;
    align-items: center;
    flex: 1;
    height: .68rem;
    padding: 0 .2rem 0 .3rem;
    border-radius: .08rem;
    background-color: #F4F4F4;
    .search-icon {
      flex: 0 1 .32rem;
      width: .32rem;
      height: .32rem;
      background-size: 100% 100%;
      background-image: url('~@/assets/img/icons/icon_search.png');
    }
    .search-input {
      margin-left: .1rem;
      width: 2rem;
      flex: 1;
      font-size: .28rem;
      line-height: .4rem;
      color: #666A85;
    }
    .search-clear {
      width: .48rem;
      height: .48rem;
      background-size: 100% 100%;
      background-image: url('~@/assets/img/icons/icon_clear.png');
    }
  }
  .search-close {
    padding-left: .2rem;
    font-size: .28rem;
    line-height: .4rem;
    color: #14181F;
  }
}

.token-list-wrap {
  position: absolute;
  top: 1.1rem;
  bottom: 0;
  left: 0;
  right: 0;
  box-sizing: border-box;
  overflow-y: scroll;
  -webkit-overflow-scrolling: touch;
  .token-list {
    position: relative;
    padding-left: .32rem;
    padding-bottom: 1rem;
    .token-item {
      display: flex;
      align-items: center;
      height: 1rem;
      @include bb-1px(#eee);
      .icon {
        width: .7rem;
        height: .7rem;
        border-radius: 50%;
        background-color: #eee;
      }
      .symbol {
        flex: 1;
        padding-left: .2rem;
        font-size: .28rem;
        line-height: .4rem;
        color: #14181F;
        font-weight: 500;
      }
      .status {
        margin-right: .32rem;
        width: .42rem;
        height: .42rem;
        background-image: url('../assets/img/icons/icon_select3.png');
        background-size: 100% 100%;
      }
      &.active {
        .status {
          background-image: url('../assets/img/icons/icon_select3_active.png');
        }
      }
    }
  }
}

.no-data {
  box-sizing: border-box;
  padding-top: .66rem;
  position: absolute;
  top: 1.08rem;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #fff;
  box-sizing: border-box;
  overflow-y: scroll;
  -webkit-overflow-scrolling: touch;
  text-align: center;
  .no-data-icon {
    width: 2rem;
    height: 1.54rem;
  }
  .no-data-intro {
    padding-top: .72rem;
    font-size: .28rem;
    line-height: .4rem;
    color: #666A85;
  }
}

.loading-icon {
  position: absolute;
  left: 50%;
  bottom: .5rem;
  transform: translateX(-50%);
}
</style>
