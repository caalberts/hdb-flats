import _ from 'lodash'

var data1 = require('../data/addresses0000.json')
var data2 = require('../data/addresses2000.json')
var data3 = require('../data/addresses4000.json')
var data4 = require('../data/addresses6000.json')
var data5 = require('../data/addresses8000.json')

const addresses = Array.concat(data1, data2, data3, data4, data5)

let summaryLng = []
addresses.forEach(address => {
  summaryLng[address.lng] = summaryLng[address.lng] ? summaryLng[address.lng] + 1 : 1
})
summaryLng = Object.keys(summaryLng).map(key => {
  return {
    'lng': key,
    'freq': summaryLng[key]
  }
})

let summaryLat = []
addresses.forEach(address => {
  summaryLat[address.lat] = summaryLat[address.lat] ? summaryLat[address.lat] + 1 : 1
})
summaryLat = Object.keys(summaryLat).map(key => {
  return {
    'lat': key,
    'freq': summaryLat[key]
  }
})

const highFreqLng = _.last(_.sortBy(summaryLng, el => el.freq))
const highFreqLat = _.last(_.sortBy(summaryLat, el => el.freq))

// console.log(addresses.length)
// console.log(Object.keys(summary).length)
// console.log(_.sortBy(summary2, el => el.freq))
// console.log(summary)
// console.log(_.filter(addresses, address => address.lng === 103.819836))
console.log('highFreqLat', highFreqLat)
console.log('highFreqLng', highFreqLng)

console.log(_.filter(addresses, address => {
  return (address.lng === 103.819836 && address.lat === 1.352083)
}))
console.log(_.filter(addresses, address => address.postalCode === null).length)
