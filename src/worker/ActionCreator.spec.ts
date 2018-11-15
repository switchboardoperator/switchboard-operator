import chai = require('chai')
const expect = chai.expect
const rabbit = require('rabbot')

import Event from '../model/Event'
import Action from '../model/Action'
import ActionCreator from './ActionCreator'

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

    const event = new Event({
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
    const action = new Action({
      name: 'mapper1',
      type: 'mapper',
      event: 'event-name',
      options
    })

    const action2 = new Action({
      name: 'mapper2',
      type: 'mapper',
      event: 'event-name',
      options
    })

    const event = new Event({
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
      .catch((err) => {
        done(err)
      })
  })

})
