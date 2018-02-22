const expect = require('chai').expect
const EventSchema = require('./event-schema')

describe('EventSchema', () => {
  it('should has event queue properties', (done) => {
    const event = new EventSchema({
      name: 'testing',
      eventName: 'testing',
      route: 'created'
    })

    expect(event.eventName).to.equals('testing')
    expect(event.route).to.equals('created')
    expect(event.getErrors()).to.be.empty

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

    // Testing validation of required fields
    const event2 = new EventSchema({
      route: 'created'
    })
    expect(event2.getErrors()).to.be.a('array')
    expect(event2.getErrors()).to.not.be.empty

    done()
  })
})
