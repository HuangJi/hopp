/* global describe it:true */
const chai = require('chai')
const chaiHttp = require('chai-http')
const expect = require('chai').expect
const server = require('../app')

chai.use(chaiHttp)

describe('Base Testing', () => {
  it('API docs should work', (done) => {
    chai.request(server)
      .get('/api/docs')
      .end((err, res) => {
        expect(err).to.not.exist
        console.log()
        expect(res.status).to.equal(200)
        done()
      })
  })

  it('Base Get request should work', (done) => {
    const testQueryObject = { name: 'UOB Invest Domestic Equity Fund' }
    chai.request(server)
      .get('/api/v0/fund/info')
      .query(testQueryObject)
      .end((err, res) => {
        expect(err).to.not.exist
        expect(res.status).to.equal(200)
        expect(res.body).to.have.property('name').and.equal(testQueryObject.name)
        done()
      })
  })
})

describe('api/v0/fund/info Testing', () => {
  it('Fund Info Request without authorization should return 401', (done) => {
    const testQueryObject = { name: '兆豐' }
    chai.request(server)
      .post('/api/v0/fund/info')
      .send(testQueryObject)
      .end((err, res) => {
        expect(err).to.not.exist
        expect(res.status).to.equal(401)
        done()
      })
  })

  it('Fund Info Request with wrong authorization should return 401', (done) => {
    const testQueryObject = { name: '兆豐' }
    chai.request(server)
      .post('/api/v0/fund/info')
      .set('Authorization', '3c0a50b4a76d83d77cae1f859a40de55c0b03123')
      .send(testQueryObject)
      .end((err, res) => {
        expect(err).to.not.exist
        expect(res.status).to.equal(401)
        done()
      })
  })
  it('Fund Info Request with empty name should return 400', (done) => {
    chai.request(server)
      .post('/api/v0/fund/info')
      .set('Authorization', '2c0a50b4a76d83d77cae1f859a40de55c0b07877')
      .end((err, res) => {
        expect(err).to.not.exist
        expect(res.status).to.equal(400)
        done()
      })
  })
})
