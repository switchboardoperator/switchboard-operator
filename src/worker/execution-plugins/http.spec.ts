import axios from 'axios'
import * as chai from 'chai'
import MockAdapter from 'axios-mock-adapter'

import ActionSchema from '../../model/Action'
import HttpPlugin from './http'

const expect = chai.expect

describe('http', () => {
  const msg = {
    hello: 'topology'
  }
  const action = new ActionSchema({
    name: 'makeHttpRequest',
    type: 'http',
    options: {
      url: 'http://localhost:3000/{{ hello }}',
      method: 'GET'
    }
  })
  const httpPlugin = new HttpPlugin(msg, action, 'test')
  const mock = new MockAdapter(axios)

  mock.onGet(/topology/).reply(200, {
    myTopology: 'test'
  })

  it('should make the http request', (done) => {
    httpPlugin.execute((err, result) => {
      if (err) {
        done(err)
      }

      expect(result).to.be.an('object')
      expect(result.myTopology).to.be.equal('test')
      done()
    })
  })

  it('should apply templating to provided url', (done) => {
    const result = httpPlugin.renderUrl()

    expect(result).to.be.a('String')
    expect(result).to.equal('http://localhost:3000/topology')

    done()
  })
})
