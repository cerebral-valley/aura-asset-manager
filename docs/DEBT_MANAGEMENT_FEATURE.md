# Debt Management Feature - Comprehensive Design Document

## 📋 Overview

This document outlines the complete design for adding a Debt Management feature to Aura Asset Manager, a personal financial sanctuary platform. The feature is designed to align with the platform's core philosophy: providing peace of mind over complex metrics, focusing on visual security and emotional wellness alongside financial tracking.

**Target Scale**: Designed to handle 100K+ users with proper optimization phases.

---

## 📊 What the Debt Management Page Should Cover

### Core Dashboard Elements

1. **Debt Overview Panel**
   - Total debt across all accounts
   - Weighted average interest rate
   - Monthly debt service (total minimum payments)
   - Debt-to-income ratio
   - Projected debt-free date
   - Visual breakdown by debt type (mortgage, credit cards, student loans, etc.)

2. **Individual Debt Cards**
   - Creditor name and debt type
   - Current balance vs original principal
   - Interest rate and payment frequency
   - Progress bar showing % paid off
   - "Months remaining" countdown
   - Quick actions: log payment, edit, view details

3. **Payment Tracking**
   - Payment history timeline
   - Principal vs interest breakdown
   - Year-to-date payments summary
   - Interest paid to date

4. **Strategy Tools**
   - Avalanche method calculator (highest interest first)
   - Snowball method calculator (smallest balance first)
   - Custom strategy builder
   - Side-by-side comparison with total interest and timeline

---

## 🗄️ Database Schema Design

### Design Principles

- UUID primary keys (distributed system ready)
- user_id foreign keys for multi-tenancy
- JSONB metadata for flexibility
- Composite indexes for common query patterns
- Table partitioning for large tables
- Materialized views for expensive aggregations

---

### Primary Tables

#### 1. `debts` Table (Production-Ready)

```sql
CREATE TABLE debts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Basic Information
    debt_type VARCHAR(50) NOT NULL, -- 'mortgage', 'credit_card', 'student_loan', 'personal_loan', 'auto_loan', 'medical', 'business'
    creditor_name VARCHAR(255) NOT NULL,
    account_number VARCHAR(100), -- encrypted/masked
    
    -- Financial Details
    original_principal DECIMAL(15,2) NOT NULL,
    current_balance DECIMAL(15,2) NOT NULL,
    interest_rate DECIMAL(5,2) NOT NULL, -- stored as percentage
    minimum_payment DECIMAL(10,2) NOT NULL,
    payment_frequency VARCHAR(20) DEFAULT 'monthly', -- 'weekly', 'biweekly', 'monthly'
    
    -- Promoted Fields (frequently queried, NOT in metadata)
    apr_type VARCHAR(20), -- 'fixed', 'variable'
    has_autopay BOOLEAN DEFAULT false,
    grace_period_days INTEGER,
    
    -- Dates
    start_date DATE NOT NULL,
    maturity_date DATE, -- nullable for revolving credit
    next_payment_date DATE,
    
    -- Metadata (less frequently queried fields)
    metadata JSONB DEFAULT '{}', -- rewards info, customer service notes, etc.
    notes TEXT,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Composite indexes for common query patterns
CREATE INDEX idx_debts_user_active ON debts(user_id, is_active);
CREATE INDEX idx_debts_user_type ON debts(user_id, debt_type);
CREATE INDEX idx_debts_next_payment ON debts(next_payment_date) WHERE next_payment_date IS NOT NULL;
CREATE INDEX idx_debts_autopay ON debts(user_id) WHERE has_autopay = true;
CREATE INDEX idx_debts_metadata ON debts USING GIN (metadata); -- For JSONB queries
```

**Why these indexes**:
- `idx_debts_user_active`: Most queries filter by user and active status
- `idx_debts_user_type`: Filtering debts by type per user
- `idx_debts_next_payment`: Payment reminder queries
- `idx_debts_autopay`: Finding autopay-enabled debts
- `idx_debts_metadata`: Efficient JSONB field queries

---

#### 2. `debt_payments` Table (Partitioned for Scale)

```sql
CREATE TABLE debt_payments (
    id UUID DEFAULT uuid_generate_v4(),
    debt_id UUID NOT NULL,
    user_id UUID NOT NULL,
    
    -- Payment Details
    payment_date DATE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    principal_portion DECIMAL(10,2) NOT NULL,
    interest_portion DECIMAL(10,2) NOT NULL,
    remaining_balance DECIMAL(15,2) NOT NULL,
    
    -- Context
    payment_method VARCHAR(50), -- 'bank_transfer', 'auto_pay', 'check', etc.
    is_extra_payment BOOLEAN DEFAULT false,
    transaction_id UUID, -- link to existing transactions table
    
    metadata JSONB DEFAULT '{}',
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    
    PRIMARY KEY (id, payment_date) -- Include partition key
) PARTITION BY RANGE (payment_date);

-- Create quarterly partitions
CREATE TABLE debt_payments_2024_q4 PARTITION OF debt_payments
    FOR VALUES FROM ('2024-10-01') TO ('2025-01-01');

CREATE TABLE debt_payments_2025_q1 PARTITION OF debt_payments
    FOR VALUES FROM ('2025-01-01') TO ('2025-04-01');

CREATE TABLE debt_payments_2025_q2 PARTITION OF debt_payments
    FOR VALUES FROM ('2025-04-01') TO ('2025-07-01');

-- ... create future partitions as needed

-- Indexes on each partition
CREATE INDEX idx_payments_debt_2024_q4 ON debt_payments_2024_q4(debt_id, payment_date DESC);
CREATE INDEX idx_payments_user_2024_q4 ON debt_payments_2024_q4(user_id, payment_date DESC);

CREATE INDEX idx_payments_debt_2025_q1 ON debt_payments_2025_q1(debt_id, payment_date DESC);
CREATE INDEX idx_payments_user_2025_q1 ON debt_payments_2025_q1(user_id, payment_date DESC);
```

**Why partitioning**:
- Fast growth: 6M+ records per year with 100K users
- Queries typically focus on recent payments
- Easy archival of old partitions
- Better vacuum/analyze performance
- Smaller index sizes per partition

---

#### 3. `debt_strategies` Table

```sql
CREATE TABLE debt_strategies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Strategy Details
    strategy_name VARCHAR(255) NOT NULL,
    strategy_type VARCHAR(50) NOT NULL, -- 'avalanche', 'snowball', 'custom'
    target_debts JSONB NOT NULL, -- [{"debt_id": "uuid", "priority": 1, "extra_payment_allocation": 0.5}]
    extra_payment_amount DECIMAL(10,2) DEFAULT 0,
    
    -- Goals
    target_completion_date DATE,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_strategies_user_active ON debt_strategies(user_id, is_active);
```

---

#### 4. `debt_alerts` Table (Optional)

```sql
CREATE TABLE debt_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    debt_id UUID REFERENCES debts(id) ON DELETE CASCADE, -- nullable for global alerts
    
    -- Alert Configuration
    alert_type VARCHAR(50) NOT NULL, -- 'payment_due', 'interest_rate_change', 'milestone', 'utilization_warning'
    threshold_value DECIMAL(10,2),
    days_before INTEGER, -- for payment reminders
    
    is_enabled BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_alerts_user ON debt_alerts(user_id);
CREATE INDEX idx_alerts_debt ON debt_alerts(debt_id) WHERE debt_id IS NOT NULL;
```

---

### Materialized Views for Performance

#### User Debt Summary (for fast dashboard loading)

```sql
CREATE MATERIALIZED VIEW user_debt_summary AS
SELECT 
    d.user_id,
    COUNT(*) FILTER (WHERE d.is_active) as active_debts,
    SUM(d.current_balance) FILTER (WHERE d.is_active) as total_debt,
    SUM(d.minimum_payment) FILTER (WHERE d.is_active) as monthly_payment,
    AVG(d.interest_rate) FILTER (WHERE d.is_active) as avg_interest_rate,
    SUM(CASE WHEN d.debt_type = 'credit_card' THEN d.current_balance ELSE 0 END) FILTER (WHERE d.is_active) as credit_card_debt,
    SUM(CASE WHEN d.debt_type = 'mortgage' THEN d.current_balance ELSE 0 END) FILTER (WHERE d.is_active) as mortgage_debt,
    SUM(CASE WHEN d.debt_type = 'student_loan' THEN d.current_balance ELSE 0 END) FILTER (WHERE d.is_active) as student_loan_debt,
    MIN(d.next_payment_date) FILTER (WHERE d.is_active) as next_payment_due,
    MAX(d.updated_at) as last_updated
FROM debts d
GROUP BY d.user_id;

CREATE UNIQUE INDEX idx_debt_summary_user ON user_debt_summary(user_id);

-- Refresh strategy: Hourly via cron or after updates
CREATE EXTENSION IF NOT EXISTS pg_cron;
SELECT cron.schedule('refresh-debt-analytics', '0 * * * *', 
    'REFRESH MATERIALIZED VIEW CONCURRENTLY user_debt_summary');
```

**Benefits**:
- Dashboard loads in < 50ms instead of 1-2 seconds
- Complex aggregations pre-calculated
- Concurrent refresh doesn't lock table

---

## 🛠️ Debt Analysis Tools

### 1. Payoff Strategy Comparator

**Features**:
- Avalanche method (highest interest rate first)
- Snowball method (smallest balance first)
- Custom strategy (user-defined priority)

**Comparison Metrics**:
- Total interest paid
- Time to debt-free (months)
- Monthly cash flow impact
- Psychological wins (debts eliminated count)

**Backend Algorithm** (simplified):

```python
def calculate_avalanche(debts: List[Debt], extra_payment: Decimal) -> PayoffTimeline:
    """
    Calculate debt payoff using avalanche method.
    Pays highest interest rate first.
    """
    sorted_debts = sorted(debts, key=lambda d: d.interest_rate, reverse=True)
    
    timeline = []
    month = 0
    total_interest = Decimal(0)
    
    while any(d.current_balance > 0 for d in sorted_debts):
        month += 1
        
        # Apply minimum payments to all debts
        for debt in sorted_debts:
            if debt.current_balance > 0:
                interest = debt.current_balance * (debt.interest_rate / 100 / 12)
                principal = min(debt.minimum_payment - interest, debt.current_balance)
                debt.current_balance -= principal
                total_interest += interest
        
        # Apply extra payment to highest interest debt
        for debt in sorted_debts:
            if debt.current_balance > 0 and extra_payment > 0:
                principal = min(extra_payment, debt.current_balance)
                debt.current_balance -= principal
                extra_payment -= principal
                break
        
        timeline.append({
            "month": month,
            "remaining_debt": sum(d.current_balance for d in sorted_debts),
            "total_interest_paid": total_interest
        })
    
    return PayoffTimeline(
        months=month,
        total_interest=total_interest,
        timeline=timeline
    )
```

---

### 2. Extra Payment Impact Calculator

**Interactive slider**: "What if I paid $X extra per month?"

**Visual Impact Display**:
- Interest saved (dollar amount)
- Months saved (time reduction)
- New debt-free date
- Before/after comparison charts

**Backend Calculation**:

```python
def calculate_extra_payment_impact(
    debts: List[Debt],
    current_extra: Decimal,
    new_extra: Decimal
) -> ImpactAnalysis:
    """
    Compare impact of different extra payment amounts.
    """
    baseline = calculate_avalanche(debts, current_extra)
    optimized = calculate_avalanche(debts, new_extra)
    
    return ImpactAnalysis(
        interest_saved=baseline.total_interest - optimized.total_interest,
        months_saved=baseline.months - optimized.months,
        current_payoff_date=baseline.completion_date,
        new_payoff_date=optimized.completion_date,
        monthly_difference=new_extra - current_extra
    )
```

---

### 3. Debt Consolidation Analyzer

**Inputs**:
- Proposed consolidation loan terms
- Interest rate
- Loan origination fees

**Outputs**:
- Current scenario vs consolidated
- Break-even point (months)
- Total interest comparison
- Monthly payment difference
- Pros/cons analysis

---

### 4. Credit Utilization Tracker (Credit Cards)

**Features**:
- Per-card utilization percentage
- Total utilization across all cards
- Impact on credit score (educational)
- Alerts at 30% and 50% thresholds

**Calculation**:

```python
def calculate_utilization(credit_cards: List[Debt]) -> UtilizationReport:
    """
    Calculate credit utilization ratios.
    """
    per_card = []
    total_balance = Decimal(0)
    total_limit = Decimal(0)
    
    for card in credit_cards:
        credit_limit = card.metadata.get('credit_limit', 0)
        utilization = (card.current_balance / credit_limit * 100) if credit_limit > 0 else 0
        
        per_card.append({
            "creditor": card.creditor_name,
            "balance": card.current_balance,
            "limit": credit_limit,
            "utilization": utilization,
            "warning": utilization > 30
        })
        
        total_balance += card.current_balance
        total_limit += credit_limit
    
    return UtilizationReport(
        per_card=per_card,
        total_utilization=(total_balance / total_limit * 100) if total_limit > 0 else 0,
        recommendation="Keep below 30% for optimal credit score"
    )
```

---

### 5. Amortization Schedule Generator

**Features**:
- Month-by-month breakdown
- Principal vs interest visualization
- Impact of extra payments
- Downloadable/printable schedule

---

### 6. Debt-to-Income Calculator

**Features**:
- DTI ratio with visual indicator (green/yellow/red)
- Comparison to recommended thresholds (< 36%)
- Improvement suggestions
- Trend tracking over time

---

## 🎯 Additional Features for User Empowerment

### Peace of Mind Features

#### 1. Debt Stress Score (1-10 scale)
**Factors**:
- DTI ratio (weight: 40%)
- Weighted average interest rate (weight: 30%)
- Payment coverage / emergency fund (weight: 30%)

**Visual**: Green (1-3), Yellow (4-6), Red (7-10)

**Actionable Steps**: Provide specific recommendations to improve score

---

#### 2. Progress Celebrations

**Milestone Badges**:
- 10% paid off
- 25% paid off
- 50% paid off
- 75% paid off
- First debt eliminated
- Debt-free achievement

**Motivational Metrics**:
- "Interest saved this year: $X"
- "Days until debt-free: X"
- "On-time payment streak: X months"

---

#### 3. Financial Breathing Room Calculator

**Display**:
- Monthly income after debt payments
- Safety margin (percentage)
- Comparison to recommended minimums
- Emergency fund vs debt payoff optimizer

---

### Smart Automation

#### 1. Intelligent Payment Reminders
- Customizable alerts (email/push) before due dates
- Streak tracking ("Don't break the chain")
- Autopay verification checklist
- Celebration notifications for milestones

---

#### 2. Refinancing Opportunity Detector
- Monitor interest rate trends
- Alert when refinancing could save > $X
- Calculate refinancing break-even point
- Link to refinancing resources

---

#### 3. Smart Recommendations Engine

**Analyzes**:
- User's debt profile
- Payment history
- Income vs expenses
- Risk tolerance (from metadata)

**Suggests**:
- Optimal payment strategy (avalanche vs snowball)
- Which debt to focus on next
- Quick wins (small debts to eliminate)
- Consolidation opportunities

---

### Educational Features

#### 1. Debt Dictionary
- Interactive tooltips for financial terms
- "What does this mean?" buttons
- Simple, jargon-free explanations
- Examples with real numbers

**Terms to explain**:
- APR vs APY
- Principal vs interest
- Amortization
- Debt consolidation
- Credit utilization
- DTI ratio

---

#### 2. Strategy Education
- Explain avalanche vs snowball methods
- Pros/cons of each approach
- Help users choose based on personality
- Real examples with calculations

---

#### 3. Negotiation Resources
- How to request lower interest rates
- Template letters/scripts for creditors
- Success tips and best practices
- Confidence-building guidance

---

### Visualization Tools

#### 1. Debt Payoff Timeline
- Gantt-style chart showing when each debt will be paid
- Color-coded by debt type
- Adjustable based on extra payments
- Milestone markers (25%, 50%, 75%, 100%)

---

#### 2. Debt Reduction Chart
- Line chart showing total debt over time
- Actual vs projected overlay
- Highlight accelerated payoff periods
- "Interest saved" cumulative line

---

#### 3. Payment Allocation Pie Chart
- Principal vs interest breakdown
- Per-debt distribution
- Monthly/yearly view toggle

---

#### 4. Net Worth Impact View
- Integration with existing dashboard
- Debt as negative asset visualization
- Debt-to-asset ratio
- Equity calculation (for secured debts)

---

## 🔗 Integration with Existing Platform

### Dashboard Integration

**Add to Main Dashboard**:
- "Total Debt" card with trend arrow
- Debt-to-asset ratio widget
- "Debt-free progress" percentage
- Next payment due date alert

**Net Worth Calculation**:
```python
# Update existing net worth calculation
def calculate_net_worth(user_id: UUID) -> Decimal:
    total_assets = get_total_assets(user_id)
    total_debt = get_total_debt(user_id)  # NEW
    return total_assets - total_debt
```

---

### Transaction Linking

**Auto-detection**:
- Monitor transaction feed for debt payments
- Match by amount and creditor name
- Suggest categorization
- Link transaction_id to debt_payment record

**Reconciliation Feature**:
- Show unlinked transactions that might be payments
- One-click linking
- Bulk categorization tools

---

### Target/Goals Connection

**New Goal Types**:
- "Debt-free by [date]" goal
- "Pay off [specific debt]" goal
- "Reduce debt by $X" goal

**Progress Tracking**:
- Unified view in existing Goals page
- Debt payoff progress alongside savings goals
- Visual indicators for on-track vs behind

---

### Asset Correlation

**Secured Debts**:
- Link mortgage to real estate asset
- Link auto loan to car asset
- Calculate equity: `asset_value - debt_balance`

**Smart Recommendations**:
- Compare liquid assets to high-interest debt
- Suggest: "Use $X from savings to pay off 18% credit card?"
- Show impact on net worth and monthly cash flow

---

### Document Management

**Integration with Existing Upload System**:
- Store loan agreements
- Keep payment receipts
- Save correspondence with creditors
- Organize by debt

**Document Types**:
- Original loan contract
- Payment schedules
- Refinancing documents
- Correspondence logs
- Payment receipts

---

## 🏗️ Implementation Architecture

### Backend (FastAPI)

#### File Structure
```
backend/app/
├── api/v1/
│   ├── debts.py           # Main CRUD endpoints
│   ├── debt_payments.py   # Payment management
│   └── debt_strategies.py # Strategy tools
├── models/
│   ├── debt.py
│   ├── debt_payment.py
│   └── debt_strategy.py
├── schemas/
│   ├── debt.py
│   ├── debt_payment.py
│   └── debt_strategy.py
└── services/
    ├── debt_calculator.py  # Avalanche/snowball algorithms
    ├── amortization.py     # Amortization calculations
    └── debt_analytics.py   # DTI, utilization, etc.
```

---

#### API Endpoints

**File**: `backend/app/api/v1/debts.py`

```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

router = APIRouter()

# CRUD Operations
@router.get("/", response_model=List[DebtResponse])
async def get_debts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all user's debts."""
    return db.query(Debt).filter(Debt.user_id == current_user.id).all()

@router.get("/{debt_id}/", response_model=DebtResponse)
async def get_debt(
    debt_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get specific debt details."""
    debt = db.query(Debt).filter(
        Debt.id == debt_id,
        Debt.user_id == current_user.id
    ).first()
    
    if not debt:
        raise HTTPException(status_code=404, detail="Debt not found")
    
    return debt

@router.post("/", response_model=DebtResponse)
async def create_debt(
    debt: DebtCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create new debt."""
    db_debt = Debt(**debt.dict(), user_id=current_user.id)
    db.add(db_debt)
    db.commit()
    db.refresh(db_debt)
    return db_debt

@router.put("/{debt_id}/", response_model=DebtResponse)
async def update_debt(
    debt_id: UUID,
    debt_update: DebtUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update debt."""
    db_debt = db.query(Debt).filter(
        Debt.id == debt_id,
        Debt.user_id == current_user.id
    ).first()
    
    if not db_debt:
        raise HTTPException(status_code=404, detail="Debt not found")
    
    for key, value in debt_update.dict(exclude_unset=True).items():
        setattr(db_debt, key, value)
    
    db.commit()
    db.refresh(db_debt)
    return db_debt

@router.delete("/{debt_id}/")
async def delete_debt(
    debt_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete debt."""
    db_debt = db.query(Debt).filter(
        Debt.id == debt_id,
        Debt.user_id == current_user.id
    ).first()
    
    if not db_debt:
        raise HTTPException(status_code=404, detail="Debt not found")
    
    db.delete(db_debt)
    db.commit()
    return {"message": "Debt deleted successfully"}

# Summary & Analytics
@router.get("/summary", response_model=DebtSummaryResponse)
async def get_debt_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get debt overview statistics."""
    # Use materialized view for fast response
    summary = db.query(UserDebtSummary).filter(
        UserDebtSummary.user_id == current_user.id
    ).first()
    
    return summary or DebtSummaryResponse(user_id=current_user.id)

# Payment Management
@router.get("/{debt_id}/payments/", response_model=List[DebtPaymentResponse])
async def get_debt_payments(
    debt_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get payment history for debt."""
    # Verify debt ownership
    debt = db.query(Debt).filter(
        Debt.id == debt_id,
        Debt.user_id == current_user.id
    ).first()
    
    if not debt:
        raise HTTPException(status_code=404, detail="Debt not found")
    
    payments = db.query(DebtPayment).filter(
        DebtPayment.debt_id == debt_id
    ).order_by(DebtPayment.payment_date.desc()).all()
    
    return payments

@router.post("/{debt_id}/payments/", response_model=DebtPaymentResponse)
async def log_payment(
    debt_id: UUID,
    payment: DebtPaymentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Log a debt payment."""
    # Verify debt ownership
    debt = db.query(Debt).filter(
        Debt.id == debt_id,
        Debt.user_id == current_user.id
    ).first()
    
    if not debt:
        raise HTTPException(status_code=404, detail="Debt not found")
    
    # Create payment record
    db_payment = DebtPayment(
        **payment.dict(),
        debt_id=debt_id,
        user_id=current_user.id
    )
    db.add(db_payment)
    
    # Update debt balance
    debt.current_balance = db_payment.remaining_balance
    debt.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(db_payment)
    
    return db_payment

# Analysis Tools
@router.post("/analyze/avalanche", response_model=PayoffTimelineResponse)
async def analyze_avalanche(
    request: StrategyAnalysisRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Calculate avalanche payoff strategy."""
    from app.services.debt_calculator import calculate_avalanche
    
    debts = db.query(Debt).filter(
        Debt.user_id == current_user.id,
        Debt.is_active == True
    ).all()
    
    timeline = calculate_avalanche(debts, request.extra_payment)
    return timeline

@router.post("/analyze/snowball", response_model=PayoffTimelineResponse)
async def analyze_snowball(
    request: StrategyAnalysisRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Calculate snowball payoff strategy."""
    from app.services.debt_calculator import calculate_snowball
    
    debts = db.query(Debt).filter(
        Debt.user_id == current_user.id,
        Debt.is_active == True
    ).all()
    
    timeline = calculate_snowball(debts, request.extra_payment)
    return timeline

@router.post("/analyze/extra-payment", response_model=ImpactAnalysisResponse)
async def analyze_extra_payment(
    request: ExtraPaymentRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Calculate extra payment impact."""
    from app.services.debt_calculator import calculate_extra_payment_impact
    
    debts = db.query(Debt).filter(
        Debt.user_id == current_user.id,
        Debt.is_active == True
    ).all()
    
    impact = calculate_extra_payment_impact(
        debts,
        request.current_extra,
        request.new_extra
    )
    return impact

@router.post("/analyze/consolidation", response_model=ConsolidationAnalysisResponse)
async def analyze_consolidation(
    request: ConsolidationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Analyze debt consolidation options."""
    from app.services.debt_calculator import calculate_consolidation
    
    debts = db.query(Debt).filter(
        Debt.user_id == current_user.id,
        Debt.is_active == True
    ).all()
    
    analysis = calculate_consolidation(debts, request)
    return analysis
```

**CRITICAL**: Register router in `backend/main.py`:

```python
from app.api.v1 import debts, debt_payments, debt_strategies

app.include_router(debts.router, prefix="/api/v1/debts", tags=["debts"])
app.include_router(debt_payments.router, prefix="/api/v1/debt-payments", tags=["debt-payments"])
app.include_router(debt_strategies.router, prefix="/api/v1/debt-strategies", tags=["debt-strategies"])
```

---

### Frontend (React + Vite)

#### Service Layer

**File**: `frontend/src/services/debts.js`

```javascript
import apiClient from '../lib/api'

/**
 * Debts API Service
 * 
 * CRITICAL: URL formatting must match FastAPI backend routes exactly:
 * - List/detail endpoints use trailing slash: /debts/, /debts/{id}/
 * - Action endpoints use NO trailing slash: /debts/summary
 */
export const debtsService = {
  // CRUD Operations
  async getDebts(config = {}) {
    const response = await apiClient.get('/debts/', config)  // Trailing slash required
    return response.data
  },

  async getDebt(id, config = {}) {
    const response = await apiClient.get(`/debts/${id}/`, config)  // Trailing slash required
    return response.data
  },

  async createDebt(data, config = {}) {
    const response = await apiClient.post('/debts/', data, config)
    return response.data
  },

  async updateDebt(id, data, config = {}) {
    const response = await apiClient.put(`/debts/${id}/`, data, config)
    return response.data
  },

  async deleteDebt(id, config = {}) {
    const response = await apiClient.delete(`/debts/${id}/`, config)
    return response.data
  },

  // Summary & Analytics
  async getSummary(config = {}) {
    const response = await apiClient.get('/debts/summary', config)  // No trailing slash
    return response.data
  },

  // Payment Management
  async getPayments(debtId, config = {}) {
    const response = await apiClient.get(`/debts/${debtId}/payments/`, config)
    return response.data
  },

  async logPayment(debtId, data, config = {}) {
    const response = await apiClient.post(`/debts/${debtId}/payments/`, data, config)
    return response.data
  },

  // Analysis Tools
  async analyzeAvalanche(data, config = {}) {
    const response = await apiClient.post('/debts/analyze/avalanche', data, config)
    return response.data
  },

  async analyzeSnowball(data, config = {}) {
    const response = await apiClient.post('/debts/analyze/snowball', data, config)
    return response.data
  },

  async analyzeExtraPayment(data, config = {}) {
    const response = await apiClient.post('/debts/analyze/extra-payment', data, config)
    return response.data
  },

  async analyzeConsolidation(data, config = {}) {
    const response = await apiClient.post('/debts/analyze/consolidation', data, config)
    return response.data
  }
}
```

---

#### Query Keys

**File**: `frontend/src/lib/queryKeys.js`

```javascript
export const queryKeys = {
  // ... existing keys
  
  debts: {
    all: ['debts'],
    list: () => [...queryKeys.debts.all, 'list'],
    detail: (id) => [...queryKeys.debts.all, 'detail', id],
    summary: () => [...queryKeys.debts.all, 'summary'],
    payments: (debtId) => [...queryKeys.debts.all, 'payments', debtId],
    strategies: {
      all: ['debt-strategies'],
      list: () => [...queryKeys.debts.strategies.all, 'list'],
      detail: (id) => [...queryKeys.debts.strategies.all, 'detail', id],
    }
  }
}
```

---

#### Component Structure

```
frontend/src/
├── pages/
│   └── DebtsPage.jsx                    # Main debt management page
├── components/debts/
│   ├── DebtOverview.jsx                 # Summary dashboard
│   ├── DebtCard.jsx                     # Individual debt card
│   ├── DebtList.jsx                     # List of all debts
│   ├── DebtForm.jsx                     # Create/edit debt form
│   ├── PayoffStrategyComparator.jsx     # Strategy comparison tool
│   ├── ExtraPaymentCalculator.jsx       # Impact simulator
│   ├── DebtChart.jsx                    # Visualization component
│   ├── PaymentHistoryTimeline.jsx       # Payment tracking
│   ├── PaymentForm.jsx                  # Log payment modal
│   ├── ConsolidationAnalyzer.jsx        # Consolidation tool
│   ├── CreditUtilizationTracker.jsx     # For credit cards
│   └── DebtStressScore.jsx              # Stress score indicator
```

---

#### Example Component

**File**: `frontend/src/pages/DebtsPage.jsx`

```javascript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../hooks/useAuth'
import { debtsService } from '../services/debts'
import { queryKeys } from '../lib/queryKeys'
import DebtOverview from '../components/debts/DebtOverview'
import DebtList from '../components/debts/DebtList'
import Loading from '../components/Loading'

export default function DebtsPage() {
  const { user, session } = useAuth()
  const queryClient = useQueryClient()

  // Fetch debts list
  const { data: debts, isLoading: debtsLoading } = useQuery({
    queryKey: queryKeys.debts.list(),
    queryFn: ({ signal }) => debtsService.getDebts({ signal }),
    enabled: !!session,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Fetch summary data
  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: queryKeys.debts.summary(),
    queryFn: ({ signal }) => debtsService.getSummary({ signal }),
    enabled: !!session,
    staleTime: 5 * 60 * 1000,
  })

  // Create debt mutation
  const createDebtMutation = useMutation({
    mutationFn: debtsService.createDebt,
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.debts.all })
    },
  })

  // Delete debt mutation
  const deleteDebtMutation = useMutation({
    mutationFn: debtsService.deleteDebt,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.debts.all })
    },
  })

  if (debtsLoading || summaryLoading) {
    return <Loading pageName="Debts" />
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Debt Management</h1>
      
      {/* Overview Dashboard */}
      <DebtOverview summary={summary} debts={debts} />
      
      {/* Debt List */}
      <DebtList 
        debts={debts} 
        onDelete={(id) => deleteDebtMutation.mutate(id)}
      />
      
      {/* Strategy Tools (collapsible) */}
      {/* Payment History */}
      {/* Analysis Charts */}
    </div>
  )
}
```

---

## 🚀 Scalability Optimization

### Phase-Based Scaling Approach

#### Phase 1: MVP (0-5K users)
- ✅ Basic schema with standard indexes
- ✅ No partitioning needed yet
- ✅ TanStack Query caching on frontend (5 min)
- ✅ Standard SQLAlchemy connection pooling
- ✅ Supabase Free/Pro tier sufficient

**Cost**: ~$50-100/month

---

#### Phase 2: Growth (5K-10K users)
- ✅ Add composite indexes
- ✅ Implement Redis caching layer
- ✅ Optimize expensive queries
- ✅ Add materialized views
- ✅ Monitor slow queries

**Infrastructure Additions**:
- Redis (managed): ~$50/month
- Supabase Pro tier: $25/month

**Total Cost**: ~$150-200/month

---

#### Phase 3: Scale (10K-50K users)
- ✅ Implement table partitioning (debt_payments)
- ✅ Add read replicas
- ✅ Background jobs with Celery
- ✅ CDN for static assets
- ✅ Database query optimization

**Infrastructure**:
- Supabase Team tier: ~$599/month
- Redis: ~$100/month
- Celery workers: ~$100/month

**Total Cost**: ~$800-1,000/month

---

#### Phase 4: Enterprise (50K-100K+ users)
- ✅ Full partitioning strategy
- ✅ Multiple read replicas
- ✅ Advanced caching (multi-layer)
- ✅ Database sharding (if needed)
- ✅ Dedicated infrastructure

**Infrastructure**:
- Supabase Enterprise or dedicated PostgreSQL: ~$2,500/month
- Redis cluster: ~$200/month
- Backend infrastructure: ~$500/month
- CDN: ~$200/month

**Total Cost**: ~$3,000-4,000/month

---

### Critical Performance Optimizations

#### 1. Connection Pooling

```python
# backend/app/core/database.py
from sqlalchemy import create_engine
from sqlalchemy.pool import QueuePool

engine = create_engine(
    DATABASE_URL,
    poolclass=QueuePool,
    pool_size=20,              # Max persistent connections
    max_overflow=10,           # Additional connections under load
    pool_timeout=30,           # Wait 30s for connection
    pool_recycle=3600,         # Recycle connections every hour
    pool_pre_ping=True,        # Verify connection before using
    echo_pool=True             # Log pool events for monitoring
)
```

---

#### 2. Redis Caching

```python
# backend/app/core/cache.py
import redis
from functools import wraps
import json

redis_client = redis.from_url(os.getenv("REDIS_URL"))

def cache_result(ttl=300):
    """Cache decorator for expensive operations."""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Generate cache key
            cache_key = f"{func.__name__}:{hash(str(args) + str(kwargs))}"
            
            # Try to get from cache
            cached = redis_client.get(cache_key)
            if cached:
                return json.loads(cached)
            
            # Calculate result
            result = await func(*args, **kwargs)
            
            # Store in cache
            redis_client.setex(cache_key, ttl, json.dumps(result, default=str))
            
            return result
        return wrapper
    return decorator

# Usage
@router.get("/debts/summary")
@cache_result(ttl=300)  # 5 minutes
async def get_debt_summary(user_id: UUID):
    # Expensive aggregation
    return calculate_summary(user_id)
```

---

#### 3. Query Optimization - Prevent N+1

```python
# ❌ BAD - N+1 query problem
debts = db.query(Debt).filter(Debt.user_id == user_id).all()
for debt in debts:
    latest_payment = db.query(DebtPayment)\
        .filter(DebtPayment.debt_id == debt.id)\
        .order_by(DebtPayment.payment_date.desc())\
        .first()  # Additional query for EACH debt!

# ✅ GOOD - Single optimized query
from sqlalchemy.orm import joinedload

debts_with_payments = db.query(Debt)\
    .outerjoin(
        DebtPayment,
        DebtPayment.id == (
            select(DebtPayment.id)
            .where(DebtPayment.debt_id == Debt.id)
            .order_by(DebtPayment.payment_date.desc())
            .limit(1)
            .correlate(Debt)
            .scalar_subquery()
        )
    )\
    .filter(Debt.user_id == user_id)\
    .all()
```

---

#### 4. Background Jobs

```python
# backend/app/tasks/debt_calculations.py
from celery import Celery

celery = Celery('tasks', broker=os.getenv("REDIS_URL"))

@celery.task
def calculate_complex_timeline(user_id: str, strategy_data: dict):
    """
    Heavy calculation - run in background.
    Can take 10-30 seconds for complex scenarios.
    """
    timeline = perform_complex_amortization(strategy_data)
    
    # Cache result for 1 hour
    redis_client.setex(
        f"timeline:{user_id}:{strategy_data['id']}", 
        3600,
        json.dumps(timeline, default=str)
    )
    
    return timeline

# API endpoint
@router.post("/debts/strategies/calculate")
async def calculate_strategy(
    strategy: StrategyCreate,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user)
):
    # Queue background task
    task = calculate_complex_timeline.delay(
        str(current_user.id),
        strategy.dict()
    )
    
    return {
        "task_id": task.id,
        "status": "calculating",
        "message": "Your payoff timeline is being calculated",
        "poll_url": f"/api/v1/tasks/{task.id}"
    }
```

---

#### 5. Database Monitoring

```sql
-- Enable query statistics
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Find slow queries (run periodically)
SELECT 
    query,
    calls,
    mean_exec_time,
    max_exec_time,
    total_exec_time
FROM pg_stat_statements
WHERE mean_exec_time > 100  -- Queries slower than 100ms
ORDER BY mean_exec_time DESC
LIMIT 20;

-- Check index usage
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan ASC;  -- Low idx_scan = unused index

-- Monitor table sizes
SELECT 
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## 📅 Implementation Roadmap

### Phase 1: MVP (2-3 weeks)

**Week 1: Backend Foundation**
- [ ] Create database migrations for debts table
- [ ] Create Pydantic schemas (DebtBase, DebtCreate, DebtUpdate, DebtResponse)
- [ ] Implement CRUD endpoints in `api/v1/debts.py`
- [ ] Register router in `main.py`
- [ ] Test endpoints via `/docs`

**Week 2: Frontend Foundation**
- [ ] Create `services/debts.js` with named exports
- [ ] Add query keys to `queryKeys.js`
- [ ] Create DebtsPage component
- [ ] Create DebtCard component
- [ ] Create DebtForm (create/edit)
- [ ] Add route in `App.jsx`
- [ ] Add navigation links (Sidebar, MobileDrawer)

**Week 3: Dashboard Integration**
- [ ] Create DebtOverview component (summary)
- [ ] Add "Total Debt" card to main Dashboard
- [ ] Update net worth calculation to include debt
- [ ] Test authentication flow
- [ ] Deploy and verify

**Deliverables**:
- ✅ Users can add/edit/delete debts
- ✅ Basic debt list and detail views
- ✅ Debt included in net worth calculation
- ✅ Mobile-responsive UI

---

### Phase 2: Payment Tracking (1-2 weeks)

**Week 1: Backend**
- [ ] Create debt_payments table migration
- [ ] Create payment CRUD endpoints
- [ ] Auto-update debt balance on payment
- [ ] Link to transactions table

**Week 2: Frontend**
- [ ] Create PaymentForm component
- [ ] Create PaymentHistoryTimeline component
- [ ] Add payment logging to debt detail view
- [ ] Show principal vs interest breakdown

**Deliverables**:
- ✅ Users can log debt payments
- ✅ Payment history visible
- ✅ Debt balance updates automatically
- ✅ Transaction linking works

---

### Phase 3: Analysis Tools (2-3 weeks)

**Week 1: Calculation Algorithms**
- [ ] Implement avalanche calculator
- [ ] Implement snowball calculator
- [ ] Implement extra payment impact calculator
- [ ] Create API endpoints for analysis

**Week 2-3: Frontend Tools**
- [ ] Create PayoffStrategyComparator component
- [ ] Create ExtraPaymentCalculator component
- [ ] Create DebtChart component (visualizations)
- [ ] Add strategy comparison view

**Deliverables**:
- ✅ Avalanche/snowball strategy comparisons
- ✅ Extra payment impact simulator
- ✅ Visual payoff timeline
- ✅ Interactive charts

---

### Phase 4: Advanced Features (2-3 weeks)

**Week 1: Database & Backend**
- [ ] Create debt_strategies table
- [ ] Create debt_alerts table (optional)
- [ ] Implement strategy save/load endpoints
- [ ] Add consolidation analyzer

**Week 2: Goals Integration**
- [ ] Link debt payoff to Target/Goals system
- [ ] Add "Debt-free by date" goal type
- [ ] Show debt progress in Goals page

**Week 3: Polish**
- [ ] Add milestone celebrations
- [ ] Implement credit utilization tracker
- [ ] Add debt stress score
- [ ] Educational tooltips and content

**Deliverables**:
- ✅ Saved payoff strategies
- ✅ Goal integration
- ✅ Milestone tracking
- ✅ Credit utilization monitoring

---

### Phase 5: Intelligence & Automation (1-2 weeks)

- [ ] Implement smart recommendations engine
- [ ] Add payment reminders
- [ ] Refinancing opportunity detector
- [ ] Background jobs for heavy calculations
- [ ] Email/push notifications

**Deliverables**:
- ✅ Automated recommendations
- ✅ Payment reminders
- ✅ Proactive refinancing alerts

---

### Phase 6: Scalability (Ongoing)

**10K Users Milestone**:
- [ ] Add Redis caching
- [ ] Implement composite indexes
- [ ] Add materialized views
- [ ] Monitor query performance

**50K Users Milestone**:
- [ ] Implement table partitioning
- [ ] Add read replicas
- [ ] Celery background jobs
- [ ] Advanced monitoring

**100K+ Users**:
- [ ] Full optimization suite
- [ ] Database sharding (if needed)
- [ ] Multi-region deployment
- [ ] Enterprise infrastructure

---

## 🎨 Design Principles (Aura Philosophy)

### 1. Peace of Mind Over Complexity
- **Do**: Show "You've paid off $10,000 this year" 
- **Don't**: Overwhelm with 20 different metrics
- **Approach**: Progressive disclosure - advanced features behind toggles

### 2. Positive Framing
- **Do**: "£50,000 paid off" with celebration animation
- **Don't**: "£150,000 remaining" with alarming red colors
- **Approach**: Highlight progress, not burden

### 3. Visual Security
- **Do**: Smooth progress bars, calming color schemes
- **Don't**: Jarring charts, anxiety-inducing visuals
- **Approach**: Use existing Magic UI themes for consistency

### 4. Empowerment Through Education
- **Do**: "What does APR mean?" with simple explanation
- **Don't**: Assume financial literacy or use jargon
- **Approach**: Tooltips, glossary, educational content

### 5. Simplicity by Default
- **Do**: Show total debt, next payment, debt-free date
- **Don't**: Show 15 different calculations on first view
- **Approach**: Quick summary + "Show more details" expansion

### 6. Emotional Wellness Focus
- **Do**: Celebrate milestones, track emotional progress
- **Don't**: Make users feel judged or ashamed
- **Approach**: Supportive language, optional stress tracking

---

## 📊 Performance Targets

### Response Time Goals

| Operation | Target | Acceptable | Unacceptable |
|-----------|--------|------------|--------------|
| Load debt list | < 200ms | < 500ms | > 1s |
| Load summary | < 100ms | < 300ms | > 1s |
| Create/update debt | < 300ms | < 500ms | > 1s |
| Strategy calculation | < 1s | < 3s | > 10s |
| Payment history | < 200ms | < 500ms | > 1s |
| Dashboard integration | < 100ms | < 200ms | > 500ms |

### Scalability Targets

| Users | Concurrent | DB Connections | Response Time | Infrastructure |
|-------|-----------|----------------|---------------|----------------|
| 1K | 100 | 5-10 | < 200ms | Basic |
| 10K | 1K | 10-20 | < 300ms | + Redis |
| 50K | 5K | 20-40 | < 500ms | + Replicas |
| 100K+ | 10K+ | 40-60 | < 500ms | Enterprise |

---

## 💰 Cost Projections

### Infrastructure Costs by Scale

**1K-5K Users**:
- Database: Supabase Pro ($25/mo)
- Backend: Railway ($20/mo)
- Frontend: Vercel ($0-20/mo)
- **Total**: ~$50-75/month

**10K-20K Users**:
- Database: Supabase Team ($599/mo)
- Redis: Managed Redis ($50/mo)
- Backend: Railway ($100/mo)
- Frontend: Vercel ($20/mo)
- **Total**: ~$750-850/month

**50K-100K Users**:
- Database: Supabase Enterprise ($2,500/mo) or AWS RDS ($800/mo)
- Redis: Redis cluster ($200/mo)
- Backend: Scalable infrastructure ($500/mo)
- Frontend: Vercel Pro + CDN ($200/mo)
- Monitoring: DataDog/Sentry ($200/mo)
- **Total**: ~$3,000-4,000/month

---

## 🔒 Security Considerations

### Data Encryption
- Encrypt account numbers at rest
- Use environment variables for sensitive config
- HTTPS only for all API calls
- Secure Supabase RLS policies

### Authentication
- All endpoints require authentication via `Depends(get_current_user)`
- User can only access their own debts
- Multi-tenancy enforced at database level

### Input Validation
- Pydantic schemas validate all inputs
- Prevent SQL injection via SQLAlchemy ORM
- Sanitize user-provided text fields

---

## 📝 Testing Strategy

### Unit Tests
- Test calculation algorithms (avalanche, snowball)
- Test amortization schedules
- Test DTI ratio calculations
- Test payment impact logic

### Integration Tests
- Test CRUD operations end-to-end
- Test payment logging and balance updates
- Test strategy calculations with real data
- Test transaction linking

### Performance Tests
- Load test with 10K+ debt records
- Test query performance with partitioned tables
- Test cache hit rates
- Stress test concurrent user scenarios

### User Acceptance Testing
- Test complete user journey
- Verify mobile responsiveness
- Test accessibility (WCAG compliance)
- Gather user feedback on UX

---

## 🚀 Deployment Checklist

### Pre-Launch
- [ ] Database migrations tested in staging
- [ ] All API endpoints tested via `/docs`
- [ ] Frontend components render correctly
- [ ] Authentication flow works
- [ ] Mobile responsive design verified
- [ ] Browser console shows no errors
- [ ] Performance benchmarks met

### Launch Day
- [ ] Run database migrations in production
- [ ] Deploy backend to Railway
- [ ] Deploy frontend to Vercel
- [ ] Verify version number updated
- [ ] Test live deployment end-to-end
- [ ] Monitor error logs
- [ ] Check database connection pool

### Post-Launch
- [ ] Monitor user adoption
- [ ] Track query performance
- [ ] Gather user feedback
- [ ] Iterate on UX improvements
- [ ] Plan for scaling as users grow

---

## 📚 Additional Resources

### Related Documentation
- `AGENTS.md` - AI coding instructions and patterns
- `DATABASE_SCHEMA.md` - Full database schema reference
- `API_DOCUMENTATION.md` - Complete API endpoint docs
- `DEPLOYMENT_GUIDE.md` - Deployment procedures

### External References
- [FastAPI Best Practices](https://fastapi.tiangolo.com/tutorial/)
- [React Query (TanStack Query) Docs](https://tanstack.com/query/latest)
- [PostgreSQL Partitioning](https://www.postgresql.org/docs/current/ddl-partitioning.html)
- [SQLAlchemy ORM Docs](https://docs.sqlalchemy.org/)

---

## 🎯 Success Metrics

### User Engagement
- % of users who add debts
- Average debts per user
- Payment logging frequency
- Strategy tool usage
- Time spent on debt page

### Technical Performance
- API response times
- Cache hit rates
- Database query efficiency
- Error rates
- Uptime percentage

### Business Impact
- User retention improvement
- Feature adoption rate
- Support ticket reduction (better UX)
- Positive user feedback

---

## 📞 Support & Maintenance

### Monitoring
- Set up alerts for slow queries (> 1s)
- Monitor connection pool exhaustion
- Track error rates in Sentry
- Dashboard for key metrics

### Maintenance Tasks
- Weekly: Review slow queries
- Monthly: Analyze usage patterns
- Quarterly: Optimize indexes
- Yearly: Archive old data

### Future Enhancements
- Bank account integration (auto-import debts)
- AI-powered payment recommendations
- Peer comparison (anonymous)
- Gamification of debt payoff
- Social sharing of milestones

---

**Document Version**: 1.0  
**Last Updated**: November 15, 2025  
**Status**: Comprehensive design document for implementation  
**Next Steps**: Begin Phase 1 (MVP) implementation

---

*This feature will transform Aura Asset Manager into a comprehensive financial wellness platform, helping users achieve peace of mind through informed debt management and strategic payoff planning.*
