const TelegramBot = require('node-telegram-bot-api')
const SchemaObject = require('schema-object')
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

module.exports = class TelegramPlugin {
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
      this.bot = new TelegramBot(
        config.get('plugins.telegram.token')
      )
    } else {
      throw new Error('To use Telegram plugin you must provide token, talk to @BotFather to get yours.')
    }
  }

  execute(callback) {
    const renderedTemplate = nunjucks.renderString(
      this.options.template, this.msg
    )
    this.bot.sendMessage(this.options.chatId, renderedTemplate)
    return callback(null, this.msg)
  }
}
