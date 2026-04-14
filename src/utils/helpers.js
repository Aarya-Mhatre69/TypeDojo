export const generateWords = (list, count, punct = false, nums = false) => {
  let words = Array.from({ length: count }, () => list[Math.floor(Math.random() * list.length)])
  if (nums)  words = words.map(w => Math.random() < 0.15 ? String(Math.floor(Math.random() * 999)) : w)
  if (punct) words = words.map((w, i) => {
    if (i === words.length - 1) return w
    const r = Math.random()
    if (r < 0.08) return w + ','
    if (r < 0.12) return w + '.'
    if (r < 0.14) return w + '!'
    if (r < 0.16) return w + '?'
    return w
  })
  return words
}

export const calcWPM      = (correctChars, secs) => secs <= 0 ? 0 : Math.round((correctChars / 5) / (secs / 60))
export const calcRawWPM   = (totalChars,   secs) => secs <= 0 ? 0 : Math.round((totalChars   / 5) / (secs / 60))
export const calcAccuracy = (correct, total)      => total === 0 ? 100 : Math.round((correct / total) * 100)

export const countCorrectChars = (words, history) => {
  let n = 0
  history.forEach((typed, i) => {
    const orig = words[i] || ''
    for (let j = 0; j < Math.min(typed.length, orig.length); j++)
      if (typed[j] === orig[j]) n++
  })
  return n
}

export const countTotalChars = (history) => history.reduce((s, w) => s + w.length, 0)

export const getCharStats = (words, history) => {
  let correct = 0, incorrect = 0, extra = 0, missed = 0
  history.forEach((typed, i) => {
    const orig = words[i] || ''
    const max  = Math.max(typed.length, orig.length)
    for (let j = 0; j < max; j++) {
      if      (j >= orig.length)  extra++
      else if (j >= typed.length) missed++
      else if (typed[j] === orig[j]) correct++
      else incorrect++
    }
  })
  return { correct, incorrect, extra, missed }
}