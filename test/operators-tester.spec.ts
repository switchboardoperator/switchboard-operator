import fs from 'fs'
import yaml from 'js-yaml'

import { loadOperators } from '../src/services/OperatorsLoader'
import ActionCreator from '../src/worker/ActionCreator'
import Event from '../src/model/Event'

jest.mock('../src/worker/execution-plugins/telegram')
jest.mock('../src/worker/execution-plugins/prev2task')
jest.mock('../src/worker/execution-plugins/http')

async function processEvents(json, rabbit, events) {
  const resultsObject = {}
  // Instead of looping for our operators, let's loop for our tests, which makes more sense
  for (const test of json) {
      console.log(test)
  }
  // for (const event of events) {
  //   const eventObj = new Event(event)
  //   const actionCreator = new ActionCreator(
  //     rabbit,
  //     eventObj
  //   )

  //   if (json[eventObj.name] && json[eventObj.name].input) {
  //     const results = await actionCreator.executeActions(json[eventObj.name].input)

  //     resultsObject[eventObj.name] = results
  //   } else {
  //     console.info('Ignoring event %s, test payload not defined', eventObj.name)
  //   }
  // }
  return resultsObject
}

describe('Test operators', () => {
  it('all operators work as expected', async () => {
    // const events = loadOperators()
    const rabbit: any = {
      handle: (queue, cb) => cb(),
    }
    const dirname = `${__dirname}/../test`
    const filename = `${__dirname}/../test/operators-tester.json`

    const contents = fs.readdirSync(dirname)

    const fileContents = []
    for (const filename of contents) {
      if (!filename.match(/\.ya?ml$/)) {
        continue
      }

      const location = `${dirname}/${filename}`
      fileContents.push(fs.readFileSync(location, 'utf8'))
    }

    const operators = loadOperators()
    const tests = yaml.safeLoad(fileContents.join(''))

    const jobs = []
    for (const test of tests) {
      const job = {
        test,
        operator: operators.find(({name}) => name === test.name)
      }
      jobs.push(job)
    }

    for (const job of jobs) {
      const { test, operator } = job

      console.log('test', test)
      console.log('operator', operator)
      console.log('event', new Event(operator))
    }


    // const results = await processEvents(tests, rabbit, events)

    // if (fs.statSync(filename).isFile()) {
    //   const json = JSON.parse(fs.readFileSync(filename).toString())
    //   const results = await processEvents(json, rabbit, events)
    //   expect.assertions(Object.keys(results).length)

    //   return Object.keys(results).forEach((event) => {
    //     //console.log('Expect result for event %s %j to equal output %j', event, results[event], json[event].output)
    //     return expect(results[event]).toEqual(json[event].output)
    //   })
    // } else {
    //   console.log('There\'s no operators test file')
    // }
  })
})
