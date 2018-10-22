import * as chai from 'chai'

import Action from '../../model/Action'
import LogPlugin from './log'

const expect = chai.expect

describe('log', () => {
  const action = new Action({
    name: 'log',
    type: 'log',
    options: {}
  })

  const logPlugin = new LogPlugin({test: 'value', test2: 'value2'}, action, 'preLog')

  logPlugin.execute((err, msg) => {
    expect(err).to.be.null
    expect(msg).to.be.an('object')
  })

})
