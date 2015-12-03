import _ from 'lodash'
import fetch from 'node-fetch'

export default function getData (town, flatType) {
  const dataURL = 'https://data.gov.sg/api/action/datastore_search?resource_id=8d2112ca-726e-4394-9b50-3cdf5404e790&q={"town": "' + town + '", "flat_type":"' + flatType + '"}'

  fetch(dataURL).then(data => data.json())
    .then(json => {
    // console.log(json)
    var records = json.result.records
    var grouped = _.groupBy(records, record => record.month)
    var result = _.reduce(grouped, (result, recs, key) => {
      var avg_price = recs.reduce((avg, rec) => avg + +rec.resale_price, 0)
      avg_price = avg_price / (recs.length || 1)
      avg_price = Math.round(avg_price)
      result.push({
        'month': key,
        'txn_count': recs.length,
        'avg_price': avg_price
      })
      return result
    }, [])
    // console.log(result)
  })
}
