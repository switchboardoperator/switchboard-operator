import nunjucks from 'nunjucks'

import Action from '../model/Action'

abstract class OperatorPlugin {
  action: Action
  preLog: string
  // these are of type SchemaObjectInstance, but does not work as expected
  options: any

  loadOptions(schema: any, options: any, msg: any = null) : void {
    // Try to parse any dynamic variable
    if (msg && Object.keys(msg).length) {
      for (let option of Object.keys(options)) {
        if (typeof options[option] !== 'string') {
          continue
        }

        options[option] = nunjucks.renderString(
          options[option],
          msg
        )
      }
    }

    this.options = new schema(options)

    if (this.options.isErrors()) {
      throw new Error('The options provided are not valid '+ JSON.stringify(this.options.getErrors()))
    }
  }

  constructor(action, prelog, optionsSchema : any = null) {
    this.action = action
    this.preLog = prelog + ' > ' + action.name + ': %j'

    if (optionsSchema) {
      this.loadOptions(optionsSchema, action.options)
    }
  }
}

export default OperatorPlugin
