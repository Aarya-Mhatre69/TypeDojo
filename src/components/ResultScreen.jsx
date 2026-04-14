import { useState, useEffect } from 'react'
import {
  LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import useStore from '../store/useStore'

// animated number counter
function Counter({ target, duration = 800 }) {
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
  return <>{val}</>
}

const ChartTip = ({ active, payload, label }) => {
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

export default function ResultScreen() {
  const { results, resetTest } = useStore()
  if (!results) return null
  const { wpm, rawWpm, accuracy, time, chars, wpmHistory } = results
  const chartData = wpmHistory.length ? wpmHistory : [{ time: 0, wpm: 0 }, { time, wpm }]

  return (
    <div className="result-wrap">

      {/* Hero stats */}
      <div className="result-hero">
        <div className="stat-blk">
          <span className="stat-lbl">wpm</span>
          <span className="stat-val hero"><Counter target={wpm} duration={900} /></span>
        </div>
        <div className="stat-blk">
          <span className="stat-lbl">acc</span>
          <span className="stat-val hero"><Counter target={accuracy} duration={700} />%</span>
        </div>
        <div className="result-sub">
          <div className="stat-blk">
            <span className="stat-lbl">raw</span>
            <span className="stat-val"><Counter target={rawWpm} /></span>
          </div>
          <div className="stat-blk">
            <span className="stat-lbl">time</span>
            <span className="stat-val">{time}s</span>
          </div>
        </div>
      </div>

      {/* WPM over time chart */}
      <div className="chart-area">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 8, right: 8, left: -28, bottom: 0 }}>
            <CartesianGrid stroke="#2c2e31" strokeDasharray="4 4" vertical={false} />
            <XAxis
              dataKey="time"
              tick={{ fill: '#646669', fontSize: 10, fontFamily: 'monospace' }}
              tickLine={false} axisLine={{ stroke: '#2c2e31' }}
            />
            <YAxis
              tick={{ fill: '#646669', fontSize: 10, fontFamily: 'monospace' }}
              tickLine={false} axisLine={false}
            />
            <Tooltip content={<ChartTip />} cursor={{ stroke: '#646669', strokeWidth: 1, strokeDasharray: '3 3' }} />
            <Line type="monotone" dataKey="wpm" stroke="#e2b714" strokeWidth={2}
              dot={false} activeDot={{ r: 4, fill: '#e2b714', strokeWidth: 0 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Characters breakdown */}
      <div className="chars-row">
        <span style={{ marginRight: 4 }}>characters</span>
        <span className="char-stat-correct">{chars.correct}</span>
        <span className="char-slash">/</span>
        <span className="char-stat-incorrect">{chars.incorrect}</span>
        <span className="char-slash">/</span>
        <span style={{ color: '#646669' }}>{chars.extra}</span>
        <span className="char-slash">/</span>
        <span style={{ color: '#646669' }}>{chars.missed}</span>
        <span style={{ color: '#3c3e41', fontSize: '0.72rem', marginLeft: 8 }}>
          correct / incorrect / extra / missed
        </span>
      </div>

      {/* Actions */}
      <div className="result-actions">
        <button className="btn-restart primary" onClick={resetTest}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
          </svg>
          next test
        </button>
        <button className="btn-restart" onClick={resetTest}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
          </svg>
          same test
        </button>
      </div>
    </div>
  )
}