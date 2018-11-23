import Event from './Event'

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
    expect(testEvent instanceof Event).toBeTruthy()
  })

  it('should have event queue properties', () => {
    const event = new Event({
      name: 'testing',
      eventName: 'testing',
      route: 'created',
      actions: []
    })

    expect(event.eventName).toEqual('testing')
    expect(event.route).toEqual('created')

    // Converting event to exchange
    const generatedExchange = event.toExchange()
    expect(typeof generatedExchange).toBe('object')
    expect(generatedExchange.name).toEqual('testing')
    expect(generatedExchange.type).toEqual('direct')

    // Getting event queue
    const generatedQueue = event.toQueue()
    expect(typeof generatedQueue).toBe('object')
    expect(typeof generatedQueue.name).toBe('string')

    // Getting event binding
    const generatedBinding = event.toBinding()
    expect(typeof generatedBinding).toBe('object')
    expect(generatedBinding.exchange).toEqual('testing')
    expect(generatedBinding.target).toEqual('sbo-ms.testing.testing.created')
    expect(generatedBinding.keys).toEqual('created')
  })
})
