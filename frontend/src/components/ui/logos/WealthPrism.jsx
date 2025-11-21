/**
 * Wealth Prism Logo
 * Geometric crystal with light refraction symbolizing clarity and multi-dimensional wealth
 */
export const WealthPrism = ({ size = 64, className = '' }) => {
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
        {/* Navy to Gold gradient */}
        <linearGradient id="prism-navy" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0a1628" />
          <stop offset="50%" stopColor="#162447" />
          <stop offset="100%" stopColor="#1a365d" />
        </linearGradient>

        {/* Gold to Cyan gradient */}
        <linearGradient id="prism-gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#d4af37" />
          <stop offset="100%" stopColor="#ffd700" />
        </linearGradient>

        {/* Cyan accent */}
        <linearGradient id="prism-cyan" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00d9ff" />
          <stop offset="100%" stopColor="#00bfff" />
        </linearGradient>

        {/* Purple accent */}
        <linearGradient id="prism-purple" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#6d28d9" />
        </linearGradient>

        {/* Refraction effect */}
        <filter id="prism-glow">
          <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* Outer glow */}
      <circle cx="50" cy="50" r="45" fill="url(#prism-cyan)" opacity="0.1" />

      {/* Main prism body - geometric crystal */}
      <g filter="url(#prism-glow)">
        {/* Top facet - navy */}
        <path 
          d="M 50 15 L 75 35 L 50 45 L 25 35 Z" 
          fill="url(#prism-navy)" 
          opacity="0.9"
        />

        {/* Right facet - gold */}
        <path 
          d="M 75 35 L 85 60 L 50 75 L 50 45 Z" 
          fill="url(#prism-gold)" 
          opacity="0.95"
        />

        {/* Left facet - cyan */}
        <path 
          d="M 25 35 L 50 45 L 50 75 L 15 60 Z" 
          fill="url(#prism-cyan)" 
          opacity="0.85"
        />

        {/* Bottom right facet - purple */}
        <path 
          d="M 50 75 L 85 60 L 70 85 L 50 85 Z" 
          fill="url(#prism-purple)" 
          opacity="0.8"
        />

        {/* Bottom left facet - navy dark */}
        <path 
          d="M 50 75 L 50 85 L 30 85 L 15 60 Z" 
          fill="url(#prism-navy)" 
          opacity="0.7"
        />
      </g>

      {/* Inner facets - lighter highlights */}
      <g opacity="0.6">
        <path d="M 50 45 L 60 55 L 50 75 L 40 55 Z" fill="#ffffff" opacity="0.2" />
        <path d="M 50 25 L 55 35 L 50 45 L 45 35 Z" fill="#ffffff" opacity="0.3" />
      </g>

      {/* Edge highlights */}
      <g stroke="#ffffff" strokeWidth="0.5" opacity="0.4" fill="none">
        <path d="M 50 15 L 75 35 L 85 60 L 70 85 L 30 85 L 15 60 L 25 35 Z" />
        <line x1="50" y1="15" x2="50" y2="85" />
        <line x1="25" y1="35" x2="75" y2="35" />
        <line x1="15" y1="60" x2="85" y2="60" />
      </g>

      {/* Light refraction rays */}
      <g stroke="#d4af37" strokeWidth="1" opacity="0.3">
        <line x1="50" y1="15" x2="45" y2="5" />
        <line x1="50" y1="15" x2="55" y2="5" />
        <line x1="85" y1="60" x2="93" y2="60" />
        <line x1="15" y1="60" x2="7" y2="60" />
      </g>

      {/* Central sparkle */}
      <g fill="#ffffff" opacity="0.8">
        <circle cx="50" cy="55" r="2" />
        <circle cx="50" cy="55" r="1" fill="#d4af37" />
      </g>
    </svg>
  )
}
