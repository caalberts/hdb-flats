import mongoose from 'mongoose'

export default class {
  constructor () {
    const dbURI = 'mongodb://' +
      process.env.HDBRESALE_MONGODB_USER + ':' +
      process.env.HDBRESALE_MONGODB_PASSWORD + '@' +
      process.env.HDBRESALE_MONGODB_URL

    mongoose.connect(dbURI)

    this.start = Date.now()

    this.meta = mongoose.model('meta', new mongoose.Schema({
      lastUpdate: Date,
      lastHeatmap: String,
      townList: [String],
      flatList: [String],
      monthList: [String],
      old_monthList: [String]
    }))

    this.time_series = mongoose.model('time_series', new mongoose.Schema({
      town: String,
      flat_type: String,
      time_series: {
        month: [String],
        count: [Number],
        min: [Number],
        max: [Number],
        median: [Number],
        mean: [Number],
        std: [Number],
        loess: [Number],
        loessError: [Number]
      }
    }))

    this.time_seriesOLD = mongoose.model('old_time_series', new mongoose.Schema({
      town: String,
      flat_type: String,
      time_series: {
        month: [String],
        count: [Number],
        min: [Number],
        max: [Number],
        median: [Number],
        mean: [Number],
        std: [Number]
      }
    }))

    this.Address = mongoose.model('address', new mongoose.Schema({
      town: String,
      street: String,
      block: String,
      postalCode: Number,
      lng: Number,
      lat: Number
    }))

    this.heatmap = mongoose.model('heatmap', new mongoose.Schema({
      flat_type: String,
      month: String,
      dataPoints: [{lng: Number, lat: Number, weight: Number}]
    }))
  }

  getMeta () {
    return this.meta.findOne().exec((err) => {
      if (err) throw err
      console.log('Retrieved meta data')
    })
  }

  updateMeta ({meta, msg}) {
    meta.lastUpdate = new Date()
    return this.meta.findOneAndUpdate({}, meta).exec(err => {
      if (err) throw err
    }).then(() => msg)
  }

  getAddressBook () {
    return this.Address.find().exec((err) => {
      if (err) throw err
      console.log('Address book loaded')
    })
  }

  closeConnection () {
    mongoose.disconnect()
    console.log('Total time taken:', Date.now() - this.start)
  }
}
