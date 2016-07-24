const _ = require('lodash')
const math = require('mathjs')
const jStat = require('jStat').jStat
import Loess from 'loess'

import InitDB from './util/InitDB.js'
import {fetchData, geocode} from './util/fetchExtRes.js'

const start = Date.now()
export const db = new InitDB()

export function getMeta () {
  return db.meta.findOne().exec((err) => {
    if (err) throw err
    console.log('Retrieved meta data')
  })
}

export function getAddressBook () {
  return db.Address.find().exec((err) => {
    if (err) throw err
    console.log('Address book loaded')
  })
}

export function processData ({data, meta}) {
  console.log('Processing time-series data')
  const processed = []
  const {townList, flatList} = meta
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
          const resale_price = byMonth[mth].map(record => +record.resale_price)
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
  return Promise.resolve({data: processed, meta})
}

const z = jStat.normal.inv(0.95, 0, 1)
export function smoothData (y, x, w, ci95) {
  if (y.length < 30) return {}
  const fit = new Loess({y, x, w}, {span: 0.3})
  const predict = fit.predict()

  const se = math.dotDivide(ci95, w.map(n => n > 2 ? jStat.studentt.inv(0.975, n - 1) : 1))
  const variance = math.dotMultiply(math.square(se), w)
  const halfwidth = predict.weights.map((weight, idx) => {
    const V1 = math.sum(weight)
    const V2 = math.multiply(weight, weight)
    const bias = math.square(predict.residuals[idx])
    const totalVariance = math.multiply(math.add(bias, variance), weight)
    const intervalEstimate = Math.sqrt(totalVariance / (V1 - V2 / V1))
    return intervalEstimate * z
  })

  return {loess: math.round(predict.fitted), loessError: math.round(halfwidth)}
}

export function updateTimeSeries ({data, meta}) {
  console.log('Begin updating time-series')
  function updateOneTS (data) {
    if (!data.length) return 'Time-series updated'
    const entry = data.pop()
    return db.time_seriesOLD
      .findOne({town: entry.town, flat_type: entry.flat_type}).exec()
      .then(old => {
        const month = old.time_series.month.concat(entry.time_series.month)
        const count = old.time_series.count.concat(entry.time_series.count)
        const min = old.time_series.min.concat(entry.time_series.min)
        const max = old.time_series.max.concat(entry.time_series.max)
        const median = old.time_series.median.concat(entry.time_series.median)
        const mean = old.time_series.mean.concat(entry.time_series.mean)
        const ci95 = old.time_series.ci95.concat(entry.time_series.ci95)

        entry.time_series = {month, count, min, max, median, mean, ci95}
        Object.assign(entry.time_series, smoothData(
          mean,
          month.map(mth => meta.monthList.indexOf(mth)),
          count,
          ci95
        ))

        return db.time_series.findOneAndUpdate(
          {town: entry.town, flat_type: entry.flat_type},
          {time_series: entry.time_series},
          {upsert: true}
        ).exec()
      })
      .then(() => updateOneTS(data))
  }
  return updateOneTS(data)
}

export function populateHeatMap (addressBook, filtered) {
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
    } else {
      address = geocode(record.block.trim(), record.street_name.trim(), record.town.trim())
    }
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
          'weight': Math.round(+record.resale_price / +record.floor_area_sqm)
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

export function updateOneAddress (data) {
  if (!data.length) return 'Address book updated'
  if (data.length % 10 === 0) console.log(data.length)
  const entry = data.pop()
  return db.Address.findOneAndUpdate(
    {block: entry.block, street: entry.street},
    entry,
    {upsert: true}
  ).exec(err => {
    if (err) throw err
  }).then(() => updateOneAddress(data))
}

export function updateHMdb (pkg) {
  console.log('Begin updating heat maps')
  function updateOneHM (data) {
    if (!data.length) return 'Heat maps updated'
    const entry = data.pop()
    return db.heatmap.findOneAndUpdate(
      {flat_type: entry.flat_type, month: entry.month},
      {dataPoints: entry.dataPoints},
      {upsert: true}
    ).exec(err => {
      if (err) throw err
    }).then(() => updateOneHM(data))
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

export function splitTask (src) {
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
  monthList = src[0].old_monthList.concat(monthList)

  const lastMonthList = src[0].monthList
  const lastMonth = lastMonthList[lastMonthList.length - 1]
  const filtered = src[2].filter(record => record.month >= lastMonth)
  console.log('Last month:', lastMonth)
  console.log('Records retrieved:', src[2].length)

  return Promise.all([
    processData({data: src[2], meta: {townList, flatList, monthList}})
      .then(updateTimeSeries),
    populateHeatMap(src[1], filtered).then(updateHMdb)
  ]).then(msg => {
    return {
      'msg': [msg[0]].concat(msg[1]),
      'meta': {'lastUpdate': new Date(), townList, flatList, monthList}
    }
  })
}

export function updateMeta (info) {
  return db.meta.findOneAndUpdate({}, info.meta)
    .exec(err => {
      if (err) throw err
    }).then(() => info.msg)
}

export function closeConnection () {
  db.mongoose.disconnect()
  console.log('Total time taken:', Date.now() - start)
}

Promise.all([
  getMeta(),
  getAddressBook(),
  fetchData()
]).then(splitTask)
  .then(updateMeta)
  .then(console.log)
  .catch(console.error)
  .then(closeConnection)
