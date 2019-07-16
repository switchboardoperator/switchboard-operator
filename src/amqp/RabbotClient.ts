// Raboot
// This class set ups RabbitMQ with specified topology

import logger from '../services/logger'
import Event from '../model/Event'
import ActionCreator from '../worker/ActionCreator'

const debug = require('debug')('rabbit-client')

export default class RabbotClient {
  rabbit: any
  topology: object
  events: Array<Event>

  constructor(rabbit, topology, events) {
    if (!events) {
      logger.error('RabbotClient needs events to listen to')
    }

    this.rabbit   = rabbit
    this.topology = topology
    this.events  = events
  }

  start() {
    this.mapActionsToHandlers()
      .then(() => {
        this.rabbit
          .configure(this.topology)
          .then(() => {
            debug('Connected to rabbit with the next topology: %j', this.topology)
            logger.info('connected to rabbitmq successfully')
          })
      })
  }

  mapActionsToHandlers() {
    return new Promise((resolve) => {
      this.events.forEach((event) => {
        const eventObj = new Event(event)
        const actionCreator = new ActionCreator(
          this.rabbit,
          eventObj
        )
        actionCreator.createHandler()
      })
      resolve()
    })
  }
}
