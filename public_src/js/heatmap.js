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

    const url = window.location.protocol + '//' + window.location.host + '/heatmap?month=' + this.month
    return window.fetch(url).then(res => res.json()).then(results => {
      const dataset = []
      results.forEach(result => {
        result.dataPoints.forEach(transaction => {
          const tick = {
            lat: transaction.lat,
            lng: transaction.lng,
            weight: Math.pow(transaction.weight, 1.5)
          }
          dataset.push(tick)
        })
      })
      storage = dataset
      window.sessionStorage.setItem(this.month, JSON.stringify(storage))
      return storage
    })
  }

  plotHeatmap () {
    this.getData().then(dataset => {
      if (dataset.length === 0) console.warn('no data')
      const ticks = dataset.map(tick => {
        return {
          location: new google.maps.LatLng(tick.lat, tick.lng),
          weight: tick.weight
        }
      })

      this.heatmap.setData(ticks)
    })
  }
}
