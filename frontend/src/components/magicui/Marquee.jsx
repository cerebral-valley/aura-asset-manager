import { cn } from "../../lib/utils"

/**
 * Marquee Component
 * 
 * Infinitely scrolling content - perfect for:
 * - Scrolling notifications
 * - Asset price tickers
 * - News feeds
 * - Recent transactions
 * 
 * @param {ReactNode} children - Content to scroll
 * @param {boolean} pauseOnHover - Pause animation on hover
 * @param {boolean} reverse - Reverse scroll direction
 * @param {boolean} vertical - Vertical scroll instead of horizontal
 * @param {number} repeat - Number of times to repeat children
 * @param {string} className - Additional CSS classes
 */
export default function Marquee({
  className,
  reverse = false,
  pauseOnHover = false,
  children,
  vertical = false,
  repeat = 4,
  ...props
}) {
  return (
    <div
      {...props}
      className={cn(
        "group flex overflow-hidden p-2 [--duration:40s] [--gap:1rem] [gap:var(--gap)]",
        {
          "flex-row": !vertical,
          "flex-col": vertical,
        },
        className,
      )}
    >
      {Array(repeat)
        .fill(0)
        .map((_, i) => (
          <div
            key={i}
            className={cn("flex shrink-0 justify-around [gap:var(--gap)]", {
              "animate-marquee flex-row": !vertical,
              "animate-marquee-vertical flex-col": vertical,
              "group-hover:[animation-play-state:paused]": pauseOnHover,
              "[animation-direction:reverse]": reverse,
            })}
          >
            {children}
          </div>
        ))}
    </div>
  )
}
