import Operator from './Operator'

import { expect } from 'chai'
import 'mocha'

describe('Operator', () => {
  const testOperator = new Operator()
  it('should must be a model instance', () => {
    expect(testOperator instanceof Operator).to.be.true
  })
  it('should have enabled property set default to true', () => {
    expect(testOperator.enabled).to.be.true
  })
})
