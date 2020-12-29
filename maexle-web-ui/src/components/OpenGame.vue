<template>
  <div>
    Hier kannst du ein neues Spiel eröffnen.<br>
    Dein Name: <input type="text" v-model="name"><br>
    <button @click="open">Los geht's</button>
  </div>
</template>

<script>
export default {
  name: 'OpenGame',
  data() {
    return {
      name: null
    }
  },
  methods: {
    open() {
      console.log('open ' + this.name)
    }
  }
}
</script>

<style scoped>
</style>
