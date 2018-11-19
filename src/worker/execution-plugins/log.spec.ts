import Action from '../../model/Action'
import LogPlugin from './log'

describe('execution-plugins :: log', () => {
  const action = new Action({
    name: 'log',
    type: 'log',
    options: {},
    event: 'event-name',
  })

  const logPlugin = new LogPlugin({test: 'value', test2: 'value2'}, action, 'preLog')

  it('should return a promise', () => {
    return expect(logPlugin.execute()).toBeInstanceOf(Promise)
  })

  it('should log messages', () => {
    return logPlugin.execute().then((msg: any) => expect(typeof msg).toEqual('object'))
  })
})
