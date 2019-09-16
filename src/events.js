export const preventDefault = (e) => {
  console.log('preventDefault')
  e.preventDefault()
}

export const captureTextSelection = () => {
  window.addEventListener('selectstart', preventDefault)
}

export const releaseTextSelection = () => {
  window.removeEventListener('selectstart', preventDefault)
}
