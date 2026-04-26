import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getBeltForWpm } from '../utils/helpers'

const useStore = create(
  persist(
    (set, get) => ({
      // ── Config ──────────────────────────────────────────────────────────────
      mode:        'time',
      timeLimit:   30,
      wordCount:   25,
      punctuation: false,
      numbers:     false,

      // ── Test runtime ─────────────────────────────────────────────────────────
      words:            [],
      typedHistory:     [],
      currentInput:     '',
      currentWordIndex: 0,
      testState:        'idle',
      startTime:        null,
      timeLeft:         30,
      wpmHistory:       [],
      results:          null,

      // ── Persistent progression ───────────────────────────────────────────────
      bestWpm:          0,
      totalTests:       0,
      currentBeltTier:  0,
      recentScores:     [],   // last 10 WPMs
      newBeltUnlocked:  false,

      // ── Config actions ───────────────────────────────────────────────────────
      setMode: (v) => { set({ mode: v }); get().resetTest() },
      setTimeLimit: (v) => { set({ timeLimit: v, timeLeft: v }); get().resetTest() },
      setWordCount: (v) => { set({ wordCount: v }); get().resetTest() },
      togglePunctuation: () => { set(s => ({ punctuation: !s.punctuation })); get().resetTest() },
      toggleNumbers: () => { set(s => ({ numbers: !s.numbers })); get().resetTest() },

      // ── Runtime actions ──────────────────────────────────────────────────────
      setWords:            (v) => set({ words: v }),
      setCurrentInput:     (v) => set({ currentInput: v }),
      setCurrentWordIndex: (v) => set({ currentWordIndex: v }),
      setTypedHistory:     (v) => set({ typedHistory: v }),
      setTestState:        (v) => set({ testState: v }),
      setStartTime:        (v) => set({ startTime: v }),
      setTimeLeft:         (v) => set({ timeLeft: v }),
      setResults:          (v) => set({ results: v }),
      addWpmHistory:       (e) => set(s => ({ wpmHistory: [...s.wpmHistory, e] })),

      // ── Save result + update progression ────────────────────────────────────
      saveResult: (wpm) => {
        const { bestWpm, totalTests, currentBeltTier, recentScores } = get()
        const newBest = Math.max(bestWpm, wpm)
        const belt = getBeltForWpm(wpm)
        const newBeltUnlocked = belt.tier > currentBeltTier
        const updatedScores = [...recentScores, wpm].slice(-10)
        set({
          bestWpm:         newBest,
          totalTests:      totalTests + 1,
          currentBeltTier: Math.max(currentBeltTier, belt.tier),
          recentScores:    updatedScores,
          newBeltUnlocked,
        })
      },

      clearBeltUnlock: () => set({ newBeltUnlocked: false }),

      // ── Reset ────────────────────────────────────────────────────────────────
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
          newBeltUnlocked:  false,
        })
      },
    }),
    {
      name: 'typedojo-store',
      partialize: (s) => ({
        bestWpm:         s.bestWpm,
        totalTests:      s.totalTests,
        currentBeltTier: s.currentBeltTier,
        recentScores:    s.recentScores,
      }),
    }
  )
)

export default useStore