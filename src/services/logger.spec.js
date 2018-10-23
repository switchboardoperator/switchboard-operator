import logger from './logger'

const expect = require('chai').expect

describe('operators-loader', () => {
  const jsonMsg = {testing: 'value', testin2: 'value2'}

  expect(logger.info('this is a message %j', jsonMsg))
})
