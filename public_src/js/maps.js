/* global google */
import { list as months } from './months'

function drawForm () {
  const types = [
    '1 Room', '2 Room', '3 Room', '4 Room',
    '5 Room', 'Executive', 'Multi-Generation'
  ]
  months.reverse()
  createDropDown(types, 'select-type')
  createDropDown(months, 'select-month')

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
  console.log('fetch ', url)
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
  const singapore = new google.maps.LatLng(1.320, 103.800)

  const map = new google.maps.Map(document.getElementById('map'), {
    center: singapore,
    zoom: 11
  })
  const heatmap = new google.maps.visualization.HeatmapLayer({
    data: locations,
    // dissipating: true,
    radius: 15
  })
  heatmap.setMap(map)
}

function createDropDown (list, selector) {
  list.forEach(item => {
    const option = document.createElement('option')
    option.textContent = item
    document.getElementById(selector).appendChild(option)
  })
}

window.onload = function () {
  drawForm()
  getData()
}
