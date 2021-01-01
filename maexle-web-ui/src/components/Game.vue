<template>
  <div>
    <h2>game</h2>
  </div>
</template>

<script>
export default {
  name: 'Game',
  props: {
    gameId: String,
    userId: String,
    userName: String,
    activeUsers: Array
  },
}
</script>

<style scoped>
</style>
