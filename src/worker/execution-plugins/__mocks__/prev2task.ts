import logger from "../../../services/logger"
import Action from "../../../model/Action"

export default class Prev2TaskPlugin {
  msg: string
  action: Action
  preLog: string

  constructor(action, preLog) {
    this.action = action,
    this.preLog = preLog
  }

  execute(message) {
    logger.info(this.preLog, 'Running prev2task plugin mock')

    return Promise.resolve(message)
  }
}
