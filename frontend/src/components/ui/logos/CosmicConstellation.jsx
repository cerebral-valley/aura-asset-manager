/**
 * Cosmic Wealth Constellation Logo
 * Sacred geometry with central orb and 5 constellation points
 */
export const CosmicConstellation = ({ size = 64, className = '' }) => {
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
        <radialGradient id="orb-gradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffd700" stopOpacity="1" />
          <stop offset="50%" stopColor="#d4af37" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#b8941f" stopOpacity="0.7" />
        </radialGradient>

        {/* Aurora glow gradient */}
        <radialGradient id="aurora-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#00d9ff" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#00d9ff" stopOpacity="0" />
        </radialGradient>

        {/* Star point gradient */}
        <linearGradient id="star-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#d4af37" />
        </linearGradient>

        {/* Glow filter */}
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* Aurora glow background */}
      <circle cx="50" cy="50" r="45" fill="url(#aurora-glow)" opacity="0.3" />

      {/* Connection lines (sacred geometry) */}
      <g stroke="#00d9ff" strokeWidth="0.5" opacity="0.4">
        {/* Pentagon connections */}
        <path d="M 50 15 L 85 35 L 75 70 L 25 70 L 15 35 Z" fill="none" />
        {/* Star connections to center */}
        <line x1="50" y1="50" x2="50" y2="15" />
        <line x1="50" y1="50" x2="85" y2="35" />
        <line x1="50" y1="50" x2="75" y2="70" />
        <line x1="50" y1="50" x2="25" y2="70" />
        <line x1="50" y1="50" x2="15" y2="35" />
      </g>

      {/* Central wealth orb */}
      <circle 
        cx="50" 
        cy="50" 
        r="12" 
        fill="url(#orb-gradient)" 
        filter="url(#glow)"
      />
      <circle 
        cx="50" 
        cy="50" 
        r="8" 
        fill="#ffd700" 
        opacity="0.6"
      />

      {/* Constellation star points (5 points) */}
      {/* Top */}
      <circle cx="50" cy="15" r="4" fill="url(#star-gradient)" filter="url(#glow)" />
      <circle cx="50" cy="15" r="2" fill="#ffffff" />

      {/* Top right */}
      <circle cx="85" cy="35" r="4" fill="url(#star-gradient)" filter="url(#glow)" />
      <circle cx="85" cy="35" r="2" fill="#ffffff" />

      {/* Bottom right */}
      <circle cx="75" cy="70" r="4" fill="url(#star-gradient)" filter="url(#glow)" />
      <circle cx="75" cy="70" r="2" fill="#ffffff" />

      {/* Bottom left */}
      <circle cx="25" cy="70" r="4" fill="url(#star-gradient)" filter="url(#glow)" />
      <circle cx="25" cy="70" r="2" fill="#ffffff" />

      {/* Top left */}
      <circle cx="15" cy="35" r="4" fill="url(#star-gradient)" filter="url(#glow)" />
      <circle cx="15" cy="35" r="2" fill="#ffffff" />

      {/* Orbital ring */}
      <circle 
        cx="50" 
        cy="50" 
        r="40" 
        stroke="url(#star-gradient)" 
        strokeWidth="0.5" 
        fill="none" 
        opacity="0.3"
        strokeDasharray="2 3"
      />
    </svg>
  )
}
