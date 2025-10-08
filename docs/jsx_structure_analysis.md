# JSX Structure Analysis - GoalsPage.jsx

## Line-by-Line JSX Element Tracking

**Main Return Statement: Line 290**
```jsx
return (
```
**Level 0**: return opening parenthesis

**Line 291**: Main container div opening
```jsx
<div className={`p-6 min-h-screen ${isDark ? 'bg-black text-neutral-100' : 'bg-gray-50'}`}>
```
**Level 1**: Main container OPEN

### Section 1: Page Header (Lines 292-299)
**Line 292**: `{/* Page Header */}`
**Line 293**: 
```jsx
<div className="mb-6">
```
**Level 2**: Header container OPEN

**Line 297**: Header container CLOSE
```jsx
</div>
```
**Level 1**: Back to main container

### Section 2: Selected Assets Section (Lines 301-380)
**Line 301**: `{/* Selected Assets Section */}`
**Line 302**: 
```jsx
<div className="mb-6">
```
**Level 2**: Selected Assets section container OPEN

**Line 306**: Content div
```jsx
<div className={`${isDark ? 'bg-neutral-900' : 'bg-white'} rounded shadow p-4 overflow-x-auto`}>
```
**Level 3**: Content container OPEN

**Line 379**: Content container CLOSE
```jsx
</div>
```
**Level 2**: Back to section container

**Line 380**: Section container CLOSE
```jsx
</div>
```
**Level 1**: Back to main container

### Section 3: Net Worth Goal Section (Lines 382-522)
**Line 382**: `{/* Net Worth Goal Section */}`
**Line 383**: 
```jsx
<div className="mb-6">
```
**Level 2**: Net Worth section container OPEN

**Line 387**: Content div
```jsx
<div className={`${isDark ? 'bg-neutral-900' : 'bg-white'} rounded shadow p-6`}>
```
**Level 3**: Content container OPEN

**Line 521**: Content container CLOSE
```jsx
</div>
```
**Level 2**: Back to section container

**Line 522**: Section container CLOSE
```jsx
</div>
```
**Level 1**: Back to main container

### Section 4: Custom Goals Section (Lines 524-734)
**Line 524**: `{/* Custom Goals Section */}`
**Line 525**: 
```jsx
<div className="mb-6">
```
**Level 2**: Custom Goals section container OPEN

**Lines 526-538**: Header div with button
```jsx
<div className="flex justify-between items-center mb-4">
  // header content
</div>
```
**Level 3**: Header div OPEN and CLOSE (completed correctly)

**Lines 539-635**: Form, notice, and grid sections with multiple nested divs

Let me trace the critical closing structure:

**Line 728**: `</div>` - Closes single goal card (Level 4)
**Line 730**: `})}` - Closes map function
**Line 731**: `</div>` - Closes grid container (Level 3)
**Line 732**: `)}` - Closes conditional for customGoals.length > 0
**Line 733**: `</div>` - ??? This should close something at Level 3
**Line 734**: `</div>` - This should close the section container from line 525 (Level 2)

### CRITICAL ISSUE IDENTIFIED:
The problem is in the Custom Goals Section structure. Let me trace what should be closing at line 733.

Looking at the pattern from other sections, after the header (lines 526-538), there should be a content wrapper div that contains all the form/notice/grid content, similar to how Selected Assets and Net Worth sections work.

**Expected Structure:**
```jsx
{/* Custom Goals Section */}
<div className="mb-6">                          // Line 525 - Section container
  <div className="flex...">Header</div>         // Lines 526-538 - Header (CLOSED correctly)
  <div className="content-wrapper">             // MISSING - Should wrap all content below
    // Form, notice, grid content (lines 539-732)
  </div>                                        // MISSING CLOSE - Should be at line 733
</div>                                          // Line 734 - Section container close
```

**Actual Structure:**
```jsx
{/* Custom Goals Section */}
<div className="mb-6">                          // Line 525 - Section container
  <div className="flex...">Header</div>         // Lines 526-538 - Header (CLOSED correctly)
  // Form, notice, grid content (lines 539-732) - NOT WRAPPED!
  </div>                                        // Line 733 - EXTRA CLOSE (no matching open)
</div>                                          // Line 734 - Section container close
```

The issue is that line 733 has a `</div>` that doesn't match any opening div. This extra closing div is breaking the JSX structure.

## Solution:
**Option 1**: Remove the extra `</div>` at line 733
**Option 2**: Add a content wrapper div after line 538 and keep the close at line 733

Let me verify this analysis by checking what was originally there before SafeSection removal...
