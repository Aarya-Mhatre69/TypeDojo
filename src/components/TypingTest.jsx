import { useEffect, useRef, useCallback, useState } from 'react'
import useStore from '../store/useStore'
import { generateWords, calcWPM, calcAccuracy,
         countCorrectChars, countTotalChars, getCharStats } from '../utils/helpers'

const WORD_LIST_URL = '/words/english.json'
const TIME_POOL     = 250   // enough for any time limit

// ─── Mini Sparkline (live WPM graph) ─────────────────────────────────────────
function Sparkline({ data, width = 80, height = 24 }) {
  if (!data || data.length < 2) return null
  const max = Math.max(...data.map(d => d.wpm), 1)
  const pts = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width
    const y = height - (d.wpm / max) * (height - 2) - 1
    return `${x},${y}`
  }).join(' ')
  return (
    <svg width={width} height={height} style={{ overflow: 'visible' }}>
      <polyline points={pts} fill="none" stroke="#e2b714" strokeWidth="1.5"
        strokeLinejoin="round" strokeLinecap="round" opacity="0.7" />
    </svg>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function TypingTest() {
  const {
    mode, timeLimit, wordCount, punctuation, numbers,
    words, setWords,
    typedHistory, setTypedHistory,
    currentInput, setCurrentInput,
    currentWordIndex, setCurrentWordIndex,
    testState, setTestState,
    startTime, setStartTime,
    timeLeft, setTimeLeft,
    addWpmHistory, setResults,
    resetTest, wpmHistory,
  } = useStore()

  const wordListRef  = useRef([])
  const timerRef     = useRef(null)
  const samplerRef   = useRef(null)
  const boxRef       = useRef(null)
  const wordEls      = useRef([])
  const typingTmRef  = useRef(null)

  const [liveWPM,     setLiveWPM]     = useState(0)
  const [liveAcc,     setLiveAcc]     = useState(100)
  const [caretPos,    setCaretPos]    = useState({ top: 8, left: 0 })
  const [scrollY,     setScrollY]     = useState(0)
  const [loaded,      setLoaded]      = useState(false)
  const [caretActive, setCaretActive] = useState(false)

  // ── load word list ──────────────────────────────────────────────────────────
  useEffect(() => {
    fetch(WORD_LIST_URL)
      .then(r => r.json())
      .then(list => { wordListRef.current = list; setLoaded(true) })
      .catch(() => {
        wordListRef.current = ['the','be','to','of','and','a','in','that','have',
          'it','for','not','on','with','as','you','do','at','this','but','his',
          'by','from','they','we','say','her','she','or','an','will','my','one',
          'all','would','there','their','what','so','up','out','if','about','who',
          'get','which','go','me','when','make','can','like','time','no','just',
          'him','know','take','people','into','year','your','good','some','could']
        setLoaded(true)
      })
  }, [])

  // ── generate words ──────────────────────────────────────────────────────────
  const initWords = useCallback(() => {
    if (!wordListRef.current.length) return
    const count = mode === 'time' ? TIME_POOL : wordCount
    setWords(generateWords(wordListRef.current, count, punctuation, numbers))
    wordEls.current = []
    setScrollY(0)
  }, [mode, wordCount, punctuation, numbers, setWords])

  useEffect(() => { if (loaded) initWords() }, [loaded, initWords])
  useEffect(() => { if (loaded && words.length === 0) initWords() }, [words.length, loaded, initWords])

  // ── update caret position ───────────────────────────────────────────────────
  const updateCaret = useCallback(() => {
    const box  = boxRef.current
    const wEl  = wordEls.current[currentWordIndex]
    if (!box || !wEl) return

    const boxRect   = box.getBoundingClientRect()
    const charSpans = wEl.querySelectorAll('.ch')
    let left, top

    if (currentInput.length < charSpans.length) {
      const span = charSpans[currentInput.length]
      if (span) {
        const r = span.getBoundingClientRect()
        left = r.left - boxRect.left
        top  = r.top  - boxRect.top + scrollY
      }
    } else if (charSpans.length > 0) {
      const last = charSpans[charSpans.length - 1]
      const r    = last.getBoundingClientRect()
      left = r.right - boxRect.left
      top  = r.top   - boxRect.top + scrollY
    }

    if (left !== undefined) setCaretPos({ top: top ?? 8, left })

    // auto-scroll: keep active word on line 2
    const LINE = 50
    const wRect  = wEl.getBoundingClientRect()
    const relTop = wRect.top - boxRect.top + scrollY
    if (relTop >= LINE * 2) setScrollY(prev => prev + LINE)
  }, [currentWordIndex, currentInput, scrollY])

  useEffect(() => { updateCaret() }, [updateCaret])

  // ── start test ──────────────────────────────────────────────────────────────
  const startTest = useCallback(() => {
    const t0 = Date.now()
    setStartTime(t0)
    setTestState('running')

    if (mode === 'time') {
      timerRef.current = setInterval(() =>
        setTimeLeft(p => { if (p <= 1) { clearInterval(timerRef.current); return 0 } return p - 1 }), 1000)
    }

    samplerRef.current = setInterval(() => {
      const s   = useStore.getState()
      const sec = (Date.now() - t0) / 1000
      const cc  = countCorrectChars(s.words, s.typedHistory)
      const tc  = countTotalChars(s.typedHistory)
      const wpm = calcWPM(cc, sec)
      addWpmHistory({ time: Math.round(sec), wpm })
      setLiveWPM(wpm)
      setLiveAcc(calcAccuracy(cc, tc))
    }, 1000)
  }, [mode, setStartTime, setTestState, setTimeLeft, addWpmHistory])

  // ── finish test ─────────────────────────────────────────────────────────────
  const finishTest = useCallback(() => {
    clearInterval(timerRef.current)
    clearInterval(samplerRef.current)
    const s   = useStore.getState()
    const sec = (Date.now() - s.startTime) / 1000
    const cc  = countCorrectChars(s.words, s.typedHistory)
    const tc  = countTotalChars(s.typedHistory)
    setResults({
      wpm:        calcWPM(cc, sec),
      rawWpm:     Math.round((tc / 5) / (sec / 60)),
      accuracy:   calcAccuracy(cc, tc),
      time:       Math.round(sec),
      chars:      getCharStats(s.words, s.typedHistory),
      wpmHistory: s.wpmHistory,
    })
    setTestState('finished')
  }, [setResults, setTestState])

  useEffect(() => {
    if (mode === 'time' && timeLeft === 0 && testState === 'running') finishTest()
  }, [timeLeft, mode, testState, finishTest])

  // ── keyboard handler ────────────────────────────────────────────────────────
  const handleKey = useCallback((e) => {
    if (testState === 'finished') return

    // caret active flash
    setCaretActive(true)
    clearTimeout(typingTmRef.current)
    typingTmRef.current = setTimeout(() => setCaretActive(false), 700)

    if (e.key === 'Tab')    { e.preventDefault(); clearInterval(timerRef.current); clearInterval(samplerRef.current); resetTest(); return }
    if (e.key === 'Escape') { clearInterval(timerRef.current); clearInterval(samplerRef.current); resetTest(); return }

    if (testState === 'idle' && e.key.length === 1) startTest()

    const s = useStore.getState()
    const { currentWordIndex: cwi, currentInput: ci, typedHistory: th, words: ws } = s

    if (e.key === ' ') {
      e.preventDefault()
      if (ci === '') return
      const nh = [...th, ci]
      setTypedHistory(nh)
      setCurrentInput('')
      setCurrentWordIndex(cwi + 1)
      if (mode === 'words' && cwi + 1 >= ws.length) setTimeout(finishTest, 0)
      return
    }

    if (e.key === 'Backspace') {
      e.preventDefault()
      if (ci.length > 0) { setCurrentInput(ci.slice(0, -1)) }
      else if (cwi > 0)  { setCurrentWordIndex(cwi - 1); setCurrentInput(th[th.length - 1] || ''); setTypedHistory(th.slice(0, -1)) }
      return
    }

    if (e.key.length === 1) {
      const cap = (ws[cwi]?.length ?? 0) + 10
      if (ci.length >= cap) return
      setCurrentInput(ci + e.key)
    }
  }, [testState, mode, startTest, finishTest, resetTest,
      setCurrentInput, setCurrentWordIndex, setTypedHistory])

  useEffect(() => {
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [handleKey])

  useEffect(() => () => { clearInterval(timerRef.current); clearInterval(samplerRef.current) }, [])

  // ── build char array ────────────────────────────────────────────────────────
  const getChars = (wi) => {
    const orig = words[wi] ?? ''
    const done = wi < currentWordIndex
    const curr = wi === currentWordIndex
    const typed = curr ? currentInput : done ? (typedHistory[wi] ?? '') : ''
    const result = []
    for (let i = 0; i < orig.length; i++) {
      let cls = 'ch ch-pending'
      if (curr || done) {
        if (i < typed.length) cls = typed[i] === orig[i] ? 'ch ch-correct' : 'ch ch-incorrect'
        else if (done)        cls = 'ch ch-missed'
      }
      result.push({ ch: orig[i], cls, key: `o${i}` })
    }
    for (let i = orig.length; i < typed.length; i++)
      result.push({ ch: typed[i], cls: 'ch ch-extra', key: `e${i}` })
    return result
  }

  const hasError = (wi) => {
    const typed = wi === currentWordIndex ? currentInput : (typedHistory[wi] ?? '')
    const orig  = words[wi] ?? ''
    if (typed.length > orig.length) return true
    for (let i = 0; i < typed.length; i++) if (typed[i] !== orig[i]) return true
    return false
  }

  // progress for time mode
  const progress = mode === 'time'
    ? Math.round(((timeLimit - timeLeft) / timeLimit) * 100)
    : Math.round((currentWordIndex / Math.max(wordCount, 1)) * 100)

  return (
    <div className="typing-wrap">

      {/* Top progress bar */}
      {testState === 'running' && (
        <div className="progress-bar" style={{ width: `${progress}%` }} />
      )}

      {/* Live stats */}
      <div className="live-stats">
        {testState === 'running' ? (
          <>
            <span className="live-timer">{mode === 'time' ? timeLeft : ''}</span>
            <div className="live-right">
              {wpmHistory.length >= 2 && (
                <div className="sparkline-wrap">
                  <Sparkline data={wpmHistory} width={72} height={22} />
                </div>
              )}
              <span><span className="val">{liveWPM}</span> wpm</span>
              <span><span className="val">{liveAcc}</span>%</span>
            </div>
          </>
        ) : (
          <span className="idle-hint">{testState === 'idle' ? 'start typing...' : ''}</span>
        )}
      </div>

      {/* Words area with gradient masks */}
      <div className="words-outer">
        <div ref={boxRef} className="words-box">
          <div
            className="words-scroll"
            style={{ transform: `translateY(-${scrollY}px)` }}
          >
            {/* INLINE STYLE on words-wrap as absolute fallback */}
            <div
              className="words-wrap"
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '12px',
                alignContent: 'flex-start',
                padding: '4px 0',
              }}
            >
              {words.map((_, wi) => {
                const chars    = getChars(wi)
                const isCurr   = wi === currentWordIndex
                const err      = (isCurr || wi < currentWordIndex) && hasError(wi)

                return (
                  <div
                    key={wi}
                    ref={el => { wordEls.current[wi] = el }}
                    className={`word${err ? ' word-err' : ''}${isCurr ? ' word-active' : ''}`}
                    style={{ display: 'inline-flex', position: 'relative' }}
                  >
                    {chars.map(({ ch, cls, key }) => (
                      <span key={key} className={cls}>{ch}</span>
                    ))}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Caret */}
          <div
            className={`caret-el${caretActive ? ' caret-typing' : ''}`}
            style={{ top: caretPos.top + 5, left: caretPos.left }}
          />
        </div>
      </div>

      {/* Keyboard hints */}
      <div className="hints">
        <span><kbd className="kbd">tab</kbd> + <kbd className="kbd">enter</kbd> — restart</span>
        <span><kbd className="kbd">esc</kbd> — reset</span>
      </div>
    </div>
  )
}