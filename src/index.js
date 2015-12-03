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
  const url = '/flats?town=' + town + '&flat=' + type
  console.log('Fetching: ' + url)
  fetch(url)
    .then((res) => res.blob())
    .then((res) => JSON.stringify(res))
    .then((res) => console.log(res))
    .then((res) => document.querySelector('#results').textContent = res)
}

createForm()
