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
    },
    event: 'event-name',
  })
  const conditionalPlugin = new ConditionalPlugin(msg, action, '')

  it('should checkConditions() should make === operation', () => {
    return expect(conditionalPlugin.checkConditions()).toBeFalsy()

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
      },
      event: 'event-name',
    })
    const passingConditionalPlugin = new ConditionalPlugin(msg, passingAction, '')

    expect(passingConditionalPlugin.checkConditions()).toBeTruthy()
  })

  it('should checkConditions() should make !== operation', () => {
    return expect(conditionalPlugin.checkConditions()).toBeFalsy()

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
      },
      event: 'event-name',
    })
    const passingConditionalPlugin = new ConditionalPlugin(msg, passingAction, '')

    return expect(passingConditionalPlugin.checkConditions()).toBeFalsy()
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
      },
      event: 'event-name',
    })
    const passingConditionalPlugin = new ConditionalPlugin(msg, passingAction, '')

    return expect(passingConditionalPlugin.checkConditions()).toBeFalsy()
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
      },
      event: 'event-name',
    })

    const nonPassingConditionalPlugin = new ConditionalPlugin(msg, nonPassingAction, '')

    return expect(nonPassingConditionalPlugin.checkConditions()).toBeFalsy()
  })
})
