const winston = require('winston')

const Logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({
      timestamp: () => {
        return Date.now()
      }
    })
  ]
})

module.exports.logger = Logger
