const SchemaObject = require('schema-object')

import Event from './Event'
import Task from './Task'
import ConnectionSchema from '../amqp/ConnectionSchema'

export default class Config {
  rabbitmq: ConnectionSchema
  events: Array<Event>
  tasks: Array<Task>

  constructor(config) {
    this.rabbitmq = config.rabbitmq
    this.events = config.events
    this.tasks = config.tasks
  }
}
