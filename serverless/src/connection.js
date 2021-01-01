const ApiGatewayManagementApi = require('aws-sdk').ApiGatewayManagementApi
const {v4: uuidv4} = require('uuid')
const persistence = require('./persistence')

const endpoint = process.env.IS_OFFLINE ? 'http://localhost:3001' : process.env.websocketsApiDomain

function createApiGatewayManagementApi () {
  return new ApiGatewayManagementApi({
    apiVersion: '2018-11-29',
    endpoint: endpoint,
  })
}

/* eslint-disable no-unused-vars */
async function connect (event, context) {
  /* eslint-enable */
  const user = {
    id: event.queryStringParameters.userId,
    name: event.queryStringParameters.userName,
    connectionId: event.requestContext.connectionId,
    gameId: event.queryStringParameters.gameId
  }
  try {
    if (event.queryStringParameters.action === 'open') {
      user.gameId = await persistence.createGame(`Spiel von ${user.name}`)
    }
    await persistence.addUserToGame(user)
    await notifyUserOfJoin(user)
    await updateLobbyByGameId(user.gameId)
  } catch (e) {
    console.log(e)
  }
  return {
    statusCode: 200
  }
}

/* eslint-disable no-unused-vars */
async function disconnect (event, context) {
  /* eslint-enable */
  try {
    const user = await persistence.getUserByConnection(event.requestContext.connectionId)
    await persistence.deleteUser(user)
    const remainingUsersInGame = await persistence.getAllUsersInGame(user.gameId)
    if (remainingUsersInGame.length > 0) {
      await updateLobbyByUsers(remainingUsersInGame)
    } else {
      await persistence.deleteGame(user.gameId)
    }
  } catch (e) {
    console.log(e)
  }
  return {
    statusCode: 200
  }
}

async function updateLobbyByGameId (gameId) {
  const usersInGame = await persistence.getAllUsersInGame(gameId)
  await updateLobbyByUsers(usersInGame)
}

async function updateLobbyByUsers (users) {
  const userInfo = users.map(user => ({id: user.id, name: user.name}))
  users.forEach(user => {
    sendLobbyUpdate(user.connectionId, userInfo)
  })
}

async function sendLobbyUpdate (connectionId, usersInGame) {
  sendAsString(connectionId, {
    action: 'LOBBY_UPDATE',
    usersInGame,
  })
}

async function notifyUserOfJoin (user) {
  await sendAsString(user.connectionId, {
    action: 'JOIN',
    gameId: user.gameId,
  })
}

async function sendAsString (connectionId, data) {
  await createApiGatewayManagementApi()
      .postToConnection({
        ConnectionId: connectionId,
        Data: JSON.stringify(data),
      }).promise()
}

/* eslint-disable no-unused-vars */
async function defaultHandler (event, context) {
  /* eslint-enable */
  console.log('default handler')
  console.log(JSON.stringify(event))
  return {
    statusCode: 200,
    body: 'Hello, default!'
  }
}

/* eslint-disable no-unused-vars */
async function fooHandler (event, context) {
  /* eslint-enable */
  console.log('foo handler')
  console.log(JSON.stringify(event))
  return {
    statusCode: 200,
    body: 'Hello, foo!'
  }
}

module.exports = {
  connect,
  disconnect,
  defaultHandler,
  fooHandler
}
