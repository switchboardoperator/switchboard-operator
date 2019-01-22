const debug = require('debug')('conditional-plugin')

import Action from '../../model/Action'
import logger from '../../services/logger'
import { ConditionalPluginOptionsSchema } from '../../schemas/PluginOptionsSchema'
import { ExecutionPluginInterface } from '../ExecutionPluginInterface'

// Convert objecto to one level of deepness
const flattenObject = (ob) => {
  var toReturn = {}

  for (var index in ob) {
    if (!ob.hasOwnProperty || !ob.hasOwnProperty(index)) {
      continue
    }

    if ((typeof ob[index]) === 'object') {
      var flatObject = flattenObject(ob[index])
      for (var prop in flatObject) {
        if (!flatObject.hasOwnProperty(prop)) {
          continue
        }

        toReturn[index + '.' + prop] = flatObject[prop]
      }
    } else {
      toReturn[index] = ob[index]
    }
  }
  return toReturn
}

export default class ConditionalPlugin implements ExecutionPluginInterface {
  action: Action
  preLog: string
  parsedMessage: object
  options: any

  constructor(action, preLog) {
    this.action = action
    this.preLog = preLog + ' > ' + action.name

    this.options = new ConditionalPluginOptionsSchema(action.options)
  }

  // Execute the conditions logic
  checkConditions() {
    let retValue = true
    this.options.conditions.forEach((condition, index) => {
      // On one action not passing it always should return false
      if (!retValue) {
        return false
      }

      logger.info(this.preLog, ': Checking operation', index + 1, 'of', this.options.conditions.length)

      debug(this.preLog, ': Checking next condition:', condition)
      debug(this.preLog, ': with value', this.parsedMessage[condition.field])
      debug(this.preLog, ': Against the next parsed message', this.parsedMessage)
      let field = this.parsedMessage[condition.field]
      let value = condition.checkValue
      if (!isNaN(field)) {
        field = Number(field)
      }
      if (!isNaN(value)) {
        value = Number(value)
      }

      switch (condition.operation) {
        case 'isTrue':
          retValue = field === true
          break
        case 'defined':
          retValue = field !== undefined
          break
        case 'undefined':
          retValue = field === undefined
          break
        case '===':
          retValue = field === value
          break
        case '!==':
          retValue = field !== value
          break

        default:
          retValue = false
      }
    })

    if (retValue) {
      debug(this.preLog, ': Check PASSED')
    }

    return retValue
  }

  execute(message: any) {
    this.parsedMessage = flattenObject(message)

    debug(
      'Running conditional plugin with options: %j and msg: %j',
      this.options,
      message
    )

    return new Promise((resolve, reject) => {
      if (!this.checkConditions()) {
        logger.info(this.preLog, 'Some conditional check has failed')
        return reject({action: 'abort'})
      }

      logger.info(this.preLog, ': All conditional checks has been passed')
      return resolve(message)
    })
  }
}
