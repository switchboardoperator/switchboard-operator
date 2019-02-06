const debug = require('debug')('sbo-plugin-prev2task')

import RabbotClient from "../../amqp/RabbotClient"
import Action from "../../model/Action"
import logger from '../../services/logger'
import { Prev2TaskPluginOptionsSchema } from '../../schemas/PluginOptionsSchema'
import PluginExecutorInterface from '../PluginExecutorInterface'
import OperatorPlugin from '../OperatorPlugin'

export default class Prev2TaskPlugin extends OperatorPlugin implements PluginExecutorInterface {
  options: any
  action: Action
  rabbit: any
  preLog: string

  constructor(action: Action, preLog: string, rabbit: any) {
    super(action, preLog, Prev2TaskPluginOptionsSchema)

    if (!rabbit) {
      throw new Error('You must provide a rabbitmq instance')
    }

    this.rabbit = rabbit
  }

  execute(message: any): Promise<any> {
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
