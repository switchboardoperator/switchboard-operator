import { expect } from 'chai'
import ChaiHttp = require('chai-http')
import SwitchBoardOperator from './app'

chai.use(ChaiHttp)

describe('main app', () => {
  it('expressjs should listen on port 3000', (done) => {
    chai.request(SwitchBoardOperator.app)
      .get('/status')
      .end((err, res) => {
        if (err) {
          done(err)
        }
        expect(res).to.have.status(200)
        return done()
      })
  })

  it('should render topology configuration as diagrams', (done) => {
    chai.request(SwitchBoardOperator.app)
      .get('/topology')
      .end((err, res) => {
        if (err) {
          done(err)
        }
        expect(res).to.have.status(200)
        return done()
      })
  })
})
