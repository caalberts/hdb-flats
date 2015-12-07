/* global Plottable */
import groupBy from 'lodash.groupby'

function drawForm () {
  const towns = [
    'Ang Mo Kio', 'Bedok', 'Bishan', 'Bukit Batok', 'Bukit Merah',
    'Bukit Panjang', 'Bukit Timah', 'Central Area', 'Choa Chu Kang',
    'Clementi', 'Geylang', 'Hougang', 'Jurong East', 'Jurong West',
    'Kallang/Whampoa', 'Marine Parade', 'Pasir Ris', 'Punggol',
    'Queenstown', 'Sembawang', 'Sengkang', 'Serangoon', 'Tampines',
    'Toa Payoh', 'Woodlands', 'Yishun'
  ]
  const submitBtn = document.createElement('button')
  const selection = document.getElementById('select-town')
  towns.forEach(town => {
    const option = document.createElement('option')
    option.textContent = town
    selection.appendChild(option)
  })
  submitBtn.setAttribute('value', 'Submit')
  submitBtn.setAttribute('type', 'button')
  submitBtn.textContent = 'Submit'
  submitBtn.addEventListener('click', () => {
    resetChart()
    const selection = document.getElementById('select-town')
    const select = selection.options[selection.selectedIndex].text
    plotChart(select)
  })
  document.getElementById('plot-form').appendChild(submitBtn)
}

function plotChart (town) {
  const xScale = new Plottable.Scales.Time()
  const yScale = new Plottable.Scales.Linear()
  const colorScale = new Plottable.Scales.Color()

  const xAxis = new Plottable.Axes.Time(xScale, 'bottom')
  const yAxis = new Plottable.Axes.Numeric(yScale, 'left')

  const xLabel = new Plottable.Components.AxisLabel('Year')
  const yLabel = new Plottable.Components.AxisLabel('Average Price')

  const legend = new Plottable.Components.Legend(colorScale).maxEntriesPerRow(6)
  legend.xAlignment('center')
  const plot = new Plottable.Plots.Line()
  const panZoom = new Plottable.Interactions.PanZoom(xScale, null)
  panZoom.attachTo(plot)

  plot.x(function (d) {
    return Date.parse(d.month)
  }, xScale)
  plot.y(function (d) {
    return d.avg_price
  }, yScale)
  plot.attr('stroke', function (d, i, dataset) { return dataset.metadata().name }, colorScale)
  plot.interpolator('basis')

  const chart = new Plottable.Components.Table([
    [null, null, legend],
    [yLabel, yAxis, plot],
    [null, null, xAxis],
    [null, null, xLabel]
  ])

  const dataUrl = window.location.protocol + '//' + window.location.host + '/flats?town=' + town

  window.fetch(dataUrl).then(data => data.json())
    .then(result => {
      const groupedByType = groupBy(result, el => el.flat_type)
      for (const flatType in groupedByType) {
        plot.addDataset(new Plottable.Dataset(
          groupedByType[flatType],
          {name: flatType}
        ))
      }

      chart.renderTo('svg#plot')
    })
}

function resetChart () {
  const svgFrame = document.getElementById('plot')
  while (svgFrame.firstChild) {
    svgFrame.removeChild(svgFrame.firstChild)
  }
}

window.onload = function () {
  drawForm()
  plotChart('Ang Mo Kio')
}
