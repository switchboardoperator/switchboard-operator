export default class Action {
  name: string
  type: string
  options: any

  constructor({name, type, options}: {name: string, type: string, options: any}) {
    this.name = name
    this.type = type
    this.options = options
  }
}
