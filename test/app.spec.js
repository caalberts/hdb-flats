/* eslint-env mocha */
import app from '../src/app.js'
// import {expect} from 'chai'
import request from 'supertest'

// const NOT_FOUND = 404
const OK = 200

describe('/GET /time_series', function () {
  this.timeout(0)
  it('should respond with JSON data', done => {
    request(app).get('/time_series?town=Tampines')
      .expect('Content-Type', /json/)
      .expect(OK)
      .end(done)
  })
})

describe('/GET /heatmap', function () {
  this.timeout(0)
  it('should respond with JSON data', done => {
    request(app).get('/heatmap?month=2015-08')
      .expect('Content-Type', /json/)
      .expect(OK)
      .end(done)
  })
})
