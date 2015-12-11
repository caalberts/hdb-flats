/* global Plotly */
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
  createDropDown(towns, 'select-town')
  createDropDown(charts, 'select-chart')

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
        autosize: false,
        width: 1000,
        height: 500,
        margin: {
          l: 50,
          r: 50,
          b: 100,
          t: 100,
          pad: 4
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

function createDropDown (list, selector) {
  list.forEach(item => {
    const option = document.createElement('option')
    option.textContent = item
    document.getElementById(selector).appendChild(option)
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
  console.log(dataURL)
  window.fetch(dataURL).then(data => data.json())
    .then(json => {
      if (document.getElementById('transactions-ul')) document.getElementById('ul').remove()
      const ul = document.createElement('ul')
      ul.setAttribute('id', 'transactions-ul')
      json.result.records.forEach(transaction => {
        console.log(transaction)
        const li = document.createElement('li')
        li.textContent = transaction.town.trim() + ' ' + transaction.flat_type.trim() + ' ' + transaction.month + ' $' + transaction.resale_price
        ul.appendChild(li)
      })
      document.getElementById('transactions-list').appendChild(ul)
    })
}

window.onload = function () {
  drawForm()
  plotChart()
}
