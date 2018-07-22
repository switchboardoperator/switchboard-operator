const fs = require('fs')
const path = require('path')
const { logger } = require('../services/logger')
const { extractModuleId } = require('./utils/plugins')

const debug = require('debug')('action-executer')


const loadPlugin = (prevMessage, action, preLog, rabbit) => {
  const folder = path.resolve('./src/worker/execution-plugins')
  debug('Loading pluginsPath %s', folder)

  let module
  let files = fs.readdirSync(folder)
  debug('Files to analyse: %j', files)
  files = files.filter((file) => file !== 'index.js' && !file.match(/.*\.spec\.js$/))
  debug('Filtered files to analyse: %j', files)

  files.forEach((file) => {
    const moduleName = path.resolve(folder, file)
    debug('Trying to import the next plugin %s', moduleName)
    const moduleId = extractModuleId(file)

    // If the module is not the one we're looking for return
    if (moduleId !== action.type) {
      debug('The requested module %s isn\'t the one checked %s', action.type, moduleId)
      return false
    }

    try {
      const Module = require(moduleName)
      // do not load if there's nothing in there
      if (typeof Module === 'undefined') {
        debug('Loaded file has undefined module, %j', Module)
        return false
      }

      // Remove the extension to get an internal name

      debug('Module successfull required, %s', moduleId)
      // Instantiating module
      module = new Module(prevMessage, action, preLog, rabbit)

    } catch (err) {
      logger.error('An error loading plugins has occurred, %j', err)
    }
  })

  return module
}

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
    // starting with originalMsg
    if (!prevMessage) {
      prevMessage = originalMsg
    }

    const executionPlugin = loadPlugin(prevMessage, this.action, this.preLog, this.rabbit)
    debug('Loaded the next modules: %j', executionPlugin)

    if (!executionPlugin) {
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
