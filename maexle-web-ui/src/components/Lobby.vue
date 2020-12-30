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
    Link zu diesem Spiel: <strong id="currentLink">{{ currentLink }}</strong><br/>
    <button v-clipboard="currentLink">
      Link kopieren
    </button>
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
  },
  computed: {
    currentLink () {
      return window.location.href
    }
  },
}
</script>

<style scoped>
</style>
