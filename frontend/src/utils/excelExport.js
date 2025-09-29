/**
 * Excel Export Utility for Portfolio Data
 * Creates comprehensive Excel spreadsheets with multiple sheets for detailed analysis
 */

import * as XLSX from 'xlsx'
import { format } from 'date-fns'

/**
 * Export portfolio data to Excel format with multiple sheets
 */
export const exportToExcel = async (data) => {
  try {
    const {
      userName,
      assets,
      aggregateByType,
      totals,
      detailedAssetBreakdown,
      currency,
      formatCurrency,
      formatDate,
      pieData = [],
      valueOverTimeData = []
    } = data

    // Helper function to get clean numeric value
    const getNumericValue = (value) => {
      if (typeof value === 'number') return value
      if (typeof value === 'string') {
        return parseFloat(value.replace(/[^0-9.-]/g, '')) || 0
      }
      return 0
    }

    // Create a new workbook
    const workbook = XLSX.utils.book_new()

    // Sheet 1: Executive Summary
    const summaryData = [
      ['AURA ASSET MANAGER - PORTFOLIO SUMMARY'],
      [''],
      ['Report Date:', format(new Date(), 'MMMM dd, yyyy')],
      ['Account Holder:', userName],
      ['Base Currency:', currency],
      [''],
      ['PORTFOLIO METRICS', 'VALUE', 'ANALYSIS'],
      ['Total Portfolio Value', getNumericValue(totals.totalPresentValue), ''],
      ['Total Investment Cost', getNumericValue(totals.totalAcquisitionValue), ''],
      ['Absolute Gain/Loss', getNumericValue(totals.totalPresentValue) - getNumericValue(totals.totalAcquisitionValue), ''],
      ['Percentage Return (%)', getNumericValue(totals.totalAcquisitionValue) > 0 ? 
        ((getNumericValue(totals.totalPresentValue) - getNumericValue(totals.totalAcquisitionValue)) / getNumericValue(totals.totalAcquisitionValue) * 100) : 0, ''],
      ['Total Asset Categories', aggregateByType.filter(t => getNumericValue(t.presentValue) > 0).length, ''],
      ['Total Individual Assets', assets.length, '']
    ]

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)
    
    // Style the summary sheet
    summarySheet['!cols'] = [
      { width: 25 },
      { width: 20 },
      { width: 15 }
    ]

    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Executive Summary')

    // Sheet 2: Portfolio Distribution
    const distributionData = [
      ['PORTFOLIO DISTRIBUTION BY CATEGORY'],
      [''],
      ['Category', 'Current Value', 'Acquisition Value', 'Gain/Loss', 'Return %', 'Portfolio %', 'Asset Count']
    ]

    const totalCurrent = getNumericValue(totals.totalPresentValue)
    
    aggregateByType.forEach(category => {
      const currentValue = getNumericValue(category.presentValue)
      const acquisitionValue = getNumericValue(category.acquisitionValue)
      const gainLoss = currentValue - acquisitionValue
      const returnPct = acquisitionValue > 0 ? (gainLoss / acquisitionValue * 100) : 0
      const portfolioPct = totalCurrent > 0 ? (currentValue / totalCurrent * 100) : 0

      distributionData.push([
        category.type || category.label,
        currentValue,
        acquisitionValue,
        gainLoss,
        returnPct,
        portfolioPct,
        category.count
      ])
    })

    // Add totals row
    distributionData.push([''])
    distributionData.push([
      'TOTAL',
      getNumericValue(totals.totalPresentValue),
      getNumericValue(totals.totalAcquisitionValue),
      getNumericValue(totals.totalPresentValue) - getNumericValue(totals.totalAcquisitionValue),
      getNumericValue(totals.totalAcquisitionValue) > 0 ? 
        ((getNumericValue(totals.totalPresentValue) - getNumericValue(totals.totalAcquisitionValue)) / getNumericValue(totals.totalAcquisitionValue) * 100) : 0,
      100,
      assets.length
    ])

    const distributionSheet = XLSX.utils.aoa_to_sheet(distributionData)
    distributionSheet['!cols'] = [
      { width: 20 },
      { width: 15 },
      { width: 15 },
      { width: 15 },
      { width: 12 },
      { width: 12 },
      { width: 12 }
    ]

    XLSX.utils.book_append_sheet(workbook, distributionSheet, 'Portfolio Distribution')

    // Sheet 3: Individual Assets
    const assetsData = [
      ['INDIVIDUAL ASSET DETAILS'],
      [''],
      ['Asset Name', 'Type', 'Purchase Date', 'Liquidity Status', 'Time Horizon', 'Asset Purpose', 'Quantity', 'Unit Price', 'Initial Value', 'Current Value', 'Gain/Loss', 'Return %', 'Notes']
    ]

    assets.forEach(asset => {
      const initialValue = getNumericValue(asset.initial_value)
      const currentValue = getNumericValue(asset.current_value || asset.initial_value)
      const gainLoss = currentValue - initialValue
      const returnPct = initialValue > 0 ? (gainLoss / initialValue * 100) : 0
      const unitPrice = asset.quantity && asset.quantity > 0 ? initialValue / asset.quantity : initialValue

      // Helper functions for display labels
      const getLiquidityLabel = (liquidAssets) => {
        if (liquidAssets === true || liquidAssets === 'true') return 'Liquid';
        if (liquidAssets === false || liquidAssets === 'false') return 'Not Liquid';
        return liquidAssets ? 'Liquid' : 'Not Liquid';
      };
      
      const getTimeHorizonLabel = (timeHorizon) => {
        switch(timeHorizon) {
          case 'short_term': return 'Short Term';
          case 'medium_term': return 'Medium Term';
          case 'long_term': return 'Long Term';
          default: return timeHorizon || 'Short Term';
        }
      };
      
      const getAssetPurposeLabel = (assetPurpose) => {
        const purposeLabels = {
          'hyper_growth': 'Hyper Growth',
          'growth': 'Growth',
          'financial_security': 'Financial Security',
          'emergency_fund': 'Emergency Fund',
          'childrens_education': "Children's Education",
          'retirement_fund': 'Retirement Fund',
          'speculation': 'Speculation'
        };
        return purposeLabels[assetPurpose] || assetPurpose || 'Speculation';
      };

      assetsData.push([
        asset.name || 'Unnamed Asset',
        asset.asset_type || 'Unknown',
        asset.purchase_date ? formatDate(asset.purchase_date) : 'N/A',
        getLiquidityLabel(asset.liquid_assets),
        getTimeHorizonLabel(asset.time_horizon),
        getAssetPurposeLabel(asset.asset_purpose),
        asset.quantity || 1,
        unitPrice,
        initialValue,
        currentValue,
        gainLoss,
        returnPct,
        asset.notes || ''
      ])
    })

    const assetsSheet = XLSX.utils.aoa_to_sheet(assetsData)
    assetsSheet['!cols'] = [
      { width: 20 },  // Asset Name
      { width: 15 },  // Type
      { width: 12 },  // Purchase Date
      { width: 12 },  // Liquidity Status
      { width: 15 },  // Time Horizon
      { width: 18 },  // Asset Purpose
      { width: 10 },  // Quantity
      { width: 12 },  // Unit Price
      { width: 12 },  // Initial Value
      { width: 12 },  // Current Value
      { width: 12 },  // Gain/Loss
      { width: 10 },  // Return %
      { width: 25 }   // Notes
    ]

    XLSX.utils.book_append_sheet(workbook, assetsSheet, 'Individual Assets')

    // Sheet 4: Asset Distribution Matrix
    const matrixData = [
      ['ASSET DISTRIBUTION MATRIX'],
      [''],
      ['LIQUID ASSETS DISTRIBUTION'],
      ['Time Horizon', "Children's Education", 'Emergency Fund', 'Financial Security', 'Growth', 'Hyper Growth', 'Retirement Fund', 'Speculation']
    ]

    // Build matrix data
    const timeHorizons = [
      { value: 'short_term', label: 'Short Term (< 1 year)' },
      { value: 'medium_term', label: 'Medium Term (1-3 years)' },
      { value: 'long_term', label: 'Long Term (> 3 years)' }
    ];
    
    const assetPurposes = [
      'childrens_education',
      'emergency_fund', 
      'financial_security',
      'growth',
      'hyper_growth',
      'retirement_fund',
      'speculation'
    ];

    // Liquid Assets Matrix
    const liquidAssets = assets.filter(a => a.liquid_assets === true || a.liquid_assets === 'true');
    const liquidMatrix = {};
    timeHorizons.forEach(horizon => {
      liquidMatrix[horizon.value] = {};
      assetPurposes.forEach(purpose => {
        liquidMatrix[horizon.value][purpose] = {
          count: 0,
          value: 0
        };
      });
    });

    liquidAssets.forEach(asset => {
      const horizon = asset.time_horizon || 'short_term';
      const purpose = asset.asset_purpose || 'speculation';
      
      if (liquidMatrix[horizon] && liquidMatrix[horizon][purpose]) {
        liquidMatrix[horizon][purpose].count++;
        liquidMatrix[horizon][purpose].value += getNumericValue(asset.current_value || asset.initial_value || 0);
      }
    });

    // Add liquid matrix rows
    timeHorizons.forEach(horizon => {
      const row = [horizon.label];
      assetPurposes.forEach(purpose => {
        const cellData = liquidMatrix[horizon.value][purpose];
        const hasData = cellData.count > 0;
        row.push(hasData ? `${cellData.count} assets (${formatCurrency ? formatCurrency(cellData.value) : cellData.value})` : '-');
      });
      matrixData.push(row);
    });

    matrixData.push(['']);
    matrixData.push(['ILLIQUID ASSETS DISTRIBUTION']);
    matrixData.push(['Time Horizon', "Children's Education", 'Emergency Fund', 'Financial Security', 'Growth', 'Hyper Growth', 'Retirement Fund', 'Speculation']);

    // Illiquid Assets Matrix
    const illiquidAssets = assets.filter(a => a.liquid_assets === false || a.liquid_assets === 'false');
    const illiquidMatrix = {};
    timeHorizons.forEach(horizon => {
      illiquidMatrix[horizon.value] = {};
      assetPurposes.forEach(purpose => {
        illiquidMatrix[horizon.value][purpose] = {
          count: 0,
          value: 0
        };
      });
    });

    illiquidAssets.forEach(asset => {
      const horizon = asset.time_horizon || 'short_term';
      const purpose = asset.asset_purpose || 'speculation';
      
      if (illiquidMatrix[horizon] && illiquidMatrix[horizon][purpose]) {
        illiquidMatrix[horizon][purpose].count++;
        illiquidMatrix[horizon][purpose].value += getNumericValue(asset.current_value || asset.initial_value || 0);
      }
    });

    // Add illiquid matrix rows
    timeHorizons.forEach(horizon => {
      const row = [horizon.label];
      assetPurposes.forEach(purpose => {
        const cellData = illiquidMatrix[horizon.value][purpose];
        const hasData = cellData.count > 0;
        row.push(hasData ? `${cellData.count} assets (${formatCurrency ? formatCurrency(cellData.value) : cellData.value})` : '-');
      });
      matrixData.push(row);
    });

    const matrixSheet = XLSX.utils.aoa_to_sheet(matrixData);
    matrixSheet['!cols'] = [
      { width: 25 },  // Time Horizon
      { width: 18 },  // Children's Education
      { width: 15 },  // Emergency Fund
      { width: 18 },  // Financial Security
      { width: 12 },  // Growth
      { width: 15 },  // Hyper Growth
      { width: 18 },  // Retirement Fund
      { width: 15 }   // Speculation
    ];

    XLSX.utils.book_append_sheet(workbook, matrixSheet, 'Asset Distribution Matrix')

    // Sheet 5: Performance Analysis
    const performanceData = [
      ['PERFORMANCE ANALYSIS'],
      [''],
      ['CATEGORY PERFORMANCE'],
      ['Category', 'ROI %', 'Performance Rating', 'Risk Level']
    ]

    aggregateByType.forEach(category => {
      const currentValue = getNumericValue(category.presentValue)
      const acquisitionValue = getNumericValue(category.acquisitionValue)
      const roi = acquisitionValue > 0 ? ((currentValue - acquisitionValue) / acquisitionValue * 100) : 0
      
      let rating = 'Poor'
      if (roi > 15) rating = 'Excellent'
      else if (roi > 10) rating = 'Very Good'
      else if (roi > 5) rating = 'Good'
      else if (roi > 0) rating = 'Fair'

      const portfolioPct = totalCurrent > 0 ? (currentValue / totalCurrent * 100) : 0
      let riskLevel = 'Low'
      if (portfolioPct > 40) riskLevel = 'High'
      else if (portfolioPct > 25) riskLevel = 'Medium'

      performanceData.push([
        category.type || category.label,
        roi,
        rating,
        riskLevel
      ])
    })

    performanceData.push([''])
    performanceData.push(['ASSET PERFORMANCE BREAKDOWN'])
    performanceData.push(['Performance Range', 'Asset Count', 'Percentage of Portfolio'])

    const performanceRanges = [
      { label: 'Excellent (>15%)', min: 15, max: Infinity },
      { label: 'Good (5-15%)', min: 5, max: 15 },
      { label: 'Neutral (0-5%)', min: 0, max: 5 },
      { label: 'Loss (<0%)', min: -Infinity, max: 0 }
    ]

    performanceRanges.forEach(range => {
      const assetsInRange = assets.filter(asset => {
        const initial = getNumericValue(asset.initial_value)
        const current = getNumericValue(asset.current_value || asset.initial_value)
        const returnPct = initial > 0 ? ((current - initial) / initial * 100) : 0
        return returnPct >= range.min && returnPct < range.max
      })

      const percentage = assets.length > 0 ? (assetsInRange.length / assets.length * 100) : 0

      performanceData.push([
        range.label,
        assetsInRange.length,
        percentage
      ])
    })

    const performanceSheet = XLSX.utils.aoa_to_sheet(performanceData)
    performanceSheet['!cols'] = [
      { width: 20 },
      { width: 15 },
      { width: 20 },
      { width: 15 }
    ]

    XLSX.utils.book_append_sheet(workbook, performanceSheet, 'Performance Analysis')

    // Sheet 6: Risk Analysis
    const riskData = [
      ['RISK ANALYSIS REPORT'],
      [''],
      ['DIVERSIFICATION METRICS'],
      ['Metric', 'Value', 'Assessment', 'Recommendation']
    ]

    const assetTypeCount = aggregateByType.filter(type => getNumericValue(type.presentValue) > 0).length
    const maxConcentration = Math.max(...aggregateByType.map(type => 
      totalCurrent > 0 ? (getNumericValue(type.presentValue) / totalCurrent) * 100 : 0
    ))
    
    const positiveAssets = assets.filter(asset => {
      const current = getNumericValue(asset.current_value || asset.initial_value)
      const initial = getNumericValue(asset.initial_value)
      return current > initial
    }).length
    
    const successRate = assets.length > 0 ? (positiveAssets / assets.length) * 100 : 0

    const riskMetrics = [
      ['Asset Categories', assetTypeCount, assetTypeCount >= 5 ? 'Well Diversified' : 'Needs Diversification', assetTypeCount < 5 ? 'Add more asset types' : 'Maintain diversity'],
      ['Max Concentration %', maxConcentration.toFixed(1) + '%', maxConcentration > 50 ? 'High Risk' : maxConcentration > 30 ? 'Medium Risk' : 'Low Risk', maxConcentration > 40 ? 'Rebalance portfolio' : 'Monitor regularly'],
      ['Success Rate %', successRate.toFixed(1) + '%', successRate > 70 ? 'Excellent' : successRate > 50 ? 'Good' : 'Needs Improvement', successRate < 60 ? 'Review strategy' : 'Continue approach'],
      ['Portfolio Size', assets.length, assets.length > 20 ? 'Large' : assets.length > 10 ? 'Medium' : 'Small', assets.length < 10 ? 'Consider expansion' : 'Good size']
    ]

    riskMetrics.forEach(metric => {
      riskData.push(metric)
    })

    const riskSheet = XLSX.utils.aoa_to_sheet(riskData)
    riskSheet['!cols'] = [
      { width: 20 },
      { width: 15 },
      { width: 20 },
      { width: 25 }
    ]

    XLSX.utils.book_append_sheet(workbook, riskSheet, 'Risk Analysis')

    // Sheet 7: Chart Data
    const chartDataSheet = []
    
    // Add value over time data if available
    if (valueOverTimeData && valueOverTimeData.length > 0) {
      chartDataSheet.push(['VALUE OVER TIME CHART DATA'])
      chartDataSheet.push([''])
      chartDataSheet.push(['Year', 'Acquisition Value', 'Present Value', 'Portfolio Growth'])
      
      valueOverTimeData.forEach(item => {
        const acquisition = getNumericValue(item.acquisitionValue || 0)
        const present = getNumericValue(item.presentValue || item.value || 0)
        const growth = acquisition > 0 ? ((present - acquisition) / acquisition * 100) : 0
        
        chartDataSheet.push([
          item.year || 'N/A',
          acquisition,
          present,
          growth
        ])
      })
      
      chartDataSheet.push([''])
      chartDataSheet.push([''])
    }
    
    // Add pie chart data if available
    if (pieData && pieData.length > 0) {
      chartDataSheet.push(['ASSET ALLOCATION PIE CHART DATA'])
      chartDataSheet.push([''])
      chartDataSheet.push(['Category', 'Current Value', 'Percentage'])
      
      const totalPieValue = pieData.reduce((sum, item) => sum + getNumericValue(item.value || 0), 0)
      
      pieData.forEach(item => {
        const value = getNumericValue(item.value || 0)
        const percentage = totalPieValue > 0 ? (value / totalPieValue * 100) : 0
        
        chartDataSheet.push([
          item.name || 'Unknown',
          value,
          percentage
        ])
      })
    }
    
    // Only add chart sheet if there's data
    if (chartDataSheet.length > 0) {
      const chartSheet = XLSX.utils.aoa_to_sheet(chartDataSheet)
      chartSheet['!cols'] = [
        { width: 20 },
        { width: 15 },
        { width: 15 },
        { width: 15 }
      ]
      
      XLSX.utils.book_append_sheet(workbook, chartSheet, 'Chart Data')
    }

    // Sheet 8: AI Analysis Prompts
    const promptsData = [
      ['AI ANALYSIS PROMPTS FOR PORTFOLIO OPTIMIZATION'],
      [''],
      ['Copy and paste these prompts along with your Excel data to any AI assistant for detailed analysis:'],
      [''],
      ['PROMPT 1: PORTFOLIO DIVERSIFICATION'],
      ['Analyze my Excel portfolio data focusing on the Portfolio Distribution sheet.'],
      ['Evaluate diversification effectiveness and suggest improvements.'],
      ['Consider category weights, concentration risk, and balance.'],
      [''],
      ['PROMPT 2: PERFORMANCE OPTIMIZATION'],
      ['Review my Individual Assets and Performance Analysis sheets.'],
      ['Identify underperforming assets and suggest optimization strategies.'],
      ['Provide specific buy/hold/sell recommendations.'],
      [''],
      ['PROMPT 3: RISK MANAGEMENT'],
      ['Using the Risk Analysis sheet, evaluate my portfolio risk profile.'],
      ['Suggest risk mitigation strategies based on the metrics provided.'],
      ['Include rebalancing recommendations with target allocations.'],
      [''],
      ['PROMPT 4: COMPREHENSIVE REVIEW'],
      ['Conduct a full portfolio audit using all Excel sheets provided.'],
      ['Cover diversification, performance, risk, and growth potential.'],
      ['Provide actionable recommendations with specific targets.']
    ]

    const promptsSheet = XLSX.utils.aoa_to_sheet(promptsData)
    promptsSheet['!cols'] = [{ width: 60 }]

    XLSX.utils.book_append_sheet(workbook, promptsSheet, 'AI Analysis Prompts')

    // Generate filename
    const currentDateForFile = format(new Date(), 'yyyy-MM-dd')
    const cleanUserName = userName.replace(/[^a-zA-Z0-9]/g, '_')
    const filename = `Aura_Portfolio_Analysis_${cleanUserName}_${currentDateForFile}.xlsx`

    // Write and download the file
    XLSX.writeFile(workbook, filename)

    return { success: true, filename }
  } catch (error) {
    console.error('Error generating Excel file:', error)
    throw new Error('Failed to generate Excel portfolio report. Please try again.')
  }
}
