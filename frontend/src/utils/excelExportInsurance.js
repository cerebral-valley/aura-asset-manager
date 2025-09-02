/**
 * Excel Export Utility for Insurance Portfolio Data
 * Creates comprehensive Excel spreadsheets with multiple sheets for detailed analysis
 */

import * as XLSX from 'xlsx'
import { format } from 'date-fns'

/**
 * Export insurance portfolio data to Excel format with multiple sheets
 */
export const exportInsuranceToExcel = async (data) => {
  try {
    const {
      userName,
      policies,
      aggregateByType,
      totals,
      detailedPolicyBreakdown,
      currency,
      formatCurrency,
      formatDate,
      pieData = [],
      premiumOverTimeData = []
    } = data

    // Helper function to get clean numeric value
    const getNumericValue = (value) => {
      if (typeof value === 'number') return value
      if (typeof value === 'string') {
        return parseFloat(value.replace(/[^0-9.-]/g, '')) || 0
      }
      return 0
    }

    // Helper function for percentage calculations
    const calculatePercentage = (part, whole) => {
      if (!whole || whole === 0) return 0
      return (part / whole) * 100
    }

    // Create a new workbook
    const workbook = XLSX.utils.book_new()

    // Sheet 1: Executive Summary
    const summaryData = [
      ['AURA INSURANCE PORTFOLIO SUMMARY'],
      [''],
      ['Report Date:', format(new Date(), 'MMMM dd, yyyy')],
      ['Account Holder:', userName],
      ['Base Currency:', currency],
      [''],
      ['PROTECTION METRICS', 'VALUE', 'ANALYSIS'],
      ['Total Coverage Value', getNumericValue(totals.totalCoverage), 'Primary protection amount'],
      ['Total Annual Premiums', getNumericValue(totals.totalAnnualPremiums), 'Annual cost of protection'],
      ['Average Policy Coverage', getNumericValue(totals.totalCoverage) / Math.max(1, policies.length), 'Mean coverage per policy'],
      ['Protection Categories', aggregateByType.filter(t => getNumericValue(t.totalCoverage) > 0).length, 'Types of coverage'],
      ['Active Policies', policies.filter(p => p.status === 'active').length, 'Currently effective policies'],
      ['Coverage Cost Ratio (%)', ((getNumericValue(totals.totalAnnualPremiums) / Math.max(1, getNumericValue(totals.totalCoverage))) * 100), 'Annual cost vs coverage'],
      [''],
      ['COVERAGE EFFICIENCY METRICS'],
      ['Cost per $1,000 Coverage', (getNumericValue(totals.totalAnnualPremiums) / Math.max(1, getNumericValue(totals.totalCoverage) / 1000)), 'Lower is better'],
      ['Coverage Diversification Score', aggregateByType.length, 'Number of protection types'],
      ['Policy Utilization Rate (%)', (policies.filter(p => p.status === 'active').length / Math.max(1, policies.length)) * 100, 'Active vs total policies']
    ]

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)
    
    // Style the summary sheet
    summarySheet['!cols'] = [
      { width: 30 },
      { width: 20 },
      { width: 25 }
    ]

    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Executive Summary')

    // Sheet 2: Policy Distribution
    const distributionData = [
      ['INSURANCE PORTFOLIO DISTRIBUTION BY TYPE'],
      [''],
      ['Category', 'Total Coverage', 'Annual Premiums', 'Policy Count', 'Avg Coverage', 'Avg Premium', 'Coverage %', 'Premium %']
    ]

    const totalCoverage = getNumericValue(totals.totalCoverage)
    const totalPremiums = getNumericValue(totals.totalAnnualPremiums)
    
    aggregateByType.forEach(category => {
      const coverage = getNumericValue(category.totalCoverage)
      const premiums = getNumericValue(category.totalAnnualPremiums)
      const count = category.count || 0
      const avgCoverage = count > 0 ? coverage / count : 0
      const avgPremium = count > 0 ? premiums / count : 0
      const coveragePercentage = calculatePercentage(coverage, totalCoverage)
      const premiumPercentage = calculatePercentage(premiums, totalPremiums)

      distributionData.push([
        category.type || category.label,
        coverage,
        premiums,
        count,
        avgCoverage,
        avgPremium,
        coveragePercentage,
        premiumPercentage
      ])
    })

    // Add totals row
    distributionData.push([''])
    distributionData.push([
      'TOTAL',
      totalCoverage,
      totalPremiums,
      policies.length,
      totalCoverage / Math.max(1, policies.length),
      totalPremiums / Math.max(1, policies.length),
      100.0,
      100.0
    ])

    const distributionSheet = XLSX.utils.aoa_to_sheet(distributionData)
    distributionSheet['!cols'] = [
      { width: 15 },
      { width: 15 },
      { width: 15 },
      { width: 12 },
      { width: 15 },
      { width: 15 },
      { width: 12 },
      { width: 12 }
    ]

    XLSX.utils.book_append_sheet(workbook, distributionSheet, 'Policy Distribution')

    // Sheet 3: Individual Policies
    const policiesData = [
      ['INDIVIDUAL POLICY DETAILS'],
      [''],
      ['Policy Name', 'Type', 'Provider', 'Policy Number', 'Coverage Amount', 'Premium Amount', 'Premium Frequency', 'Start Date', 'End Date', 'Renewal Date', 'Status', 'Notes']
    ]

    policies.forEach(policy => {
      policiesData.push([
        policy.policy_name || 'Unnamed Policy',
        policy.policy_type || 'Not specified',
        policy.provider || 'Not specified',
        policy.policy_number || 'Not specified',
        getNumericValue(policy.coverage_amount),
        getNumericValue(policy.premium_amount),
        policy.premium_frequency || 'Not specified',
        policy.start_date || 'Not specified',
        policy.end_date || 'Ongoing',
        policy.renewal_date || 'Not specified',
        policy.status || 'active',
        policy.notes || 'None'
      ])
    })

    const policiesSheet = XLSX.utils.aoa_to_sheet(policiesData)
    policiesSheet['!cols'] = [
      { width: 20 },
      { width: 12 },
      { width: 18 },
      { width: 15 },
      { width: 15 },
      { width: 15 },
      { width: 15 },
      { width: 12 },
      { width: 12 },
      { width: 12 },
      { width: 10 },
      { width: 25 }
    ]

    XLSX.utils.book_append_sheet(workbook, policiesSheet, 'Individual Policies')

    // Sheet 4: Coverage Analysis
    const analysisData = [
      ['COMPREHENSIVE COVERAGE ANALYSIS'],
      [''],
      ['PROTECTION ADEQUACY ANALYSIS'],
      ['Coverage Type', 'Status', 'Coverage Amount', 'Risk Level', 'Recommendation'],
      ['Life Insurance', 
       policies.some(p => p.policy_type === 'life') ? 'COVERED' : 'NOT COVERED',
       policies.filter(p => p.policy_type === 'life').reduce((sum, p) => sum + getNumericValue(p.coverage_amount), 0),
       policies.some(p => p.policy_type === 'life') ? 'LOW' : 'HIGH',
       policies.some(p => p.policy_type === 'life') ? 'Monitor coverage adequacy' : 'Consider life insurance'
      ],
      ['Health Insurance', 
       policies.some(p => p.policy_type === 'health') ? 'COVERED' : 'NOT COVERED',
       policies.filter(p => p.policy_type === 'health').reduce((sum, p) => sum + getNumericValue(p.coverage_amount), 0),
       policies.some(p => p.policy_type === 'health') ? 'LOW' : 'HIGH',
       policies.some(p => p.policy_type === 'health') ? 'Review annual limits' : 'Essential coverage needed'
      ],
      ['Property Insurance', 
       policies.some(p => ['home', 'auto'].includes(p.policy_type)) ? 'COVERED' : 'NOT COVERED',
       policies.filter(p => ['home', 'auto'].includes(p.policy_type)).reduce((sum, p) => sum + getNumericValue(p.coverage_amount), 0),
       policies.some(p => ['home', 'auto'].includes(p.policy_type)) ? 'MEDIUM' : 'HIGH',
       policies.some(p => ['home', 'auto'].includes(p.policy_type)) ? 'Check replacement values' : 'Protect major assets'
      ],
      [''],
      ['COST EFFICIENCY METRICS'],
      ['Metric', 'Value', 'Benchmark', 'Status', 'Action Required'],
      ['Cost per $1k Coverage', 
       (getNumericValue(totals.totalAnnualPremiums) / Math.max(1, getNumericValue(totals.totalCoverage) / 1000)).toFixed(2),
       '< 20.00', 
       (getNumericValue(totals.totalAnnualPremiums) / Math.max(1, getNumericValue(totals.totalCoverage) / 1000)) < 20 ? 'GOOD' : 'REVIEW',
       (getNumericValue(totals.totalAnnualPremiums) / Math.max(1, getNumericValue(totals.totalCoverage) / 1000)) < 20 ? 'None' : 'Review premium costs'
      ],
      ['Coverage Diversification', 
       aggregateByType.length,
       '>= 3', 
       aggregateByType.length >= 3 ? 'GOOD' : 'IMPROVE',
       aggregateByType.length >= 3 ? 'None' : 'Add coverage types'
      ],
      ['Active Policy Ratio (%)', 
       ((policies.filter(p => p.status === 'active').length / Math.max(1, policies.length)) * 100).toFixed(1),
       '> 90%', 
       (policies.filter(p => p.status === 'active').length / Math.max(1, policies.length)) > 0.9 ? 'GOOD' : 'REVIEW',
       (policies.filter(p => p.status === 'active').length / Math.max(1, policies.length)) > 0.9 ? 'None' : 'Review inactive policies'
      ]
    ]

    const analysisSheet = XLSX.utils.aoa_to_sheet(analysisData)
    analysisSheet['!cols'] = [
      { width: 20 },
      { width: 15 },
      { width: 15 },
      { width: 12 },
      { width: 30 }
    ]

    XLSX.utils.book_append_sheet(workbook, analysisSheet, 'Coverage Analysis')

    // Sheet 5: Risk Assessment
    const riskData = [
      ['INSURANCE RISK ASSESSMENT MATRIX'],
      [''],
      ['Risk Category', 'Current Coverage', 'Risk Exposure', 'Mitigation Level', 'Priority', 'Recommended Action'],
      ['Mortality Risk', 
       policies.some(p => p.policy_type === 'life') ? 'Life Insurance Active' : 'No Life Insurance',
       policies.some(p => p.policy_type === 'life') ? 'LOW' : 'HIGH',
       policies.some(p => p.policy_type === 'life') ? 'ADEQUATE' : 'INSUFFICIENT',
       policies.some(p => p.policy_type === 'life') ? 'MEDIUM' : 'HIGH',
       policies.some(p => p.policy_type === 'life') ? 'Review coverage amount' : 'Obtain life insurance'
      ],
      ['Health/Medical Risk', 
       policies.some(p => p.policy_type === 'health') ? 'Health Insurance Active' : 'No Health Insurance',
       policies.some(p => p.policy_type === 'health') ? 'LOW' : 'CRITICAL',
       policies.some(p => p.policy_type === 'health') ? 'ADEQUATE' : 'CRITICAL',
       'HIGH',
       policies.some(p => p.policy_type === 'health') ? 'Monitor deductibles' : 'Obtain health insurance ASAP'
      ],
      ['Property Damage Risk', 
       policies.some(p => ['home', 'auto'].includes(p.policy_type)) ? 'Property Insurance Active' : 'No Property Insurance',
       policies.some(p => ['home', 'auto'].includes(p.policy_type)) ? 'MEDIUM' : 'HIGH',
       policies.some(p => ['home', 'auto'].includes(p.policy_type)) ? 'ADEQUATE' : 'INSUFFICIENT',
       'MEDIUM',
       policies.some(p => ['home', 'auto'].includes(p.policy_type)) ? 'Update coverage values' : 'Protect major assets'
      ],
      ['Liability Risk', 
       policies.some(p => p.policy_type === 'auto') ? 'Auto Liability Coverage' : 'Limited Liability Coverage',
       'HIGH',
       policies.some(p => p.policy_type === 'auto') ? 'PARTIAL' : 'INSUFFICIENT',
       'HIGH',
       'Consider umbrella liability policy'
      ],
      ['Disability Risk', 
       policies.some(p => p.policy_type === 'disability') ? 'Disability Insurance Active' : 'No Disability Insurance',
       'MEDIUM',
       policies.some(p => p.policy_type === 'disability') ? 'ADEQUATE' : 'INSUFFICIENT',
       'MEDIUM',
       policies.some(p => p.policy_type === 'disability') ? 'Review benefit amount' : 'Consider disability insurance'
      ],
      [''],
      ['RISK SCORE CALCULATION'],
      ['Total Risk Categories', '5'],
      ['Covered Categories', aggregateByType.length.toString()],
      ['Risk Coverage Ratio (%)', ((aggregateByType.length / 5) * 100).toFixed(1)],
      ['Overall Risk Level', aggregateByType.length >= 4 ? 'LOW' : aggregateByType.length >= 2 ? 'MEDIUM' : 'HIGH'],
      ['Priority Actions Needed', 5 - aggregateByType.length]
    ]

    const riskSheet = XLSX.utils.aoa_to_sheet(riskData)
    riskSheet['!cols'] = [
      { width: 20 },
      { width: 20 },
      { width: 15 },
      { width: 15 },
      { width: 12 },
      { width: 35 }
    ]

    XLSX.utils.book_append_sheet(workbook, riskSheet, 'Risk Assessment')

    // Sheet 6: LLM Analysis Prompts
    const promptsData = [
      ['LLM ANALYSIS PROMPTS FOR INSURANCE PORTFOLIO'],
      [''],
      ['Use these prompts with AI assistants like ChatGPT, Claude, or Gemini for deeper analysis'],
      [''],
      ['PROMPT 1: COVERAGE GAP ANALYSIS'],
      [''],
      ['Analyze the insurance portfolio data and identify potential coverage gaps. Consider:'],
      ['• Missing insurance types for comprehensive protection'],
      ['• Adequate coverage amounts relative to potential risks'],
      ['• Geographic or situational coverage limitations'],
      ['• Beneficiary and dependent protection needs'],
      ['• Professional liability or business coverage requirements'],
      [''],
      ['Provide specific recommendations for closing identified gaps with estimated'],
      ['coverage amounts and premium ranges.'],
      [''],
      ['PROMPT 2: PROTECTION ADEQUACY ASSESSMENT'],
      [''],
      ['Evaluate whether the current insurance coverage amounts are adequate by analyzing:'],
      ['• Total coverage vs. estimated net worth and assets'],
      ['• Life insurance coverage relative to income replacement needs'],
      ['• Property coverage vs. current replacement values'],
      ['• Health insurance limits vs. potential medical costs'],
      ['• Deductible levels vs. emergency fund capacity'],
      [''],
      ['Recommend optimal coverage levels and identify any over-insurance or'],
      ['under-insurance situations.'],
      [''],
      ['PROMPT 3: RISK PROFILE OPTIMIZATION'],
      [''],
      ['Assess the risk profile of this insurance portfolio and suggest optimizations:'],
      ['• Risk tolerance vs. current coverage strategy'],
      ['• Premium cost efficiency across different policy types'],
      ['• Deductible optimization for premium savings'],
      ['• Multi-policy discounts and bundling opportunities'],
      ['• Age and life stage appropriate coverage adjustments'],
      [''],
      ['Provide a risk-adjusted optimization strategy with specific action items.'],
      [''],
      ['PROMPT 4: COST-BENEFIT ANALYSIS'],
      [''],
      ['Perform a comprehensive cost-benefit analysis of the insurance portfolio:'],
      ['• Premium costs vs. coverage value and probability of claims'],
      ['• Alternative risk management strategies (self-insurance options)'],
      ['• Tax advantages of different insurance product types'],
      ['• Investment components vs. pure insurance (for life insurance)'],
      ['• Annual cost as percentage of income and budget optimization'],
      [''],
      ['Recommend strategies to maximize protection while optimizing costs.'],
      [''],
      ['PROMPT 5: STRATEGIC COVERAGE PLANNING'],
      [''],
      ['Develop a strategic 5-10 year insurance planning roadmap considering:'],
      ['• Life stage transitions and changing insurance needs'],
      ['• Career and income progression impact on coverage requirements'],
      ['• Family planning and dependent protection evolution'],
      ['• Asset accumulation and corresponding insurance adjustments'],
      ['• Retirement planning and long-term care considerations'],
      [''],
      ['Create a phased plan with timeline and priority recommendations for'],
      ['insurance portfolio evolution.'],
      [''],
      ['HOW TO USE THESE PROMPTS:'],
      ['1. Copy the insurance data from other sheets in this workbook'],
      ['2. Choose the relevant prompt above'],
      ['3. Paste both into your preferred AI assistant'],
      ['4. Ask for specific, actionable recommendations'],
      ['5. Use the AI analysis to optimize your insurance strategy']
    ]

    const promptsSheet = XLSX.utils.aoa_to_sheet(promptsData)
    promptsSheet['!cols'] = [{ width: 80 }]

    XLSX.utils.book_append_sheet(workbook, promptsSheet, 'LLM Analysis Prompts')

    // Save the workbook
    const fileName = `insurance-portfolio-analysis-${format(new Date(), 'yyyy-MM-dd')}.xlsx`
    XLSX.writeFile(workbook, fileName)

    return true
  } catch (error) {
    console.error('Error generating insurance Excel file:', error)
    throw error
  }
}
