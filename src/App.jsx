import './index.css'
import ConfigBar    from './components/ConfigBar'
import TypingTest   from './components/TypingTest'
import ResultScreen from './components/ResultScreen'
import { BeltPill } from './components/BeltBadge'
import useStore     from './store/useStore'

export default function App() {
  const { testState, currentBeltTier, totalTests, bestWpm, resetTest } = useStore()
  const isFinished = testState === 'finished'
  const isRunning  = testState === 'running'

  return (
    <div className={`app ${isRunning ? 'app--running' : ''}`}>
      {/* Animated mesh background */}
      <div className="bg-mesh" aria-hidden="true">
        <div className="bg-orb bg-orb--1" />
        <div className="bg-orb bg-orb--2" />
        <div className="bg-orb bg-orb--3" />
      </div>

      {/* Header */}
      <header className={`header ${isRunning ? 'header--hidden' : ''}`}>
        <div className="header__left">
          <div className="logo" onClick={resetTest} title="Reset test">
            <span className="logo__icon">🥋</span>
            <span className="logo__text">Type<span className="logo__accent">Dojo</span></span>
          </div>
        </div>

        <div className="header__right">
          {totalTests > 0 && (
            <div className="header-stats">
              <span className="header-stat">
                <span className="header-stat__label">Best</span>
                <span className="header-stat__val">{bestWpm}</span>
              </span>
              <span className="header-stat">
                <span className="header-stat__label">Tests</span>
                <span className="header-stat__val">{totalTests}</span>
              </span>
            </div>
          )}
          <BeltPill tier={currentBeltTier} />
        </div>
      </header>

      {/* Main */}
      <main className="main">
        {!isFinished ? (
          <div className={`test-container ${isRunning ? 'test-container--running' : ''}`}>
            <ConfigBar />
            <TypingTest />
          </div>
        ) : (
          <ResultScreen />
        )}
      </main>

      {/* Footer */}
      {!isRunning && !isFinished && (
        <footer className="footer">
          <span>TypeDojo — Made by AaryaMhatre </span>
        </footer>
      )}
    </div>
  )
}