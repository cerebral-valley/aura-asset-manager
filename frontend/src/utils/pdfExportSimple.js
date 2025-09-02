/**
 * Simplified PDF Export Utility for Assets Page
 * Uses a more robust approach to avoid CSS parsing issues
 */

import { jsPDF } from 'jspdf'
import { format } from 'date-fns'

/**
 * Export the Assets page content to PDF using a simpler approach
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
    const margin = 20
    const lineHeight = 6
    const maxWidth = pageWidth - 2 * margin

    // Helper function to add text with automatic page breaks
    const addText = (text, x, y, options = {}) => {
      if (y > pageHeight - 30) {
        pdf.addPage()
        y = 20
      }
      
      pdf.setFontSize(options.fontSize || 10)
      if (options.bold) pdf.setFont('helvetica', 'bold')
      else pdf.setFont('helvetica', 'normal')
      
      pdf.text(text, x, y)
      return y + (options.lineHeight || lineHeight)
    }

    // Helper function to add a table
    const addTable = (headers, rows, startY) => {
      let y = startY
      const colWidth = maxWidth / headers.length
      
      // Check if we need a new page
      if (y + (rows.length + 2) * lineHeight > pageHeight - 30) {
        pdf.addPage()
        y = 20
      }
      
      // Add headers
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(9)
      headers.forEach((header, i) => {
        pdf.text(header, margin + i * colWidth, y)
      })
      y += lineHeight
      
      // Add separator line
      pdf.line(margin, y, pageWidth - margin, y)
      y += 3
      
      // Add rows
      pdf.setFont('helvetica', 'normal')
      rows.forEach(row => {
        if (y > pageHeight - 30) {
          pdf.addPage()
          y = 20
          // Re-add headers on new page
          pdf.setFont('helvetica', 'bold')
          headers.forEach((header, i) => {
            pdf.text(header, margin + i * colWidth, y)
          })
          y += lineHeight
          pdf.line(margin, y, pageWidth - margin, y)
          y += 3
          pdf.setFont('helvetica', 'normal')
        }
        
        row.forEach((cell, i) => {
          const cellText = String(cell).substring(0, 20) // Truncate long text
          pdf.text(cellText, margin + i * colWidth, y)
        })
        y += lineHeight
      })
      
      return y + 10
    }

    // Header
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(20)
    pdf.text('Aura Asset Manager ®™', pageWidth / 2, yPosition, { align: 'center' })
    yPosition += 10
    
    pdf.setFontSize(16)
    pdf.text('Asset Portfolio Report', pageWidth / 2, yPosition, { align: 'center' })
    yPosition += 15
    
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(12)
    const currentDate = format(new Date(), 'MMMM dd, yyyy')
    yPosition = addText(`Account Holder: ${userName || 'N/A'}`, margin, yPosition)
    yPosition = addText(`Report Date: ${currentDate}`, margin, yPosition)
    yPosition = addText(`Currency: ${currency}`, margin, yPosition)
    yPosition += 10

    // Portfolio Summary
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(14)
    yPosition = addText('Portfolio Summary', margin, yPosition, { fontSize: 14, bold: true })
    yPosition += 5
    
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(10)
    yPosition = addText(`Total Acquisition Value: ${formatCurrency(totals.totalAcquisitionValue)}`, margin, yPosition)
    yPosition = addText(`Current Portfolio Value: ${formatCurrency(totals.totalPresentValue)}`, margin, yPosition)
    
    const gainLoss = totals.totalPresentValue - totals.totalAcquisitionValue
    const gainLossPercent = totals.totalAcquisitionValue > 0 ? 
      (((gainLoss) / totals.totalAcquisitionValue) * 100).toFixed(1) : '0.0'
    yPosition = addText(`Total Gain/Loss: ${formatCurrency(gainLoss)} (${gainLossPercent}%)`, margin, yPosition)
    yPosition += 10

    // Asset Distribution by Category
    if (aggregateByType && aggregateByType.length > 0) {
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(14)
      yPosition = addText('Asset Distribution by Category', margin, yPosition, { fontSize: 14, bold: true })
      yPosition += 5
      
      const categoryHeaders = ['Category', 'Acquisition', 'Current', 'Gain/Loss', '% Portfolio', 'Count']
      const categoryRows = aggregateByType.map(category => {
        const catGainLoss = category.presentValue - category.acquisitionValue
        const catGainLossPercent = category.acquisitionValue > 0 ? 
          ((catGainLoss / category.acquisitionValue) * 100).toFixed(1) : '0.0'
        const portfolioPercent = totals.totalPresentValue > 0 ? 
          ((category.presentValue / totals.totalPresentValue) * 100).toFixed(1) : '0.0'
        
        return [
          category.type,
          formatCurrency(category.acquisitionValue),
          formatCurrency(category.presentValue),
          `${formatCurrency(catGainLoss)} (${catGainLossPercent}%)`,
          `${portfolioPercent}%`,
          category.count.toString()
        ]
      })
      
      yPosition = addTable(categoryHeaders, categoryRows, yPosition)
    }

    // Individual Assets
    if (assets && assets.length > 0) {
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(14)
      yPosition = addText(`Individual Assets (${assets.length} total)`, margin, yPosition, { fontSize: 14, bold: true })
      yPosition += 5
      
      const assetHeaders = ['Asset Name', 'Type', 'Purchase Date', 'Quantity', 'Acquisition', 'Current', 'Gain/Loss']
      const assetRows = assets.map(asset => {
        const acquisitionValue = asset.initial_value || 0
        const currentValue = asset.current_value || acquisitionValue
        const assetGainLoss = currentValue - acquisitionValue
        const assetGainLossPercent = acquisitionValue > 0 ? 
          ((assetGainLoss / acquisitionValue) * 100).toFixed(1) : '0.0'
        
        return [
          (asset.name || 'N/A').substring(0, 15),
          (asset.asset_type || 'N/A').substring(0, 10),
          asset.purchase_date ? formatDate(asset.purchase_date) : 'N/A',
          asset.quantity || 'N/A',
          formatCurrency(acquisitionValue),
          formatCurrency(currentValue),
          `${formatCurrency(assetGainLoss)} (${assetGainLossPercent}%)`
        ]
      })
      
      yPosition = addTable(assetHeaders, assetRows, yPosition)
    }

    // Detailed Asset Breakdown
    if (detailedAssetBreakdown && detailedAssetBreakdown.length > 0) {
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(14)
      yPosition = addText('Detailed Asset Breakdown by Type', margin, yPosition, { fontSize: 14, bold: true })
      yPosition += 5
      
      const detailHeaders = ['Asset Type', 'Acquisition', 'Current', 'Count', '% Share']
      const detailRows = detailedAssetBreakdown.map(item => [
        item.assetType,
        formatCurrency(item.acquisitionValue),
        formatCurrency(item.presentValue),
        item.count.toString(),
        `${item.sharePercent?.toFixed(1) || '0.0'}%`
      ])
      
      yPosition = addTable(detailHeaders, detailRows, yPosition)
    }

    // Footer/Disclaimer
    if (yPosition > pageHeight - 60) {
      pdf.addPage()
      yPosition = 20
    }
    
    yPosition += 20
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(10)
    yPosition = addText('Important Disclaimer:', margin, yPosition, { fontSize: 10, bold: true })
    
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(8)
    const disclaimerText = `This report is for personal use only. All information is subject to data entry accuracy and system limitations. Aura Asset Company is not responsible for any inaccuracies in data due to user error or application faults. Asset values and calculations are estimates and may not reflect actual market conditions. Please consult with financial professionals for investment decisions.`
    
    // Split disclaimer text into lines
    const disclaimerLines = pdf.splitTextToSize(disclaimerText, maxWidth)
    disclaimerLines.forEach(line => {
      yPosition = addText(line, margin, yPosition, { fontSize: 8 })
    })
    
    yPosition += 10
    pdf.text(`© ${new Date().getFullYear()} Aura Asset Manager. All rights reserved.`, pageWidth / 2, yPosition, { align: 'center' })

    // Generate filename with current date
    const currentDateForFile = format(new Date(), 'yyyy-MM-dd')
    const filename = `Aura_Asset_Report_${userName.replace(/\s+/g, '_')}_${currentDateForFile}.pdf`

    // Save the PDF
    pdf.save(filename)

    return { success: true, filename }
  } catch (error) {
    console.error('Error generating PDF:', error)
    throw new Error('Failed to generate PDF report. Please try again.')
  }
}
