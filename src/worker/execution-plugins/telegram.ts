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
  telegramToken: string
  options: any

  constructor(action: Action, preLog: string) {
    super(action, preLog, TelegramPluginOptionsSchema)

    if (config.has('plugins.telegram.token')) {
      this.telegramToken = config.get('plugins.telegram.token')
    } else {
      throw new Error('To use Telegram plugin you must provide a token. Talk to @BotFather to get yours.')
    }
  }

  sendMessage(chatId, message): Promise<any> {
    const apiUrl = `https://api.telegram.org/bot${this.telegramToken}/sendMessage`
    const data = {
      chat_id: chatId,
      text: message,
      disable_web_page_preview: true,
      parse_mode: 'Markdown',
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
