/**
 * LLM-Optimized PDF Export Utility for Assets Page
 * Creates comprehensive, well-formatted reports for AI analysis
 */

import { jsPDF } from 'jspdf'
import { format } from 'date-fns'

/**
 * Export the Assets page content to an LLM-friendly PDF
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
      formatDate
    } = data

    // Create PDF document
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    
    let yPosition = 20
    const margin = 15
    const lineHeight = 5
    const maxWidth = pageWidth - 2 * margin

    // Helper function to get numeric value from currency
    const getNumericValue = (value) => {
      if (typeof value === 'number') return value
      if (typeof value === 'string') {
        return parseFloat(value.replace(/[^0-9.-]/g, '')) || 0
      }
      return 0
    }

    // Helper function for clean currency formatting without symbols
    const formatCleanCurrency = (amount) => {
      const numAmount = getNumericValue(amount)
      return numAmount.toLocaleString('en-US', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
      })
    }

    // Helper function to add text with automatic page breaks
    const addText = (text, x, y, options = {}) => {
      if (y > pageHeight - 25) {
        pdf.addPage()
        y = 20
      }
      
      pdf.setFontSize(options.fontSize || 10)
      if (options.bold) pdf.setFont('helvetica', 'bold')
      else pdf.setFont('helvetica', 'normal')
      
      if (options.align === 'center') {
        pdf.text(text, pageWidth / 2, y, { align: 'center' })
      } else {
        pdf.text(text, x, y)
      }
      
      return y + (options.lineHeight || lineHeight)
    }

    // Helper function to add structured data section
    const addDataSection = (title, data, startY) => {
      let y = startY
      
      if (y > pageHeight - 40) {
        pdf.addPage()
        y = 20
      }
      
      // Section title
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(12)
      y = addText(title, margin, y, { fontSize: 12, bold: true })
      y += 3
      
      // Add data
      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(10)
      
      if (Array.isArray(data)) {
        data.forEach(item => {
          if (typeof item === 'object') {
            Object.entries(item).forEach(([key, value]) => {
              y = addText(`  ${key}: ${value}`, margin + 5, y)
            })
            y += 2
          } else {
            y = addText(`  ${item}`, margin + 5, y)
          }
        })
      } else if (typeof data === 'object') {
        Object.entries(data).forEach(([key, value]) => {
          y = addText(`  ${key}: ${value}`, margin + 5, y)
        })
      } else {
        y = addText(`  ${data}`, margin + 5, y)
      }
      
      return y + 8
    }

    // Calculate key metrics for analysis
    const totalAcquisition = getNumericValue(totals.totalAcquisitionValue)
    const totalCurrent = getNumericValue(totals.totalPresentValue)
    const totalGainLoss = totalCurrent - totalAcquisition
    const totalReturn = totalAcquisition > 0 ? ((totalGainLoss / totalAcquisition) * 100) : 0
    
    // Diversification metrics
    const assetTypeCount = aggregateByType.filter(type => getNumericValue(type.presentValue) > 0).length
    const maxConcentration = Math.max(...aggregateByType.map(type => 
      totalCurrent > 0 ? (getNumericValue(type.presentValue) / totalCurrent) * 100 : 0
    ))
    
    // Performance analysis
    const positiveAssets = assets.filter(asset => {
      const current = getNumericValue(asset.current_value || asset.initial_value)
      const initial = getNumericValue(asset.initial_value)
      return current > initial
    }).length
    
    const performanceRatio = assets.length > 0 ? (positiveAssets / assets.length) * 100 : 0

    // Header
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(18)
    yPosition = addText('AURA ASSET MANAGER - PORTFOLIO ANALYSIS REPORT', margin, yPosition, 
      { fontSize: 18, bold: true, align: 'center' })
    yPosition += 8
    
    // Document metadata for LLM processing
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(9)
    yPosition = addText('DOCUMENT TYPE: Investment Portfolio Analysis Report', margin, yPosition, { fontSize: 9 })
    yPosition = addText('ANALYSIS DATE: ' + format(new Date(), 'MMMM dd, yyyy'), margin, yPosition, { fontSize: 9 })
    yPosition = addText('CURRENCY: ' + currency, margin, yPosition, { fontSize: 9 })
    yPosition = addText('ACCOUNT HOLDER: ' + userName, margin, yPosition, { fontSize: 9 })
    yPosition += 8

    // Executive Summary for LLM
    yPosition = addDataSection('EXECUTIVE SUMMARY', {
      'Total Portfolio Value': `${currency} ${formatCleanCurrency(totalCurrent)}`,
      'Total Investment Cost': `${currency} ${formatCleanCurrency(totalAcquisition)}`,
      'Absolute Gain/Loss': `${currency} ${formatCleanCurrency(totalGainLoss)}`,
      'Percentage Return': `${totalReturn.toFixed(2)}%`,
      'Asset Categories Count': assetTypeCount,
      'Individual Assets Count': assets.length,
      'Maximum Category Concentration': `${maxConcentration.toFixed(1)}%`,
      'Profitable Assets Ratio': `${performanceRatio.toFixed(1)}%`
    }, yPosition)

    // Portfolio Distribution Analysis
    const distributionData = aggregateByType
      .filter(type => getNumericValue(type.presentValue) > 0)
      .map(type => {
        const value = getNumericValue(type.presentValue)
        const percentage = totalCurrent > 0 ? (value / totalCurrent * 100) : 0
        const acquisitionValue = getNumericValue(type.acquisitionValue)
        const gainLoss = value - acquisitionValue
        const returnPct = acquisitionValue > 0 ? (gainLoss / acquisitionValue * 100) : 0
        
        return {
          'Category': type.type || type.label,
          'Current Value': `${currency} ${formatCleanCurrency(value)}`,
          'Portfolio Weight': `${percentage.toFixed(1)}%`,
          'Return': `${returnPct.toFixed(1)}%`,
          'Asset Count': type.count
        }
      })

    yPosition = addDataSection('PORTFOLIO DISTRIBUTION BY CATEGORY', distributionData, yPosition)

    // Individual Asset Performance
    const assetPerformanceData = assets.map(asset => {
      const current = getNumericValue(asset.current_value || asset.initial_value)
      const initial = getNumericValue(asset.initial_value)
      const gainLoss = current - initial
      const returnPct = initial > 0 ? (gainLoss / initial * 100) : 0
      
      return {
        'Asset Name': asset.name || 'Unnamed Asset',
        'Type': asset.asset_type || 'Unknown',
        'Purchase Date': asset.purchase_date ? formatDate(asset.purchase_date) : 'N/A',
        'Quantity': asset.quantity || 'N/A',
        'Initial Value': `${currency} ${formatCleanCurrency(initial)}`,
        'Current Value': `${currency} ${formatCleanCurrency(current)}`,
        'Gain/Loss': `${currency} ${formatCleanCurrency(gainLoss)}`,
        'Return': `${returnPct.toFixed(1)}%`
      }
    })

    yPosition = addDataSection('INDIVIDUAL ASSET PERFORMANCE', assetPerformanceData, yPosition)

    // Risk Analysis Metrics
    const riskMetrics = {
      'Diversification Score': assetTypeCount >= 5 ? 'High' : assetTypeCount >= 3 ? 'Medium' : 'Low',
      'Concentration Risk': maxConcentration > 50 ? 'High' : maxConcentration > 30 ? 'Medium' : 'Low',
      'Performance Consistency': performanceRatio > 70 ? 'High' : performanceRatio > 50 ? 'Medium' : 'Low',
      'Portfolio Volatility Assessment': 'Requires historical data for detailed analysis'
    }

    yPosition = addDataSection('RISK ANALYSIS METRICS', riskMetrics, yPosition)

    // Add new page for LLM prompts
    pdf.addPage()
    yPosition = 20

    // LLM Analysis Prompts
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(14)
    yPosition = addText('ARTIFICIAL INTELLIGENCE ANALYSIS PROMPTS', margin, yPosition, 
      { fontSize: 14, bold: true, align: 'center' })
    yPosition += 10

    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(9)
    yPosition = addText('The following prompts can be used with AI assistants to analyze this portfolio report:', 
      margin, yPosition, { fontSize: 9 })
    yPosition += 8

    const llmPrompts = [
      {
        title: "PORTFOLIO DIVERSIFICATION ANALYSIS",
        prompt: "Analyze my investment portfolio for diversification effectiveness. Based on the asset categories, concentration percentages, and distribution data provided, assess my diversification level and suggest improvements to reduce concentration risk while maintaining growth potential."
      },
      {
        title: "RISK ASSESSMENT AND MANAGEMENT",
        prompt: "Evaluate the risk profile of my portfolio using the concentration metrics, asset types, and performance data. Identify high-risk positions and suggest risk mitigation strategies. Consider both systematic and unsystematic risks based on my current holdings."
      },
      {
        title: "RETURN OPTIMIZATION RECOMMENDATIONS",
        prompt: "Analyze my portfolio returns across different asset categories and individual holdings. Identify underperforming assets and suggest rebalancing strategies to enhance overall portfolio returns while considering risk tolerance."
      },
      {
        title: "ASSET REBALANCING STRATEGY",
        prompt: "Based on my current portfolio allocation and individual asset performance, recommend which assets I should consider selling, holding, or increasing. Provide specific reasoning for each recommendation considering market conditions and portfolio balance."
      },
      {
        title: "PERFORMANCE BENCHMARKING",
        prompt: "Compare my portfolio performance against relevant market benchmarks. Analyze the return percentages of different asset categories and suggest whether my performance is satisfactory or requires strategic adjustments."
      },
      {
        title: "COMPREHENSIVE PORTFOLIO REVIEW",
        prompt: "Conduct a comprehensive analysis of my investment portfolio covering diversification, risk management, return optimization, and growth potential. Provide actionable recommendations for improving my investment strategy and achieving better long-term financial outcomes."
      }
    ]

    llmPrompts.forEach((promptData, index) => {
      if (yPosition > pageHeight - 50) {
        pdf.addPage()
        yPosition = 20
      }
      
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(10)
      yPosition = addText(`${index + 1}. ${promptData.title}`, margin, yPosition, { fontSize: 10, bold: true })
      yPosition += 3
      
      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(9)
      const promptLines = pdf.splitTextToSize(promptData.prompt, maxWidth - 10)
      promptLines.forEach(line => {
        if (yPosition > pageHeight - 25) {
          pdf.addPage()
          yPosition = 20
        }
        yPosition = addText(line, margin + 5, yPosition, { fontSize: 9 })
      })
      yPosition += 8
    })

    // Additional AI Instructions
    if (yPosition > pageHeight - 60) {
      pdf.addPage()
      yPosition = 20
    }

    yPosition += 10
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(10)
    yPosition = addText('ADDITIONAL AI ANALYSIS INSTRUCTIONS:', margin, yPosition, { fontSize: 10, bold: true })
    yPosition += 5

    const aiInstructions = [
      "When analyzing this portfolio, consider current market conditions and economic factors.",
      "Provide specific, actionable recommendations rather than general advice.",
      "Consider the investor's apparent risk tolerance based on current asset allocation.",
      "Suggest specific percentage allocations for rebalancing recommendations.",
      "Include both short-term tactical and long-term strategic suggestions.",
      "Address tax implications when recommending asset sales or purchases.",
      "Consider the correlation between different asset categories in the portfolio."
    ]

    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(9)
    aiInstructions.forEach(instruction => {
      yPosition = addText(`• ${instruction}`, margin + 5, yPosition, { fontSize: 9 })
    })

    // Disclaimer
    yPosition += 15
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(8)
    yPosition = addText('IMPORTANT DISCLAIMER:', margin, yPosition, { fontSize: 8, bold: true })
    
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(7)
    const disclaimerText = `This report is for informational purposes only and should not be considered as financial advice. All data is subject to accuracy of user input. Past performance does not guarantee future results. Please consult with qualified financial professionals before making investment decisions. Aura Asset Manager is not responsible for investment losses or decisions based on this analysis.`
    
    const disclaimerLines = pdf.splitTextToSize(disclaimerText, maxWidth)
    disclaimerLines.forEach(line => {
      yPosition = addText(line, margin, yPosition, { fontSize: 7 })
    })
    
    yPosition += 8
    pdf.text(`© ${new Date().getFullYear()} Aura Asset Manager. All rights reserved.`, pageWidth / 2, yPosition, { align: 'center' })

    // Generate filename with current date
    const currentDateForFile = format(new Date(), 'yyyy-MM-dd')
    const cleanUserName = userName.replace(/[^a-zA-Z0-9]/g, '_')
    const filename = `Aura_Portfolio_Analysis_${cleanUserName}_${currentDateForFile}.pdf`

    // Save the PDF
    pdf.save(filename)

    return { success: true, filename }
  } catch (error) {
    console.error('Error generating PDF:', error)
    throw new Error('Failed to generate portfolio analysis report. Please try again.')
  }
}
