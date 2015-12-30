/* global google */
import 'whatwg-fetch'

export default class Heatmap {
  constructor (month, plotId) {
    this.month = month
    this.mapDiv = plotId

    const map = new google.maps.Map(this.mapDiv, {
      center: new google.maps.LatLng(1.352083, 103.819836),
      zoom: 11
    })

    this.heatmap = new google.maps.visualization.HeatmapLayer({
      radius: 7
    })
    this.heatmap.setMap(map)
  }

  getData () {
    let storage = JSON.parse(window.sessionStorage.getItem(this.month))
    if (storage) return Promise.resolve(storage)

    this.heatmap.setData([])
    const url = window.location.protocol + '//' + window.location.host + '/heatmap?month=' + this.month
    const headers = { Accept: 'application/json' }
    return window.fetch(url, headers).then(res => res.json()).then(results => {
      let dataset = []
      results.forEach(result => dataset = dataset.concat(result.dataPoints))
      dataset.forEach(dataPoint => dataPoint.weight = Math.pow(dataPoint.weight, 1.5))
      storage = dataset
      window.sessionStorage.setItem(this.month, JSON.stringify(storage))
      return storage
    })
  }

  plotHeatmap () {
    document.querySelector('#map').classList.add('chart-loading')
    this.getData().then(dataset => {
      if (dataset.length === 0) console.warn('no data')
      const ticks = dataset.map(tick => {
        return {
          location: new google.maps.LatLng(tick.lat, tick.lng),
          weight: tick.weight
        }
      })
      document.querySelector('.loading').classList.remove('loading')
      document.querySelector('.chart-loading').classList.remove('chart-loading')
      this.heatmap.setData(ticks)
    })
  }
}
