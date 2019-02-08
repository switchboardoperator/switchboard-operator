import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'

import Action from '../../model/Action'
import TelegramPlugin from './telegram'

const baseAction = {
  name: 'test',
  type: 'telegram',
  event: 'test',
  options: {},
}

const action = (options = {}) => new Action({
  ...baseAction,
  options,
})

const defaultAction = action({
  chatId: '1234',
  template: 'Test'
})

describe('execution-plugins :: telegram', () => {
  const message = {test: 'value', test2: 'value2'}

  const mock = new MockAdapter(axios)
  mock.onPost(/sendMessage/).reply(200, {})

  describe('loadOptions', () => {
    it('should throw error in case there\'s something important missing', () => {
      const throws = () => new TelegramPlugin(action(), '')

      return expect(throws).toThrow()
    })
  })

  describe('execute', () => {
    it('should return a Promise', () => {
      const telegram = new TelegramPlugin(defaultAction, '')

      return expect(telegram.execute(message)).toBeInstanceOf(Promise)
    })
    it('should take configurations from config files', () => {
      const telegram = new TelegramPlugin(defaultAction, '')

      return expect(telegram.options.toObject()).toEqual({
        chatId: '1234',
        template: 'Test',
        token: '1234',
        disableWebPagePreview: true,
        parseMode: 'markdown',
      })
    })
    it('should overwrite configurations passed by parameter', () => {
      const telegram = new TelegramPlugin(action({
        parseMode: 'html',
        disableWebPagePreview: false,
        chatId: '-23',
        template: 'nyaaa',
      }), '')

      return expect(telegram.options.toObject()).toEqual({
        token: '1234',
        chatId: '-23',
        disableWebPagePreview: false,
        parseMode: 'html',
        template: 'nyaaa',
      })
    })
  })
  describe('prepare', () => {
    it('should remove the token property', () => {
      const telegram = new TelegramPlugin(defaultAction, '')

      const result = telegram.prepare({})

      return expect(result.token).toBeUndefined()
    })
  })


  it('should allow to be initialized with passed configurations', () => {
    const telegramPlugin = new TelegramPlugin(defaultAction, '')

    return telegramPlugin.execute(message).then((msg) => {
      return expect(typeof msg).toBe('object')
    })
  })

  it('should return the exact same message passed', () => {
    const telegramPlugin = new TelegramPlugin(defaultAction, '')

    return telegramPlugin.execute(message).then((msg) => {
      return expect(msg).toEqual(message)
    })
  })
})
