import Operator from './operator'
import { expect } from 'chai'
import 'mocha'

describe('Operator', () => {
  it('should must be a model instance', () => {
    const testOperator = new Operator()
    expect(testOperator instanceof Operator).to.be.true
  });
});
