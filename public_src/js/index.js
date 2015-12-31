import 'whatwg-fetch'
import { App, TimeSeries, Maps } from './app.js'
import { removeChildren } from './helpers.js'

Array.from(document.querySelectorAll('.nav-item')).forEach(nav => {
  nav.addEventListener('click', event => {
    event.preventDefault()
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
  Array.from(document.querySelectorAll('.nav-item a')).forEach(a => {
    a.classList.remove('active')
    if (a.pathname === window.location.pathname) a.classList.add('active')
  })
  switch (window.location.pathname) {
    case '/charts':
      return new TimeSeries()
    case '/maps':
      return new Maps()
    default:
      document.querySelector('.nav-item a').classList.add('active')
      return new TimeSeries()
  }
}
