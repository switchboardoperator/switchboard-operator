import MergerPlugin from './merger'

describe('execution-plugins :: merger', () => {
  const msg = {
    payload: {
      someValue: 'test',
      nestedValues: {
        one: 'one',
        two: 'two',
        three: 'three',
      }
    },
    payload2: {
      someValue: 'test2',
      nestedValues: {
        four: 'four',
        five: 'five',
      }
    },
    payload3: undefined,
    payload4: {
      nestedValues: {
        one: 'whatever',
      },
    },
    valueNotToBeMerged: {
      iMust: 'be on result'
    },
    emptyStrings: {
      first: '',
      second: '',
      third: '',
    },
    withNull: null,
    emptyArray: [],
  }

  describe('execute', () => {
    it('should return a promise', () => {
      const options = {
        sourceFields: [
          'payload',
          'payload2',
          'payload3'
        ],
        targetField: 'newBody.deep'
      }

      const transformer = new MergerPlugin({options}, '')

      return expect(transformer.execute(msg)).toBeInstanceOf(Promise)
    })
    it('should merge the specified source keys to target one', () => {
      const options = {
        sourceFields: [
          'payload',
          'payload2',
          'payload3'
        ],
        targetField: 'newBody.deep'
      }

      const objTransformer = new MergerPlugin({options}, '')

      expect.assertions(4)

      objTransformer.execute(msg).then((mergedObj) => {
        expect(typeof mergedObj.newBody.deep).toBe('object')
        expect(mergedObj.newBody.deep.someValue).toEqual('test2')
        expect(Object.keys(mergedObj.newBody.deep.nestedValues).length).toEqual(5)
        expect(mergedObj.valueNotToBeMerged.iMust).toEqual('be on result')
      })
    })

    it('merging keys should return strings, not objects', () => {
      const options = {
        sourceFields: [
          'invented',
          'payload.nestedValues.one',
        ],
        targetField: 'newBody.deep'
      }

      const objTransformer = new MergerPlugin({options}, '')

      return objTransformer.execute(msg).then((mergedObj) => {
        return expect(typeof mergedObj.newBody.deep).toBe('string')
      })
    })

    it('should merge even with empty objects from previous merges', () => {
      const options = {
        sourceFields: [
          'invented',
        ],
        targetField: 'newBody.deep'
      }

      const objTransformer = new MergerPlugin({options}, '')

      expect.assertions(2)

      return objTransformer.execute(msg).then((mergedObj) => {
        expect(Array.isArray(mergedObj.newBody.deep)).toBeTruthy()
        return expect(Object.keys(mergedObj.newBody.deep).length).toBeFalsy()
      })
    })

    it('should properly merge strings', () => {
      const options = {
        sourceFields: [
          'payload.nestedValues.one',
          'payload4.nestedValues.one',
        ],
        targetField: 'newBody.deep'
      }

      const objTransformer = new MergerPlugin({options}, '')

      expect.assertions(2)
      return objTransformer.execute(msg).then((mergedObj) => {
        expect(typeof mergedObj.newBody.deep).toBe('string')
        return expect(mergedObj.newBody.deep).toEqual('whatever')
      })
    })
    it('should properly leave an empty string when all fields are empty', () => {
      const options = {
        sourceFields: [
          'emptyStrings.first',
          'emptyStrings.second',
          'emptyStrings.third',
        ],
        targetField: 'newBody.deep'
      }

      const objTransformer = new MergerPlugin({options}, '')

      expect.assertions(2)
      return objTransformer.execute(msg).then((mergedObj) => {
        expect(typeof mergedObj.newBody.deep).toBe('string')
        return expect(mergedObj.newBody.deep).toEqual('')
      })
    })
    it('should NOT leave an empty string when latest field is empty', () => {
      const options = {
        sourceFields: [
          'payload.someValue',
          'emptyStrings.first',
        ],
        targetField: 'newBody.deep'
      }

      const objTransformer = new MergerPlugin({options}, '')

      expect.assertions(2)
      return objTransformer.execute(msg).then((mergedObj) => {
        expect(typeof mergedObj.newBody.deep).toBe('string')
        return expect(mergedObj.newBody.deep).toEqual('test')
      })
    })
    it('should NOT leave an empty string when latest field is empty', () => {
      const options = {
        sourceFields: [
          'emptyArray',
          'payload.someValue',
          'emptyStrings.first',
        ],
        targetField: 'newBody.deep'
      }

      const objTransformer = new MergerPlugin({options}, '')

      expect.assertions(2)
      return objTransformer.execute(msg).then((mergedObj) => {
        expect(typeof mergedObj.newBody.deep).toBe('string')
        return expect(mergedObj.newBody.deep).toEqual('test')
      })
    })
    it('shouldn\'t either leave an empty string when latest field is null', () => {
      let options = {
        sourceFields: [
          'payload.someValue',
          'payload3',
          'withNull',
        ],
        targetField: 'newBody.deep'
      }

      let objTransformer = new MergerPlugin({options}, '')

      expect.assertions(6)

      objTransformer.execute(msg).then((mergedObj) => {
        expect(typeof mergedObj.newBody.deep).toBe('string')
        return expect(mergedObj.newBody.deep).toEqual('test')
      })

      options = {
        sourceFields: [
          'withNull',
          'payload.someValue',
          'payload3',
        ],
        targetField: 'newBody.deep'
      }

      objTransformer = new MergerPlugin({options}, '')

      objTransformer.execute(msg).then((mergedObj) => {
        expect(typeof mergedObj.newBody.deep).toBe('string')
        return expect(mergedObj.newBody.deep).toEqual('test')
      })
      options = {
        sourceFields: [
          'withNull',
          'payload.someValue',
        ],
        targetField: 'newBody.deep'
      }

      objTransformer = new MergerPlugin({options}, '')

      return objTransformer.execute(msg).then((mergedObj) => {
        expect(typeof mergedObj.newBody.deep).toBe('string')
        return expect(mergedObj.newBody.deep).toEqual('test')
      })
    })
  })
})
