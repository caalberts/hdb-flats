/* global Plottable */
import data from './data/data.json'

function plotChart () {
  const xScale = new Plottable.Scales.Time()
  const yScale = new Plottable.Scales.Linear()

  const xAxis = new Plottable.Axes.Time(xScale, 'bottom')
  const yAxis = new Plottable.Axes.Numeric(yScale, 'left')

  const plot = new Plottable.Plots.Line()

  plot.x(function (d) {
    console.log(Date.parse(d.month))
    return Date.parse(d.month)
  }, xScale)
  plot.y(function (d) {
    return d.avg_price
  }, yScale)

  const dataUrl = window.location.protocol + '//' + window.location.host + '/flats?town=Clementi&type=3 room'

  window.fetch(dataUrl).then(data => data.json())
    .then(result => {
      const dataset = new Plottable.Dataset(result.data)

      plot.addDataset(dataset)

      const chart = new Plottable.Components.Table([
        [yAxis, plot],
        [null, xAxis]
      ])

      chart.renderTo('svg#plot')
    })
}

window.onload = plotChart()
