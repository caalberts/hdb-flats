/* global google */
import 'whatwg-fetch'

export default class Heatmap {
  constructor (type, month, plotId) {
    this.type = type
    this.month = month
    this.mapData = []
    this.mapDiv = plotId
  }

  getData () {
    const url = window.location.protocol + '//' + window.location.host + '/heatmap?flat_type=' + this.type + '&month=' + this.month

    window.fetch(url).then(res => res.json())
      .then(results => {
        results.forEach(result => {
          result.dataPoints.forEach(transaction => {
            if (!(transaction.lat === 1.352083 && transaction.lng === 103.819836)) {
              const tick = {
                location: new google.maps.LatLng(transaction.lat, transaction.lng),
                weight: Math.pow(transaction.weight, 2.5)
              }
              this.mapData.push(tick)
            }
          })
        })
        this.plotHeatmap(this.mapData)
      })
  }

  plotHeatmap () {
    if (this.mapData.length === 0) console.warn('no data')
    const singapore = new google.maps.LatLng(1.352083, 103.819836)

    const map = new google.maps.Map(this.mapDiv, {
      center: singapore,
      zoom: 11
    })
    const googleHeatmap = new google.maps.visualization.HeatmapLayer({
      data: this.mapData
    })

    googleHeatmap.setMap(map)
  }
}
