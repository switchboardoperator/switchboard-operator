const debug = require('debug')('http-plugin')
const SchemaObject = require('schema-object')
const axios = require('axios')
const nunjucks = require('nunjucks')

const PluginOptionsSchema = new SchemaObject({
  url: {
    type: String,
    required: true
  },
  method: {
    type: String,
    required: true,
    enum: ['GET', 'POST', 'PUT']
  },
  merge: {
    type: Boolean,
    required: false
  },
  mergeTarget: {
    type: String,
    required: false
  }
})

export default class HttpPlugin {
  msg: any
  options: any
  preLog: string

  constructor(msg: any, action: any, preLog: string) {
    this.msg = msg

    this.options = new PluginOptionsSchema(action.options)
    if (this.options.isErrors()) {
      throw new Error('The options provided are not valid ' + JSON.stringify(this.options.getErrors()))
    }
    this.preLog = preLog + ' > ' + action.name
  }

  renderUrl() {
    const renderedUrl = nunjucks.renderString(this.options.url, this.msg)
    debug('Rendered url to make the request is: ' + renderedUrl)
    return renderedUrl
  }

  populateData() {
    return this.msg
  }

  execute(callback) {
    const method = this.options.method.toLowerCase()
    axios({
      method: method,
      url: this.renderUrl(),
      data: method !== 'get' ? this.populateData() : {}
    })
      .then((response) => {
        debug('Received the next response ' + JSON.stringify(response.data))
        let result = {}

        if (this.options.merge && !this.options.mergeTarget) {
          result = {...this.msg, ...response.data}
        }

        if (this.options.merge && this.options.mergeTarget) {
          result = {...this.msg}
          result[this.options.mergeTarget] = response.data
        }

        return callback(null, result)
      })
      .catch((err) => {
        return callback(new Error(`Error in the request ${err}`))
      })
  }
}
