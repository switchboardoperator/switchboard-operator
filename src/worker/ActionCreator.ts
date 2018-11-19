// ActionCreator
//
// It handles the execution of configured actions
// Start listening to defined rabbitmq event and execute
// the action based on type and options

import rabbit from 'rabbot'
import debug from 'debug'
import logger from '../services/logger'
import ActionExecuter from './ActionExecuter'
import Event from '../model/Event'
import Action from '../model/Action'

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


export default class ActionCreator {
  rabbit: rabbit
  event: Event
  preLog: string
  handler: any

  constructor(rabbit, event: Event) {
    this.rabbit = rabbit
    this.event = event
    this.preLog = event.name + ' >'
  }

  createHandler() {
    const queue = this.event.getQueueName()
    const route = this.event.route

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
          // discard the message, preventing to be sent to dead-letter queue
          if (err.action && err.action === 'abort') {
            logger.error(this.preLog, 'The execution of operator has been aborted', err)
            return msg.ack()
          }
          logger.error(this.preLog, 'An error has been ocurred executing the handler actions', err)

          // send message to dead-letter
          return msg.reject()
        })
    })

    logger.info(this.preLog, 'Handler created in', queue, 'queue for', route, 'route.')
  }

  // Make a Promise array and execute all the actions in serial
  // fashion
  async executeActions (msg) {
    const rabbit = this.rabbit
    const contents = extractMessage(msg)

    let promiseChain = Promise.resolve([]).then(() => contents)

    if (!this.event.actions.length) {
      return Promise.reject(new Error('Empty actions object'))
    }

    // Iterate over all actions passing the lastResult
    this.event.actions.forEach((action, index) => {
      const executer = new ActionExecuter(new Action(action), rabbit, this.event)

      const executionPromise = (lastValue, preLog, eventsLenght) => {
        if (lastValue.id) {
          preLog = '[' + lastValue.id + '] > ' + preLog
        }
        debug('Last value received is: ', lastValue)

        logger.info(preLog, `Running action ${index + 1} of ${eventsLenght}`)

        if (lastValue === undefined) {
          return Promise.reject(new Error('Previous plugin returned undefined'))
        }

        return executer.execute(contents, lastValue).catch((err) => {
          logger.error(preLog, 'Step has failed so ignoring next ones')
          return Promise.reject(err)
        })
      }

      promiseChain = promiseChain.then(
        (lastValue) => executionPromise(
          lastValue,
          this.preLog,
          this.event.actions.length
        )
      )
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
