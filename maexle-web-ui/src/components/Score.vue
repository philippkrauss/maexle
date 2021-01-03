<template>
  <div>
    <h3>Punktestand</h3>
    <div v-for="score in orderedScore" :key="score.id">
      {{ score.id === userId ? 'Du' : score.name }}: {{ score.score }}
    </div>
  </div>
</template>

<script>

export default {
  name: 'Score',
  props: {
    scoreBoard: Array,
    userId: String,
  },
  computed: {
    orderedScore () {
      const score = JSON.parse(JSON.stringify(this.scoreBoard))
      return score.sort((a, b) => (a.score === b.score) ? 0 : ((a.score > b.score) ? 1 : -1))
    }
  },
}
</script>

<style scoped>

</style>
