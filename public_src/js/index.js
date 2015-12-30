import 'whatwg-fetch'
import { App, TimeSeries, Maps } from './app.js'
import { removeChildren } from './helpers.js'

Array.from(document.querySelectorAll('.nav-item')).forEach(nav => {
  nav.addEventListener('click', event => {
    event.preventDefault()
    Array.from(document.querySelectorAll('.nav-item a')).forEach(nav => nav.classList.remove('active'))
    event.target.classList.add('active')
    window.history.pushState(null, '', event.target.textContent.toLowerCase())
    removeChildren(document.getElementById('chart-container'))
    removeChildren(document.getElementById('chart-detail'))
    removeChildren(document.querySelector('.selectors'))
    route()
  })
})

window.onload = function () {
  App.getMeta().then(route)
}

function route () {
  switch (window.location.pathname) {
    case '/charts':
      return new TimeSeries()
    case '/maps':
      return new Maps()
    default:
      return new TimeSeries()
  }
}
