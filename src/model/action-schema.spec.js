const EventSchema = require('./event-schema')

const expect = require('chai').expect
const ActionSchema = require('./action-schema')

describe('ActionSchema', () => {
  it('It should has predefined fields', (done) => {
    const event = new EventSchema({
      name: 'testing',
      eventName: 'memberships',
      route: 'created'
    })
    expect(event.getErrors()).to.be.empty

    const action = new ActionSchema({
      name: 'Test',
      type: 'event2task',
      event: event,
      options: {
        from: 'memberships'
      }
    })

    expect(action.getErrors()).to.be.empty
    expect(action.name).to.equals('Test')
    expect(action.type).to.equals('event2task')
    expect(action.options).to.be.an('object')

    done()
  })
})
