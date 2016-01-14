import 'whatwg-fetch'
Array.from = require('array-from')
import { TimeSeries, Maps, About } from './app.js'
import { getMonthYear } from './helpers.js'

Array.from(document.querySelectorAll('.nav-item.route')).forEach(nav => {
  nav.addEventListener('click', event => {
    event.preventDefault()
    window.history.pushState(null, '', event.target.textContent.toLowerCase())
    route()
  })
})

window.onload = function () {
  window.meta = JSON.parse(window.sessionStorage.getItem('meta'))
  if (window.meta) route()
  else {
    console.log('retrieving data from MongoDB')
    const url = window.location.protocol + '//' + window.location.host + '/list'
    const headers = { Accept: 'application/json' }
    window.fetch(url, headers).then(res => res.json()).then(meta => {
      window.meta = meta
      window.sessionStorage.setItem('meta', JSON.stringify(meta))
    }).then(route)
  }
}

function route () {
  Array.from(document.querySelectorAll('.nav-item a')).forEach(a => {
    a.classList.remove('active')
    if (a.pathname === window.location.pathname) a.classList.add('active')
  })
  document.querySelector('.retrieve-date').textContent =
    window.meta.lastUpdate.slice(8, 10) + ' ' + getMonthYear(window.meta.lastUpdate)
  switch (window.location.pathname) {
    case '/charts':
    case '/':
      return new TimeSeries()
    case '/maps':
      return new Maps()
    // case '/about':
    //   return new About()
  }
}

document.querySelector('.footer-terms').addEventListener('click', event => {
  event.preventDefault()
  document.querySelector('.terms').classList.toggle('hidden')
})
document.querySelector('.accept-terms').addEventListener('click', event => {
  event.preventDefault()
  document.querySelector('.terms').classList.add('hidden')
})
