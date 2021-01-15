<template>
  <div>
    <h1>{{ headline }}</h1>
    <join-game v-if="state === 'state-join'"
               :join-game="joinGame"
               :rest-endpoint="restEndpoint"
               :game-id="gameId"
    ></join-game>
    <open-game v-else-if="state === 'state-open'"
               :open-game="openGame"
    ></open-game>
    <lobby v-else-if="state === 'state-joined'"
           :active-users="activeUsers"
           :game-id="gameId"
           :user-id="userId"
           :user-name="userName"
           @gameStarted="gameStarted"
    ></lobby>
    <game v-else-if="state === 'state-active'"
          :active-users="activeUsers"
          :game-id="gameId"
          :user-id="userId"
          :user-name="userName"
          :game-state="gameState"
          :update-game="updateGame"
    ></game>
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
      gameName: null,
      userId: null,
      connection: null,
      // wsEndpoint: 'wss://81mnuav41g.execute-api.eu-central-1.amazonaws.com/dev',
      // restEndpoint: 'http://192.168.178.22:3000/dev',
      wsEndpoint: 'ws://192.168.178.22:3001',
      restEndpoint: 'http://192.168.178.22:3000/dev',
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
    connectionEstablished () {
      console.log('connection established')
      setTimeout(() => {
        this.sendMessage({action: 'connectionEstablished'})
      }, 1000)
    },
    joinGame (userName) {
      this.userName = userName
      this.connection = new WebSocket(`${this.wsEndpoint}?action=join&userName=${userName}&gameId=${this.gameId}&userId=${this.userId}`)
      this.connection.onmessage = this.messageReceived
      this.connection.onopen = this.connectionEstablished
    },
    openGame (userName) {
      this.userName = userName
      this.connection = new WebSocket(`${this.wsEndpoint}?action=open&userName=${userName}&userId=${this.userId}`)
      this.connection.onmessage = this.messageReceived
      this.connection.onopen = this.connectionEstablished
    },
    updateGame (gameState) {
      this.sendMessage({action: 'updateGame', gameState})
    },
    messageReceived: function (event) {
      const eventData = JSON.parse(event.data)
      if (eventData.action === 'JOIN') {
        this.gameId = eventData.gameId
        this.gameName = eventData.gameName
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
  computed: {
    headline() {
      return `Mäxle${this.gameName?' - ' + this.gameName:''}`
    }
  }
}
</script>

<style scoped>
</style>
