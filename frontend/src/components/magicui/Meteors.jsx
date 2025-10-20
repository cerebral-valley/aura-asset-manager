import { cn } from "../../lib/utils"

/**
 * Meteors Component
 * 
 * Animated shooting stars effect - perfect for:
 * - Empty states
 * - Background decorations
 * - Loading screens
 * - Hero sections
 * 
 * @param {number} number - Number of meteors (10-30 recommended)
 * @param {string} className - Additional CSS classes
 */
export default function Meteors({ number = 20, className }) {
  const meteors = new Array(number || 20).fill(true)
  
  return (
    <>
      {meteors.map((_, idx) => (
        <span
          key={idx}
          className={cn(
            "pointer-events-none absolute left-1/2 top-1/2 h-0.5 w-0.5 rotate-[215deg] animate-meteor rounded-[9999px] bg-slate-500 shadow-[0_0_0_1px_#ffffff10]",
            className,
          )}
          style={{
            top: Math.floor(Math.random() * 400 - 200) + "px",
            left: Math.floor(Math.random() * 400 - 200) + "px",
            animationDelay: Math.random() * 0.6 + 0.2 + "s",
            animationDuration: Math.floor(Math.random() * 8 + 2) + "s",
          }}
        >
          <div className="pointer-events-none absolute top-1/2 h-[1px] w-[50px] -translate-y-1/2 bg-gradient-to-r from-slate-500 to-transparent" />
        </span>
      ))}
    </>
  )
}
