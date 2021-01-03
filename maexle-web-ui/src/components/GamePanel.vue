<template>
  <div>
    <div>Reihenfolge: <span v-for="user in activeUsers" :key="user.id"
                            v-bind:class="[{ currentUser: (user.id === currentUser.id) }, 'userClass']"
    >{{ user.name }}</span>
    </div>
    <div v-if="currentUserIsMe">Du bist dran!</div>
    <div v-else>{{ currentUser.name }} ist dran</div>
    <div v-if="previousClaimExists">{{ previousClaimText }} ist angesagt von {{ previousUserName }}!</div>
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
</template>

<script>
import {MAEXLE_NUMERIC_VALUE, VALUES, valuesGreaterOrEqual} from './values'
import {getRollText} from '@/components/values'

export default {
  name: 'GamePanel',
  props: {
    userId: String,
    activeUsers: Array,
    currentUser: Object,
    previousUser: Object,
    previousRoll: Number,
    previousClaim: Number,
  },
  data () {
    return {
      currentRoll: undefined,
      currentClaim: undefined,
    }
  },
  computed: {
    previousUserName () {
      return this.previousUser.id === this.userId ? 'dir' : this.previousUser.name
    },
    currentUserIsMe () {
      return this.currentUser.id === this.userId
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
    previousClaimExists () {
      return !!this.previousClaim
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
  },
  methods: {
    reset () {
      this.currentRoll = undefined
      this.currentClaim = undefined
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
      this.$emit('sendClaim', this.currentRoll, this.currentClaim.numericValue)
    },
    giveUp () {
      this.$emit('giveUp')
    },
    uncover () {
      this.$emit('uncover')
    },
    restartGame () {
      this.$emit('restartGame')
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
