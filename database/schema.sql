-- Aura Asset Manager - PostgreSQL Database Schema

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. users Table
-- Stores user authentication and profile information.
-- This table is typically managed by Supabase Auth, but included for clarity and theme storage.
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    theme TEXT DEFAULT 'sanctuary_builder'
);

-- Optional: Add RLS policy for users table if needed, though Supabase Auth handles most of this.

-- 2. assets Table
-- Stores information about each individual asset owned by a user.
CREATE TABLE assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    asset_type TEXT NOT NULL, -- e.g., 'real_estate', 'stock', 'gold', 'cash', 'other'
    description TEXT,
    purchase_date DATE,
    initial_value NUMERIC(18, 2),
    current_value NUMERIC(18, 2),
    quantity NUMERIC(18, 4),
    unit_of_measure TEXT, -- e.g., 'shares', 'oz', 'sqft', 'units'
    metadata JSONB, -- Flexible JSON field for asset-specific characteristics
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policy for assets table
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own assets" ON assets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own assets" ON assets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own assets" ON assets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own assets" ON assets FOR DELETE USING (auth.uid() = user_id);

-- 3. transactions Table
-- Records all financial events related to assets.
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    transaction_type TEXT NOT NULL, -- e.g., 'purchase', 'sale', 'value_update', 'transfer', 'adjustment'
    transaction_date TIMESTAMPTZ NOT NULL,
    amount NUMERIC(18, 2), -- Monetary amount involved
    quantity_change NUMERIC(18, 4), -- Change in quantity (positive for purchase, negative for sale)
    notes TEXT,
    metadata JSONB, -- Flexible JSON field for transaction-specific details
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policy for transactions table
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own transactions" ON transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own transactions" ON transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own transactions" ON transactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own transactions" ON transactions FOR DELETE USING (auth.uid() = user_id);

-- 4. insurance_policies Table
-- Stores details about each insurance policy a user holds.
CREATE TABLE insurance_policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    policy_name TEXT NOT NULL,
    policy_type TEXT NOT NULL, -- e.g., 'life', 'health', 'auto', 'home', 'loan'
    provider TEXT,
    policy_number TEXT,
    coverage_amount NUMERIC(18, 2) NOT NULL,
    premium_amount NUMERIC(18, 2),
    premium_frequency TEXT, -- e.g., 'monthly', 'annually'
    start_date DATE,
    end_date DATE,
    renewal_date DATE,
    notes TEXT,
    metadata JSONB, -- Flexible JSON field for policy-specific details
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policy for insurance_policies table
ALTER TABLE insurance_policies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own insurance policies" ON insurance_policies FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own insurance policies" ON insurance_policies FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own insurance policies" ON insurance_policies FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own insurance policies" ON insurance_policies FOR DELETE USING (auth.uid() = user_id);

-- Optional: Indexes for performance
CREATE INDEX idx_assets_user_id ON assets (user_id);
CREATE INDEX idx_transactions_user_id ON transactions (user_id);
CREATE INDEX idx_transactions_asset_id ON transactions (asset_id);
CREATE INDEX idx_insurance_policies_user_id ON insurance_policies (user_id);

-- Optional: Triggers for updated_at column
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_assets_updated_at
BEFORE UPDATE ON assets
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_insurance_policies_updated_at
BEFORE UPDATE ON insurance_policies
FOR EACH ROW EXECUTE FUNCTION update_timestamp();


