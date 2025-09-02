/**
 * PDF Export Utility for Assets Page
 * Generates a comprehensive PDF report of all assets with proper formatting and styling
 */

import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'
import { format } from 'date-fns'

/**
 * Export the Assets page content to PDF
 * @param {Object} data - The data object containing all necessary information
 * @param {string} data.userName - Full name of the user (first_name + last_name)
 * @param {Array} data.assets - Array of filtered and sorted assets
 * @param {Array} data.aggregateByType - Aggregated asset data by type
 * @param {Object} data.totals - Total acquisition and present values
 * @param {Array} data.detailedAssetBreakdown - Detailed breakdown by asset type
 * @param {string} data.currency - User's preferred currency
 * @param {Function} data.formatCurrency - Currency formatting function
 * @param {Function} data.formatDate - Date formatting function
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

    // Create a temporary container for PDF content
    const pdfContainer = document.createElement('div')
    pdfContainer.style.position = 'absolute'
    pdfContainer.style.left = '-9999px'
    pdfContainer.style.top = '0'
    pdfContainer.style.width = '800px'
    pdfContainer.style.backgroundColor = '#ffffff'
    pdfContainer.style.padding = '40px'
    pdfContainer.style.fontFamily = 'Arial, Helvetica, sans-serif'
    pdfContainer.style.fontSize = '12px'
    pdfContainer.style.lineHeight = '1.4'
    pdfContainer.style.color = '#000000'
    pdfContainer.style.boxSizing = 'border-box'
    
    // Disable any CSS animations or transitions
    pdfContainer.style.animation = 'none'
    pdfContainer.style.transition = 'none'

    // Generate PDF content HTML
    pdfContainer.innerHTML = generatePDFContent({
      userName,
      assets,
      aggregateByType,
      totals,
      detailedAssetBreakdown,
      currency,
      formatCurrency,
      formatDate
    })

    // Append to body temporarily
    document.body.appendChild(pdfContainer)

    // Convert to canvas with high quality
    const canvas = await html2canvas(pdfContainer, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: 800,
      windowWidth: 800,
      ignoreElements: (element) => {
        // Ignore elements that might cause parsing issues
        return element.classList?.contains('ignore-pdf') || false
      },
      onclone: (clonedDoc) => {
        // Ensure all elements are visible and properly styled
        const clonedContainer = clonedDoc.querySelector('div')
        if (clonedContainer) {
          clonedContainer.style.position = 'static'
          clonedContainer.style.left = 'auto'
          clonedContainer.style.visibility = 'visible'
        }
        
        // Fix modern CSS color functions that html2canvas can't parse
        const allElements = clonedDoc.querySelectorAll('*')
        allElements.forEach(el => {
          const computedStyle = window.getComputedStyle(el)
          
          // Replace problematic CSS properties with safe alternatives
          try {
            // Force basic colors and remove problematic CSS
            el.style.cssText = ''
            el.style.fontFamily = 'Arial, sans-serif'
            el.style.color = '#000000'
            el.style.backgroundColor = el.style.backgroundColor || 'transparent'
            
            // Copy only safe CSS properties
            if (el.tagName === 'TABLE' || el.tagName === 'TD' || el.tagName === 'TH') {
              el.style.border = '1px solid #cccccc'
              el.style.borderCollapse = 'collapse'
              el.style.padding = '8px'
            }
            
            if (el.tagName === 'TH') {
              el.style.backgroundColor = '#f1f5f9'
              el.style.fontWeight = 'bold'
            }
            
            // Remove any transform or modern CSS that might cause issues
            el.style.transform = 'none'
            el.style.filter = 'none'
            el.style.backdropFilter = 'none'
            
          } catch (e) {
            // If there's any error in style processing, ignore it
            console.warn('CSS processing warning:', e)
          }
        })
      }
    })

    // Remove temporary container
    document.body.removeChild(pdfContainer)

    // Create PDF
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = pdf.internal.pageSize.getHeight()
    
    const canvasWidth = canvas.width
    const canvasHeight = canvas.height
    
    // Calculate dimensions to fit the page
    const ratio = Math.min(pdfWidth / (canvasWidth * 0.264583), pdfHeight / (canvasHeight * 0.264583))
    const imgWidth = canvasWidth * 0.264583 * ratio
    const imgHeight = canvasHeight * 0.264583 * ratio
    
    // Center the content
    const x = (pdfWidth - imgWidth) / 2
    const y = 10 // Small margin from top

    // If content is too tall for one page, we'll need to split it
    if (imgHeight > pdfHeight - 20) {
      await generateMultiPagePDF(pdf, canvas, pdfWidth, pdfHeight)
    } else {
      // Add image to PDF
      const imgData = canvas.toDataURL('image/png', 1.0)
      pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight)
    }

    // Generate filename with current date
    const currentDate = format(new Date(), 'yyyy-MM-dd')
    const filename = `Aura_Asset_Report_${userName.replace(/\s+/g, '_')}_${currentDate}.pdf`

    // Save the PDF
    pdf.save(filename)

    return { success: true, filename }
  } catch (error) {
    console.error('Error generating PDF:', error)
    throw new Error('Failed to generate PDF report. Please try again.')
  }
}

/**
 * Generate multi-page PDF for large content
 */
const generateMultiPagePDF = async (pdf, canvas, pdfWidth, pdfHeight) => {
  const imgData = canvas.toDataURL('image/png', 1.0)
  const canvasWidth = canvas.width
  const canvasHeight = canvas.height
  
  // Calculate how many pages we need
  const pageHeight = pdfHeight - 20 // Leave margin
  const canvasHeightMM = canvasHeight * 0.264583
  const ratio = pdfWidth / (canvasWidth * 0.264583)
  const scaledHeight = canvasHeightMM * ratio
  
  const totalPages = Math.ceil(scaledHeight / pageHeight)
  
  for (let page = 0; page < totalPages; page++) {
    if (page > 0) {
      pdf.addPage()
    }
    
    const yOffset = -page * pageHeight
    const imgWidth = pdfWidth
    const imgHeight = scaledHeight
    
    pdf.addImage(imgData, 'PNG', 0, yOffset + 10, imgWidth, imgHeight)
  }
}

/**
 * Generate the HTML content for the PDF
 */
const generatePDFContent = ({
  userName,
  assets,
  aggregateByType,
  totals,
  detailedAssetBreakdown,
  currency,
  formatCurrency,
  formatDate
}) => {
  const currentDate = format(new Date(), 'MMMM dd, yyyy')
  
  return `
    <div style="max-width: 800px; margin: 0 auto; background: white; color: black;">
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 20px;">
        <h1 style="font-size: 24px; font-weight: bold; margin: 0 0 10px 0; color: #000;">
          Aura Asset Manager<sup style="font-size: 10px;">®™</sup>
        </h1>
        <h2 style="font-size: 18px; font-weight: normal; margin: 0 0 15px 0; color: #333;">
          Asset Portfolio Report
        </h2>
        <div style="font-size: 14px; color: #666;">
          <div><strong>Account Holder:</strong> ${userName || 'N/A'}</div>
          <div><strong>Report Date:</strong> ${currentDate}</div>
          <div><strong>Currency:</strong> ${currency}</div>
        </div>
      </div>

      <!-- Portfolio Summary -->
      <div style="margin-bottom: 30px;">
        <h3 style="font-size: 16px; font-weight: bold; margin: 0 0 15px 0; color: #000; border-bottom: 1px solid #ccc; padding-bottom: 5px;">
          Portfolio Summary
        </h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
          <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; border: 1px solid #ddd;">
            <div style="font-weight: bold; color: #333; margin-bottom: 5px;">Total Acquisition Value</div>
            <div style="font-size: 18px; font-weight: bold; color: #000;">${formatCurrency(totals.totalAcquisitionValue)}</div>
          </div>
          <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; border: 1px solid #ddd;">
            <div style="font-weight: bold; color: #333; margin-bottom: 5px;">Current Portfolio Value</div>
            <div style="font-size: 18px; font-weight: bold; color: #000;">${formatCurrency(totals.totalPresentValue)}</div>
          </div>
        </div>
        <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; border: 1px solid #ddd;">
          <div style="font-weight: bold; color: #333; margin-bottom: 5px;">Total Gain/Loss</div>
          <div style="font-size: 16px; font-weight: bold; color: ${totals.totalPresentValue >= totals.totalAcquisitionValue ? '#16a34a' : '#dc2626'};">
            ${formatCurrency(totals.totalPresentValue - totals.totalAcquisitionValue)} 
            (${(((totals.totalPresentValue - totals.totalAcquisitionValue) / totals.totalAcquisitionValue) * 100).toFixed(1)}%)
          </div>
        </div>
      </div>

      <!-- Asset Aggregates by Type -->
      <div style="margin-bottom: 30px;">
        <h3 style="font-size: 16px; font-weight: bold; margin: 0 0 15px 0; color: #000; border-bottom: 1px solid #ccc; padding-bottom: 5px;">
          Asset Distribution by Category
        </h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
          <thead>
            <tr style="background: #f1f5f9; border: 1px solid #ccc;">
              <th style="padding: 8px; text-align: left; font-weight: bold; border: 1px solid #ccc;">Category</th>
              <th style="padding: 8px; text-align: right; font-weight: bold; border: 1px solid #ccc;">Acquisition Value</th>
              <th style="padding: 8px; text-align: right; font-weight: bold; border: 1px solid #ccc;">Current Value</th>
              <th style="padding: 8px; text-align: right; font-weight: bold; border: 1px solid #ccc;">Gain/Loss</th>
              <th style="padding: 8px; text-align: right; font-weight: bold; border: 1px solid #ccc;">% of Portfolio</th>
              <th style="padding: 8px; text-align: center; font-weight: bold; border: 1px solid #ccc;">Count</th>
            </tr>
          </thead>
          <tbody>
            ${aggregateByType.map(category => {
              const gainLoss = category.presentValue - category.acquisitionValue
              const gainLossPercent = category.acquisitionValue > 0 ? ((gainLoss / category.acquisitionValue) * 100).toFixed(1) : '0.0'
              const portfolioPercent = totals.totalPresentValue > 0 ? ((category.presentValue / totals.totalPresentValue) * 100).toFixed(1) : '0.0'
              
              return `
                <tr style="border: 1px solid #ccc;">
                  <td style="padding: 8px; border: 1px solid #ccc;">${category.type}</td>
                  <td style="padding: 8px; text-align: right; border: 1px solid #ccc;">${formatCurrency(category.acquisitionValue)}</td>
                  <td style="padding: 8px; text-align: right; border: 1px solid #ccc;">${formatCurrency(category.presentValue)}</td>
                  <td style="padding: 8px; text-align: right; border: 1px solid #ccc; color: ${gainLoss >= 0 ? '#16a34a' : '#dc2626'};">
                    ${formatCurrency(gainLoss)} (${gainLossPercent}%)
                  </td>
                  <td style="padding: 8px; text-align: right; border: 1px solid #ccc;">${portfolioPercent}%</td>
                  <td style="padding: 8px; text-align: center; border: 1px solid #ccc;">${category.count}</td>
                </tr>
              `
            }).join('')}
          </tbody>
        </table>
      </div>

      <!-- Individual Assets Table -->
      <div style="margin-bottom: 30px;">
        <h3 style="font-size: 16px; font-weight: bold; margin: 0 0 15px 0; color: #000; border-bottom: 1px solid #ccc; padding-bottom: 5px;">
          Individual Assets (${assets.length} total)
        </h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 10px;">
          <thead>
            <tr style="background: #f1f5f9; border: 1px solid #ccc;">
              <th style="padding: 6px; text-align: left; font-weight: bold; border: 1px solid #ccc;">Asset Name</th>
              <th style="padding: 6px; text-align: left; font-weight: bold; border: 1px solid #ccc;">Type</th>
              <th style="padding: 6px; text-align: center; font-weight: bold; border: 1px solid #ccc;">Purchase Date</th>
              <th style="padding: 6px; text-align: right; font-weight: bold; border: 1px solid #ccc;">Quantity</th>
              <th style="padding: 6px; text-align: right; font-weight: bold; border: 1px solid #ccc;">Acquisition Value</th>
              <th style="padding: 6px; text-align: right; font-weight: bold; border: 1px solid #ccc;">Current Value</th>
              <th style="padding: 6px; text-align: right; font-weight: bold; border: 1px solid #ccc;">Gain/Loss</th>
            </tr>
          </thead>
          <tbody>
            ${assets.map(asset => {
              const acquisitionValue = asset.initial_value || 0
              const currentValue = asset.current_value || acquisitionValue
              const gainLoss = currentValue - acquisitionValue
              const gainLossPercent = acquisitionValue > 0 ? ((gainLoss / acquisitionValue) * 100).toFixed(1) : '0.0'
              
              return `
                <tr style="border: 1px solid #ccc;">
                  <td style="padding: 6px; border: 1px solid #ccc; font-weight: 500;">${asset.name || 'N/A'}</td>
                  <td style="padding: 6px; border: 1px solid #ccc;">${asset.asset_type || 'N/A'}</td>
                  <td style="padding: 6px; text-align: center; border: 1px solid #ccc;">${asset.purchase_date ? formatDate(asset.purchase_date) : 'N/A'}</td>
                  <td style="padding: 6px; text-align: right; border: 1px solid #ccc;">${asset.quantity || 'N/A'}</td>
                  <td style="padding: 6px; text-align: right; border: 1px solid #ccc;">${formatCurrency(acquisitionValue)}</td>
                  <td style="padding: 6px; text-align: right; border: 1px solid #ccc;">${formatCurrency(currentValue)}</td>
                  <td style="padding: 6px; text-align: right; border: 1px solid #ccc; color: ${gainLoss >= 0 ? '#16a34a' : '#dc2626'};">
                    ${formatCurrency(gainLoss)} (${gainLossPercent}%)
                  </td>
                </tr>
              `
            }).join('')}
          </tbody>
        </table>
      </div>

      <!-- Detailed Asset Breakdown -->
      ${detailedAssetBreakdown && detailedAssetBreakdown.length > 0 ? `
        <div style="margin-bottom: 30px;">
          <h3 style="font-size: 16px; font-weight: bold; margin: 0 0 15px 0; color: #000; border-bottom: 1px solid #ccc; padding-bottom: 5px;">
            Detailed Asset Breakdown by Type
          </h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
            <thead>
              <tr style="background: #f1f5f9; border: 1px solid #ccc;">
                <th style="padding: 8px; text-align: left; font-weight: bold; border: 1px solid #ccc;">Asset Type</th>
                <th style="padding: 8px; text-align: right; font-weight: bold; border: 1px solid #ccc;">Acquisition Value</th>
                <th style="padding: 8px; text-align: right; font-weight: bold; border: 1px solid #ccc;">Current Value</th>
                <th style="padding: 8px; text-align: center; font-weight: bold; border: 1px solid #ccc;">Count</th>
                <th style="padding: 8px; text-align: right; font-weight: bold; border: 1px solid #ccc;">% Share</th>
              </tr>
            </thead>
            <tbody>
              ${detailedAssetBreakdown.map(item => `
                <tr style="border: 1px solid #ccc;">
                  <td style="padding: 8px; border: 1px solid #ccc;">${item.assetType}</td>
                  <td style="padding: 8px; text-align: right; border: 1px solid #ccc;">${formatCurrency(item.acquisitionValue)}</td>
                  <td style="padding: 8px; text-align: right; border: 1px solid #ccc;">${formatCurrency(item.presentValue)}</td>
                  <td style="padding: 8px; text-align: center; border: 1px solid #ccc;">${item.count}</td>
                  <td style="padding: 8px; text-align: right; border: 1px solid #ccc;">${item.sharePercent?.toFixed(1) || '0.0'}%</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      ` : ''}

      <!-- Footer/Disclaimer -->
      <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ccc; font-size: 10px; color: #666; text-align: center;">
        <div style="margin-bottom: 10px;">
          <strong>Important Disclaimer:</strong>
        </div>
        <div style="line-height: 1.6;">
          This report is for personal use only. All information is subject to data entry accuracy and system limitations. 
          Aura Asset Company is not responsible for any inaccuracies in data due to user error or application faults. 
          Asset values and calculations are estimates and may not reflect actual market conditions. 
          Please consult with financial professionals for investment decisions.
        </div>
        <div style="margin-top: 15px; font-size: 9px;">
          © ${new Date().getFullYear()} Aura Asset Manager. All rights reserved. This document contains confidential information.
        </div>
      </div>
    </div>
  `
}
