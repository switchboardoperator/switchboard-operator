import Action from '../model/Action'

export interface ExecutionPluginInterface {
  msg: any
  action: Action
  preLog: string
  // these are of type SchemaObjectInstance, but does not work as expected
  options: any
  execute() : Promise<any>
}
