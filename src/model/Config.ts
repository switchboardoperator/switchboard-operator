const SchemaObject = require('schema-object')

import Event from './Event'
import Task from './Task'

export default class Config {
  rabbitmq: object
  events: Array<Event>
  tasks: Array<Task>

  constructor(config) {
    this.rabbitmq = config.rabbitmq
    this.events = config.events
    this.tasks = config.tasks
  }
}
