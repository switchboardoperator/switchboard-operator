export const mockExecute = jest.fn()
const mock = jest.fn().mockImplementation(() => ({
  execute: () => console.log('Running prev2task plugin mock')
}))

export default mock
