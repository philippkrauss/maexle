const dynamodb = require('serverless-dynamodb-client')
const ApiGatewayManagementApi = require('aws-sdk').ApiGatewayManagementApi

const docClient = dynamodb.doc

/* eslint-disable no-unused-vars */
async function connect (event, context) {
  /* eslint-enable */
  console.log(JSON.stringify(event))
  try {
    await docClient
        .put({
          TableName: process.env.MAEXLE_TABLE,
          Item: {
            connectionId: event.requestContext.connectionId,
          },
        })
        .promise()
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
    await docClient
        .delete({
          TableName: process.env.MAEXLE_TABLE,
          Key: {
            connectionId: event.requestContext.connectionId,
          },
        })
        .promise()
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
  // Retrieve the list of active WebSocket connections that you recorded on connect
  const currentConnections = await docClient
      .scan({
        TableName: process.env.MAEXLE_TABLE,
        ProjectionExpression: 'connectionId',
        // FilterExpression: 'PK = :PK',
        // ExpressionAttributeValues: {
        //   ':PK': 'LIVE',
        // },
      })
      .promise()

  // API Gateway WebSocket service
  console.log(event.requestContext.stage)
  console.log(event.requestContext.stage)
  const endpoint = process.env.IS_OFFLINE ? 'http://localhost:3001' : process.env.websocketsApiDomain
  const apiGateway = new ApiGatewayManagementApi({
    apiVersion: '2018-11-29',
    endpoint: endpoint,
  })

  if (currentConnections && currentConnections.Items) {
    // Loop on all your active connections
    const sendMessageToAllConnections = currentConnections.Items.map(
        async ({connectionId: connectionId}) => {
          try {
            // And send them a message!
            await apiGateway
                .postToConnection({
                  ConnectionId: connectionId,
                  Data: JSON.stringify({
                    data: 'Hello, world!',
                  }),
                })
                .promise()
          } catch (error) {
            if (error.statusCode === 410) {
              console.log(`Found stale connection, deleting ${connectionId}`)
              await docClient
                  .delete({
                    TableName: process.env.MAEXLE_TABLE,
                    Key: {
                      connectionId: connectionId,
                    },
                  })
                  .promise()
            } else {
              throw error
            }
          }
        },
    )
    await Promise.all(sendMessageToAllConnections)
  }
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
