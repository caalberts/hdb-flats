export default function createDropDown (list, selector, defaultOption) {
  const elem = document.getElementById(selector)
  list.forEach(item => {
    const option = document.createElement('option')
    option.textContent = item
    if (item === defaultOption) option.setAttribute('selected', '')
    elem.appendChild(option)
  })
}
