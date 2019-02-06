const debug = require('debug')('sbo-plugin-telegram')
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
    super(action, preLog, TelegramPluginOptionsSchema)

    const options = {
      ...config.get('plugins.telegram'),
      ...action.options,
    }

    console.log(options)

    this.loadOptions(TelegramPluginOptionsSchema, options)

    this.token = this.options.token
    if (!this.token) {
      throw new Error('To use the Telegram plugin you must provide a valid bot API token. Talk with https://t.me/BotFather to get yours.')
    }
  }

  sendMessage(chatId, message): Promise<any> {
    const apiUrl = `https://api.telegram.org/bot${this.token}/sendMessage`
    const data = {
      chat_id: chatId,
      text: message,
    }

    return axios({
      method: 'POST',
      url: apiUrl,
      data: data
    })
  }

  execute(message: any) {
    debug(
      'Running telegram plugin with options: %j and msg: %j',
      this.options,
      message
    )

    const renderedTemplate = nunjucks.renderString(
      this.options.template,
      message
    )

    return this.sendMessage(this.options.chatId, renderedTemplate)
      .then(() => message)
  }
}
