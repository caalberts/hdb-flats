import fetch from 'node-fetch'
import mongoose from 'mongoose'
import last from 'lodash.last'

const Address = mongoose.model('Address', {
  street: String,
  block: String,
  postalCode: Number,
  lng: Number,
  lat: Number
})

export default function geocode (blk, street) {
  const url = 'https://maps.googleapis.com/maps/api/geocode/json?address="' +
    blk + street + ' singapore"&key=' + process.env.GOOGLEMAPS_SERVER_KEY

  fetch(url).then(res => res.json())
    .then(data => {
      if (data.status === 'OK') {
        const postalCodeArray = data.results[0].address_components.find(el => el.types.includes('postal_code'))
        const postalCode = postalCodeArray ? postalCodeArray.short_name : null

        const resolvedAddress = new Address({
          'street': street,
          'block': blk,
          'postalCode': postalCode,
          'lng': data.results[0].geometry.location.lng,
          'lat': data.results[0].geometry.location.lat
        })
        resolvedAddress.save(function (err) {
          if (err) {
            console.log('error at :', blk, street, ' ', last(data.results[0].address_components).long_name)
          }
          console.log('new address added: ', resolvedAddress)
          // return resolvedAddress
        })
      } else {
        // throw new Error(data.status)
        console.log('google status: ', data.status)
      }
    })
}
