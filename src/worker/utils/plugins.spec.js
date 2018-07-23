const chai = require('chai')
const expect = chai.expect

const { extractModuleId } = require('./plugins')

describe('plugin-utils', () => {
  it('should get moduleId from ts file', (done) => {
    expect(extractModuleId('conditional.ts')).to.equals('conditional')
    done()
  })
})
