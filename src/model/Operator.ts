import Action from './Action'

export default class Operator {
  name: string
  eventName: string
  route: string
  enabled: boolean
  output: string
  actions: Array<Action>
  constructor() {
  }
}
