const chai = require('chai')
const expect = chai.expect
const rabbit = require('rabbot')
const ActionExecuter = require('./action-executer')
const ActionSchema = require('../model/action-schema')

describe('ActionExecuter', () => {
  it('should handle comming events', (done) => {
    const action = new ActionSchema({
      name: 'sendMembershipsToEmail',
      type: 'event2task',
      options: {
        target: 'test',
        targetRoute: 'someroute'
      }
    })

    expect(action.isErrors()).to.be.false

    const actionExecuter = new ActionExecuter(action, rabbit)

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
