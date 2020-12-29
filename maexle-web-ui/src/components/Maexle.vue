<template>
  <div>
    <h1>Mäxle</h1>
    <join-game v-if="state === 'state-join'" :join-game="joinGame"></join-game>
    <open-game v-else-if="state === 'state-open'" :open-game="openGame"></open-game>
    <lobby v-else-if="state === 'state-joined'" :game-id="gameId" :player-name="playerName"
           @gameStarted="gameStarted"></lobby>
    <game v-else-if="state === 'state-active'"></game>
  </div>
</template>

<script>
import OpenGame from '@/components/OpenGame'
import Lobby from '@/components/Lobby'
import Game from '@/components/Game'
import JoinGame from '@/components/JoinGame'

export default {
  name: 'Maexle',
  components: {
    OpenGame,
    JoinGame,
    Lobby,
    Game
  },
  data () {
    return {
      state: null,
      gameId: null,
      connection: null,
      // endpoint: 'wss://fly71sq1s6.execute-api.eu-central-1.amazonaws.com/dev',
      endpoint: 'ws://localhost:3001',
      playerName: null
    }
  },
  created () {
    if (this.$route.query.gameId) {
      this.state = 'state-join'
      this.gameId = this.$route.query.gameId
    } else {
      this.state = 'state-open'
    }
  },
  methods: {
    gameStarted () {
      this.state = 'state-active'
    },
    joinGame (playerName) {
      this.playerName = playerName
      this.connection = new WebSocket(`${this.endpoint}?action=join&playerName=${playerName}&gameId=${this.gameId}`)
      this.connection.onmessage = this.messageReceived
    },
    openGame (playerName) {
      this.playerName = playerName
      this.connection = new WebSocket(`${this.endpoint}?action=open&playerName=${playerName}`)
      this.connection.onmessage = this.messageReceived
    },
    messageReceived: function (event) {
      console.log(event)
      const eventData = JSON.parse(event.data)
      if (eventData.action === 'JOIN') {
        this.gameId = eventData.gameId
        this.state = 'state-joined'
        if (!this.$route.query.gameId) {
          this.$router.push({path: '/', query: {gameId: this.gameId}})
        }
      }
    },
    sendMessage: function (message) {
      console.log(this.connection)
      console.log('sending message')
      this.connection.send(JSON.stringify({action: message}))
    }
  },
}
</script>

<style scoped>
</style>
