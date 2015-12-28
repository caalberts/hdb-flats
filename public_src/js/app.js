import Plot from './plot.js'
import Heatmap from './heatmap.js'
import range from 'lodash.range'
import padLeft from 'lodash.padleft'

class App {
  constructor () {
    this.chartNav = document.querySelector('.navbar-right')
    this.chartContainer = document.getElementById('chart-container')
    this.chartDetail = document.getElementById('chart-detail')
  }

  createSelections (text, ...dropdowns) {
    const navbarText = document.createElement('p')
    navbarText.classList.add('navbar-text')
    navbarText.textContent = text
    this.chartNav.appendChild(navbarText)

    const form = document.createElement('form')
    form.className = 'navbar-form form-inline'

    dropdowns.forEach(dropdown => {
      const selector = document.createElement('select')
      selector.setAttribute('id', dropdown.selector)
      selector.className = 'form-control'
      dropdown.options.forEach(item => {
        const option = document.createElement('option')
        option.textContent = item
        if (item === dropdown.defaultOption) option.setAttribute('selected', '')
        selector.appendChild(option)
      })
      selector.addEventListener('change', () => this.drawChart())
      form.appendChild(selector)
    })
    this.chartNav.appendChild(form)
  }
}

export class TimeSeries extends App {
  constructor () {
    super()
    this.drawForm()

    this.townSelection = document.getElementById('select-town')
    this.chartSelection = document.getElementById('select-chart')

    const table = document.createElement('table')
    table.className = 'table table-striped'
    table.setAttribute('id', 'transactions-table')

    const thead = document.createElement('thead')
    const tr = document.createElement('tr')
    const headers = ['#', 'Block', 'Street Name', 'Storey Range', 'Floor Area(sqm)', 'Resale Price (SGD)']
    headers.forEach(header => {
      const th = document.createElement('th')
      th.textContent = header
      tr.appendChild(th)
    })
    thead.appendChild(tr)
    table.appendChild(thead)
    this.chartDetail.appendChild(table)

    this.transactionsTable = document.getElementById('transactions-table')
  }

  drawForm () {
    const text = 'Choose the town and data you wish to see'
    const towns = {
      options: [
        'Ang Mo Kio', 'Bedok', 'Bishan', 'Bukit Batok', 'Bukit Merah',
        'Bukit Panjang', 'Bukit Timah', 'Central Area', 'Choa Chu Kang',
        'Clementi', 'Geylang', 'Hougang', 'Jurong East', 'Jurong West',
        'Kallang/Whampoa', 'Marine Parade', 'Pasir Ris', 'Punggol',
        'Queenstown', 'Sembawang', 'Sengkang', 'Serangoon', 'Tampines',
        'Toa Payoh', 'Woodlands', 'Yishun'
      ],
      selector: 'select-town',
      defaultOption: 'Ang Mo Kio'
    }

    const charts = {
      options: ['Average', 'Min, Max, Median'],
      selector: 'select-chart',
      defaultOption: 'Average'
    }
    this.createSelections(text, towns, charts)
  }

  drawChart () {
    if (this.chartContainer.firstChild) this.chartContainer.firstChild.remove()

    if (document.getElementById('table-body')) document.getElementById('table-body').remove()

    const plotSpace = document.createElement('div')
    plotSpace.setAttribute('id', 'plot-space')
    this.chartContainer.appendChild(plotSpace)

    const plot = new Plot(
      this.townSelection.options[this.townSelection.selectedIndex].text,
      this.chartSelection.options[this.chartSelection.selectedIndex].text,
      plotSpace,
      this.transactionsTable
    )
    plot.plotChart()
  }
}

export class Maps extends App {
  constructor () {
    super()
    this.drawForm()

    this.typeSelection = document.getElementById('select-type')
    this.monthSelection = document.getElementById('select-month')

    this.mapDiv = document.createElement('div')
    this.mapDiv.setAttribute('id', 'map')
    this.chartContainer.appendChild(this.mapDiv)
  }

  drawForm () {
    const text = 'Choose the flat type and month'
    const types = {
      options: [
        '1 Room', '2 Room', '3 Room', '4 Room',
        '5 Room', 'Executive', 'Multi-Generation'
      ],
      selector: 'select-type',
      defaultOption: '3 Room'
    }
    const monthsList = range(2001, 2016).map(year => {
      return range(1, 13).map(month => {
        return year.toString() + '-' + padLeft(month.toString(), 2, '0')
      })
    })
    const months = {
      options: monthsList.reduce((a, b) => a.concat(b)).reverse(),
      selector: 'select-month',
      defaultOption: '2015-09'
    }

    this.createSelections(text, types, months)
  }

  drawChart () {
    const heatmap = new Heatmap(
      this.typeSelection.options[this.typeSelection.selectedIndex].text,
      this.monthSelection.options[this.monthSelection.selectedIndex].text,
      this.mapDiv
    )
    heatmap.getData()
  }
}
