import express from 'express'
import fallback from 'express-history-api-fallback'
import bodyParser from 'body-parser'
import path from 'path'
import InitDB from './util/InitDB.js'
import {toSVY, eucliDist2} from './util/geometry'

const app = express()
const root = path.join(__dirname, '../public')

const db = new InitDB()
const addressCache = {lastUpdate: Date.now()}
db.getAddressBook().then(docs => {
  addressCache.data = docs
})

app.use(express.static(root))
app.use(bodyParser.json())

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

app.post('/nearby', function (req, res) {
  if (!addressCache.data) res.json([])
  else {
    const {lat, lng, radius} = req.body
    const point = toSVY(lat, lng)
    const r2 = Math.pow(radius, 2)
    const nearbyStreets = addressCache.data
      .filter(a => eucliDist2(toSVY(a.lat, a.lng), point) < r2)
      .reduce((streets, a) => {
        streets[a.street] = true
        return streets
      }, {})
    res.json(Object.keys(nearbyStreets))
    if (Date.now() - addressCache.lastUpdate > 24 * 60 * 60 * 1000) {
      db.getAddressBook.then(docs => {
        addressCache.lastUpdate = Date.now()
        addressCache.data = docs
      })
    }
  }
})

app.use(fallback('index.html', { root }))

export default app
