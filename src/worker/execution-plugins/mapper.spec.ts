import Action from '../../model/Action'
import Mapper from './mapper'
import Action from '../../model/Action'

describe('execution-plugins :: mapper', () => {
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

  const action = (options) => new Action({
    name: 'test',
    type: 'mapper',
    event: 'test',
    allowFailure: false,
    options,
  })

  describe('execute', () => {
    it('should return a Promise', () => {
      const options = {fields: {}}
      const mapper = new Mapper(action(options), '')
      return expect(mapper.execute(msg)).toBeInstanceOf(Promise)
    })
    it('should convert msg payload to transformed object', () => {
      const options = {
        fields: {
          name: 'vars.nom',
          lastName: 'vars.cognom1',
          lastName2: 'vars.cognom2',
          'okCallbacks.sendEmail.to': 'vars.to'
        }
      }

      const objTransformer = new Mapper(action(options), '')

      expect.assertions(4)
      return objTransformer.execute(msg).then((transformedObj) => {
        expect(typeof transformedObj).toEqual('object')
        expect(typeof transformedObj.vars).toEqual('object')
        expect(transformedObj.vars.nom).toEqual('John')
        return expect(transformedObj.vars.to).toEqual('alerts@example.com')
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

      const objTransformer = new Mapper(action(options), '')

      expect.assertions(3)
      return objTransformer.execute(msg).then((transformedObj) => {
        expect(typeof transformedObj).toEqual('object')
        expect(transformedObj.name).toEqual('John')
        return expect(transformedObj.vars.nom).toEqual('John')
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

      const objTransformer = new Mapper(action(options), '')

      expect.assertions(4)
      return objTransformer.execute(msg).then((transformedObj) => {
        expect(typeof transformedObj).toEqual('object')
        expect(typeof transformedObj.vars).toEqual('object')
        expect(transformedObj.vars.name).toEqual('John')
        return expect(transformedObj.vars.lastName).toEqual('Doe')
      })
    })
  })
})
