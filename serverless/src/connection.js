const ApiGatewayManagementApi = require('aws-sdk').ApiGatewayManagementApi
const {v4: uuidv4} = require('uuid')
const persistence = require('./persistence')

const endpoint = process.env.IS_OFFLINE ? 'http://localhost:3001' : process.env.websocketsApiDomain
const RESPONSE_OK = {statusCode: 200}

function createApiGatewayManagementApi () {
  return new ApiGatewayManagementApi({
    apiVersion: '2018-11-29',
    endpoint: endpoint,
  })
}

/* eslint-disable no-unused-vars */
async function connect (event, context) {
  /* eslint-enable */
  const user = parseUserFromEvent(event)
  try {
    if (event.queryStringParameters.action === 'open') {
      user.gameId = await persistence.createGame(`Spiel von ${user.name}`)
    } else if (event.queryStringParameters.action === 'join') {
      const valid = await persistence.isGameOpen(user.gameId)
      if (!valid) {
        await notifyUserOfLockedGame(user)
        return RESPONSE_OK
      }
    }
    await persistence.addUserToGame(user)
    await notifyUserOfJoin(user)
    await updateLobbyByGameId(user.gameId)
  } catch (e) {
    console.log(e)
  }
  return RESPONSE_OK
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
  return RESPONSE_OK
}

function parseUserFromEvent (event) {
  return {
    id: event.queryStringParameters.userId,
    name: event.queryStringParameters.userName,
    connectionId: event.requestContext.connectionId,
    gameId: event.queryStringParameters.gameId
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

async function sendStartGame (gameId) {
  const usersInGame = await persistence.getAllUsersInGame(gameId)
  for (const user of usersInGame) {
    await notifyUserOfStartGame(user, usersInGame)
  }
}

async function sendUpdateGame (gameId, gameState) {
  const usersInGame = await persistence.getAllUsersInGame(gameId)
  for (const user of usersInGame) {
    await notifyUserOfUpdateGame(user, gameState)
  }
}

async function notifyUserOfUpdateGame (user, gameState) {
  await sendAsString(user.connectionId, {
    action: 'GAME_UPDATE',
    gameState
  })
}

async function notifyUserOfStartGame (user, usersInGame) {
  await sendAsString(user.connectionId, {
    action: 'GAME_START',
    gameState: {score: usersInGame.map(u => ({id: u.id, name: u.name, score: 0}))}
  })
}

async function notifyUserOfLockedGame (user) {
  await sendAsString(user.connectionId, {
    action: 'BAD_GAME',
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
  const eventBody = JSON.parse(event.body)
  const user = await persistence.getUserByConnection(event.requestContext.connectionId)
  if (eventBody.action === 'startGame') {
    await persistence.lockGame(user.gameId)
    await sendStartGame(user.gameId)
  } else if (eventBody.action === 'updateGame') {
    await sendUpdateGame(user.gameId, eventBody.gameState)
  }
  return {
    statusCode: 200,
  }
}

module.exports = {
  connect,
  disconnect,
  defaultHandler,
}
