import * as chai from 'chai'
const expect = chai.expect
const SetterPlugin = require('./setter')

describe('setter', () => {
  const msg = {}

  it('should convert msg payload to transformed object', (done) => {
    const options = {
      fields: {
        test: 'value'
      }
    }

    const objTransformer = new SetterPlugin(msg, {options})

    objTransformer.execute((err, setObj) => {
      expect(err).to.be.null
      expect(setObj.test).to.equal('value')
      done()
    })
  })
})
