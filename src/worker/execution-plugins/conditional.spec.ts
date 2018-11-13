import Action from '../../model/Action'
import ConditionalPlugin from './conditional'

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

  it('should checkConditions() should make === operation', () => {
    return expect(conditionalPlugin.checkConditions()).toBe(false)

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
  })

  it('should checkConditions() should make !== operation', () => {
    return expect(conditionalPlugin.checkConditions()).toBe(false)

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

    return expect(passingConditionalPlugin.checkConditions()).toBe(false)
  })

  it('should return false if the field doesn\'t exists', () => {

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

    return expect(passingConditionalPlugin.checkConditions()).toBe(false)
  })

  it('should return false if one of the checks fails', () => {
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

    return expect(nonPassingConditionalPlugin.checkConditions()).toBe(false)
  })
})
