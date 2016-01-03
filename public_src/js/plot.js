/* global Plotly */
import 'whatwg-fetch'
import _ from 'lodash'
import { removeChildren, capitalizeFirstLetters, getMonthYear } from './helpers.js'

export default class Plot {
  constructor (town, type, plotDiv, container) {
    this.town = town
    this.chartType = type
    this.plotDiv = plotDiv
    this.chartContainer = container
    this.db = new window.PouchDB('hdbresale')
    this.layout = {
      hovermode: 'closest',
      autosize: true,
      height: 500,
      margin: {
        l: 50,
        r: 20,
        t: 50,
        b: 50,
        pad: 10
      }
    }
    if (window.matchMedia('(max-width: 900px)').matches) {
      this.layout.width = 500
      this.layout.legend = {
        x: 0.08,
        y: 0.92,
        xanchor: 'left',
        yanchor: 'top'
      }
    } else {
      this.layout.width = 700
      this.layout.legend = {
        y: 0.5,
        yanchor: 'middle'
      }
    }
  }

  plotChart (town) {
    this.db.get(town)
      .then(doc => {
        this.renderData(doc)
        if (doc.lastUpdate < window.meta.lastUpdate) {
          this.getData(town).then(datasets => {
            doc['Average'] = datasets[0]
            doc['Min, Max & Median'] = datasets[1]
            doc.lastUpdate = window.meta.lastUpdate
            this.db.put(doc)
              .then(console.log.bind(console))
              .catch(console.error.bind(console))
            this.renderData(doc)
          })
        }
      })
      .catch(() => {
        this.chartContainer.classList.add('loading')
        this.plotDiv.classList.add('chart-loading')
        this.getData(town).then(datasets => {
          const doc = {
            '_id': town,
            'lastUpdate': window.meta.lastUpdate,
            'Average': datasets[0],
            'Min, Max & Median': datasets[1]
          }
          this.db.put(doc)
            .then(console.log.bind(console))
            .catch(console.error.bind(console))
          this.renderData(doc)
        })
      })
  }

  getData (town) {
    console.log('retrieving data from MongoDB')
    const url = window.location.protocol + '//' + window.location.host + '/time_series?town=' + town
    const headers = { Accept: 'application/json' }
    return window.fetch(url, headers).then(res => res.json()).then(results => {
      function prepareData (chartType) {
        const datasets = []
        _.sortByOrder(results, result => result.flat_type, 'desc').forEach(result => {
          if (result.time_series.month.length > 0) {
            const dataset = {
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
      return [prepareData('Average'), prepareData('Min, Max & Median')]
    })
  }

  renderData (dataObj) {
    if (dataObj._id !== this.town) console.warn('overlapping queries')
    else {
      this.chartContainer.classList.remove('loading')
      this.plotDiv.classList.remove('chart-loading')
      Plotly.newPlot(this.plotDiv, dataObj[this.chartType], this.layout)
      this.plotDiv.on('plotly_click', click => {
        this.listAllTransactions(this.town, click.points[0].data.name, click.points[0].x)
      })
    }
  }

  listAllTransactions (town, type, date) {
    this.chartDetail = document.getElementById('chart-detail')
    const table = document.createElement('table')

    const tableTitle = document.createElement('h2')
    tableTitle.innerHTML =
      'Transactions Records for ' + capitalizeFirstLetters(type) +
      ' Flats <span>in ' + capitalizeFirstLetters(this.town) +
      ' in ' + getMonthYear(date) + '</span>'
    const thead = document.createElement('thead')
    const tr = document.createElement('tr')
    const headers = [
      '#',
      'Block',
      'Street Name',
      'Storey Range',
      'Remaining Lease (years)',
      'Floor Area (sqm)',
      'Resale Price (SGD)'
    ]

    headers.forEach(header => {
      const th = document.createElement('th')
      th.textContent = header
      tr.appendChild(th)
    })
    thead.appendChild(tr)
    table.appendChild(thead)

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

    window.fetch(dataURL, { Accept: 'application/json' }).then(data => data.json())
      .then(json => {
        const tbody = document.createElement('tbody')
        _.sortByOrder(json.result.records, record => +record.resale_price, 'desc')
          .forEach((transaction, index) => {
            const row = document.createElement('tr')
            row.classList.add('table-striped')
            let rowData = [
              index + 1,
              transaction.block.trim(),
              capitalizeFirstLetters(transaction.street_name.trim()),
              transaction.storey_range.trim().toLowerCase(),
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
        table.appendChild(tbody)

        removeChildren(this.chartDetail)

        this.chartDetail.appendChild(tableTitle)
        this.chartDetail.appendChild(table)

        window.scrollTo(0, 600)
      })
  }
}
