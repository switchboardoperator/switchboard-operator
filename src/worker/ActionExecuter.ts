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

  return false
}

export default class ActionExecuter {
  action: Action
  rabbit: any
  event: Event
  preLog: string
  message: string
  public plugin: ExecutionPluginInterface

  constructor(action: Action, rabbit: any, event: Event, msg: any) {
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
  execute() {
    if (!this.plugin) {
      debug(`The plugin cannot be loaded for action: ${this.action}`)
      return Promise.reject(new Error(`The plugin cannot be loaded for action: ${JSON.stringify(this.action)}`))
    }

    // Execute plugin and send result to callback
    return this.plugin.execute()
      .then((result) => {
        debug('Executed plugin %s with the result %j', this.action.type, result)

        return result
      })
      .catch((err) => {
        debug('Action executed failed with %j', err)

        throw err
      })
  }
}
