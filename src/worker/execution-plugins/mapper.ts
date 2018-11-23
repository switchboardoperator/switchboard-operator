const debug = require('debug')('sbo-plugin-mapper')
import objectMapper from 'object-mapper'

import Action from '../../model/Action'
import logger from '../../services/logger'
import { MapperPluginOptionsSchema } from '../../schemas/PluginOptionsSchema'
import { ExecutionPluginInterface } from '../ExecutionPluginInterface'


export default class MapperPlugin implements ExecutionPluginInterface {
  action: Action
  options: any
  preLog: string

  constructor(action, preLog) {
    this.action = action

    // Getting the last of previous results comming from previous plugins
    this.options = new MapperPluginOptionsSchema(action.options)

    if (this.options.isErrors()) {
      throw new Error('The options provided are not valid '+ JSON.stringify(this.options.getErrors()))
    }

    this.preLog = preLog + ' > ' + action.name
  }

  execute(message: any) {
    debug(
      'Running mapper plugin with options: %j and msg: %j',
      this.options,
      message
    )

    let transformedObj = objectMapper(
      message,
      this.options.fields
    )

    if (this.options.copy.length) {
      this.options.copy.forEach((copy) => {
        transformedObj[copy] = message
      })
    }

    debug('Resulting mapped object is %j', transformedObj)
    logger.info(this.preLog, 'Object mapping applied')

    if (this.options.merge) {
      return Promise.resolve(Object.assign({}, message, transformedObj))
    }

    return Promise.resolve(transformedObj)
  }
}
