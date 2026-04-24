import useStore from '../store/useStore'

export default function ConfigBar() {
  const {
    mode, setMode,
    timeLimit, setTimeLimit,
    wordCount, setWordCount,
    punctuation, togglePunctuation,
    numbers, toggleNumbers,
    testState,
  } = useStore()

  // Don't allow config changes mid-test
  const locked = testState === 'running'

  return (
    <div className="config-bar">
      {/* Punctuation */}
      <button
        className={`cfg-btn${punctuation ? ' active' : ''}`}
        onClick={togglePunctuation}
        disabled={locked}
        title="Toggle punctuation"
      >
        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" opacity="0.6">
          <path d="M11.5 2C6.81 2 3 5.81 3 10.5S6.81 19 11.5 19h.5v3c4.86-2.34 8-7 8-11.5C20 5.81 16.19 2 11.5 2zm1 14.5h-2v-2h2v2zm0-4h-2c0-3.25 3-3 3-5 0-1.1-.9-2-2-2s-2 .9-2 2h-2c0-2.21 1.79-4 4-4s4 1.79 4 4c0 2.5-3 2.75-3 5z"/>
        </svg>
        punctuation
      </button>

      <div className="cfg-sep" />

      {/* Numbers */}
      <button
        className={`cfg-btn${numbers ? ' active' : ''}`}
        onClick={toggleNumbers}
        disabled={locked}
        title="Toggle numbers"
      >
        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" opacity="0.6">
          <path d="M4 14h2v-2H4v2zm0 4h2v-2H4v2zm0-8h2V8H4v2zm4 4h12v-2H8v2zm0 4h12v-2H8v2zM8 8v2h12V8H8z"/>
        </svg>
        numbers
      </button>

      <div className="cfg-sep" />

      {/* Mode: time */}
      <button
        className={`cfg-btn${mode === 'time' ? ' active' : ''}`}
        onClick={() => setMode('time')}
        disabled={locked}
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48
            10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8
            8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/>
        </svg>
        time
      </button>

      {/* Mode: words */}
      <button
        className={`cfg-btn${mode === 'words' ? ' active' : ''}`}
        onClick={() => setMode('words')}
        disabled={locked}
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
          <path d="M14 17H4v2h10v-2zm6-8H4v2h16V9zM4 15h16v-2H4v2zM4 5v2h16V5H4z"/>
        </svg>
        words
      </button>

      <div className="cfg-sep" />

      {/* Time options */}
      {mode === 'time' && [15, 30, 60, 120].map(t => (
        <button
          key={t}
          className={`cfg-btn${timeLimit === t ? ' active' : ''}`}
          onClick={() => setTimeLimit(t)}
          disabled={locked}
        >
          {t}
        </button>
      ))}

      {/* Word count options */}
      {mode === 'words' && [10, 25, 50, 100].map(n => (
        <button
          key={n}
          className={`cfg-btn${wordCount === n ? ' active' : ''}`}
          onClick={() => setWordCount(n)}
          disabled={locked}
        >
          {n}
        </button>
      ))}
    </div>
  )
}