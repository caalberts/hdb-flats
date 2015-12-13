/* global Plotly */
import 'whatwg-fetch'
import createDropDown from './createDropDown'

class Chart {
  constructor () {
    this.plotSpace = document.getElementById('plot-space')
    this.townSelection = document.getElementById('select-town')
    this.chartSelection = document.getElementById('select-chart')
    this.transactionsTable = document.getElementById('transactions-table')
    this.dataSeries = []
  }

  drawForm () {
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

    this.townSelection.addEventListener('change', () => this.replotChart())
    this.chartSelection.addEventListener('change', () => this.replotChart())
  }

  plotChart () {
    const town = this.townSelection.options[this.townSelection.selectedIndex].text
    const chartType = this.chartSelection.options[this.chartSelection.selectedIndex].text

    const layout = {
      hovermode: 'closest',
      title: chartType + ' of HDB Resale Price in ' + town,
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

    this.getChartData(town, chartType).then(() => {
      Plotly.newPlot(this.plotSpace, this.dataSeries, layout)
      this.plotSpace.on('plotly_click', click => {
        console.log('click')
        this.listAllTransactions(town, click.points[0].data.name, click.points[0].x)
      })
    })
  }

  getChartData (town, chartType) {
    const url = window.location.protocol + '//' + window.location.host + '/towns?town=' + town

    return window.fetch(url).then(res => res.json())
      .then(result => {
        result.forEach(flatType => {
          if (flatType.time_series.mean.length > 0) {
            const dataPoint = {
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
            if (chartType === 'Min, Max, Median') {
              dataPoint.y = flatType.time_series.median
              dataPoint.error_y.symmetric = false
              dataPoint.error_y.array = flatType.time_series.max
              dataPoint.error_y.arrayminus = flatType.time_series.min
            } else {
              dataPoint.y = flatType.time_series.mean
              dataPoint.error_y.array = flatType.time_series.ci95
            }
            this.dataSeries.push(dataPoint)
          }
        })
      })
  }

  listAllTransactions (town, type, date) {
    const resID = [
      'a3f3ad06-5c05-4177-929f-bb9fffccebdd',
      'e119f1a2-e528-4535-adaf-2872b60dbf0a',
      '8d2112ca-726e-4394-9b50-3cdf5404e790'
    ]
    const resource = (Date.parse(date) < new Date('2005-01-01')) ? resID[0] : (Date.parse(date) < new Date('2012-03-01')) ? resID[1] : resID[2]
    const dataURL = 'https://data.gov.sg/api/action/datastore_search?resource_id=' + resource + '&q={"town":"' + town + '","flat_type":"' + type + '","month":"' + date.slice(0, 7) + '"}'
    console.log('fetch from ', dataURL)
    window.fetch(dataURL).then(data => data.json())
      .then(json => {
        console.log(json)
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
        this.transactionsTable.appendChild(tbody)
      })
  }

  replotChart () {
    this.dataSeries = []
    if (this.plotSpace.firstChild) this.plotSpace.firstChild.remove()
    if (document.getElementById('table-body')) document.getElementById('table-body').remove()
    this.plotChart()
  }
}

window.onload = function () {
  const chart = new Chart()
  chart.drawForm()
  chart.plotChart()
}
