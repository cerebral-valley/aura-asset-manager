-- Migration: Add Annuity Support
-- Date: 2025-08-04
-- Description: Add payment schedules and annuity-specific fields to support annuity products

-- 1. Create payment_schedules table for recurring payments
CREATE TABLE payment_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    related_id UUID NOT NULL, -- Can reference assets.id or insurance_policies.id
    related_type TEXT NOT NULL CHECK (related_type IN ('asset', 'insurance_policy')),
    schedule_type TEXT NOT NULL CHECK (schedule_type IN ('payment_out', 'payment_in', 'premium')),
    amount NUMERIC(18, 2) NOT NULL,
    frequency TEXT NOT NULL CHECK (frequency IN ('monthly', 'quarterly', 'semi-annually', 'annually')),
    start_date DATE NOT NULL,
    end_date DATE, -- NULL for lifetime annuities
    next_payment_date DATE,
    total_payments_made INTEGER DEFAULT 0,
    total_amount_paid NUMERIC(18, 2) DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies for payment_schedules
ALTER TABLE payment_schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own payment schedules" ON payment_schedules FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own payment schedules" ON payment_schedules FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own payment schedules" ON payment_schedules FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own payment schedules" ON payment_schedules FOR DELETE USING (auth.uid() = user_id);

-- 2. Add annuity-specific fields to assets table
ALTER TABLE assets ADD COLUMN annuity_type TEXT CHECK (annuity_type IN ('fixed', 'variable', 'indexed', 'immediate', 'deferred'));
ALTER TABLE assets ADD COLUMN purchase_amount NUMERIC(18, 2); -- Initial lump sum paid
ALTER TABLE assets ADD COLUMN guaranteed_rate NUMERIC(5, 4); -- For fixed annuities (stored as decimal, e.g., 0.0525 for 5.25%)
ALTER TABLE assets ADD COLUMN accumulation_phase_end DATE; -- When annuity payments start
ALTER TABLE assets ADD COLUMN has_payment_schedule BOOLEAN DEFAULT FALSE;

-- 3. Add annuity fields to insurance_policies table
ALTER TABLE insurance_policies ADD COLUMN has_annuity_benefit BOOLEAN DEFAULT FALSE;
ALTER TABLE insurance_policies ADD COLUMN cash_value NUMERIC(18, 2);
ALTER TABLE insurance_policies ADD COLUMN death_benefit NUMERIC(18, 2);
ALTER TABLE insurance_policies ADD COLUMN has_payment_schedule BOOLEAN DEFAULT FALSE;

-- 4. Create indexes for performance
CREATE INDEX idx_payment_schedules_user_id ON payment_schedules (user_id);
CREATE INDEX idx_payment_schedules_related_id ON payment_schedules (related_id);
CREATE INDEX idx_payment_schedules_next_payment_date ON payment_schedules (next_payment_date) WHERE is_active = TRUE;

-- 5. Add trigger for payment_schedules updated_at
CREATE TRIGGER update_payment_schedules_updated_at
BEFORE UPDATE ON payment_schedules
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- 6. Create function to calculate next payment date
CREATE OR REPLACE FUNCTION calculate_next_payment_date(
    last_payment_date DATE,
    frequency_type TEXT
) RETURNS DATE AS $$
BEGIN
    CASE frequency_type
        WHEN 'monthly' THEN RETURN last_payment_date + INTERVAL '1 month';
        WHEN 'quarterly' THEN RETURN last_payment_date + INTERVAL '3 months';
        WHEN 'semi-annually' THEN RETURN last_payment_date + INTERVAL '6 months';
        WHEN 'annually' THEN RETURN last_payment_date + INTERVAL '1 year';
        ELSE RETURN last_payment_date;
    END CASE;
END;
$$ LANGUAGE plpgsql;

-- 7. Create function to update payment schedule after payment
CREATE OR REPLACE FUNCTION record_payment(
    schedule_id UUID,
    payment_amount NUMERIC(18, 2),
    payment_date DATE DEFAULT CURRENT_DATE
) RETURNS VOID AS $$
DECLARE
    schedule_row payment_schedules%ROWTYPE;
BEGIN
    -- Get the schedule
    SELECT * INTO schedule_row FROM payment_schedules WHERE id = schedule_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Payment schedule not found: %', schedule_id;
    END IF;
    
    -- Update payment tracking
    UPDATE payment_schedules 
    SET 
        total_payments_made = total_payments_made + 1,
        total_amount_paid = total_amount_paid + payment_amount,
        next_payment_date = calculate_next_payment_date(payment_date, frequency),
        updated_at = NOW()
    WHERE id = schedule_id;
    
    -- Check if we've reached the end date
    IF schedule_row.end_date IS NOT NULL AND payment_date >= schedule_row.end_date THEN
        UPDATE payment_schedules 
        SET is_active = FALSE, next_payment_date = NULL
        WHERE id = schedule_id;
    END IF;
END;
$$ LANGUAGE plpgsql;
