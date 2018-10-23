import * as chai from 'chai'
const chaiAsPromised = require('chai-as-promised')

import Action from '../../model/Action'
import ConditionalPlugin from './conditional'

chai.use(chaiAsPromised)


const expect = chai.expect

describe('conditional', () => {
  const msg = {
    hello: 'world'
  }
  const action = new Action({
    name: 'testing-checks',
    type: 'conditional',
    options: {
      conditions: [
        {
          field: 'hello',
          operation: '===',
          checkValue: 'test'
        }
      ]
    }
  })
  const conditionalPlugin = new ConditionalPlugin(msg, action, '')

  it('should checkConditions() should make === operation', (done) => {
    expect(conditionalPlugin.checkConditions()).to.be.false

    const passingAction = new Action({
      name: 'testing-checks',
      type: 'conditional',
      options: {
        conditions: [
          {
            field: 'hello',
            operation: '===',
            checkValue: 'world'
          }
        ]
      }
    })
    const passingConditionalPlugin = new ConditionalPlugin(msg, passingAction, '')

    expect(passingConditionalPlugin.checkConditions()).to.be.true

    done()
  })

  it('should checkConditions() should make !== operation', (done) => {
    expect(conditionalPlugin.checkConditions()).to.be.false

    const passingAction = new Action({
      name: 'testing-checks',
      type: 'conditional',
      options: {
        conditions: [
          {
            field: 'hello',
            operation: '!==',
            checkValue: 'world'
          }
        ]
      }
    })
    const passingConditionalPlugin = new ConditionalPlugin(msg, passingAction, '')

    expect(passingConditionalPlugin.checkConditions()).to.be.false

    done()
  })

  it('should return false if the field doesn\'t exists', (done) => {

    const msg = {
      content: {
        toString: () => '{"test": "value"}'
      }
    }

    const passingAction = new Action({
      name: 'testing-checks',
      type: 'conditional',
      options: {
        conditions: [
          {
            field: 'hello',
            operation: 'defined'
          }
        ]
      }
    })
    const passingConditionalPlugin = new ConditionalPlugin(msg, passingAction, '')

    expect(passingConditionalPlugin.checkConditions()).to.be.false

    done()
  })

  it('should return false if one of the checks fails', (done) => {
    const msg = {}

    const nonPassingAction = new Action({
      name: 'testing-checks',
      type: 'conditional',
      options: {
        conditions: [
          {
            field: 'status',
            operation: 'defined'
          },
          {
            field: 'status',
            operation: '===',
            checkValue: 'paid'
          },
          {
            field: 'details.okCallbacks.purchase.setPaid.purchaseId',
            operation: 'defined'
          }
        ]
      }
    })

    const nonPassingConditionalPlugin = new ConditionalPlugin(msg, nonPassingAction, '')

    expect(nonPassingConditionalPlugin.checkConditions()).to.be.false

    done()
  })
})
