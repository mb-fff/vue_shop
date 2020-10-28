<template>
  <div>
    <el-button @click="logout" type="info">退出</el-button>
  </div>
</template>

<script>
export default {
  data() {
    return {}
  },
  methods: {
    logout() {
      // 清空token
      window.sessionStorage.clear()
      // 跳转到登录页
      this.$router.push('/login')
    }
  }
}
</script>

<style lang="less" scoped>
</style>
