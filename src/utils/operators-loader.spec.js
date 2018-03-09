const sinon = require('sinon')
const fs = require('fs')
const { loadOperators } = require('./operators-loader')

const expect = require('chai').expect

describe('operators-loader', () => {
  beforeEach(() => {
    sinon.stub(fs, 'readdirSync').callsFake(function () {
      return ['operator1.yaml', 'operator2.yml', 'operator3.yml']
    })
  })

  afterEach(() => {
    // remove sinon's stubs
    fs.readdirSync.restore()
    fs.readFileSync.restore()
  })

  it('load all the defined operators', (done) => {
    sinon.stub(fs, 'readFileSync').returns(`
# Execute every time a purchase is update
name: eventPurchases
eventName: events.purchase
route: updated
actions:
  # Print event purchase logs
  - name: print-log
    type: log
`)
    const loadedOperators = loadOperators()

    expect(loadedOperators).to.be.a('array')
    expect(loadedOperators.length).to.equal(3)

    done()
  })

  it('should ignore the operator if enabled is set to false', (done) => {
    sinon.stub(fs, 'readFileSync').returns(`
# Execute every time a purchase is update
name: eventPurchases
enabled: false
eventName: events.purchase
route: updated
actions:
  # Print event purchase logs
  - name: print-log
    type: log
`)
    const loadedOperators = loadOperators()

    expect(loadedOperators).to.be.a('array')
    expect(loadedOperators.length).to.equal(0)

    done()
  })
})
