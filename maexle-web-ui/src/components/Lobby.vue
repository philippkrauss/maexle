<template>
  <div>
    <h2>Hallo {{ userName }}</h2>
    <button v-if="activeUsers.length > 1" @click="$emit('gameStarted')">Start</button>
    <br>
    <h3>Aktive Spieler:</h3>
    <div v-for="user in activeUsers" :key="user.id">
      {{ user.id === userId ? 'Du' : user.name }}
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
    userName: String,
    activeUsers: Array
  },
  computed: {
    currentLink () {
      return window.location.href
    },
  },
}
</script>

<style scoped>
</style>
