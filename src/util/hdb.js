import _ from 'lodash'

export default function getData (town, flatType) {
  fetch(/* data.gov.sg */).then((err, data) => {
    if (err) throw err
    data = JSON.parse(data)
    var records = data.result.records
    var grouped = _.groupBy(records, record => record.month)
    var result = _.reduce(grouped, (result, recs, key) => {
      let avg_price = recs.reduce((avg, rec) => avg + +rec.resale_price, 0)
      avg_price = avg_price / (recs.length || 1)
      avg_price = Math.round(avg_price)
      result.push({
        'month': key,
        'txn_count': recs.length,
        'avg_price': avg_price
      })
      return result
    }, [])
    console.log(result)
  })
}

// fs.readFile('./sampleResaleData.json', 'utf-8', function (err, data) {
//   if (err) throw err;
//   data = JSON.parse(data);
//   var records = data.result.records;
//   var grouped = _.groupBy(records, record => record.month);
//   var result = _.reduce(grouped, (result, recs, key) => {
//     let avg_price = recs.reduce((avg, rec) => avg + +rec.resale_price, 0);
//     avg_price = avg_price / (recs.length || 1);
//     avg_price = Math.round(avg_price);
//     result.push({
//       'month': key,
//       'txn_count': recs.length,
//       'avg_price': avg_price
//     });
//     return result;
//   }, []);
