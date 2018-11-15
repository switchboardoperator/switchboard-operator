const SchemaObject = require('schema-object')
export const PluginOptionsSchema = new SchemaObject({
  url: {
    type: String,
    required: true
  },
  method: {
    type: String,
    required: true,
    enum: ['GET', 'POST', 'PUT']
  },
  merge: {
    type: Boolean,
    required: false
  },
  mergeTarget: {
    type: String,
    required: false
  }
})
