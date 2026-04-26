const ROWS = [
  ['q','w','e','r','t','y','u','i','o','p'],
  ['a','s','d','f','g','h','j','k','l'],
  ['z','x','c','v','b','n','m'],
]

export default function KeyboardHeatmap({ mistakeMap = {} }) {
  const maxMistakes = Math.max(1, ...Object.values(mistakeMap))

  function getIntensity(key) {
    const count = mistakeMap[key] || 0
    return count / maxMistakes
  }

  function getKeyColor(intensity) {
    if (intensity === 0) return 'rgba(255,255,255,0.06)'
    // Gradient: subtle yellow → orange → red
    const r = Math.round(80 + intensity * 175)
    const g = Math.round(80 - intensity * 60)
    const b = Math.round(80 - intensity * 60)
    return `rgba(${r},${g},${b},${0.3 + intensity * 0.7})`
  }

  const totalMistakes = Object.values(mistakeMap).reduce((a, b) => a + b, 0)
  const worstKey = Object.entries(mistakeMap).sort((a, b) => b[1] - a[1])[0]

  return (
    <div className="heatmap-container">
      <div className="heatmap-header">
        <h3 className="heatmap-title">Mistake Heatmap</h3>
        {worstKey && (
          <span className="heatmap-worst">
            Weakest key: <strong style={{ color: '#e53935' }}>"{worstKey[0]}"</strong>
            <span className="heatmap-count"> ({worstKey[1]} errors)</span>
          </span>
        )}
        {!worstKey && (
          <span className="heatmap-perfect">Perfect — no mistakes! 🎯</span>
        )}
      </div>

      <div className="keyboard">
        {ROWS.map((row, ri) => (
          <div key={ri} className={`keyboard__row keyboard__row--${ri}`}>
            {row.map(key => {
              const intensity = getIntensity(key)
              const count = mistakeMap[key] || 0
              return (
                <div
                  key={key}
                  className={`key ${intensity > 0 ? 'key--mistake' : ''}`}
                  style={{ backgroundColor: getKeyColor(intensity) }}
                  title={count > 0 ? `"${key}": ${count} mistake${count !== 1 ? 's' : ''}` : key}
                >
                  <span className="key__label">{key}</span>
                  {count > 0 && (
                    <span className="key__count">{count}</span>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {totalMistakes > 0 && (
        <div className="heatmap-legend">
          <span className="legend-label">Few mistakes</span>
          <div className="legend-bar" />
          <span className="legend-label">Many mistakes</span>
        </div>
      )}
    </div>
  )
}