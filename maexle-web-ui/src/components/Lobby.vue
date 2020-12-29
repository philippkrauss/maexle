<template>
  <div>
    <h2>Lobby for {{gameId}}</h2>
    Hallo {{playerName}}<br>
    <button @click="$emit('gameStarted')">Start</button>
  </div>
</template>

<script>
export default {
  name: 'Lobby',
  props: {
    gameId: String,
    playerName: String
  }
}
</script>

<style scoped>
</style>
