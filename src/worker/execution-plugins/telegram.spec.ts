import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'

import Action from '../../model/Action'
import TelegramPlugin from './telegram'


describe('telegram', () => {
  const action = new Action({
    name: 'log',
    type: 'telegram',
    options: {
      chatId: '1324',
      template: 'Test'
    }
  })

  it('should allow to be initialized with passed configurations', () => {
    const mock = new MockAdapter(axios)
    mock.onPost(/sendMessage/).reply(200, {})

    const telegramPlugin = new TelegramPlugin({test: 'value', test2: 'value2'}, action, '')

    return telegramPlugin.execute((err, msg) => {
      if (err) {
        throw err
      }

      return expect(typeof msg).toBe('object')
    })
  })
})
