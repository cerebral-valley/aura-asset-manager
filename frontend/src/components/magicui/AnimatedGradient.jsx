import { useEffect, useRef } from "react"
import { motion } from "framer-motion"

export default function AnimatedGradient({ className = "" }) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <motion.div
        className="absolute inset-0 opacity-30"
        animate={{
          background: [
            "radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3), transparent 50%)",
            "radial-gradient(circle at 80% 80%, rgba(147, 51, 234, 0.3), transparent 50%)",
            "radial-gradient(circle at 40% 20%, rgba(59, 130, 246, 0.3), transparent 50%)",
            "radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3), transparent 50%)",
          ],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </div>
  )
}
