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
    'operator2.yml$': 'file2 contents',
    'operator3.yml$': 'file2 contents',
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
  // beforeEach(() => {
  //   sinon.stub(fs, 'readdirSync').callsFake(function () {
  //     return ['operator1.yaml', 'operator2.yml', 'operator3.yml']
  //   })
  // })

  // afterEach(() => {
  //   // remove sinon's stubs
  //   fs.readdirSync.restore()
  //   fs.readFileSync.restore()
  // })

  it('load all the defined operators', () => {
    // sinon.stub(fs, 'readFileSync').returns()
    const { loadOperators } = require('./OperatorsLoader')
    const loadedOperators = loadOperators()
    console.log(loadedOperators)

    // expect(Array.isArray(loadedOperators)).toBeTruthy()
    // expect(loadedOperators.length).toEqual(3)
  })

//   it('should ignore the operator if enabled is set to false', () => {
//     sinon.stub(fs, 'readFileSync').returns(`
// # Execute every time a purchase is update
// name: eventPurchases
// enabled: false
// eventName: events.purchase
// route: updated
// actions:
//   # Print event purchase logs
//   - name: print-log
//     type: log
// `)
//     const loadedOperators = loadOperators()

//     expect(Array.isArray(loadedOperators)).toBeTruthy()
//     expect(loadedOperators.length).toEqual(0)
//   })
})
