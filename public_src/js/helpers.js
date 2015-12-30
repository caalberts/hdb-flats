export function removeChildren (elem) {
  Array.from(elem.children).forEach(child => child.remove())
}

export function capitalizeFirstLetters (phrase) {
  if (phrase.includes(' ')) {
    return phrase.split(' ').map(word => capitalizeFirstLetters(word)).join(' ')
  } else {
    return phrase.split('').map((letter, index) => {
      return index === 0 ? letter.toUpperCase() : letter
    }).join('')
  }
}

export function getMonthYear (date) {
  return new Date(date).toLocaleDateString({}, {year: 'numeric', month: 'long'})
}
