const chai = require('chai')

const ActionSchema = require('../../model/action-schema')
const HttpPlugin = require('./http')

const expect = chai.expect

describe('http', () => {
  const msg = {
    hello: 'topology'
  }
  const action = new ActionSchema({
    name: 'makeHttpRequest',
    options: {
      url: 'http://localhost:3000/{{ hello }}',
      method: 'GET'
    }
  })
  const httpPlugin = new HttpPlugin(msg, action)

  it('should make the http request', (done) => {

    httpPlugin.execute((err, result) => {
      expect(err).to.be.null
      expect(result).to.be.an('object')
    })
    done()

  })

  it('should apply templating to provided url', (done) => {
    const result = httpPlugin.renderUrl()

    expect(result).to.be.a('String')
    expect(result).to.equal('http://localhost:3000/topology')

    done()
  })
})
