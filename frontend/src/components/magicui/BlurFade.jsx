import { motion, useInView } from "framer-motion"
import { useRef } from "react"

/**
 * BlurFade Component
 * 
 * Smooth fade-in entrance animation with blur effect - perfect for:
 * - Page component entrance
 * - Staggered list items
 * - Modal/dialog entrance
 * - Section reveals
 * 
 * @param {ReactNode} children - Content to animate
 * @param {number} delay - Delay before animation starts (seconds)
 * @param {number} duration - Animation duration (seconds)
 * @param {number} yOffset - Starting Y position offset (pixels)
 * @param {boolean} inView - Only animate when scrolled into view
 * @param {string} className - Additional CSS classes
 */
export default function BlurFade({
  children,
  className,
  delay = 0,
  duration = 0.4,
  yOffset = 6,
  inView = false,
  ...props
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const defaultVariants = {
    hidden: { 
      y: yOffset, 
      opacity: 0, 
      filter: "blur(4px)" 
    },
    visible: { 
      y: 0, 
      opacity: 1, 
      filter: "blur(0px)" 
    },
  }
  
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView && !isInView ? "hidden" : "visible"}
      variants={defaultVariants}
      transition={{
        delay: 0.04 + delay,
        duration,
        ease: "easeOut",
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}
