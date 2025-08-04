-- Fix payment_schedules table metadata column name conflict
-- This resolves the SQLAlchemy reserved keyword issue

-- Step 1: Drop existing payment_schedules table if it exists
DROP TABLE IF EXISTS payment_schedules CASCADE;

-- Step 2: Recreate payment_schedules table with correct column name
CREATE TABLE payment_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    related_id UUID NOT NULL,
    related_type VARCHAR(20) NOT NULL CHECK (related_type IN ('asset', 'insurance_policy')),
    schedule_type VARCHAR(20) NOT NULL CHECK (schedule_type IN ('payment_out', 'payment_in', 'premium')),
    amount DECIMAL(18,2) NOT NULL,
    frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('monthly', 'quarterly', 'semi-annually', 'annually')),
    start_date DATE NOT NULL,
    end_date DATE,
    next_payment_date DATE,
    total_payments_made INTEGER DEFAULT 0,
    total_amount_paid DECIMAL(18,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    schedule_metadata JSONB DEFAULT '{}',  -- Changed from 'metadata' to 'schedule_metadata'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 3: Add indexes for performance
CREATE INDEX idx_payment_schedules_user_id ON payment_schedules(user_id);
CREATE INDEX idx_payment_schedules_related ON payment_schedules(related_id, related_type);
CREATE INDEX idx_payment_schedules_next_payment ON payment_schedules(next_payment_date) WHERE is_active = TRUE;

-- Step 4: Enable Row Level Security
ALTER TABLE payment_schedules ENABLE ROW LEVEL SECURITY;

-- Step 5: Create RLS policy
CREATE POLICY "Users can only access their own payment schedules" ON payment_schedules
    FOR ALL USING (auth.uid() = user_id);

-- Step 6: Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_payment_schedules_updated_at 
    BEFORE UPDATE ON payment_schedules 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Verification query
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'payment_schedules' 
ORDER BY ordinal_position;
