/**
 * Terminal-Style LLM-Optimized PDF Export Utility for Insurance Data
 * Creates reports with ASCII tables and chart representations for better LLM readability
 */

import { jsPDF } from 'jspdf'
import { format } from 'date-fns'

/**
 * Export insurance portfolio data as an LLM-friendly PDF with terminal-style formatting
 */
export const exportInsuranceToPDF = async (data) => {
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

    // Create PDF document
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    
    let yPosition = 15
    const margin = 12
    const lineHeight = 4
    const maxWidth = pageWidth - 2 * margin

    // Helper function to get clean numeric value
    const getNumericValue = (value) => {
      if (typeof value === 'number') return value
      if (typeof value === 'string') {
        return parseFloat(value.replace(/[^0-9.-]/g, '')) || 0
      }
      return 0
    }

    // Helper function for clean number formatting
    const formatNumber = (amount) => {
      const numAmount = getNumericValue(amount)
      return numAmount.toLocaleString('en-US', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
      })
    }

    // Helper function for percentage calculations
    const calculatePercentage = (part, whole) => {
      if (!whole || whole === 0) return 0
      return ((part / whole) * 100).toFixed(1)
    }

    // Helper function to add text
    const addText = (text, options = {}) => {
      const { bold = false, size = 10, color = [0, 0, 0] } = options
      
      pdf.setFont('courier', bold ? 'bold' : 'normal')
      pdf.setFontSize(size)
      pdf.setTextColor(...color)
      
      const lines = pdf.splitTextToSize(text, maxWidth)
      lines.forEach(line => {
        if (yPosition > pageHeight - 20) {
          pdf.addPage()
          yPosition = 15
        }
        pdf.text(line, margin, yPosition)
        yPosition += lineHeight
      })
      
      return yPosition
    }

    // Helper function to create ASCII tables
    const createASCIITable = (headers, rows, colWidths) => {
      let table = ''
      const totalWidth = colWidths.reduce((sum, width) => sum + width, 0) + colWidths.length + 1

      // Top border
      table += '+' + colWidths.map(w => '-'.repeat(w)).join('+') + '+\n'

      // Headers
      table += '|'
      headers.forEach((header, i) => {
        table += ` ${header.padEnd(colWidths[i] - 1)}|`
      })
      table += '\n'

      // Header separator
      table += '+' + colWidths.map(w => '-'.repeat(w)).join('+') + '+\n'

      // Data rows
      rows.forEach(row => {
        table += '|'
        row.forEach((cell, i) => {
          const cellStr = String(cell || '')
          table += ` ${cellStr.padEnd(colWidths[i] - 1)}|`
        })
        table += '\n'
      })

      // Bottom border
      table += '+' + colWidths.map(w => '-'.repeat(w)).join('+') + '+\n'

      return table
    }

    // Helper function to create ASCII bar chart
    const createASCIIBarChart = (data, title, maxBarLength = 40) => {
      let chart = `\n${title}\n${'='.repeat(title.length)}\n\n`
      
      if (!data || data.length === 0) {
        chart += 'No data available\n'
        return chart
      }

      const maxValue = Math.max(...data.map(item => getNumericValue(item.value)))
      if (maxValue === 0) {
        chart += 'No data to display\n'
        return chart
      }

      data.forEach(item => {
        const value = getNumericValue(item.value)
        const barLength = Math.max(1, Math.round((value / maxValue) * maxBarLength))
        const bar = '█'.repeat(barLength)
        const label = String(item.label || '').substring(0, 15).padEnd(15)
        const valueStr = formatNumber(value).padStart(12)
        chart += `${label} |${bar} ${valueStr}\n`
      })

      return chart
    }

    // Helper function to create ASCII pie chart representation
    const createASCIIPieChart = (data, title) => {
      let chart = `\n${title}\n${'='.repeat(title.length)}\n\n`
      
      if (!data || data.length === 0) {
        chart += 'No data available\n'
        return chart
      }

      const total = data.reduce((sum, item) => sum + getNumericValue(item.value), 0)
      if (total === 0) {
        chart += 'No data to display\n'
        return chart
      }

      data.forEach((item, index) => {
        const value = getNumericValue(item.value)
        const percentage = calculatePercentage(value, total)
        const barLength = Math.max(1, Math.round(percentage / 2)) // Scale to fit
        const bar = '█'.repeat(barLength)
        const label = String(item.label || '').substring(0, 20).padEnd(20)
        const valueStr = formatNumber(value).padStart(12)
        chart += `${label} |${bar} ${valueStr} (${percentage}%)\n`
      })

      return chart
    }

    // Document header
    addText('AURA INSURANCE PORTFOLIO ANALYSIS REPORT', { bold: true, size: 16 })
    addText('Terminal-Style Format Optimized for AI Analysis', { size: 12, color: [100, 100, 100] })
    yPosition += 2

    // Report metadata
    addText('REPORT METADATA', { bold: true, size: 12 })
    addText(`Generated: ${format(new Date(), 'MMMM dd, yyyy HH:mm:ss')}`)
    addText(`Account Holder: ${userName || 'Not specified'}`)
    addText(`Base Currency: ${currency || 'USD'}`)
    addText(`Total Policies: ${policies?.length || 0}`)
    yPosition += 3

    // Executive Summary
    addText('EXECUTIVE SUMMARY', { bold: true, size: 14 })
    yPosition += 1

    const summaryTable = createASCIITable(
      ['METRIC', 'VALUE', 'ANALYSIS'],
      [
        ['Total Coverage Amount', `${currency} ${formatNumber(totals?.totalCoverage || 0)}`, 'Primary protection value'],
        ['Total Annual Premiums', `${currency} ${formatNumber(totals?.totalAnnualPremiums || 0)}`, 'Annual cost of protection'],
        ['Average Policy Coverage', `${currency} ${formatNumber((totals?.totalCoverage || 0) / Math.max(1, policies?.length || 1))}`, 'Mean coverage per policy'],
        ['Protection Categories', `${aggregateByType?.length || 0}`, 'Types of coverage'],
        ['Active Policies', `${policies?.filter(p => p.status === 'active')?.length || 0}`, 'Currently effective policies'],
        ['Coverage Cost Ratio', `${((totals?.totalAnnualPremiums || 0) / Math.max(1, totals?.totalCoverage || 1) * 100).toFixed(3)}%`, 'Annual cost vs coverage']
      ],
      [25, 20, 35]
    )
    addText(summaryTable)
    yPosition += 2

    // Protection Portfolio Analysis
    addText('PROTECTION PORTFOLIO ANALYSIS', { bold: true, size: 14 })
    yPosition += 1

    if (aggregateByType && aggregateByType.length > 0) {
      const portfolioTable = createASCIITable(
        ['CATEGORY', 'COVERAGE', 'ANNUAL COST', 'POLICIES', 'AVG PREMIUM', 'COVERAGE %'],
        aggregateByType.map(category => [
          (category.type || 'Unknown').toUpperCase(),
          formatNumber(category.totalCoverage || 0),
          formatNumber(category.totalAnnualPremiums || 0),
          category.count || 0,
          formatNumber((category.totalAnnualPremiums || 0) / Math.max(1, category.count || 1)),
          calculatePercentage(category.totalCoverage || 0, totals?.totalCoverage || 0) + '%'
        ]),
        [12, 15, 12, 8, 12, 10]
      )
      addText(portfolioTable)
    } else {
      addText('No coverage categories found.')
    }
    yPosition += 2

    // Coverage Distribution Chart
    if (pieData && pieData.length > 0) {
      const pieChart = createASCIIPieChart(
        pieData.map(item => ({
          label: item.name || item.label,
          value: item.value
        })),
        'COVERAGE DISTRIBUTION BY TYPE'
      )
      addText(pieChart)
      yPosition += 2
    }

    // Premium Cost Analysis Chart
    if (aggregateByType && aggregateByType.length > 0) {
      const premiumChart = createASCIIBarChart(
        aggregateByType.map(category => ({
          label: (category.type || 'Unknown').substring(0, 12),
          value: category.totalAnnualPremiums || 0
        })),
        'ANNUAL PREMIUM COSTS BY CATEGORY'
      )
      addText(premiumChart)
      yPosition += 2
    }

    // Individual Policy Details
    addText('INDIVIDUAL POLICY DETAILS', { bold: true, size: 14 })
    yPosition += 1

    if (policies && policies.length > 0) {
      policies.forEach((policy, index) => {
        if (yPosition > pageHeight - 40) {
          pdf.addPage()
          yPosition = 15
        }

        addText(`POLICY ${index + 1}: ${policy.policy_name || 'Unnamed Policy'}`, { bold: true })
        
        const policyTable = createASCIITable(
          ['ATTRIBUTE', 'VALUE'],
          [
            ['Policy Type', (policy.policy_type || 'Not specified').toUpperCase()],
            ['Provider', policy.provider || 'Not specified'],
            ['Policy Number', policy.policy_number || 'Not specified'],
            ['Coverage Amount', `${currency} ${formatNumber(policy.coverage_amount || 0)}`],
            ['Premium Amount', policy.premium_amount ? `${currency} ${formatNumber(policy.premium_amount)}` : 'Not specified'],
            ['Premium Frequency', policy.premium_frequency || 'Not specified'],
            ['Start Date', policy.start_date ? formatDate(policy.start_date) : 'Not specified'],
            ['End Date', policy.end_date ? formatDate(policy.end_date) : 'Ongoing'],
            ['Renewal Date', policy.renewal_date ? formatDate(policy.renewal_date) : 'Not specified'],
            ['Status', (policy.status || 'active').toUpperCase()],
            ['Notes', policy.notes || 'None']
          ],
          [20, 50]
        )
        addText(policyTable)
        yPosition += 1
      })
    } else {
      addText('No individual policies found.')
    }
    yPosition += 2

    // Risk Analysis
    addText('RISK ANALYSIS MATRIX', { bold: true, size: 14 })
    yPosition += 1

    const riskAnalysis = [
      ['RISK CATEGORY', 'COVERAGE STATUS', 'RISK LEVEL', 'RECOMMENDATION'],
      ['Life Insurance', policies?.some(p => p.policy_type === 'life') ? 'COVERED' : 'NOT COVERED', 
       policies?.some(p => p.policy_type === 'life') ? 'LOW' : 'HIGH', 
       policies?.some(p => p.policy_type === 'life') ? 'Monitor coverage adequacy' : 'Consider life insurance'],
      ['Health Insurance', policies?.some(p => p.policy_type === 'health') ? 'COVERED' : 'NOT COVERED', 
       policies?.some(p => p.policy_type === 'health') ? 'LOW' : 'HIGH', 
       policies?.some(p => p.policy_type === 'health') ? 'Review annual limits' : 'Essential coverage needed'],
      ['Property Insurance', policies?.some(p => ['home', 'auto'].includes(p.policy_type)) ? 'COVERED' : 'NOT COVERED', 
       policies?.some(p => ['home', 'auto'].includes(p.policy_type)) ? 'MEDIUM' : 'HIGH', 
       policies?.some(p => ['home', 'auto'].includes(p.policy_type)) ? 'Check replacement values' : 'Protect major assets'],
      ['Liability Protection', policies?.some(p => p.policy_type === 'auto') ? 'PARTIAL' : 'NOT COVERED', 
       'MEDIUM', 'Consider umbrella policy']
    ]

    const riskTable = createASCIITable(
      riskAnalysis[0],
      riskAnalysis.slice(1),
      [15, 15, 12, 30]
    )
    addText(riskTable)
    yPosition += 2

    // Performance Metrics
    addText('PERFORMANCE METRICS', { bold: true, size: 14 })
    yPosition += 1

    const avgCostPerDollar = totals?.totalCoverage > 0 ? 
      ((totals?.totalAnnualPremiums || 0) / totals.totalCoverage * 100).toFixed(4) : 0

    const performanceTable = createASCIITable(
      ['METRIC', 'VALUE', 'BENCHMARK', 'STATUS'],
      [
        ['Cost per $1k Coverage', `${currency} ${avgCostPerDollar}`, '< $20/year per $1k', avgCostPerDollar < 20 ? 'GOOD' : 'REVIEW'],
        ['Coverage Diversification', `${aggregateByType?.length || 0} types`, '≥ 3 types', (aggregateByType?.length || 0) >= 3 ? 'GOOD' : 'IMPROVE'],
        ['Policy Review Currency', 'Manual check needed', '< 12 months', 'REVIEW'],
        ['Premium Payment Efficiency', policies?.filter(p => p.premium_frequency === 'annually')?.length || 0, 'Annual preferred', 'OPTIMIZE']
      ],
      [25, 15, 20, 10]
    )
    addText(performanceTable)
    yPosition += 3

    // LLM Analysis Prompts - NEW PAGE
    pdf.addPage()
    yPosition = 15

    addText('LLM ANALYSIS PROMPTS', { bold: true, size: 14 })
    addText('Use these prompts with AI assistants for deeper insurance analysis', { color: [100, 100, 100] })
    yPosition += 2

    const prompts = [
      {
        title: 'Coverage Gap Analysis',
        prompt: `Analyze the insurance portfolio above and identify potential coverage gaps. Consider:
• Missing insurance types for comprehensive protection
• Adequate coverage amounts relative to potential risks
• Geographic or situational coverage limitations
• Beneficiary and dependent protection needs
• Professional liability or business coverage requirements

Provide specific recommendations for closing identified gaps with estimated coverage amounts and premium ranges.`
      },
      {
        title: 'Protection Adequacy Assessment',
        prompt: `Evaluate whether the current insurance coverage amounts are adequate by analyzing:
• Total coverage vs. estimated net worth and assets
• Life insurance coverage relative to income replacement needs
• Property coverage vs. current replacement values
• Health insurance limits vs. potential medical costs
• Deductible levels vs. emergency fund capacity

Recommend optimal coverage levels and identify any over-insurance or under-insurance situations.`
      },
      {
        title: 'Risk Profile Optimization',
        prompt: `Assess the risk profile of this insurance portfolio and suggest optimizations:
• Risk tolerance vs. current coverage strategy
• Premium cost efficiency across different policy types
• Deductible optimization for premium savings
• Multi-policy discounts and bundling opportunities
• Age and life stage appropriate coverage adjustments

Provide a risk-adjusted optimization strategy with specific action items.`
      },
      {
        title: 'Cost-Benefit Analysis',
        prompt: `Perform a comprehensive cost-benefit analysis of the insurance portfolio:
• Premium costs vs. coverage value and probability of claims
• Alternative risk management strategies (self-insurance options)
• Tax advantages of different insurance product types
• Investment components vs. pure insurance (for life insurance)
• Annual cost as percentage of income and budget optimization

Recommend strategies to maximize protection while optimizing costs.`
      },
      {
        title: 'Strategic Coverage Planning',
        prompt: `Develop a strategic 5-10 year insurance planning roadmap considering:
• Life stage transitions and changing insurance needs
• Career and income progression impact on coverage requirements
• Family planning and dependent protection evolution
• Asset accumulation and corresponding insurance adjustments
• Retirement planning and long-term care considerations

Create a phased plan with timeline and priority recommendations for insurance portfolio evolution.`
      }
    ]

    prompts.forEach((promptObj, index) => {
      if (yPosition > pageHeight - 50) {
        pdf.addPage()
        yPosition = 15
      }

      addText(`${index + 1}. ${promptObj.title.toUpperCase()}`, { bold: true, size: 12 })
      yPosition += 1
      
      const promptText = promptObj.prompt.split('\n').map(line => line.trim()).filter(line => line).join('\n')
      addText(promptText)
      yPosition += 2
    })

    // Footer
    yPosition += 3
    addText('END OF INSURANCE PORTFOLIO ANALYSIS REPORT', { bold: true, size: 12 })
    addText(`Generated by Aura Asset Manager on ${format(new Date(), 'MMMM dd, yyyy')}`, { color: [100, 100, 100] })
    addText('This report is optimized for AI analysis and strategic insurance planning.', { color: [100, 100, 100] })

    // Save the PDF
    const fileName = `insurance-portfolio-analysis-${format(new Date(), 'yyyy-MM-dd')}.pdf`
    pdf.save(fileName)

    return true
  } catch (error) {
    console.error('Error generating insurance PDF:', error)
    throw error
  }
}
