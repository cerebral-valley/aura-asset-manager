/**
 * Cosmic Constellation - Hexagonal Symmetry (6 Points)
 * Perfect symmetry with 6 constellation points at 60° intervals
 * Fixed: No glow artifacts, points centered on circumference
 */
export const CosmicHexagon = ({ size = 64, className = '' }) => {
  // Calculate 6 points on circumference at 60° intervals (starting at top)
  const radius = 40
  const centerX = 50
  const centerY = 50
  
  const points = Array.from({ length: 6 }, (_, i) => {
    const angle = (i * 60 - 90) * (Math.PI / 180) // -90 to start at top
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
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
      <defs>
        {/* Gold gradient for central orb */}
        <radialGradient id="hex-orb-gradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffd700" stopOpacity="1" />
          <stop offset="50%" stopColor="#d4af37" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#b8941f" stopOpacity="0.7" />
        </radialGradient>

        {/* Aurora glow gradient */}
        <radialGradient id="hex-aurora-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#00d9ff" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#00d9ff" stopOpacity="0" />
        </radialGradient>

        {/* Star point gradient */}
        <radialGradient id="hex-star-gradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#d4af37" />
        </radialGradient>
      </defs>

      {/* Aurora glow background */}
      <circle cx="50" cy="50" r="45" fill="url(#hex-aurora-glow)" opacity="0.3" />

      {/* Connection lines - hexagonal sacred geometry */}
      <g stroke="#00d9ff" strokeWidth="0.5" opacity="0.4">
        {/* Outer hexagon */}
        <path 
          d={`M ${points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')} Z`}
          fill="none"
        />
        
        {/* Lines from center to each point */}
        {points.map((point, i) => (
          <line 
            key={`center-${i}`}
            x1="50" 
            y1="50" 
            x2={point.x} 
            y2={point.y}
          />
        ))}
        
        {/* Inner connections creating star pattern */}
        {points.map((point, i) => {
          const nextPoint = points[(i + 2) % 6]
          return (
            <line 
              key={`inner-${i}`}
              x1={point.x} 
              y1={point.y} 
              x2={nextPoint.x} 
              y2={nextPoint.y}
              opacity="0.2"
            />
          )
        })}
      </g>

      {/* Central wealth orb */}
      <circle 
        cx="50" 
        cy="50" 
        r="12" 
        fill="url(#hex-orb-gradient)"
      />
      <circle 
        cx="50" 
        cy="50" 
        r="8" 
        fill="#ffd700" 
        opacity="0.6"
      />

      {/* Constellation star points - perfectly centered on circumference */}
      {points.map((point, i) => (
        <g key={`point-${i}`}>
          {/* Outer glow circle */}
          <circle 
            cx={point.x} 
            cy={point.y} 
            r="6" 
            fill="url(#hex-star-gradient)" 
            opacity="0.3"
          />
          {/* Main star point */}
          <circle 
            cx={point.x} 
            cy={point.y} 
            r="4" 
            fill="url(#hex-star-gradient)"
          />
          {/* Center highlight */}
          <circle 
            cx={point.x} 
            cy={point.y} 
            r="2" 
            fill="#ffffff"
          />
        </g>
      ))}

      {/* Orbital ring - dashed circle */}
      <circle 
        cx="50" 
        cy="50" 
        r={radius} 
        stroke="#d4af37" 
        strokeWidth="0.5" 
        fill="none" 
        opacity="0.3"
        strokeDasharray="3 2"
      />
    </svg>
  )
}
