<template>
  <div>
    <h2>Hallo {{ userName }}</h2>
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
    >
    </game-panel>
    <score :score-board="scoreBoard" :user-id="userId"></score>
  </div>
</template>

<script>
import Score from '@/components/Score'
import GameOverPanel from '@/components/GameOverPanel'
import GamePanel from '@/components/GamePanel'
import {MAEXLE_NUMERIC_VALUE} from './values'

const CURRENT_USER_ID = 'currentUserId'
const PREVIOUS_USER_ID = 'previousUserId'
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
  },
  computed: {
    currentUser () {
      if (this.gameState[CURRENT_USER_ID]) {
        return this.activeUsers.find(user => user.id === this.gameState[CURRENT_USER_ID])
      } else {
        return this.activeUsers[0]
      }
    },
    previousUser () {
      if (this.gameState[PREVIOUS_USER_ID]) {
        return this.activeUsers.find(user => user.id === this.gameState[PREVIOUS_USER_ID])
      } else {
        return undefined
      }
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
      newGameState[CURRENT_USER_ID] = this.calculateNextUserId()
      newGameState[PREVIOUS_ROLL] = currentRoll
      newGameState[PREVIOUS_CLAIM] = currentClaim
      this.updateGame(newGameState)
    },
    calculateNextUserId () {
      const currentUserIndex = this.activeUsers.findIndex(user => user.id === this.currentUser.id)
      const nextUserIndex = (currentUserIndex + 1) % this.activeUsers.length
      return this.activeUsers[nextUserIndex].id
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
