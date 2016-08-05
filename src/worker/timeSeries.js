const _ = require('lodash')
const math = require('mathjs')
const jStat = require('jStat').jStat
import Loess from 'loess'

import InitDB from '../util/InitDB.js'
import {fetchData} from '../util/fetchExtRes.js'

export const db = new InitDB()

export function processData ({data, meta}) {
  console.log('Processing time-series data')
  const processed = []
  const {townList, flatList} = meta
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
      let std = []
      Object.keys(byMonth).sort().forEach(mth => {
        month.push(mth)
        count.push(byMonth[mth].length)
        const resale_price = byMonth[mth].map(record => +record.resale_price)
        min.push(math.min(resale_price))
        max.push(math.max(resale_price))
        median.push(math.median(resale_price))
        mean.push(math.mean(resale_price))
        std.push(math.std(resale_price))
      })
      if (month.length) {
        min = math.subtract(median, min)
        max = math.subtract(max, median)
        mean = math.multiply(math.round(math.divide(mean, 1000)), 1000)
        std = math.multiply(math.round(math.divide(std, 100)), 100)
      }
      processed.push({
        'town': town,
        'flat_type': flat,
        'time_series': {month, count, min, max, median, mean, std}
      })
    })
  })
  return {data: processed, meta}
}

const z = jStat.normal.inv(0.95, 0, 1)
export function smoothData (y, x, w, std) {
  if (y.length < 30) return {}
  const fit = new Loess({y, x, w}, {span: 0.3})
  const predict = fit.predict()

  const variance = math.square(std)
  const halfwidth = predict.weights.map((weight, idx) => {
    const V1 = math.sum(weight)
    const V2 = math.multiply(weight, weight)
    const yhats = math.multiply(predict.betas[idx], fit.expandedX)

    const residuals = math.subtract(y, yhats)
    const bias = math.square(residuals)
    const totalVariance = math.multiply(math.add(bias, variance), weight)
    const intervalEstimate = Math.sqrt(totalVariance / (V1 - V2 / V1))
    return intervalEstimate * z
  })

  return {loess: math.round(predict.fitted), loessError: math.round(halfwidth)}
}

export function updateTimeSeries ({data, meta}) {
  console.log('Begin updating time-series')
  function updateOneTS (data) {
    if (!data.length) return {meta, msg: 'Time-series updated'}
    if (data.length % 10 === 0) console.log(data.length)
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
        const std = old.time_series.std.concat(entry.time_series.std)

        entry.time_series = {month, count, min, max, median, mean, std}
        Object.assign(entry.time_series, smoothData(
          mean,
          month.map(mth => meta.monthList.indexOf(mth)),
          count,
          std
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

Promise.all([
  db.getMeta(),
  fetchData()
]).then(([meta, data]) => {
  let townList = {}
  let flatList = {}
  let monthList = {}
  data.forEach(record => {
    townList[record.town.trim()] = true
    flatList[record.flat_type.trim()] = true
    monthList[record.month] = true
  })
  townList = Object.keys(townList).sort()
  flatList = Object.keys(flatList).sort()
  monthList = Object.keys(monthList).sort()
  monthList = meta.old_monthList.concat(monthList)
  console.log('Records retrieved:', data.length)

  return processData({data, meta: {townList, flatList, monthList}})
}).then(updateTimeSeries)
  .then(db.updateMeta.bind(db))
  .then(console.log)
  .catch(console.error)
  .then(db.closeConnection)
