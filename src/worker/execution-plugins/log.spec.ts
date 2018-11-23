import Action from '../../model/Action'
import LogPlugin from './log'

describe('execution-plugins :: log', () => {
  const action = new Action({
    name: 'log',
    type: 'log',
    options: {},
    event: 'event-name',
  })
  const message = {test: 'value', test2: 'value2'}

  const logPlugin = new LogPlugin(action, 'preLog')

  it('should return a promise', () => {
    return expect(logPlugin.execute(message)).toBeInstanceOf(Promise)
  })

  it('should log messages', () => {
    return logPlugin.execute(message).then((msg: any) => expect(typeof msg).toEqual('object'))
  })
})
