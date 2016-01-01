/* eslint-env mocha */
import app from '../src/app.js'
import chai from 'chai'
import request from 'supertest'

const expect = chai.expect
const NOT_FOUND = 404
const OK = 200

describe('/GET /towns', function () {
  this.timeout(10000)
  it('should respond with JSON data', done => {
    request(app).get('/towns?flat_type=3 Room&town=Tampines')
      .expect('Content-Type', /json/)
      .expect(OK)
      .end(done)
  })
  it('should provide a list of time series as an array', done => {
    request(app).get('/towns?town=Tampines')
      .expect(res => {
        expect(res.body).to.be.an('array')
      })
      .end(done)
  })
  it('should respond NOT_FOUND if query is invalid', done => {
    request(app).get('/towns?town=Kuala Lumpur')
      .expect(NOT_FOUND)
      .end(done)
  })
})

describe('/GET /heatmap', function () {
  this.timeout(10000)
  it('should respond with JSON data', done => {
    request(app).get('/heatmap?flat_type=3 Room&month=2015-08')
      .expect('Content-Type', /json/)
      .expect(OK)
      .end(done)
  })
  it('should respond NOT_FOUND if query is invalid', done => {
    request(app).get('/heatmap?flat_type=closet')
      .expect(NOT_FOUND)
      .end(done)
  })
})
