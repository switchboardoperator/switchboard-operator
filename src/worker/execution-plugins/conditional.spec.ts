import Action from '../../model/Action'
import ConditionalPlugin from './conditional'

describe('conditional', () => {
  const msg = {
    hello: 'world',
    array: [
      {
        name: 'Whatever',
      },
    ],
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
  const conditionalPlugin = new ConditionalPlugin(action, '')

  describe('checkConditions', () => {

    it('should properly take array values', () => {
      const passingAction = new Action({
        name: 'testing-checks',
        type: 'conditional',
        options: {
          conditions: [
            {
              field: 'array.0.name',
              operation: '===',
              checkValue: 'Whatever'
            }
          ]
        },
        event: 'event-name',
      })
      const passingConditionalPlugin = new ConditionalPlugin(passingAction, '')
      return expect(passingConditionalPlugin.execute(msg)).resolves.toEqual(msg)
    })

    it('should make === operation', () => {
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
      const passingConditionalPlugin = new ConditionalPlugin(passingAction, '')

      return expect(passingConditionalPlugin.execute(msg)).resolves.toBeTruthy()
    })

    it('should make !== operation', () => {
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
      const passingConditionalPlugin = new ConditionalPlugin(passingAction, '')

      return expect(passingConditionalPlugin.execute(msg)).rejects.toEqual({action: 'abort'})
    })

    it('should return false if the field doesn\'t exist', () => {
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
      const passingConditionalPlugin = new ConditionalPlugin(passingAction, '')

      return expect(passingConditionalPlugin.execute(msg)).rejects.toEqual({action: 'abort'})
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

      const nonPassingConditionalPlugin = new ConditionalPlugin(nonPassingAction, '')

      return expect(nonPassingConditionalPlugin.execute(msg)).rejects.toEqual({action: 'abort'})
    })
  })

  describe('execute', () => {
    it('should return a Promise', () => {
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
      const passingConditionalPlugin = new ConditionalPlugin(passingAction, '')

      // It'll reject, as it does not receive proper options
      return expect(passingConditionalPlugin.execute(msg)).toBeInstanceOf(Promise)
    })
  })
})
