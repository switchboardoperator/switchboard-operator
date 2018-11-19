import SetterPlugin from './setter'

describe('execution-plugins :: setter', () => {
  describe('execute', () => {
    const msg = {}
    const options = {
      fields: {
        test: 'value'
      }
    }
    it('should return a promise', () => {
      const transformer = new SetterPlugin(msg, {options}, '')
      expect(transformer.execute()).toBeInstanceOf(Promise)
    })

    it('should convert msg payload to transformed object', () => {
      const objTransformer = new SetterPlugin(msg, {options}, '')

      return objTransformer.execute().then((setObj) => {
        return expect(setObj.test).toEqual('value')
      })
    })
  })
})
