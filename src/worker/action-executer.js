const ConditionalPlugin = require('./execution-plugins/conditional-plugin')
const Event2TaskPlugin = require('./execution-plugins/event2task-plugin')
const HttpPlugin = require('./execution-plugins/http-plugin')
const LogPlugin = require('./execution-plugins/log-plugin')
const ObjectTransformerPlugin = require('./execution-plugins/object-transformer-plugin')

const debug = require('debug')('action-executer')

module.exports = class ActionExecuter {
  constructor(action, rabbit, event) {
    debug('action executer action received: %j', action)
    this.action = action
    this.rabbit = rabbit
    this.event = event
    this.preLog = event.name + ' >'
  }

  // Instantiate the proper plugin with proper parameters and execute it
  execute(originalMsg, prevMessage, callback) {
    let executionPlugin

    // starting with originalMsg
    if (!prevMessage) {
      prevMessage = originalMsg
    }

    // Manual setting type of the action and loading its plugin
    switch (this.action.type) {
    case 'log':
      executionPlugin = new LogPlugin(
        prevMessage,
        this.action,
        this.preLog
      )
      break
    case 'mapper':
    case 'obj-transformer':
      executionPlugin = new ObjectTransformerPlugin(
        prevMessage,
        this.action,
        this.preLog
      )
      break
    case 'http':
      executionPlugin = new HttpPlugin(
        prevMessage,
        this.action,
        this.preLog
      )
      break
    case 'conditional':
      executionPlugin = new ConditionalPlugin(
        prevMessage,
        this.action,
        this.preLog
      )
      break
    case 'event2task':
    case 'prev2task':
      executionPlugin = new Event2TaskPlugin(
        prevMessage,
        this.action,
        this.rabbit,
        this.preLog
      )
      break
    default:
      debug('No action type has been defined')
      return new Error('No action type has been defined')
    }

    // Execute plugin and send result to callback
    executionPlugin.execute((err, result) => {
      if (err) {
        debug('Action executed failed with %j', err)
        return callback(err)
      }

      debug('Executed plugin %s with the result %j', this.action.type, result)
      return callback(null, result)
    })
  }
}
