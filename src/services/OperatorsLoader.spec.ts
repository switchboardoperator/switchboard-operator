const fs = require('fs')
// const { loadOperators } = require('./OperatorsLoader')

jest.mock('fs')

describe('operators-loader', () => {
  const MOCK_FILE_INFO = {
    'operator1.yaml$': `
# Execute every time a purchase is update
name: eventPurchases
eventName: events.purchase
route: updated
actions:
  # Print event purchase logs
  - name: print-log
    type: log
`,
    'operator2.yml$': `
# Execute every time a purchase is update
name: eventPurchases
eventName: events.purchase
route: updated
actions:
  # Print event purchase logs
  - name: print-log
    type: log
`,
    'operator3.yml$':`
# Execute every time a purchase is update
name: eventPurchases
enabled: false
eventName: events.purchase
route: updated
actions:
  # Print event purchase logs
  - name: print-log
    type: log
`,
  };

  const MOCK_DIR_INFO = {
    'operators$': [
      'operator1.yaml', 'operator2.yml', 'operator3.yml',
    ]
  }

  beforeEach(() => {
    // Set up some mocked out file info before each test
    require('fs').__setMockFiles(MOCK_FILE_INFO)
    require('fs').__setDirsContents(MOCK_DIR_INFO)
  });

  it('load all the defined operators, except those not enabled', () => {
    // sinon.stub(fs, 'readFileSync').returns()
    const { loadOperators } = require('./OperatorsLoader')
    const loadedOperators = loadOperators()

    expect(Array.isArray(loadedOperators)).toBeTruthy()
    expect(loadedOperators.length).toEqual(2)
  })
})
