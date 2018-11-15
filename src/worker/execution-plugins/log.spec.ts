import Action from '../../model/Action'
import LogPlugin from './log'

describe('log', () => {
  it('should log messages', () => {
    const action = new Action({
      name: 'log',
      type: 'log',
      options: {},
      event: 'event-name',
    })

    const logPlugin = new LogPlugin({test: 'value', test2: 'value2'}, action, 'preLog')

    expect.assertions(2)

    logPlugin.execute((err, msg) => {
      expect(err).toBe(null)
      expect(typeof msg).toEqual('object')
    })
  })
})
