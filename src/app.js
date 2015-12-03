import 'babel-polyfill'
import express from 'express'
import mongoose from 'mongoose'
import bodyParser from 'body-parser'
import getData from './util/hdb.js'

const app = express()
const dbUri = 'mongodb://' +
  process.env.HDBRESALE_MONGODB_USER + ':' +
  process.env.HDBRESALE_MONGODB_PASSWORD +
  '@ds033087.mongolab.com:33087/hdb-resale'

mongoose.connect(dbUri)
const Flat = mongoose.model('Flat', {
  town: String,
  type: String,
  data: Array
})

app.use(bodyParser.json())

app.get('/', function (req, res) {
  res.send('Home page for user to enter the town and flat type')
})

// get flat by town and flat type
// eg. /flats?town=tampines&type=2 room
app.get('/flats', function (req, res) {
  let query
  if (req.query.town && req.query.type) {
    query = {
      town: { $regex: req.query.town, $options: 'i' },
      flat: { $regex: req.query.type, $options: 'i' }
    }
  } else {
    query = {}
  }
  Flat.find(query, (err, docs) => {
    if (err) console.error(err)
    if (docs.length > 0) {
      console.log('town and flat type found')
      res.json(docs)
    } else {
      console.log('data not in existing database')
      console.log('please wait while we fetch new data')
      // not found, call funciton to fetch data.gov.sg for new data,
      // fetch(data.gov.sg)
          // .then(process data)
          // .then(save into mongodb)
          // .then(respond with new data)

      getData(req.query.town, req.query.type)
        .then(data => {
          console.log(data)
          const newTownFlat = new Flat(data)
          newTownFlat.save(function (err) {
            if (err) return console.error(err)
            console.log('new data added')
            res.status(201).json(newTownFlat)
          })
        })
    }
  })
})

// create new document for a specific town and flat type
// document should be submitted in request body
app.post('/flats', function (req, res) {
  const newTownFlat = new Flat(req.body)
  newTownFlat.save(function (err) {
    if (err) return console.error(err)
    console.log('new town added')
    res.status(201).json(newTownFlat)
  })
})

export default app
