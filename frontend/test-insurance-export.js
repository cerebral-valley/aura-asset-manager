// Test script for insurance export functionality
import { exportInsuranceToPDF } from './src/utils/pdfExportTerminalInsurance.js';
import { exportInsuranceToExcel } from './src/utils/excelExportInsurance.js';
import { 
  aggregateInsuranceByType, 
  calculateInsuranceTotals, 
  createDetailedInsuranceBreakdown,
  calculateProtectionMetrics,
  prepareInsuranceChartData
} from './src/utils/insuranceAggregation.js';

// Sample insurance data for testing
const samplePolicies = [
  {
    id: 1,
    policy_name: "John's Health Insurance",
    policy_type: "Health",
    provider: "Blue Cross Blue Shield",
    coverage_amount: 100000,
    premium_amount: 500,
    premium_frequency: "monthly",
    start_date: "2024-01-01",
    renewal_date: "2024-12-31",
    status: "active"
  },
  {
    id: 2,
    policy_name: "Life Insurance Policy",
    policy_type: "Life",
    provider: "MetLife", 
    coverage_amount: 500000,
    premium_amount: 2000,
    premium_frequency: "annually",
    start_date: "2023-06-15",
    renewal_date: "2024-06-15",
    status: "active"
  },
  {
    id: 3,
    policy_name: "Auto Insurance",
    policy_type: "Auto",
    provider: "State Farm",
    coverage_amount: 50000,
    premium_amount: 150,
    premium_frequency: "monthly",
    start_date: "2024-03-01",
    renewal_date: "2025-03-01",
    status: "active"
  },
  {
    id: 4,
    policy_name: "Home Insurance",
    policy_type: "Home",
    provider: "Allstate",
    coverage_amount: 300000,
    premium_amount: 1200,
    premium_frequency: "annually",
    start_date: "2024-01-15",
    renewal_date: "2025-01-15",
    status: "active"
  }
];

// Test aggregation functions
console.log('Testing Insurance Aggregation...');

const aggregateByType = aggregateInsuranceByType(samplePolicies);
console.log('Aggregate by Type:', aggregateByType);

const totals = calculateInsuranceTotals(samplePolicies);
console.log('Totals:', totals);

const detailedBreakdown = createDetailedInsuranceBreakdown(aggregateByType);
console.log('Detailed Breakdown:', detailedBreakdown);

const protectionMetrics = calculateProtectionMetrics(samplePolicies);
console.log('Protection Metrics:', protectionMetrics);

const { chartData, pieData } = prepareInsuranceChartData(aggregateByType);
console.log('Chart Data:', chartData);
console.log('Pie Data:', pieData);

// Format functions for testing
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount);
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Test export data structure
const exportData = {
  userName: "Test User",
  policies: samplePolicies,
  aggregateByType,
  totals,
  detailedInsuranceBreakdown: detailedBreakdown,
  protectionMetrics,
  currency: "USD",
  formatCurrency,
  formatDate,
  pieData,
  chartData
};

console.log('Export Data Structure Ready:', Object.keys(exportData));
console.log('Test completed successfully!');
