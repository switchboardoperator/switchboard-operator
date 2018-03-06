const sinon = require('sinon')
const fs = require('fs')
const { loadOperators } = require('./operators-loader')

const expect = require('chai').expect

describe('operators-loader', () => {
  const sandbox = sinon.sandbox.create()
  sandbox.stub(fs, 'readdirSync').callsFake(function () {
    return ['operator1.yaml', 'operator2.yml', 'operator3.yml']
  })
  sandbox.stub(fs, 'readFileSync').callsFake(() => {
    return '

    '
  })

  expect(loadOperators()).to.be.a('array')
})
