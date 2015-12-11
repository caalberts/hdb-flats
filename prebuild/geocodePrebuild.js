// import geocode from '../src/util/geocode.js'
// import mongoose from 'mongoose'
import fetch from 'node-fetch'
import fs from 'fs'
import path from 'path'
import async from 'async'

// const dbUri = 'mongodb://' +
//   process.env.HDBRESALE_MONGODB_USER + ':' +
//   process.env.HDBRESALE_MONGODB_PASSWORD +
//   '@ds033087.mongolab.com:33087/hdb-resale'
//
// mongoose.connect(dbUri)

let results = []

fs.readFile(path.join(__dirname, '../R/address.json'), 'utf8', (err, data) => {
  if (err) console.error(err)
  const addresses = JSON.parse(data)
  const offset = 6000 // 0, 2000, 4000, 6000, 8000
  const total = 2000
  let slicedArray = addresses.slice(offset, offset + total)

  async.waterfall(slicedArray.map(el => {
    return function (callback) {
      setTimeout(geocode, 150, el.block, el.street_name, callback)
    }
  }), (err) => {
    if (err) console.error(err)
    fs.writeFile('addresses.json', JSON.stringify(results))
  })
})

function geocode (blk, street, callback) {
  const url = 'https://maps.googleapis.com/maps/api/geocode/json?address="' +
    blk + street + ' singapore"&key=' + process.env.GOOGLEMAPS_SERVER_KEY

  fetch(url).then(res => res.json())
    .then(data => {
      if (data.status === 'OK') {
        const postalCodeArray = data.results[0].address_components.find(el => el.types.includes('postal_code'))
        const postalCode = postalCodeArray ? postalCodeArray.short_name : null

        // const resolvedAddress = new Address({
        const resolvedAddress = {
          'street': street,
          'block': blk,
          'postalCode': postalCode,
          'lng': data.results[0].geometry.location.lng,
          'lat': data.results[0].geometry.location.lat
        }
        results.push(resolvedAddress)
        console.log(resolvedAddress)
        callback(null)
      } else {
        // throw new Error(data.status)
        console.log('google status: ', data.status)
        callback('google status: ', data.status)
      }
    })
}
