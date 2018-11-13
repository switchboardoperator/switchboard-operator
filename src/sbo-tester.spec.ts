import * as fs from 'fs'
import * as config from 'config'

import { loadOperators } from '../built/services/OperatorsLoader'
import ActionCreator from './worker/ActionCreator'
import ActionExecuter from './worker/ActionExecuter'

import Topology from './amqp/Topology'
import Event from './model/Event'
import Config from './model/Config'
import TelegramPlugin from './worker/execution-plugins/telegram'

jest.mock('./worker/execution-plugins/telegram')

describe('switchboard-operator', () => {
  it('test', () => {
    try {
      const noTestTypes = ['telegram', 'prev2task']
      const events = loadOperators()
      const rabbit: any = {
        handle: (queue, cb) => cb(),
      }
      const filename = `${__dirname}/../test/operators-tester.json`
      // Checks if file exists
      fs.accessSync(filename, fs.constants.R_OK)
      const json = JSON.parse(fs.readFileSync(filename).toString())

      events.forEach((event) => {
        const eventObj = new Event(event)
        //console.log(json[eventObj.name].input)

        const actionCreator = new ActionCreator(
          rabbit,
          eventObj
        )
        console.log(actionCreator.executeActions(json[eventObj.name].input))
        /* eventObj.actions.forEach((action, index) => {
          //console.log(action)
          const result = {}
          if (noTestTypes.indexOf(action.type) === -1) {
            const executer = new ActionExecuter(action, rabbit, eventObj)
            // console.log(executer.execute())
          } else {
            console.log(`Skipping ${action.type}...`)
          }

        }) */
        /* const actionCreator = new ActionCreator(
          rabbit,
          eventObj
        ) */
        //console.log(actionCreator.executeActions(json))
      })
      /*
      const mergedConfig = Object.assign(config.get('topology'), {
        events: loadOperators()
      })

      const topology = new Topology(new Config(mergedConfig))
      console.log(topology)
      const filename = `${__dirname}/../test/operators-tester.json`
      fs.accessSync(filename, fs.constants.R_OK)
      const json = fs.readFileSync(filename)
      const event: any = loadOperators()
      const rabbit: any = {
        handle: (queue, cb) => cb(),
      }
      const action = new ActionCreator(rabbit, event)
      console.log(action.executeActions(json)) */
    } catch (e) {
      console.info('No operators-tester.json found')
    }
  })
})
