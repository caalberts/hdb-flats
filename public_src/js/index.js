import 'whatwg-fetch'
import { TimeSeries, Maps } from './app.js'
import { removeChildren } from './helpers.js'

Array.from(document.querySelectorAll('.nav-item')).forEach(nav => {
  nav.addEventListener('click', event => {
    event.preventDefault()
    Array.from(document.querySelectorAll('.nav-item a')).forEach(nav => nav.classList.remove('active'))
    event.target.classList.add('active')
    window.history.pushState(null, '', event.target.textContent.toLowerCase())
    removeChildren(document.getElementById('chart-container'))
    removeChildren(document.getElementById('chart-detail'))
    removeChildren(document.querySelector('.navbar-right'))
    route()
  })
})

window.onload = function () {
  window.meta = JSON.parse(window.sessionStorage.getItem('meta'))
  if (window.meta) route()
  else {
    const url = window.location.protocol + '//' + window.location.host + '/list'
    const headers = { Accept: 'application/json' }
    window.fetch(url, headers).then(res => res.json()).then(meta => {
      window.meta = meta
      window.sessionStorage.setItem('meta', JSON.stringify(meta))
    }).then(route)
  }
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
