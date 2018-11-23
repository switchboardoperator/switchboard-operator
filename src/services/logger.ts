const winston = require('winston')

const Logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({
      timestamp: () => {
        return Date.now()
      },
      colorize: true,
      silent: process.env.NODE_ENV === 'test',
    }),
  ]
})

export default Logger
