const sinon = require('sinon')
const fs = require('fs')
const { loadOperators } = require('./operators-loader')

const expect = require('chai').expect

describe('operators-loader', () => {
  sinon.stub(fs, 'readdirSync').callsFake(function () {
    return ['operator1.yaml', 'operator2.yml', 'operator3.yml']
  })
  sinon.stub(fs, 'readFileSync').returns(() => `
# Execute every time a purchase is update
name: eventPurchases
eventName: events.purchase
route: updated
actions:
  # Print event purchase logs
  - name: print-log
    type: log
`)

  expect(loadOperators()).to.be.a('array')
})
