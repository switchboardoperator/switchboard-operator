export default class Action {
  name: string
  type: string
  options: object

  constructor({name, type, options}: {name: string, type: string, options: object}) {
    this.name = name
    this.type = type
    this.options = options
  }
}
