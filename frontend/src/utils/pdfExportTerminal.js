/**
 * Terminal-Style LLM-Optimized PDF Export Utility
 * Creates reports with ASCII tables and chart representations for better LLM readability
 */

import { jsPDF } from 'jspdf'
import { format } from 'date-fns'

/**
 * Export portfolio data as an LLM-friendly PDF with terminal-style formatting
 */
export const exportAssetsToPDF = async (data) => {
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

    // Helper function to add monospace text (terminal-style)
    const addMonospaceText = (text, x, y, options = {}) => {
      if (y > pageHeight - 20) {
        pdf.addPage()
        y = 15
      }
      
      pdf.setFont('courier', options.bold ? 'bold' : 'normal')
      pdf.setFontSize(options.fontSize || 8)
      
      if (options.align === 'center') {
        pdf.text(text, pageWidth / 2, y, { align: 'center' })
      } else {
        pdf.text(text, x, y)
      }
      
      return y + (options.lineHeight || lineHeight)
    }

    // Helper function to create clean ASCII table
    const createASCIITable = (headers, rows, title = '') => {
      const colWidths = headers.map(header => Math.max(header.length, 10))
      
      // Adjust column widths based on data - limit to prevent overflow
      rows.forEach(row => {
        row.forEach((cell, i) => {
          if (i < colWidths.length) {
            const cellLength = String(cell).length
            colWidths[i] = Math.max(colWidths[i], Math.min(cellLength, 20)) // Max 20 chars per column
          }
        })
      })
      
      // Ensure total width doesn't exceed page
      const maxTableWidth = 70 // Conservative limit
      const totalWidth = colWidths.reduce((sum, width) => sum + width + 3, 1)
      
      if (totalWidth > maxTableWidth) {
        const scale = maxTableWidth / totalWidth
        colWidths.forEach((width, i) => {
          colWidths[i] = Math.max(8, Math.floor(width * scale)) // Min 8 chars per column
        })
      }

      let table = []
      
      if (title) {
        table.push(`+-- ${title} ${'-'.repeat(Math.max(0, 60 - title.length - 5))}+`)
        table.push('|' + ' '.repeat(60) + '|')
      }
      
      // Top border
      const topBorder = '+' + colWidths.map(w => '-'.repeat(w + 2)).join('+') + '+'
      table.push(topBorder)
      
      // Headers
      const headerRow = '|' + headers.map((header, i) => 
        ` ${header.substring(0, colWidths[i]).padEnd(colWidths[i])} `
      ).join('|') + '|'
      table.push(headerRow)
      
      // Header separator
      const headerSep = '+' + colWidths.map(w => '-'.repeat(w + 2)).join('+') + '+'
      table.push(headerSep)
      
      // Data rows
      rows.forEach(row => {
        const dataRow = '|' + row.map((cell, i) => {
          const cellStr = String(cell).substring(0, colWidths[i])
          return ` ${cellStr.padEnd(colWidths[i])} `
        }).join('|') + '|'
        table.push(dataRow)
      })
      
      // Bottom border
      const bottomBorder = '+' + colWidths.map(w => '-'.repeat(w + 2)).join('+') + '+'
      table.push(bottomBorder)
      
      if (title) {
        table.push('|' + ' '.repeat(60) + '|')
        table.push('+' + '-'.repeat(60) + '+')
      }
      
      return table
    }

    // Helper function to create clean ASCII bar chart
    const createASCIIBarChart = (data, title, valueKey = 'value', nameKey = 'name', maxBarLength = 30) => {
      const maxValue = Math.max(...data.map(item => getNumericValue(item[valueKey])))
      
      let chart = []
      chart.push(`+-- ${title} ${'-'.repeat(Math.max(0, 55 - title.length - 5))}+`)
      chart.push('|' + ' '.repeat(55) + '|')
      
      data.slice(0, 8).forEach(item => { // Limit to 8 items to prevent overflow
        const value = getNumericValue(item[valueKey])
        const barLength = maxValue > 0 ? Math.round((value / maxValue) * maxBarLength) : 0
        const bar = '#'.repeat(barLength) + '.'.repeat(maxBarLength - barLength)
        const name = String(item[nameKey]).substring(0, 12).padEnd(12)
        const valueStr = formatNumber(value).padStart(10)
        
        chart.push(`| ${name} |${bar}| ${valueStr} |`)
      })
      
      chart.push('|' + ' '.repeat(55) + '|')
      chart.push('+' + '-'.repeat(55) + '+')
      
      return chart
    }

    // Calculate key metrics
    const totalAcquisition = getNumericValue(totals.totalAcquisitionValue)
    const totalCurrent = getNumericValue(totals.totalPresentValue)
    const totalGainLoss = totalCurrent - totalAcquisition
    const totalReturn = totalAcquisition > 0 ? ((totalGainLoss / totalAcquisition) * 100) : 0

    // Header
    pdf.setFont('courier', 'bold')
    pdf.setFontSize(14)
    yPosition = addMonospaceText('+===============================================================+', margin, yPosition, { fontSize: 14, bold: true })
    yPosition = addMonospaceText('|           AURA ASSET MANAGER - PORTFOLIO REPORT              |', margin, yPosition, { fontSize: 14, bold: true })
    yPosition = addMonospaceText('|                    TERMINAL DATA EXPORT                      |', margin, yPosition, { fontSize: 14, bold: true })
    yPosition = addMonospaceText('+===============================================================+', margin, yPosition, { fontSize: 14, bold: true })
    yPosition += 8

    // Document metadata
    pdf.setFont('courier', 'normal')
    pdf.setFontSize(8)
    yPosition = addMonospaceText('REPORT_TYPE    : Investment Portfolio Analysis', margin, yPosition, { fontSize: 8 })
    yPosition = addMonospaceText('GENERATED_DATE : ' + format(new Date(), 'yyyy-MM-dd HH:mm:ss'), margin, yPosition, { fontSize: 8 })
    yPosition = addMonospaceText('ACCOUNT_HOLDER : ' + userName, margin, yPosition, { fontSize: 8 })
    yPosition = addMonospaceText('BASE_CURRENCY  : ' + currency, margin, yPosition, { fontSize: 8 })
    yPosition = addMonospaceText('TOTAL_ASSETS   : ' + assets.length, margin, yPosition, { fontSize: 8 })
    yPosition += 8

    // Executive Summary Table
    const summaryHeaders = ['METRIC', 'VALUE', 'ANALYSIS']
    const summaryRows = [
      ['Total Portfolio Value', `${currency} ${formatNumber(totalCurrent)}`, totalReturn >= 0 ? 'POSITIVE' : 'NEGATIVE'],
      ['Total Investment Cost', `${currency} ${formatNumber(totalAcquisition)}`, 'BASELINE'],
      ['Absolute Gain/Loss', `${currency} ${formatNumber(totalGainLoss)}`, Math.abs(totalReturn) > 10 ? 'SIGNIFICANT' : 'MODERATE'],
      ['Percentage Return', `${totalReturn.toFixed(2)}%`, totalReturn > 15 ? 'EXCELLENT' : totalReturn > 5 ? 'GOOD' : 'NEEDS_IMPROVEMENT'],
      ['Asset Categories', aggregateByType.filter(t => getNumericValue(t.presentValue) > 0).length, 'DIVERSIFICATION_LEVEL'],
      ['Individual Assets', assets.length, assets.length > 10 ? 'HIGH_VOLUME' : 'MODERATE_VOLUME']
    ]

    const summaryTable = createASCIITable(summaryHeaders, summaryRows, 'EXECUTIVE SUMMARY')
    summaryTable.forEach(line => {
      yPosition = addMonospaceText(line, margin, yPosition, { fontSize: 8 })
    })
    yPosition += 6

    // Portfolio Distribution Chart
    const chartData = aggregateByType
      .filter(type => getNumericValue(type.presentValue) > 0)
      .map(type => ({
        name: (type.type || type.label).substring(0, 12),
        value: getNumericValue(type.presentValue),
        percentage: totalCurrent > 0 ? (getNumericValue(type.presentValue) / totalCurrent * 100) : 0
      }))
      .sort((a, b) => b.value - a.value)

    const distributionChart = createASCIIBarChart(chartData, 'PORTFOLIO DISTRIBUTION BY VALUE')
    distributionChart.forEach(line => {
      if (yPosition > pageHeight - 15) {
        pdf.addPage()
        yPosition = 15
      }
      yPosition = addMonospaceText(line, margin, yPosition, { fontSize: 7 })
    })
    yPosition += 8

    // Value Over Time Chart (if data is available)
    if (valueOverTimeData && valueOverTimeData.length > 0) {
      const timelineData = valueOverTimeData
        .slice(-8) // Show last 8 data points to prevent overflow
        .map(item => ({
          name: String(item.year || 'N/A').substring(0, 6),
          value: getNumericValue(item.presentValue || item.value || 0),
          acquisitionValue: getNumericValue(item.acquisitionValue || 0)
        }))

      if (timelineData.length > 0) {
        const timelineChart = createASCIIBarChart(timelineData, 'VALUE OVER TIME TREND', 'value', 'name')
        timelineChart.forEach(line => {
          if (yPosition > pageHeight - 15) {
            pdf.addPage()
            yPosition = 15
          }
          yPosition = addMonospaceText(line, margin, yPosition, { fontSize: 7 })
        })
        yPosition += 6
      }
    }

    // Pie Chart Data as Table (if available)
    if (pieData && pieData.length > 0) {
      const pieTableData = pieData
        .slice(0, 8) // Limit to top 8 for space
        .map(item => ({
          name: String(item.name || 'Unknown').substring(0, 12),
          value: getNumericValue(item.value || 0),
          percentage: totalCurrent > 0 ? (getNumericValue(item.value || 0) / totalCurrent * 100) : 0
        }))

      const pieHeaders = ['CATEGORY', 'VALUE', 'PERCENTAGE']
      const pieRows = pieTableData.map(item => [
        item.name,
        formatNumber(item.value).substring(0, 12),
        `${item.percentage.toFixed(1)}%`
      ])

      if (yPosition > pageHeight - 80) {
        pdf.addPage()
        yPosition = 15
      }

      const pieTable = createASCIITable(pieHeaders, pieRows, 'ASSET ALLOCATION BREAKDOWN')
      pieTable.forEach(line => {
        if (yPosition > pageHeight - 15) {
          pdf.addPage()
          yPosition = 15
        }
        yPosition = addMonospaceText(line, margin, yPosition, { fontSize: 7 })
      })
      yPosition += 6
    }

    // Asset Performance Table
    const assetHeaders = ['ASSET_NAME', 'TYPE', 'INITIAL', 'CURRENT', 'RETURN_%', 'STATUS']
    const assetRows = assets.slice(0, 20).map(asset => { // Limit to first 20 assets for space
      const initial = getNumericValue(asset.initial_value)
      const current = getNumericValue(asset.current_value || asset.initial_value)
      const returnPct = initial > 0 ? ((current - initial) / initial * 100) : 0
      
      return [
        (asset.name || 'UNNAMED').substring(0, 12),
        (asset.asset_type || 'UNKNOWN').substring(0, 8),
        formatNumber(initial).substring(0, 10),
        formatNumber(current).substring(0, 10),
        returnPct.toFixed(1),
        returnPct > 0 ? 'PROFIT' : returnPct < 0 ? 'LOSS' : 'NEUTRAL'
      ]
    })

    if (yPosition > pageHeight - 100) {
      pdf.addPage()
      yPosition = 15
    }

    const assetTable = createASCIITable(assetHeaders, assetRows, 'TOP ASSETS PERFORMANCE')
    assetTable.forEach(line => {
      if (yPosition > pageHeight - 15) {
        pdf.addPage()
        yPosition = 15
      }
      yPosition = addMonospaceText(line, margin, yPosition, { fontSize: 7 })
    })
    yPosition += 6

    // Risk Analysis Matrix
    const maxConcentration = Math.max(...aggregateByType.map(type => 
      totalCurrent > 0 ? (getNumericValue(type.presentValue) / totalCurrent) * 100 : 0
    ))
    
    const riskHeaders = ['RISK_FACTOR', 'VALUE', 'ASSESSMENT', 'RECOMMENDATION']
    const riskRows = [
      ['Diversification', chartData.length.toString(), chartData.length >= 5 ? 'GOOD' : 'POOR', chartData.length < 5 ? 'ADD_MORE_CATEGORIES' : 'MAINTAIN'],
      ['Max Concentration', `${maxConcentration.toFixed(1)}%`, maxConcentration > 50 ? 'HIGH_RISK' : 'ACCEPTABLE', maxConcentration > 50 ? 'REBALANCE_NEEDED' : 'MONITOR'],
      ['Total Return', `${totalReturn.toFixed(1)}%`, totalReturn > 10 ? 'STRONG' : 'WEAK', totalReturn < 5 ? 'REVIEW_STRATEGY' : 'CONTINUE'],
      ['Asset Count', assets.length.toString(), assets.length > 15 ? 'HIGH' : 'MODERATE', assets.length < 10 ? 'CONSIDER_EXPANSION' : 'GOOD_SIZE']
    ]

    if (yPosition > pageHeight - 80) {
      pdf.addPage()
      yPosition = 15
    }

    const riskTable = createASCIITable(riskHeaders, riskRows, 'RISK ANALYSIS MATRIX')
    riskTable.forEach(line => {
      if (yPosition > pageHeight - 15) {
        pdf.addPage()
        yPosition = 15
      }
      yPosition = addMonospaceText(line, margin, yPosition, { fontSize: 7 })
    })
    yPosition += 10

    // Add new page for LLM prompts
    pdf.addPage()
    yPosition = 15

    // LLM Analysis Prompts Header
    pdf.setFont('courier', 'bold')
    pdf.setFontSize(12)
    yPosition = addMonospaceText('+===============================================================+', margin, yPosition, { fontSize: 12, bold: true })
    yPosition = addMonospaceText('|                    AI ANALYSIS PROMPTS                       |', margin, yPosition, { fontSize: 12, bold: true })
    yPosition = addMonospaceText('|            Copy-paste these for LLM analysis                 |', margin, yPosition, { fontSize: 12, bold: true })
    yPosition = addMonospaceText('+===============================================================+', margin, yPosition, { fontSize: 12, bold: true })
    yPosition += 8

    const llmPrompts = [
      {
        title: "PORTFOLIO DIVERSIFICATION ANALYSIS",
        prompt: "Analyze this portfolio's diversification using the terminal-style data above. Focus on the portfolio distribution chart, concentration percentages, and risk matrix. Provide specific recommendations for improving diversification balance."
      },
      {
        title: "PERFORMANCE OPTIMIZATION REVIEW",
        prompt: "Review the asset performance table and executive summary metrics. Identify underperforming assets and suggest optimization strategies. Consider the return percentages and status indicators provided."
      },
      {
        title: "RISK ASSESSMENT & MITIGATION",
        prompt: "Using the risk analysis matrix and concentration data, evaluate portfolio risk levels. Recommend specific actions for risk mitigation based on the assessment and recommendation columns."
      },
      {
        title: "REBALANCING STRATEGY",
        prompt: "Based on the portfolio distribution chart and asset performance data, suggest a rebalancing strategy. Include specific percentage allocations and assets to buy/sell/hold."
      },
      {
        title: "COMPREHENSIVE PORTFOLIO AUDIT",
        prompt: "Conduct a full portfolio audit using all the terminal data provided. Cover diversification, performance, risk, and growth potential. Provide actionable recommendations with specific targets and timelines."
      }
    ]

    pdf.setFont('courier', 'normal')
    pdf.setFontSize(8)

    llmPrompts.forEach((promptData, index) => {
      if (yPosition > pageHeight - 40) {
        pdf.addPage()
        yPosition = 15
      }
      
      pdf.setFont('courier', 'bold')
      yPosition = addMonospaceText(`${index + 1}. ${promptData.title}`, margin, yPosition, { fontSize: 8, bold: true })
      yPosition += 2
      
      pdf.setFont('courier', 'normal')
      const promptLines = pdf.splitTextToSize(promptData.prompt, maxWidth - 8)
      promptLines.forEach(line => {
        if (yPosition > pageHeight - 15) {
          pdf.addPage()
          yPosition = 15
        }
        yPosition = addMonospaceText(`   ${line}`, margin, yPosition, { fontSize: 7 })
      })
      yPosition += 6
    })

    // Footer
    if (yPosition > pageHeight - 40) {
      pdf.addPage()
      yPosition = 15
    }
    
    yPosition += 10
    pdf.setFont('courier', 'bold')
    pdf.setFontSize(7)
    const footer = `Generated by Aura Asset Manager v2.0 | ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')} | © ${new Date().getFullYear()}`
    yPosition = addMonospaceText(footer, margin, yPosition, { fontSize: 7, align: 'center' })

    // Generate filename
    const currentDateForFile = format(new Date(), 'yyyy-MM-dd')
    const cleanUserName = userName.replace(/[^a-zA-Z0-9]/g, '_')
    const filename = `Aura_Terminal_Report_${cleanUserName}_${currentDateForFile}.pdf`

    // Save the PDF
    pdf.save(filename)

    return { success: true, filename }
  } catch (error) {
    console.error('Error generating terminal-style PDF:', error)
    throw new Error('Failed to generate terminal-style portfolio report. Please try again.')
  }
}
