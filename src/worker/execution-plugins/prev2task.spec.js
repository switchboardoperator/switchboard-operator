const chai = require('chai')

const ActionSchema = require('../../model/action-schema')
const Prev2TaskPlugin = require('./prev2task')

const expect = chai.expect

describe('prev2task', () => {
  it('should send the event to a task', (done) => {
    const msg = {}
    const action = new ActionSchema({
      name: 'event2task',
      options: {
        target: 'some-queue',
        targetRoute: 'some-route'
      }
    })
    const rabbit = {
      publish: () => Promise.resolve({})
    }
    const event2Task = new Prev2TaskPlugin(msg, action, '', rabbit)

    event2Task.execute((error, msg) => {
      expect(msg).to.be.a('Object')

      done()
    })
  })
})
