import Action from '../../model/Action'
import ConditionalPlugin from './conditional'

describe('execution-plugins :: conditional', () => {
  const msg = {
    hello: 'world',
    array: [
      {
        name: 'Whatever',
      },
    ],
    numbers: {
      zero: 0,
      five: 5,
    },
    booleans: {
      true: true,
      false: false,
    }
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

  describe('conditions', () => {
    describe('===', () => {
      it('should work with strings', () => {
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

      it('should pass with numbers too', () => {
        expect.assertions(2)
        const action = new Action({
          name: 'testing-checks',
          type: 'conditional',
          options: {
            conditions: [
              {
                field: 'numbers.five',
                operation: '===',
                checkValue: '5'
              }
            ]
          },
          event: 'event-name',
        })
        const plugin = new ConditionalPlugin(action, '')
        expect(plugin.execute(msg)).resolves.toBeTruthy()

        const passingAction = new Action({
          name: 'testing-checks',
          type: 'conditional',
          options: {
            conditions: [
              {
                field: 'numbers.zero',
                operation: '===',
                checkValue: '0'
              }
            ]
          },
          event: 'event-name',
        })
        const passingConditionalPlugin = new ConditionalPlugin(passingAction, '')
        return expect(passingConditionalPlugin.execute(msg)).resolves.toBeTruthy()
      })

      it('should not pass with numbers if don\'t fit conditions', () => {
        const passingAction = new Action({
          name: 'testing-checks',
          type: 'conditional',
          options: {
            conditions: [
              {
                field: 'numbers.zero',
                operation: '===',
                checkValue: '3',
              },
            ],
          },
          event: 'event-name',
        })
        const passingConditionalPlugin = new ConditionalPlugin(passingAction, '')
        return expect(passingConditionalPlugin.execute(msg)).rejects.toBeTruthy()
      })
    })

    describe('!==', () => {
      it('should pass if condition meets the requirements', () => {
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
    })

    describe('defined', () => {
      it('should not pass if the field doesn\'t exist', () => {
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
    })

    describe('undefined', () => {
      it('should pass if the field doesn\'t exist', () => {
        const passingAction = new Action({
          name: 'testing-checks',
          type: 'conditional',
          options: {
            conditions: [
              {
                field: 'whatever',
                operation: 'undefined'
              }
            ]
          },
          event: 'event-name',
        })
        const passingConditionalPlugin = new ConditionalPlugin(passingAction, '')

        return expect(passingConditionalPlugin.execute(msg)).resolves.toBeTruthy()
      })
    })

    describe('isTrue', () => {
      it('should pass if the value is true', () => {
        const passingAction = new Action({
          name: 'testing-checks',
          type: 'conditional',
          options: {
            conditions: [
              {
                field: 'booleans.true',
                operation: 'isTrue'
              }
            ]
          },
          event: 'event-name',
        })
        const passingConditionalPlugin = new ConditionalPlugin(passingAction, '')

        return expect(passingConditionalPlugin.execute(msg)).resolves.toBeTruthy()
      })
      it('should not pass if the value is other than true', () => {
        const passingAction = new Action({
          name: 'testing-checks',
          type: 'conditional',
          options: {
            conditions: [
              {
                field: 'booleans.false',
                operation: 'isTrue'
              }
            ]
          },
          event: 'event-name',
        })
        const passingConditionalPlugin = new ConditionalPlugin(passingAction, '')

        return expect(passingConditionalPlugin.execute(msg)).rejects.toBeTruthy()
      })
    })

    describe('isFalse', () => {
      it('should pass if the value is false', () => {
        const passingAction = new Action({
          name: 'testing-checks',
          type: 'conditional',
          options: {
            conditions: [
              {
                field: 'booleans.false',
                operation: 'isFalse'
              }
            ]
          },
          event: 'event-name',
        })
        const passingConditionalPlugin = new ConditionalPlugin(passingAction, '')

        return expect(passingConditionalPlugin.execute(msg)).resolves.toBeTruthy()
      })
      it('should not pass if the value is other than false', () => {
        const passingAction = new Action({
          name: 'testing-checks',
          type: 'conditional',
          options: {
            conditions: [
              {
                field: 'booleans.true',
                operation: 'isFalse'
              }
            ]
          },
          event: 'event-name',
        })
        const passingConditionalPlugin = new ConditionalPlugin(passingAction, '')

        return expect(passingConditionalPlugin.execute(msg)).rejects.toBeTruthy()
      })
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

    it('should return false if one of the many checks fails', () => {
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
})
