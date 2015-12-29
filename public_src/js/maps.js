/* global google */
import 'whatwg-fetch'
import createDropDown from './createDropDown'

const dataCache = {}

class App {
  constructor () {
    this.loadingScreen = document.getElementById('loading-screen')
    this.typeSelector = document.getElementById('select-type')
    this.monthSelector = document.getElementById('select-month')
    this.mapDiv = document.getElementById('map')
  }

  build () {
    const url = window.location.protocol + '//' + window.location.host + '/list'
    window.fetch(url).then(res => res.json()).then(meta => {
      dataCache['flatList'] = meta.flatList
      dataCache['monthList'] = meta.monthList.reverse()
      this.drawForm()
      this.drawHeatmap()
      this.loadingScreen.style.display = 'none'
      this.mapDiv.parentElement.style.display = 'flex'
    })
  }

  drawForm () {
    createDropDown(dataCache.monthList, 'select-month', '2015-07')
    this.monthSelector.addEventListener('change', () => this.drawHeatmap())
  }

  drawHeatmap () {
    const heatmap = new Heatmap(
      this.monthSelector.options[this.monthSelector.selectedIndex].value
    )
    heatmap.plotHeatmap()
  }
}

class Heatmap {
  constructor (month) {
    this.month = month
  }

  getData () {
    if (dataCache[this.month]) return Promise.resolve(dataCache[this.month])
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
      dataCache[this.month] = dataset
      return dataCache[this.month]
    })
  }

  plotHeatmap () {
    this.getData().then(dataset => {
      if (dataset.length === 0) console.log('no data')
      const singapore = new google.maps.LatLng(1.352083, 103.819836)

      const map = new google.maps.Map(document.getElementById('map'), {
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

window.onload = function () {
  const app = new App()
  app.build()
}
