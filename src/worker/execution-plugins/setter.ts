const debug = require('debug')('setter-plugin')

import logger from '../../services/logger'
import Action from "../../model/Action"
import { SetterPluginOptionsSchema } from '../../schemas/PluginOptionsSchema'
import { ExecutionPluginInterface } from '../ExecutionPluginInterface'

export default class SetterPlugin implements ExecutionPluginInterface {
  action: Action
  options: any
  preLog: string

  constructor(action, preLog) {
    this.action = action

    // Getting the last of previous results comming from previous plugins
    this.options = new SetterPluginOptionsSchema(action.options)


    if (this.options.isErrors()) {
      throw new Error('The options provided are not valid '+ JSON.stringify(this.options.getErrors()))
    }

    this.preLog = preLog + ' > ' + action.name
  }

  execute(message: any) {
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
