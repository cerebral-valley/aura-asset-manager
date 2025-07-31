// Debug script to test insurance API
const API_BASE_URL = 'https://aura-asset-manager-production.up.railway.app/api/v1';

// Test the POST request with sample data
const testData = {
  policy_name: "Test Policy",
  policy_type: "life", 
  provider: "Test Provider",
  policy_number: "TEST123",
  coverage_amount: 100000,
  premium_amount: 500,
  premium_frequency: "monthly",
  start_date: "2024-01-01",
  end_date: "2025-01-01", 
  renewal_date: "2025-01-01",
  notes: "Test notes",
  status: "active"
};

async function testInsuranceAPI() {
  try {
    console.log('Testing insurance API with data:', JSON.stringify(testData, null, 2));
    
    const response = await fetch(`${API_BASE_URL}/insurance/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token' // This will fail auth but we can see the validation error
      },
      body: JSON.stringify(testData)
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('Response body:', responseText);
    
    if (response.headers.get('content-type')?.includes('application/json')) {
      const responseData = JSON.parse(responseText);
      console.log('Parsed response:', JSON.stringify(responseData, null, 2));
    }
    
  } catch (error) {
    console.error('Error testing API:', error);
  }
}

testInsuranceAPI();
