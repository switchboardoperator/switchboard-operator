const debug = require('debug')('setter-plugin')
const SchemaObject = require('schema-object')

const { logger } = require('../../utils/logger')

const PluginOptionsSchema = new SchemaObject({
  fields: {
    type: Object,
    required: true
  }
})

module.exports = class SetterPlugin {
  constructor(msg, action, preLog) {
    this.msg = msg
    this.action = action
    debug('received next msg: %j', this.msg)
    debug('received next action: %j', this.action)

    // Getting the last of previous results comming from previous plugins
    this.options = new PluginOptionsSchema(action.options)

    debug(
      'Instance transformer plugin with options: %j and msg: %j',
      this.options,
      this.msg
    )

    if (this.options.isErrors()) {
      throw new Error('The options provided are not valid '+ JSON.stringify(this.options.getErrors()))
    }

    this.preLog = preLog + ' > ' + action.name
  }

  execute(callback) {
    const setObj = Object.assign({}, this.msg, this.options.fields)
    logger.info(this.preLog, 'Object setter applied')
    return callback(null, setObj)
  }
}
