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

    const selectedMonth = this.month
    this.heatmap.setData([])
    const url = window.location.protocol + '//' + window.location.host + '/heatmap?month=' + selectedMonth
    return window.fetch(url).then(res => res.json()).then(results => {
      let dataset = []
      results.forEach(result => dataset = dataset.concat(result.dataPoints))
      dataset.forEach(dataPoint => dataPoint.weight = Math.pow(dataPoint.weight, 1.5))
      storage = dataset
      try {
        window.sessionStorage.setItem(selectedMonth, JSON.stringify(storage))
      } catch (err) {
        console.error(err)
      }
      if (selectedMonth === this.month) return storage
      else throw new Error('Overlapping queries')
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
    }).catch(console.error.bind(console))
  }
}
