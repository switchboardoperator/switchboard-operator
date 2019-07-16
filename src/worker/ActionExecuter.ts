import Action from "../model/Action"
import Event from "../model/Event"
import logger from '../services/logger'
import plugins from './execution-plugins'

const debug = require('debug')('action-executer')

const loadPlugin = (action: Action, preLog: string, rabbit: any, msg: any = {}) => {
  if (plugins[action.type]) {
    return new plugins[action.type](action, preLog, rabbit, msg)
  }

  return false
}

export default class ActionExecuter {
  action: Action
  rabbit: any
  event: Event
  preLog: string
  message: string
  public plugin: any

  constructor(action: Action, rabbit: any, event: Event, msg: any = {}) {
    debug('action executer action received: %j', action)
    this.action = action
    this.rabbit = rabbit
    this.event = event
    this.preLog = event.name + ' >'

    this.plugin = loadPlugin(
      this.action,
      this.preLog,
      this.rabbit,
      msg
    )

    debug('Loaded the next modules: %j', this.plugin)
  }

  // Instantiate the proper plugin with proper parameters and execute it
  execute(message: any) {
    if (!this.plugin) {
      debug(`The plugin cannot be loaded for action: ${this.action}`)
      return Promise.reject(new Error(`The plugin cannot be loaded for action: ${this.action}`))
    }

    // Execute plugin and send result to callback
    return this.plugin.execute(message)
      .then((result) => {
        debug('Executed plugin %s with the result %j', this.action.type, result)

        return result
      })
      .catch((err) => {
        if (this.action.allowFailure) {
          logger.info(this.preLog, 'Action execution failed, but allowFailure is set, so ignoring...')

          return Promise.resolve(message)
        }

        debug('Action executed failed with %j', err)

        throw err
      })
  }
}
