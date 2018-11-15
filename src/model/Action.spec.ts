import Action from './Action'

import { expect } from 'chai'
import 'mocha'

describe('Action', () => {
  const params = {
    name: 'testAction',
    type: 'some-type',
    event: 'name-event',
    options: {}
  }
  const testAction = new Action(params)
  it('should must be a model instance', () => {
    expect(testAction instanceof Action).to.be.true
  })
  it('should be set the params passed by', () => {
    expect(testAction.name).to.equals('testAction')
    expect(testAction.type).to.equals('some-type')
    expect(testAction.options).to.be.a('object')
  })
})
