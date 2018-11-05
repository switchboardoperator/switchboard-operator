import Action from "../../model/Action";

const debug = require('debug')('merger-plugin')
const SchemaObject = require('schema-object')
const objectMapper = require('object-mapper')
const merge = require('deepmerge')

import logger from '../../services/logger'

const PluginOptionsSchema = new SchemaObject({
  sourceFields: {
    type: Array,
    required: true
  },
  targetField: {
    type: String,
    required: true
  }
})


export default class MergerPlugin {
  msg: string
  action: Action
  options: any
  preLog: string

  constructor(msg, action, preLog) {
    this.msg = msg
    this.action = action
    debug('received next msg: %j', this.msg)
    debug('received next action: %j', this.action)

    // Getting the last of previous results comming from previous plugins
    this.options = new PluginOptionsSchema(action.options)

    debug(
      'Instance merger plugin with options: %j and msg: %j',
      this.options,
      this.msg
    )

    if (this.options.isErrors()) {
      throw new Error('The options provided are not valid '+ JSON.stringify(this.options.getErrors()))
    }

    this.preLog = preLog + ' > ' + action.name
  }

  execute(callback) {
    const slicedObjects = []
    this.options.sourceFields.forEach((key) => {
      const slicedObj = objectMapper.getKeyValue(this.msg, key)
      if (slicedObj) {
        slicedObjects.push(slicedObj)
      }
    })

    const mergedResult = slicedObjects.reduce((prevObj: any, currObj: any) => {
      if (typeof prevObj === 'string' && typeof currObj === 'string') {
        return currObj
      }

      return merge(prevObj, currObj)
    }, [])

    const result = objectMapper.setKeyValue(this.msg, this.options.targetField, mergedResult)

    logger.info(this.preLog, 'Object merged applied')
    return callback(null, result)
  }

}
