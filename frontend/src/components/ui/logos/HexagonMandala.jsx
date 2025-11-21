/**
 * Hexagon Mandala Logo (6 + 3 Points)
 * Redesigned to match Wealth Mandala structure
 * Dual-layer constellation: 6 outer hexagon + 3 inner triangle
 * Sacred geometry pattern following 8+4 mandala design principles
 */
export const HexagonMandala = ({ size = 64, className = '' }) => {
  // Outer ring: 6 points at 60° intervals
  const outerRadius = 40
  const innerRadius = 25
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
      <defs>
        {/* Gold gradient for central orb */}
        <radialGradient id="hexMandala-orb-gradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffd700" stopOpacity="1" />
          <stop offset="50%" stopColor="#d4af37" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#b8941f" stopOpacity="0.7" />
        </radialGradient>

        {/* Aurora glow gradient */}
        <radialGradient id="hexMandala-aurora-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#00d9ff" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#00d9ff" stopOpacity="0" />
        </radialGradient>

        {/* Outer star point gradient */}
        <radialGradient id="hexMandala-outer-star" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#d4af37" />
        </radialGradient>

        {/* Inner star point gradient */}
        <radialGradient id="hexMandala-inner-star" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#00d9ff" />
          <stop offset="100%" stopColor="#0099cc" />
        </radialGradient>
      </defs>

      {/* Aurora glow background */}
      <circle cx="50" cy="50" r="45" fill="url(#hexMandala-aurora-glow)" opacity="0.3" />

      {/* Connection lines - mandala sacred geometry */}
      <g stroke="#00d9ff" strokeWidth="0.5" opacity="0.4">
        {/* Outer hexagon */}
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
        
        {/* Star pattern connecting outer points (every 2nd point for hexagon) */}
        {outerPoints.map((point, i) => {
          const nextPoint = outerPoints[(i + 2) % 6]
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

        {/* Inner triangle connections */}
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
        fill="url(#hexMandala-orb-gradient)"
      />
      <circle 
        cx="50" 
        cy="50" 
        r="6" 
        fill="#ffd700" 
        opacity="0.7"
      />

      {/* Inner constellation points (3 points - cyan) */}
      {innerPoints.map((point, i) => (
        <g key={`inner-point-${i}`}>
          {/* Subtle glow */}
          <circle 
            cx={point.x} 
            cy={point.y} 
            r="4" 
            fill="url(#hexMandala-inner-star)" 
            opacity="0.3"
          />
          {/* Main point */}
          <circle 
            cx={point.x} 
            cy={point.y} 
            r="3" 
            fill="url(#hexMandala-inner-star)"
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

      {/* Outer constellation points (6 points - gold) */}
      {outerPoints.map((point, i) => (
        <g key={`outer-point-${i}`}>
          {/* Subtle glow */}
          <circle 
            cx={point.x} 
            cy={point.y} 
            r="5" 
            fill="url(#hexMandala-outer-star)" 
            opacity="0.3"
          />
          {/* Main point */}
          <circle 
            cx={point.x} 
            cy={point.y} 
            r="3.5" 
            fill="url(#hexMandala-outer-star)"
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
