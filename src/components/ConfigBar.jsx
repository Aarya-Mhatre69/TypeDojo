import useStore from '../store/useStore'

export default function ConfigBar() {
  const { mode, setMode, timeLimit, setTimeLimit, wordCount, setWordCount,
          punctuation, setPunctuation, numbers, setNumbers } = useStore()
  return (
    <div className="config-bar">
      <button className={`cfg-btn${punctuation ? ' active' : ''}`} onClick={() => setPunctuation(!punctuation)}>
        <span style={{fontSize:'0.65rem',opacity:.55}}>@</span> punctuation
      </button>
      <div className="cfg-div" />
      <button className={`cfg-btn${numbers ? ' active' : ''}`} onClick={() => setNumbers(!numbers)}>
        <span style={{fontSize:'0.65rem',opacity:.55}}>#</span> numbers
      </button>
      <div className="cfg-div" />
      <button className={`cfg-btn${mode==='time' ? ' active' : ''}`} onClick={() => setMode('time')}>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/>
        </svg>
        time
      </button>
      <button className={`cfg-btn${mode==='words' ? ' active' : ''}`} onClick={() => setMode('words')}>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
          <path d="M14 17H4v2h10v-2zm6-8H4v2h16V9zM4 15h16v-2H4v2zM4 5v2h16V5H4z"/>
        </svg>
        words
      </button>
      <div className="cfg-div" />
      {mode === 'time'  && [15,30,60,120].map(t => (
        <button key={t} className={`cfg-btn${timeLimit===t?' active':''}`} onClick={() => setTimeLimit(t)}>{t}</button>
      ))}
      {mode === 'words' && [10,25,50,100].map(n => (
        <button key={n} className={`cfg-btn${wordCount===n?' active':''}`} onClick={() => setWordCount(n)}>{n}</button>
      ))}
    </div>
  )
}