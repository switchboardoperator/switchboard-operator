const chai     = require('chai')
const chaiHttp = require('chai-http')
const expect   = chai.expect
const { app }  = require('./app')

chai.use(chaiHttp)

describe('main app', () => {
  it('expressjs should listen on port 3000', (done) => {
    chai.request(app)
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
    chai.request(app)
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
