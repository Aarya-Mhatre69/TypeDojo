import { create } from 'zustand'

const useStore = create((set, get) => ({
  mode: 'time', timeLimit: 30, wordCount: 25, punctuation: false, numbers: false,
  words: [], typedHistory: [], currentInput: '', currentWordIndex: 0,
  testState: 'idle', startTime: null, timeLeft: 30, wpmHistory: [], results: null,

  setMode:             (v) => set({ mode: v }),
  setTimeLimit:        (v) => { set({ timeLimit: v }); get().resetTest() },
  setWordCount:        (v) => { set({ wordCount: v }); get().resetTest() },
  setPunctuation:      (v) => { set({ punctuation: v }); get().resetTest() },
  setNumbers:          (v) => { set({ numbers: v }); get().resetTest() },
  setWords:            (v) => set({ words: v }),
  setCurrentInput:     (v) => set({ currentInput: v }),
  setCurrentWordIndex: (v) => set({ currentWordIndex: v }),
  setTypedHistory:     (v) => set({ typedHistory: v }),
  setTestState:        (v) => set({ testState: v }),
  setStartTime:        (v) => set({ startTime: v }),
  setTimeLeft:         (v) => set({ timeLeft: v }),
  setResults:          (v) => set({ results: v }),
  addWpmHistory:       (e) => set((s) => ({ wpmHistory: [...s.wpmHistory, e] })),

  resetTest: () => {
    const { timeLimit } = get()
    set({ testState:'idle', typedHistory:[], currentInput:'', currentWordIndex:0,
          startTime:null, timeLeft:timeLimit, wpmHistory:[], results:null, words:[] })
  },
}))

export default useStore