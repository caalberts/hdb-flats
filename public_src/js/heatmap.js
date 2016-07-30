/* global google */
import 'whatwg-fetch'
import sortByOrder from 'lodash.sortbyorder'
import { removeChildren, capitalizeFirstLetters, getMonthYear } from './helpers.js'

const mapCenter = new google.maps.LatLng(1.352083, 103.819836)

export default class Heatmap {
  constructor (month, flat, mapDiv, container, loadingScreen) {
    this.month = month
    this.flat = flat
    this.mapDiv = mapDiv
    this.chartContainer = container
    this.loadingScreen = loadingScreen
    this.db = new window.PouchDB('hdbresale')

    this.map = new google.maps.Map(this.mapDiv, {
      center: mapCenter,
      zoom: 11,
      draggableCursor: 'pointer',
      scrollwheel: false
    })

    this.heatmap = new google.maps.visualization.HeatmapLayer({
      radius: 7
    })
    this.map.addListener('click', e => {
      const target = e.latLng
      this.listAllTransactions(target.lat(), target.lng(), this.month, this.flat)
    })
    this.heatmap.setMap(this.map)
  }

  plotHeatmap (month, flat) {
    this.db.get(month)
      .then(doc => {
        this.renderData(doc)
        if (doc.lastUpdate < window.meta.lastUpdate) {
          this.getData(month).then(dataPoints => {
            doc.dataPoints = dataPoints
            doc.lastUpdate = window.meta.lastUpdate
            this.db.put(doc)
              .then(console.log.bind(console))
              .catch(console.error.bind(console))
            this.renderData(doc)
          })
        }
      })
      .catch(() => {
        this.heatmap.setData([])
        this.loadingScreen.className = 'fa fa-spinner fa-pulse'
        this.mapDiv.classList.add('chart-loading')
        this.getData(month).then(dataPoints => {
          const doc = {
            '_id': month,
            'lastUpdate': window.meta.lastUpdate,
            'dataPoints': dataPoints
          }
          this.db.put(doc)
            .then(console.log.bind(console))
            .catch(console.error.bind(console))
          this.renderData(doc)
        })
      })
  }

  getData (month) {
    console.log('retrieving data from MongoDB')
    const url = window.location.protocol + '//' + window.location.host + '/heatmap?month=' + month
    const headers = { Accept: 'application/json' }
    return window.fetch(url, headers).then(res => res.json()).then(results => {
      let dataPoints = {}
      results.forEach(result => {
        result.dataPoints.forEach(pt => {
          pt.weight = Math.pow(pt.weight, 1.5)
        })
        dataPoints[result.flat_type] = result.dataPoints
      })
      return dataPoints
    })
  }

  renderData (dataObj) {
    if (dataObj._id !== this.month) {
      console.warn('overlapping queries')
      return
    }

    let dataPoints = []
    if (this.flat !== 'ALL') {
      dataPoints = dataObj.dataPoints[this.flat]
    } else {
      for (let flat in dataObj.dataPoints) {
        dataPoints = dataPoints.concat(dataObj.dataPoints[flat])
      }
    }
    if (dataPoints.length === 0) {
      console.warn('no data')
      return
    }

    const ticks = dataPoints.map(tick => ({
      location: new google.maps.LatLng(tick.lat, tick.lng),
      weight: tick.weight
    }))
    this.loadingScreen.className = 'fa'
    this.mapDiv.classList.remove('chart-loading')
    this.heatmap.setData(ticks)
  }

  resetMap () {
    this.map.setCenter(mapCenter)
    this.map.setZoom(11)
  }

  listAllTransactions (lat, lng, month, flat_type) {
    const url = window.location.protocol + '//' + window.location.host + '/nearby'
    window.fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({lat, lng, radius: 500})
    }).then(res => res.json()).then(json => {
      if (!json.length) {
        removeChildren(this.chartDetail)
        console.log('No result around selected location')
        return
      }

      const resID = [
        '8c00bf08-9124-479e-aeca-7cc411d884c4',
        '83b2fc37-ce8c-4df4-968b-370fd818138b'
      ]
      const resource = month < '2012-03' ? resID[0] : resID[1]
      Promise.all(json.map(street_name => {
        const filters = {street_name, month}
        if (flat_type !== 'ALL') Object.assign(filters, {flat_type})
        const dataURL = 'https://data.gov.sg/api/action/datastore_search?resource_id=' +
          resource + '&filters=' + JSON.stringify(filters)
        return window.fetch(dataURL, { Accept: 'application/json' })
          .then(data => data.json())
      }))
      .then(results => results.reduce((records, res) => {
        if (res.result && res.result.records) {
          return records.concat(res.result.records)
        } else {
          return records
        }
      }, []))
      .then(records => {
        if (!json.length) {
          removeChildren(this.chartDetail)
          console.log('No result around selected location')
          return
        }
        this.chartDetail = document.getElementById('chart-detail')
        const table = document.createElement('table')

        const tableTitle = document.createElement('h2')
        tableTitle.id = 'chart-detail-title'
        tableTitle.innerHTML =
          'Transactions Records in ' + getMonthYear(month) + ' around selected location'
        const thead = document.createElement('thead')
        const tr = document.createElement('tr')
        const headers = [
          '#',
          'Block',
          'Street Name',
          'Flat Type',
          'Storey Range',
          'Lease Commence',
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
        const tbody = document.createElement('tbody')
        tbody.setAttribute('id', 'table-body')
        sortByOrder(records, record => +record.resale_price, 'desc')
          .forEach((transaction, index) => {
            const row = document.createElement('tr')
            row.classList.add('table-striped')
            let rowData = [
              index + 1,
              transaction.block.trim(),
              capitalizeFirstLetters(transaction.street_name.trim()),
              transaction.flat_type.trim(),
              transaction.storey_range.trim().toLowerCase(),
              transaction.lease_commence_date,
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

        document.getElementById('chart-detail-title').scrollIntoView()
      })
    })
  }
}
