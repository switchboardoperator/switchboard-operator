const chai = require('chai')
const expect = chai.expect
const ObjectTransformerPlugin = require('./mapper')

describe('object-transformer', () => {
  const msg = {
    name: 'John',
    lastName: 'Doe',
    lastName2: 'Bar',
    okCallbacks: {
      sendEmail: {
        to: 'alerts@example.com'
      }
    }
  }

  it('should convert msg payload to transformed object', (done) => {
    const options = {
      fields: {
        name: 'vars.nom',
        lastName: 'vars.cognom1',
        lastName2: 'vars.cognom2',
        'okCallbacks.sendEmail.to': 'vars.to'
      }
    }

    const objTransformer = new ObjectTransformerPlugin(msg, {options})

    objTransformer.execute((err, transformedObj) => {
      expect(err).to.be.null
      expect(transformedObj).to.be.a('Object')
      expect(transformedObj.vars).to.be.a('Object')
      expect(transformedObj.vars.nom).to.equal('John')
      expect(transformedObj.vars.to).to.equal('alerts@example.com')
      done()
    })
  })

  it('should convert msg to transformed object but merging last values with new ones', (done) => {

    const options = {
      merge: true,
      fields: {
        name: 'vars.nom',
        lastName: 'vars.cognom1',
        lastName2: 'vars.cognom2',
        'okCallbacks.sendEmail.to': 'vars.to'
      }
    }

    const objTransformer = new ObjectTransformerPlugin(msg, {options})

    objTransformer.execute((err, transformedObj) => {
      expect(err).to.be.null
      expect(transformedObj).to.be.a('Object')
      expect(transformedObj.name).to.equal('John')
      expect(transformedObj.vars.nom).to.equal('John')
      done()
    })
  })

  it('should convert all the source object in a property of the target object', (done) => {
    const options = {
      copy: [
        'vars'
      ],
      fields: {
      }
    }

    const objTransformer = new ObjectTransformerPlugin(msg, {name:'convert-all', options})

    objTransformer.execute((err, transformedObj) => {
      expect(err).to.be.null
      expect(transformedObj).to.be.a('Object')
      expect(transformedObj.vars).to.be.a('Object')
      expect(transformedObj.vars.name).to.equal('John')
      expect(transformedObj.vars.lastName).to.equal('Doe')
      done()
    })
  })
})
