import Plot from './plot.js'
import Heatmap from './heatmap.js'

export class App {
  constructor () {
    this.chartNav = document.querySelector('.navbar-right')
    this.chartTitle = document.querySelector('.chart-title')
    this.chartContainer = document.getElementById('chart-container')
    this.chartDetail = document.getElementById('chart-detail')
    this.loadingScreen = document.getElementById('loading-screen')
    this.dataCache = JSON.parse(window.sessionStorage.getItem('meta'))
  }

  static getMeta () {
    const url = window.location.protocol + '//' + window.location.host + '/list'
    return window.fetch(url).then(res => res.json()).then(meta => {
      window.sessionStorage.setItem('meta', JSON.stringify({
        townList: meta.townList,
        flatList: meta.flatList,
        monthList: meta.monthList
      }))
    })
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

    this.drawChart()
  }

  drawForm () {
    const text = 'Choose the town and data you wish to see'
    const towns = {
      options: this.dataCache.townList,
      selector: 'select-town',
      defaultOption: 'Ang Mo Kio'
    }
    const charts = {
      options: ['Average', 'Min, Max & Median'],
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

    this.plot = new Plot(
      this.townSelection.options[this.townSelection.selectedIndex].text,
      this.chartSelection.options[this.chartSelection.selectedIndex].text,
      plotSpace
    )
    this.chartTitle.textContent =
      this.plot.chartType +
      ' of HDB Resale Price in ' +
      this.plot.town

    this.plot.plotChart()
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

    this.initMap()
  }

  drawForm () {
    const text = 'Choose the month'
    const months = {
      options: this.dataCache.monthList,
      selector: 'select-month',
      defaultOption: '2015-09'
    }
    this.createSelections(text, months)
  }

  initMap () {
    this.heatmap = new Heatmap(
      this.monthSelection.options[this.monthSelection.selectedIndex].text,
      this.mapDiv
    )
    this.drawChart()
  }

  drawChart () {
    this.heatmap.month = this.monthSelection.options[this.monthSelection.selectedIndex].text
    this.chartTitle.textContent = 'Hottest areas in the month of ' + this.heatmap.month
    this.heatmap.plotHeatmap()
  }
}
