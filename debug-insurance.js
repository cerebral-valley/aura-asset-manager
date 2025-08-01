// Debug script to test insurance API
const API_BASE_URL = 'https://aura-asset-manager-production.up.railway.app/api/v1';

// Test data that simulates what the frontend might send (including empty strings)
const testDataWithEmptyStrings = {
  policy_name: "Test Policy",
  policy_type: "life", 
  provider: "", // Empty string
  policy_number: "",  // Empty string
  coverage_amount: 100000,
  premium_amount: "",  // Empty string - this was likely causing the issue
  premium_frequency: "monthly",
  start_date: "",  // Empty string
  end_date: "",  // Empty string
  renewal_date: "",  // Empty string
  notes: "",  // Empty string
  status: "active"
};

// Test data with valid values
const testDataValid = {
  policy_name: "Test Policy Valid",
  policy_type: "health", 
  provider: "Test Provider",
  policy_number: "TEST123",
  coverage_amount: 50000,
  premium_amount: 250.50,
  premium_frequency: "monthly",
  start_date: "2024-01-01",
  end_date: "2025-01-01", 
  renewal_date: "2024-12-01",
  notes: "Test notes for valid policy",
  status: "active"
};

async function testInsuranceAPI() {
  try {
    console.log('=== Testing with empty strings (previously failing) ===');
    console.log('Data:', JSON.stringify(testDataWithEmptyStrings, null, 2));
    
    const response1 = await fetch(`${API_BASE_URL}/insurance/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer invalid-token' // This will fail auth but let us see validation
      },
      body: JSON.stringify(testDataWithEmptyStrings)
    });

    console.log('Response status (empty strings):', response1.status);
    const responseText1 = await response1.text();
    console.log('Response body (empty strings):', responseText1);
    console.log();

    console.log('=== Testing with valid data ===');
    console.log('Data:', JSON.stringify(testDataValid, null, 2));
    
    const response2 = await fetch(`${API_BASE_URL}/insurance/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer invalid-token' // This will fail auth but let us see validation
      },
      body: JSON.stringify(testDataValid)
    });

    console.log('Response status (valid data):', response2.status);
    const responseText2 = await response2.text();
    console.log('Response body (valid data):', responseText2);
    
  } catch (error) {
    console.error('Error testing API:', error);
  }
}

testInsuranceAPI();
