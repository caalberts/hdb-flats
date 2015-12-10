'use strict'

const fetch = require('node-fetch')
const fs = require('fs')
const _ = require('lodash')
const math = require('mathjs')
const jStat = require('jStat').jStat

let townList = {}
let flatList = {}
let records = []
const resID = [
  'a3f3ad06-5c05-4177-929f-bb9fffccebdd',
  'e119f1a2-e528-4535-adaf-2872b60dbf0a',
  '8d2112ca-726e-4394-9b50-3cdf5404e790'
]
const batchSize = 10000

function fetchData (dataset, offset) {
  const fetchURL =
    'https://data.gov.sg/api/action/datastore_search?' +
    'resource_id=' + resID[dataset] + '&sort=_id&' +
    'limit=' + batchSize + '&offset=' + offset
  return fetch(fetchURL)
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
  raw.forEach(record => {
    townList[record.town.trim()] = true
    flatList[record.flat_type.trim()] = true
  })
  townList = Object.keys(townList).sort()
  flatList = Object.keys(flatList).sort()
  const processed = []
  townList.forEach(function (town) {
    flatList.forEach(function (flat) {
      const byMonth = _(raw)
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

fetchData(0, 0)
  .then(processData)
  .then(data => {
    fs.writeFile('processed.json', JSON.stringify(data), function (err) {
      if (err) throw err
      console.log('Successful db update')
    })
  })
  .catch(console.error)

const addressBook = []
const heatMap = []
const queued = []

function populateHeatMap (GoogleEnabled, record) {
  let address = addressBook.find(address => address.street === record.street_name && address.block === record.block)
  if (!address && GoogleEnabled) address = geocode(record.block, record.street_name)
  if (address) {
    const dataPoint = {
      'lat': address.lat,
      'long': address.long,
      'weight': record.resale_price / record.floor_area_sqm
    }
    const idx = heatMap.find(dataset => dataset.month === record.month && dataset.flat === record.flat)
    if (idx < 0) {
      heatMap.push({
        'flat': record.flat_type,
        'month': record.month,
        'dataPoint': [dataPoint]
      })
    } else {
      heatMap[idx].dataPoint.push(dataPoint)
    }
  } else queued.push(record)
}

const lastID = 0
records.slice(lastID).forEach(populateHeatMap.bind(null, false))
queued.forEach((record, idx) => setTimeout(populateHeatMap.bind(null, true, record), idx * 150))
