import 'whatwg-fetch'
import { TimeSeries, Maps } from './app.js'

Array.from(document.querySelectorAll('.nav-item')).forEach(nav => {
  nav.addEventListener('click', event => {
    event.preventDefault()
    Array.from(document.querySelectorAll('.nav-item a')).forEach(nav => nav.classList.remove('active'))
    event.target.classList.add('active')
    window.history.pushState(null, '', event.target.textContent.toLowerCase())
    Array.from(document.getElementById('chart-container').children)
      .forEach(child => child.remove())
    Array.from(document.getElementById('chart-detail').children)
      .forEach(child => child.remove())
    Array.from(document.querySelector('.navbar-right').children)
      .forEach(child => child.remove())
    route()
  })
})

window.onload = function () {
  route()
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
