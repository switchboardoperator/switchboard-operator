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
      const event2Task = new Prev2TaskPlugin(action, '', rabbit)

      return event2Task.execute(msg).then((msg) => expect(typeof msg).toBe('object'))
    })
    it('should return the passed message on success', () => {
      const message = {
        whatever: 'message',
      }
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
        publish: () => Promise.resolve()
      }
      const event2Task = new Prev2TaskPlugin(action, '', rabbit)

      return event2Task.execute(message).then((msg) => expect(msg).toEqual(message))
    })
  })
})
