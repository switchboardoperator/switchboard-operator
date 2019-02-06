const debug = require('debug')('sbo-plugin-setter')

import logger from '../../services/logger'
import Action from "../../model/Action"
import { SetterPluginOptionsSchema } from '../../schemas/PluginOptionsSchema'
import PluginExecutorInterface from '../PluginExecutorInterface'
import OperatorPlugin from '../OperatorPlugin'

export default class SetterPlugin extends OperatorPlugin implements PluginExecutorInterface {
  action: Action
  options: any
  preLog: string

  constructor(action: Action, preLog: string) {
    super(action, preLog, SetterPluginOptionsSchema)
  }

  execute(message: any): Promise<any> {
    debug(
      'Running setter plugin with options: %j and msg: %j',
      this.options,
      message
    )

    const setObj = Object.assign({}, message, this.options.fields)
    logger.info(this.preLog, 'Object setter applied')

    return Promise.resolve(setObj)
  }
}
