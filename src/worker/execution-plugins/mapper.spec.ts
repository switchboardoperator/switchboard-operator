import ObjectTransformerPlugin from './mapper'

describe('object-transformer', () => {
  const msg = {
    name: 'John',
    lastName: 'Doe',
    lastName2: 'Bar',
    okCallbacks: {
      sendEmail: {
        to: 'alerts@example.com'
      }
    },
    okCallbacks2: {
      sendEmail: {
        apikey: 1234,
      }
    }
  }

  it('should convert msg payload to transformed object', () => {
    const options = {
      fields: {
        name: 'vars.nom',
        lastName: 'vars.cognom1',
        lastName2: 'vars.cognom2',
        'okCallbacks.sendEmail.to': 'vars.to'
      }
    }

    const objTransformer = new ObjectTransformerPlugin(msg, {options}, '')

    expect.assertions(5)

    objTransformer.execute((err, transformedObj) => {
      expect(err).toBe(null)
      expect(typeof transformedObj).toEqual('object')
      expect(typeof transformedObj.vars).toEqual('object')
      expect(transformedObj.vars.nom).toEqual('John')
      expect(transformedObj.vars.to).toEqual('alerts@example.com')
    })
  })

  it('should convert msg to transformed object but merging last values with new ones', () => {

    const options = {
      merge: true,
      fields: {
        name: 'vars.nom',
        lastName: 'vars.cognom1',
        lastName2: 'vars.cognom2',
        'okCallbacks.sendEmail.to': 'vars.to'
      }
    }

    const objTransformer = new ObjectTransformerPlugin(msg, {options}, '')

    expect.assertions(4)

    objTransformer.execute((err, transformedObj) => {
      expect(err).toBe(null)
      expect(typeof transformedObj).toEqual('object')
      expect(transformedObj.name).toEqual('John')
      expect(transformedObj.vars.nom).toEqual('John')
    })
  })

  it('should convert all the source object in a property of the target object', () => {
    const options = {
      copy: [
        'vars'
      ],
      fields: {
      }
    }

    const objTransformer = new ObjectTransformerPlugin(msg, {name:'convert-all', options}, '')

    expect.assertions(5)

    objTransformer.execute((err, transformedObj) => {
      expect(err).toBe(null)
      expect(typeof transformedObj).toEqual('object')
      expect(typeof transformedObj.vars).toEqual('object')
      expect(transformedObj.vars.name).toEqual('John')
      expect(transformedObj.vars.lastName).toEqual('Doe')
    })
  })
})
