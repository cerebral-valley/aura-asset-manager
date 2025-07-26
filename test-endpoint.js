// Simple test to check if the transaction-create endpoint is accessible
// Run this in browser console to test

const testEndpoint = async () => {
  try {
    console.log('Testing transaction-create endpoint...')
    
    const baseUrl = 'https://aura-asset-manager-production.up.railway.app'
    const testUrl = `${baseUrl}/api/v1/transaction-create/`
    
    console.log('Testing URL:', testUrl)
    
    // First test: Simple GET request to see if endpoint exists
    const response = await fetch(testUrl, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://aura-asset-manager.vercel.app'
      }
    })
    
    console.log('OPTIONS Response Status:', response.status)
    console.log('OPTIONS Response Headers:', [...response.headers.entries()])
    
    if (response.ok) {
      console.log('✅ Endpoint is accessible!')
    } else {
      console.log('❌ Endpoint not accessible:', response.status, response.statusText)
    }
    
  } catch (error) {
    console.error('❌ Connection Error:', error)
    if (error.message.includes('ERR_CONNECTION_RESET')) {
      console.log('🔍 This suggests the endpoint does not exist or backend is not running')
    }
  }
}

// Run the test
testEndpoint()
