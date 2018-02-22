const { logger } = require('../utils/logger')
const EventSchema  = require('../model/event-schema')
const TaskSchema   = require('../model/task-schema')

module.exports = class Topology {
  constructor(config) {
    this.connection = config.rabbitmq
    this.mapConfigToTopology(config)
  }

  mapConfigToTopology(config) {
    // Saving events and tasks
    this.events = []
    this.tasks = []

    config.events.forEach((elem) => {
      const event = new EventSchema(elem)

      if (!event.isErrors()) {
        this.events.push(event)
      } else {
        logger.error('Event provided has errors: %j', event.getErrors())
      }
    })

    config.tasks.forEach((elem) => {
      const task = new TaskSchema(elem)
      if (!task.isErrors()) {
        this.tasks.push(task)
      } else {
        logger.error('Task provided has errors: %j', task.getErrors())
      }
    })
  }

  getTopology() {
    return {
      connection: this.getRabbotConnection(),
      exchanges: this.getExchangesArray(),
      queues: this.getQueuesArray(),
      bindings: this.getBindingsArray(),
      logging: {
        adapters: {
          stdOut: {
            level: 3,
            bailIfDebug: true
          }
        }
      }
    }
  }

  getRabbotConnection() {
    return {
      user: this.connection.user,
      pass: this.connection.pass,
      server: this.connection.host,
      port: this.connection.port
    }
  }

  getExchangesArray() {
    const exchanges = []
    this.events.forEach((elem) => {
      exchanges.push(elem.toExchange())
      exchanges.push(elem.toDeadLetterExchange())
    })
    this.tasks.forEach((elem) => {
      exchanges.push(elem.toExchange())
    })

    return exchanges
  }

  getQueuesArray() {
    const queues = []
    this.events.forEach((elem) => {
      queues.push(elem.toQueue())
      queues.push(elem.toDeadLetterQueue())
    })

    return queues
  }

  getBindingsArray() {
    const bindings = []
    this.events.forEach((elem) => {
      bindings.push(elem.toBinding())
      bindings.push(elem.toDLBinding())
    })
    return bindings
  }

  getEventByName(name) {
    return this.events.find((element) => {
      return element.eventName === name
    })
  }
}
