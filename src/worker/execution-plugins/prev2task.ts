const debug = require('debug')('sbo-plugin-prev2task')

import RabbotClient from "../../amqp/RabbotClient"
import Action from "../../model/Action"
import logger from '../../services/logger'
import { Prev2TaskPluginOptionsSchema } from '../../schemas/PluginOptionsSchema'
import { ExecutionPluginInterface } from '../ExecutionPluginInterface'

export default class Prev2TaskPlugin implements ExecutionPluginInterface {
  options: any
  action: Action
  rabbit: any
  preLog: string

  constructor(action, preLog, rabbit) {
    if (!rabbit) {
      throw new Error('You must provide a rabbitmq instance')
    }

    this.options = new Prev2TaskPluginOptionsSchema(action.options)
    if (this.options.isErrors()) {
      throw new Error('The options provided are not valid '+ JSON.stringify(this.options.getErrors()))
    }

    this.action = action
    this.rabbit = rabbit
    this.preLog = preLog + ' > ' + action.name
  }

  execute(message: any) {
    const { rabbit, action: { options } } = this
    const exchange = options.target
    const route = options.targetRoute

    debug('Exchange selected %s', exchange)
    debug('Route selected %s', route)
    debug('Sending the next message: %j', message)

    const payload = message.body || message

    return rabbit.publish(exchange, {
      routingKey: route,
      contentType: 'application/json',
      body: payload,
      replyTimeout: 3000
    }).then(() => {
      logger.info(this.preLog, ': event2task executed')

      return message
    }).catch((err) => {
      logger.error(this.preLog, ': event2task failed')

      throw err
    })
  }
}
