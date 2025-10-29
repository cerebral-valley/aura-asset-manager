# Asset Allocation Anomaly Detection System

## Overview

The Asset Matrix tool now includes an intelligent anomaly detection system that validates whether assets are properly allocated based on their **purpose** and **time horizon**, considering their **liquidity status**.

## Business Logic & Validation Rules

### Liquid Assets Matrix Rules

#### 1. **Children's Education**
- ✅ **MUST be Long Term (> 3 years)**
- ❌ Cannot be Short Term or Medium Term
- **Reason**: Education savings require long-term stability and growth-oriented investments to maximize value by the time funds are needed.

#### 2. **Speculation**
- ✅ **MUST be Short Term (< 1 year)**
- ❌ Cannot be Medium Term or Long Term
- **Reason**: Speculative investments are high-risk and should only be held short-term to minimize exposure and allow quick exits.

#### 3. **Financial Security**
- ✅ **MUST be Long Term (> 3 years)**
- ❌ Cannot be Short Term or Medium Term
- **Reason**: Financial security requires long-term stability and compound growth to build a solid foundation.

#### 4. **Hyper Growth**
- ✅ **MUST be Long Term (> 3 years)**
- ❌ Cannot be Short Term or Medium Term
- **Reason**: Hyper growth strategies need extended time horizons to realize their full potential through compound returns.

#### 5. **Retirement Fund**
- ✅ **MUST be Long Term (> 3 years)**
- ❌ Cannot be Short Term or Medium Term
- **Reason**: Retirement planning demands long-term investment strategies to accumulate sufficient wealth.

#### 6. **Emergency Fund**
- ✅ **MUST be Short Term (< 1 year)**
- ❌ Cannot be Medium Term or Long Term
- **Reason**: Emergency funds must be immediately accessible for urgent, unexpected needs.

#### 7. **Growth**
- ✅ **Can be ANY time horizon** (Short, Medium, or Long Term)
- **Reason**: Growth investments are flexible and can span any time horizon based on specific strategy and goals.

---

### Illiquid Assets Matrix Rules

#### General Rule for ALL Illiquid Assets
- ❌ **NO assets should be Short Term (< 1 year)**
- **Reason**: By definition, illiquid assets cannot provide short-term liquidity. They require time to convert to cash.

#### 1. **Children's Education**
- ✅ **MUST be Long Term (> 3 years)**
- ❌ Cannot be Medium Term or Short Term
- **Reason**: Same as liquid assets - long-term planning required, but in illiquid form (real estate, education bonds, etc.)

#### 2. **Speculation**
- ✅ **Can be Medium Term or Long Term**
- ❌ Cannot be Short Term
- **Reason**: Speculative illiquid assets (art, collectibles, alternative investments) need time to mature and find buyers.

#### 3. **Financial Security**
- ✅ **MUST be Long Term (> 3 years)**
- ❌ Cannot be Medium Term or Short Term
- **Reason**: Long-term commitment required for illiquid security assets (real estate, long-term bonds).

#### 4. **Hyper Growth**
- ✅ **MUST be Long Term (> 3 years)**
- ❌ Cannot be Medium Term or Short Term
- **Reason**: Hyper growth in illiquid markets (private equity, venture capital) requires extended time horizons.

#### 5. **Retirement Fund**
- ✅ **MUST be Long Term (> 3 years)**
- ❌ Cannot be Medium Term or Short Term
- **Reason**: Retirement investments in illiquid assets must be very long-term (real estate, annuities).

#### 6. **Emergency Fund**
- ❌ **PROHIBITED - NO valid time horizons**
- **Reason**: Emergency funds must NEVER be in illiquid assets. They need immediate accessibility, which illiquid assets cannot provide.

#### 7. **Growth**
- ✅ **Can be Medium Term or Long Term**
- ❌ Cannot be Short Term
- **Reason**: Growth strategies in illiquid assets require at least medium-term horizons to realize value.

---

## Severity Levels

### 🔴 **Critical**
- Emergency Fund in illiquid assets (any time horizon)
- Any illiquid asset allocated to Short Term
- Asset completely violating core business logic

**Action Required**: Immediate reallocation needed

### 🟠 **High Priority**
- Retirement/Education/Financial Security not in Long Term
- Speculation in Medium/Long Term (liquid) or Short Term (illiquid)
- Significant misalignment with purpose

**Action Required**: Should be addressed soon

### 🟡 **Medium Priority**
- Minor violations that may still work but aren't optimal
- Edge cases that need review

**Action Required**: Review when convenient

---

## Visual Indicators

### Matrix Cell Indicators

**Colored Ring Around Cell:**
- 🔴 Red Ring = Critical severity anomalies present
- 🟠 Orange Ring = High priority anomalies present
- 🟡 Yellow Ring = Medium priority anomalies present

**Colored Dot in Top-Right Corner:**
- Same color coding as rings
- Indicates at least one anomaly exists in that cell

### Hover Tooltips

When hovering over a cell with anomalies:
- Shows normal cell information (asset count, value, percentage)
- **NEW**: Shows anomaly count and severity
- Directs user to detailed writeup below matrix

---

## Anomaly Writeup Structure

### Perfect Allocation ✅
```
✓ Perfect Allocation
All liquid/illiquid assets are properly allocated according to their purpose and time horizon.
```

### Anomalies Detected ⚠️

**Summary Section:**
- Total anomaly count
- Breakdown by severity (Critical, High, Medium)

**Grouped by Purpose:**
Each asset purpose with issues shows:
- Purpose name
- All assets with anomalies under that purpose

**For Each Anomaly:**
1. **Asset Name & Value**: Quick identification
2. **Issue**: Clear description of the problem
3. **Why**: Business reasoning for the rule
4. **Recommendation**: Specific action to fix the issue

---

## Example Scenarios

### Scenario 1: Emergency Fund in Real Estate (Illiquid)

**❌ Critical Issue:**
```
Asset: "Emergency Cash Reserve" - $50,000
Purpose: Emergency Fund
Current Allocation: Illiquid, Long Term

Issue: Emergency Fund cannot be in illiquid assets
Why: Emergency funds must NEVER be in illiquid assets - they need immediate accessibility
Recommendation: This asset should not exist in illiquid assets with this purpose. 
                Convert to liquid assets immediately.
```

### Scenario 2: Retirement Fund in Short Term Bonds

**❌ High Priority Issue:**
```
Asset: "Retirement Bonds" - $100,000
Purpose: Retirement Fund
Current Allocation: Liquid, Short Term

Issue: Retirement Fund (Retirement Fund) is incorrectly allocated to Short Term (< 1 year)
Why: Retirement planning demands long-term investment strategies
Recommendation: This asset should be reallocated to: Long Term (> 3 years)
```

### Scenario 3: Speculation in Illiquid Short Term

**❌ Critical Issue (Compound Violation):**
```
Asset: "Collectible Art Investment" - $25,000
Purpose: Speculation
Current Allocation: Illiquid, Short Term

Multiple Issues:
1. Illiquid assets cannot be Short Term (general rule)
2. Speculation in illiquid form cannot be Short Term

Recommendation: Change to Medium Term or Long Term, or convert to liquid speculative asset
```

---

## Implementation Details

### Files Created/Modified

#### New Files:
1. **`frontend/src/utils/assetAllocationRules.js`**
   - Core validation rules engine
   - `LIQUID_ASSET_RULES` - Rules for liquid assets
   - `ILLIQUID_ASSET_RULES` - Rules for illiquid assets
   - `detectAllocationAnomalies()` - Main detection function
   - `generateAnomalyWriteup()` - Writeup generation
   - Helper functions for severity colors and labels

2. **`frontend/src/components/charts/AllocationAnomalyWriteup.jsx`**
   - React component for displaying writeups
   - Styled with Tailwind CSS
   - Dark mode support
   - Severity badges and indicators
   - Collapsible sections by purpose

#### Modified Files:
1. **`frontend/src/components/charts/MatrixChart.jsx`**
   - Integrated anomaly detection
   - Added visual indicators (rings, dots)
   - Enhanced hover tooltips with anomaly info
   - Renders AllocationAnomalyWriteup component

---

## User Experience Flow

1. **Navigate to Tools → Asset Matrix**
2. **View Matrix**: 
   - Normal cells show asset distribution
   - Cells with anomalies have colored rings/dots
3. **Hover Over Cell**:
   - See asset details
   - If anomalies exist, see count and severity
   - Tooltip directs to detailed writeup
4. **Review Writeup Below Matrix**:
   - Green success message if perfect allocation
   - Red alert with detailed issues if anomalies found
5. **Take Action**:
   - Read recommendations for each asset
   - Navigate to Assets page to make adjustments
   - Return to matrix to verify fixes

---

## Future Enhancements

### Potential Features:
1. **One-Click Fix**: Direct link to edit asset with suggested changes pre-filled
2. **Anomaly History**: Track when anomalies were detected and resolved
3. **Bulk Actions**: Fix multiple similar anomalies at once
4. **Custom Rules**: Allow users to define their own allocation rules
5. **AI Recommendations**: ML-powered suggestions based on portfolio composition
6. **Notifications**: Alert users when new anomalies are detected
7. **Export Report**: Generate PDF report of all anomalies and recommendations

---

## Testing the System

### Test Cases to Verify:

#### Liquid Assets:
- [ ] Emergency Fund in Short Term → ✅ Perfect
- [ ] Emergency Fund in Medium/Long Term → ❌ Anomaly
- [ ] Retirement Fund in Long Term → ✅ Perfect
- [ ] Retirement Fund in Short/Medium Term → ❌ Anomaly
- [ ] Speculation in Short Term → ✅ Perfect
- [ ] Speculation in Medium/Long Term → ❌ Anomaly
- [ ] Growth in any time horizon → ✅ Perfect (always)

#### Illiquid Assets:
- [ ] Any asset in Short Term → ❌ Critical Anomaly
- [ ] Emergency Fund (any horizon) → ❌ Critical Anomaly
- [ ] Retirement Fund in Long Term → ✅ Perfect
- [ ] Speculation in Medium/Long Term → ✅ Perfect
- [ ] Children's Education in Long Term → ✅ Perfect

---

## Technical Notes

### Performance:
- Anomaly detection runs in `useMemo` hooks for optimal performance
- Only re-computes when assets or liquidity status changes
- No API calls required - all validation client-side

### Extensibility:
- Rules are centralized in `assetAllocationRules.js`
- Easy to add new purposes or modify existing rules
- Severity levels can be adjusted per rule
- Support for custom validation logic per purpose

### Accessibility:
- Color-coded indicators also use icons
- Screen reader friendly labels
- Keyboard navigation supported
- High contrast mode compatible

---

## Version History

**v0.236** - Initial Release (October 26, 2025)
- Complete validation rules for liquid and illiquid assets
- Visual indicators in matrix cells
- Detailed anomaly writeups with recommendations
- Dark mode support
- Severity-based prioritization (Critical, High, Medium)

---

## Support & Documentation

For questions or issues with the anomaly detection system:
1. Review this documentation
2. Check the business rules section for specific scenarios
3. Test with sample data in development environment
4. Refer to code comments in `assetAllocationRules.js` for technical details
