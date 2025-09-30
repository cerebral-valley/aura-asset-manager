/**
 * Simple test for PDF export functionality
 */

import { exportAssetsToPDF } from '@/utils/pdfExport'

// Mock data for testing
const testData = {
  userName: 'John Doe',
  assets: [
    {
      id: 1,
      name: 'Apple Inc. Stock',
      asset_type: 'Stock',
      purchase_date: '2023-01-15',
      quantity: 100,
      initial_value: 15000,
      current_value: 18000
    },
    {
      id: 2,
      name: 'Bitcoin',
      asset_type: 'Cryptocurrency',
      purchase_date: '2023-06-10',
      quantity: 0.5,
      initial_value: 25000,
      current_value: 30000
    }
  ],
  aggregateByType: [
    {
      type: 'Financial Instruments',
      acquisitionValue: 40000,
      presentValue: 48000,
      count: 2
    }
  ],
  totals: {
    totalAcquisitionValue: 40000,
    totalPresentValue: 48000
  },
  detailedAssetBreakdown: [
    {
      assetType: 'Stock',
      acquisitionValue: 15000,
      presentValue: 18000,
      count: 1,
      sharePercent: 37.5
    },
    {
      assetType: 'Cryptocurrency',
      acquisitionValue: 25000,
      presentValue: 30000,
      count: 1,
      sharePercent: 62.5
    }
  ],
  currency: 'USD',
  formatCurrency: (amount) => `$${amount.toLocaleString()}`,
  formatDate: (date) => new Date(date).toLocaleDateString()
}

// Test function
export const testPDFExport = async () => {
  try {
    console.log('Testing PDF export...')
    await exportAssetsToPDF(testData)
    console.log('PDF export test successful!')
    return true
  } catch (error) {
    console.error('PDF export test failed:', error)
    return false
  }
}

export default testPDFExport
