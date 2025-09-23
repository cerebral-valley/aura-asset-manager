# Target Page Design Specification

## 🎯 Overview
The Target Page allows users to set and track financial aspirations with a focus on providing peace of mind and visual progress tracking. Users can allocate liquid assets toward specific goals and monitor progress automatically.

## 📋 Page Structure & Flow

### Section 1: Liquid Assets Selection
```
💰 Available Liquid Assets                    [Refresh Assets]
┌─────────────────────────────────────────────────────────┐
│ Select assets to include in your allocation pool:       │
│                                                         │
│ ☑️ Vanguard S&P 500 ETF        $45,000    [Details]   │
│ ☑️ Fidelity Total Market       $25,000    [Details]   │
│ ☑️ Chase Savings Account       $15,000    [Details]   │
│ ☑️ Gold Coins Collection       $8,000     [Details]   │
│ ☐️ Emergency Fund CD           $12,000    [Details]   │
│ ☑️ Apple Stock Holdings        $7,500     [Details]   │
│                                                         │
│ Selected Total: $100,500                              │
│ Available for Allocation: $15,200 (unallocated)       │
└─────────────────────────────────────────────────────────┘
```

**Features:**
- Individual asset selection with checkboxes
- Real-time total calculation
- "Details" button opens modal with asset information
- "Refresh Assets" button updates values from backend
- Shows available unallocated amount

### Section 2: Net Worth Milestone (Hero Card)
```
🏆 NET WORTH MILESTONE                    [Save] [Edit]
┌───────────────────────────────────────────────────────┐
│ Current Net Worth: $285,000                           │
│ Target Net Worth: $500,000                           │
│ Progress: ████████████░░░░░░░░ 57%                   │
│                                                       │
│ Target Date: December 2027                           │
│ Time Remaining: 27 months                            │
│ Monthly Growth Needed: $7,963/month                  │
│                                                       │
│ "Your sanctuary foundation grows stronger each month" │
└───────────────────────────────────────────────────────┘
```

**Features:**
- Auto-calculated from total asset values
- Larger, prominent display (hero treatment)
- Aspirational messaging based on theme
- Monthly growth calculation
- Edit modal for target amount and date

### Section 3: Custom Target Cards Grid (2x2 Desktop, 1 Column Mobile)
```
🎯 YOUR ASPIRATIONS

┌─────────────────────┐    ┌─────────────────────┐
│ House Down Payment  │    │ Dream Vacation      │
│ Target: $50,000     │    │ Target: $15,000     │
│ ████████████░░░░    │    │ ██████░░░░░░░░░░    │
│ 75% ($37,500)       │    │ 40% ($6,000)        │
│                     │    │                     │
│ Allocated Amount:   │    │ Allocated Amount:   │
│ $37,500            │    │ $6,000             │
│ Allocation: 35%     │    │ Allocation: 10%     │
│ Monthly: $625       │    │ Monthly: $450       │
│ Due: Jan 2026       │    │ Due: Jun 2025       │
│ Status: ✅ On track │    │ Status: ⚠️ Behind   │
│                     │    │                     │
│ [Save][Edit][Remove]│    │ [Save][Edit][Remove]│
│ [Completed]         │    │ [Completed]         │
└─────────────────────┘    └─────────────────────┘

┌─────────────────────┐    ┌─────────────────────┐
│ Emergency Buffer    │    │ + Add New Target    │
│ Target: $25,000     │    │                     │
│ ██████████████████  │    │ Create your next    │
│ 90% ($22,500)       │    │ financial milestone │
│                     │    │                     │
│ Allocated Amount:   │    │ Allocated Amount:   │
│ $22,500             │    │ $0                  │
│ Allocation: 35%     │    │ Allocation: 10%     │
│ Monthly: $625       │    │ Monthly: $0         │
│ Due: Jan 2026       │    │ Due:                │
│ Status: ✅ On track │    │ Status:             │
│                     │    │                     │
│ [Save][Edit][Remove]│    │ [Save][Edit][Remove]│
│ [Completed]         │    │ [Completed]         │
└─────────────────────┘    └─────────────────────┘

```

**Features:**
- Maximum 4 custom targets + 1 "Add New" slot
- Progress bars with percentage and dollar amounts
- Monthly savings calculation based on time remaining
- Status indicators (On track, Behind, Past due)
- Individual Save/Remove buttons for each target
- Input fields for allocation percentage
- Modal for creating new targets

### Section 4: Allocation Overview & Warnings
```
📊 ALLOCATION OVERVIEW
┌─────────────────────────────────────────────────────┐
│ Total Selected Assets: $100,500                     │
│ Total Allocated: $85,300 (85%)                     │
│ Available for Allocation: $15,200                  │
│                                                     │
│ ⚠️ Vacation target behind schedule - consider       │
│    increasing allocation or extending deadline      │
│                                                     │
│ ✅ All other targets on track for completion        │
└─────────────────────────────────────────────────────┘
```

**Features:**
- Summary of total allocations
- Smart warnings for unrealistic targets
- Status overview of all targets
- Recommendations for adjustments

### Section 5: Target Logs (Completed/Archived)
```
📜 TARGET LOGS
┌─────────────────────────────────────────────────────┐
│ Completed Targets:                                  │
│                                                     │
│ ✅ Car Purchase Fund     $30,000    Completed Mar 2025│
│ ✅ Wedding Savings       $15,000    Completed Jan 2025│
│                                                     │
│ [View Details] [Restore Target]                     │
└─────────────────────────────────────────────────────┘
```

**Features:**
- Archive of completed and removed targets
- Restore functionality for accidentally removed targets
- Historical tracking of achievements

## 🎨 Design Principles

### Aspirational & Calming Approach
- **Language**: "Aspirations" instead of "Goals", "Milestones" instead of "Targets"
- **Tone**: "Your sanctuary foundation grows stronger", "Moving closer to your dreams"
- **Colors**: Soft greens and blues, rounded corners, gentle animations
- **Progress**: Encouraging rather than stressful messaging

### User Experience
- **Modals**: All details, editing, and creation in overlays
- **Real-time Updates**: Immediate feedback on allocation changes
- **Mobile First**: Single column layout on mobile devices
- **Save Actions**: Explicit save buttons, no auto-save to prevent accidental changes

## 🔧 Technical Implementation

### Database Schema

#### targets table
```sql
CREATE TABLE targets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    target_amount DECIMAL(18,2) NOT NULL,
    target_date DATE,
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'completed', 'paused', 'archived'
    target_type VARCHAR(50) DEFAULT 'custom', -- 'net_worth', 'custom'
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### target_allocations table
```sql
CREATE TABLE target_allocations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    target_id UUID NOT NULL REFERENCES targets(id) ON DELETE CASCADE,
    asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    allocation_amount DECIMAL(18,2) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(target_id, asset_id)
);
```

#### user_asset_selections table
```sql
CREATE TABLE user_asset_selections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    is_selected BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, asset_id)
);
```

### API Endpoints
- `GET /api/v1/targets` - Get user's targets + calculations
- `POST /api/v1/targets` - Create new target
- `PUT /api/v1/targets/{id}` - Update target
- `DELETE /api/v1/targets/{id}` - Remove target
- `GET /api/v1/targets/liquid-assets` - Get user's assets with selection status
- `PUT /api/v1/targets/liquid-assets` - Update selected assets
- `POST /api/v1/targets/{id}/allocations` - Update target allocations

### Frontend State Management
- **TanStack Query**: Server state for targets, assets, calculations
- **Local State**: Modal open/close, form validation, temporary edits
- **Real-time Calculations**: Frontend calculation of progress, monthly savings
- **Optimistic Updates**: Immediate UI updates, sync with server on save

### Data Refresh Strategy
- Page navigation refresh
- User login refresh
- Manual "Refresh Assets" button
- No automatic background polling

## 📱 Responsive Design

### Desktop (≥1024px)
- 2x2 grid for target cards
- Side-by-side layout for sections
- Full-width modals with larger content areas

### Tablet (768px-1023px)
- 2x1 grid for target cards
- Stacked sections
- Medium-sized modals

### Mobile (<768px)
- Single column layout for all target cards
- Fully stacked sections
- Full-screen modals
- Touch-friendly input controls

## ⚠️ Edge Cases & Validations

### Asset Selection
- No assets selected: Show warning "Please select at least one asset"
- All assets deselected: Reset all allocations to 0%

### Target Creation
- Past target date: Show warning and suggest extending
- Unrealistic timeline: Calculate required monthly savings and warn if >50% of liquid assets

### Allocation Management
- Over-allocation: Show warning when total exceeds 100%
- Under-allocation: Show available percentage for allocation
- Freed allocation: When target removed, show freed amount available

### Progress Tracking
- Target achieved: Auto-suggest marking as complete
- Past due: Highlight in red and suggest extending or completing
- Negative progress: Handle cases where asset values decrease

## 🎯 Success Metrics
- User creates at least one custom target within first session
- Average number of targets per active user
- Percentage of targets completed vs. abandoned
- User retention on target page (return visits)
- Asset allocation engagement (percentage of users who allocate >50% of liquid assets)