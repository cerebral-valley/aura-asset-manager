import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import { useRef } from "react"
import { cn } from "../../lib/utils"

/**
 * Dock Component (macOS-style floating navigation)
 * 
 * Perfect for:
 * - Mobile navigation
 * - Quick action bar
 * - Tool palette
 * - Floating menu
 * 
 * @param {ReactNode} children - DockIcon components
 * @param {string} className - Additional CSS classes
 * @param {string} direction - Layout direction ("middle" | "bottom")
 */
export function Dock({
  className,
  children,
  direction = "middle",
}) {
  const mouseX = useMotionValue(Infinity)

  return (
    <motion.div
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className={cn(
        "mx-auto flex h-16 w-max gap-4 rounded-2xl border bg-background/80 px-4 pb-3 backdrop-blur-md",
        {
          "items-center": direction === "middle",
          "items-end": direction === "bottom",
        },
        className,
      )}
    >
      {Array.isArray(children) &&
        children.map((child, i) => (
          <DockIcon key={i} mouseX={mouseX}>
            {child}
          </DockIcon>
        ))}
    </motion.div>
  )
}

/**
 * DockIcon Component
 * 
 * Individual icon within Dock with magnification effect
 */
export function DockIcon({ mouseX, className, children, ...props }) {
  const ref = useRef(null)

  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 }
    return val - bounds.x - bounds.width / 2
  })

  const widthSync = useTransform(distance, [-150, 0, 150], [40, 80, 40])
  const width = useSpring(widthSync, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  })

  return (
    <motion.div
      ref={ref}
      style={{ width }}
      className={cn(
        "flex aspect-square cursor-pointer items-center justify-center rounded-full",
        className,
      )}
      {...props}
    >
      {children}
    </motion.div>
  )
}
