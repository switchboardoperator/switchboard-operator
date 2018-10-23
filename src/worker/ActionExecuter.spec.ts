import { expect } from 'chai'
import * as rabbit from 'rabbot'
import ActionExecuter from './ActionExecuter'
import Action from '../model/Action'
import Event from '../model/Event'

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

    const actionExecuter = new ActionExecuter(action, rabbit, new Event({
      name: 'test',
      eventName: 'test',
      route: 'test',
      actions: []
    }))

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

  it('should handle conditional type action', (done) => {
    const action = new Action({
      name: 'myConditionalAction',
      type: 'conditional',
      options: {
        conditions: {
          field: 'test',
          operation: 'defined'
        }
      }
    })

    const actionExecuter = new ActionExecuter(action, rabbit, new Event({name: 'test', eventName: 'test', route: 'test', actions: []}))

    const msg = {
      body: {
        test: 'Test',
        test2: 'Test2',
        toString: () => '{test1: "Test", test2: "Test2"}'
      }
    }

    actionExecuter.execute(msg, {}, (err) => {
      expect(err).to.be.null
      done()
    })
  })
})
