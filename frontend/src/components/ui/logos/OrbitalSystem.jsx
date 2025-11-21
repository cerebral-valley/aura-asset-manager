/**
 * Orbital Wealth System Logo
 * Planetary ring system representing portfolio balance and asset orbits
 */
export const OrbitalSystem = ({ size = 64, className = '' }) => {
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
        {/* Core gradient */}
        <radialGradient id="core-gradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffd700" />
          <stop offset="50%" stopColor="#d4af37" />
          <stop offset="100%" stopColor="#b8941f" />
        </radialGradient>

        {/* Ring gradients */}
        <linearGradient id="ring-1" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#00d9ff" stopOpacity="0.8" />
          <stop offset="50%" stopColor="#00d9ff" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#00d9ff" stopOpacity="0.8" />
        </linearGradient>

        <linearGradient id="ring-2" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.7" />
          <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.7" />
        </linearGradient>

        <linearGradient id="ring-3" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#d4af37" stopOpacity="0.6" />
          <stop offset="50%" stopColor="#d4af37" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#d4af37" stopOpacity="0.6" />
        </linearGradient>

        {/* Glow effect */}
        <filter id="orbital-glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* Outer atmospheric glow */}
      <circle cx="50" cy="50" r="48" fill="#00d9ff" opacity="0.05" />

      {/* Orbital ring 3 (outermost) - rotated */}
      <ellipse 
        cx="50" 
        cy="50" 
        rx="42" 
        ry="12" 
        stroke="url(#ring-3)" 
        strokeWidth="1.5" 
        fill="none"
        transform="rotate(30 50 50)"
        opacity="0.7"
      />

      {/* Asset satellite on ring 3 */}
      <circle cx="85" cy="55" r="3" fill="#d4af37" filter="url(#orbital-glow)" />
      <circle cx="85" cy="55" r="1.5" fill="#ffd700" />

      {/* Orbital ring 2 (middle) */}
      <ellipse 
        cx="50" 
        cy="50" 
        rx="32" 
        ry="10" 
        stroke="url(#ring-2)" 
        strokeWidth="1.5" 
        fill="none"
        transform="rotate(-20 50 50)"
        opacity="0.8"
      />

      {/* Asset satellites on ring 2 */}
      <circle cx="25" cy="45" r="2.5" fill="#8b5cf6" filter="url(#orbital-glow)" />
      <circle cx="25" cy="45" r="1.2" fill="#a78bfa" />
      <circle cx="72" cy="48" r="2.5" fill="#8b5cf6" filter="url(#orbital-glow)" />
      <circle cx="72" cy="48" r="1.2" fill="#a78bfa" />

      {/* Orbital ring 1 (inner) */}
      <ellipse 
        cx="50" 
        cy="50" 
        rx="24" 
        ry="8" 
        stroke="url(#ring-1)" 
        strokeWidth="2" 
        fill="none"
        transform="rotate(10 50 50)"
        opacity="0.9"
      />

      {/* Asset satellites on ring 1 */}
      <circle cx="70" cy="52" r="2" fill="#00d9ff" filter="url(#orbital-glow)" />
      <circle cx="70" cy="52" r="1" fill="#ffffff" />
      <circle cx="32" cy="53" r="2" fill="#00d9ff" filter="url(#orbital-glow)" />
      <circle cx="32" cy="53" r="1" fill="#ffffff" />

      {/* Central wealth core */}
      <circle 
        cx="50" 
        cy="50" 
        r="14" 
        fill="url(#core-gradient)" 
        filter="url(#orbital-glow)"
      />
      <circle 
        cx="50" 
        cy="50" 
        r="10" 
        fill="#ffd700" 
        opacity="0.7"
      />
      <circle 
        cx="50" 
        cy="50" 
        r="6" 
        fill="#ffffff" 
        opacity="0.4"
      />

      {/* Subtle letter "A" in negative space (optional) */}
      <g opacity="0.2">
        <path 
          d="M 45 58 L 50 42 L 55 58 M 47 52 L 53 52" 
          stroke="#0a1628" 
          strokeWidth="2" 
          strokeLinecap="round"
          fill="none"
        />
      </g>

      {/* Motion trails (subtle) */}
      <g stroke="#ffffff" strokeWidth="0.5" opacity="0.2" fill="none" strokeDasharray="2 3">
        <ellipse cx="50" cy="50" rx="42" ry="12" transform="rotate(30 50 50)" />
        <ellipse cx="50" cy="50" rx="32" ry="10" transform="rotate(-20 50 50)" />
        <ellipse cx="50" cy="50" rx="24" ry="8" transform="rotate(10 50 50)" />
      </g>
    </svg>
  )
}
