import Action from "../../model/Action";

const SchemaObject = require('schema-object')
const axios = require('axios')
const config = require('config')
const nunjucks = require('nunjucks')

const PluginOptionsSchema = new SchemaObject({
  chatId: {
    type: String,
    required: true
  },
  template: {
    type: String,
    required: true
  }
})

export default class TelegramPlugin {
  msg: string
  action: Action
  preLog: string
  telegramToken: string
  options: any

  constructor(msg, action, preLog) {
    this.msg = msg
    this.action = action
    this.preLog = preLog + ' > ' + action.name + ': %j'
    this.options = new PluginOptionsSchema(action.options)

    if (this.options.isErrors()) {
      throw new Error('The options provided are not valid '+ JSON.stringify(this.options.getErrors()))
    }

    if (config.has('plugins.telegram.token')) {
      this.telegramToken = config.get('plugins.telegram.token')
    } else {
      throw new Error('To use Telegram plugin you must provide token, talk to @BotFather to get yours.')
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

  execute(callback) {
    const renderedTemplate = nunjucks.renderString(
      this.options.template, this.msg
    )
    this.sendMessage(this.options.chatId, renderedTemplate)
      .then(() => {
        return callback(null, this.msg)
      })
      .catch((err) => {
        return callback(err, this.msg)
      })
  }
}
