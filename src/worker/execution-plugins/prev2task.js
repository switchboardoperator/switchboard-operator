const SchemaObject = require('schema-object')
const debug = require('debug')('prev2task-plugin')

const { logger } = require('../../utils/logger')

const PluginOptionsSchema = new SchemaObject({
  target: {
    type: String,
    required: true
  },
  targetRoute: {
    type: String,
    required: true
  }
})

module.exports = class Prev2TaskPlugin {
  constructor(msg, action, preLog, rabbit) {
    if (!rabbit) {
      throw new Error('You must provide a rabbitmq instance')
    }

    this.options = new PluginOptionsSchema(action.options)
    if (this.options.isErrors()) {
      throw new Error('The options provided are not valid '+ JSON.stringify(this.options.getErrors()))
    }

    this.msg = msg
    this.action = action
    this.rabbit = rabbit
    this.preLog = preLog + ' > ' + action.name
  }

  execute(callback) {
    const { rabbit } = this
    const exchange = this.action.options.target
    debug('Exchange selected %s', exchange)
    const route = this.action.options.targetRoute
    debug('Route selected %s', route)
    debug('Sending the next message: %j', this.msg)

    const payload = this.msg.body || this.msg

    rabbit.publish(exchange, {
      routingKey: route,
      contentType: 'application/json',
      body: payload,
      replyTimeout: 3000
    }).then(() => {
      logger.info(this.preLog, ': event2task executed')
      return callback(null, this.msg)
    }, (err) => {
      logger.info(this.preLog, ': event2task failed')
      return callback(new Error('Error publishing to the quque', err))
    })
  }
}
