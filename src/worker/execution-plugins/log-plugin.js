const { logger } = require('../../utils/logger')

module.exports = class LogPlugin {
  constructor(msg, action) {
    this.msg = msg
    this.action = action
  }

  execute(callback) {
    logger.info(this.action.name, ': ', this.msg)
    return callback(null, this.msg)
  }
}
