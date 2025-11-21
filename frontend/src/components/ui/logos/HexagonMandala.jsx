/**
 * Hexagon Mandala Logo
 * Combines hexagonal symmetry (6 outer points) with inner triangle (3 points)
 * Perfect fusion of balance and mystical geometry
 */
export const HexagonMandala = ({ size = 64 }) => {
  const centerX = 50
  const centerY = 50
  const outerRadius = 35 // Outer hexagon points
  const innerRadius = 22 // Inner triangle points - increased for better balance
  
  // Generate 6 outer hexagon points at 60° intervals
  const outerPoints = Array.from({ length: 6 }, (_, i) => {
    const angle = -Math.PI / 2 + (Math.PI * 2 * i) / 6
    return {
      x: centerX + outerRadius * Math.cos(angle),
      y: centerY + outerRadius * Math.sin(angle),
    }
  })
  
  // Generate 3 inner triangle points at 120° intervals
  const innerPoints = Array.from({ length: 3 }, (_, i) => {
    const angle = -Math.PI / 2 + (Math.PI * 2 * i) / 3
    return {
      x: centerX + innerRadius * Math.cos(angle),
      y: centerY + innerRadius * Math.sin(angle),
    }
  })
  
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block' }}
    >
      <defs>
        {/* Outer point gradient - Gold */}
        <radialGradient id="hexMandalaOuterPoint">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
          <stop offset="40%" stopColor="#ffd700" stopOpacity="0.95" />
          <stop offset="70%" stopColor="#d4af37" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#d4af37" stopOpacity="0" />
        </radialGradient>
        
        {/* Inner point gradient - Cyan */}
        <radialGradient id="hexMandalaInnerPoint">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
          <stop offset="40%" stopColor="#00ffff" stopOpacity="0.95" />
          <stop offset="70%" stopColor="#00d9ff" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#00d9ff" stopOpacity="0" />
        </radialGradient>
        
        {/* Central orb gradient */}
        <radialGradient id="hexMandalaOrb">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
          <stop offset="30%" stopColor="#ffd700" stopOpacity="0.95" />
          <stop offset="70%" stopColor="#d4af37" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#b8860b" stopOpacity="0.7" />
        </radialGradient>
        
        {/* Outer aurora gradient - Gold */}
        <linearGradient id="hexMandalaAuroraGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffd700" stopOpacity="0.5" />
          <stop offset="50%" stopColor="#d4af37" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#ffd700" stopOpacity="0.1" />
        </linearGradient>
        
        {/* Inner aurora gradient - Cyan */}
        <linearGradient id="hexMandalaAuroraCyan" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00ffff" stopOpacity="0.6" />
          <stop offset="50%" stopColor="#00d9ff" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#00ffff" stopOpacity="0.2" />
        </linearGradient>
      </defs>
      
      {/* Background circle */}
      <circle
        cx={centerX}
        cy={centerY}
        r="48"
        fill="none"
        stroke="url(#hexMandalaAuroraGold)"
        strokeWidth="0.3"
        strokeDasharray="2,3"
        opacity="0.3"
      />
      
      {/* Outer hexagon star pattern - Star of David effect */}
      {outerPoints.map((point, i) => {
        // Create Star of David by connecting alternating triangles
        const nextIndex = (i + 2) % 6
        const nextPoint = outerPoints[nextIndex]
        return (
          <line
            key={`outer-star-${i}`}
            x1={point.x}
            y1={point.y}
            x2={nextPoint.x}
            y2={nextPoint.y}
            stroke="url(#hexMandalaAuroraGold)"
            strokeWidth="0.8"
            opacity="0.6"
          />
        )
      })}
      
      {/* Hexagon perimeter */}
      <path
        d={`M ${outerPoints[0].x},${outerPoints[0].y} ${outerPoints.map(p => `L ${p.x},${p.y}`).join(' ')} Z`}
        fill="none"
        stroke="url(#hexMandalaAuroraGold)"
        strokeWidth="0.6"
        opacity="0.5"
      />
      
      {/* Inner triangle perimeter - more visible */}
      <path
        d={`M ${innerPoints[0].x},${innerPoints[0].y} ${innerPoints.map(p => `L ${p.x},${p.y}`).join(' ')} Z`}
        fill="none"
        stroke="url(#hexMandalaAuroraCyan)"
        strokeWidth="0.8"
        opacity="0.7"
      />
      
      {/* Removed center connections for cleaner look */}
      
      {/* Enhanced mandala web - connect each outer point to nearest inner points */}
      {outerPoints.map((outerPoint, i) => {
        // Better connection logic: each outer point connects to 2 nearest inner points
        // This creates a more balanced mandala pattern
        const angle = -Math.PI / 2 + (Math.PI * 2 * i) / 6
        const innerAngle1 = Math.floor((angle + Math.PI / 2) / (Math.PI * 2 / 3))
        const innerAngle2 = (innerAngle1 + 1) % 3
        
        return (
          <g key={`mandala-${i}`}>
            <line
              x1={outerPoint.x}
              y1={outerPoint.y}
              x2={innerPoints[innerAngle1].x}
              y2={innerPoints[innerAngle1].y}
              stroke="url(#hexMandalaAuroraCyan)"
              strokeWidth="0.5"
              opacity="0.5"
            />
            <line
              x1={outerPoint.x}
              y1={outerPoint.y}
              x2={innerPoints[innerAngle2].x}
              y2={innerPoints[innerAngle2].y}
              stroke="url(#hexMandalaAuroraCyan)"
              strokeWidth="0.5"
              opacity="0.5"
            />
          </g>
        )
      })}
      
      {/* Central wealth orb */}
      <circle
        cx={centerX}
        cy={centerY}
        r="5"
        fill="url(#hexMandalaOrb)"
      />
      
      {/* Central orb highlight */}
      <circle
        cx={centerX - 1}
        cy={centerY - 1}
        r="2"
        fill="#ffffff"
        opacity="0.8"
      />
      
      {/* Outer hexagon constellation points - larger for visibility */}
      {outerPoints.map((point, i) => (
        <g key={`outer-${i}`}>
          <circle
            cx={point.x}
            cy={point.y}
            r="3.5"
            fill="url(#hexMandalaOuterPoint)"
          />
          <circle
            cx={point.x}
            cy={point.y}
            r="1.7"
            fill="#ffffff"
            opacity="0.95"
          />
        </g>
      ))}
      
      {/* Inner triangle constellation points - larger for visibility */}
      {innerPoints.map((point, i) => (
        <g key={`inner-${i}`}>
          <circle
            cx={point.x}
            cy={point.y}
            r="3"
            fill="url(#hexMandalaInnerPoint)"
          />
          <circle
            cx={point.x}
            cy={point.y}
            r="1.5"
            fill="#ffffff"
            opacity="0.95"
          />
        </g>
      ))}
    </svg>
  )
}
