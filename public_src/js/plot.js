/* global Plotly */
import 'whatwg-fetch'
import _ from 'lodash'

export default class Plot {
  constructor (town, type, plotId, dataCache, tableId) {
    this.town = town
    this.chartType = type
    this.plotSpace = plotId
    this.dataCache = dataCache
    this.transactionsTable = tableId
    this.layout = {
      hovermode: 'closest',
      title: this.chartType + ' of HDB Resale Price in ' + this.town,
      autosize: true,
      // width: 1000,
      // height: 600,
      margin: {
        l: 50,
        r: 20,
        b: 50,
        t: 50,
        pad: 10
      }
    }
  }

  plotChart () {
    this.getChartData().then(datasets => {
      Plotly.newPlot(this.plotSpace, datasets, this.layout)
      this.plotSpace.on('plotly_click', click => {
        this.listAllTransactions(this.town, click.points[0].data.name, click.points[0].x)
      })
    })
  }

  getChartData () {
    if (this.dataCache[this.town]) return Promise.resolve(this.dataCache[this.town][this.chartType])
    const url = window.location.protocol + '//' + window.location.host + '/time_series?town=' + this.town
    return window.fetch(url).then(res => res.json()).then(results => {
      function prepareData (chartType) {
        const datasets = []
        _.sortByOrder(results, result => result.flat_type, 'desc').forEach(result => {
          if (result.time_series.month.length > 0) {
            const dataset = {
              town: result.town,
              name: result.flat_type,
              x: result.time_series.month,
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
            if (chartType === 'Average') {
              dataset.y = result.time_series.mean
              dataset.error_y.array = result.time_series.ci95
            } else {
              dataset.y = result.time_series.median
              dataset.error_y.symmetric = false
              dataset.error_y.array = result.time_series.max
              dataset.error_y.arrayminus = result.time_series.min
            }
            datasets.push(dataset)
          }
        })
        return datasets
      }
      this.dataCache[this.town] = {
        'Average': prepareData('Average'),
        'Min, Max & Median': prepareData('Min, Max & Median')
      }
      return this.dataCache[this.town][this.chartType]
    })
  }

  listAllTransactions (town, type, date) {
    const resID = [
      'a3f3ad06-5c05-4177-929f-bb9fffccebdd',
      'e119f1a2-e528-4535-adaf-2872b60dbf0a',
      '8d2112ca-726e-4394-9b50-3cdf5404e790'
    ]
    date = date.slice(0, 7)
    const resource =
      date < '2005-01' ? resID[0]
      : date < '2012-03' ? resID[1] : resID[2]
    const dataURL = 'https://data.gov.sg/api/action/datastore_search?resource_id=' + resource +
      '&q={"town":"' + town + '","flat_type":"' + type + '","month":"' + date + '"}'

    window.fetch(dataURL).then(data => data.json())
      .then(json => {
        if (document.getElementById('table-body')) document.getElementById('table-body').remove()
        const tbody = document.createElement('tbody')
        tbody.setAttribute('id', 'table-body')
        _.sortByOrder(json.result.records, record => record.resale_price, 'desc')
          .forEach((transaction, index) => {
            const row = document.createElement('tr')
            row.classList.add('table-striped')
            let rowData = [
              index + 1,
              transaction.block.trim(),
              transaction.street_name.trim(),
              transaction.storey_range.trim(),
              99 - (+transaction.month.slice(0, 4)) + (+transaction.lease_commence_date),
              transaction.floor_area_sqm,
              (+transaction.resale_price).toLocaleString()
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
}
