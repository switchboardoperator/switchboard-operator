import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'

import ActionSchema from '../../model/Action'
import HttpPlugin from './http'

describe('http', () => {
  const msg = {
    hello: 'topology'
  }
  const action = new ActionSchema({
    name: 'makeHttpRequest',
    type: 'http',
    options: {
      url: 'http://localhost:3000/{{ hello }}',
      method: 'GET',
      merge: true
    }
  })
  const httpPlugin = new HttpPlugin(msg, action, 'test')
  const mock = new MockAdapter(axios)

  mock.onGet(/topology/).reply(200, {
    myTopology: 'test'
  })

  it('should make the http request', () => {
    httpPlugin.execute((err, result) => {
      if (err) {
        throw err
      }

      expect(typeof result).toEqual('object')
      expect(result.myTopology).toEqual('test')
    })
  })

  it('should apply templating to provided url', () => {
    const result = httpPlugin.renderUrl()

    expect(typeof result).toEqual('string')
    expect(result).toEqual('http://localhost:3000/topology')

  })

  it('should embed request response to the previous value', () => {
    httpPlugin.execute((err, result) => {
      if (err) {
        throw err
      }

      expect(typeof result).toEqual('object')
      expect(result.myTopology).toEqual('test')
      expect(result.hello).toEqual('topology')
    })
  })

  it('should save the request response to the defined field', () => {
    const action = new ActionSchema({
      name: 'makeHttpRequest',
      type: 'http',
      options: {
        url: 'http://localhost:3000/{{ hello }}',
        method: 'GET',
        merge: true,
        mergeTarget: 'response'
      }
    })
    const httpPlugin = new HttpPlugin(msg, action, 'test')

    httpPlugin.execute((err, result) => {
      if (err) {
        throw err
      }

      expect(result.response.myTopology).toEqual('test')
    })
  })
})