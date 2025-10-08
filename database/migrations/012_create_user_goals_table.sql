-- Migration 012: Create user_goals table for Goals feature
-- Date: 2025-10-08
-- Description: Creates the user_goals table to support the Goals feature functionality

-- Create user_goals table
CREATE TABLE user_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    goal_type TEXT NOT NULL, -- 'net_worth', 'asset', 'expense', 'income'
    title TEXT NOT NULL,
    target_amount NUMERIC(18, 2) NOT NULL,
    target_date DATE,
    allocate_amount NUMERIC(18, 2) DEFAULT 0,
    goal_completed BOOLEAN DEFAULT FALSE,
    completed_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX idx_user_goals_user_id ON user_goals(user_id);
CREATE INDEX idx_user_goals_goal_type ON user_goals(goal_type);
CREATE INDEX idx_user_goals_completed ON user_goals(goal_completed);
CREATE INDEX idx_user_goals_created_at ON user_goals(created_at);

-- Enable Row Level Security (RLS) for Supabase
ALTER TABLE user_goals ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_goals table
CREATE POLICY "Users can view their own goals" ON user_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own goals" ON user_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own goals" ON user_goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own goals" ON user_goals FOR DELETE USING (auth.uid() = user_id);

-- Add comments for documentation
COMMENT ON TABLE user_goals IS 'Stores user financial goals with progress tracking';
COMMENT ON COLUMN user_goals.goal_type IS 'Type of goal: net_worth, asset, expense, income';
COMMENT ON COLUMN user_goals.target_amount IS 'Target amount for the goal in base currency';
COMMENT ON COLUMN user_goals.allocate_amount IS 'Amount allocated towards this goal';
COMMENT ON COLUMN user_goals.goal_completed IS 'Whether the goal has been marked as completed';
COMMENT ON COLUMN user_goals.completed_date IS 'Date when the goal was marked as completed';