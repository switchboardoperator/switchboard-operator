import axios from 'axios'
import * as chai from 'chai'
import MockAdapter from 'axios-mock-adapter'

import Action from '../../model/Action'
import TelegramPlugin from './telegram'

const expect = chai.expect

describe('telegram', () => {
  const action = new Action({
    name: 'log',
    type: 'telegram',
    options: {
      chatId: '1324',
      template: 'Test'
    }
  })

  it('should allow to be initialized with passed configurations', (done) => {
    const mock = new MockAdapter(axios)
    mock.onPost(/sendMessage/).reply(200, {})

    const telegramPlugin = new TelegramPlugin({test: 'value', test2: 'value2'}, action, '')

    telegramPlugin.execute((err, msg) => {
      if (err) {
        return done(err)
      }

      expect(msg).to.be.an('object')
      done()
    })
  })

})
