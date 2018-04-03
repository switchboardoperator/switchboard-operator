// ActionCreator
//
// It handles the execution of configured actions
// Start listening to defined rabbitmq event and execute
// the action based on type and options

const debug = require('debug')('action-creator')
const { logger } = require('../utils/logger')
const ActionExecuter = require('./action-executer')

// If the message received is the one get from AMQP
// extract only the contents.
const extractMessage = (prevMessage) => {
  debug('Get message info %j', prevMessage)

  let lastPrevMessage = prevMessage
  if (
    prevMessage
    && prevMessage.content
  ) {
    lastPrevMessage = JSON.parse(
      prevMessage.content.toString()
    )
  }

  debug('extractedMessage %j', lastPrevMessage)

  return lastPrevMessage
}


module.exports = class ActionCreator {
  constructor(rabbit, event) {
    if (event.isErrors()) {
      logger.error('Error in defined event %j', event.getErrors())
    }
    this.rabbit = rabbit
    this.event = event
    this.preLog = event.name + ' >'
  }

  createHandler() {
    const event = this.event
    const queue = event.getQueueName()
    const route = event.route

    this.handler = this.rabbit.handle({ queue }, (msg) => {
      return this.executeActions(msg)
        .then((result) => {
          debug('result of async actions is %j', result)
          logger.info(this.preLog, 'All actions for', queue, 'queue has been executed propertly')
          return msg.ack()
        })
        .catch((err) => {
          debug('Error in serial execution', err)
          // The plugin executed is asking to abort operation and
          // discard the message, preventing to be send to dead-letter queue
          if (err.action && err.action === 'abort') {
            logger.error(this.preLog, 'The execution of operator has been aborted', err)
            return msg.ack()
          }
          logger.error(this.preLog, 'An error has been ocurred executing the handler actions', err)
          // return msg.nack()
          return msg.reject()
        })
    })

    logger.info(this.preLog, 'Handler created in', queue, 'queue for', route, 'route.')
  }

  // Make a Promise array and execute all the actions in serial
  // fashion
  executeActions (msg) {
    const rabbit = this.rabbit
    const contents = extractMessage(msg)

    let promiseChain = Promise.resolve([]).then(() => contents)

    // Iterate over all actions passing the lastResult
    this.event.actions.forEach((action, index) => {
      const executer = new ActionExecuter(action, rabbit, this.event)

      const executionPromise = function (lastValue, preLog, eventsLenght) {
        if (lastValue.id) {
          preLog = '[' + lastValue.id + '] > ' + preLog
        }
        debug('Last value received is: ', lastValue)
        return new Promise((resolve, reject) => {
          logger.info(preLog, 'Running action ', index + 1 , ' of ', eventsLenght)
          if (lastValue === undefined) {
            reject(new Error('Previous plugin returned undefined'))
          }

          executer.execute(contents, lastValue, (err, result) => {
            if (err) {
              logger.error(preLog, 'Step has failed so ignoring next ones')
              return reject(err)
            }

            debug('Resolving with: ', result)
            return resolve(result)
          })
        })
      }

      promiseChain = promiseChain.then((lastValue) => executionPromise(lastValue, this.preLog, this.event.actions.length))
    })

    return promiseChain
  }

  getHandler() {
    return this.handler
  }

  getRabbit() {
    return this.rabbit
  }
}
