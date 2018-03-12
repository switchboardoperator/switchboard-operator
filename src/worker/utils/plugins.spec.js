const chai = require('chai')
const expect = chai.expect

const { extractModuleId } = require('./plugins')

describe('plugin-utils', () => {
  it('should get moduleId from js file', (done) => {
    expect(extractModuleId('conditional.js')).to.equals('conditional')
    done()
  })
})
