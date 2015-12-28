import 'babel-polyfill'
import express from 'express'
import mongoose from 'mongoose'
import bodyParser from 'body-parser'
// import getData from './util/hdb.js'

const app = express()
const dbUri = 'mongodb://' +
  process.env.HDBRESALE_MONGODB_USER + ':' +
  process.env.HDBRESALE_MONGODB_PASSWORD + '@' +
  process.env.HDBRESALE_MONGODB_URL

mongoose.connect(dbUri)
const Heatmap = mongoose.model('Heatmap', {
  flat_type: String,
  month: String,
  dataPoints: Array
})
const Town = mongoose.model('Town', {
  town: String,
  flat_type: String,
  time_series: Object
})

app.use(express.static('public'))
app.use(bodyParser.json())

app.get('/towns', function (req, res) {
  let query = {}
  if (req.query.town) {
    query['town'] = { $regex: req.query.town, $options: 'i' }
  }
  if (req.query.flat_type) {
    query['flat_type'] = { $regex: req.query.flat_type, $options: 'i' }
  }
  Town.find(query).exec((err, docs) => {
    if (err) console.error(err)
    if (docs.length === 0) res.status(404).end('Not Found')
    else res.json(docs)
  })
})

app.get('/heatmap', function (req, res) {
  let query = {}
  if (req.query.flat_type) {
    query['flat_type'] = { $regex: req.query.flat_type, $options: 'i' }
  }
  if (req.query.month) {
    query['month'] = req.query.month
  }
  Heatmap.find(query).exec((err, docs) => {
    if (err) console.error(err)
    if (docs.length === 0) res.status(404).end('Not Found')
    else res.json(docs)
  })
})

export default app
