import SetterPlugin from './setter'

describe('setter', () => {
  const msg = {}

  it('should convert msg payload to transformed object', () => {
    const options = {
      fields: {
        test: 'value'
      }
    }

    const objTransformer = new SetterPlugin(msg, {options}, '')

    objTransformer.execute((err, setObj) => {
      expect(err).toBe(null)
      expect(setObj.test).toEqual('value')
    })
  })
})
