const chai = require('chai')

const ActionSchema = require('../../model/action-schema')
const Event2TaskPlugin = require('./event2task-plugin')

const expect = chai.expect

describe('event2task-plugin', () => {
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
    const event2Task = new Event2TaskPlugin(msg, action, rabbit)

    event2Task.execute((error, msg) => {
      expect(msg).to.be.a('Object')

      done()
    })
  })
})
