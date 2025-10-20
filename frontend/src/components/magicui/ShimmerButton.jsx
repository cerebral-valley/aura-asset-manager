import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

export default function ShimmerButton({
  children,
  className = "",
  shimmerColor = "#ffffff",
  shimmerSize = "0.05em",
  borderRadius = "100px",
  shimmerDuration = "3s",
  background = "rgba(0, 0, 0, 1)",
  onClick,
  ...props
}) {
  return (
    <motion.button
      style={{
        boxShadow: "0 0 12px rgba(0, 0, 0, 0.1)",
        background: background,
        borderRadius: borderRadius,
      }}
      className={cn(
        "relative overflow-hidden px-6 py-2 text-white",
        "[mask-image:linear-gradient(-75deg,white_calc(var(--x)+20%),transparent_calc(var(--x)+30%),white_calc(var(--x)+100%))]",
        className
      )}
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      {...props}
    >
      <motion.span
        className="absolute inset-0"
        style={{
          maskImage: `linear-gradient(-75deg, ${shimmerColor} calc(var(--x) + 20%), transparent calc(var(--x) + 30%), ${shimmerColor} calc(var(--x) + 100%))`,
          maskSize: "300%",
          maskPosition: "0% 0%",
        }}
        animate={{
          maskPosition: ["0% 0%", "100% 0%"],
        }}
        transition={{
          duration: parseFloat(shimmerDuration),
          repeat: Infinity,
          ease: "linear",
        }}
      >
        <div
          className="absolute inset-0 opacity-50"
          style={{
            background: `linear-gradient(to right, transparent, ${shimmerColor}, transparent)`,
          }}
        />
      </motion.span>
      <span className="relative z-10">{children}</span>
    </motion.button>
  )
}
