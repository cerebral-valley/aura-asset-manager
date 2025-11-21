/**
 * Minimalist Mandala Logo (6 + 3 Points)
 * Clean, refined version of Hexagon Mandala
 * No glows, aurora, or orbital rings - pure geometric elegance
 * Focus: Sacred geometry, negative space, and precise lines
 */
export const MinimalistMandala = ({ size = 64, className = '' }) => {
  // Outer ring: 6 points at 60° intervals
  const outerRadius = 38
  const innerRadius = 24
  const centerX = 50
  const centerY = 50
  
  const outerPoints = Array.from({ length: 6 }, (_, i) => {
    const angle = (i * 60 - 90) * (Math.PI / 180) // -90 to start at top
    return {
      x: centerX + outerRadius * Math.cos(angle),
      y: centerY + outerRadius * Math.sin(angle)
    }
  })

  // Inner ring: 3 points at 120° intervals
  const innerPoints = Array.from({ length: 3 }, (_, i) => {
    const angle = (i * 120 - 90) * (Math.PI / 180) // -90 to start at top
    return {
      x: centerX + innerRadius * Math.cos(angle),
      y: centerY + innerRadius * Math.sin(angle)
    }
  })

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Sacred geometry connection lines - thin and subtle */}
      <g stroke="#d4af37" strokeWidth="0.8" opacity="0.6">
        {/* Outer hexagon perimeter */}
        <path 
          d={`M ${outerPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')} Z`}
          fill="none"
        />
        
        {/* Inner triangle perimeter */}
        <path 
          d={`M ${innerPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')} Z`}
          fill="none"
          strokeWidth="0.9"
        />
        
        {/* Star of David pattern (every 2nd outer point) - more visible */}
        {outerPoints.map((point, i) => {
          const nextPoint = outerPoints[(i + 2) % 6]
          return (
            <line 
              key={`star-${i}`}
              x1={point.x} 
              y1={point.y} 
              x2={nextPoint.x} 
              y2={nextPoint.y}
              opacity="0.35"
              strokeWidth="0.7"
            />
          )
        })}
      </g>

      {/* Central wealth orb - solid, no gradient */}
      <circle 
        cx="50" 
        cy="50" 
        r="7" 
        fill="#ffd700"
        opacity="0.9"
      />
      <circle 
        cx="50" 
        cy="50" 
        r="4" 
        fill="#ffffff" 
        opacity="0.3"
      />

      {/* Inner constellation points (3 points - cyan) - flat, no glow */}
      {innerPoints.map((point, i) => (
        <g key={`inner-point-${i}`}>
          {/* Main point - solid cyan */}
          <circle 
            cx={point.x} 
            cy={point.y} 
            r="2.5" 
            fill="#00d9ff"
          />
          {/* Minimal highlight */}
          <circle 
            cx={point.x} 
            cy={point.y} 
            r="1" 
            fill="#ffffff"
            opacity="0.6"
          />
        </g>
      ))}

      {/* Outer constellation points (6 points - gold) - flat, no glow */}
      {outerPoints.map((point, i) => (
        <g key={`outer-point-${i}`}>
          {/* Main point - solid gold */}
          <circle 
            cx={point.x} 
            cy={point.y} 
            r="3" 
            fill="#d4af37"
          />
          {/* Minimal highlight */}
          <circle 
            cx={point.x} 
            cy={point.y} 
            r="1" 
            fill="#ffffff"
            opacity="0.6"
          />
        </g>
      ))}
    </svg>
  )
}
