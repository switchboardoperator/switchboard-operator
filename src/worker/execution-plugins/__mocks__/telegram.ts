export const mockExecute = jest.fn()
const mock = jest.fn().mockImplementation(() => ({
  execute: () => console.log('Running telegram plugin mock')
}))

export default mock
