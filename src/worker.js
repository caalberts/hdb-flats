var CronJob = require('cron').CronJob
var fetch = require('node-fetch').fetch
const accessKey = 'daburu'
const serverURL = 'localhost:8080/updateDB?key=' + accessKey

var job = new CronJob('0 0 0 * * * 0', function () {
  fetch(serverURL).then(res => {
    if (res.status === 500) setTimeout(fetch, 3600000, serverURL)
  })
})
job.start()
