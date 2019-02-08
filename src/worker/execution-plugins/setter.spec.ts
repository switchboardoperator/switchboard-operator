import Action from '../../model/Action'
import SetterPlugin from './setter'

describe('execution-plugins :: setter', () => {
  describe('execute', () => {
    const msg = {}
    const options = {
      fields: {
        test: 'value'
      }
    }

    const action = (options) => new Action({
      name: 'test',
      type: 'setter',
      event: 'test',
      allowFailure: false,
      options,
    })

    it('should return a promise', () => {
      const transformer = new SetterPlugin(action(options), '')
      expect(transformer.execute(msg)).toBeInstanceOf(Promise)
    })

    it('should convert msg payload to transformed object', () => {
      const objTransformer = new SetterPlugin(action(options), '')

      return objTransformer.execute(msg).then((setObj) => {
        return expect(setObj.test).toEqual('value')
      })
    })
  })
})
