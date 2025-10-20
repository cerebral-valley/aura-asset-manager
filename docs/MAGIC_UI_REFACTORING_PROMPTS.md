# AI Agent Refactoring Prompts - Magic UI Integration

**Purpose:** Ready-to-use prompts for AI agents to refactor each page with Magic UI components in one go.

**Last Updated:** October 20, 2025

---

## 📋 How to Use These Prompts

1. **Copy the entire prompt** for the page you want to refactor
2. **Paste into your AI agent** (Claude, GitHub Copilot Chat, etc.)
3. **The agent will automatically:**
   - Read the current file
   - Add necessary imports
   - Replace components with Magic UI versions
   - Add animations and effects
   - Preserve all business logic
   - Test the changes

---

## 🎯 Prompt 1: Dashboard.jsx (HIGHEST PRIORITY)

```markdown
Please refactor /Users/ishankukade/workspace/aura-asset-manager/frontend/src/pages/Dashboard.jsx to include Magic UI components.

**PRIORITY LEVEL:** 🔥 CRITICAL - Maximum Impact

**OBJECTIVE:** Transform the dashboard into a modern, animated financial sanctuary with smooth number animations, card interactions, and visual polish while maintaining all existing functionality.

**COMPONENTS TO ADD:**

1. **AnimatedGradient** - Add to page background for modern, dynamic feel
   - Location: Wrap entire page content
   - Props: `className="fixed inset-0 -z-10 opacity-30"`
   - Why: Creates subtle, professional animated background

2. **EnhancedValueDisplayCard** - Replace all `ValueDisplayCard` instances
   - Location: All financial value cards (Net Worth, Total Assets, Liquid Assets, etc.)
   - Props: `animate={true}`, `magicHover={true}`, `sparkle={true}` (only for Net Worth)
   - Why: Adds animated number counting, hover effects, sparkle highlights

3. **BlurFade** - Wrap all major sections and cards
   - Location: Wrap each card with staggered delays
   - Props: `delay={0.1}`, `delay={0.2}`, `delay={0.3}`, etc. for stagger effect
   - Why: Smooth entrance animations when page loads

4. **Orbit** - Replace `<Loading>` component
   - Location: Loading state render
   - Props: `size={60}`, `className="mx-auto"`
   - Why: More engaging loading animation than standard spinner

5. **ShimmerButton** - Enhance primary CTAs
   - Location: "Add Asset", "View All" buttons
   - Props: `shimmerColor="#8b5cf6"`, `background="linear-gradient(to right, #8b5cf6, #ec4899)"`
   - Why: Makes primary actions stand out

**IMPORT STATEMENTS TO ADD:**
```jsx
import AnimatedGradient from '../components/magicui/AnimatedGradient.jsx'
import EnhancedValueDisplayCard from '../components/dashboard/EnhancedValueDisplayCard.jsx'
import BlurFade from '../components/magicui/BlurFade.jsx'
import Orbit from '../components/magicui/Orbit.jsx'
import ShimmerButton from '../components/magicui/ShimmerButton.jsx'
```

**SPECIFIC TRANSFORMATIONS:**

1. **Page Structure:**
```jsx
// BEFORE
<div className="p-6">
  {/* content */}
</div>

// AFTER
<div className="relative min-h-screen p-6">
  <AnimatedGradient className="fixed inset-0 -z-10 opacity-30" />
  {/* content */}
</div>
```

2. **Value Cards:**
```jsx
// BEFORE
<ValueDisplayCard
  title="Net Worth"
  value={dashboardData?.netWorth || 0}
  icon={Wallet}
  variant="default"
/>

// AFTER
<BlurFade delay={0.1}>
  <EnhancedValueDisplayCard
    title="Net Worth"
    value={dashboardData?.netWorth || 0}
    icon={Wallet}
    variant="default"
    animate={true}
    sparkle={true}
    magicHover={true}
  />
</BlurFade>
```

3. **Loading State:**
```jsx
// BEFORE
if (isLoading) return <Loading pageName="Dashboard" />

// AFTER
if (isLoading) {
  return (
    <div className="flex items-center justify-center h-screen">
      <Orbit size={60} />
    </div>
  )
}
```

4. **Stagger Pattern for All Cards:**
```jsx
// Card 1 (Net Worth)
<BlurFade delay={0.1}>...</BlurFade>

// Card 2 (Total Assets)
<BlurFade delay={0.15}>...</BlurFade>

// Card 3 (Liquid Assets)
<BlurFade delay={0.2}>...</BlurFade>

// Card 4 (Asset Allocation Chart)
<BlurFade delay={0.25}>...</BlurFade>

// Card 5 (Insurance Breakdown)
<BlurFade delay={0.3}>...</BlurFade>
```

**KEEP UNCHANGED:**
- All `useQuery` data fetching logic
- Error handling
- Theme switching functionality
- Version display
- All business logic
- Route definitions
- Auth checks (`useAuth()`)

**TESTING CHECKLIST:**
After refactoring, verify:
- [ ] Dashboard loads without errors
- [ ] All numbers animate smoothly when page loads
- [ ] Net worth has sparkle effect
- [ ] All cards fade in with stagger effect
- [ ] Hover effects work on all cards
- [ ] Loading shows orbit animation instead of old loading component
- [ ] No performance degradation
- [ ] Mobile responsive maintained
- [ ] Theme switching still works
- [ ] All existing functionality preserved

**ADDITIONAL NOTES:**
- Keep the increment of 0.05 seconds between each card's delay for smooth stagger
- Only add sparkle effect to Net Worth card (most important metric)
- Use `magicHover={true}` on all cards for consistent interaction
- Ensure animated gradient has low opacity (0.3) to not overwhelm content
```

---

## 🎯 Prompt 2: Assets.jsx (HIGH PRIORITY)

```markdown
Please refactor /Users/ishankukade/workspace/aura-asset-manager/frontend/src/pages/Assets.jsx to include Magic UI components.

**PRIORITY LEVEL:** 🔥 HIGH - Major User Engagement

**OBJECTIVE:** Enhance asset list with smooth animations, interactive cards, and beautiful empty states while maintaining all CRUD functionality.

**COMPONENTS TO ADD:**

1. **MagicCard** - Wrap each asset list item
   - Location: Around each asset row in the list
   - Props: `gradientSize={200}`, `gradientColor="#8b5cf6"`, `gradientOpacity={0.8}`
   - Why: Interactive hover effects make asset cards more engaging

2. **NumberTicker** - Replace static currency display
   - Location: Asset value display
   - Props: `value={asset.value}`, `decimalPlaces={2}`
   - Why: Animated counting for financial values

3. **BlurFade** - Stagger list item entrance
   - Location: Wrap each MagicCard
   - Props: `delay={0.1 + index * 0.05}`, `inView={true}`
   - Why: Smooth entrance animation as items appear

4. **Meteors** - Empty state decoration
   - Location: When assets.length === 0
   - Props: `number={20}`
   - Why: Beautiful empty state background

5. **ShimmerButton** - "Add Asset" CTA
   - Location: Replace primary button
   - Props: `shimmerColor="#10b981"`, `className="w-full md:w-auto"`
   - Why: Makes primary action stand out

6. **Orbit** - Loading state
   - Location: Replace loading component
   - Props: `size={60}`
   - Why: Better loading UX

**IMPORT STATEMENTS TO ADD:**
```jsx
import { MagicCard, NumberTicker, BlurFade, Meteors, ShimmerButton, Orbit } from '../components/magicui'
```

**SPECIFIC TRANSFORMATIONS:**

1. **Asset List Items:**
```jsx
// BEFORE
{assets.map((asset) => (
  <div key={asset.id} className="flex items-center justify-between p-4 border-b">
    <div>
      <h3>{asset.name}</h3>
      <p>{formatCurrency(asset.value)}</p>
    </div>
  </div>
))}

// AFTER
{assets.map((asset, index) => (
  <BlurFade key={asset.id} delay={0.1 + index * 0.05} inView={true}>
    <MagicCard className="mb-4">
      <div className="flex items-center justify-between p-4">
        <div>
          <h3>{asset.name}</h3>
          <div className="font-mono">
            £<NumberTicker value={asset.value} decimalPlaces={2} />
          </div>
        </div>
      </div>
    </MagicCard>
  </BlurFade>
))}
```

2. **Empty State:**
```jsx
// BEFORE
{assets.length === 0 && (
  <div className="text-center py-12">
    <p>No assets yet. Add your first asset to get started!</p>
  </div>
)}

// AFTER
{assets.length === 0 && (
  <div className="relative h-64 flex items-center justify-center">
    <Meteors number={20} />
    <div className="relative z-10 text-center">
      <p className="text-muted-foreground mb-4">
        No assets yet. Add your first asset to get started!
      </p>
      <ShimmerButton onClick={handleAddAsset}>
        <Plus className="h-4 w-4 mr-2" />
        Add First Asset
      </ShimmerButton>
    </div>
  </div>
)}
```

3. **Loading State:**
```jsx
// BEFORE
if (isLoading) return <Loading pageName="Assets" />

// AFTER
if (isLoading) {
  return (
    <div className="flex items-center justify-center h-64">
      <Orbit size={60} />
    </div>
  )
}
```

**KEEP UNCHANGED:**
- Asset CRUD operations
- Filtering and search logic
- Asset type selection
- Form validation
- Modal dialogs
- Error handling

**TESTING CHECKLIST:**
- [ ] Asset list loads with staggered animations
- [ ] Each asset value animates when scrolled into view
- [ ] Hover effects work on all asset cards
- [ ] Empty state shows meteors animation
- [ ] Add Asset button has shimmer effect
- [ ] All CRUD operations still work
- [ ] No performance issues with long lists
- [ ] Mobile responsive maintained
```

---

## 🎯 Prompt 3: GoalsPage.jsx (HIGH PRIORITY)

```markdown
Please refactor /Users/ishankukade/workspace/aura-asset-manager/frontend/src/pages/GoalsPage.jsx to include Magic UI components.

**PRIORITY LEVEL:** 🔥 HIGH - Motivational Impact

**OBJECTIVE:** Make goal tracking more engaging with animated progress, sparkle effects on achievements, and smooth interactions.

**COMPONENTS TO ADD:**

1. **NumberTicker** - Animate goal amounts and progress
2. **Sparkles** - Highlight completed goals (100% progress)
3. **MagicCard** - Interactive goal cards
4. **BlurFade** - Staggered entrance
5. **ShimmerButton** - "Create Goal" CTA
6. **Orbit** - Loading state

**IMPORT STATEMENTS:**
```jsx
import { NumberTicker, Sparkles, MagicCard, BlurFade, ShimmerButton, Orbit } from '../components/magicui'
```

**SPECIAL FEATURES:**

1. **Conditional Sparkles for Completed Goals:**
```jsx
{goals.map((goal, index) => {
  const progress = (goal.current / goal.target) * 100
  const isComplete = progress >= 100
  
  return (
    <BlurFade key={goal.id} delay={0.1 + index * 0.05}>
      <MagicCard>
        {isComplete ? (
          <Sparkles>
            <h3>{goal.name} 🎉</h3>
            <NumberTicker value={goal.current} decimalPlaces={2} />
          </Sparkles>
        ) : (
          <>
            <h3>{goal.name}</h3>
            <NumberTicker value={goal.current} decimalPlaces={2} />
          </>
        )}
      </MagicCard>
    </BlurFade>
  )
})}
```

**TESTING CHECKLIST:**
- [ ] Goal amounts animate smoothly
- [ ] Completed goals show sparkle effect
- [ ] Progress bars animate
- [ ] Create Goal button has shimmer
- [ ] All goal CRUD operations work
```

---

## 🎯 Prompt 4: Insurance.jsx (MEDIUM PRIORITY)

```markdown
Please refactor /Users/ishankukade/workspace/aura-asset-manager/frontend/src/pages/Insurance.jsx to include Magic UI components.

**PRIORITY LEVEL:** ⚡ MEDIUM - Visual Enhancement

**COMPONENTS TO ADD:**
- MagicCard - Policy cards
- NumberTicker - Coverage amounts
- BlurFade - List entrance
- Meteors - Empty state
- ShimmerButton - Add Policy CTA
- Orbit - Loading

**IMPORT STATEMENTS:**
```jsx
import { MagicCard, NumberTicker, BlurFade, Meteors, ShimmerButton, Orbit } from '../components/magicui'
```

**TRANSFORMATION PATTERN:**
```jsx
{policies.map((policy, index) => (
  <BlurFade key={policy.id} delay={0.1 + index * 0.05}>
    <MagicCard className="p-6">
      <h3>{policy.name}</h3>
      <div className="text-lg font-semibold">
        £<NumberTicker value={policy.coverage} decimalPlaces={0} />
      </div>
    </MagicCard>
  </BlurFade>
))}
```

**KEEP UNCHANGED:**
- Insurance CRUD operations
- File upload functionality
- Policy type filtering
```

---

## 🎯 Prompt 5: Transactions.jsx (MEDIUM PRIORITY)

```markdown
Please refactor /Users/ishankukade/workspace/aura-asset-manager/frontend/src/pages/Transactions.jsx to include Magic UI components.

**PRIORITY LEVEL:** ⚡ MEDIUM

**COMPONENTS TO ADD:**
- BlurFade - Transaction list items
- NumberTicker - Transaction amounts
- Marquee - Recent transactions ticker (optional)
- Orbit - Loading

**IMPORT STATEMENTS:**
```jsx
import { BlurFade, NumberTicker, Marquee, Orbit } from '../components/magicui'
```

**OPTIONAL FEATURE - Recent Transactions Ticker:**
```jsx
<div className="mb-6">
  <h3 className="text-sm font-medium mb-2">Recent Activity</h3>
  <Marquee pauseOnHover className="[--duration:30s]">
    {recentTransactions.map((txn) => (
      <div key={txn.id} className="mx-4 flex items-center gap-2">
        <span>{txn.description}</span>
        <span className="font-semibold">
          £<NumberTicker value={txn.amount} decimalPlaces={2} />
        </span>
      </div>
    ))}
  </Marquee>
</div>
```

**TESTING CHECKLIST:**
- [ ] Transaction list fades in smoothly
- [ ] Amounts animate
- [ ] Marquee scrolls smoothly (if added)
- [ ] All filtering works
```

---

## 🎯 Prompt 6: Analytics.jsx (MEDIUM PRIORITY)

```markdown
Please refactor /Users/ishankukade/workspace/aura-asset-manager/frontend/src/pages/Analytics.jsx to include Magic UI components.

**PRIORITY LEVEL:** ⚡ MEDIUM

**COMPONENTS TO ADD:**
- AnimatedGradient - Page background
- NumberTicker - Key metrics
- BlurFade - Chart entrance
- Orbit - Loading

**IMPORT STATEMENTS:**
```jsx
import { AnimatedGradient, NumberTicker, BlurFade, Orbit } from '../components/magicui'
```

**PAGE STRUCTURE:**
```jsx
<div className="relative min-h-screen p-6">
  <AnimatedGradient className="fixed inset-0 -z-10 opacity-20" />
  
  <BlurFade delay={0.1}>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* Key metrics with NumberTicker */}
    </div>
  </BlurFade>
  
  <BlurFade delay={0.2}>
    {/* Charts */}
  </BlurFade>
</div>
```

**KEEP UNCHANGED:**
- Chart rendering logic
- Data calculations
- Time period selection
```

---

## 🎯 Prompt 7: Profile.jsx (LOW PRIORITY)

```markdown
Please refactor /Users/ishankukade/workspace/aura-asset-manager/frontend/src/pages/Profile.jsx to include Magic UI components.

**PRIORITY LEVEL:** ⭐ LOW-MEDIUM

**COMPONENTS TO ADD:**
- MagicCard - Settings sections
- ShimmerButton - Save changes button
- BlurFade - Section entrance

**IMPORT STATEMENTS:**
```jsx
import { MagicCard, ShimmerButton, BlurFade } from '../components/magicui'
```

**MINIMAL TRANSFORMATION:**
```jsx
<BlurFade delay={0.1}>
  <MagicCard className="p-6">
    {/* Profile settings */}
    <ShimmerButton onClick={handleSave}>
      Save Changes
    </ShimmerButton>
  </MagicCard>
</BlurFade>
```
```

---

## 🎯 Prompt 8: ToolsPage.jsx (LOW PRIORITY)

```markdown
Please refactor /Users/ishankukade/workspace/aura-asset-manager/frontend/src/pages/ToolsPage.jsx to include Magic UI components.

**PRIORITY LEVEL:** ⭐ LOW

**COMPONENTS TO ADD:**
- MagicCard - Tool cards
- BlurFade - Tool entrance
- TypingAnimation - Page heading (optional)

**IMPORT STATEMENTS:**
```jsx
import { MagicCard, BlurFade, TypingAnimation } from '../components/magicui'
```

**PAGE HEADING:**
```jsx
<TypingAnimation
  text="Financial Tools & Calculators"
  duration={100}
  className="text-3xl font-bold mb-6"
/>
```

**TOOL CARDS:**
```jsx
{tools.map((tool, index) => (
  <BlurFade key={tool.id} delay={0.1 + index * 0.05}>
    <MagicCard className="p-6">
      {tool.content}
    </MagicCard>
  </BlurFade>
))}
```
```

---

## 🎯 Prompt 9: UserSettings.jsx (LOW PRIORITY)

```markdown
Please refactor /Users/ishankukade/workspace/aura-asset-manager/frontend/src/pages/UserSettings.jsx to include Magic UI components.

**PRIORITY LEVEL:** 💫 LOW

**COMPONENTS TO ADD:**
- BlurFade - Settings sections
- ShimmerButton - Primary actions

**IMPORT STATEMENTS:**
```jsx
import { BlurFade, ShimmerButton } from '../components/magicui'
```

**MINIMAL ENHANCEMENT:**
```jsx
<BlurFade delay={0.1}>
  <div className="settings-section">
    {/* Settings content */}
  </div>
</BlurFade>
```
```

---

## 🚀 Batch Refactoring Strategy

### Priority Order for Maximum Impact

**Week 1: Critical Pages**
1. Dashboard.jsx - 🔥 Maximum impact
2. Assets.jsx - 🔥 High engagement
3. GoalsPage.jsx - 🔥 Motivational boost

**Week 2: Important Pages**
4. Insurance.jsx
5. Transactions.jsx
6. Analytics.jsx

**Week 3: Secondary Pages**
7. Profile.jsx
8. ToolsPage.jsx
9. UserSettings.jsx

### One-Go Refactoring Prompt (ALL PAGES)

```markdown
Please refactor ALL pages in the Aura Asset Manager to include Magic UI components in the following priority order:

1. **Dashboard.jsx** (CRITICAL)
2. **Assets.jsx** (HIGH)
3. **GoalsPage.jsx** (HIGH)
4. **Insurance.jsx** (MEDIUM)
5. **Transactions.jsx** (MEDIUM)
6. **Analytics.jsx** (MEDIUM)
7. **Profile.jsx** (LOW)
8. **ToolsPage.jsx** (LOW)
9. **UserSettings.jsx** (LOW)

For each page, follow the detailed refactoring instructions in:
`/Users/ishankukade/workspace/aura-asset-manager/docs/MAGIC_UI_IMPLEMENTATION_GUIDE.md`

**GLOBAL REQUIREMENTS:**
- Preserve ALL business logic
- Maintain ALL existing functionality
- Keep ALL data fetching intact
- Test each page after refactoring
- Ensure mobile responsiveness
- Verify accessibility

**IMPORT PATTERN:**
```jsx
import { ComponentName } from '@/components/magicui'
```

**TESTING AFTER EACH PAGE:**
1. Page loads without errors
2. Animations are smooth (60fps)
3. All user interactions work
4. No performance degradation
5. Mobile responsive maintained

**REPORT PROGRESS:**
After completing each page, report:
- ✅ Page refactored
- ✅ Tests passed
- 📊 Components added: [list]
- 🐛 Issues found: [list or "None"]

Proceed with refactoring starting with Dashboard.jsx.
```

---

**Last Updated:** October 20, 2025  
**Total Prompts:** 9 individual + 1 batch  
**Ready for Use:** ✅ Yes
