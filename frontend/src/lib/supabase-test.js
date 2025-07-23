import { createClient } from '@supabase/supabase-js'

// Test Supabase connection
const supabaseUrl = 'https://buuyvrysvjwqqfoyfbdr.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1dXl2cnlzdmp3cXFmb3lmYmRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyMDQ2MjQsImV4cCI6MjA2ODc4MDYyNH0.ZQOOenYbhJkBeFj_yfDXP22qEeRnqUfa8yObHNHl5sg'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

console.log('Supabase client created:', supabase)
