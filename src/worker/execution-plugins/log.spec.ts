import * as chai from 'chai'

const ActionSchema = require('../../model/action-schema')
const LogPlugin = require('./log')

const expect = chai.expect

describe('log', () => {
  const action = new ActionSchema({
    name: 'log',
  })

  const logPlugin = new LogPlugin({test: 'value', test2: 'value2'}, action)

  logPlugin.execute((err, msg) => {
    expect(err).to.be.null
    expect(msg).to.be.an('object')
  })

})
