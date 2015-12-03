import 'babel-polyfill'
import express from 'express'
import mongoose from 'mongoose'

const app = express()
const dbUri = 'mongodb://' +
  process.env.HDBRESALE_MONGODB_USER + ':' +
  process.env.HDBRESALE_MONGODB_PASSWORD +
  '@ds033087.mongolab.com:33087/hdb-resale'

mongoose.connect(dbUri)
const Flat = mongoose.model('Flat', {
  town: String,
  type: String,
  averagePrices: Array
})

app.use(bodyParser.json())

app.get('/', function (req, res) {
  res.send('Home page for user to enter the town and flat type')
})

// get flat by town and flat type
// eg. /flats?town=tampines&flat=2 room
app.get('/flats', function (req, res) {
  let query
  if (req.query.town && req.query.flat) {
    query = {
      town: { $regex: req.query.town, $options: 'i' },
      flat: { $regex: req.query.flat, $options: 'i' }
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
      // not found, call data.gov.sg for new data,
      // then call POST method to create new document      
      console.log('Not Found')
      res.status(404).end('Not Found')
    }
  })
})

// create new document for a specific town and flat type
// document should be submitted in request body
app.post('/flats', function (req, res) {
  const newTownFlat = req.body
  newTownFlat.save(function (err) {
    if (err) return console.error(err)
    console.log('new town added')
    res.status(201).json(newTownFlat)
  })
})

export default app
