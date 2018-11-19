const debug = require('debug')('http-plugin')
import axios from 'axios'
import nunjucks from 'nunjucks'

import Action from '../../model/Action'
import { HTTPPluginOptionsSchema } from '../../schemas/PluginOptionsSchema'
import { ExecutionPluginInterface } from '../ExecutionPluginInterface'

export default class HttpPlugin implements ExecutionPluginInterface {
  msg: any
  options: any
  action: Action
  preLog: string

  constructor(msg: any, action: any, preLog: string) {
    this.msg = msg
    this.action = action
    this.options = new HTTPPluginOptionsSchema(action.options)
    if (this.options.isErrors()) {
      throw new Error('The options provided are not valid ' + JSON.stringify(this.options.getErrors()))
    }
    this.preLog = preLog + ' > ' + action.name
  }

  renderUrl() {
    const renderedUrl = nunjucks.renderString(this.options.url, this.msg)
    debug('Rendered url to make the request is: ' + renderedUrl)
    return renderedUrl
  }

  populateData() {
    return this.msg
  }

  execute() {
    const method = this.options.method.toLowerCase()

    return axios({
      method: method,
      url: this.renderUrl(),
      data: method !== 'get' ? this.populateData() : {}
    })
      .then((response) => {
        debug('Received the next response ' + JSON.stringify(response.data))
        let result = {}

        if (this.options.merge && !this.options.mergeTarget) {
          result = {...this.msg, ...response.data}
        }

        if (this.options.merge && this.options.mergeTarget) {
          result = {...this.msg}
          result[this.options.mergeTarget] = response.data
        }

        return result
      })
      .catch((err) => {
        throw new Error(`Error in the request ${JSON.stringify(err)}`)
      })
  }
}
