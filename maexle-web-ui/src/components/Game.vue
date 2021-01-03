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
    ></game-over-panel>
    <div v-else>
      <div>Reihenfolge: <span v-for="user in activeUsers" :key="user.id"
                              v-bind:class="[{ currentUser: (user.id === currentUser.id) }, 'userClass']"
      >{{ user.name }}</span>
      </div>
      <div v-if="currentUserIsMe">Du bist dran!</div>
      <div v-else>{{ currentUser.name }} ist dran</div>
      <div v-if="previousClaimExists">{{ previousClaimText }} ist angesagt!</div>
      <div v-if="currentUserIsMe">
        <div v-if="firstInLine">Du musst erstmal würfeln.</div>
        <div v-if="currentRoll">Du hast {{ currentRollText }} gewürfelt</div>
        <button class="actionButton" v-if="canUncover" @click="uncover">Aufdecken</button>
        <button class="actionButton" v-if="canRoll" @click="roll">Würfeln</button>
        <button class="actionButton" v-if="maexleClaimed" @click="giveUp">Aufgeben</button>
        <div v-if="currentRoll">
          <select v-model="currentClaim">
            <option
                v-for="(value) in availableValues"
                :value="value"
                :key="value.numericValue"
            >
              {{ value.label }}
            </option>
          </select>
          <button class="actionButton" @click="sendClaim">sagen und weitergeben</button>
        </div>
      </div>
    </div>
    <score :score-board="scoreBoard" :user-id="userId"></score>
  </div>
</template>

<script>
import Score from '@/components/Score'
import GameOverPanel from '@/components/GameOverPanel'
import {MAEXLE_NUMERIC_VALUE, VALUES, valuesGreaterOrEqual} from './values'
import {getRollText} from '@/components/values'

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
  },
  props: {
    gameId: String,
    userId: String,
    userName: String,
    activeUsers: Array,
    updateGame: Function,
    gameState: Object,
  },
  data () {
    return {
      currentRoll: undefined,
      currentClaim: undefined,
    }
  },
  watch: {
    gameState () {
      this.currentRoll = undefined
      this.currentClaim = undefined
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
    currentUserIsMe () {
      return this.currentUser.id === this.userId
    },
    previousUser () {
      if (this.gameState[PREVIOUS_USER_ID]) {
        return this.activeUsers.find(user => user.id === this.gameState[PREVIOUS_USER_ID])
      } else {
        return undefined
      }
    },
    canUncover () {
      return this.previousRollExists && !this.currentRoll
    },
    canRoll () {
      return !this.currentRoll && !this.maexleClaimed
    },
    firstInLine () {
      return !this.previousRoll && !this.currentRoll
    },
    previousRollExists () {
      return !!this.previousRoll
    },
    previousRoll () {
      return this.gameState[PREVIOUS_ROLL]
    },
    previousClaimExists () {
      return !!this.previousClaim
    },
    previousClaim () {
      return this.gameState[PREVIOUS_CLAIM]
    },
    previousClaimText () {
      return getRollText(this.previousClaim)
    },
    currentRollText () {
      return getRollText(this.currentRoll)
    },
    previousRollText () {
      return getRollText(this.previousRoll)
    },
    availableValues () {
      return valuesGreaterOrEqual(this.minimumClaimValue.numericValue)
    },
    minimumClaimValue () {
      const minimumValue = this.previousClaimExists ? this.previousClaim + 1 : VALUES[0].numericValue
      const availableClaims = valuesGreaterOrEqual(minimumValue)
      return availableClaims.length > 0 ? availableClaims[0] : undefined
    },
    maexleClaimed () {
      return this.previousClaimExists && (this.previousClaim === MAEXLE_NUMERIC_VALUE)
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
    calculateNextUserId () {
      const currentUserIndex = this.activeUsers.findIndex(user => user.id === this.currentUser.id)
      const nextUserIndex = (currentUserIndex + 1) % this.activeUsers.length
      return this.activeUsers[nextUserIndex].id
    },
    roll () {
      const roll1 = Math.ceil(Math.random() * 6)
      const roll2 = Math.ceil(Math.random() * 6)
      this.currentRoll = this.calculateResult(roll1, roll2)
      this.currentClaim = this.minimumClaimValue
    },
    calculateResult (roll1, roll2) {
      if ((roll1 === 2 && roll2 === 1) || (roll2 === 2 && roll1 === 1)) {
        return MAEXLE_NUMERIC_VALUE
      } else if (roll1 > roll2) {
        return roll1 * 10 + roll2
      } else if (roll2 > roll1) {
        return roll2 * 10 + roll1
      } else if (roll1 === roll2) {
        return 100 + roll1
      }
    },
    sendClaim () {
      const newGameState = JSON.parse(JSON.stringify(this.gameState))
      newGameState[PREVIOUS_USER_ID] = this.currentUser.id
      newGameState[CURRENT_USER_ID] = this.calculateNextUserId()
      newGameState[PREVIOUS_ROLL] = this.currentRoll
      newGameState[PREVIOUS_CLAIM] = this.currentClaim.numericValue
      this.updateGame(newGameState)
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
      if (state[UNCOVERED] && this.previousRoll === MAEXLE_NUMERIC_VALUE) {
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
.actionButton {
  margin-right: 1em;
}

.currentUser {
  font-weight: bold;
}

.userClass {
  margin-right: .5em;
}
</style>
