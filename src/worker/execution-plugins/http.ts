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
  }
})

export default class HttpPlugin {
  msg: string
  options: any
  preLog: string

  constructor(msg, action, preLog) {
    this.msg = msg

    this.options = new PluginOptionsSchema(action.options)
    if (this.options.isErrors()) {
      throw new Error('The options provided are not valid '+ JSON.stringify(this.options.getErrors()))
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
    axios({
      method: this.options.method.toLowerCase(),
      url: this.renderUrl(),
      data: this.populateData()
    })
      .then((response) => {
        debug('Received the next response ' + JSON.stringify(response.data))
        callback(null, response)
      })
      .catch((err) => {
        callback(new Error(`Error in the request ${err}`))
      })
  }
}
