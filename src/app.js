import express from 'express'
import {meta, time_seriesDB, heatmapDB} from './util/initDB.js'

const app = express()
app.use(express.static('public'))

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
  if (req.query.flat) query['flat_type'] = req.query.flat
  time_seriesDB.find(query).exec((err, docs) => {
    if (err) console.error(err)
    else res.json(docs)
  })
})

app.get('/heatmap', function (req, res) {
  const query = {}
  if (req.query.month) query['month'] = req.query.month
  if (req.query.flat) query['flat_type'] = req.query.flat
  heatmapDB.find(query).exec((err, docs) => {
    if (err) console.error(err)
    else res.json(docs)
  })
})

export default app
