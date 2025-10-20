import { useId } from "react"
import { motion } from "framer-motion"

export default function Sparkles({ children, className = "" }) {
  const id = useId()
  
  return (
    <div className={`relative inline-block ${className}`}>
      {children}
      <svg className="pointer-events-none absolute inset-0 h-full w-full">
        <defs>
          <motion.radialGradient
            id={`sparkle-gradient-${id}`}
            animate={{
              cx: ["20%", "80%", "20%"],
              cy: ["20%", "80%", "20%"],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.8)" />
            <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
          </motion.radialGradient>
        </defs>
        <motion.circle
          cx="10%"
          cy="10%"
          r="2"
          fill={`url(#sparkle-gradient-${id})`}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: 0,
          }}
        />
        <motion.circle
          cx="90%"
          cy="20%"
          r="1.5"
          fill={`url(#sparkle-gradient-${id})`}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: 0.3,
          }}
        />
        <motion.circle
          cx="80%"
          cy="90%"
          r="2"
          fill={`url(#sparkle-gradient-${id})`}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: 0.6,
          }}
        />
      </svg>
    </div>
  )
}
