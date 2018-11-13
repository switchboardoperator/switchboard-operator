import logger from './logger'

describe('operators-loader', () => {
  it('prints the logs', () => {
    const jsonMsg = {testing: 'value', testin2: 'value2'}

    expect(logger.info('this is a message %j', jsonMsg))
  })
})
