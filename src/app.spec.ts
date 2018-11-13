import * as request from 'supertest'
import SwitchBoardOperator from './app'

describe('main app', () => {
  it('expressjs should listen on port 3000', (done) => {
    request(SwitchBoardOperator.app)
      .get('/status')
      .expect(200)
    done()
  })

  it('should render topology configuration as diagrams', (done) => {
    request(SwitchBoardOperator.app)
      .get('/topology')
      .expect(200)
    done()
  })
})