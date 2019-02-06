import SetterPlugin from './setter'
import Action from '../../model/Action';

describe('execution-plugins :: setter', () => {
  describe('execute', () => {
    const msg = {}
    const options = {
      fields: {
        test: 'value'
      }
    }
    it('should return a promise', () => {
      const transformer = new SetterPlugin(new Action({options}), '')
      expect(transformer.execute(msg)).toBeInstanceOf(Promise)
    })

    it('should convert msg payload to transformed object', () => {
      const objTransformer = new SetterPlugin(new Action({options}), '')

      return objTransformer.execute(msg).then((setObj) => {
        return expect(setObj.test).toEqual('value')
      })
    })
  })
})
