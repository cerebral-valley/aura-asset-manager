-- Migration: Add liquid_assets and time_horizon to transactions table
-- Created: 2025-09-27
-- Purpose: Add fields to track liquid asset status and time horizon changes in transaction history

ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS liquid_assets TEXT,
ADD COLUMN IF NOT EXISTS time_horizon TEXT;

-- Add comments for documentation
COMMENT ON COLUMN transactions.liquid_assets IS 'Asset liquidity status (YES/NO)';
COMMENT ON COLUMN transactions.time_horizon IS 'Investment time horizon (short_term/medium_term/long_term)';