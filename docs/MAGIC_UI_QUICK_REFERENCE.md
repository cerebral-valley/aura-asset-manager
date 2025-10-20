# Magic UI Quick Reference - Aura Asset Manager

## 📦 Component Index

All components are located in `frontend/src/components/magicui/`

### Created Components (11 Total)

| Component | File | Status | Priority |
|-----------|------|--------|----------|
| NumberTicker | `NumberTicker.jsx` | ✅ Ready | 🔥 Critical |
| Sparkles | `Sparkles.jsx` | ✅ Ready | ⭐ Medium |
| MagicCard | `MagicCard.jsx` | ✅ Ready | 🔥 Critical |
| ShimmerButton | `ShimmerButton.jsx` | ✅ Ready | ⭐ Medium |
| AnimatedGradient | `AnimatedGradient.jsx` | ✅ Ready | ⚡ High |
| Marquee | `Marquee.jsx` | ✅ Ready | 💫 Low |
| Meteors | `Meteors.jsx` | ✅ Ready | 💫 Low |
| BlurFade | `BlurFade.jsx` | ✅ Ready | ⭐ Medium |
| TypingAnimation | `TypingAnimation.jsx` | ✅ Ready | ⭐ Medium |
| Dock | `Dock.jsx` | ✅ Ready | ⚡ High |
| Orbit | `Orbit.jsx` | ✅ Ready | ⚡ High |

### Enhanced Wrappers

| Component | File | Status | Wraps |
|-----------|------|--------|-------|
| EnhancedValueDisplayCard | `dashboard/EnhancedValueDisplayCard.jsx` | ✅ Ready | ValueDisplayCard |

---

## 🚀 Quick Import Guide

### Method 1: Individual Imports
```jsx
import NumberTicker from '@/components/magicui/NumberTicker'
import MagicCard from '@/components/magicui/MagicCard'
import Sparkles from '@/components/magicui/Sparkles'
```

### Method 2: Centralized Import (Recommended)
```jsx
import { NumberTicker, MagicCard, Sparkles } from '@/components/magicui'
```

---

## 💡 Common Use Cases

### Dashboard Enhancement
```jsx
import { AnimatedGradient, NumberTicker, MagicCard, BlurFade, Sparkles, Orbit } from '@/components/magicui'

// Background
<AnimatedGradient className="fixed inset-0 -z-10 opacity-30" />

// Loading
{isLoading && <Orbit size={60} />}

// Animated Cards
<BlurFade delay={0.1}>
  <MagicCard>
    <Sparkles>
      <NumberTicker value={netWorth} decimalPlaces={2} />
    </Sparkles>
  </MagicCard>
</BlurFade>
```

### Asset List
```jsx
import { MagicCard, BlurFade, NumberTicker, Meteors } from '@/components/magicui'

// Staggered list
{assets.map((asset, i) => (
  <BlurFade key={asset.id} delay={0.1 + i * 0.05}>
    <MagicCard>
      <h3>{asset.name}</h3>
      <NumberTicker value={asset.value} />
    </MagicCard>
  </BlurFade>
))}

// Empty state
{assets.length === 0 && (
  <div className="relative h-64">
    <Meteors number={20} />
    <p>No assets yet</p>
  </div>
)}
```

### CTAs & Buttons
```jsx
import { ShimmerButton } from '@/components/magicui'

<ShimmerButton onClick={handleAdd}>
  Add New Asset
</ShimmerButton>
```

### Notifications
```jsx
import { Marquee } from '@/components/magicui'

<Marquee pauseOnHover className="[--duration:20s]">
  {notifications.map(n => <div key={n.id}>{n.message}</div>)}
</Marquee>
```

---

## 📋 Page Implementation Checklist

### Dashboard.jsx
- [ ] Add `AnimatedGradient` background
- [ ] Replace `ValueDisplayCard` with `EnhancedValueDisplayCard`
- [ ] Wrap cards with `BlurFade` (staggered delays)
- [ ] Replace loading with `Orbit`
- [ ] Add `Sparkles` to net worth

### Assets.jsx
- [ ] Wrap list items with `MagicCard`
- [ ] Add `BlurFade` to list items
- [ ] Use `NumberTicker` for values
- [ ] Add `Meteors` to empty state
- [ ] Use `ShimmerButton` for "Add Asset"

### GoalsPage.jsx
- [ ] Wrap goal cards with `MagicCard`
- [ ] Add `NumberTicker` for amounts
- [ ] Add `Sparkles` to completed goals
- [ ] Use `ShimmerButton` for "Create Goal"

### Insurance.jsx
- [ ] Wrap policy cards with `MagicCard`
- [ ] Use `NumberTicker` for coverage amounts
- [ ] Add `BlurFade` to list items

### Transactions.jsx
- [ ] Add `BlurFade` to transaction items
- [ ] Use `NumberTicker` for amounts
- [ ] Optional: `Marquee` for recent transactions

### Analytics.jsx
- [ ] Add `AnimatedGradient` background
- [ ] Use `NumberTicker` for metrics
- [ ] Add `BlurFade` to charts

---

## 🔧 CSS Animations Added

Added to `frontend/src/App.css`:

```css
@keyframes marquee {
  from { transform: translateX(0); }
  to { transform: translateX(calc(-100% - var(--gap))); }
}

@keyframes marquee-vertical {
  from { transform: translateY(0); }
  to { transform: translateY(calc(-100% - var(--gap))); }
}

@keyframes meteor {
  0% {
    transform: rotate(215deg) translateX(0);
    opacity: 1;
  }
  100% {
    transform: rotate(215deg) translateX(-500px);
    opacity: 0;
  }
}
```

With utility classes:
- `.animate-marquee`
- `.animate-marquee-vertical`
- `.animate-meteor`

---

## 🎨 Component Props Quick Reference

### NumberTicker
- `value`: number - Target number
- `decimalPlaces`: number - Decimal places (default: 0)
- `direction`: "up" | "down" - Animation direction
- `delay`: number - Delay in seconds

### MagicCard
- `gradientSize`: number - Glow size (default: 200)
- `gradientColor`: string - Glow color
- `gradientOpacity`: number - 0-1 opacity

### BlurFade
- `delay`: number - Delay in seconds
- `duration`: number - Animation duration
- `yOffset`: number - Starting Y offset
- `inView`: boolean - Trigger on scroll

### Sparkles
- `children`: ReactNode - Content to wrap
- `className`: string - Additional classes

### AnimatedGradient
- `className`: string - Additional classes (use for positioning/opacity)

### ShimmerButton
- `shimmerColor`: string - Shimmer effect color
- `background`: string - Button background (gradient supported)
- `className`: string - Additional classes

### Orbit
- `size`: number - Orbit size in pixels (default: 60)
- `className`: string - Additional classes

### Meteors
- `number`: number - Number of meteors (10-30 recommended)
- `className`: string - Additional classes

### Marquee
- `pauseOnHover`: boolean - Pause on hover
- `reverse`: boolean - Reverse direction
- `vertical`: boolean - Vertical scroll
- `repeat`: number - Times to repeat children

### TypingAnimation
- `text`: string - Text to animate
- `duration`: number - Time per character (ms)
- `className`: string - Additional classes

### Dock
- `direction`: "middle" | "bottom" - Alignment
- `className`: string - Additional classes
- Children: `DockIcon` components

---

## 📚 Documentation

Full documentation: `docs/MAGIC_UI_IMPLEMENTATION_GUIDE.md`

---

**Last Updated:** October 20, 2025  
**Components:** 11/11 ✅  
**Ready for Implementation:** Yes
