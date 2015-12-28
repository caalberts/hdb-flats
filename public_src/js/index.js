import 'whatwg-fetch'
import { TimeSeries, Maps } from './app.js'

window.onload = function () {
  let app
  const active = document.querySelector('.active')
  switch (active.textContent) {
    case 'Charts':
      app = new TimeSeries()
      break
    case 'Maps':
      app = new Maps()
      break
  }
  app.drawChart()
}
