import { create } from 'zustand'

const useStore = create((set, get) => ({
  // ── Config ──────────────────────────────────────────────────────────────────
  mode:        'time',   // 'time' | 'words'
  timeLimit:   30,       // 15 | 30 | 60 | 120
  wordCount:   25,       // 10 | 25 | 50 | 100
  punctuation: false,
  numbers:     false,

  // ── Test runtime ─────────────────────────────────────────────────────────────
  words:            [],
  typedHistory:     [],    // completed word inputs
  currentInput:     '',    // current word being typed
  currentWordIndex: 0,
  testState:        'idle', // 'idle' | 'running' | 'finished'
  startTime:        null,
  timeLeft:         30,
  wpmHistory:       [],    // [{time, wpm}]
  results:          null,

  // ── Config actions ───────────────────────────────────────────────────────────
  setMode: (v) => {
    set({ mode: v })
    get().resetTest()
  },
  setTimeLimit: (v) => {
    set({ timeLimit: v, timeLeft: v })
    get().resetTest()
  },
  setWordCount: (v) => {
    set({ wordCount: v })
    get().resetTest()
  },
  togglePunctuation: () => {
    set(s => ({ punctuation: !s.punctuation }))
    get().resetTest()
  },
  toggleNumbers: () => {
    set(s => ({ numbers: !s.numbers }))
    get().resetTest()
  },

  // ── Runtime actions ──────────────────────────────────────────────────────────
  setWords:            (v) => set({ words: v }),
  setCurrentInput:     (v) => set({ currentInput: v }),
  setCurrentWordIndex: (v) => set({ currentWordIndex: v }),
  setTypedHistory:     (v) => set({ typedHistory: v }),
  setTestState:        (v) => set({ testState: v }),
  setStartTime:        (v) => set({ startTime: v }),
  setTimeLeft:         (v) => set({ timeLeft: v }),
  setResults:          (v) => set({ results: v }),
  addWpmHistory:       (e) => set(s => ({ wpmHistory: [...s.wpmHistory, e] })),

  // ── Reset ────────────────────────────────────────────────────────────────────
  resetTest: () => {
    const { timeLimit } = get()
    set({
      testState:        'idle',
      words:            [],
      typedHistory:     [],
      currentInput:     '',
      currentWordIndex: 0,
      startTime:        null,
      timeLeft:         timeLimit,
      wpmHistory:       [],
      results:          null,
    })
  },
}))

export default useStore