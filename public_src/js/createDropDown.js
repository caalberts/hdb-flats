export default function createDropDown (list, selector, defaultOption) {
  list.forEach(item => {
    const option = document.createElement('option')
    option.textContent = item
    if (item === defaultOption) option.setAttribute('selected', '')
    document.getElementById(selector).appendChild(option)
  })
}
