<template>
  <div>
    <h2>game</h2>
    <div>Reihenfolge: <span v-for="user in activeUsers" :key="user.id"
                            v-bind:class="[{ currentUser: (user.id === currentUser.id) }, 'userClass']"
    >{{ user.name }}</span>
    </div>
    <div v-if="myTurn">Du bist dran!</div>
    <div v-else>{{ currentUser.name }} ist dran</div>
    <div v-if="previousClaimExists">{{ previousClaimText }} ist angesagt!</div>
    <div v-if="myTurn">
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
    <br/><br/><br/>
    <button @click="done">weiter</button>
  </div>
</template>

<script>
const CURRENT_USER_ID = 'currentUserId'
const PREVIOUS_ROLL = 'previousRoll'
const PREVIOUS_CLAIM = 'previousClaim'

const MAEXLE_LABEL = 'Mäxle'
const MAEXLE_NUMERIC_VALUE = 210

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
  data () {
    return {
      currentRoll: undefined,
      currentClaim: undefined,
      values: [
        {label: '31', numericValue: 31},
        {label: '32', numericValue: 32},
        {label: '41', numericValue: 41},
        {label: '42', numericValue: 42},
        {label: '43', numericValue: 43},
        {label: '51', numericValue: 51},
        {label: '52', numericValue: 52},
        {label: '53', numericValue: 53},
        {label: '54', numericValue: 54},
        {label: '61', numericValue: 61},
        {label: '62', numericValue: 62},
        {label: '63', numericValue: 63},
        {label: '64', numericValue: 64},
        {label: '65', numericValue: 65},
        {label: '1er Pasch', numericValue: 101},
        {label: '2er Pasch', numericValue: 102},
        {label: '3er Pasch', numericValue: 103},
        {label: '4er Pasch', numericValue: 104},
        {label: '5er Pasch', numericValue: 105},
        {label: '6er Pasch', numericValue: 106},
        {label: MAEXLE_LABEL, numericValue: MAEXLE_NUMERIC_VALUE}
      ],
    }
  },
  watch: {
    gameState() {
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
    myTurn () {
      return this.currentUser.id === this.userId
    },
    canUncover() {
      return this.previousRollExists && !this.currentRoll
    },
    canRoll() {
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
      return this.previousClaimExists ? this.getRollText(this.previousClaim) : undefined
    },
    currentRollText () {
      return this.currentRoll ? this.getRollText(this.currentRoll) : undefined
    },
    availableValues () {
      return this.values.filter(value => value.numericValue >= this.minimumClaimValue.numericValue)
    },
    minimumClaimValue () {
      const minimumValue = this.previousClaimExists ? this.previousClaim + 1 : this.values[0].numericValue
      const availableClaims = this.values.filter(value => value.numericValue >= minimumValue)
      return availableClaims.length > 0 ? availableClaims[0] : undefined
    },
    maexleClaimed () {
      return this.previousClaimExists && (this.previousClaim === MAEXLE_NUMERIC_VALUE)
    }
  },
  methods: {
    getRollText (roll) {
      return this.values.find(value => value.numericValue === roll).label
    },
    done () {
      const newGameState = JSON.parse(JSON.stringify(this.gameState))
      newGameState[CURRENT_USER_ID] = this.calculateNextUserId()
      this.updateGame(newGameState)
    },
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
      if (roll1 > roll2) {
        return roll1 * 10 + roll2
      } else if (roll2 > roll1) {
        return roll2 * 10 + roll1
      } else if (roll1 === roll2) {
        return 100 + roll1
      }
    },
    sendClaim () {
      const newGameState = JSON.parse(JSON.stringify(this.gameState))
      newGameState[CURRENT_USER_ID] = this.calculateNextUserId()
      newGameState[PREVIOUS_ROLL] = this.currentRoll
      newGameState[PREVIOUS_CLAIM] = this.currentClaim.numericValue
      this.updateGame(newGameState)
    },
    giveUp () {
      console.log('give up')
    },
    uncover () {
      console.log('uncover')
    }
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
