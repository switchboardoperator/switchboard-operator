const debug = require('debug')('sbo-plugin-log')

import Action from '../../model/Action'
import logger from '../../services/logger'
import PluginExecutorInterface from '../PluginExecutorInterface'
import OperatorPlugin from '../OperatorPlugin'

export default class LogPlugin extends OperatorPlugin implements PluginExecutorInterface {
  action: Action
  preLog: string
  options: any

  constructor(action: Action, preLog: string) {
    // Weird, right? But without this, tests are failing due to
    // how the rabbit client is being passed through the app
    super(action, preLog)
  }

  execute(message: any): Promise<any> {
    debug(
      'Running log plugin with msg: %j',
      message
    )

    logger.info(this.preLog, message)

    return Promise.resolve(message)
  }
}
