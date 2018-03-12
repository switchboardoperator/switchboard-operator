const SchemaObject = require('schema-object')

module.exports = new SchemaObject({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  options: {
    type: Object,
    required: true
  }
})
