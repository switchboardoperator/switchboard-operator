import { expect } from 'chai'

import Task from "./Task"

describe('Task', () => {
  it('should has task queue properties', (done) => {
    const task = new Task({
      name: 'testing',
      eventName: 'testTarget',
      route: 'testRoute'
    })

    expect(task.name).to.equals('testing')
    expect(task.eventName).to.equals('testTarget')
    expect(task.route).to.equals('testRoute')

    done()
  })
})
