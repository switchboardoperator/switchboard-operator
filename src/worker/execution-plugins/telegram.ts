const debug = require('debug')('sbo-plugin-telegram')
import decamelizeKeys from 'decamelize-keys'
import axios from 'axios'
import config from 'config'
import nunjucks from 'nunjucks'

import Action from '../../model/Action'
import { TelegramPluginOptionsSchema } from '../../schemas/PluginOptionsSchema'
import PluginExecutorInterface from '../PluginExecutorInterface'
import OperatorPlugin from '../OperatorPlugin'

export default class TelegramPlugin extends OperatorPlugin implements PluginExecutorInterface {
  action: Action
  preLog: string
  token: string
  options: any

  constructor(action: Action, preLog: string) {
    // Note we're not passing the TelegramPluginOptionsSchema to avoid
    // double-checking before loading the data
    super(action, preLog)

    const options = {
      ...config.get('plugins.telegram'),
      ...action.options,
    }

    this.loadOptions(TelegramPluginOptionsSchema, options)

    this.token = this.options.token
    if (!this.token) {
      throw new Error('To use the Telegram plugin you must provide a valid bot API token. Talk with https://t.me/BotFather to get yours.')
    }
  }

  prepare(message): any {
    let options = this.options.toObject()
    for (let option of Object.keys(options)) {
      if (typeof options[option] !== 'string') {
        continue
      }

      options[option] = nunjucks.renderString(
        options[option],
        message
      )
    }


    options = {
      ...options,
      text: options.template,
    }

    delete options.template
    delete options.token

    return decamelizeKeys(options)
  }

  sendMessage(data: any): Promise<any> {
    const apiUrl = `https://api.telegram.org/bot${this.token}/sendMessage`

    return axios({
      method: 'POST',
      url: apiUrl,
      data,
    })
  }

  execute(message: any) {
    debug(
      'Running telegram plugin with options: %j and msg: %j',
      this.options,
      message
    )

    return this.sendMessage(this.prepare(message))
      // We currently don't care about telegram response, and return the same
      // received message. It would be cool to add options like in the http plugin
      // to merge or replace the message with the API response.
      .then(() => message)
  }
}
