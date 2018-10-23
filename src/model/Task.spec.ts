import { expect } from 'chai'

import Task from "./Task"

describe('Task', () => {
  it('should has task queue properties', (done) => {
    const task = new Task({
      name: 'testing'
    })

    expect(task.name).to.equals('testing')

    done()
  })
})
