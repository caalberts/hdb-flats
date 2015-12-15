import 'babel-polyfill'
import express from 'express'
import updateDB from './util/updateDB.js'
import {time_seriesDB, heatmapDB} from './util/initDB.js'

const app = express()

app.use(express.static('public'))

app.get('/updateDB', function (req, res) {
  if (req.query.key !== 'daburu') res.status(403).end()
  updateDB().then(statusCode => res.status(statusCode).end())
})

app.get('/time_series', function (req, res) {
  const query = {}
  if (req.query.town) query['town'] = req.query.town
  time_seriesDB.find(query).exec((err, docs) => {
    if (err) console.error(err)
    else res.json(docs)
  })
})

app.get('/heatmap', function (req, res) {
  const query = {}
  if (req.query.type) query['flat_type'] = req.query.type
  if (req.query.month) query['month'] = req.query.month
  heatmapDB.find(query).exec((err, docs) => {
    if (err) console.error(err)
    else res.json(docs)
  })
})

export default app
