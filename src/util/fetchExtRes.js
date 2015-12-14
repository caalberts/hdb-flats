import fetch from 'node-fetch'

let records = []
const batchSize = 10000
const resID = [
  'a3f3ad06-5c05-4177-929f-bb9fffccebdd',
  'e119f1a2-e528-4535-adaf-2872b60dbf0a',
  '8d2112ca-726e-4394-9b50-3cdf5404e790'
]

export function fetchData (dataset, offset) {
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

export function geocode (block, street) {
  const url = 'https://maps.googleapis.com/maps/api/geocode/json?address="' +
    block + street + ' SINGAPORE"&key=' + process.env.GOOGLEMAPS_SERVER_KEY

  return new Promise((resolve, reject) => {
    setTimeout(resolve, 150, fetch(url)
        .then(res => res.json())
        .then(data => {
          if (data.status !== 'OK') throw new Error(data.status)
          let postalCode = data.results[0].address_components.find(el => el.types.includes('postal_code'))
          let lng = data.results[0].geometry.location.lng
          let lat = data.results[0].geometry.location.lat
          postalCode = postalCode ? postalCode.short_name : null
          lng = lng === 103.819836 ? null : lng
          lat = lat === 1.352083 ? null : lat
          return {
            'street': street,
            'block': block,
            'postalCode': postalCode,
            'lng': lng,
            'lat': lat
          }
        })
    )
  })
}
