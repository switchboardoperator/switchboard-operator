import Operator from './Operator'

describe('Operator', () => {
  const testOperator = new Operator()
  it('should must be a model instance', () => {
    expect(testOperator instanceof Operator).toBeTruthy()
  })
  it('should have enabled property set default to true', () => {
    expect(testOperator.enabled).toBeTruthy()
  })
})
