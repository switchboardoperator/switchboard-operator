const debug = require('debug')('http-plugin')
import axios from 'axios'
import nunjucks from 'nunjucks'

import logger from '../../services/logger'
import Action from '../../model/Action'
import { HTTPPluginOptionsSchema } from '../../schemas/PluginOptionsSchema'
import { ExecutionPluginInterface } from '../ExecutionPluginInterface'

export default class HttpPlugin implements ExecutionPluginInterface {
  msg: any
  options: any
  action: Action
  preLog: string

  constructor(action: any, preLog: string) {
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

  execute(message: any) {
    this.msg = message

    debug(
      'Running HTTP plugin with options: %j and msg: %j',
      this.options,
      message
    )

    const method = this.options.method.toLowerCase()
    logger.info(this.preLog, 'Making HTTP request')

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

        logger.info(this.preLog, 'HTTP request was successful')

        return result
      })
      .catch((err) => {
        let message = 'Unknown error'
        if (err.toString().length) {
          message = err.toString()
        } else {
          try {
            message = JSON.stringify(err)
          } finally {}
        }
        throw new Error(`Error in the request ${message}`)
      })
  }
}
