const debug = require('debug')('mapper-plugin')
import objectMapper from 'object-mapper'

import Action from '../../model/Action'
import logger from '../../services/logger'
import { MapperPluginOptionsSchema } from '../../schemas/PluginOptionsSchema'
import { ExecutionPluginInterface } from '../ExecutionPluginInterface'


export default class MapperPlugin implements ExecutionPluginInterface {
  msg: any
  action: Action
  options: any
  preLog: string

  constructor(msg, action, preLog) {
    this.msg = msg
    this.action = action
    debug('received next msg: %j', this.msg)
    debug('received next action: %j', this.action)

    // Getting the last of previous results comming from previous plugins
    this.options = new MapperPluginOptionsSchema(action.options)

    debug(
      'Instance transformer plugin with options: %j and msg: %j',
      this.options,
      this.msg
    )

    if (this.options.isErrors()) {
      throw new Error('The options provided are not valid '+ JSON.stringify(this.options.getErrors()))
    }

    this.preLog = preLog + ' > ' + action.name
  }

  execute() {
    let transformedObj = objectMapper(
      this.msg,
      this.options.fields
    )

    if (this.options.copy.length) {
      this.options.copy.forEach((copy) => {
        transformedObj[copy] = this.msg
      })
    }

    debug('Result mapped object is %j', transformedObj)
    logger.info(this.preLog, 'Object mapping applied')

    if (this.options.merge) {
      return Promise.resolve(Object.assign({}, this.msg, transformedObj))
    }

    return Promise.resolve(transformedObj)
  }
}
