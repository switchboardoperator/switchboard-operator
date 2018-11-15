import Action from './Action'

describe('Action', () => {
  const params = {
    name: 'testAction',
    type: 'some-type',
    event: 'name-event',
    options: {}
  }
  const testAction = new Action(params)
  it('should must be a model instance', () => {
    expect(testAction instanceof Action).toBeTruthy()
  })
  it('should be set the params passed by', () => {
    expect(testAction.name).toEqual('testAction')
    expect(testAction.type).toEqual('some-type')
    expect(typeof testAction.options).toBe('object')
  })
})
