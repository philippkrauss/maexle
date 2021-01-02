<template>
  <div>
    <h2>game</h2>
    <div v-if="myTurn">Du bist dran!</div>
    <div v-else>{{ currentUser.name }} ist dran</div>
    <button v-if="myTurn" @click="done">weiter</button>
  </div>
</template>

<script>
const CURRENT_USER_ID = 'currentUserId'
export default {
  name: 'Game',
  props: {
    gameId: String,
    userId: String,
    userName: String,
    activeUsers: Array,
    updateGame: Function,
    gameState: Object,
  },
  computed: {
    currentUser () {
      if (this.gameState[CURRENT_USER_ID]) {
        return this.activeUsers.find(user => user.id === this.gameState[CURRENT_USER_ID])
      } else {
        return this.activeUsers[0]
      }
    },
    myTurn () {
      return this.currentUser.id === this.userId
    }
  },
  methods: {
    done() {
      const newGameState = JSON.parse(JSON.stringify(this.gameState))
      newGameState[CURRENT_USER_ID] = this.calculateNextUserId()
      this.updateGame(newGameState)
    },
    calculateNextUserId() {
      const currentUserIndex = this.activeUsers.findIndex(user => user.id === this.currentUser.id)
      const nextUserIndex = (currentUserIndex + 1) % this.activeUsers.length
      return this.activeUsers[nextUserIndex].id
    },
  }
}
</script>

<style scoped>
</style>
