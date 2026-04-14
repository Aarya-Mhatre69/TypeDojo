import { useEffect } from 'react'
import './index.css'
import ConfigBar    from './components/ConfigBar'
import TypingTest   from './components/TypingTest'
import ResultScreen from './components/ResultScreen'
import useStore     from './store/useStore'

export default function App() {
  const { testState, resetTest } = useStore()

  // Tab + Enter = restart globally
  useEffect(() => {
    let tab = false
    const dn = (e) => {
      if (e.key === 'Tab')              { e.preventDefault(); tab = true }
      if (e.key === 'Enter' && tab)     { e.preventDefault(); resetTest() }
    }
    const up = (e) => { if (e.key === 'Tab') tab = false }
    window.addEventListener('keydown', dn)
    window.addEventListener('keyup',   up)
    return () => { window.removeEventListener('keydown', dn); window.removeEventListener('keyup', up) }
  }, [resetTest])

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

function Header({ onLogo }) {
  return (
    <header className="header">
      <button className="logo" onClick={onLogo}>
        <span className="logo-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 5H4a1 1 0 00-1 1v10a1 1 0 001 1h16a1 1 0 001-1V6a1 1 0 00-1-1zm-9 9H5v-2h6v2zm8 0h-6v-2h6v2zm0-4H5V8h14v2z"/>
          </svg>
        </span>
        TypeDojo
      </button>
      <nav className="nav">
        {[
          ['test',        'M20 5H4a1 1 0 00-1 1v10a1 1 0 001 1h16a1 1 0 001-1V6a1 1 0 00-1-1zm-9 9H5v-2h6v2zm8 0h-6v-2h6v2zm0-4H5V8h14v2z'],
          ['leaderboard', 'M7.5 21H2V9h5.5v12zm7.25-18h-5.5v18h5.5V3zM22 11h-5.5v10H22V11z'],
          ['about',       'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z'],
        ].map(([label, path]) => (
          <button key={label} className="nav-btn">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
              <path d={path} />
            </svg>
            {label}
          </button>
        ))}
      </nav>
    </header>
  )
}

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-links">
        {['contact','github','discord','twitter','terms','privacy'].map(l => (
          <button key={l}>{l}</button>
        ))}
      </div>
      <span style={{ color: 'var(--bg3)' }}>TypeDojo v1.0</span>
    </footer>
  )
}