/* global fetch */

'use strict'

function createForm () {
  const form = document.querySelector('form')
  const townList = form.elements['town']
  const town = townList.options[townList.selectedIndex].text
  const roomList = form.elements['roomtype']
  const type = roomList.options[roomList.selectedIndex].text
  const submitBtn = document.querySelector('#submitBtn')

  submitBtn.addEventListener('click', (event) => {
    event.preventDefault()
    fetchFromURL(town, type)
  })
}

function fetchFromURL (town, type) {
  function getBaseURL () {
    return window.location.protocol + '//' + window.location.hostname + (window.location.port && ':' + window.location.port) + '/'
  }

  const url = getBaseURL() + 'flats?town=' + town + '&type=' + type
  console.log('Fetching: ' + url)
  fetch(url)
    .then((res) => res.json())
    .then((json) => {
      document.querySelector('#results').textContent = json
    })
}

createForm()
