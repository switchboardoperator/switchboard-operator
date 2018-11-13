const sinon = require('sinon')
const fs = require('fs')
const { loadOperators } = require('./OperatorsLoader')

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

  it('load all the defined operators', () => {
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

    expect(Array.isArray(loadedOperators)).toBeTruthy()
    expect(loadedOperators.length).toEqual(3)
  })

  it('should ignore the operator if enabled is set to false', () => {
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

    expect(Array.isArray(loadedOperators)).toBeTruthy()
    expect(loadedOperators.length).toEqual(0)
  })
})
