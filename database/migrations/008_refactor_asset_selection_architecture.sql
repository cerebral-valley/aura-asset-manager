-- Migration 008: Refactor Asset Selection Architecture
-- Move asset selection state from user_asset_selections table to assets table columns

-- Add new columns to assets table
ALTER TABLE assets 
ADD COLUMN IF NOT EXISTS liquid_assets BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_selected BOOLEAN DEFAULT false;

-- Create indexes for the new columns to optimize queries
CREATE INDEX IF NOT EXISTS idx_assets_liquid_assets ON assets(liquid_assets);
CREATE INDEX IF NOT EXISTS idx_assets_is_selected ON assets(is_selected);
CREATE INDEX IF NOT EXISTS idx_assets_user_id_liquid ON assets(user_id, liquid_assets);
CREATE INDEX IF NOT EXISTS idx_assets_user_id_selected ON assets(user_id, is_selected);

-- Migrate data from user_asset_selections to assets table
-- Step 1: Mark all assets that have entries in user_asset_selections as liquid_assets=true
UPDATE assets 
SET liquid_assets = true
WHERE id IN (
    SELECT DISTINCT asset_id 
    FROM user_asset_selections
);

-- Step 2: Set is_selected based on user_asset_selections.is_selected
UPDATE assets 
SET is_selected = uas.is_selected
FROM user_asset_selections uas
WHERE assets.id = uas.asset_id;

-- For assets of types commonly considered liquid, set liquid_assets=true if not already set
-- This ensures assets that should be liquid but weren't in user_asset_selections are marked
UPDATE assets 
SET liquid_assets = true
WHERE asset_type IN ('crypto', 'stock', 'etf', 'bond', 'cash', 'savings', 'checking')
  AND liquid_assets = false;

-- Add comments for documentation
COMMENT ON COLUMN assets.liquid_assets IS 'Boolean flag indicating if this asset can be used in liquid asset calculations for targets';
COMMENT ON COLUMN assets.is_selected IS 'Boolean flag indicating if this asset is currently selected for target calculations';

-- Create a backup table for user_asset_selections before we eventually drop it
-- This allows for rollback if needed
CREATE TABLE IF NOT EXISTS user_asset_selections_backup AS 
SELECT * FROM user_asset_selections;

-- Add a comment about the backup
COMMENT ON TABLE user_asset_selections_backup IS 'Backup of user_asset_selections table before migration to asset-based selection model. Can be used for rollback if needed.';