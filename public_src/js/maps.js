/* global google */
import 'whatwg-fetch'
import range from 'lodash.range'
import padLeft from 'lodash.padleft'
import createDropDown from './createDropDown'

class App {
  constructor () {
    this.typeSelection = document.getElementById('select-type')
    this.monthSelection = document.getElementById('select-month')
    this.mapDiv = document.getElementById('map')
  }

  drawForm () {
    const types = [
      '1 Room', '2 Room', '3 Room', '4 Room',
      '5 Room', 'Executive', 'Multi-Generation'
    ]
    const monthsList = range(2001, 2016).map(year => {
      return range(1, 13).map(month => {
        return year.toString() + '-' + padLeft(month.toString(), 2, '0')
      })
    })
    const months = monthsList.reduce((a, b) => a.concat(b)).reverse()

    createDropDown(types, 'select-type', '3 Room')
    createDropDown(months, 'select-month', '2015-09')

    this.typeSelection.addEventListener('change', () => this.drawHeatmap())
    this.monthSelection.addEventListener('change', () => this.drawHeatmap())
  }

  drawHeatmap () {
    const heatmap = new Heatmap(
      this.typeSelection.options[this.typeSelection.selectedIndex].text,
      this.monthSelection.options[this.monthSelection.selectedIndex].text,
      this.mapDiv
    )
    heatmap.getData()
  }
}

class Heatmap {
  constructor (type, month, plotId) {
    this.type = type
    this.month = month
    this.mapData = []
  }

  getData () {
    const url = window.location.protocol + '//' + window.location.host + '/heatmap?type=' + this.type + '&month=' + this.month

    window.fetch(url).then(res => res.json())
      .then(results => {
        results.forEach(result => {
          result.dataPoints.forEach(transaction => {
            if (!(transaction.lat === 1.352083 && transaction.lng === 103.819836)) {
              const tick = {
                location: new google.maps.LatLng(transaction.lat, transaction.lng),
                weight: transaction.weight
              }
              this.mapData.push(tick)
            }
          })
        })
        this.plotHeatmap(this.mapData)
      })
  }

  plotHeatmap (locations) {
    if (locations.length === 0) console.log('no data')
    const singapore = new google.maps.LatLng(1.352083, 103.819836)

    const map = new google.maps.Map(document.getElementById('map'), {
      center: singapore,
      zoom: 11
    })
    const googleHeatmap = new google.maps.visualization.HeatmapLayer({
      data: locations
    })
    googleHeatmap.setMap(map)
  }
}

window.onload = function () {
  const app = new App()
  app.drawForm()
  app.drawHeatmap()
}
