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
  submitBtn.addEventListener('click', () => plotChart())
  document.getElementById('plot-form').appendChild(submitBtn)
}

function plotChart () {
  const selection = document.getElementById('select-town')
  const town = selection.options[selection.selectedIndex].text
  const url = window.location.protocol + '//' + window.location.host + '/towns?town=' + town

  const plotSpace = document.getElementById('plot-space')

  window.fetch(url).then(res => res.json())
    .then(result => {
      let data = []
      result.forEach(flatType => {
        if (flatType.time_series.mean.length > 0) {
          data.push({
            name: flatType.flat_type,
            x: flatType.time_series.month,
            y: flatType.time_series.mean,
            error_y: {
              type: 'data',
              array: flatType.time_series.ci95,
              visible: true,
              thickness: 1,
              width: 0
            },
            type: 'scatter',
            mode: 'markers',
            marker: {
              size: 3
            }
          })
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
          title: 'Average Resale Price in SGD',
          rangemode: 'tozero'
        }
      }
      Plotly.newPlot(plotSpace, data, layout)
    })
}

window.onload = function () {
  drawForm()
  plotChart()
}
