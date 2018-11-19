
export interface ExecutionPluginInterface {
  msg: string
  action: string
  preLog: string
  options: PluginOptionsSchema
  execute() : Promise<any>
}
