<template>
  <section>
    <div class="no-data">
      <img class="icon" src="@/assets/img/icons/no_data.png">
      <p class="text">{{ $t('text.common_noData') }}</p>
    </div>
  </section>
</template>

<script>
export default {
  name: 'noData'
}
</script>

<style lang="scss" scoped>
.no-data {
  .icon {
    display: block;
    width: 3.96rem;
    height: 2.62rem;
    margin: 1.65rem auto 0;
  }
  .text {
    margin-top: .5rem;
    font-size: .36rem;
    line-height: .36rem;
    color: #A0A0A0;
    text-align: center;
  }
}
</style>
