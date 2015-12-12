/* global Plotly */
import 'whatwg-fetch'
import createDropDown from './createDropDown'

function drawForm () {
  const towns = [
    'Ang Mo Kio', 'Bedok', 'Bishan', 'Bukit Batok', 'Bukit Merah',
    'Bukit Panjang', 'Bukit Timah', 'Central Area', 'Choa Chu Kang',
    'Clementi', 'Geylang', 'Hougang', 'Jurong East', 'Jurong West',
    'Kallang/Whampoa', 'Marine Parade', 'Pasir Ris', 'Punggol',
    'Queenstown', 'Sembawang', 'Sengkang', 'Serangoon', 'Tampines',
    'Toa Payoh', 'Woodlands', 'Yishun'
  ]
  const charts = ['Average', 'Min, Max, Median']
  createDropDown(towns, 'select-town', 'Ang Mo Kio')
  createDropDown(charts, 'select-chart', 'Average')

  document.getElementById('select-town').addEventListener('change', () => plotChart())
  document.getElementById('select-chart').addEventListener('change', () => plotChart())
}

function plotChart () {
  const townSelection = document.getElementById('select-town')
  const town = townSelection.options[townSelection.selectedIndex].text

  const chartSelection = document.getElementById('select-chart')
  const chart = chartSelection.options[chartSelection.selectedIndex].text

  const plotSpace = document.getElementById('plot-space')

  const url = window.location.protocol + '//' + window.location.host + '/towns?town=' + town

  window.fetch(url).then(res => res.json())
    .then(result => {
      let data = []
      result.forEach(flatType => {
        if (flatType.time_series.mean.length > 0) {
          const dataset = {
            name: flatType.flat_type,
            x: flatType.time_series.month,
            error_y: {
              type: 'data',
              visible: true,
              thickness: 1,
              width: 0
            },
            type: 'scatter',
            mode: 'markers',
            marker: {
              size: 3
            }
          }
          if (chart === 'Min, Max, Median') {
            dataset.y = flatType.time_series.median
            dataset.error_y.symmetric = false
            dataset.error_y.array = flatType.time_series.max
            dataset.error_y.arrayminus = flatType.time_series.min
            console.log(dataset.error_y)
          } else {
            dataset.y = flatType.time_series.mean
            dataset.error_y.array = flatType.time_series.ci95
          }
          data.push(dataset)
        }
      })

      const layout = {
        hovermode: 'closest',
        title: chart + ' of HDB Resale Price in ' + town,
        autosize: true,
        // width: 1000,
        // height: 600,
        margin: {
          l: 50,
          r: 20,
          b: 50,
          t: 50,
          pad: 10
        },
        yaxis: {
          rangemode: 'tozero'
        }
      }
      Plotly.newPlot(plotSpace, data, layout)

      plotSpace.on('plotly_click', click => {
        listAllTransactions(town, click.points[0].data.name, click.points[0].x)
      })
    })
}

function listAllTransactions (town, type, date) {
  const resID = [
    'a3f3ad06-5c05-4177-929f-bb9fffccebdd',
    'e119f1a2-e528-4535-adaf-2872b60dbf0a',
    '8d2112ca-726e-4394-9b50-3cdf5404e790'
  ]
  const resource = (Date.parse(date) < new Date('2005-01-01')) ? resID[0] : (Date.parse(date) < new Date('2012-03-01')) ? resID[1] : resID[2]
  console.log(resource)
  const dataURL = 'https://data.gov.sg/api/action/datastore_search?resource_id=' + resource + '&q={"town": "' + town + '", "flat_type":"' + type + '", "month":"' + date.slice(0, 7) + '"}'

  window.fetch(dataURL).then(data => data.json())
    .then(json => {
      if (document.getElementById('table-body')) document.getElementById('table-body').remove()
      const tbody = document.createElement('tbody')
      tbody.setAttribute('id', 'table-body')
      json.result.records.forEach((transaction, index) => {
        const row = document.createElement('tr')
        row.classList.add('table-striped')
        let rowData = [
          index + 1,
          transaction.block.trim(),
          transaction.street_name.trim(),
          transaction.storey_range.trim(),
          transaction.floor_area_sqm,
          transaction.resale_price
        ]
        rowData.map(data => {
          const td = document.createElement('td')
          td.textContent = data
          return td
        }).forEach(td => row.appendChild(td))
        tbody.appendChild(row)
      })
      document.getElementById('transactions-table').appendChild(tbody)
    })
}

window.onload = function () {
  drawForm()
  plotChart()
}
