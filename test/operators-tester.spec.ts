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

const executeActions = async (operator, {input, actions, response}) => {
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

      return executer.execute(contents).then((retorn) => {
        if (actions && actions[action.name] !== undefined) {
          const step = actions[action.name]

          if (step.description) {
            process.stdout.write(`${chalk.yellow('┗')} ${step.description}\n`)
          }

          expect(retorn).toEqual(step.output)
        }

        return retorn
      }).catch((err) => {
        return Promise.resolve(err)
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
  const rabbit: any = {
    handle: (queue, cb) => cb(),
  }
  let path = `${__dirname}/../test/files`
  if (process.env.OPERATORS_TEST_DIR) {
    path = process.env.OPERATORS_TEST_DIR
  }

  const contents = fs.readdirSync(path)

  const fileContents = []
  for (const filename of contents) {
    if (!filename.match(/\.ya?ml$/)) {
      continue
    }

    const location = `${path}/${filename}`
    fileContents.push(fs.readFileSync(location, 'utf8'))
  }

  const operators = loadOperators()
  const tests = yaml.safeLoad(fileContents.join(''))

  if (!tests || (tests && !tests.length)) {
    process.stdout.write(chalk.yellow(`No operator test files found at ${path}\n\n`))

    return false
  }

  const jobs = []
  for (const test of tests) {
    const job = {
      test,
      operator: operators.find(({name}) => name === test.name)
    }
    jobs.push(job)
  }

  for (const key in jobs) {
    const job = jobs[key]
    const { test, operator } = job

    process.stdout.write(`\n${chalk.yellow('━')} Running actions for operator ${operator.name}...\n`)

    let description = `${operator.name} works as expected`
    if (test.description) {
      process.stdout.write(`${chalk.yellow('┗')} ${test.description}\n`)
      description = test.description
    }

    process.stdout.write('\n')

    it(description, async () => {
      const results = await executeActions(new Event(operator), test)

      expect(results).toEqual(test.output)
    })
  }
})
