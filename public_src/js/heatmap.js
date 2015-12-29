/* global google */
import 'whatwg-fetch'

export default class Heatmap {
  constructor (month, dataCache, plotId) {
    this.month = month
    this.dataCache = dataCache
    this.mapDiv = plotId
  }

  getData () {
    if (this.dataCache[this.month]) return Promise.resolve(this.dataCache[this.month])
    const url = window.location.protocol + '//' + window.location.host + '/heatmap?month=' + this.month
    return window.fetch(url).then(res => res.json()).then(results => {
      const dataset = []
      results.forEach(result => {
        result.dataPoints.forEach(transaction => {
          const tick = {
            location: new google.maps.LatLng(transaction.lat, transaction.lng),
            weight: Math.pow(transaction.weight, 1.5)
          }
          dataset.push(tick)
        })
      })
      this.dataCache[this.month] = dataset
      return this.dataCache[this.month]
    })
  }

  plotHeatmap () {
    this.getData().then(dataset => {
      if (dataset.length === 0) console.log('no data')
      const singapore = new google.maps.LatLng(1.352083, 103.819836)

      const map = new google.maps.Map(this.mapDiv, {
        center: singapore,
        zoom: 11
      })
      const googleHeatmap = new google.maps.visualization.HeatmapLayer({
        data: dataset,
        radius: 7
      })
      googleHeatmap.setMap(map)
    })
  }
}
