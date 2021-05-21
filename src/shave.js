export default function shave(target, maxHeight, opts = {}) {
  if (typeof maxHeight === 'undefined' || isNaN(maxHeight)) throw Error('maxHeight is required')
  let els = typeof target === 'string' ? document.querySelectorAll(target) : target
  if (!els) return

  const character = opts.character || '&mldr;'
  const classname = opts.classname || 'js-shave'
  const spaces = typeof opts.spaces === 'boolean' ? opts.spaces : true
  const charclassname = opts.charclassname || 'js-shave-char'
  const targetLinkText = opts.targetLink.text || ''
  const targetLinkUrl = opts.targetLink.url || '#'
  const targetLinkTabindex = opts.targetLink.tabindex || 0
  const targetLinkNewTab = opts.targetLink.newTab ? '_blank' : '_self'
  let truncationHtml

  if (targetLinkText) {
    truncationHtml = document.createElement('a')
    truncationHtml.innerText = `${character} ${targetLinkText}`
    truncationHtml.setAttribute('href', targetLinkUrl)
    truncationHtml.setAttribute('target', targetLinkNewTab)
    truncationHtml.setAttribute('aria-label', targetLinkText)
    truncationHtml.setAttribute('title', targetLinkText)
    truncationHtml.setAttribute('tabindex', `${targetLinkTabindex}`)
  } else {
    truncationHtml = document.createElement('span')
    truncationHtml.innerText = character
  }
  truncationHtml.classList.add(charclassname)

  if (!('length' in els)) els = [els]
  for (let i = 0; i < els.length; i += 1) {
    const el = els[i]
    const styles = el.style
    const span = el.querySelector(`.${classname}`)
    const textProp = el.textContent === undefined ? 'innerText' : 'textContent'

    // If element text has already been shaved
    if (span) {
      // Remove the truncation element to recapture the original text
      el.removeChild(el.querySelector(`.${charclassname}`))
      el[textProp] = el[textProp] // eslint-disable-line
      // nuke span, recombine text
    }

    const fullText = el[textProp]
    const words = spaces ? fullText.split(' ') : fullText
    // If 0 or 1 words, we're done
    if (words.length < 2) continue

    // Temporarily remove any CSS height for text height calculation
    const heightStyle = styles.height
    styles.height = 'auto'
    const maxHeightStyle = styles.maxHeight
    styles.maxHeight = 'none'

    // Get max word number from characters including optional link
    const charLength = truncationHtml.innerText.split(' ').length

    // If already short enough, we're done
    if (el.offsetHeight <= maxHeight) {
      styles.height = heightStyle
      styles.maxHeight = maxHeightStyle
      continue
    }

    // Binary search for number of words which can fit in allotted height
    let max = words.length + charLength
    let min = 0
    let pivot
    while (min < max) {
      pivot = (min + max + 1) >> 1 // eslint-disable-line no-bitwise
      el[textProp] = spaces ? words.slice(0, pivot).join(' ') : words.slice(0, pivot)
      el.insertAdjacentHTML('beforeend', truncationHtml)
      if (el.offsetHeight > maxHeight) max = pivot - 1
      else min = pivot
    }

    el[textProp] = spaces ? words.slice(0, max).join(' ') : words.slice(0, max)
    el.insertAdjacentHTML('beforeend', truncationHtml)
    const diff = spaces ? ` ${words.slice(max).join(' ')}` : words.slice(max)

    const shavedText = document.createTextNode(diff)
    const elWithShavedText = document.createElement('span')
    elWithShavedText.classList.add(classname)
    elWithShavedText.style.display = 'none'
    elWithShavedText.appendChild(shavedText)
    el.insertAdjacentElement('beforeend', elWithShavedText)

    styles.height = heightStyle
    styles.maxHeight = maxHeightStyle
  }
}
