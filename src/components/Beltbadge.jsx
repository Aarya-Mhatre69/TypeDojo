import { useEffect, useState } from 'react'
import { BELTS, getBeltForWpm } from '../utils/helpers'

export default function BeltBadge({ wpm, animate = false, size = 'md' }) {
  const [visible, setVisible] = useState(!animate)
  const belt = getBeltForWpm(wpm)

  useEffect(() => {
    if (animate) {
      const t = setTimeout(() => setVisible(true), 300)
      return () => clearTimeout(t)
    }
  }, [animate])

  const sizes = {
    sm: { badge: 36, font: '0.6rem', icon: '1rem' },
    md: { badge: 64, font: '0.75rem', icon: '1.8rem' },
    lg: { badge: 96, font: '0.9rem', icon: '2.8rem' },
  }
  const s = sizes[size] || sizes.md

  return (
    <div
      className={`belt-badge belt-badge--${size} ${visible ? 'belt-badge--visible' : ''}`}
      style={{ '--belt-color': belt.color, '--belt-glow': belt.glow }}
    >
      <div className="belt-badge__ring">
        <div className="belt-badge__inner">
          <span className="belt-badge__icon" style={{ fontSize: s.icon }}>
            {belt.emoji}
          </span>
        </div>
      </div>
      <div className="belt-badge__label" style={{ fontSize: s.font }}>
        {belt.name}
      </div>
      {animate && visible && (
        <div className="belt-badge__burst" />
      )}
    </div>
  )
}

// ── Mini belt pill for header ────────────────────────────────────────────────
export function BeltPill({ tier }) {
  const belt = BELTS[tier] || BELTS[0]
  return (
    <div className="belt-pill" style={{ '--belt-color': belt.color, '--belt-glow': belt.glow }}>
      <span>{belt.emoji}</span>
      <span>{belt.name}</span>
    </div>
  )
}   