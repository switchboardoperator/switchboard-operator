const SchemaObject = require('schema-object')

module.exports = new SchemaObject({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['event2task', 'log', 'http', 'obj-transformer', 'conditional', 'mapper', 'prev2task'],
    required: true
  },
  options: {
    type: Object,
    required: true
  }
})
