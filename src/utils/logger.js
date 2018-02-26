const winston = require('winston')

const Logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({
      timestamp: () => {
        return Date.now()
      },
      formatter: (options) => {
        return {
          time: options.timestamp(),
          level: options.level,
          msg: undefined !== options.message ? options.message : ''
        }
      }
    })
  ]
})

module.exports.logger = Logger
