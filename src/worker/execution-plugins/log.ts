import Action from '../../model/Action'
import logger from '../../services/logger'

import { ExecutionPluginInterface } from '../ExecutionPluginInterface'

export default class LogPlugin implements ExecutionPluginInterface {
  action: Action
  preLog: string
  options: any

  constructor(action: Action, preLog: string) {
    this.action = action
    this.preLog = preLog + ' > ' + action.name + ': %j'
  }

  execute(message: any) {
    logger.info(this.preLog, message)

    return Promise.resolve(message)
  }
}
