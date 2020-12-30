<template>
  <div>
    <h2>Lobby for {{ gameId }}</h2>
    Hallo {{ playerName }}<br>
    <button @click="$emit('gameStarted')">Start</button>
    <br>
    <h3>Aktive Spieler:</h3>
    <div v-for="player in activePlayers" :key="player.id">
      {{ player.name }} ({{ player.id === userId ? 'Du' : player.id }})
    </div>
  </div>
</template>

<script>
export default {
  name: 'Lobby',
  props: {
    gameId: String,
    userId: String,
    playerName: String,
    activePlayers: Array
  }
}
</script>

<style scoped>
</style>
