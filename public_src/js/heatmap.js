/* global google */
import 'whatwg-fetch'

export default class Heatmap {
  constructor (month, mapDiv, container) {
    this.month = month
    this.mapDiv = mapDiv
    this.chartContainer = container
    this.db = new window.PouchDB('hdbresale')

    const map = new google.maps.Map(this.mapDiv, {
      center: new google.maps.LatLng(1.352083, 103.819836),
      zoom: 11
    })

    this.heatmap = new google.maps.visualization.HeatmapLayer({
      radius: 7
    })
    this.heatmap.setMap(map)
  }

  plotHeatmap (month) {
    this.db.get(month)
      .then(doc => {
        this.renderData(doc)
        if (doc.lastUpdate < window.meta.lastUpdate) {
          this.getData(month).then(dataPoints => {
            doc.dataPoints = dataPoints
            doc.lastUpdate = window.meta.lastUpdate
            this.db.put(doc)
              .then(console.log.bind(console))
              .catch(console.error.bind(console))
            this.renderData(doc)
          })
        }
      })
      .catch(() => {
        this.chartContainer.classList.add('loading')
        this.mapDiv.classList.add('chart-loading')
        this.getData(month).then(dataPoints => {
          const doc = {
            '_id': month,
            'lastUpdate': window.meta.lastUpdate,
            'dataPoints': dataPoints
          }
          this.db.put(doc)
            .then(console.log.bind(console))
            .catch(console.error.bind(console))
          this.renderData(doc)
        })
      })
  }

  getData (month) {
    this.heatmap.setData([])
    console.log('retrieving data from MongoDB')
    const url = window.location.protocol + '//' + window.location.host + '/heatmap?month=' + month
    const headers = { Accept: 'application/json' }
    return window.fetch(url, headers).then(res => res.json()).then(results => {
      let dataPoints = []
      results.forEach(result => dataPoints = dataPoints.concat(result.dataPoints))
      dataPoints.forEach(dataPoint => dataPoint.weight = Math.pow(dataPoint.weight, 1.5))
      return dataPoints
    })
  }

  renderData (dataObj) {
    if (dataObj._id !== this.month) console.warn('overlapping queries')
    else if (dataObj.dataPoints.length === 0) console.warn('no data')
    else {
      const ticks = dataObj.dataPoints.map(tick => {
        return {
          location: new google.maps.LatLng(tick.lat, tick.lng),
          weight: tick.weight
        }
      })
      this.chartContainer.classList.remove('loading')
      this.mapDiv.classList.remove('chart-loading')
      this.heatmap.setData(ticks)
    }
  }
}
