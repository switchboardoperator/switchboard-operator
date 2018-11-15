import { PluginOptionsSchema } from '../../../schemas/PluginOptionsSchema'
import json from '../../../../test/operators-tester.json'
import Logger from '../../../services/logger'

export default class HttpPlugin {
  msg: any
  options: any
  preLog: string
  action: any

  constructor(msg, action, preLog) {
    this.msg = msg,
    this.options = new PluginOptionsSchema(action.options)
    if (this.options.isErrors()) {
      throw new Error('The options provided are not valid ' + JSON.stringify(this.options.getErrors()))
    }
    this.preLog = preLog + ' > ' + action.name
    this.action = action
  }

  execute(cb) {
    Logger.info(this.preLog, 'Running telegram plugin mock')
    let result = {}
    const data = json[this.action.event].response[this.action.name]

    if (this.options.merge && !this.options.mergeTarget) {
      result = {...this.msg, ...data}
    }

    if (this.options.merge && this.options.mergeTarget) {
      result = {...this.msg}
      result[this.options.mergeTarget] = data
    }
    cb(null, result)
  }
}
