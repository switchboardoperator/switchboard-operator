import fs from 'fs'

import { loadOperators } from '../src/services/OperatorsLoader'
import ActionCreator from '../src/worker/ActionCreator'
import Event from '../src/model/Event'

jest.mock('../src/worker/execution-plugins/telegram')
jest.mock('../src/worker/execution-plugins/prev2task')
jest.mock('../src/worker/execution-plugins/http')

async function processEvents(json, rabbit, events) {
  const resultsObject = {}
  for (const event of events) {
    const eventObj = new Event(event)
    const actionCreator = new ActionCreator(
      rabbit,
      eventObj
    )
    if (json[eventObj.name] && json[eventObj.name].input) {
      const results = await actionCreator.executeActions(json[eventObj.name].input)

      resultsObject[eventObj.name] = results
    } else {
      //console.info('Ignoring event %s, test payload not defined', eventObj.name)
    }
  }
  return resultsObject
}

describe('Test operators', () => {
  it('all operators work as expected', async () => {
    const events = loadOperators()
    const rabbit: any = {
      handle: (queue, cb) => cb(),
    }
    const filename = `${__dirname}/../test/operators-tester.json`

    if (fs.statSync(filename).isFile()) {
      const json = JSON.parse(fs.readFileSync(filename).toString())
      const results = await processEvents(json, rabbit, events)
      expect.assertions(Object.keys(results).length)

      return Object.keys(results).forEach((event) => {
        //console.log('Expect result for event %s %j to equal output %j', event, results[event], json[event].output)
        return expect(results[event]).toEqual(json[event].output)
      })
    } else {
      console.log('There\'s no operators test file')
    }
  })
})
