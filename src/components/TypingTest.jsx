import { useEffect, useRef, useCallback, useState } from 'react'
import useStore from '../store/useStore'
import {
  generateWords, calcWPM, calcAccuracy,
  countCorrectChars, countTotalChars, getCharStats,
} from '../utils/helpers'

const WORD_LIST_URL = '/words/english.json'
const TIME_POOL     = 300

// ─── Sparkline ────────────────────────────────────────────────────────────────
function Sparkline({ data }) {
  if (!data || data.length < 2) return null
  const W = 72, H = 22
  const max = Math.max(...data.map(d => d.wpm), 10)
  const pts = data.map((d, i) => {
    const x = (i / (data.length - 1)) * W
    const y = H - (d.wpm / max) * (H - 4) - 2
    return `${x.toFixed(1)},${y.toFixed(1)}`
  }).join(' ')
  return (
    <div className="sparkline-wrap">
      <svg width={W} height={H} style={{ overflow: 'visible', display: 'block' }}>
        <polyline points={pts} fill="none" stroke="#e2b714"
          strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" opacity="0.75" />
      </svg>
    </div>
  )
}

// ─── TypingTest ───────────────────────────────────────────────────────────────
export default function TypingTest() {
  const store = useStore()
  const {
    mode, timeLimit, wordCount, punctuation, numbers,
    words, setWords,
    typedHistory, setTypedHistory,
    currentInput, setCurrentInput,
    currentWordIndex, setCurrentWordIndex,
    testState, setTestState,
    setStartTime,
    timeLeft, setTimeLeft,
    addWpmHistory, setResults,
    resetTest, wpmHistory,
  } = store

  // ── Refs (never stale in callbacks) ────────────────────────────────────────
  const wordListRef    = useRef([])
  const timerRef       = useRef(null)
  const samplerRef     = useRef(null)
  const boxRef         = useRef(null)
  const wordElsRef     = useRef([])
  const typingTimerRef = useRef(null)
  const t0Ref          = useRef(null)
  const tabHeldRef     = useRef(false)   // ← key fix: ref not state for Tab+Enter

  // ── Local UI state ──────────────────────────────────────────────────────────
  const [liveWPM,     setLiveWPM]     = useState(0)
  const [liveAcc,     setLiveAcc]     = useState(100)
  const [caretPos,    setCaretPos]    = useState({ top: 8, left: 0 })
  const [scrollY,     setScrollY]     = useState(0)
  const [loaded,      setLoaded]      = useState(false)
  const [caretOn,     setCaretOn]     = useState(false)

  // ── Load word list once ─────────────────────────────────────────────────────
  useEffect(() => {
    fetch(WORD_LIST_URL)
      .then(r => r.json())
      .then(list => { wordListRef.current = list; setLoaded(true) })
      .catch(() => {
        wordListRef.current = [
          'the','be','to','of','and','a','in','that','have','it','for','not',
          'on','with','as','you','do','at','this','but','his','by','from','they',
          'we','say','her','she','or','an','will','my','one','all','would','there',
          'their','what','so','up','out','if','about','who','get','which','go','me',
          'when','make','can','like','time','no','just','him','know','take','people',
          'into','year','your','good','some','could','them','see','other','than',
          'then','now','look','only','come','over','think','also','back','after',
          'use','two','how','our','work','first','well','way','even','new','want',
        ]
        setLoaded(true)
      })
  }, [])

  // ── Generate words whenever config changes or words reset ───────────────────
  const initWords = useCallback(() => {
    if (!wordListRef.current.length) return
    const count = mode === 'time' ? TIME_POOL : wordCount
    const generated = generateWords(wordListRef.current, count, punctuation, numbers)
    setWords(generated)
    wordElsRef.current = []
    setScrollY(0)
    setCaretPos({ top: 8, left: 0 })
  }, [mode, wordCount, punctuation, numbers, setWords])

  // On initial load
  useEffect(() => { if (loaded) initWords() }, [loaded]) // eslint-disable-line

  // When words gets cleared (by resetTest)
  useEffect(() => {
    if (loaded && words.length === 0) initWords()
  }, [words.length, loaded]) // eslint-disable-line

  // ── Caret position ──────────────────────────────────────────────────────────
  const updateCaret = useCallback(() => {
    const box = boxRef.current
    const wEl = wordElsRef.current[currentWordIndex]
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
    } else {
      // empty word fallback
      const wr = wEl.getBoundingClientRect()
      left = wr.left - boxRect.left
      top  = wr.top  - boxRect.top + scrollY
    }

    if (left !== undefined) setCaretPos({ top: top ?? 8, left })

    // Auto-scroll: once active word reaches line 3, scroll one line up
    const LINE_H = 50
    const wRect  = wEl.getBoundingClientRect()
    const relTop = wRect.top - boxRect.top + scrollY
    if (relTop >= LINE_H * 2) {
      setScrollY(prev => prev + LINE_H)
    }
  }, [currentWordIndex, currentInput, scrollY])

  useEffect(() => { updateCaret() }, [updateCaret])

  // ── Clear intervals helper ──────────────────────────────────────────────────
  const clearAll = useCallback(() => {
    clearInterval(timerRef.current)
    clearInterval(samplerRef.current)
    timerRef.current = null
    samplerRef.current = null
  }, [])

  // ── Start test ──────────────────────────────────────────────────────────────
  const startTest = useCallback(() => {
    const t0 = Date.now()
    t0Ref.current = t0
    setStartTime(t0)
    setTestState('running')

    if (mode === 'time') {
      // Ensure timeLeft is correct before starting
      const limit = useStore.getState().timeLimit
      setTimeLeft(limit)

      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current)
            timerRef.current = null
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    // WPM sampler every second
    samplerRef.current = setInterval(() => {
      const s   = useStore.getState()
      const sec = (Date.now() - t0Ref.current) / 1000
      const cc  = countCorrectChars(s.words, s.typedHistory)
      const tc  = countTotalChars(s.typedHistory)
      const wpm = calcWPM(cc, sec)
      addWpmHistory({ time: Math.round(sec), wpm })
      setLiveWPM(wpm)
      setLiveAcc(calcAccuracy(cc, tc))
    }, 1000)
  }, [mode, setStartTime, setTestState, setTimeLeft, addWpmHistory])

  // ── Finish test ─────────────────────────────────────────────────────────────
  const finishTest = useCallback(() => {
    clearAll()
    const s   = useStore.getState()
    const sec = t0Ref.current ? (Date.now() - t0Ref.current) / 1000 : 1
    const cc  = countCorrectChars(s.words, s.typedHistory)
    const tc  = countTotalChars(s.typedHistory)
    setResults({
      wpm:        calcWPM(cc, sec),
      rawWpm:     calcWPM(tc, sec),
      accuracy:   calcAccuracy(cc, tc),
      time:       Math.round(sec),
      chars:      getCharStats(s.words, s.typedHistory),
      wpmHistory: [...s.wpmHistory],
    })
    setTestState('finished')
  }, [clearAll, setResults, setTestState])

  // Watch timeLeft → finish when 0 in time mode
  useEffect(() => {
    if (mode === 'time' && timeLeft === 0 && testState === 'running') {
      finishTest()
    }
  }, [timeLeft, mode, testState, finishTest])

  // ── Keyboard handler ────────────────────────────────────────────────────────
  useEffect(() => {
    const onKeyDown = (e) => {
      // ── Tab: hold to combine with Enter ──────────────────────────────────
      if (e.key === 'Tab') {
        e.preventDefault()
        tabHeldRef.current = true
        return
      }

      // ── Tab + Enter = restart ─────────────────────────────────────────────
      if (e.key === 'Enter' && tabHeldRef.current) {
        e.preventDefault()
        clearAll()
        resetTest()
        return
      }

      // ── Escape = restart ──────────────────────────────────────────────────
      if (e.key === 'Escape') {
        e.preventDefault()
        clearAll()
        resetTest()
        return
      }

      // Don't process more keys if finished
      if (useStore.getState().testState === 'finished') return

      // ── Caret active pulse ────────────────────────────────────────────────
      setCaretOn(true)
      clearTimeout(typingTimerRef.current)
      typingTimerRef.current = setTimeout(() => setCaretOn(false), 800)

      // ── Start test on first printable key ─────────────────────────────────
      if (useStore.getState().testState === 'idle' && e.key.length === 1) {
        startTest()
      }

      // Read latest state from store (not stale closure)
      const s = useStore.getState()
      const { currentWordIndex: cwi, currentInput: ci, typedHistory: th, words: ws } = s

      // ── Space = commit current word ───────────────────────────────────────
      if (e.key === ' ') {
        e.preventDefault()
        if (ci.trim() === '') return

        const newHistory = [...th, ci]
        setTypedHistory(newHistory)
        setCurrentInput('')
        setCurrentWordIndex(cwi + 1)

        // Words mode: finish when all words committed
        if (s.mode === 'words' && cwi + 1 >= ws.length) {
          setTimeout(finishTest, 0)
        }
        return
      }

      // ── Backspace ─────────────────────────────────────────────────────────
      if (e.key === 'Backspace') {
        e.preventDefault()
        if (ci.length > 0) {
          setCurrentInput(ci.slice(0, -1))
        } else if (cwi > 0) {
          // Go back to previous word
          const prevTyped = th[th.length - 1] ?? ''
          setCurrentWordIndex(cwi - 1)
          setCurrentInput(prevTyped)
          setTypedHistory(th.slice(0, -1))
        }
        return
      }

      // ── Printable character ───────────────────────────────────────────────
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const maxLen = (ws[cwi]?.length ?? 0) + 10
        if (ci.length >= maxLen) return
        setCurrentInput(ci + e.key)
      }
    }

    const onKeyUp = (e) => {
      if (e.key === 'Tab') tabHeldRef.current = false
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup',   onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup',   onKeyUp)
    }
  // Only depend on stable functions — store state read via getState() inside
  }, [startTest, finishTest, clearAll, resetTest,
      setCurrentInput, setCurrentWordIndex, setTypedHistory])

  // Cleanup on unmount
  useEffect(() => () => clearAll(), [clearAll])

  // ── Build char states for a word ────────────────────────────────────────────
  const getChars = useCallback((wi) => {
    const orig  = words[wi] ?? ''
    const isDone = wi < currentWordIndex
    const isCurr = wi === currentWordIndex
    const typed  = isCurr ? currentInput
                 : isDone ? (typedHistory[wi] ?? '')
                 : ''
    const chars = []

    for (let i = 0; i < orig.length; i++) {
      let cls = 'ch ch-pending'
      if (isCurr || isDone) {
        if (i < typed.length) cls = typed[i] === orig[i] ? 'ch ch-correct' : 'ch ch-incorrect'
        else if (isDone)      cls = 'ch ch-missed'
      }
      chars.push({ ch: orig[i], cls, key: `o${i}` })
    }
    // Extra chars beyond word length
    for (let i = orig.length; i < typed.length; i++) {
      chars.push({ ch: typed[i], cls: 'ch ch-extra', key: `e${i}` })
    }
    return chars
  }, [words, currentWordIndex, currentInput, typedHistory])

  const wordHasError = useCallback((wi) => {
    const orig  = words[wi] ?? ''
    const typed = wi === currentWordIndex ? currentInput : (typedHistory[wi] ?? '')
    if (typed.length > orig.length) return true
    for (let i = 0; i < typed.length; i++) {
      if (typed[i] !== orig[i]) return true
    }
    return false
  }, [words, currentWordIndex, currentInput, typedHistory])

  // ── Progress for top bar ────────────────────────────────────────────────────
  const progress = mode === 'time'
    ? Math.round(((timeLimit - timeLeft) / timeLimit) * 100)
    : Math.round((currentWordIndex / Math.max(wordCount, 1)) * 100)

  const timerWarning = mode === 'time' && timeLeft <= 10 && testState === 'running'

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="typing-wrap">

      {/* Progress bar */}
      {testState === 'running' && (
        <div className="top-bar" style={{ width: `${progress}%` }} />
      )}

      {/* Live stats row */}
      <div className="live-stats">
        {testState === 'running' ? (
          <>
            <span className={`live-timer${timerWarning ? ' warning' : ''}`}>
              {mode === 'time' ? timeLeft : ''}
            </span>
            <div className="live-right">
              {wpmHistory.length >= 3 && <Sparkline data={wpmHistory} />}
              <span><span className="val">{liveWPM}</span> wpm</span>
              <span><span className="val">{liveAcc}</span>%</span>
            </div>
          </>
        ) : (
          <span className="idle-hint">
            {testState === 'idle' ? 'start typing...' : ''}
          </span>
        )}
      </div>

      {/* Words area */}
      <div className="words-outer" onClick={() => boxRef.current?.focus?.()}>
        <div ref={boxRef} className="words-box">
          <div
            className="words-scroll"
            style={{ transform: `translateY(-${scrollY}px)` }}
          >
            <div
              className="words-wrap"
              style={{
                display:      'flex',
                flexWrap:     'wrap',
                gap:          '14px',
                alignContent: 'flex-start',
                padding:      '6px 2px',
              }}
            >
              {words.map((_, wi) => {
                const chars  = getChars(wi)
                const isCurr = wi === currentWordIndex
                const hasErr = (isCurr || wi < currentWordIndex) && wordHasError(wi)
                return (
                  <div
                    key={wi}
                    ref={el => { wordElsRef.current[wi] = el }}
                    className={`word${hasErr ? ' word-err' : ''}`}
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

          {/* Glowing caret */}
          <div
            className={`caret-el${caretOn ? ' caret-on' : ''}`}
            style={{
              top:  caretPos.top + 6,
              left: caretPos.left,
            }}
          />
        </div>
      </div>

      {/* Keyboard hints */}
      <div className="hints">
        <span>
          <kbd className="kbd">tab</kbd>
          <span style={{ color: 'var(--bg3)', margin: '0 3px' }}>+</span>
          <kbd className="kbd">enter</kbd>
          <span style={{ marginLeft: 6 }}>— restart</span>
        </span>
        <span><kbd className="kbd">esc</kbd> — reset</span>
      </div>
    </div>
  )
}