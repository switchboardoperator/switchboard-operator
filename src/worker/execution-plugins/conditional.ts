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
  msg: string
  action: Action
  preLog: string
  parsedMessage: object
  options: any

  constructor(msg, action, preLog) {
    this.msg = msg
    this.action = action
    this.preLog = preLog + ' > ' + action.name
    this.parsedMessage = flattenObject(
      this.msg
    )

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
      switch (condition.operation) {
      case 'isTrue':
        retValue = this.parsedMessage[condition.field] === true
        break
      case 'defined':
        retValue = this.parsedMessage[condition.field] !== undefined
        break
      case 'undefined':
        retValue = this.parsedMessage[condition.field] === undefined
        break
      case '===':
        retValue = this.parsedMessage[condition.field] === condition.checkValue
        break
      case '!==':
        retValue = this.parsedMessage[condition.field] !== condition.checkValue
        break
      }
    })

    if (retValue) {
      debug(this.preLog, ': Check PASSED')
    }

    return retValue
  }

  execute() {
    return new Promise((resolve, reject) => {
      if (!this.checkConditions()) {
        logger.info(this.preLog, 'Some conditional check has failed')
        return reject({action: 'abort'})
      }

      logger.info(this.preLog, ': All conditional checks has been passed')
      return resolve(this.msg)
    })
  }
}
