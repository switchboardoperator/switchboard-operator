const winston = require('winston')

const Logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({
      timestamp: () => {
        return Date.now()
      },
      colorize: process.env.NODE_ENV !== 'production',
      silent: process.env.NODE_ENV === 'test',
    }),
  ]
})

export default Logger
