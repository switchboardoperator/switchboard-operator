import ConnectionSchema  from './ConnectionSchema'
import logger from '../services/logger'
import Event from '../model/Event'
import Task  from '../model/Task'
import Config  from '../model/Config'

export default class Topology {
  connection: ConnectionSchema
  events: Array<Event>
  tasks: Array<Task>

  constructor(config: Config) {
    this.connection = config.rabbitmq
    this.mapConfigToTopology(config)
  }

  mapConfigToTopology(config) {
    // Saving events and tasks
    this.events = []
    this.tasks = []

    config.events.forEach((elem) => {
      const event = new Event(elem)
      this.events.push(event)
    })

    config.tasks.forEach((elem) => {
      const task = new Task(elem)
      this.tasks.push(task)
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
