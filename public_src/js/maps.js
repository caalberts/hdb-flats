/* global google */
function drawForm () {
  const types = [
    '2 Room', '3 Room', '4 Room'
  ]
  const months = ['2015-10', '2015-09']
  createDropDown(types, 'select-type')
  createDropDown(months, 'select-month')

  document.getElementById('select-type').addEventListener('change', () => drawMap())
  document.getElementById('select-month').addEventListener('change', () => drawMap())
}

function drawMap () {
  /* Data points defined as an array of LatLng objects */
  let heatmapData
  // const heatmapData = [
  //   {location: new google.maps.LatLng(1.320, 103.800), weight: 10},
  //   {location: new google.maps.LatLng(1.321, 103.800), weight: 15},
  //   {location: new google.maps.LatLng(1.322, 103.850), weight: 25},
  //   {location: new google.maps.LatLng(1.323, 103.800), weight: 12},
  //   {location: new google.maps.LatLng(1.324, 103.800), weight: 30},
  //   {location: new google.maps.LatLng(1.325, 103.730), weight: 34},
  //   {location: new google.maps.LatLng(1.326, 103.800), weight: 33},
  //   {location: new google.maps.LatLng(1.337, 103.950), weight: 20},
  //   {location: new google.maps.LatLng(1.328, 103.700), weight: 10},
  //   {location: new google.maps.LatLng(1.379, 103.800), weight: 50}
  // ]

  const typeSelection = document.getElementById('select-type')
  const type = typeSelection.options[typeSelection.selectedIndex].text

  const monthSelection = document.getElementById('select-month')
  const month = monthSelection.options[monthSelection.selectedIndex].text

  const url = window.location.protocol + '//' + window.location.host + '/heatmap?type=' + type + '&month=' + month

  window.fetch(url).then(res => res.json())
    .then(results => results.forEach(result => {
      result.data.forEach(transaction => {
        const tick = {
          location: new google.maps.LatLng(transaction.lat, transaction.lng),
          weight: transaction.weight
        }
        heatmapData.push(tick)
      })
      const singapore = new google.maps.LatLng(1.320, 103.800)

      const map = new google.maps.Map(document.getElementById('map'), {
        center: singapore,
        zoom: 11
      })
      var heatmap = new google.maps.visualization.HeatmapLayer({
        data: heatmapData,
        radius: 50
      })
      heatmap.setMap(map)
    }))
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
  drawMap()
}
