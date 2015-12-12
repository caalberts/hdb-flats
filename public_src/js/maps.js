/* global google */
import range from 'lodash.range'
import padLeft from 'lodash.padleft'
import createDropDown from './createDropDown'

function drawForm () {
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

  document.getElementById('select-type').addEventListener('change', () => getData())
  document.getElementById('select-month').addEventListener('change', () => getData())
}

function getData () {
  /* Data points defined as an array of LatLng objects */
  let mapData = []
  const typeSelection = document.getElementById('select-type')
  const type = typeSelection.options[typeSelection.selectedIndex].text

  const monthSelection = document.getElementById('select-month')
  const month = monthSelection.options[monthSelection.selectedIndex].text

  const url = window.location.protocol + '//' + window.location.host + '/heatmap?type=' + type + '&month=' + month

  console.log('fetch', url)
  window.fetch(url).then(res => res.json())
    .then(results => {
      results.forEach(result => {
        result.dataPoints.forEach(transaction => {
          if (!(transaction.lat === 1.352083 && transaction.lng === 103.819836)) {
            const tick = {
              location: new google.maps.LatLng(transaction.lat, transaction.lng),
              weight: transaction.weight
            }
            mapData.push(tick)
          }
        })
      })
      drawHeatmap(mapData)
    })
}

function drawHeatmap (locations) {
  if (locations.length === 0) console.log('no data')
  const singapore = new google.maps.LatLng(1.352083, 103.819836)

  const map = new google.maps.Map(document.getElementById('map'), {
    center: singapore,
    zoom: 11
  })
  const heatmap = new google.maps.visualization.HeatmapLayer({
    data: locations,
    radius: 15
  })
  heatmap.setMap(map)
}

window.onload = function () {
  drawForm()
  getData()
}
