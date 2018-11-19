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

  const mock = new MockAdapter(axios)
  mock.onPost(/sendMessage/).reply(200, {})

  it('should be a Promise', () => {
    const telegram = new TelegramPlugin({test: 'value', test2: 'value2'}, action, '')

    return expect(telegram.execute()).toBeInstanceOf(Promise)
  })

  it('should allow to be initialized with passed configurations', () => {
    const telegramPlugin = new TelegramPlugin({test: 'value', test2: 'value2'}, action, '')

    return telegramPlugin.execute().then((msg) => {
      return expect(typeof msg).toBe('object')
    })
  })
})
