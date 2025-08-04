-- Comprehensive Annuities Database Schema
-- This creates a dedicated table for all types of annuities with full data model

-- Step 1: Create the main annuities table
CREATE TABLE annuities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    
    -- Basic Information
    contract_number VARCHAR(100),
    product_name VARCHAR(255) NOT NULL,
    provider_company VARCHAR(255) NOT NULL,
    
    -- Annuity Classification
    annuity_type VARCHAR(50) NOT NULL CHECK (annuity_type IN (
        'immediate_fixed', 'immediate_variable', 'immediate_indexed',
        'deferred_fixed', 'deferred_variable', 'deferred_indexed',
        'structured', 'multi_year_guaranteed', 'single_premium_immediate',
        'qualified_longevity', 'charitable_gift'
    )),
    
    -- Purchase Details
    purchase_date DATE NOT NULL,
    initial_premium DECIMAL(18,2) NOT NULL,
    additional_premiums_allowed BOOLEAN DEFAULT FALSE,
    funding_type VARCHAR(50) CHECK (funding_type IN ('lump_sum', 'flexible_premium', 'single_premium')),
    
    -- Financial Terms
    guaranteed_rate DECIMAL(5,4), -- e.g., 0.0325 for 3.25%
    current_rate DECIMAL(5,4),
    participation_rate DECIMAL(5,4), -- for indexed annuities
    cap_rate DECIMAL(5,4), -- maximum return for indexed
    floor_rate DECIMAL(5,4), -- minimum return guarantee
    
    -- Accumulation Phase
    accumulation_value DECIMAL(18,2) DEFAULT 0,
    cash_surrender_value DECIMAL(18,2) DEFAULT 0,
    surrender_charge_rate DECIMAL(5,4),
    surrender_period_years INTEGER,
    free_withdrawal_percentage DECIMAL(5,2) DEFAULT 10.00, -- typically 10%
    
    -- Payout Phase
    annuitization_date DATE, -- when payments begin
    payout_option VARCHAR(50) CHECK (payout_option IN (
        'life_only', 'life_with_period_certain', 'joint_and_survivor',
        'fixed_period', 'fixed_amount', 'systematic_withdrawal'
    )),
    payout_frequency VARCHAR(20) CHECK (payout_frequency IN ('monthly', 'quarterly', 'semi-annually', 'annually')),
    payout_amount DECIMAL(18,2),
    guaranteed_period_years INTEGER, -- for period certain options
    
    -- Beneficiary Information
    primary_beneficiary VARCHAR(255),
    primary_beneficiary_percentage DECIMAL(5,2) DEFAULT 100.00,
    contingent_beneficiary VARCHAR(255),
    death_benefit_type VARCHAR(50) CHECK (death_benefit_type IN (
        'return_of_premium', 'account_value', 'guaranteed_minimum', 'enhanced'
    )),
    death_benefit_amount DECIMAL(18,2),
    
    -- Riders and Features
    living_benefit_rider BOOLEAN DEFAULT FALSE,
    long_term_care_rider BOOLEAN DEFAULT FALSE,
    income_rider BOOLEAN DEFAULT FALSE,
    enhanced_death_benefit BOOLEAN DEFAULT FALSE,
    cost_of_living_adjustment BOOLEAN DEFAULT FALSE,
    rider_fees_annual DECIMAL(18,2) DEFAULT 0,
    
    -- Tax Information
    tax_qualification VARCHAR(50) CHECK (tax_qualification IN ('qualified', 'non_qualified', 'roth', 'traditional_ira')),
    tax_deferral_status BOOLEAN DEFAULT TRUE,
    
    -- Performance Tracking (for variable/indexed)
    underlying_index VARCHAR(100), -- e.g., 'S&P 500', 'NASDAQ-100'
    performance_tracking JSONB DEFAULT '{}', -- historical performance data
    
    -- Contract Status
    contract_status VARCHAR(50) DEFAULT 'active' CHECK (contract_status IN (
        'active', 'annuitized', 'surrendered', 'death_claim', 'matured'
    )),
    
    -- Additional Details
    notes TEXT,
    documents JSONB DEFAULT '{}', -- store document references
    
    -- Audit Fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 2: Create indexes for performance
CREATE INDEX idx_annuities_user_id ON annuities(user_id);
CREATE INDEX idx_annuities_type ON annuities(annuity_type);
CREATE INDEX idx_annuities_status ON annuities(contract_status);
CREATE INDEX idx_annuities_purchase_date ON annuities(purchase_date);
CREATE INDEX idx_annuities_annuitization_date ON annuities(annuitization_date);
CREATE INDEX idx_annuities_provider ON annuities(provider_company);

-- Step 3: Create annuity contributions table (for flexible premium annuities)
CREATE TABLE annuity_contributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    annuity_id UUID NOT NULL REFERENCES annuities(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    contribution_date DATE NOT NULL,
    amount DECIMAL(18,2) NOT NULL,
    contribution_type VARCHAR(50) CHECK (contribution_type IN ('regular', 'additional', 'rollover', 'transfer')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_annuity_contributions_annuity_id ON annuity_contributions(annuity_id);
CREATE INDEX idx_annuity_contributions_user_id ON annuity_contributions(user_id);
CREATE INDEX idx_annuity_contributions_date ON annuity_contributions(contribution_date);

-- Step 4: Create annuity valuations table (for tracking value over time)
CREATE TABLE annuity_valuations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    annuity_id UUID NOT NULL REFERENCES annuities(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    valuation_date DATE NOT NULL,
    accumulation_value DECIMAL(18,2) NOT NULL,
    cash_surrender_value DECIMAL(18,2) NOT NULL,
    guaranteed_value DECIMAL(18,2),
    market_value DECIMAL(18,2), -- for variable annuities
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(annuity_id, valuation_date)
);

CREATE INDEX idx_annuity_valuations_annuity_id ON annuity_valuations(annuity_id);
CREATE INDEX idx_annuity_valuations_date ON annuity_valuations(valuation_date);

-- Step 5: Enable Row Level Security
ALTER TABLE annuities ENABLE ROW LEVEL SECURITY;
ALTER TABLE annuity_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE annuity_valuations ENABLE ROW LEVEL SECURITY;

-- Step 6: Create RLS policies
CREATE POLICY "Users can only access their own annuities" ON annuities
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own annuity contributions" ON annuity_contributions
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own annuity valuations" ON annuity_valuations
    FOR ALL USING (auth.uid() = user_id);

-- Step 7: Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_annuities_updated_at 
    BEFORE UPDATE ON annuities 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Step 8: Create helper functions
CREATE OR REPLACE FUNCTION calculate_annuity_current_value(annuity_uuid UUID)
RETURNS DECIMAL(18,2) AS $$
DECLARE
    result DECIMAL(18,2);
BEGIN
    -- Get the most recent accumulation value or initial premium
    SELECT COALESCE(
        (SELECT accumulation_value FROM annuity_valuations 
         WHERE annuity_id = annuity_uuid 
         ORDER BY valuation_date DESC LIMIT 1),
        (SELECT initial_premium FROM annuities WHERE id = annuity_uuid)
    ) INTO result;
    
    RETURN COALESCE(result, 0);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_annuity_total_contributions(annuity_uuid UUID)
RETURNS DECIMAL(18,2) AS $$
DECLARE
    result DECIMAL(18,2);
BEGIN
    -- Sum initial premium plus all additional contributions
    SELECT 
        (SELECT initial_premium FROM annuities WHERE id = annuity_uuid) +
        COALESCE((SELECT SUM(amount) FROM annuity_contributions WHERE annuity_id = annuity_uuid), 0)
    INTO result;
    
    RETURN COALESCE(result, 0);
END;
$$ LANGUAGE plpgsql;

-- Verification query
SELECT 'Annuities schema created successfully' as status;
