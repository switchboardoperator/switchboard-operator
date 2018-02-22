const SchemaObject = require('schema-object')

const EventSchema = require('./event-schema')
const TaskSchema = require('./task-schema')

module.exports = new SchemaObject({
  rabbitmq: {
    type: Object,
    required: true
  },
  events: {
    type: Array,
    arrayType: EventSchema,
    required: true
  },
  tasks: {
    type: Array,
    arrayType: TaskSchema,
    required: true
  }
})
