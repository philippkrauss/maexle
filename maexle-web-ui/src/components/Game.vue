<template>
  <div>
    <h2>Hallo {{ userName }}</h2>
    <last-user-in-game-panel v-if="lastUserInGame"></last-user-in-game-panel>
    <div v-else>
      <game-over-panel
          v-if="gameOver"
          :user-id="userId"
          :current-user="currentUser"
          :previous-user="previousUser"
          :gave-up="gaveUp"
          :uncovered="uncovered"
          :previous-roll="previousRoll"
          :previous-claim="previousClaim"
          @restartGame="restartGame"
      ></game-over-panel>
      <game-panel
          v-else
          ref="gamePanel"
          :user-id="userId"
          :active-users="activeUsers"
          :current-user="currentUser"
          :previous-user="previousUser"
          :previous-roll="previousRoll"
          :previous-claim="previousClaim"
          @sendClaim="sendClaim"
          @giveUp="giveUp"
          @uncover="uncover"
      ></game-panel>
    </div>
    <score :score-board="scoreBoard" :user-id="userId"></score>
  </div>
</template>

<script>
import Score from '@/components/Score'
import GameOverPanel from '@/components/GameOverPanel'
import GamePanel from '@/components/GamePanel'
import {MAEXLE_NUMERIC_VALUE} from './values'
import LastUserInGamePanel from '@/components/LastUserInGamePanel'
import Vue from 'vue'

const CURRENT_USER_ID = 'currentUserId'
const PREVIOUS_USER_ID = 'previousUserId'
const PREVIOUS_USER_NAME = 'previousUserName'
const PREVIOUS_ROLL = 'previousRoll'
const PREVIOUS_CLAIM = 'previousClaim'
const GAVE_UP = 'gaveUp'
const UNCOVERED = 'uncovered'
const SCORE = 'score'

export default {
  name: 'Game',
  components: {
    Score,
    GameOverPanel,
    GamePanel,
    LastUserInGamePanel,
  },
  props: {
    gameId: String,
    userId: String,
    userName: String,
    activeUsers: Array,
    updateGame: Function,
    gameState: Object,
  },
  watch: {
    gameState () {
      const gamePanel = this.$refs.gamePanel
      if (gamePanel) {
        gamePanel.reset()
      }
    },
    activeUsers (newActiveUsers, oldActiveUsers) {
      const foundCurrentUser = newActiveUsers.find(u => u.id === this.currentUserId)
      if (!foundCurrentUser) {
        this.gameState[CURRENT_USER_ID] = this.calculateNextUserId(oldActiveUsers)
      }
      this.scoreBoard.forEach(scoreBoardItem => {
        const userStillActive = newActiveUsers.find(u => u.id === scoreBoardItem.id)
        if (!userStillActive) {
          Vue.set(scoreBoardItem, 'inactive', true)
        }
      })
    }
  },
  computed: {
    currentUserId () {
      return this.gameState[CURRENT_USER_ID]
    },
    currentUser () {
      if (this.currentUserId) {
        return this.activeUsers.find(user => user.id === this.currentUserId)
      } else {
        return this.activeUsers[0]
      }
    },
    previousUser () {
      return {
        id: this.gameState[PREVIOUS_USER_ID],
        name: this.gameState[PREVIOUS_USER_NAME],
      }
    },
    lastUserInGame () {
      return this.activeUsers.length === 1
    },
    previousRoll () {
      return this.gameState[PREVIOUS_ROLL]
    },
    previousClaim () {
      return this.gameState[PREVIOUS_CLAIM]
    },
    uncovered () {
      return this.gameState[UNCOVERED]
    },
    gaveUp () {
      return this.gameState[GAVE_UP]
    },
    gameOver () {
      return this.uncovered || this.gaveUp
    },
    scoreBoard () {
      return this.gameState[SCORE]
    }
  },
  methods: {
    sendClaim (currentRoll, currentClaim) {
      const newGameState = JSON.parse(JSON.stringify(this.gameState))
      newGameState[PREVIOUS_USER_ID] = this.currentUser.id
      newGameState[PREVIOUS_USER_NAME] = this.currentUser.name
      newGameState[CURRENT_USER_ID] = this.calculateNextUserId(this.activeUsers)
      newGameState[PREVIOUS_ROLL] = currentRoll
      newGameState[PREVIOUS_CLAIM] = currentClaim
      this.updateGame(newGameState)
    },
    calculateNextUserId (userList) {
      const currentUserIndex = userList.findIndex(user => user.id === this.currentUser.id)
      const nextUserIndex = (currentUserIndex + 1) % userList.length
      return userList[nextUserIndex].id
    },
    giveUp () {
      const newGameState = JSON.parse(JSON.stringify(this.gameState))
      newGameState[GAVE_UP] = true
      this.updateScore(newGameState)
      this.updateGame(newGameState)
    },
    uncover () {
      const newGameState = JSON.parse(JSON.stringify(this.gameState))
      newGameState[UNCOVERED] = true
      this.updateScore(newGameState)
      this.updateGame(newGameState)
    },
    restartGame () {
      const newGameState = {
        score: this.gameState[SCORE]
      }
      this.updateGame(newGameState)
    },
    updateScore (state) {
      const currentUserScoreEntry = state.score.find(s => s.id === state[CURRENT_USER_ID])
      const previousUserScoreEntry = state.score.find(s => s.id === state[PREVIOUS_USER_ID])
      if (state[UNCOVERED] && this.previousRoll === MAEXLE_NUMERIC_VALUE && this.previousClaim === MAEXLE_NUMERIC_VALUE) {
        currentUserScoreEntry.score += 2
      } else if (state[UNCOVERED] && this.previousRoll < this.previousClaim) {
        previousUserScoreEntry.score++
      } else if (state[UNCOVERED] && this.previousRoll >= this.previousClaim) {
        currentUserScoreEntry.score++
      } else if (state[GAVE_UP]) {
        currentUserScoreEntry.score++
      }
    },
  }
}
</script>

<style scoped>

</style>
