import Action from '../../model/Action'
import Prev2TaskPlugin from './prev2task'

describe('prev2task', () => {
  it('should send the event to a task', () => {
    const msg = {}
    const action = new Action({
      name: 'event2task',
      type: 'event2task',
      options: {
        target: 'some-queue',
        targetRoute: 'some-route'
      }
    })
    const rabbit = {
      publish: () => Promise.resolve({})
    }
    const event2Task = new Prev2TaskPlugin(msg, action, '', rabbit)

    expect.assertions(1)

    event2Task.execute((error, msg) => {
      expect(typeof msg).toBe('object')
    })
  })
})