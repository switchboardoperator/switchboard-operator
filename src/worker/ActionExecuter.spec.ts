import axios from 'axios'
import axiosMockAdapter from 'axios-mock-adapter'
import rabbit from 'rabbot'
import ActionExecuter from './ActionExecuter'
import Action from '../model/Action'
import Event from '../model/Event'

const axiosMock = new axiosMockAdapter(axios)

describe('ActionExecuter', () => {
  it('should handle comming events', () => {
    const action = new Action({
      name: 'sendMembershipsToEmail',
      type: 'log',
      options: {
        target: 'test',
        targetRoute: 'someroute'
      },
      event: 'event-name',
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

    return expect(actionExecuter.execute(msg)).resolves.toBeTruthy()
  })

  it('should handle conditional type action', () => {
    const action = new Action({
      name: 'myConditionalAction',
      type: 'conditional',
      options: {
        conditions: {
          field: 'test',
          operation: 'defined'
        }
      },
      event: 'event-name',
    })

    const actionExecuter = new ActionExecuter(action, rabbit, new Event({name: 'test', eventName: 'test', route: 'test', actions: []}))

    const msg = {
      body: {
        test: 'Test',
        test2: 'Test2',
        toString: () => '{test1: "Test", test2: "Test2"}'
      }
    }

    return expect(actionExecuter.execute(msg)).resolves.toBeTruthy()
  })

  it('should fail on error', () => {
    const action = new Action({
      name: 'sendMembershipsToEmail',
      type: 'invented',
      options: {},
      event: '',
    })

    const actionExecuter = new ActionExecuter(action, rabbit, new Event({
      name: 'test',
      eventName: 'test',
      route: 'test',
      actions: []
    }))

    return expect(actionExecuter.execute({})).rejects.toBeTruthy()
  })

  it('should not fail on error if allowFailure is set to true', () => {
    axiosMock.onPost(/api\.telegram\.org/).reply(404)

    const action = new Action({
      name: 'sendMembershipsToEmail',
      type: 'telegram',
      allowFailure: true,
      options: {
        chatId: '',
        template: '',
      },
      event: 'event-name',
    })

    const actionExecuter = new ActionExecuter(action, rabbit, new Event({
      name: 'test',
      eventName: 'test',
      route: 'test',
      actions: [],
    }))

    const msg = {
      body: {
        test: 'Test',
        test2: 'Test2',
        toString: () => '{test1: "Test", test2: "Test2"}'
      }
    }

    return expect(actionExecuter.execute(msg)).resolves.toEqual(msg)
  })
})
