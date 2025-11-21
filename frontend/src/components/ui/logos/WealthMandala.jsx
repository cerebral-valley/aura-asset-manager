/**
 * Cosmic Constellation - Wealth Mandala (8 Points with Inner Ring)
 * Creative octagonal pattern representing 8 pillars of wealth
 * Dual-layer constellation with inner and outer points
 * Fixed: No glow artifacts, points centered on circumference
 */
export const WealthMandala = ({ size = 64, className = '' }) => {
  // Outer ring: 8 points at 45° intervals
  const outerRadius = 40
  const innerRadius = 25
  const centerX = 50
  const centerY = 50
  
  const outerPoints = Array.from({ length: 8 }, (_, i) => {
    const angle = (i * 45 - 90) * (Math.PI / 180) // -90 to start at top
    return {
      x: centerX + outerRadius * Math.cos(angle),
      y: centerY + outerRadius * Math.sin(angle)
    }
  })

  // Inner ring: 4 points at 90° intervals (rotated 45° from outer)
  const innerPoints = Array.from({ length: 4 }, (_, i) => {
    const angle = (i * 90 - 45) * (Math.PI / 180) // -45 to offset from outer
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
      <defs>
        {/* Gold gradient for central orb */}
        <radialGradient id="mandala-orb-gradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffd700" stopOpacity="1" />
          <stop offset="50%" stopColor="#d4af37" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#b8941f" stopOpacity="0.7" />
        </radialGradient>

        {/* Aurora glow gradient */}
        <radialGradient id="mandala-aurora-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#00d9ff" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#00d9ff" stopOpacity="0" />
        </radialGradient>

        {/* Outer star point gradient */}
        <radialGradient id="mandala-outer-star" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#d4af37" />
        </radialGradient>

        {/* Inner star point gradient */}
        <radialGradient id="mandala-inner-star" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#00d9ff" />
          <stop offset="100%" stopColor="#0099cc" />
        </radialGradient>
      </defs>

      {/* Aurora glow background */}
      <circle cx="50" cy="50" r="45" fill="url(#mandala-aurora-glow)" opacity="0.3" />

      {/* Connection lines - mandala sacred geometry */}
      <g stroke="#00d9ff" strokeWidth="0.5" opacity="0.4">
        {/* Outer octagon */}
        <path 
          d={`M ${outerPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')} Z`}
          fill="none"
        />
        
        {/* Lines from center to outer points */}
        {outerPoints.map((point, i) => (
          <line 
            key={`outer-center-${i}`}
            x1="50" 
            y1="50" 
            x2={point.x} 
            y2={point.y}
            opacity="0.3"
          />
        ))}
        
        {/* Lines from center to inner points */}
        {innerPoints.map((point, i) => (
          <line 
            key={`inner-center-${i}`}
            x1="50" 
            y1="50" 
            x2={point.x} 
            y2={point.y}
            opacity="0.5"
          />
        ))}
        
        {/* Star pattern connecting outer points */}
        {outerPoints.map((point, i) => {
          const nextPoint = outerPoints[(i + 3) % 8]
          return (
            <line 
              key={`star-${i}`}
              x1={point.x} 
              y1={point.y} 
              x2={nextPoint.x} 
              y2={nextPoint.y}
              opacity="0.15"
            />
          )
        })}

        {/* Inner diamond connections */}
        <path 
          d={`M ${innerPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')} Z`}
          fill="none"
          opacity="0.5"
        />
      </g>

      {/* Central wealth orb */}
      <circle 
        cx="50" 
        cy="50" 
        r="10" 
        fill="url(#mandala-orb-gradient)"
      />
      <circle 
        cx="50" 
        cy="50" 
        r="6" 
        fill="#ffd700" 
        opacity="0.7"
      />

      {/* Inner constellation points (4 points - cyan) */}
      {innerPoints.map((point, i) => (
        <g key={`inner-point-${i}`}>
          {/* Subtle glow */}
          <circle 
            cx={point.x} 
            cy={point.y} 
            r="4" 
            fill="url(#mandala-inner-star)" 
            opacity="0.3"
          />
          {/* Main point */}
          <circle 
            cx={point.x} 
            cy={point.y} 
            r="3" 
            fill="url(#mandala-inner-star)"
          />
          {/* Center highlight */}
          <circle 
            cx={point.x} 
            cy={point.y} 
            r="1.5" 
            fill="#ffffff"
          />
        </g>
      ))}

      {/* Outer constellation points (8 points - gold) */}
      {outerPoints.map((point, i) => (
        <g key={`outer-point-${i}`}>
          {/* Subtle glow */}
          <circle 
            cx={point.x} 
            cy={point.y} 
            r="5" 
            fill="url(#mandala-outer-star)" 
            opacity="0.3"
          />
          {/* Main point */}
          <circle 
            cx={point.x} 
            cy={point.y} 
            r="3.5" 
            fill="url(#mandala-outer-star)"
          />
          {/* Center highlight */}
          <circle 
            cx={point.x} 
            cy={point.y} 
            r="1.5" 
            fill="#ffffff"
          />
        </g>
      ))}

      {/* Orbital rings */}
      <circle 
        cx="50" 
        cy="50" 
        r={outerRadius} 
        stroke="#d4af37" 
        strokeWidth="0.4" 
        fill="none" 
        opacity="0.25"
        strokeDasharray="2 2"
      />
      <circle 
        cx="50" 
        cy="50" 
        r={innerRadius} 
        stroke="#00d9ff" 
        strokeWidth="0.4" 
        fill="none" 
        opacity="0.25"
        strokeDasharray="2 2"
      />
    </svg>
  )
}
