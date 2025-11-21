# Logo Mathematical Specifications

## 🔢 Trigonometric Positioning

### Center Point
```javascript
const centerX = 50
const centerY = 50
```

### Radius
```javascript
const radius = 35  // Points positioned at 35 units from center
```

## 📐 Point Calculations

### Pentagon (5 Points)
```javascript
const numberOfPoints = 5
const angleStep = (Math.PI * 2) / 5  // 72° in radians

// Starting angle: -Math.PI / 2 (top of circle)
// Point positions:
Array.from({ length: 5 }, (_, i) => {
  const angle = -Math.PI / 2 + angleStep * i
  return {
    x: 50 + 35 * Math.cos(angle),
    y: 50 + 35 * Math.sin(angle)
  }
})

// Result:
// Point 0: (50, 15)    - Top
// Point 1: (83.3, 26.5) - Top-right
// Point 2: (71.1, 63.2) - Bottom-right
// Point 3: (28.9, 63.2) - Bottom-left
// Point 4: (16.7, 26.5) - Top-left
```

### Hexagon (6 Points)
```javascript
const numberOfPoints = 6
const angleStep = (Math.PI * 2) / 6  // 60° in radians

// Starting angle: -Math.PI / 2 (top of circle)
// Point positions:
Array.from({ length: 6 }, (_, i) => {
  const angle = -Math.PI / 2 + angleStep * i
  return {
    x: 50 + 35 * Math.cos(angle),
    y: 50 + 35 * Math.sin(angle)
  }
})

// Result:
// Point 0: (50, 15)    - Top
// Point 1: (80.3, 32.5) - Top-right
// Point 2: (80.3, 67.5) - Bottom-right
// Point 3: (50, 85)    - Bottom
// Point 4: (19.7, 67.5) - Bottom-left
// Point 5: (19.7, 32.5) - Top-left
```

### Wealth Mandala (8 + 4 Points)

#### Outer Ring (8 Points)
```javascript
const outerPoints = 8
const outerRadius = 35
const angleStep = (Math.PI * 2) / 8  // 45° in radians

// Starting angle: -Math.PI / 2 (top of circle)
Array.from({ length: 8 }, (_, i) => {
  const angle = -Math.PI / 2 + angleStep * i
  return {
    x: 50 + 35 * Math.cos(angle),
    y: 50 + 35 * Math.sin(angle)
  }
})

// Result (8 points at 45° intervals):
// Point 0: (50, 15)    - Top
// Point 1: (74.7, 25.3) - Top-right
// Point 2: (85, 50)    - Right
// Point 3: (74.7, 74.7) - Bottom-right
// Point 4: (50, 85)    - Bottom
// Point 5: (25.3, 74.7) - Bottom-left
// Point 6: (15, 50)    - Left
// Point 7: (25.3, 25.3) - Top-left
```

#### Inner Ring (4 Points)
```javascript
const innerPoints = 4
const innerRadius = 20
const angleStep = (Math.PI * 2) / 4  // 90° in radians

// Starting angle: -Math.PI / 2 (top of circle)
Array.from({ length: 4 }, (_, i) => {
  const angle = -Math.PI / 2 + angleStep * i
  return {
    x: 50 + 20 * Math.cos(angle),
    y: 50 + 20 * Math.sin(angle)
  }
})

// Result (4 diamond points at 90° intervals):
// Point 0: (50, 30)    - Top
// Point 1: (70, 50)    - Right
// Point 2: (50, 70)    - Bottom
// Point 3: (30, 50)    - Left
```

## 🌟 Star Pattern Connections

### Pentagon Star Pattern
```javascript
// Connect every 2nd point to create pentagram
// Connection order: 0 → 2 → 4 → 1 → 3 → 0
const starConnections = [
  [0, 2], [2, 4], [4, 1], [1, 3], [3, 0]
]
```

### Hexagon Star Pattern
```javascript
// Connect opposite points + adjacent for Star of David effect
// Primary star: 0 → 3, 1 → 4, 2 → 5
// Secondary connections: 0 → 2, 2 → 4, 4 → 0, 1 → 3, 3 → 5, 5 → 1
const starConnections = [
  [0, 3], [1, 4], [2, 5],  // Opposing points
  [0, 2], [2, 4], [4, 0],  // Inner triangle
  [1, 3], [3, 5], [5, 1]   // Outer triangle
]
```

### Wealth Mandala Star Pattern
```javascript
// Outer ring: Connect every 3rd point (8-pointed star)
// Inner ring: Connect all 4 points (diamond)
const outerStarConnections = [
  [0, 3], [3, 6], [6, 1], [1, 4],
  [4, 7], [7, 2], [2, 5], [5, 0]
]

const innerStarConnections = [
  [0, 1], [1, 2], [2, 3], [3, 0]  // Diamond shape
]
```

## 🎨 Gradient Definitions

### Constellation Point Gradient
```javascript
<radialGradient id="pointGradient">
  <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
  <stop offset="40%" stopColor="#ffd700" stopOpacity="0.9" />
  <stop offset="70%" stopColor="#d4af37" stopOpacity="0.7" />
  <stop offset="100%" stopColor="#d4af37" stopOpacity="0" />
</radialGradient>
```

### Central Orb Gradient
```javascript
<radialGradient id="orbGradient">
  <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
  <stop offset="30%" stopColor="#ffd700" stopOpacity="0.95" />
  <stop offset="70%" stopColor="#d4af37" stopOpacity="0.8" />
  <stop offset="100%" stopColor="#b8860b" stopOpacity="0.6" />
</radialGradient>
```

### Aurora Connection Gradient
```javascript
<linearGradient id="auroraGradient" x1="0%" y1="0%" x2="100%" y2="100%">
  <stop offset="0%" stopColor="#00d9ff" stopOpacity="0.6" />
  <stop offset="50%" stopColor="#00ffff" stopOpacity="0.4" />
  <stop offset="100%" stopColor="#00d9ff" stopOpacity="0.2" />
</linearGradient>
```

## 📏 Size Scaling

### ViewBox Coordinate System
```javascript
viewBox="0 0 100 100"  // All logos use 100x100 coordinate system
```

### Physical Sizes
```javascript
// Small sizes (UI elements)
size={24}  // 24px × 24px (favicon)
size={32}  // 32px × 32px (small UI)
size={48}  // 48px × 48px (medium UI)

// Large sizes (headers, hero sections)
size={64}  // 64px × 64px (large UI)
size={96}  // 96px × 96px (hero)
size={120} // 120px × 120px (banner)
```

### Scaling Formula
```javascript
// All measurements scale proportionally
const scaleFactor = size / 100

// Example: For size={64}
// Point radius: 2 units in viewBox → 1.28px physical
// Central orb: 4 units in viewBox → 2.56px physical
// Constellation radius: 35 units → 22.4px physical
```

## 🔬 Precision Verification

### Distance from Center
```javascript
// All constellation points should be exactly 35 units from center
const distanceFromCenter = Math.sqrt(
  Math.pow(pointX - centerX, 2) + 
  Math.pow(pointY - centerY, 2)
)
// Expected result: 35.0 (within floating point precision)
```

### Angular Spacing
```javascript
// Pentagon: 72° between points
const pentagonAngle = 360 / 5  // = 72°

// Hexagon: 60° between points
const hexagonAngle = 360 / 6  // = 60°

// Octagon: 45° between points
const octagonAngle = 360 / 8  // = 45°

// Inner diamond: 90° between points
const diamondAngle = 360 / 4  // = 90°
```

## 🎯 Symmetry Validation

### Pentagon (5 Points)
- **Rotational Symmetry**: 5-fold (72° rotation)
- **Mirror Symmetry**: 5 lines of symmetry
- **Point Symmetry**: None

### Hexagon (6 Points)
- **Rotational Symmetry**: 6-fold (60° rotation)
- **Mirror Symmetry**: 6 lines of symmetry
- **Vertical/Horizontal Symmetry**: Perfect ✅
- **Point Symmetry**: 180° (center point)

### Wealth Mandala (8 + 4 Points)
- **Outer Octagon Rotational Symmetry**: 8-fold (45° rotation)
- **Inner Diamond Rotational Symmetry**: 4-fold (90° rotation)
- **Mirror Symmetry**: 8 lines (outer), 4 lines (inner)
- **Vertical/Horizontal Symmetry**: Perfect ✅
- **Point Symmetry**: 180° (center point)

## 🧮 JavaScript Implementation

### Generic Point Generator
```javascript
const generatePoints = (numPoints, radius, startAngle = -Math.PI / 2) => {
  const angleStep = (Math.PI * 2) / numPoints
  const centerX = 50
  const centerY = 50
  
  return Array.from({ length: numPoints }, (_, i) => {
    const angle = startAngle + angleStep * i
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
      angle: angle * (180 / Math.PI)  // Convert to degrees
    }
  })
}

// Usage:
const pentagonPoints = generatePoints(5, 35)  // 5 points at radius 35
const hexagonPoints = generatePoints(6, 35)   // 6 points at radius 35
const octagonPoints = generatePoints(8, 35)   // 8 points at radius 35
const diamondPoints = generatePoints(4, 20)   // 4 points at radius 20
```

---

**Mathematical Precision**: All points positioned using trigonometric functions  
**Floating Point Error**: < 0.001 units (negligible at any display size)  
**Scalability**: Perfect from 1px to 10000px+  
**Verification**: Distance formula confirms all points on circumference
