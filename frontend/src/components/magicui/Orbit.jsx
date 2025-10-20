import { motion } from "framer-motion"
import { cn } from "../../lib/utils"

/**
 * Orbit Component
 * 
 * Beautiful circular loading animation - perfect for:
 * - Data fetching states
 * - Processing indicators
 * - Loading screens
 * - Better than standard spinners
 * 
 * @param {number} size - Size of orbit (pixels)
 * @param {string} className - Additional CSS classes
 */
export default function Orbit({
  className,
  size = 60,
}) {
  return (
    <div 
      className={cn("relative", className)} 
      style={{ width: size, height: size }}
    >
      {/* Outer orbit */}
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-primary/20"
        animate={{ rotate: 360 }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-primary"
        />
      </motion.div>

      {/* Middle orbit */}
      <motion.div
        className="absolute inset-[20%] rounded-full border-2 border-primary/40"
        animate={{ rotate: -360 }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 h-2.5 w-2.5 rounded-full bg-primary/80"
        />
      </motion.div>

      {/* Inner orbit */}
      <motion.div
        className="absolute inset-[40%] rounded-full border-2 border-primary/60"
        animate={{ rotate: 360 }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-primary/60"
        />
      </motion.div>

      {/* Center dot */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="h-1.5 w-1.5 rounded-full bg-primary"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>
    </div>
  )
}
