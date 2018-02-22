const expect = require('chai').expect
const TaskSchema = require('./task-schema')

describe('TaskSchema', () => {
  it('should has task queue properties', (done) => {
    const task = new TaskSchema({
      name: 'testing',
      action: 'created'
    })

    expect(task.name).to.equals('testing')

    done()
  })
})
