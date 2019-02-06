type ConstructorParams = {
  name: string,
  type: string,
  options: any,
  event: string,
  allowFailure?: boolean,
}

export default class Action {
  name: string
  type: string
  options: any
  event: string
  allowFailure?: boolean

  constructor({name, type, options, event, allowFailure}: ConstructorParams) {
    this.name = name
    this.type = type
    this.options = options
    this.event = event
    if (typeof allowFailure !== 'undefined') {
      this.allowFailure = allowFailure
    }
  }

  toString() {
    return this.name
  }
}
