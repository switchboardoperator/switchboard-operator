import { HTTPPluginOptionsSchema } from '../../../schemas/PluginOptionsSchema'
import json from '../../../../test/operators-tester.json'
import logger from '../../../services/logger'

export default class HttpPlugin {
  msg: any
  options: any
  preLog: string
  action: any
  response: any

  constructor(action, preLog) {
    this.options = new HTTPPluginOptionsSchema(action.options)
    if (this.options.isErrors()) {
      throw new Error('The options provided are not valid ' + JSON.stringify(this.options.getErrors()))
    }
    this.preLog = preLog + ' > ' + action.name
    this.action = action
    this.response = null
  }

  public injectResponse(response) {
    this.response = response
  }

  execute(msg) {
    logger.info(this.preLog, 'Running HTTP plugin mock')

    if (!this.response) {
      return Promise.reject('HTTP response not specified')
    }

    let result = {}

    if (this.options.merge && !this.options.mergeTarget) {
      result = {...msg, ...this.response}
    }

    if (this.options.merge && this.options.mergeTarget) {
      result = {...msg}
      result[this.options.mergeTarget] = this.response
    }

    return Promise.resolve(result)
  }
}
