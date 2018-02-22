const { loadOperators } = require('./operators-loader')

const expect = require('chai').expect

describe('operators-loader', () => {
  expect(loadOperators()).to.be.a('array')
})
