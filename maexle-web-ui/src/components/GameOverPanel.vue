<template>
  <div>
    <div>Spiel ist vorbei.</div>
    <div>Letzte Ansage war {{ previousClaimText }}</div>
    <div v-if="currentUserIsMe">
      <div v-if="uncovered">Du hast aufgedeckt.</div>
      <div v-if="uncovered">Gewürfelt war {{ previousRollText }}</div>
      <div v-if="gaveUp">Du hast aufgegeben!</div>
    </div>
    <div v-else>
      <div v-if="uncovered">{{ currentUser.name }} hat aufgedeckt.</div>
      <div v-if="uncovered">Gewürfelt war {{ previousRollText }}</div>
      <div v-if="gaveUp">{{ currentUser.name }} hat aufgegeben!</div>
    </div>
    <div v-if="currentUserIsMe">
      <div v-if="uncovered && previousRollWasMaexle">Du verlierst 2 Punkte</div>
      <div v-if="uncovered && previousRoll < previousClaim">{{ previousUser.name }} verliert 1 Punkt</div>
      <div v-if="uncovered && previousRoll >= previousClaim">Du verlierst 1 Punkt</div>
      <div v-if="gaveUp">Du verlierst 1 Punkt</div>
    </div>
    <div v-else-if="previousUserIsMe">
      <div v-if="uncovered && previousRollWasMaexle">{{ currentUser.name }} verliert 2 Punkte</div>
      <div v-if="uncovered && previousRoll < previousClaim">Du verlierst 1 Punkt</div>
      <div v-if="uncovered && previousRoll >= previousClaim">{{ currentUser.name }} verliert 1 Punkt</div>
      <div v-if="gaveUp">{{ currentUser.name }} verliert 1 Punkt</div>
    </div>
    <div v-else>
      <div v-if="uncovered && previousRollWasMaexle">{{ currentUser.name }} verliert 2 Punkte</div>
      <div v-if="uncovered && previousRoll < previousClaim">{{ previousUser.name }} verliert 1 Punkt</div>
      <div v-if="uncovered && previousRoll >= previousClaim">{{ currentUser.name }} verliert 1 Punkt</div>
      <div v-if="gaveUp">{{ currentUser.name }} verliert 1 Punkt</div>
    </div>
  </div>
</template>

<script>

import {getRollText, MAEXLE_NUMERIC_VALUE} from '@/components/values'

export default {
  name: 'GameOverPanel',
  props: {
    userId: String,
    currentUser: Object,
    previousUser: Object,
    gaveUp: Boolean,
    uncovered: Boolean,
    previousRoll: Number,
    previousClaim: Number,
  },
  computed: {
    currentUserIsMe () {
      return this.currentUser.id === this.userId
    },
    previousRollWasMaexle () {
      return this.previousRoll === MAEXLE_NUMERIC_VALUE
    },
    previousClaimText () {
      return getRollText(this.previousClaim)
    },
    previousRollText () {
      return getRollText(this.previousRoll)
    },
  }
}
</script>

<style scoped>

</style>
