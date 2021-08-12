<template>
  <section class="container-loading">
    <mt-spinner type="triple-bounce" :color="color" :size="50"></mt-spinner>
  </section>
</template>

<script>
export default {
  name: 'pageLoading',
  data () {
    return {
    }
  },
  props: {
    color: {
      type: String,
      default: '#333'
    }
  }
}
</script>

<style lang="scss" scoped>
.container-loading {
  text-align: center;
  padding-top: 3rem;
}
</style>
