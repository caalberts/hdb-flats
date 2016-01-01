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

export function getMonthYear (dateStr) {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  return monthNames[+dateStr.slice(5, 7) - 1] + ' ' + dateStr.slice(0, 4)
}
