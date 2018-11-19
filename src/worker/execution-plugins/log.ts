import Action from '../../model/Action'
import logger from '../../services/logger'
import { ExecutionPluginInterface } from '../ExecutionPluginInterface'

export default class LogPlugin implements ExecutionPluginInterface {
  msg: string
  action: string
  preLog: string
  options: any

  constructor(msg, action, preLog) {
    this.msg = msg
    this.action = action.name
    this.preLog = preLog + ' > ' + action.name + ': %j'
  }

  execute() {
    logger.info(this.preLog, this.msg)

    return Promise.resolve(this.msg)
  }
}
