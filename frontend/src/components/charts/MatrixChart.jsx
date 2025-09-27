import React, { useState, useMemo } from 'react';
import { getAssetTypeLabel } from '@/constants/assetTypes';
import { useCurrency } from '@/hooks/useCurrency';

const MatrixChart = ({ 
  assets = [], 
  title = "Asset Matrix", 
  isLiquid = true, 
  isDark = false 
}) => {
  const { formatCurrency } = useCurrency();
  const [hoveredCell, setHoveredCell] = useState(null);

  // Time horizon options
  const timeHorizons = [
    { value: 'short_term', label: 'Short Term', description: '< 1 year' },
    { value: 'medium_term', label: 'Medium Term', description: '1-3 years' },
    { value: 'long_term', label: 'Long Term', description: '> 3 years' }
  ];

  // Get unique asset types from the data
  const assetTypes = useMemo(() => {
    const types = [...new Set(assets.map(asset => asset.asset_type))];
    return types.sort();
  }, [assets]);

  // Filter assets by liquidity status
  const filteredAssets = useMemo(() => {
    return assets.filter(asset => asset.liquid_assets === isLiquid);
  }, [assets, isLiquid]);

  // Calculate total value for percentage calculations
  const totalValue = useMemo(() => {
    return filteredAssets.reduce((sum, asset) => sum + (asset.present_value || 0), 0);
  }, [filteredAssets]);

  // Build matrix data
  const matrixData = useMemo(() => {
    const matrix = {};
    
    // Initialize matrix structure
    timeHorizons.forEach(horizon => {
      matrix[horizon.value] = {};
      assetTypes.forEach(assetType => {
        matrix[horizon.value][assetType] = {
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
      const assetType = asset.asset_type;
      
      if (matrix[horizon] && matrix[horizon][assetType]) {
        matrix[horizon][assetType].assets.push(asset);
        matrix[horizon][assetType].count++;
        matrix[horizon][assetType].value += asset.present_value || 0;
      }
    });

    // Calculate percentages
    Object.keys(matrix).forEach(horizon => {
      Object.keys(matrix[horizon]).forEach(assetType => {
        const cellData = matrix[horizon][assetType];
        cellData.percentage = totalValue > 0 ? (cellData.value / totalValue) * 100 : 0;
      });
    });

    return matrix;
  }, [filteredAssets, timeHorizons, assetTypes, totalValue]);

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
  const handleCellHover = (horizon, assetType) => {
    const cellData = matrixData[horizon]?.[assetType];
    if (cellData && cellData.count > 0) {
      setHoveredCell({
        horizon,
        assetType,
        data: cellData
      });
    }
  };

  return (
    <div className={`${isDark ? 'bg-neutral-900' : 'bg-white'} rounded-lg shadow-lg p-6 relative`}>
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className={`text-sm ${isDark ? 'text-neutral-400' : 'text-gray-600'}`}>
          Asset distribution by type and time horizon • Total: {formatCurrency(totalValue)}
        </p>
      </div>

      {/* Matrix Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-max">
          {/* Header Row */}
          <div className="grid grid-cols-[200px_repeat(var(--cols),1fr)] gap-2 mb-2"
               style={{ '--cols': assetTypes.length }}>
            <div className="p-3"></div>
            {assetTypes.map(assetType => (
              <div key={assetType} 
                   className={`p-3 text-center rounded-md font-medium text-sm ${isDark ? 'bg-neutral-800 text-neutral-300' : 'bg-gray-100 text-gray-700'}`}>
                <div className="font-semibold">{getAssetTypeLabel(assetType)}</div>
              </div>
            ))}
          </div>

          {/* Matrix Rows */}
          {timeHorizons.map(horizon => (
            <div key={horizon.value} 
                 className="grid grid-cols-[200px_repeat(var(--cols),1fr)] gap-2 mb-2"
                 style={{ '--cols': assetTypes.length }}>
              {/* Row Header */}
              <div className={`p-3 rounded-md font-medium ${isDark ? 'bg-neutral-800 text-neutral-300' : 'bg-gray-100 text-gray-700'}`}>
                <div className="font-semibold text-sm">{horizon.label}</div>
                <div className="text-xs opacity-75">{horizon.description}</div>
              </div>

              {/* Matrix Cells */}
              {assetTypes.map(assetType => {
                const cellData = matrixData[horizon.value]?.[assetType] || { count: 0, value: 0, percentage: 0 };
                const hasData = cellData.count > 0;

                return (
                  <div
                    key={`${horizon.value}-${assetType}`}
                    className={`
                      p-4 rounded-md cursor-pointer transition-all duration-200 
                      ${getCellColor(cellData.percentage)}
                      ${hasData ? 'hover:scale-105 hover:shadow-md' : ''}
                      ${hoveredCell?.horizon === horizon.value && hoveredCell?.assetType === assetType ? 'ring-2 ring-blue-500' : ''}
                    `}
                    onMouseEnter={() => hasData && handleCellHover(horizon.value, assetType)}
                    onMouseLeave={() => setHoveredCell(null)}
                  >
                    <div className={`text-center ${getTextColor(cellData.percentage)}`}>
                      {hasData ? (
                        <>
                          <div className="font-bold text-lg">{cellData.count}</div>
                          <div className="text-xs font-semibold">{cellData.percentage.toFixed(1)}%</div>
                          <div className="text-xs mt-1">{formatCurrency(cellData.value)}</div>
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
            {getAssetTypeLabel(hoveredCell.assetType)} • {timeHorizons.find(h => h.value === hoveredCell.horizon)?.label}
          </div>
          <div className="space-y-1 text-sm">
            <div>Assets: {hoveredCell.data.count}</div>
            <div>Total Value: {formatCurrency(hoveredCell.data.value)}</div>
            <div>Portfolio Share: {hoveredCell.data.percentage.toFixed(1)}%</div>
          </div>
          
          {hoveredCell.data.assets.length > 0 && (
            <div className="mt-3 pt-2 border-t border-gray-300">
              <div className="font-medium text-xs mb-2">Assets:</div>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {hoveredCell.data.assets.map(asset => (
                  <div key={asset.id} className="text-xs flex justify-between">
                    <span className="truncate mr-2">{asset.name}</span>
                    <span className="font-medium">{formatCurrency(asset.present_value || 0)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <span className={isDark ? 'text-neutral-400' : 'text-gray-600'}>Color intensity represents portfolio share</span>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded ${isDark ? 'bg-neutral-800' : 'bg-gray-50'}`}></div>
              <span className="text-xs">0%</span>
              <div className={`w-3 h-3 rounded ${isDark ? 'bg-blue-900/30' : 'bg-blue-100'}`}></div>
              <span className="text-xs">&lt;5%</span>
              <div className={`w-3 h-3 rounded ${isDark ? 'bg-blue-700/50' : 'bg-blue-300'}`}></div>
              <span className="text-xs">&lt;30%</span>
              <div className={`w-3 h-3 rounded ${isDark ? 'bg-blue-600/60' : 'bg-blue-400'}`}></div>
              <span className="text-xs">30%+</span>
            </div>
          </div>
          <div className={`text-xs ${isDark ? 'text-neutral-500' : 'text-gray-500'}`}>
            Hover over cells to see detailed breakdown
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatrixChart;