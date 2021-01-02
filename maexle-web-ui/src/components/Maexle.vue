<template>
  <div>
    <h1>Mäxle</h1>
    <join-game v-if="state === 'state-join'" :join-game="joinGame"></join-game>
    <open-game v-else-if="state === 'state-open'" :open-game="openGame"></open-game>
    <lobby v-else-if="state === 'state-joined'"
           :active-users="activeUsers"
           :game-id="gameId"
           :user-id="userId"
           :user-name="userName"
           @gameStarted="gameStarted"></lobby>
    <game v-else-if="state === 'state-active'"
          :active-users="activeUsers"
          :game-id="gameId"
          :user-id="userId"
          :user-name="userName"
          :game-state="gameState"
          :update-game="updateGame"></game>
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
      userName: null,
      activeUsers: [],
      gameState: {}
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
      this.sendMessage({action: 'startGame'})
    },
    joinGame (userName) {
      this.userName = userName
      this.connection = new WebSocket(`${this.endpoint}?action=join&userName=${userName}&gameId=${this.gameId}&userId=${this.userId}`)
      this.connection.onmessage = this.messageReceived
    },
    openGame (userName) {
      this.userName = userName
      this.connection = new WebSocket(`${this.endpoint}?action=open&userName=${userName}&userId=${this.userId}`)
      this.connection.onmessage = this.messageReceived
    },
    updateGame (gameState) {
      this.sendMessage({action: 'updateGame', gameState})
    },
    messageReceived: function (event) {
      const eventData = JSON.parse(event.data)
      if (eventData.action === 'JOIN') {
        this.gameId = eventData.gameId
        this.state = 'state-joined'
        if (!this.$route.query.gameId) {
          this.$router.push({path: '/', query: {gameId: this.gameId}})
        }
      } else if (eventData.action === 'BAD_GAME') {
        console.log('going to root')
        this.connection.close()
        this.state = 'state-open'
        this.$router.push({path: '/'})
      } else if (eventData.action === 'LOBBY_UPDATE') {
        this.activeUsers = eventData.usersInGame.sort((a, b) => (a.name > b.name) ? 1 : -1)
      } else if (eventData.action === 'GAME_START') {
        this.state = 'state-active'
        this.gameState = eventData.gameState
      } else if (eventData.action === 'GAME_UPDATE') {
        this.gameState = eventData.gameState
      }
    },
    sendMessage: function (message) {
      console.log('sending message ', message)
      this.connection.send(JSON.stringify(message))
    }
  },
}
</script>

<style scoped>
</style>
