-- Complete Target System Implementation
-- Migration 007: Add missing tables and columns for full Target page functionality

-- Add missing columns to targets table
ALTER TABLE targets 
ADD COLUMN IF NOT EXISTS target_type VARCHAR(50) DEFAULT 'custom',
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active';

-- Create comment for target_type values
COMMENT ON COLUMN targets.target_type IS 'Values: net_worth, custom';
COMMENT ON COLUMN targets.status IS 'Values: active, completed, paused, archived';

-- Create user_asset_selections table for persistent asset selection
CREATE TABLE IF NOT EXISTS user_asset_selections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    is_selected BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, asset_id)
);

-- Create target_allocations table for fund allocation management
CREATE TABLE IF NOT EXISTS target_allocations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    target_id UUID NOT NULL REFERENCES targets(id) ON DELETE CASCADE,
    asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    allocation_amount DECIMAL(18,2) NOT NULL,
    allocation_percentage DECIMAL(5,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(target_id, asset_id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_asset_selections_user_id ON user_asset_selections(user_id);
CREATE INDEX IF NOT EXISTS idx_user_asset_selections_asset_id ON user_asset_selections(asset_id);
CREATE INDEX IF NOT EXISTS idx_target_allocations_target_id ON target_allocations(target_id);
CREATE INDEX IF NOT EXISTS idx_target_allocations_asset_id ON target_allocations(asset_id);
CREATE INDEX IF NOT EXISTS idx_targets_user_id_status ON targets(user_id, status);
CREATE INDEX IF NOT EXISTS idx_targets_target_type ON targets(target_type);

-- Update existing targets to have proper target_type
UPDATE targets 
SET target_type = 'net_worth' 
WHERE name ILIKE '%net worth%' OR name ILIKE '%financial independence%';

UPDATE targets 
SET target_type = 'custom' 
WHERE target_type IS NULL OR target_type = 'net_worth' AND name NOT ILIKE '%net worth%' AND name NOT ILIKE '%financial independence%';

-- Set default status for existing targets
UPDATE targets 
SET status = 'active' 
WHERE status IS NULL;