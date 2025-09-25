-- Supabase Boolean Editing Workaround
-- Use these SQL queries in the Supabase SQL Editor to update boolean values
-- This bypasses the table editor's case-sensitivity bug

-- Method 1: Use capital TRUE/FALSE (works in both table editor and SQL)
UPDATE assets SET is_selected = TRUE WHERE id = 'your-uuid-here';
UPDATE assets SET is_selected = FALSE WHERE id = 'your-uuid-here';

-- Method 2: Use PostgreSQL's case-insensitive string input (works in SQL Editor)
UPDATE assets SET is_selected = 'true' WHERE id = 'your-uuid-here';
UPDATE assets SET is_selected = 'false' WHERE id = 'your-uuid-here';

-- Method 3: Update multiple assets at once
UPDATE assets SET is_selected = TRUE WHERE user_id = 'your-user-id' AND asset_type IN ('stocks', 'crypto');
UPDATE assets SET is_selected = FALSE WHERE user_id = 'your-user-id' AND asset_type = 'bonds';

-- Method 4: Toggle selection based on current value
UPDATE assets SET is_selected = NOT is_selected WHERE id = 'your-uuid-here';

-- Method 5: Reset all selections for a user
UPDATE assets SET is_selected = FALSE WHERE user_id = 'your-user-id';
