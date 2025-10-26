import React, { useState, useMemo } from 'react';
import { getAssetPurposeLabel, getUniqueAssetPurposes } from '@/constants/assetPurpose';
import { useCurrency } from '@/hooks/useCurrency';
import { detectAllocationAnomalies, generateAnomalyWriteup } from '@/utils/assetAllocationRules';
import AllocationAnomalyWriteup from './AllocationAnomalyWriteup';

const MatrixChart = ({ 
  assets = [], 
  transactions = [], // Add transactions prop for value calculations
  title = "Asset Matrix", 
  isLiquid = true, 
  isDark = false 
}) => {
  const { formatCurrency } = useCurrency();
  const [hoveredCell, setHoveredCell] = useState(null);

  // Helper function to get the latest value from transactions (same logic as Assets.jsx)
  const getLatestTransactionValue = (asset, valueType = 'current_value') => {
    // Get all transactions for this asset
    const assetTransactions = transactions.filter(t => t.asset_id === asset.id);
    
    if (assetTransactions.length === 0) {
      // Fallback to asset's static values
      return valueType === 'current_value' 
        ? (Number(asset.current_value) || Number(asset.initial_value) || 0)
        : (Number(asset.initial_value) || 0);
    }
    
    // Sort transactions by date (most recent first)
    const sortedTransactions = assetTransactions.sort((a, b) => 
      new Date(b.transaction_date) - new Date(a.transaction_date)
    );
    
    if (valueType === 'current_value') {
      // Look for the latest market value update transaction
      const marketValueTransaction = sortedTransactions.find(t => 
        t.transaction_type === 'update_market_value' && t.amount != null
      );
      
      if (marketValueTransaction) {
        return Number(marketValueTransaction.amount) || 0;
      }
      
      // If no market value update, look for transactions with current_value
      const currentValueTransaction = sortedTransactions.find(t => 
        t.current_value != null && t.current_value > 0
      );
      
      if (currentValueTransaction) {
        return Number(currentValueTransaction.current_value) || 0;
      }
    }
    
    // Final fallback to asset's static values
    return valueType === 'current_value' 
      ? (Number(asset.current_value) || Number(asset.initial_value) || 0)
      : (Number(asset.initial_value) || 0);
  };

  const getPresentValue = (asset) => {
    return getLatestTransactionValue(asset, 'current_value');
  };

  // Time horizon options
  const timeHorizons = [
    { value: 'short_term', label: 'Short Term', description: '< 1 year' },
    { value: 'medium_term', label: 'Medium Term', description: '1-3 years' },
    { value: 'long_term', label: 'Long Term', description: '> 3 years' }
  ];

  // Get unique asset purposes from the data
  const assetPurposes = useMemo(() => {
    return getUniqueAssetPurposes(assets);
  }, [assets]);

  // Filter assets by liquidity status
  const filteredAssets = useMemo(() => {
    return assets.filter(asset => asset.liquid_assets === isLiquid);
  }, [assets, isLiquid]);

  // Detect allocation anomalies
  const anomalies = useMemo(() => {
    return detectAllocationAnomalies(assets, isLiquid);
  }, [assets, isLiquid]);

  // Generate anomaly writeup
  const anomalyWriteup = useMemo(() => {
    return generateAnomalyWriteup(anomalies, isLiquid);
  }, [anomalies, isLiquid]);

  // Calculate total value for percentage calculations
  const totalValue = useMemo(() => {
    return filteredAssets.reduce((sum, asset) => sum + getPresentValue(asset), 0);
  }, [filteredAssets]);

  // Build matrix data
  const matrixData = useMemo(() => {
    const matrix = {};
    
    // Initialize matrix structure
    timeHorizons.forEach(horizon => {
      matrix[horizon.value] = {};
      assetPurposes.forEach(assetPurpose => {
        matrix[horizon.value][assetPurpose] = {
          assets: [],
          count: 0,
          value: 0,
          percentage: 0
        };
      });
    });

    // Populate matrix with asset data
    filteredAssets.forEach(asset => {
      const horizon = asset.time_horizon || 'short_term'; // Default fallback
      const assetPurpose = asset.asset_purpose || 'unspecified'; // Default fallback for assets without purpose
      
      if (matrix[horizon] && matrix[horizon][assetPurpose]) {
        matrix[horizon][assetPurpose].assets.push(asset);
        matrix[horizon][assetPurpose].count++;
        matrix[horizon][assetPurpose].value += getPresentValue(asset); // Use getPresentValue instead of asset.present_value
      }
    });

    // Calculate percentages
    Object.keys(matrix).forEach(horizon => {
      Object.keys(matrix[horizon]).forEach(assetPurpose => {
        const cellData = matrix[horizon][assetPurpose];
        cellData.percentage = totalValue > 0 ? (cellData.value / totalValue) * 100 : 0;
      });
    });

    return matrix;
  }, [filteredAssets, timeHorizons, assetPurposes, totalValue]);

  // Get cell background color based on value
  const getCellColor = (percentage) => {
    if (percentage === 0) return isDark ? 'bg-neutral-800' : 'bg-gray-50';
    if (percentage < 5) return isDark ? 'bg-blue-900/30' : 'bg-blue-100';
    if (percentage < 15) return isDark ? 'bg-blue-800/40' : 'bg-blue-200';
    if (percentage < 30) return isDark ? 'bg-blue-700/50' : 'bg-blue-300';
    return isDark ? 'bg-blue-600/60' : 'bg-blue-400';
  };

  // Get text color based on background
  const getTextColor = (percentage) => {
    if (percentage === 0) return isDark ? 'text-neutral-500' : 'text-gray-400';
    if (percentage < 15) return isDark ? 'text-blue-200' : 'text-blue-800';
    return isDark ? 'text-blue-100' : 'text-white';
  };

  // Handle cell hover
  const handleCellHover = (horizon, assetPurpose) => {
    const cellData = matrixData[horizon]?.[assetPurpose];
    if (cellData && cellData.count > 0) {
      setHoveredCell({
        horizon,
        assetPurpose,
        data: cellData
      });
    }
  };

  // Check if a cell has anomalies
  const getCellAnomalies = (horizon, purpose) => {
    return anomalies.filter(
      a => a.asset.time_horizon === horizon && a.asset.asset_purpose === purpose
    );
  };

  // Get cell border color based on anomalies
  const getCellBorderClass = (cellAnomalies) => {
    if (cellAnomalies.length === 0) return '';
    const hasCritical = cellAnomalies.some(a => a.severity === 'critical');
    const hasHigh = cellAnomalies.some(a => a.severity === 'high');
    
    if (hasCritical) return 'ring-2 ring-red-500 dark:ring-red-400';
    if (hasHigh) return 'ring-2 ring-orange-500 dark:ring-orange-400';
    return 'ring-2 ring-yellow-500 dark:ring-yellow-400';
  };

  return (
    <div className={`${isDark ? 'bg-neutral-900' : 'bg-white'} rounded-lg shadow-lg p-3 relative`}>
      <div className="mb-3">
        <h3 className="text-base font-semibold mb-1">{title}</h3>
        <p className={`text-xs ${isDark ? 'text-neutral-400' : 'text-gray-600'}`}>
          Asset distribution by purpose and time horizon • Total: {formatCurrency(totalValue)}
        </p>
      </div>

      {/* Matrix Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-max">
          {/* Header Row */}
          <div className="grid grid-cols-[120px_repeat(var(--cols),minmax(80px,1fr))] gap-0.5 mb-0.5"
               style={{ '--cols': assetPurposes.length }}>
            <div className="p-1"></div>
            {assetPurposes.map(assetPurpose => {
              const label = getAssetPurposeLabel(assetPurpose);
              
              // Helper function to split labels for better space utilization
              const getWrappedLabel = (text) => {
                const splitPatterns = {
                  "Children's Education": ["Children's", "Education"],
                  "Emergency Fund": ["Emergency", "Fund"],
                  "Financial Security": ["Financial", "Security"],
                  "Retirement Fund": ["Retirement", "Fund"],
                  "Hyper Growth": ["Hyper", "Growth"]
                };
                
                return splitPatterns[text] || [text];
              };
              
              const wrappedLines = getWrappedLabel(label);
              
              return (
                <div key={assetPurpose} 
                     className={`p-1 text-center rounded font-medium text-xs leading-tight ${isDark ? 'bg-neutral-800 text-neutral-300' : 'bg-gray-100 text-gray-700'}`}>
                  <div className="font-semibold text-xs leading-3 flex flex-col items-center justify-center h-8">
                    {wrappedLines.map((line, index) => (
                      <div key={index} className="leading-3">
                        {line}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Matrix Rows */}
          {timeHorizons.map(horizon => (
            <div key={horizon.value} 
                 className="grid grid-cols-[120px_repeat(var(--cols),minmax(80px,1fr))] gap-0.5 mb-0.5"
                 style={{ '--cols': assetPurposes.length }}>
              {/* Row Header */}
              <div className={`p-1 rounded font-medium text-xs ${isDark ? 'bg-neutral-800 text-neutral-300' : 'bg-gray-100 text-gray-700'}`}>
                <div className="font-semibold text-xs leading-3 whitespace-normal break-words">{horizon.label}</div>
                <div className="text-xs opacity-75 mt-0.5 leading-3">{horizon.description}</div>
              </div>

              {/* Matrix Cells */}
              {assetPurposes.map(assetPurpose => {
                const cellData = matrixData[horizon.value]?.[assetPurpose] || { count: 0, value: 0, percentage: 0 };
                const hasData = cellData.count > 0;
                const cellAnomalies = getCellAnomalies(horizon.value, assetPurpose);
                const hasAnomalies = cellAnomalies.length > 0;

                return (
                  <div
                    key={`${horizon.value}-${assetPurpose}`}
                    className={`
                      p-1 rounded cursor-pointer transition-all duration-200 min-h-[45px] flex flex-col justify-center relative
                      ${getCellColor(cellData.percentage)}
                      ${hasData ? 'hover:scale-105 hover:shadow-md' : ''}
                      ${hoveredCell?.horizon === horizon.value && hoveredCell?.assetPurpose === assetPurpose ? 'ring-2 ring-blue-500' : ''}
                      ${hasAnomalies ? getCellBorderClass(cellAnomalies) : ''}
                    `}
                    onMouseEnter={() => hasData && handleCellHover(horizon.value, assetPurpose)}
                    onMouseLeave={() => setHoveredCell(null)}
                  >
                    {/* Anomaly indicator */}
                    {hasAnomalies && (
                      <div className="absolute top-0.5 right-0.5">
                        <div className={`
                          w-2 h-2 rounded-full
                          ${cellAnomalies.some(a => a.severity === 'critical') 
                            ? 'bg-red-500' 
                            : cellAnomalies.some(a => a.severity === 'high')
                            ? 'bg-orange-500'
                            : 'bg-yellow-500'
                          }
                        `} />
                      </div>
                    )}
                    
                    <div className={`text-center ${getTextColor(cellData.percentage)}`}>
                      {hasData ? (
                        <>
                          <div className="font-bold text-sm">{cellData.count}</div>
                          <div className="text-xs font-semibold">{cellData.percentage.toFixed(1)}%</div>
                          <div className="text-xs">{formatCurrency(cellData.value)}</div>
                        </>
                      ) : (
                        <div className="text-xs">-</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Hover Tooltip */}
      {hoveredCell && (
        <div className={`
          absolute z-10 p-4 rounded-lg shadow-xl border max-w-sm
          ${isDark ? 'bg-neutral-800 border-neutral-700 text-white' : 'bg-white border-gray-200 text-gray-900'}
        `}
             style={{
               top: '50%',
               right: '10px',
               transform: 'translateY(-50%)'
             }}>
          <div className="font-semibold mb-2">
            {getAssetPurposeLabel(hoveredCell.assetPurpose)} • {timeHorizons.find(h => h.value === hoveredCell.horizon)?.label}
          </div>
          <div className="space-y-1 text-sm">
            <div>Assets: {hoveredCell.data.count}</div>
            <div>Total Value: {formatCurrency(hoveredCell.data.value)}</div>
            <div>Portfolio Share: {hoveredCell.data.percentage.toFixed(1)}%</div>
          </div>

          {/* Show anomalies in tooltip */}
          {(() => {
            const cellAnomalies = getCellAnomalies(hoveredCell.horizon, hoveredCell.assetPurpose);
            if (cellAnomalies.length > 0) {
              return (
                <div className="mt-3 pt-2 border-t border-red-300 dark:border-red-700">
                  <div className="flex items-center gap-1 text-red-600 dark:text-red-400 font-medium text-xs mb-2">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {cellAnomalies.length} Allocation {cellAnomalies.length === 1 ? 'Issue' : 'Issues'}
                  </div>
                  <div className="text-xs text-red-600 dark:text-red-400">
                    See detailed writeup below the matrix
                  </div>
                </div>
              );
            }
            return null;
          })()}
          
          {hoveredCell.data.assets.length > 0 && (
            <div className="mt-3 pt-2 border-t border-gray-300">
              <div className="font-medium text-xs mb-2">Assets:</div>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {hoveredCell.data.assets.map(asset => (
                  <div key={asset.id} className="text-xs flex justify-between">
                    <span className="truncate mr-2">{asset.name}</span>
                    <span className="font-medium">{formatCurrency(getPresentValue(asset))}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="mt-2 pt-2 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-3">
            <span className={isDark ? 'text-neutral-400' : 'text-gray-600'}>Color intensity represents portfolio share</span>
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded ${isDark ? 'bg-neutral-800' : 'bg-gray-50'}`}></div>
              <span className="text-xs">0%</span>
              <div className={`w-2 h-2 rounded ${isDark ? 'bg-blue-900/30' : 'bg-blue-100'}`}></div>
              <span className="text-xs">&lt;5%</span>
              <div className={`w-2 h-2 rounded ${isDark ? 'bg-blue-700/50' : 'bg-blue-300'}`}></div>
              <span className="text-xs">&lt;30%</span>
              <div className={`w-2 h-2 rounded ${isDark ? 'bg-blue-600/60' : 'bg-blue-400'}`}></div>
              <span className="text-xs">30%+</span>
            </div>
          </div>
          <div className={`text-xs ${isDark ? 'text-neutral-500' : 'text-gray-500'}`}>
            Hover over cells to see detailed breakdown
          </div>
        </div>
      </div>

      {/* Allocation Anomaly Writeup */}
      <AllocationAnomalyWriteup 
        writeup={anomalyWriteup}
        isLiquid={isLiquid}
        isDark={isDark}
      />
    </div>
  );
};

export default MatrixChart;