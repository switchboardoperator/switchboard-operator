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

    it('should template configurations using the passed message', () => {
      const msg = {whatever: '1234'}
      const tAction = action({
        template: 'test',
        chatId: '{{ whatever }}',
      })
      const telegram = new TelegramPlugin(tAction, '')

      return expect(telegram.prepare(msg)).toEqual({
        chat_id: '1234',
        text: 'test',
        disable_web_page_preview: true,
        parse_mode: 'markdown',
      })
    })

    it('should parse template', () => {
      const msg = {whatever: 'ola k ase'}
      const tAction = action({chatId: 'test', template: '{{ whatever }}'})
      const telegram = new TelegramPlugin(tAction, '')

      return expect(telegram.prepare(msg)).toEqual({
        text: 'ola k ase',
        chat_id: 'test',
        disable_web_page_preview: true,
        parse_mode: 'markdown',
      })
    })

    it('should use sendMessage api path by default', () => {
      const msg = {whatever: 'ola k ase'}
      const tAction = action({chatId: 'test', template: 'test'})
      const telegram = new TelegramPlugin(tAction, '')

      expect(telegram.prepare(msg)).toEqual({
        text: 'test',
        chat_id: 'test',
        disable_web_page_preview: true,
        parse_mode: 'markdown',
      })

      return telegram.execute(msg).then(() => {
        const latest = [...mock.history.post].pop()
        return expect(latest.url).toMatch(/\/sendMessage$/)
      })
    })

    it('should allow changing api path', () => {
      const msg = {whatever: 'ola k ase'}
      const tAction = action({chatId: 'test', template: 'test', path: 'editMessage'})
      const telegram = new TelegramPlugin(tAction, '')

      expect(telegram.prepare(msg)).toEqual({
        text: 'test',
        chat_id: 'test',
        disable_web_page_preview: true,
        parse_mode: 'markdown',
        path: 'editMessage',
      })

      mock.onPost(/editMessage/).reply(200, {})

      return telegram.execute(msg).then(() => {
        const latest = [...mock.history.post].pop()
        return expect(latest.url).toMatch(/\/editMessage$/)
      })
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
    it('should pass replyMarkup from message', () => {
      const telegram = new TelegramPlugin(defaultAction, '')
      const markup = {
        inline_keyboard: [
          [
            {text: 'Test'},
          ],
        ],
      }

      const result = telegram.prepare({
        replyMarkup: markup,
      })

      expect(result.reply_markup).not.toBeUndefined()
      return expect(result.reply_markup).toEqual(markup)
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
