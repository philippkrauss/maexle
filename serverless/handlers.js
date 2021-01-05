const connection = require('./src/connection')

module.exports.connect = connection.connect
module.exports.disconnect = connection.disconnect
module.exports.defaultHandler = connection.defaultHandler
