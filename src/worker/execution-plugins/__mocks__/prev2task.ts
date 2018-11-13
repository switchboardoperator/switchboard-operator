import logger from "../../../services/logger"
import Action from "../../../model/Action"

export default class Prev2TaskPlugin {
  msg: string
  action: Action
  preLog: string

  constructor(msg, action, preLog) {
    this.msg = msg,
    this.action = action,
    this.preLog = preLog
  }

  execute(cb) {
    logger.info('Running prev2task plugin mock')
    cb(null, this.msg)
  }
}
