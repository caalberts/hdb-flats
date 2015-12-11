'use strict'

const fetch = require('node-fetch')
const mongoose = require('mongoose')

const fs = require('fs')
const _ = require('lodash')
const math = require('mathjs')
const jStat = require('jStat').jStat

const dbURI = 'mongodb://' +
  process.env.HDBRESALE_MONGODB_USER + ':' +
  process.env.HDBRESALE_MONGODB_PASSWORD +
  '@ds027345.mongolab.com:27345/hdb_resale_market'
mongoose.connect(dbURI)

const meta = mongoose.model('meta', new mongoose.Schema({
  lastID: Number,
  lastUpdate: Date,
  townList: [String],
  flatList: [String],
  monthList: [String]
}))

const time_series = mongoose.model('time_serie', new mongoose.Schema({
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

const address = mongoose.model('addres', new mongoose.Schema({
  street: String,
  block: String,
  postalCode: Number,
  lng: Number,
  lat: Number
}))

const heatmaps = mongoose.model('heatmap', new mongoose.Schema({
  flat_type: String,
  month: String,
  datapoints: [{
    lat: Number,
    lng: Number,
    weight: Number
  }]
}))

let records = []
const batchSize = 10000
const resID = [
  'a3f3ad06-5c05-4177-929f-bb9fffccebdd',
  'e119f1a2-e528-4535-adaf-2872b60dbf0a',
  '8d2112ca-726e-4394-9b50-3cdf5404e790'
]

function fetchData (dataset, offset) {
  const fetchURI =
    'https://data.gov.sg/api/action/datastore_search?' +
    'resource_id=' + resID[dataset] + '&sort=_id&' +
    'limit=' + batchSize + '&offset=' + offset
  return fetch(fetchURI)
  .then(data => data.json())
  .then(json => {
    records = records.concat(json.result.records)
    console.log(offset)
    if (offset + batchSize < json.result.total) return fetchData(dataset, offset + batchSize)
    else if (resID[dataset + 1]) return fetchData(dataset + 1, 0)
    else return records
  })
}

function processData (raw) {
  const processed = []
  raw.townList.forEach(function (town) {
    raw.flatList.forEach(function (flat) {
      const byMonth = _(raw.data)
        .filter(record => record.town.trim() === town && record.flat_type.trim() === flat)
        .groupBy(record => record.month)
        .value()
      const month = []
      const count = []
      let min = []
      let max = []
      let median = []
      let mean = []
      let ci95 = []
      Object.keys(byMonth).sort().forEach(mth => {
        month.push(mth)
        count.push(byMonth[mth].length)
        const resale_price = byMonth[mth].map(record => record.resale_price)
        min.push(math.min(resale_price))
        max.push(math.max(resale_price))
        median.push(math.median(resale_price))
        mean.push(math.mean(resale_price))
        ci95.push(math.std(resale_price))
      })
      if (month.length) {
        min = math.subtract(median, min)
        max = math.subtract(max, median)
        mean = math.multiply(math.round(math.divide(mean, 1000)), 1000)
        ci95 = math.dotDivide(ci95, math.sqrt(count))
        ci95 = math.dotMultiply(ci95, count.map(n => n > 2 ? jStat.studentt.inv(0.975, n - 1) : 0))
        ci95 = math.multiply(math.round(math.divide(ci95, 100)), 100)
      }
      processed.push({
        'town': town,
        'flat_type': flat,
        'time_series': {
          'month': month,
          'count': count,
          'min': min,
          'max': max,
          'median': median,
          'mean': mean,
          'ci95': ci95
        }
      })
    })
  })
  return processed
}

function writeData2File (data) {
  fs.writeFileSync('processed.json', JSON.stringify(data))
  return 'Time series updated'
}

function updateTimeSeries (data) {
  function updateOne (data) {
    if (data.length > 0) {
      const entry = data.shift()
      return time_series.findOneAndUpdate(
        {town: entry.town, flat_type: entry.flat_type},
        {time_series: entry.time_series}, {upsert: true}
      ).exec(err => {
        if (err) throw err
      }).then(() => updateOne(data))
    } else return 'Successful db update'
  }
  return updateOne(data)
}

function splitTask (raw) {
  let townList = {}
  let flatList = {}
  let monthList = {}
  raw.forEach(record => {
    townList[record.town.trim()] = true
    flatList[record.flat_type.trim()] = true
    monthList[record.month] = true
  })
  townList = Object.keys(townList).sort()
  flatList = Object.keys(flatList).sort()
  monthList = Object.keys(monthList).sort()

  const toProcess = {
    'townList': townList,
    'flatList': flatList,
    'monthList': monthList,
    'data': raw
  }

  function updateMeta (msg) {
    return meta.findOneAndUpdate({}, {
      lastID: raw[raw.length - 1]._id,
      lastUpdate: new Date(),
      townList: townList,
      flatList: flatList,
      monthList: monthList
    }).exec(err => {
      if (err) throw err
    }).then(() => {
      return msg
    })
  }

  return Promise.all([
    processData(toProcess).then(updateTimeSeries),
    populateHeatMap(raw)
  ]).then(updateMeta)
}

fetchData(0, 0)
  .then(splitTask)
  .then(console.log)
  .catch(console.error)

function populateHeatMap (records) {
  let addressBook = []
  function openAddressBook () {
    return address.find().exec((err, doc) => {
      if (err) throw err
      addressBook = doc
    })
  }
  let lastID = 0
  function findLastID () {
    return meta.findOne().exec((err, doc) => {
      if (err) throw err
      lastID = doc.lastID
    })
  }

  // function resolveAddress (record, GoogleEnabled) {
  //   let address = addressBook.find(address =>
  //     address.street === record.street_name && address.block === record.block)
  //   if (!address && GoogleEnabled) address = geocode(record.block, record.street_name)
  //   if (address) {
  //     const dataPoint = {
  //       'lat': address.lat,
  //       'long': address.long,
  //       'weight': record.resale_price / record.floor_area_sqm
  //     }
  //     const idx = heatMap.find(dataset =>
  //       dataset.month === record.month && dataset.flat === record.flat)
  //     if (idx < 0) {
  //       heatMap.push({
  //         'flat': record.flat_type,
  //         'month': record.month,
  //         'dataPoint': [dataPoint]
  //       })
  //     } else {
  //       heatMap[idx].dataPoint.push(dataPoint)
  //     }
  //   } else queued.push(record)
  // }
  const queued = []
  return openAddressBook().then(findLastID).then(() => {
    records.slice(lastID).forEach(record => resolveAddress(record, false))
    queued.forEach((record, idx) => setTimeout(resolveAddress, idx * 150, record, true))
  })
}
