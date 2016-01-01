import express from 'express'
import fallback from 'express-history-api-fallback'
import path from 'path'
import {meta, time_seriesDB, heatmapDB} from './util/initDB.js'

const app = express()
const root = path.join(__dirname, '../public')

app.use(express.static(root))

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
  meta.findOne().exec((err, docs) => {
    if (err) console.error(err)
    else res.json(docs)
  })
})

app.get('/list/:key', function (req, res) {
  const key = req.params.key
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

app.get('/about', function (req, res) {
  res.sendfile(root + '/about.html')
})

app.use(fallback('index.html', { root }))

export default app
