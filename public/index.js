'use strict'

function createForm () {
  const form = document.querySelector('form')
  const townList = form.elements['town']
  const town = townList.options[townList.selectedIndex].text
  const roomList = form.elements['roomtype']
  const type = parseInt(roomList.options[roomList.selectedIndex].text, 10)

  form.addEventListener('submit', (event) => {
    fetchFromURL(town, type)
    event.preventDefault()
  })
}

function fetchFromURL (town, type) {
  const url = '/flats?town=' + town + '&type=' + type
  console.log('Fetching: ' + url)
  window.fetch(url)
    .then((res) => res.json())
    .then((json) => {
      document.querySelector('#results').textContent = json
    })
}

createForm()
