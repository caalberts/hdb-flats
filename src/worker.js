'use strict'

const _ = require('lodash')
const math = require('mathjs')
const jStat = require('jStat').jStat

import {mongoose, meta, time_seriesDB, AddressDB, heatmapDB} from './util/initDB.js'
import {fetchData, geocode} from './util/fetchExtRes.js'

function getMeta () {
  return meta.findOne().exec((err) => {
    if (err) throw err
    console.log('Retrieved meta data')
  })
}

function getAddressBook () {
  return AddressDB.find().exec((err) => {
    if (err) throw err
    console.log('Address book loaded')
  })
}

function processData (townList, flatList, data) {
  console.log('Processing time-series data')
  const processed = []
  try {
    townList.forEach(function (town) {
      flatList.forEach(function (flat) {
        const byMonth = _(data)
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
            'min': min, 'max': max, 'median': median,
            'mean': mean, 'ci95': ci95
          }
        })
      })
    })
  } catch (err) {
    return Promise.reject(err)
  }
  return Promise.resolve(processed)
}

function updateTimeSeries (data) {
  console.log('Begin updating time-series')
  function updateOneTS (data) {
    if (!data.length) return 'Time-series updated'
    const entry = data.shift()
    return time_seriesDB.findOneAndUpdate(
      {town: entry.town, flat_type: entry.flat_type},
      {time_series: entry.time_series},
      {upsert: true}
    ).exec(err => {
      if (err) throw err
    }).then(() => updateOneTS(data))
  }
  return updateOneTS(data)
}

function populateHeatMap (addressBook, filtered) {
  console.log('Processing heat maps data')
  const heatmap = []
  const unresolved = []
  const lastIdx = addressBook.length
  let counter = filtered.length
  function resolveAddress (record) {
    if (counter % 500 === 0) console.log(counter)
    counter--
    let address = addressBook.find(address =>
      address.street === record.street_name.trim() && address.block === record.block.trim())
    if (address) {
      address['flag'] = true
      address = Promise.resolve(address)
    } else address = geocode(record.block.trim(), record.street_name.trim())
    return address.then(address => {
      if (address) {
        if (!address.flag) {
          addressBook.push(address)
          console.log('New address:', address)
        }
        if (!address.lng || !address.lat) return
        const dataPoint = {
          'lng': address.lng,
          'lat': address.lat,
          'weight': Math.round(record.resale_price / record.floor_area_sqm)
        }
        let idx = heatmap.findIndex(dataset =>
          dataset.month === record.month && dataset.flat_type === record.flat_type.trim())
        if (idx < 0) {
          idx = heatmap.push({
            'flat_type': record.flat_type.trim(),
            'month': record.month,
            'dataPoints': []
          }) - 1
        }
        heatmap[idx].dataPoints.push(dataPoint)
      } else unresolved.push(record)
    })
  }

  return filtered.reduce((promiseChain, record) =>
    promiseChain.then(() => resolveAddress(record)), Promise.resolve())
    .then(() => {
      return {
        'newAddresses': addressBook.slice(lastIdx),
        'heatmap': heatmap,
        'unresolved': unresolved
      }
    })
}

function updateHMdb (pkg) {
  console.log('Begin updating heat maps')
  function updateOneHM (data) {
    if (!data.length) return 'Heat maps updated'
    const entry = data.shift()
    return heatmapDB.findOneAndUpdate(
      {flat_type: entry.flat_type, month: entry.month},
      {dataPoints: entry.dataPoints},
      {upsert: true}
    ).exec(err => {
      if (err) throw err
    }).then(() => updateOneHM(data))
  }

  function updateOneAddress (data) {
    if (!data.length) return 'Address book updated'
    const entry = data.shift()
    return new AddressDB(entry).save(err => {
      if (err) throw err
    }).then(() => updateOneAddress(data))
  }

  if (pkg.unresolved.length) {
    console.log('UNRESOLVED ADDRESSES')
    console.log(pkg.unresolved)
  }
  return Promise.all([
    updateOneHM(pkg.heatmap),
    updateOneAddress(pkg.newAddresses)
  ])
}

function splitTask (src) {
  let townList = {}
  let flatList = {}
  let monthList = {}
  src[2].forEach(record => {
    townList[record.town.trim()] = true
    flatList[record.flat_type.trim()] = true
    monthList[record.month] = true
  })
  townList = Object.keys(townList).sort()
  flatList = Object.keys(flatList).sort()
  monthList = Object.keys(monthList).sort()

  const lastMonth = src[0].monthList.reverse()[0]
  const filtered = src[2].filter(record => record.month >= lastMonth)
  console.log('Last month:', lastMonth)
  console.log('Records retrieved:', src[2].length)

  return Promise.all([
    processData(townList, flatList, src[2]).then(updateTimeSeries),
    populateHeatMap(src[1], filtered).then(updateHMdb)
  ]).then(msg => {
    return {
      'msg': [msg[0]].concat(msg[1]),
      'meta': {
        'lastUpdate': new Date(),
        'townList': townList,
        'flatList': flatList,
        'monthList': monthList
      }
    }
  })
}

function updateMeta (info) {
  return meta.findOneAndUpdate({}, info.meta)
    .exec(err => {
      if (err) throw err
    }).then(() => info.msg)
}

const start = Date.now()
Promise.all([
  getMeta(),
  getAddressBook(),
  fetchData()
]).then(splitTask)
  .then(updateMeta)
  .then(console.log)
  .catch(console.error)
  .then(function () {
    console.log('Total time taken:', Date.now() - start)
  })
