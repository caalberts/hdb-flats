import express from 'express'
<<<<<<< HEAD
// import updateDB from './util/updateDB.js'
import {meta, time_seriesDB, heatmapDB} from './util/initDB.js'

const app = express()
=======
import mongoose from 'mongoose'
import bodyParser from 'body-parser'
// import getData from './util/hdb.js'

const app = express()
const dbUri = 'mongodb://' +
  process.env.HDBRESALE_MONGODB_USER + ':' +
  process.env.HDBRESALE_MONGODB_PASSWORD +
  '@ds033087.mongolab.com:33087/hdb-resale'

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
>>>>>>> 0a31b189f38542fa26732f2963aa6356d9a15983

app.use(express.static('public'))

<<<<<<< HEAD
// const accessKey = 'daburu'
// let runningState = 'idle'
//
// app.get('/updateDB', function (req, res) {
//   if (req.query.key !== accessKey) {
//     res.status(403).end()
//   } else if (runningState === 'idle') {
//     runningState = 'running'
//     res.status(202).end()
//     updateDB().then(statusCode => {
//       if (statusCode === 200) runningState = 'passed'
//       else if (statusCode === 500) runningState = 'failed'
//     })
//   } else if (runningState === 'running') {
//     res.status(204).end()
//   } else if (runningState === 'passed') {
//     runningState = 'idle'
//     res.status(200).end()
//   } else if (runningState === 'failed') {
//     runningState = 'idle'
//     res.status(500).end()
//   }
// })

app.get('/list', function (req, res) {
  const key = req.params.key
  console.log(key)
  meta.findOne().exec((err, docs) => {
    if (err) console.error(err)
    else res.json(docs)
  })
})

app.get('/list/:key', function (req, res) {
  const key = req.params.key
  console.log(key)
  meta.findOne().exec((err, docs) => {
    if (err) console.error(err)
    else if (['town', 'flat', 'month'].indexOf(key) > -1) res.json(docs[key + 'List'])
    else res.json(docs)
  })
})

app.get('/time_series', function (req, res) {
  const query = {}
  if (req.query.town) query['town'] = req.query.town
  time_seriesDB.find(query).exec((err, docs) => {
    if (err) console.error(err)
=======
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
>>>>>>> 0a31b189f38542fa26732f2963aa6356d9a15983
    else res.json(docs)
  })
})

app.get('/heatmap', function (req, res) {
<<<<<<< HEAD
  const query = {}
  if (req.query.type) query['flat_type'] = req.query.type
  if (req.query.month) query['month'] = req.query.month
  heatmapDB.find(query).exec((err, docs) => {
    if (err) console.error(err)
=======
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
>>>>>>> 0a31b189f38542fa26732f2963aa6356d9a15983
    else res.json(docs)
  })
})

export default app
