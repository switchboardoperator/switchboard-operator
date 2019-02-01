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

  castValue(value: any): string | number {
    if (!isNaN(value)) {
      return Number(value)
    }

    return value
  }

  empty(field: any): boolean {
    if (isNaN(field) && typeof field !== 'string' && !field) {
      return true
    }

    if (!isNaN(parseInt(field, 10))) {
      return false
    }

    return field.trim().length === 0
  }

  operation(operation: string | boolean, field: any, value: any): boolean {
    switch (operation) {
      case true:
      case 'true':
      case 'isTrue':
      return field === true

      case false:
      case 'false':
      case 'isFalse':
        return field === false

      case 'defined':
        return field !== undefined

      case 'undefined':
        return field === undefined

      case '===':
        return this.castValue(field) === this.castValue(value)

      case '!==':
        return this.castValue(field) !== this.castValue(value)

      case 'empty':
        return this.empty(field)

      case 'notEmpty':
        return !this.empty(field)

      default:
        return false
    }
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

      retValue = this.operation(
        condition.operation,
        this.parsedMessage[condition.field],
        condition.checkValue
      )
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
