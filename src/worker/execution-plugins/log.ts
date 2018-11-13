import Action from "../../model/Action";

import logger from '../../services/logger'

export default class LogPlugin {
  msg: string
  action: Action
  preLog: string

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