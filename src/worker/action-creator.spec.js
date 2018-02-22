const chai = require('chai')
const expect = chai.expect
const rabbit = require('rabbot')

const EventSchema = require('../model/event-schema')
const ActionCreator = require('./action-creator')
const ActionSchema = require('../model/action-schema')

describe('ActionCreator', () => {
  it('should fail if one of the steps fails', (done) => {
    const msg = {
      content: {
        toString: function () {
          return '{"test": "value"}'
        }
      },
      ack: function () {}
    }

    const event = new EventSchema({
      name: 'test',
      eventName: 'memberships',
      route: 'created',
      actions: []
    })
    const actionCreator = new ActionCreator(rabbit, event)
    actionCreator.createHandler()

    actionCreator.executeActions(msg).then((err) => {
      expect(err).to.not.be.null
      done()
    })
  })

  it('should handle coming events', (done) => {

    const options = {
      fields: {
        name: 'vars.nom',
        lastName: 'vars.cognom1',
        lastName2: 'vars.cognom2',
        'okCallbacks.sendEmail.to': 'vars.to'
      }
    }
    const action = new ActionSchema({
      name: 'mapper1',
      type: 'mapper',
      options
    })

    const action2 = new ActionSchema({
      name: 'mapper2',
      type: 'mapper',
      options
    })

    const event = new EventSchema({
      name: 'test',
      eventName: 'memberships',
      route: 'created',
      actions: [action, action2]
    })

    const actionCreator = new ActionCreator(rabbit, event)
    actionCreator.createHandler()

    const handler = actionCreator.getHandler()

    expect(handler).to.be.an('object')
    expect(handler.topic).to.equals('sbo-ms-test-memberships-created.#')

    const msg = {
      content: {
        toString: function () {
          return '{"name": "Foo", "lastName": "bar"}'
        }
      },
      ack: function () {}
    }

    actionCreator.executeActions(msg)
      .then((results) => {
        expect(results).to.be.an('object')
        done()
      })
  })

})
