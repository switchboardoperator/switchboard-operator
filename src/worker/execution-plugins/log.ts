import Action from '../../model/Action'
import logger from '../../services/logger'

import { ExecutionPluginInterface } from '../ExecutionPluginInterface'

export default class LogPlugin implements ExecutionPluginInterface {
  msg: any
  action: Action
  preLog: string
  options: any

  constructor(msg: any, action: Action, preLog: string) {
    this.msg = msg
    this.action = action
    this.preLog = preLog + ' > ' + action.name + ': %j'
  }

  execute() {
    logger.info(this.preLog, this.msg)

    return Promise.resolve(this.msg)
  }
}
