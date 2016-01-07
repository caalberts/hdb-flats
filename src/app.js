import express from 'express'
import fallback from 'express-history-api-fallback'
import path from 'path'
import fs from 'fs'
import InitDB from './util/InitDB.js'

const app = express()
const root = path.join(__dirname, '../public')

const db = new InitDB()

app.use(express.static(root))

app.get('/list', function (req, res) {
  db.meta.findOne().exec((err, docs) => {
    if (err) console.error(err)
    else res.json(docs)
  })
})

app.get('/list/:key', function (req, res) {
  const key = req.params.key
  db.meta.findOne().exec((err, docs) => {
    if (err) console.error(err)
    else if (['town', 'flat', 'month'].indexOf(key) > -1) res.json(docs[key + 'List'])
    else res.json(docs)
  })
})

app.get('/time_series', function (req, res) {
  const query = {}
  if (req.query.town) query['town'] = req.query.town
  if (req.query.flat) query['flat_type'] = req.query.flat
  db.time_series.find(query).exec((err, docs) => {
    if (err) console.error(err)
    else res.json(docs)
  })
})

app.get('/heatmap', function (req, res) {
  const query = {}
  if (req.query.month) query['month'] = req.query.month
  if (req.query.flat) query['flat_type'] = req.query.flat
  db.heatmap.find(query).exec((err, docs) => {
    if (err) console.error(err)
    else res.json(docs)
  })
})

app.get('/getReadme', function (req, res) {
  fs.readFile(path.join(__dirname, '../about.md'), 'utf8', (err, data) => {
    if (err) console.error(err)
    const readme = { md: data }
    res.json(readme)
  })
})

app.use(fallback('index.html', { root }))

export default app
