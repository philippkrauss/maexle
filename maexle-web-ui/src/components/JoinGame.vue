<template>
  <div v-if="error">
    <h2>Das gesuchte Spiel kann nicht gefunden werden</h2>
    <a href="/">Neues Spiel starten</a>
  </div>
  <div v-else>
    <h2>{{gameName}} beitreten</h2>
    <label>Dein Name: <input type="text" v-model="name"></label><br>
    <button :disabled="!name" @click="joinGameClicked">Los geht's</button>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'JoinGame',
  data () {
    return {
      name: null,
      gameName: '',
      error: false,
    }
  },
  async mounted () {
    try {
      const gameInfos = await axios.get(`${this.restEndpoint}/games/${this.gameId}`)
      this.gameName = gameInfos.data.name
    } catch (error) {
      this.error = true
    }
  },
  props: {
    joinGame: Function,
    restEndpoint: String,
    gameId: String,
  },
  methods: {
    joinGameClicked () {
      this.joinGame(this.name)
    },
  },
}
</script>

<style scoped>
</style>
