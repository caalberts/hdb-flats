export default class {
  constructor () {
    const dbURI = 'mongodb://' +
      process.env.HDBRESALE_MONGODB_USER + ':' +
      process.env.HDBRESALE_MONGODB_PASSWORD + '@' +
      process.env.HDBRESALE_MONGODB_URL

    this.mongoose = require('mongoose')
    this.mongoose.connect(dbURI)

    this.meta = this.mongoose.model('meta', new this.mongoose.Schema({
      lastIdx: Number,
      lastUpdate: Date,
      townList: [String],
      flatList: [String],
      monthList: [String],
      old_monthList: [String]
    }))

    this.time_series = this.mongoose.model('time_series', new this.mongoose.Schema({
      town: String,
      flat_type: String,
      time_series: {
        month: [String],
        count: [Number],
        min: [Number],
        max: [Number],
        median: [Number],
        mean: [Number],
        ci95: [Number],
        loess: [Number],
        loessError: [Number]
      }
    }))

    this.time_seriesOLD = this.mongoose.model('old_time_series', new this.mongoose.Schema({
      town: String,
      flat_type: String,
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

    this.Address = this.mongoose.model('address', new this.mongoose.Schema({
      town: String,
      street: String,
      block: String,
      postalCode: Number,
      lng: Number,
      lat: Number
    }))

    this.heatmap = this.mongoose.model('heatmap', new this.mongoose.Schema({
      flat_type: String,
      month: String,
      dataPoints: [{lng: Number, lat: Number, weight: Number}]
    }))
  }
}
