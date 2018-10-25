import * as chai from 'chai'

import MergerPlugin from './merger'

const expect = chai.expect

describe('merger', () => {
  it('should merge the specified source keys to target one', (done) => {

    const msg = {
      payload: {
        someValue: 'test',
        nestedValues: {
          one: 'one',
          two: 'two',
          three: 'three',
        }
      },
      payload2: {
        someValue: 'test2',
        nestedValues: {
          four: 'four',
          five: 'five',
        }
      },
      payload3: undefined,
      valueNotToBeMerged: {
        iMust: 'be on result'
      }
    }

    const options = {
      sourceFields: [
        'payload',
        'payload2',
        'payload3'
      ],
      targetField: 'newBody.deep'
    }

    const objTransformer = new MergerPlugin(msg, {options}, '')

    objTransformer.execute((err, mergedObj) => {
      expect(err).to.be.null
      expect(mergedObj.newBody.deep).to.be.an('object')
      expect(mergedObj.newBody.deep.someValue).to.be.equal('test2')
      expect(Object.keys(mergedObj.newBody.deep.nestedValues).length).to.be.equal(5)
      expect(mergedObj.valueNotToBeMerged.iMust).to.be.equal('be on result')
      done()
    })
  })
})
