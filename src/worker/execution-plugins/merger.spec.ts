import MergerPlugin from './merger'

describe('merger', () => {
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
    }
  }

  it('should merge the specified source keys to target one', () => {
    const options = {
      sourceFields: [
        'payload',
        'payload2',
        'payload3'
      ],
      targetField: 'newBody.deep'
    }

    const objTransformer = new MergerPlugin(msg, {options}, '')

    expect.assertions(5)

    objTransformer.execute((err, mergedObj) => {
      expect(err).toBe(null)
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

    const objTransformer = new MergerPlugin(msg, {options}, '')

    expect.assertions(2)

    objTransformer.execute((err, mergedObj) => {
      expect(err).toBe(null)
      expect(typeof mergedObj.newBody.deep).toBe('string')
    })
  })

  it('should merge even with empty objects from previous merges', () => {
    const options = {
      sourceFields: [
        'invented',
      ],
      targetField: 'newBody.deep'
    }

    const objTransformer = new MergerPlugin(msg, {options}, '')

    expect.assertions(3)

    objTransformer.execute((err, mergedObj) => {
      expect(err).toBe(null)
      expect(Array.isArray(mergedObj.newBody.deep)).toBeTruthy()
      expect(Object.keys(mergedObj.newBody.deep).length).toBeFalsy()
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

    const objTransformer = new MergerPlugin(msg, {options}, '')

    expect.assertions(3)
    return objTransformer.execute((err, mergedObj) => {
      expect(err).toBe(null)
      expect(typeof mergedObj.newBody.deep).toBe('string')
      expect(mergedObj.newBody.deep).toEqual('whatever')
    })
  })
})
