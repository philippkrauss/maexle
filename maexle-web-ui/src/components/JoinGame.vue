<template>
  <div>
    Spiel beitreten.<br>
    <label>Dein Name: <input type="text" v-model="name"></label><br>
    <button :disabled="!name" @click="joinGameClicked">Los geht's</button>
  </div>
</template>

<script>
export default {
  name: 'JoinGame',
  data () {
    return {
      name: null
    }
  },
  props: {
    joinGame: Function
  },
  methods: {
    joinGameClicked () {
      this.joinGame(this.name)
    },
  },
}
</script>

<style scoped>
</style>
