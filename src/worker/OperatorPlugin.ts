import Action from '../model/Action'

abstract class OperatorPlugin {
  action: Action
  preLog: string
  // these are of type SchemaObjectInstance, but does not work as expected
  options: any

  constructor(action, prelog, optionsSchema : any = null) {
    this.action = action
    this.preLog = prelog + ' > ' + action.name + ': %j'

    if (optionsSchema) {
      this.options = new optionsSchema(action.options)

      if (this.options.isErrors()) {
        throw new Error('The options provided are not valid '+ JSON.stringify(this.options.getErrors()))
      }
    }
  }
}

export default OperatorPlugin
