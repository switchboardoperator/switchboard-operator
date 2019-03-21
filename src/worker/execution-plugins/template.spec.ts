import Action from '../../model/Action'
import TemplatePlugin from './template'

describe('execution-plugins :: template', () => {
  describe('execute', () => {
    const msg = {
      amount: 3456,
    }
    const options = {
      fields: {
        test: '{{ amount/100 }}',
      }
    }

    const action = (options) => new Action({
      name: 'test',
      type: 'template',
      event: 'test',
      allowFailure: false,
      options,
    })

    it('should return a promise', () => {
      const transformer = new TemplatePlugin(action(options), '')
      expect(transformer.execute(msg)).toBeInstanceOf(Promise)
    })
    it('should convert msg payload to transformed object', () => {
      const objTransformer = new TemplatePlugin(action(options), '')

      return objTransformer.execute(msg).then((setObj) => {
        return expect(setObj.test).toEqual('34.56')
      })
    })
  })
})
