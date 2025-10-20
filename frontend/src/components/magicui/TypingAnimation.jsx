import { useEffect, useState } from "react"
import { cn } from "../../lib/utils"

/**
 * TypingAnimation Component
 * 
 * Typewriter effect for text - perfect for:
 * - Page headings
 * - Welcome messages
 * - Introduction text
 * - Hero section titles
 * 
 * @param {string} text - Text to animate
 * @param {number} duration - Time per character (ms)
 * @param {string} className - Additional CSS classes
 */
export default function TypingAnimation({
  text,
  duration = 100,
  className,
}) {
  const [displayedText, setDisplayedText] = useState("")
  const [i, setI] = useState(0)

  useEffect(() => {
    const typingEffect = setInterval(() => {
      if (i < text.length) {
        setDisplayedText(text.substring(0, i + 1))
        setI(i + 1)
      } else {
        clearInterval(typingEffect)
      }
    }, duration)

    return () => {
      clearInterval(typingEffect)
    }
  }, [duration, i, text])

  return (
    <h1
      className={cn(
        "font-display text-center text-4xl font-bold leading-[5rem] tracking-[-0.02em] drop-shadow-sm",
        className,
      )}
    >
      {displayedText || text}
      <span className="animate-pulse">|</span>
    </h1>
  )
}
