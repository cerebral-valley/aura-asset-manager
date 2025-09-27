-- Migration 010: Add Asset Purpose and New Transaction Fields
-- Purpose: Add asset_purpose to assets table and new transaction type support

-- Add asset_purpose to assets table
ALTER TABLE assets 
ADD COLUMN asset_purpose TEXT COMMENT 'Investment purpose category: Hyper Growth, Growth, Financial Security, Emergency Fund, Children''s Education, Retirement Fund';

-- Add new transaction fields to transactions table
ALTER TABLE transactions 
ADD COLUMN asset_purpose TEXT COMMENT 'Asset purpose when creating/updating assets',
ADD COLUMN update_quantity_units TEXT COMMENT 'Updated quantity and units information', 
ADD COLUMN update_description_properties TEXT COMMENT 'Updated description, notes, and custom properties information';

-- Update existing assets with default asset_purpose based on asset type and characteristics
-- Assign purposes based on asset types to provide meaningful defaults
UPDATE assets 
SET asset_purpose = CASE 
    WHEN asset_type LIKE '%Cash%' OR asset_type LIKE '%Bank%' THEN 'Emergency Fund'
    WHEN asset_type LIKE '%Bonds%' OR asset_type LIKE '%Treasury%' THEN 'Financial Security' 
    WHEN asset_type LIKE '%Real Estate%' OR asset_type LIKE '%Property%' THEN 'Retirement Fund'
    WHEN asset_type LIKE '%Stocks%' OR asset_type LIKE '%ETF%' OR asset_type LIKE '%Mutual%' THEN 'Growth'
    WHEN asset_type LIKE '%Cryptocurrency%' OR asset_type LIKE '%Bitcoin%' THEN 'Hyper Growth'
    WHEN asset_type LIKE '%Gold%' OR asset_type LIKE '%Physical%' THEN 'Financial Security'
    ELSE 'Growth'
END
WHERE asset_purpose IS NULL;

-- Add comment to document the migration
COMMENT ON TABLE assets IS 'Assets table with investment purpose tracking - Migration 010 applied';
COMMENT ON TABLE transactions IS 'Transactions table with extended update capabilities - Migration 010 applied';