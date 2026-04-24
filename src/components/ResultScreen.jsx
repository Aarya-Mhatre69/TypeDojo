import { useState, useEffect } from 'react'
import {
  LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import useStore from '../store/useStore'

// ── Animated counter ──────────────────────────────────────────────────────────
function Counter({ to, duration = 900, suffix = '' }) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    let raf, start
    const step = (ts) => {
      if (!start) start = ts
      const p = Math.min((ts - start) / duration, 1)
      // ease-out cubic
      const eased = 1 - Math.pow(1 - p, 3)
      setVal(Math.round(eased * to))
      if (p < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [to, duration])
  return <>{val}{suffix}</>
}

// ── Chart tooltip ─────────────────────────────────────────────────────────────
function ChartTip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: '#2c2e31', border: '1px solid #3c3e41',
      borderRadius: 6, padding: '6px 12px',
      fontFamily: 'Roboto Mono, monospace', fontSize: '0.75rem',
    }}>
      <div style={{ color: '#646669', marginBottom: 2 }}>{label}s</div>
      <div style={{ color: '#e2b714', fontWeight: 600 }}>{payload[0]?.value} wpm</div>
    </div>
  )
}

// ── ResultScreen ──────────────────────────────────────────────────────────────
export default function ResultScreen() {
  const { results, resetTest } = useStore()
  if (!results) return null

  const { wpm, rawWpm, accuracy, time, chars, wpmHistory } = results
  const chartData = wpmHistory?.length >= 2
    ? wpmHistory
    : [{ time: 0, wpm: 0 }, { time, wpm }]

  return (
    <div className="result-wrap">

      {/* Hero numbers */}
      <div className="result-hero">
        <div className="stat-blk">
          <span className="stat-lbl">wpm</span>
          <span className="stat-val hero">
            <Counter to={wpm} duration={1000} />
          </span>
        </div>
        <div className="stat-blk">
          <span className="stat-lbl">acc</span>
          <span className="stat-val hero">
            <Counter to={accuracy} duration={800} suffix="%" />
          </span>
        </div>
        <div className="result-sub">
          <div className="stat-blk">
            <span className="stat-lbl">raw</span>
            <span className="stat-val"><Counter to={rawWpm} duration={700} /></span>
          </div>
          <div className="stat-blk">
            <span className="stat-lbl">time</span>
            <span className="stat-val">{time}s</span>
          </div>
        </div>
      </div>

      <div className="result-divider" />

      {/* WPM chart */}
      <div className="chart-area">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 8, right: 10, left: -28, bottom: 0 }}>
            <CartesianGrid stroke="#2c2e31" strokeDasharray="4 4" vertical={false} />
            <XAxis
              dataKey="time"
              tick={{ fill: '#646669', fontSize: 10, fontFamily: 'Roboto Mono, monospace' }}
              tickLine={false}
              axisLine={{ stroke: '#2c2e31' }}
            />
            <YAxis
              tick={{ fill: '#646669', fontSize: 10, fontFamily: 'Roboto Mono, monospace' }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<ChartTip />}
              cursor={{ stroke: '#646669', strokeWidth: 1, strokeDasharray: '4 4' }} />
            <Line
              type="monotone" dataKey="wpm"
              stroke="#e2b714" strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: '#e2b714', strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Chars breakdown */}
      <div className="chars-row">
        <span style={{ marginRight: 4 }}>characters</span>
        <span className="c-correct">{chars.correct}</span>
        <span className="c-slash">/</span>
        <span className="c-error">{chars.incorrect}</span>
        <span className="c-slash">/</span>
        <span style={{ color: 'var(--sub)' }}>{chars.extra}</span>
        <span className="c-slash">/</span>
        <span style={{ color: 'var(--sub)' }}>{chars.missed}</span>
        <span className="c-label">correct / incorrect / extra / missed</span>
      </div>

      {/* Actions */}
      <div className="result-actions">
        <button className="btn-action primary" onClick={resetTest}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99
              8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112
              18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13
              11h7V4l-2.35 2.35z"/>
          </svg>
          next test
        </button>
        <button className="btn-action secondary" onClick={resetTest}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0
              2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93
              13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2
              .76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76
              1.58V19z"/>
          </svg>
          same test
        </button>
        <span className="result-hint">
          <kbd className="kbd">tab</kbd>+<kbd className="kbd">enter</kbd> to restart
        </span>
      </div>
    </div>
  )
}