import Event from './Event'

export default class Task extends Event{
  route: string
  name: string

  constructor({name}) {
    super({name: '', eventName: '', route: '', actions: []})
    this.name = name
  }
}
