export default class Action {
  name: string
  type: string
  options: any
  event: string

  constructor({name, type, options, event}: {name: string, type: string, options: any, event: string}) {
    this.name = name
    this.type = type
    this.options = options
    this.event = event
  }
}
