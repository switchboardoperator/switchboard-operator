import { expect } from 'chai'
import * as rabbit from 'rabbot'
import ActionExecuter from './ActionExecuter'
import Action from '../model/Action'

describe('ActionExecuter', () => {
  it('should handle comming events', (done) => {
    const action = new Action({
      name: 'sendMembershipsToEmail',
      type: 'log',
      options: {
        target: 'test',
        targetRoute: 'someroute'
      }
    })

    const actionExecuter = new ActionExecuter(action, rabbit, {name: 'test'})

    const msg = {
      body: {
        test: 'Test',
        test2: 'Test2',
        toString: () => '{test1: "Test", test2: "Test2"}'
      }
    }

    actionExecuter.execute(msg, {}, (err) => {
      expect(err).to.not.be.undefined
      done()
    })
  }).timeout(5000)
})
