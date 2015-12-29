const CronJob = require('cron').CronJob
const fetch = require('node-fetch')
const accessKey = 'daburu'
const serverURL = 'http://localhost:8080/updateDB?key=' + accessKey

var job = new CronJob('0 38 23 * * *', triggerUpdate)
job.start()

function triggerUpdate () {
  console.log('Ping')
  fetch(serverURL).then(res => {
    if (res.status === 202) {
      console.log('Starting DB update')
      setTimeout(triggerUpdate, 7000)
    } else if (res.status === 204) {
      console.log('Update in progress')
      setTimeout(triggerUpdate, 7000)
    } else if (res.status === 200) {
      console.log('Completed DB update')
    } else if (res.status === 500) {
      throw new Error('500 Internal Server Error')
    }
  }).catch(err => {
    console.error(err)
    console.log('Update fail. Trying again in 2 hr')
    setTimeout(triggerUpdate, 7200000)
  })
}
