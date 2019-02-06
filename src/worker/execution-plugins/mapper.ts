const debug = require('debug')('sbo-plugin-mapper')
import objectMapper from 'object-mapper'

import Action from '../../model/Action'
import logger from '../../services/logger'
import { MapperPluginOptionsSchema } from '../../schemas/PluginOptionsSchema'
import PluginExecutorInterface from '../PluginExecutorInterface'
import OperatorPlugin from '../OperatorPlugin'

export default class MapperPlugin extends OperatorPlugin implements PluginExecutorInterface {
  action: Action
  options: any
  preLog: string

  constructor(action: Action, preLog: string) {
    super(action, preLog, MapperPluginOptionsSchema)
  }

  execute(message: any): Promise<any> {
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
