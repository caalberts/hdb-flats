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
  // const townSelection = document.getElementById('select-town')
  // const chartSelection = document.getElementById('select-chart')
  // towns.forEach(town => {
  //   const option = document.createElement('option')
  //   option.textContent = town
  //   townSelection.appendChild(option)
  // })
  // charts.forEach(chart => {
  //   const option = document.createElement('option')
  //   option.textContent = chart
  //   chartSelection.appendChild(option)
  // })
  createDropDown(towns, 'select-town')
  createDropDown(charts, 'select-chart')
  const submitBtn = document.createElement('button')
  submitBtn.setAttribute('value', 'Submit')
  submitBtn.setAttribute('type', 'button')
  submitBtn.textContent = 'Submit'
  submitBtn.addEventListener('click', () => plotChart())
  document.getElementById('plot-form').appendChild(submitBtn)
}

function plotChart () {
  const townSelection = document.getElementById('select-town')
  const town = townSelection.options[townSelection.selectedIndex].text
  const url = window.location.protocol + '//' + window.location.host + '/towns?town=' + town

  const chartSelection = document.getElementById('select-chart')
  const chart = chartSelection.options[chartSelection.selectedIndex].text

  const plotSpace = document.getElementById('plot-space')

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
        title: 'Average HDB Resale Price in ' + town,
        autosize: false,
        width: 1000,
        height: 600,
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
    })
}

function createDropDown (list, selector) {
  list.forEach(item => {
    const option = document.createElement('option')
    option.textContent = item
    document.getElementById(selector).appendChild(option)
  })
}

window.onload = function () {
  drawForm()
  plotChart()
}
