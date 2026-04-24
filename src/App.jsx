import './index.css'
import ConfigBar    from './components/ConfigBar'
import TypingTest   from './components/TypingTest'
import ResultScreen from './components/ResultScreen'
import useStore     from './store/useStore'

// ── App ───────────────────────────────────────────────────────────────────────
// NOTE: NO keyboard listeners here — all handled inside TypingTest to avoid
// duplicate listeners and stale-closure bugs.
export default function App() {
  const { testState, resetTest } = useStore()

  return (
    <div className="app">
      <Header onLogo={resetTest} />

      <main className="main">
        {testState !== 'finished' && (
          <>
            <ConfigBar />
            <TypingTest />
          </>
        )}
        {testState === 'finished' && <ResultScreen />}
      </main>

      <Footer />
    </div>
  )
}

// ── Header ────────────────────────────────────────────────────────────────────
function Header({ onLogo }) {
  return (
    <header className="header">
      <button className="logo" onClick={onLogo} title="Go to home">
        <span className="logo-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 5H4a1 1 0 00-1 1v10a1 1 0 001 1h16a1 1
              0 001-1V6a1 1 0 00-1-1zm-9 9H5v-2h6v2zm8
              0h-6v-2h6v2zm0-4H5V8h14v2z"/>
          </svg>
        </span>
        TypeDojo
      </button>

      <nav className="nav">
        <button className="nav-btn" title="Typing test" onClick={onLogo}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 5H4a1 1 0 00-1 1v10a1 1 0 001 1h16a1 1 0
              001-1V6a1 1 0 00-1-1zm-9 9H5v-2h6v2zm8 0h-6v-2h6v2zm0-4H5V8h14v2z"/>
          </svg>
          test
        </button>

        <button className="nav-btn" title="Leaderboard (coming soon)">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7.5 21H2V9h5.5v12zm7.25-18h-5.5v18h5.5V3zM22 11h-5.5v10H22V11z"/>
          </svg>
          leaderboard
        </button>

        <button className="nav-btn" title="About">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10
              10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
          </svg>
          about
        </button>

        <button className="nav-btn" title="Settings (coming soon)">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.14 12.94c.04-.3.06-.61.06-.94
              0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32
              a.488.488 0 00-.59-.22l-2.39.96a7.02 7.02 0 00-1.62-.94l-.36-2.54
              A.484.484 0 0014 2h-4a.484.484 0 00-.48.41l-.36 2.54a7.34 7.34 0
              00-1.62.94l-2.39-.96a.476.476 0 00-.59.22L2.74 8.87a.47.47 0
              00.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03
              1.58a.47.47 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96
              c.5.38 1.04.7 1.62.94l.36 2.54c.05.24.27.41.49.41h4c.22 0
              .43-.17.47-.41l.36-2.54a7.34 7.34 0 001.62-.94l2.39.96
              c.22.08.47 0 .59-.22l1.92-3.32a.47.47 0 00-.12-.61l-2.01-1.58z
              M12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6
              3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
          </svg>
          settings
        </button>
      </nav>
    </header>
  )
}

// ── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="footer">
      <span className="footer-credit">
        made by <span>Aarya Mhatre</span>
      </span>
      <span className="footer-version">TypeDojo v1.0</span>
    </footer>
  )
}