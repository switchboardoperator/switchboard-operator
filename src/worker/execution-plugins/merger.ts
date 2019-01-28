const debug = require('debug')('sbo-plugin-merger')
import merge from 'deepmerge'
import objectMapper from 'object-mapper'

import Action from "../../model/Action"
import logger from '../../services/logger'
import { MergerPluginOptionsSchema } from "../../schemas/PluginOptionsSchema"
import { ExecutionPluginInterface } from '../ExecutionPluginInterface'

export default class MergerPlugin implements ExecutionPluginInterface {
  action: Action
  options: any
  preLog: string

  constructor(action, preLog) {
    this.action = action

    // Getting the last of previous results comming from previous plugins
    this.options = new MergerPluginOptionsSchema(action.options)

    if (this.options.isErrors()) {
      throw new Error('The options provided are not valid '+ JSON.stringify(this.options.getErrors()))
    }

    this.preLog = preLog + ' > ' + action.name
  }

  execute(message: any) {
    debug(
      'Running merger plugin with options: %j and msg: %j',
      this.options,
      message
    )

    const slicedObjects = []
    this.options.sourceFields.forEach((key) => {
      const slicedObj = objectMapper.getKeyValue(message, key)
      if (slicedObj !== undefined && slicedObj !== null) {
        slicedObjects.push(slicedObj)
      }
    })

    const mergedResult = slicedObjects.reduce((prevObj: any, currObj: any) => {
      if (typeof prevObj === 'string' && typeof currObj === 'string') {
        if (currObj.length) {
          return currObj
        }
        return prevObj
      }

      return merge(prevObj, currObj)
    }, [])

    const result = objectMapper.setKeyValue(message, this.options.targetField, mergedResult)

    logger.info(this.preLog, 'Object merged applied')

    return Promise.resolve(result)
  }
}
