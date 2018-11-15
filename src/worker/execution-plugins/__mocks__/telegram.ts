import logger from "../../../services/logger"
import Action from "../../../model/Action"

export default class TelegramPlugin {
  msg: string
  action: Action
  preLog: string

  constructor(msg, action, preLog) {
    this.msg = msg,
    this.action = action,
    this.preLog = preLog
  }

  execute(cb) {
    logger.info(this.preLog, 'Running telegram plugin mock')
    cb(null, this.msg)
  }
}
