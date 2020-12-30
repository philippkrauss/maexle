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
  console.log(JSON.stringify(event))
  const connectionId = event.requestContext.connectionId
  const userId = event.queryStringParameters.userId
  try {
    let gameId
    if (event.queryStringParameters.action === 'open') {
      gameId = uuidv4()
    } else if (event.queryStringParameters.action === 'join') {
      gameId = event.queryStringParameters.gameId
    }
    const playerName = event.queryStringParameters.playerName
    await persistence.persistPlayer(connectionId, gameId, userId, playerName)
    await notifyPlayerOfJoin(connectionId, gameId)
    await notifyPlayersOfOtherPlayers(gameId)
  } catch (e) {
    console.log(e)
  }
  return {
    statusCode: 200
  }
}

async function notifyPlayersOfOtherPlayers (gameId) {
  const playersInGame = await persistence.loadPlayersInGame(gameId)
  const connectionIds = playersInGame.Items.map(item => item.connectionId)
  const players = playersInGame.Items.map(item => ({id: item.userId, name: item.playerName}))
  console.log(connectionIds)
  console.log(players)
}

async function sendAsString (connectionId, data) {
  await createApiGatewayManagementApi()
      .postToConnection({
        ConnectionId: connectionId,
        Data: JSON.stringify(data),
      }).promise()
}

async function notifyPlayerOfJoin (connectionId, gameId) {
  await sendAsString(connectionId, {
    action: 'JOIN',
    gameId,
  })
}

/* eslint-disable no-unused-vars */
async function disconnect (event, context) {
  /* eslint-enable */
  try {
    await persistence.deleteConnection(event.requestContext.connectionId)
  } catch (e) {
    console.log(e)
  }
  return {
    statusCode: 200
  }
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

/* eslint-disable no-unused-vars */
async function sendMessage (event, context) {
  /* eslint-enable */
//   // Retrieve the list of active WebSocket connections that you recorded on connect
//   const currentConnections = await docClient
//       .scan({
//         TableName: process.env.MAEXLE_TABLE,
//         ProjectionExpression: 'connectionId',
//         // FilterExpression: 'PK = :PK',
//         // ExpressionAttributeValues: {
//         //   ':PK': 'LIVE',
//         // },
//       })
//       .promise()
//
//   // API Gateway WebSocket service
//   console.log(event.requestContext.stage)
//   console.log(event.requestContext.stage)
//   const apiGateway = new ApiGatewayManagementApi({
//     apiVersion: '2018-11-29',
//     endpoint: endpoint,
//   })
//
//   if (currentConnections && currentConnections.Items) {
//     // Loop on all your active connections
//     const sendMessageToAllConnections = currentConnections.Items.map(
//         async ({connectionId: connectionId}) => {
//           try {
//             // And send them a message!
//             await apiGateway
//                 .postToConnection({
//                   ConnectionId: connectionId,
//                   Data: JSON.stringify({
//                     data: 'Hello, world!',
//                   }),
//                 })
//                 .promise()
//           } catch (error) {
//             if (error.statusCode === 410) {
//               console.log(`Found stale connection, deleting ${connectionId}`)
//               await docClient
//                   .delete({
//                     TableName: process.env.MAEXLE_TABLE,
//                     Key: {
//                       connectionId: connectionId,
//                     },
//                   })
//                   .promise()
//             } else {
//               throw error
//             }
//           }
//         },
//     )
//     await Promise.all(sendMessageToAllConnections)
//   }
  return {
    statusCode: 200,
    body: 'OK'
  }
}

module.exports = {
  connect,
  disconnect,
  sendMessage,
  defaultHandler,
  fooHandler
}
