import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

export default function MagicCard({
  children,
  className = "",
  gradientSize = 200,
  gradientColor = "#262626",
  gradientOpacity = 0.8,
}) {
  return (
    <motion.div
      className={cn(
        "group relative overflow-hidden rounded-xl border border-white/10 bg-neutral-900/50 p-6",
        "transition-all duration-300",
        className
      )}
      whileHover={{
        scale: 1.02,
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(${gradientSize}px circle at var(--mouse-x) var(--mouse-y), ${gradientColor}, transparent 40%)`,
          opacity: gradientOpacity,
        }}
      />
      <div className="relative z-10">{children}</div>
    </motion.div>
  )
}
