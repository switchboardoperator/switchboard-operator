import * as chai from 'chai'

const ActionSchema = require('../../model/action-schema')
const TelegramPlugin = require('./telegram')

const expect = chai.expect

describe('telegram', () => {
  const action = new ActionSchema({
    name: 'log',
    options: {
      chatId: '1324',
      template: 'Test'
    }
  })

  it('should allow to be initialized with passed configurations', (done) => {
    const telegramPlugin = new TelegramPlugin({test: 'value', test2: 'value2'}, action)

    telegramPlugin.execute((err, msg) => {
      expect(err).to.be.null
      expect(msg).to.be.an('object')
    })

    done()
  })

})
