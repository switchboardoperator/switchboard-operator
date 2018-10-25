import Event from './Event'

export default class Task extends Event {
  constructor({name, eventName, route}) {
    super({name, eventName, route, actions: []})
  }
}
