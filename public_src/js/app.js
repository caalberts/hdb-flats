import Plot from './plot.js'
import Heatmap from './heatmap.js'
import { removeChildren, capitalizeFirstLetters, getMonthYear } from './helpers.js'

window.PouchDB = require('pouchdb')

export class App {
  constructor () {
    this.chartNav = document.querySelector('.selectors')
    this.chartTitle = document.getElementById('chart-title')
    this.chartContainer = document.getElementById('chart-container')
    this.chartDetail = document.getElementById('chart-detail')
  }

  createSelections (text, ...dropdowns) {
    const navbarText = document.createElement('p')
    navbarText.classList.add('selectors-item')
    navbarText.textContent = text
    this.chartNav.appendChild(navbarText)

    const form = document.createElement('form')

    dropdowns.forEach(dropdown => {
      const selector = document.createElement('select')
      selector.setAttribute('id', dropdown.selector)
      selector.classList.add('selectors-item')
      dropdown.options.forEach(item => {
        const option = document.createElement('option')
        option.textContent = item
        if (item === dropdown.defaultOption) option.setAttribute('selected', '')
        selector.add(option)
      })
      selector.addEventListener('change', event => this.drawChart())
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

    this.plotDiv = document.createElement('div')
    this.plotDiv.setAttribute('id', 'plot-space')
    this.chartContainer.appendChild(this.plotDiv)

    this.plot = new Plot(
      this.townSelection.options[this.townSelection.selectedIndex].value,
      this.chartSelection.options[this.chartSelection.selectedIndex].value,
      this.plotDiv,
      this.chartContainer
    )

    this.drawChart()
  }

  drawForm () {
    const text = 'Choose town & chart type'
    const towns = {
      options: window.meta.townList,
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
    removeChildren(this.chartDetail)

    this.plot.town = this.townSelection.options[this.townSelection.selectedIndex].value
    this.plot.chartType = this.chartSelection.options[this.chartSelection.selectedIndex].value

    this.chartTitle.innerHTML = this.plot.chartType === 'Average'
      ? 'Historical Average of HDB Resale Prices <span>in ' + capitalizeFirstLetters(this.plot.town) + '</span>'
      : 'Range of Transacted Prices in ' + capitalizeFirstLetters(this.plot.town) + ' <span>(Min, Max & Median)</span>'

    this.plot.plotChart(this.plot.town)
  }
}

export class Maps extends App {
  constructor () {
    super()

    this.drawForm()
    this.monthSelection = document.getElementById('select-month')

    this.mapDiv = document.createElement('div')
    this.mapDiv.setAttribute('id', 'map')
    this.chartContainer.appendChild(this.mapDiv)

    this.heatmap = new Heatmap(
      this.monthSelection.options[this.monthSelection.selectedIndex].value,
      this.mapDiv,
      this.chartContainer
    )

    this.createButtons()
    this.drawChart()
  }

  createButtons () {
    this.centerMap = document.createElement('i')
    this.centerMap.setAttribute('id', 'reset-map')
    this.centerMap.className = 'fa fa-crosshairs button'
    this.chartContainer.appendChild(this.centerMap)
    this.centerMap.addEventListener('click', event => this.heatmap.resetMap())

    this.prevButton = document.createElement('button')
    this.prevButton.setAttribute('id', 'prev-month')
    this.prevButton.classList.add('button')
    this.prevButton.textContent = '<'
    this.prevButton.addEventListener('click', event => this.prevChart())
    this.chartContainer.appendChild(this.prevButton)

    this.nextButton = document.createElement('button')
    this.nextButton.setAttribute('id', 'next-month')
    this.nextButton.classList.add('button')
    this.nextButton.textContent = '>'
    this.nextButton.disabled = true
    this.nextButton.addEventListener('click', event => this.nextChart())
    this.chartContainer.appendChild(this.nextButton)
  }

  drawForm () {
    const text = 'Choose month'
    const months = {
      options: window.meta.monthList,
      selector: 'select-month',
      defaultOption: '2015-09'
    }
    this.createSelections(text, months)
  }

  drawChart () {
    this.heatmap.month = this.monthSelection.options[this.monthSelection.selectedIndex].value
    this.chartTitle.textContent = 'Property Hotspots in ' + getMonthYear(this.heatmap.month)
    this.withinMonthRange(this.monthSelection.selectedIndex)
    this.heatmap.plotHeatmap(this.heatmap.month)
  }

  prevChart () {
    this.monthSelection.selectedIndex--
    this.drawChart()
  }

  nextChart () {
    this.monthSelection.selectedIndex++
    this.drawChart()
  }

  withinMonthRange (idx) {
    this.prevButton.disabled = false
    this.nextButton.disabled = false
    if (idx === 0) this.prevButton.disabled = true
    if (idx === window.meta.monthList.length - 1) this.nextButton.disabled = true
  }
}
