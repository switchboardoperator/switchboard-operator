import fs from 'fs'
import yaml from 'js-yaml'
import chalk from 'chalk'

import { loadOperators } from '../src/services/OperatorsLoader'
import ActionCreator, { extractMessage } from '../src/worker/ActionCreator'
import Event from '../src/model/Event'
import ActionExecuter from '../src/worker/ActionExecuter'
import Action from '../src/model/Action'

jest.mock('../src/worker/execution-plugins/telegram')
jest.mock('../src/worker/execution-plugins/prev2task')
jest.mock('../src/worker/execution-plugins/http')

const executeActions = async (operator, {input, response}) => {
  const contents = extractMessage(input)

  let promiseChain = Promise.resolve([]).then(() => contents)

  if (!operator.actions.length) {
    return Promise.reject(new Error('Empty actions object'))
  }

  // Iterate over all actions passing the lastResult
  operator.actions.forEach((action, index) => {
    const executer = new ActionExecuter(new Action(action), {}, operator)

    if (response && response[action.name]) {
      executer.plugin.injectResponse(response[action.name])
    }

    const executionPromise = (contents, preLog) => {
      if (contents === undefined) {
        return Promise.reject(new Error('Previous plugin returned undefined'))
      }

      if (contents.id) {
        preLog = '[' + contents.id + '] > ' + preLog
      }

      return executer.execute(contents).catch((err) => {
        return Promise.reject(err)
      })
    }

    promiseChain = promiseChain.then(
      (contents) => executionPromise(
        contents,
        this.preLog
      )
    )
  })

  return promiseChain
}

describe('Test operators', () => {
  it('all operators work as expected', async () => {
    // const events = loadOperators()
    const rabbit: any = {
      handle: (queue, cb) => cb(),
    }
    const dirname = `${__dirname}/../test/files`

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

    expect.assertions(Object.keys(jobs).length)
    for (const key in jobs) {
      const job = jobs[key]
      const { test, operator } = job

      process.stdout.write(`\n${chalk.yellow('━')} Running actions for operator ${operator.name}...\n`)

      if (test.description) {
        process.stdout.write(`${chalk.yellow('┗')} ${test.description}\n`)
      }

      process.stdout.write('\n')

      const results = await executeActions(new Event(operator), test)

      expect(results).toEqual(test.output)
    }
  })
})
