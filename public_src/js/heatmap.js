/* global google */
import 'whatwg-fetch'

const mapCenter = new google.maps.LatLng(1.352083, 103.819836)

export default class Heatmap {
  constructor (month, flat, mapDiv, container, loadingScreen) {
    this.month = month
    this.flat = flat
    this.mapDiv = mapDiv
    this.chartContainer = container
    this.loadingScreen = loadingScreen
    this.db = new window.PouchDB('hdbresale')

    this.map = new google.maps.Map(this.mapDiv, {
      center: mapCenter,
      zoom: 11
    })

    this.heatmap = new google.maps.visualization.HeatmapLayer({
      radius: 7
    })
    this.heatmap.setMap(this.map)
  }

  plotHeatmap (month, flat) {
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
        this.heatmap.setData([])
        this.loadingScreen.className = 'fa fa-spinner fa-pulse'
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
    console.log('retrieving data from MongoDB')
    const url = window.location.protocol + '//' + window.location.host + '/heatmap?month=' + month
    const headers = { Accept: 'application/json' }
    return window.fetch(url, headers).then(res => res.json()).then(results => {
      let dataPoints = {}
      for (let result of results) {
        result.dataPoints.forEach(pt => { pt.weight = Math.pow(pt.weight, 1.5) })
        dataPoints[result.flat_type] = result.dataPoints
      }
      return dataPoints
    })
  }

  renderData (dataObj) {
    if (dataObj._id !== this.month) {
      console.warn('overlapping queries')
      return
    }

    let dataPoints = []
    if (this.flat !== 'ALL') {
      dataPoints = dataObj.dataPoints[this.flat]
    } else {
      for (let flat in dataObj.dataPoints) {
        dataPoints = dataPoints.concat(dataObj.dataPoints[flat])
      }
    }
    if (dataPoints.length === 0) {
      console.warn('no data')
      return
    }

    const ticks = dataPoints.map(tick => ({
      location: new google.maps.LatLng(tick.lat, tick.lng),
      weight: tick.weight
    }))
    this.loadingScreen.className = 'fa'
    this.mapDiv.classList.remove('chart-loading')
    this.heatmap.setData(ticks)
  }

  resetMap () {
    this.map.setCenter(mapCenter)
    this.map.setZoom(11)
  }
}
