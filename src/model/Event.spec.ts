import Event from './Event'

import { expect } from 'chai'
import 'mocha'

describe('Event', () => {
  const params = {
    name: 'testEvent',
    enabled: false,
    options: {},
    eventName: '',
    route: '',
    prefix: '',
    prefetch: '',
    exclusive: '',
    subscribe: '',
    actions: []
  }
  const testEvent = new Event(params)
  it('should must be a model instance', () => {
    expect(testEvent instanceof Event).to.be.true
  })

  it('should has event queue properties', (done) => {
    const event = new Event({
      name: 'testing',
      eventName: 'testing',
      route: 'created'
    })

    expect(event.eventName).to.equals('testing')
    expect(event.route).to.equals('created')

    // Converting event to exchange
    const generatedExchange = event.toExchange()
    expect(generatedExchange).to.be.a('object')
    expect(generatedExchange.name).to.equals('testing')
    expect(generatedExchange.type).to.equals('direct')

    // Getting event queue
    const generatedQueue = event.toQueue()
    expect(generatedQueue).to.be.a('object')
    expect(generatedQueue.name).to.be.a('string')

    // Getting event binding
    const generatedBinding = event.toBinding()
    expect(generatedBinding).to.be.a('object')
    expect(generatedBinding.exchange).to.equals('testing')
    expect(generatedBinding.target).to.equals('sbo-ms.testing.testing.created')
    expect(generatedBinding.keys).to.equals('created')

    done()
  })
})
