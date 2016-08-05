import _ from 'lodash'

import InitDB from '../util/InitDB.js'
import {fetchData, geocode} from '../util/fetchExtRes.js'

export const db = new InitDB()

export function populateHeatMap (addressBook, filtered) {
  console.log('Processing heat maps data')
  const heatmap = []
  const unresolved = []
  const lastIdx = addressBook.length
  let counter = filtered.length
  function resolveAddress (record) {
    if (--counter % 500 === 0) console.log(counter)
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
      } else {
        unresolved.push(record)
      }
    })
  }

  return filtered.reduce((promiseChain, record) =>
    promiseChain.then(() => resolveAddress(record)), Promise.resolve())
    .then(() => {
      return {
        lastMonth: _.maxBy(filtered, 'month').month,
        newAddresses: addressBook.slice(lastIdx),
        heatmap,
        unresolved
      }
    })
}

export function updateOneAddress (data) {
  if (!data.length) return 'Address book updated'
  const entry = data.pop()
  return db.Address.findOneAndUpdate(
    {block: entry.block, street: entry.street},
    entry,
    {upsert: true}
  ).exec(err => {
    if (err) throw err
  }).then(() => updateOneAddress(data))
}

export function updateOneHM (data) {
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

Promise.all([
  db.getMeta(),
  db.getAddressBook(),
  fetchData()
]).then(([meta, addressBook, data]) => {
  console.log('Continue from: ', meta.lastHeatmap)
  const filtered = data.filter(record => record.month >= meta.lastHeatmap)
  return populateHeatMap(addressBook, filtered)
}).then(({lastMonth, newAddresses, heatmap, unresolved}) => {
  console.log('Begin updating heat maps')
  if (unresolved.length) {
    console.log('UNRESOLVED ADDRESSES')
    unresolved.forEach(console.log)
  }
  return Promise.all([
    updateOneHM(heatmap),
    updateOneAddress(newAddresses)
  ]).then(msg => ({
    meta: {lastHeatmap: lastMonth},
    msg: msg.join(', ')
  }))
}).then(db.updateMeta.bind(db))
  .then(console.log)
  .catch(console.error)
  .then(db.closeConnection)
