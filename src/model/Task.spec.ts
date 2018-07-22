describe('Task', () => {
  it('should has task queue properties', (done) => {
    const task = new TaskSchema({
      name: 'testing',
      action: 'created'
    })

    expect(task.name).to.equals('testing')

    done()
  })
})
