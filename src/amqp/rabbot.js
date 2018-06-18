// Raboot
// This class set ups RabbitMQ with specified topology

const { logger } = require('../utils/logger')
const ActionCreator = require('../worker/action-creator')
const EventSchema = require('../model/event-schema')
const debug = require('debug')('rabbot')

module.exports = class Rabbot {
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
        const eventObj = new EventSchema(event)
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
