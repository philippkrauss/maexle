<template>
  <div id="app">
    <h1>Mäxle</h1>
    <router-view></router-view>
  </div>
</template>

<script>

export default {
  name: 'App',
  data: function () {
    return {
      connection: null,
      // endpoint: 'wss://fly71sq1s6.execute-api.eu-central-1.amazonaws.com/dev',
      endpoint: 'ws://localhost:3001?asdf=true',
    }
  },
  created: function () {
    console.log(this.$route.query)
    console.log('Starting connection to WebSocket Server')
    this.connection = new WebSocket(this.endpoint)

    this.connection.onmessage = function (event) {
      console.log(event)
      console.log('onmessage')
    }

    this.connection.onopen = function (event) {
      console.log(event)
      console.log('Successfully connected to the websocket server...')
    }

  },
  methods: {
    sendMessage: function (message) {
      console.log(this.connection)
      console.log('sending message')
      this.connection.send(JSON.stringify({action: message}))
    }
  },
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
