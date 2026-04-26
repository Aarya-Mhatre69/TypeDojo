import { useState, useEffect, useRef } from 'react'
import {
  LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import useStore from '../store/useStore'
import { getBeltForWpm, getNextBelt, BELTS } from '../utils/helpers'
import BeltBadge from './BeltBadge'
import KeyboardHeatmap from './KeyboardHeatmap'

// ── Animated number counter ───────────────────────────────────────────────────
function Counter({ target, duration = 1200, suffix = '' }) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    let start = null
    const step = (ts) => {
      if (!start) start = ts
      const p = Math.min((ts - start) / duration, 1)
      setVal(Math.round(p * target))
      if (p < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, duration])
  return <>{val}{suffix}</>
}

// ── Belt unlock overlay ───────────────────────────────────────────────────────
function BeltUnlockOverlay({ belt, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3200)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <div className="belt-unlock-overlay" onClick={onDone}>
      <div className="belt-unlock-card">
        <div className="belt-unlock-burst" />
        <div className="belt-unlock-badge">
          <BeltBadge wpm={belt.min} size="lg" animate />
        </div>
        <h2 className="belt-unlock-title">Belt Unlocked!</h2>
        <p className="belt-unlock-name" style={{ color: belt.color }}>{belt.name}</p>
        <p className="belt-unlock-hint">Tap to continue</p>
      </div>
    </div>
  )
}

export default function ResultScreen() {
  const {
    results, resetTest,
    bestWpm, totalTests, currentBeltTier,
    recentScores, newBeltUnlocked, clearBeltUnlock,
    mode, timeLimit, wordCount,
  } = useStore()

  const [showOverlay, setShowOverlay] = useState(false)

  useEffect(() => {
    if (newBeltUnlocked) {
      setTimeout(() => setShowOverlay(true), 800)
    }
  }, [newBeltUnlocked])

  if (!results) return null

  const { wpm, accuracy, correct, incorrect, elapsed, wpmHistory, mistakeMap } = results
  const belt     = getBeltForWpm(wpm)
  const nextBelt = getNextBelt(belt.tier)
  const wpmToNext = nextBelt.tier > belt.tier ? nextBelt.min - wpm : 0
  const avgWpm = recentScores.length
    ? Math.round(recentScores.reduce((a, b) => a + b, 0) / recentScores.length)
    : wpm

  const chartData = wpmHistory.filter((_, i) => i % 2 === 0).map(p => ({
    t: `${p.time}s`, wpm: p.wpm,
  }))

  const modeLabel = mode === 'time' ? `${timeLimit}s` : `${wordCount} words`

  return (
    <>
      {showOverlay && (
        <BeltUnlockOverlay
          belt={BELTS[currentBeltTier]}
          onDone={() => { setShowOverlay(false); clearBeltUnlock() }}
        />
      )}

      <div className="result-screen">
        {/* ── Hero stats ── */}
        <div className="result-hero">
          <div className="result-belt-col">
            <BeltBadge wpm={wpm} size="lg" animate />
          </div>

          <div className="result-stats-col">
            <div className="stat-card stat-card--primary">
              <div className="stat-label">WPM</div>
              <div className="stat-value stat-value--wpm">
                <Counter target={wpm} duration={1000} />
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Accuracy</div>
              <div className="stat-value">
                <Counter target={accuracy} duration={900} suffix="%" />
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Mode</div>
              <div className="stat-value stat-value--sm">{modeLabel}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Time</div>
              <div className="stat-value stat-value--sm">{Math.round(elapsed)}s</div>
            </div>
          </div>
        </div>

        {/* ── Secondary stats row ── */}
        <div className="result-secondary">
          <div className="mini-stat">
            <span className="mini-stat__label">Correct</span>
            <span className="mini-stat__val mini-stat__val--correct">{correct}</span>
          </div>
          <div className="mini-stat">
            <span className="mini-stat__label">Errors</span>
            <span className="mini-stat__val mini-stat__val--wrong">{incorrect}</span>
          </div>
          <div className="mini-stat">
            <span className="mini-stat__label">Best WPM</span>
            <span className="mini-stat__val">{bestWpm}</span>
          </div>
          <div className="mini-stat">
            <span className="mini-stat__label">Avg (last 10)</span>
            <span className="mini-stat__val">{avgWpm}</span>
          </div>
          <div className="mini-stat">
            <span className="mini-stat__label">Tests</span>
            <span className="mini-stat__val">{totalTests}</span>
          </div>
        </div>

        {/* ── Belt progress ── */}
        {wpmToNext > 0 && (
          <div className="belt-progress-row">
            <span className="belt-progress-label">
              {wpmToNext} WPM to <span style={{ color: nextBelt.color }}>{nextBelt.name}</span>
            </span>
            <div className="belt-progress-track">
              <div
                className="belt-progress-fill"
                style={{
                  width: `${Math.min(100, ((wpm - belt.min) / (nextBelt.min - belt.min)) * 100)}%`,
                  background: `linear-gradient(90deg, ${belt.color}, ${nextBelt.color})`,
                }}
              />
            </div>
          </div>
        )}
        {wpmToNext === 0 && (
          <div className="belt-max-label" style={{ color: belt.color }}>
            🥷 Maximum rank achieved
          </div>
        )}

        {/* ── WPM chart ── */}
        {chartData.length > 1 && (
          <div className="glass-card result-chart-card">
            <h3 className="card-title">WPM over time</h3>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" />
                <XAxis dataKey="t" tick={{ fill: 'var(--text-dim)', fontSize: 11 }} />
                <YAxis tick={{ fill: 'var(--text-dim)', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(20,20,35,0.95)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 8,
                    color: '#fff',
                  }}
                />
                <Line
                  type="monotone" dataKey="wpm"
                  stroke="var(--accent)"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 5, fill: 'var(--accent)' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* ── Keyboard heatmap ── */}
        <div className="glass-card">
          <KeyboardHeatmap mistakeMap={mistakeMap} />
        </div>

        {/* ── Actions ── */}
        <div className="result-actions">
          <button className="btn-primary" onClick={resetTest}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
            </svg>
            Try Again
          </button>
          <button className="btn-secondary" onClick={resetTest}>
            New Test
          </button>
        </div>
      </div>
    </>
  )
}