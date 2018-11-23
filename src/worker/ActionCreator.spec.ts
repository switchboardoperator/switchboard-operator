import rabbit from 'rabbot'

import Event from '../model/Event'
import Action from '../model/Action'
import ActionCreator from './ActionCreator'

describe('ActionCreator', () => {
  it('should fail if one of the steps fails', () => {
    const msg = {
      content: {
        toString: () => '{"test": "value"}'
      },
      ack: function () {},
    }

    const event = new Event({
      name: 'test',
      eventName: 'memberships',
      route: 'created',
      actions: [],
    })

    const actionCreator = new ActionCreator(rabbit, event)
    actionCreator.createHandler()

    expect.assertions(1)
    return expect(actionCreator.executeActions(msg)).rejects.toBeTruthy()
  })

  it('should handle coming events', () => {
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
    expect.assertions(3)

    expect(typeof handler).toBe('object')
    expect(handler.topic).toEqual('sbo-ms-test-memberships-created.#')

    const msg = {
      content: {
        toString: function () {
          return '{"name": "Foo", "lastName": "bar"}'
        }
      },
      ack: function () {}
    }

    return actionCreator.executeActions(msg)
      .then((results) => {
        return expect(typeof results).toBe('object')
      })
  })
})
