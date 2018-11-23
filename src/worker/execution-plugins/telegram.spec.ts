import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'

import Action from '../../model/Action'
import TelegramPlugin from './telegram'


describe('execution-plugins :: telegram', () => {
  const action = new Action({
    name: 'log',
    type: 'telegram',
    options: {
      chatId: '1324',
      template: 'Test'
    },
    event: 'event-name',
  })
  const msg = {test: 'value', test2: 'value2'}

  const mock = new MockAdapter(axios)
  mock.onPost(/sendMessage/).reply(200, {})

  it('should be a Promise', () => {
    const telegram = new TelegramPlugin(action, '')

    return expect(telegram.execute(msg)).toBeInstanceOf(Promise)
  })

  it('should allow to be initialized with passed configurations', () => {
    const telegramPlugin = new TelegramPlugin(action, '')

    return telegramPlugin.execute(msg).then((msg) => {
      return expect(typeof msg).toBe('object')
    })
  })
})
