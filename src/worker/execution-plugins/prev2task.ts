const debug = require('debug')('prev2task-plugin')

import { Prev2TaskPluginOptionsSchema } from '../../schemas/PluginOptionsSchema'
import RabbotClient from "../../amqp/RabbotClient"
import Action from "../../model/Action"
import logger from '../../services/logger'

export default class Prev2TaskPlugin {
  options: any
  msg: any
  action: Action
  rabbit: any
  preLog: string

  constructor(msg, action, preLog, rabbit) {
    if (!rabbit) {
      throw new Error('You must provide a rabbitmq instance')
    }

    this.options = new Prev2TaskPluginOptionsSchema(action.options)
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
      return callback(new Error(`Error publishing to the quque ${err}`))
    })
  }
}
