// Test script to debug authentication flow
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://buuyvrysvjwqqfoyfbdr.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1dXl2cnlzdmp3cXFmb3lmYmRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyMDQ2MjQsImV4cCI6MjA2ODc4MDYyNH0.ZQOOenYbhJkBeFj_yfDXP22qEeRnqUfa8yObHNHl5sg'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testAuth() {
  console.log('Testing Supabase connection...')
  
  // Check session
  const { data: { session }, error } = await supabase.auth.getSession()
  console.log('Session:', session)
  console.log('Session error:', error)
  
  if (session?.access_token) {
    console.log('Access token found:', session.access_token.substring(0, 20) + '...')
    
    // Test API call with token
    try {
      const response = await fetch('https://aura-asset-manager-production.up.railway.app/api/v1/dashboard/summary', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      })
      console.log('API Response status:', response.status)
      const data = await response.text()
      console.log('API Response:', data)
    } catch (error) {
      console.error('API call failed:', error)
    }
  } else {
    console.log('No active session found')
  }
}

testAuth().catch(console.error)
