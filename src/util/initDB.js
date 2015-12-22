'use strict'

const mongoose = require('mongoose')
const dbURI = 'mongodb://' +
  process.env.HDBRESALE_MONGODB_USER + ':' +
  process.env.HDBRESALE_MONGODB_PASSWORD + '@' +
  process.env.HDBRESALE_MONGODB_URL
mongoose.connect(dbURI)

export const meta = mongoose.model('meta', new mongoose.Schema({
  lastIdx: Number,
  lastUpdate: Date,
  townList: [String],
  flatList: [String],
  monthList: [String]
}))

export const time_seriesDB = mongoose.model('time_series', new mongoose.Schema({
  town: String,
  flat: String,
  time_series: {
    month: [String],
    count: [Number],
    min: [Number],
    max: [Number],
    median: [Number],
    mean: [Number],
    ci95: [Number]
  }
}))

export const AddressDB = mongoose.model('address', new mongoose.Schema({
  street: String,
  block: String,
  postalCode: Number,
  lng: Number,
  lat: Number
}))

export const heatmapDB = mongoose.model('heatmap', new mongoose.Schema({
  flat_type: String,
  month: String,
  dataPoints: [{lng: Number, lat: Number, weight: Number}],
  updateFlag: Boolean
}))
