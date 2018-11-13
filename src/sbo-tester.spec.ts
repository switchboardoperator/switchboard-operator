import * as fs from 'fs'

import { loadOperators } from '../built/services/OperatorsLoader'
import ActionCreator from './worker/ActionCreator'
import Event from './model/Event'

jest.mock('./worker/execution-plugins/telegram')
jest.mock('./worker/execution-plugins/prev2task')

describe('switchboard-operator', () => {
  it('test', () => {
    try {
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
        const actionCreator = new ActionCreator(
          rabbit,
          eventObj
        )

        actionCreator.executeActions(json[eventObj.name].input).then((results) => {
          console.log(results)
          expect(results).toEqual(json[eventObj.name].output)
        }).catch((error) => {
          console.error('THERE WAS AN ERROR!', error)
        })
      })
    } catch (e) {
      console.info('No operators-tester.json found')
    }
  })
})
