// ── Word generation ──────────────────────────────────────────────────────────
export function generateWords(wordPool, count, punctuation, numbers) {
  let pool = [...wordPool]
  const picked = []
  for (let i = 0; i < count; i++) {
    let word = pool[Math.floor(Math.random() * pool.length)]
    if (numbers && Math.random() < 0.15) {
      word = String(Math.floor(Math.random() * 9999))
    }
    if (punctuation && Math.random() < 0.2) {
      const puncts = [',', '.', '!', '?', ';', ':']
      word = word + puncts[Math.floor(Math.random() * puncts.length)]
    }
    if (punctuation && Math.random() < 0.1) {
      word = '"' + word + '"'
    }
    picked.push(word)
  }
  return picked
}

// ── WPM / accuracy ───────────────────────────────────────────────────────────
export function calcWPM(correctChars, elapsedSeconds) {
  if (elapsedSeconds <= 0) return 0
  return Math.round((correctChars / 5) / (elapsedSeconds / 60))
}

export function calcAccuracy(correct, total) {
  if (total === 0) return 100
  return Math.round((correct / total) * 100)
}

export function countCorrectChars(typedHistory, words) {
  let count = 0
  typedHistory.forEach((typed, i) => {
    if (typed === words[i]) count += words[i].length + 1 // +1 for space
  })
  return count
}

export function countTotalChars(typedHistory) {
  return typedHistory.reduce((acc, w) => acc + w.length + 1, 0)
}

export function getCharStats(typedHistory, words) {
  let correct = 0, incorrect = 0
  typedHistory.forEach((typed, i) => {
    const target = words[i] || ''
    const len = Math.max(typed.length, target.length)
    for (let j = 0; j < len; j++) {
      if (typed[j] === target[j]) correct++
      else incorrect++
    }
  })
  return { correct, incorrect }
}

// ── Mistake tracking ──────────────────────────────────────────────────────────
export function getMistakeMap(typedHistory, words) {
  const map = {} // { 'a': 3, 'b': 1, ... }
  typedHistory.forEach((typed, i) => {
    const target = words[i] || ''
    const len = Math.max(typed.length, target.length)
    for (let j = 0; j < len; j++) {
      if (typed[j] !== target[j] && target[j]) {
        map[target[j]] = (map[target[j]] || 0) + 1
      }
    }
  })
  return map
}

// ── Belt rank system ──────────────────────────────────────────────────────────
export const BELTS = [
  { name: 'White Belt',  min: 0,   max: 20,  color: '#e8e8e8', glow: '#ffffff',  emoji: '🥋', tier: 0 },
  { name: 'Yellow Belt', min: 21,  max: 35,  color: '#f5c518', glow: '#f5c518',  emoji: '🥋', tier: 1 },
  { name: 'Green Belt',  min: 36,  max: 50,  color: '#4caf50', glow: '#4caf50',  emoji: '🥋', tier: 2 },
  { name: 'Blue Belt',   min: 51,  max: 70,  color: '#2196f3', glow: '#2196f3',  emoji: '🥋', tier: 3 },
  { name: 'Red Belt',    min: 71,  max: 90,  color: '#e53935', glow: '#e53935',  emoji: '🥋', tier: 4 },
  { name: 'Black Belt',  min: 91,  max: 9999,color: '#ffd700', glow: '#ffd700',  emoji: '🥷', tier: 5 },
]

export function getBeltForWpm(wpm) {
  return BELTS.find(b => wpm >= b.min && wpm <= b.max) || BELTS[0]
}

export function getNextBelt(currentTier) {
  return BELTS[Math.min(currentTier + 1, BELTS.length - 1)]
}