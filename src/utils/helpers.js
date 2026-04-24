// ─── Word Generation ──────────────────────────────────────────────────────────
export function generateWords(list, count, punct = false, nums = false) {
  const pool = [...list]
  let words = Array.from({ length: count }, () =>
    pool[Math.floor(Math.random() * pool.length)]
  )
  if (nums) {
    words = words.map(w =>
      Math.random() < 0.15 ? String(Math.floor(Math.random() * 999) + 1) : w
    )
  }
  if (punct) {
    words = words.map((w, i) => {
      if (i === words.length - 1) return w
      const r = Math.random()
      if (r < 0.10) return w + ','
      if (r < 0.15) return w + '.'
      if (r < 0.17) return w + '!'
      if (r < 0.19) return w + '?'
      if (r < 0.20) return w + ';'
      return w
    })
  }
  return words
}

// ─── Stats ────────────────────────────────────────────────────────────────────
export const calcWPM = (correctChars, secs) =>
  secs <= 0 ? 0 : Math.round((correctChars / 5) / (secs / 60))

export const calcRawWPM = (totalChars, secs) =>
  secs <= 0 ? 0 : Math.round((totalChars / 5) / (secs / 60))

export const calcAccuracy = (correct, total) =>
  total === 0 ? 100 : Math.round((correct / total) * 100)

export function countCorrectChars(words, history) {
  let n = 0
  history.forEach((typed, i) => {
    const orig = words[i] || ''
    for (let j = 0; j < Math.min(typed.length, orig.length); j++)
      if (typed[j] === orig[j]) n++
  })
  return n
}

export const countTotalChars = (history) =>
  history.reduce((s, w) => s + w.length, 0)

export function getCharStats(words, history) {
  let correct = 0, incorrect = 0, extra = 0, missed = 0
  history.forEach((typed, i) => {
    const orig = words[i] || ''
    const len  = Math.max(typed.length, orig.length)
    for (let j = 0; j < len; j++) {
      if      (j >= orig.length)  extra++
      else if (j >= typed.length) missed++
      else if (typed[j] === orig[j]) correct++
      else incorrect++
    }
  })
  return { correct, incorrect, extra, missed }
}