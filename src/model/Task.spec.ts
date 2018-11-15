import Task from "./Task"

describe('Task', () => {
  it('should has task queue properties', (done) => {
    const task = new Task({
      name: 'testing',
      eventName: 'testTarget',
      route: 'testRoute'
    })

    expect(task.name).toEqual('testing')
    expect(task.eventName).toEqual('testTarget')
    expect(task.route).toEqual('testRoute')

    done()
  })
})
