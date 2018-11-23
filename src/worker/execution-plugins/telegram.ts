const debug = require('debug')('sbo-plugin-telegram')
import axios from 'axios'
import config from 'config'
import nunjucks from 'nunjucks'

import Action from '../../model/Action'
import { TelegramPluginOptionsSchema } from '../../schemas/PluginOptionsSchema'
import { ExecutionPluginInterface } from '../ExecutionPluginInterface'

export default class TelegramPlugin implements ExecutionPluginInterface {
  action: Action
  preLog: string
  telegramToken: string
  options: any

  constructor(action, preLog) {
    this.action = action
    this.preLog = preLog + ' > ' + action.name + ': %j'
    this.options = new TelegramPluginOptionsSchema(action.options)

    if (this.options.isErrors()) {
      throw new Error('The options provided are not valid '+ JSON.stringify(this.options.getErrors()))
    }

    if (config.has('plugins.telegram.token')) {
      this.telegramToken = config.get('plugins.telegram.token')
    } else {
      throw new Error('To use Telegram plugin you must provide a token. Talk to @BotFather to get yours.')
    }
  }

  sendMessage(chatId, message) {
    const apiUrl = `https://api.telegram.org/bot${this.telegramToken}/sendMessage`
    const data = {
      chat_id: chatId,
      text: message
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
  }
}
