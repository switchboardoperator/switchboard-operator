import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'

import Action from '../../model/Action'
import HttpPlugin from './http'

describe('execution-plugins :: http', () => {
  const msg = {
    hello: 'topology'
  }
  const action = new Action({
    name: 'makeHttpRequest',
    type: 'http',
    options: {
      url: 'http://localhost:3000/{{ hello }}',
      method: 'GET',
      merge: true
    },
    event: 'name-event',
  })
  const httpPlugin = new HttpPlugin(action, 'test')
  const mock = new MockAdapter(axios)

  mock.onGet(/topology/).reply(200, {
    myTopology: 'test'
  })

  it('should return a promise', () => {
    expect(httpPlugin.execute(msg)).toBeInstanceOf(Promise)
  })

  it('should make the http request', () => {
    expect.assertions(2)
    return httpPlugin.execute(msg).then((result: any) => {
      expect(typeof result).toEqual('object')
      return expect(result.myTopology).toEqual('test')
    })
  })

  it('should not add data for GET requests (not even an empty object)', () => {
    return httpPlugin.execute(msg).then((result: any) => {
      const latest = mock.history.get.shift()

      return expect(latest.data).not.toBeDefined()
    })
  })

  it('should apply templating to provided url', () => {
    const result = httpPlugin.renderUrl()

    expect(typeof result).toEqual('string')
    expect(result).toEqual('http://localhost:3000/topology')
  })

  it('should embed request response to the previous value', () => {
    expect.assertions(3)

    return httpPlugin.execute(msg).then((result: any) => {
      expect(typeof result).toEqual('object')
      expect(result.myTopology).toEqual('test')

      return expect(result.hello).toEqual('topology')
    })
  })

  it('should save the request response to the defined field', () => {
    const action = new Action({
      name: 'makeHttpRequest',
      type: 'http',
      options: {
        url: 'http://localhost:3000/{{ hello }}',
        method: 'GET',
        merge: true,
        mergeTarget: 'response'
      },
      event: 'name-event',
    })
    const httpPlugin = new HttpPlugin(action, 'test')

    return httpPlugin.execute(msg).then((result: any) => {
      return expect(result.response.myTopology).toEqual('test')
    })
  })
})
