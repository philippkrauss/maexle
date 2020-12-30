<template>
  <div>
    <h1>Mäxle</h1>
    <join-game v-if="state === 'state-join'" :join-game="joinGame"></join-game>
    <open-game v-else-if="state === 'state-open'" :open-game="openGame"></open-game>
    <lobby v-else-if="state === 'state-joined'"
           :active-players="activePlayers"
           :game-id="gameId"
           :user-id="userId"
           :player-name="playerName"
           @gameStarted="gameStarted"></lobby>
    <game v-else-if="state === 'state-active'"></game>
  </div>
</template>

<script>
import OpenGame from '@/components/OpenGame'
import Lobby from '@/components/Lobby'
import Game from '@/components/Game'
import JoinGame from '@/components/JoinGame'
import {v4 as uuidv4} from 'uuid'

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
      userId: null,
      connection: null,
      // endpoint: 'wss://fly71sq1s6.execute-api.eu-central-1.amazonaws.com/dev',
      endpoint: 'ws://localhost:3001',
      playerName: null,
      activePlayers: []
    }
  },
  created () {
    this.userId = uuidv4()
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
      this.connection = new WebSocket(`${this.endpoint}?action=join&playerName=${playerName}&gameId=${this.gameId}&userId=${this.userId}`)
      this.connection.onmessage = this.messageReceived
    },
    openGame (playerName) {
      this.playerName = playerName
      this.connection = new WebSocket(`${this.endpoint}?action=open&playerName=${playerName}&userId=${this.userId}`)
      this.connection.onmessage = this.messageReceived
    },
    messageReceived: function (event) {
      const eventData = JSON.parse(event.data)
      if (eventData.action === 'JOIN') {
        this.gameId = eventData.gameId
        this.state = 'state-joined'
        if (!this.$route.query.gameId) {
          this.$router.push({path: '/', query: {gameId: this.gameId}})
        }
      } else if (eventData.action === 'LOBBY_UPDATE') {
        this.activePlayers = eventData.playersInGame
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
