import { useEffect, useRef, useCallback, useState } from 'react'
import useStore from '../store/useStore'
import {
  generateWords, calcWPM, calcAccuracy,
  countCorrectChars, countTotalChars, getCharStats, getMistakeMap,
} from '../utils/helpers'

const WORD_LIST_URL = '/words/english.json'
const TIME_POOL = 300

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
    wpmHistory, addWpmHistory,
    setResults,
    saveResult,
    resetTest,
  } = useStore()

  const inputRef    = useRef(null)
  const wordsRef    = useRef(null)
  const timerRef    = useRef(null)
  const wordListRef = useRef([])

  // ── Load word list ──────────────────────────────────────────────────────────
  useEffect(() => {
    fetch(WORD_LIST_URL)
      .then(r => r.json())
      .then(data => { wordListRef.current = data.words || data })
      .catch(() => {
        wordListRef.current = ['the','be','to','of','and','a','in','that','have',
          'it','for','not','on','with','he','as','you','do','at','this','but',
          'his','by','from','they','we','say','her','she','or','an','will','my',
          'one','all','would','there','their','what','so','up','out','if','about',
          'who','get','which','go','me','when','make','can','like','time','no',
          'just','him','know','take','people','into','year','your','good','some',
          'could','them','see','other','than','then','now','look','only','come',
          'its','over','think','also','back','after','use','two','how','our',
          'work','first','well','way','even','new','want','because','any','these']
      })
  }, [])

  // ── Init words ──────────────────────────────────────────────────────────────
  const initWords = useCallback(() => {
    if (!wordListRef.current.length) return
    const count = mode === 'time' ? TIME_POOL : wordCount
    const w = generateWords(wordListRef.current, count, punctuation, numbers)
    setWords(w)
  }, [mode, wordCount, punctuation, numbers, setWords])

  useEffect(() => {
    if (words.length === 0 && wordListRef.current.length > 0) initWords()
  }, [words, initWords])

  useEffect(() => {
    const id = setInterval(() => {
      if (wordListRef.current.length > 0 && words.length === 0) initWords()
    }, 100)
    return () => clearInterval(id)
  }, [words, initWords])

  // ── Scroll active word into view ────────────────────────────────────────────
  useEffect(() => {
    if (!wordsRef.current) return
    const activeEl = wordsRef.current.querySelector('.word--active')
    if (activeEl) {
      activeEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }
  }, [currentWordIndex])

  // ── Timer ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (testState !== 'running') return
    timerRef.current = setInterval(() => {
      const now = Date.now()
      const elapsed = (now - startTime) / 1000

      if (mode === 'time') {
        const left = Math.max(0, timeLimit - elapsed)
        setTimeLeft(Math.ceil(left))
        // wpm snapshot
        const correctChars = countCorrectChars(
          useStore.getState().typedHistory,
          useStore.getState().words
        )
        addWpmHistory({ time: Math.floor(elapsed), wpm: calcWPM(correctChars, elapsed) })
        if (left <= 0) finishTest()
      }
    }, 250)
    return () => clearInterval(timerRef.current)
  }, [testState, startTime, mode, timeLimit])

  // ── Finish ──────────────────────────────────────────────────────────────────
  const finishTest = useCallback(() => {
    clearInterval(timerRef.current)
    const state = useStore.getState()
    const elapsed = mode === 'time'
      ? timeLimit
      : (Date.now() - state.startTime) / 1000
    const correctChars = countCorrectChars(state.typedHistory, state.words)
    const totalChars   = countTotalChars(state.typedHistory)
    const { correct, incorrect } = getCharStats(state.typedHistory, state.words)
    const wpm      = calcWPM(correctChars, elapsed)
    const accuracy = calcAccuracy(correct, correct + incorrect)
    const mistakeMap = getMistakeMap(state.typedHistory, state.words)

    const results = {
      wpm, accuracy, correctChars, totalChars,
      correct, incorrect, elapsed,
      wpmHistory: state.wpmHistory,
      mistakeMap,
    }
    setResults(results)
    saveResult(wpm)
    setTestState('finished')
  }, [mode, timeLimit, setResults, saveResult, setTestState])

  // ── Keydown handler ─────────────────────────────────────────────────────────
  const handleKeyDown = useCallback((e) => {
    if (testState === 'finished') return

    if (testState === 'idle') {
      setTestState('running')
      setStartTime(Date.now())
    }

    const state = useStore.getState()

    if (e.key === 'Backspace') {
      if (state.currentInput.length > 0) {
        setCurrentInput(state.currentInput.slice(0, -1))
      } else if (state.currentWordIndex > 0) {
        // allow going back to previous word
        const prevIdx = state.currentWordIndex - 1
        const prevTyped = [...state.typedHistory]
        const prevInput = prevTyped.splice(prevIdx, 1)[0] || ''
        setTypedHistory(prevTyped)
        setCurrentWordIndex(prevIdx)
        setCurrentInput(prevInput)
      }
      return
    }

    if (e.key === ' ') {
      e.preventDefault()
      if (!state.currentInput) return
      const newHistory = [...state.typedHistory, state.currentInput]
      const newIndex   = state.currentWordIndex + 1
      setTypedHistory(newHistory)
      setCurrentInput('')
      setCurrentWordIndex(newIndex)

      if (mode === 'words' && newIndex >= wordCount) {
        finishTest()
      }
      return
    }

    if (e.key.length === 1) {
      setCurrentInput(state.currentInput + e.key)
    }
  }, [testState, mode, wordCount, finishTest, setTestState, setStartTime,
      setCurrentInput, setTypedHistory, setCurrentWordIndex])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // ── Render chars ─────────────────────────────────────────────────────────────
  function renderWord(word, index) {
    const isActive  = index === currentWordIndex
    const isPast    = index < currentWordIndex
    const typed     = isPast
      ? (typedHistory[index] || '')
      : (isActive ? currentInput : '')

    const isWordWrong = isPast && typed !== word

    const chars = word.split('').map((ch, ci) => {
      let cls = 'char'
      if (isPast || isActive) {
        if (ci < typed.length) {
          cls += typed[ci] === ch ? ' char--correct' : ' char--wrong'
        } else if (isActive) {
          cls += ' char--pending'
        }
      }
      return <span key={ci} className={cls}>{ch}</span>
    })

    // extra typed chars beyond the word length
    const extras = isActive && typed.length > word.length
      ? typed.slice(word.length).split('').map((ch, ci) => (
          <span key={`e${ci}`} className="char char--extra">{ch}</span>
        ))
      : null

    return (
      <div
        key={index}
        className={`word ${isActive ? 'word--active' : ''} ${isWordWrong ? 'word--wrong' : ''}`}
      >
        {chars}{extras}
        {isActive && <span className="cursor" />}
      </div>
    )
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  const progress = mode === 'time'
    ? ((timeLimit - timeLeft) / timeLimit) * 100
    : (currentWordIndex / wordCount) * 100

  return (
    <div className="typing-area" onClick={() => inputRef.current?.focus()}>
      {/* Timer / word counter */}
      <div className="test-header">
        {mode === 'time' ? (
          <div className={`timer ${timeLeft <= 5 ? 'timer--urgent' : ''}`}>
            {timeLeft}
          </div>
        ) : (
          <div className="word-counter">
            {currentWordIndex}<span className="word-counter__total">/{wordCount}</span>
          </div>
        )}
        <div className="progress-bar">
          <div className="progress-bar__fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Words display */}
      <div className="words-wrapper" ref={wordsRef}>
        {testState === 'idle' && words.length === 0 ? (
          <div className="loading-words">Loading words…</div>
        ) : (
          words.map((word, i) => renderWord(word, i))
        )}
      </div>

      {/* Ghost input to capture focus */}
      <input
        ref={inputRef}
        className="ghost-input"
        autoFocus
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        value=""
        onChange={() => {}}
        onFocus={() => {}}
      />

      {testState === 'idle' && (
        <p className="start-hint">Start typing to begin…</p>
      )}
    </div>
  )
}