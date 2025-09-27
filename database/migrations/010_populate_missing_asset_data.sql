-- Data Population Script: Fill Missing Liquid Status and Time Horizon
-- Purpose: Populate empty liquid_assets and time_horizon fields with realistic data

-- Update liquid_assets based on asset type characteristics
-- Cash, bank accounts, and some stocks are typically liquid
UPDATE assets 
SET liquid_assets = CASE 
    WHEN asset_type LIKE '%Cash%' OR asset_type LIKE '%Bank%' THEN true
    WHEN asset_type LIKE '%Stocks%' OR asset_type LIKE '%ETF%' THEN true
    WHEN asset_type LIKE '%Cryptocurrency%' THEN true 
    WHEN asset_type LIKE '%Bonds%' AND asset_type LIKE '%Treasury%' THEN true
    WHEN asset_type LIKE '%Real Estate%' OR asset_type LIKE '%Property%' THEN false
    WHEN asset_type LIKE '%Gold%' OR asset_type LIKE '%Physical%' THEN false
    WHEN asset_type LIKE '%Mutual%' THEN true
    -- For mixed cases, use current_value as indicator (higher value = less liquid)
    WHEN current_value < 50000 THEN true
    ELSE false
END
WHERE liquid_assets IS NULL;

-- Update time_horizon based on asset type and purpose
UPDATE assets 
SET time_horizon = CASE 
    WHEN asset_type LIKE '%Cash%' OR asset_type LIKE '%Bank%' THEN 'short_term'
    WHEN asset_type LIKE '%Cryptocurrency%' THEN 'short_term'
    WHEN asset_type LIKE '%Stocks%' AND current_value < 25000 THEN 'medium_term'
    WHEN asset_type LIKE '%Stocks%' AND current_value >= 25000 THEN 'long_term'
    WHEN asset_type LIKE '%ETF%' OR asset_type LIKE '%Mutual%' THEN 'long_term'
    WHEN asset_type LIKE '%Real Estate%' OR asset_type LIKE '%Property%' THEN 'long_term'
    WHEN asset_type LIKE '%Bonds%' THEN 'medium_term'
    WHEN asset_type LIKE '%Gold%' OR asset_type LIKE '%Physical%' THEN 'long_term'
    -- Default based on value ranges
    WHEN current_value < 10000 THEN 'short_term'
    WHEN current_value BETWEEN 10000 AND 100000 THEN 'medium_term' 
    ELSE 'long_term'
END
WHERE time_horizon IS NULL OR time_horizon = '';

-- Log the updates made
SELECT 
    'Assets updated with liquid status' as operation,
    COUNT(*) as count
FROM assets 
WHERE liquid_assets IS NOT NULL

UNION ALL

SELECT 
    'Assets updated with time horizon' as operation,
    COUNT(*) as count  
FROM assets
WHERE time_horizon IS NOT NULL AND time_horizon != '';