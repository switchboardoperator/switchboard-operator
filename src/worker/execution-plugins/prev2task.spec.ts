import Action from '../../model/Action'
import Prev2TaskPlugin from './prev2task'

describe('execution-plugins :: prev2task', () => {
  describe('execute', () => {
    it('should send the event to a task', () => {
      const msg = {}
      const action = new Action({
        name: 'event2task',
        type: 'event2task',
        options: {
          target: 'some-queue',
          targetRoute: 'some-route'
        },
        event: 'event-name',
      })
      const rabbit = {
        publish: () => Promise.resolve({})
      }
      const event2Task = new Prev2TaskPlugin(msg, action, '', rabbit)

      return event2Task.execute().then((msg) => expect(typeof msg).toBe('object'))
    })
  })
})
