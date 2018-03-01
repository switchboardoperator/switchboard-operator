const { logger } = require('../../utils/logger')

module.exports = class LogPlugin {
  constructor(msg, action, preLog) {
    this.msg = msg
    this.action = action
    this.preLog = preLog + ' > ' + action.name + ': %j'
  }

  execute(callback) {
    logger.info(this.preLog, this.msg)
    return callback(null, this.msg)
  }
}
