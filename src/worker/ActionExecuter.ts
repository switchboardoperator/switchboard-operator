import Action from "../model/Action"
import Event from "../model/Event"
import logger from '../services/logger'
import plugins from './execution-plugins'
import { ExecutionPluginInterface } from "./ExecutionPluginInterface"

const debug = require('debug')('action-executer')

const loadPlugin = (prevMessage: string, action: Action, preLog: string, rabbit: any) => {
  if (plugins[action.type]) {
    return new plugins[action.type](prevMessage, action, preLog, rabbit)
  }

  return
}

export default class ActionExecuter {
  action: Action
  rabbit: any
  event: Event
  preLog: string
  plugin: ExecutionPluginInterface

  constructor(action: Action, rabbit: any, event: Event) {
    debug('action executer action received: %j', action)
    this.action = action
    this.rabbit = rabbit
    this.event = event
    this.preLog = event.name + ' >'
    this.plugin = loadPlugin(
      prevMessage,
      this.action,
      this.preLog,
      this.rabbit
    )

    debug('Loaded the next modules: %j', this.plugin)
  }

  // Instantiate the proper plugin with proper parameters and execute it
  execute(originalMsg, prevMessage, callback) {
    // starting with originalMsg
    if (!prevMessage) {
      prevMessage = originalMsg
    }

    const executionPlugin = loadPlugin(
      prevMessage,
      this.action,
      this.preLog,
      this.rabbit
    )
    debug('Loaded the next modules: %j', executionPlugin)

    if (!executionPlugin) {
      debug(`The plugin cannot be loaded for action: ${this.action}`)
      return callback(new Error(`The plugin cannot be loaded for action: ${JSON.stringify(this.action)}`))
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
