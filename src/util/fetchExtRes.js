import fetch from 'node-fetch'

export function fetchData () {
  const batchSize = 10000
  const resID = [
    // '8c00bf08-9124-479e-aeca-7cc411d884c4',
    '83b2fc37-ce8c-4df4-968b-370fd818138b'
  ]

  function fetchOneDataset (dataset, offset, records) {
    const fetchURL =
      'https://data.gov.sg/api/action/datastore_search?' +
      'resource_id=' + dataset + '&sort=_id&' +
      'limit=' + batchSize + '&offset=' + offset
    return fetch(fetchURL)
    .then(data => data.json())
    .then(json => {
      records = records.concat(json.result.records)
      console.log('fetchOneDataset', dataset, offset)
      if (offset + batchSize < json.result.total) return fetchOneDataset(dataset, offset + batchSize, records)
      else return records
    }).catch((err) => {
      if (err) throw err
    })
  }

  return Promise.all(resID.map(dataset => fetchOneDataset(dataset, 0, [])))
    .then(recordSet => recordSet.reduce((combined, records) => combined.concat(records), []))
}

export function geocode (block, street) {
  const url = 'https://maps.googleapis.com/maps/api/geocode/json?address="' +
    block + street + ' SINGAPORE"&key=' + process.env.GOOGLEMAPS_SERVER_KEY

  return new Promise((resolve, reject) => {
    setTimeout(resolve, 150, fetch(url)
        .then(res => res.json())
        .then(data => {
          if (data.status !== 'OK') throw new Error(data.status)
          let postalCode = data.results[0].address_components.find(el => el.types.indexOf('postal_code') > -1)
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
