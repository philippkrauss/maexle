const dynamodb = require('serverless-dynamodb-client')
const docClient = dynamodb.doc
const {v4: uuidv4} = require('uuid')
const TableName = process.env.MAEXLE_TABLE
const IndexName = 'ConnectionIdIndex'

const STATUS_LOCKED = 'LOCKED'
const STATUS_OPEN = 'OPEN'

function getGamePKey (gameId) {
  return `GAME-${gameId}`
}

const userSKeyPrefix = 'USER-'

function getUserSKey (userId) {
  return `${userSKeyPrefix}${userId}`
}

const gameSKey = 'game'

async function createGame (gameName) {
  const gameId = uuidv4()
  await docClient
      .put({
        TableName,
        Item: {
          pKey: getGamePKey(gameId),
          sKey: gameSKey,
          gameName,
          status: STATUS_OPEN
        },
      }).promise()
  return gameId
}

async function gameExists (gameId) {
  const getResponse = await docClient.get({
    TableName,
    Key: {
      pKey: getGamePKey(gameId),
      sKey: gameSKey,
    },
  })
  return !!getResponse.Item
}

function assertGameExists (gameId) {
  if (!gameExists(gameId)) {
    throw new Error(`Game ${gameId} does not exist`)
  }
}

async function addUserToGame (user) {
  assertGameExists(user.gameId)
  await docClient
      .put({
        TableName,
        Item: {
          pKey: getGamePKey(user.gameId),
          sKey: getUserSKey(user.id),
          gameId: user.gameId,
          userId: user.id,
          userName: user.name,
          connectionId: user.connectionId,
        },
      }).promise()
}

async function getAllUsersInGame (gameId) {
  const response = await docClient.query({
    TableName,
    KeyConditionExpression: 'pKey = :pKeyValue AND begins_with(sKey, :sKeyPrefix)',
    ExpressionAttributeValues: {
      ':pKeyValue': getGamePKey(gameId),
      ':sKeyPrefix': userSKeyPrefix,
    },
    Select: 'ALL_ATTRIBUTES',
  }).promise()
  return response.Items.map(item => ({
    id: item.userId,
    name: item.userName,
    connectionId: item.connectionId,
    gameId: item.gameId,
  }))
}

async function lockGame (gameId) {
  await docClient.update({
    TableName,
    Key: {
      pKey: getGamePKey(gameId),
      sKey: gameSKey,
    },
    UpdateExpression: 'SET status = :value',
    ExpressionAttributeValues: {
      ':value': STATUS_LOCKED
    },
  })
}

async function isGameLocked (gameId) {
  const getResponse = await docClient.get({
    TableName,
    Key: {
      pKey: getGamePKey(gameId),
      sKey: gameSKey,
    },
  })
  return (getResponse.Item && getResponse.Item.status === STATUS_LOCKED)
}

async function stillUsersInGame (gameId) {
  const usersInGame = await getAllUsersInGame(gameId)
  return usersInGame.length > 0
}

async function deleteUser (user) {
  await docClient
      .delete({
        TableName,
        Key: {
          pKey: getGamePKey(user.gameId),
          sKey: getUserSKey(user.id)
        },
      })
      .promise()
}

async function deleteGame (gameId) {
  const remainingUsersInGame = await getAllUsersInGame(gameId)
  for (const user of remainingUsersInGame) {
    await removeUserFromGame(gameId, user.id)
  }
  await docClient
      .delete({
        TableName,
        Key: {
          pKey: getGamePKey(gameId),
          sKey: gameSKey
        },
      })
      .promise()
}

async function getUserByConnection (connectionId) {
  const response = await docClient.query({
    TableName,
    IndexName,
    KeyConditionExpression: 'connectionId = :value',
    ExpressionAttributeValues: {
      ':value': connectionId
    },
    Select: 'ALL_ATTRIBUTES',
  }).promise()
  if (!response.Items || response.Items.length !== 1) {
    throw new Error(`user with connectionId ${connectionId} does not exist`)
  }
  return {
    id: response.Items[0].userId,
    name: response.Items[0].userName,
    connectionId: response.Items[0].connectionId,
    gameId: response.Items[0].gameId,
  }
}

module.exports = {
  createGame,
  gameExists,
  addUserToGame,
  getAllUsersInGame,
  lockGame,
  isGameLocked,
  stillUsersInGame,
  deleteUser,
  deleteGame,
  getUserByConnection,
}
