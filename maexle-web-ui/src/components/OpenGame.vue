<template>
  <div>
    Hier kannst du ein neues Spiel eröffnen.<br>
    <label>Dein Name: <input type="text" v-model="name"></label><br>
    <button :disabled="!name" @click="openGameClicked">Los geht's</button>
  </div>
</template>

<script>
export default {
  name: 'OpenGame',
  data () {
    return {
      name: null
    }
  },
  props: {
    openGame: Function
  },
  methods: {
    openGameClicked () {
      this.openGame(this.name)
    },
  },
}
</script>

<style scoped>
</style>
