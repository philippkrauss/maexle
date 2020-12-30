const dynamodb = require('serverless-dynamodb-client')
const docClient = dynamodb.doc

async function persistPlayer (connectionId, gameId, userId, playerName) {
  await docClient
      .put({
        TableName: process.env.MAEXLE_TABLE,
        Item: {
          connectionId,
          gameId,
          userId,
          playerName
        },
      }).promise()
}

async function loadPlayersInGame (gameId) {
  return await docClient.query({
    TableName: process.env.MAEXLE_TABLE,
    IndexName: 'GameIdIndex',
    KeyConditionExpression: 'gameId = :value',
    ExpressionAttributeValues: {
      ':value': gameId
    },
    Select: 'ALL_ATTRIBUTES',
  }).promise()
}

async function deleteConnection(connectionId) {
  await docClient
        .delete({
          TableName: process.env.MAEXLE_TABLE,
          Key: {
            connectionId: connectionId,
          },
        })
        .promise()
}

module.exports = {
  persistPlayer,
  loadPlayersInGame,
  deleteConnection,
}
