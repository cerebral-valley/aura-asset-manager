import React from 'react';
import { AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';
import { getSeverityColor, getSeverityBadgeColor } from '@/utils/assetAllocationRules';
import { useCurrency } from '@/hooks/useCurrency';

/**
 * AllocationAnomalyWriteup Component
 * 
 * Displays detailed writeup of asset allocation anomalies below the matrix
 */
const AllocationAnomalyWriteup = ({ writeup, isLiquid, isDark = false }) => {
  const { formatCurrency } = useCurrency();

  if (!writeup) return null;

  // Perfect allocation - show success message
  if (writeup.hasPerfectAllocation) {
    return (
      <div className={`
        mt-4 p-4 rounded-lg border
        ${isDark 
          ? 'bg-green-900/20 border-green-700/50' 
          : 'bg-green-50 border-green-200'
        }
      `}>
        <div className="flex items-start gap-3">
          <CheckCircle className={`w-5 h-5 flex-shrink-0 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
          <div>
            <h4 className={`font-semibold text-sm ${isDark ? 'text-green-300' : 'text-green-800'}`}>
              {writeup.summary}
            </h4>
            <p className={`text-xs mt-1 ${isDark ? 'text-green-400/80' : 'text-green-700'}`}>
              {writeup.message}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Has anomalies - show detailed breakdown
  return (
    <div className={`
      mt-4 p-4 rounded-lg border
      ${isDark 
        ? 'bg-red-900/20 border-red-700/50' 
        : 'bg-red-50 border-red-200'
      }
    `}>
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <AlertTriangle className={`w-5 h-5 flex-shrink-0 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
        <div className="flex-1">
          <h4 className={`font-semibold text-sm ${isDark ? 'text-red-300' : 'text-red-800'}`}>
            {writeup.summary}
          </h4>
          <p className={`text-xs mt-1 ${isDark ? 'text-red-400/80' : 'text-red-700'}`}>
            {writeup.message}
          </p>
          
          {/* Severity Breakdown */}
          <div className="flex gap-2 mt-2 flex-wrap">
            {writeup.criticalCount > 0 && (
              <span className={`text-xs px-2 py-0.5 rounded-full ${getSeverityBadgeColor('critical')}`}>
                {writeup.criticalCount} Critical
              </span>
            )}
            {writeup.highCount > 0 && (
              <span className={`text-xs px-2 py-0.5 rounded-full ${getSeverityBadgeColor('high')}`}>
                {writeup.highCount} High Priority
              </span>
            )}
            {writeup.mediumCount > 0 && (
              <span className={`text-xs px-2 py-0.5 rounded-full ${getSeverityBadgeColor('medium')}`}>
                {writeup.mediumCount} Medium Priority
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Detailed Anomalies by Purpose */}
      <div className="space-y-3 mt-4">
        {writeup.details.map(({ purpose, anomalies }) => (
          <div 
            key={purpose}
            className={`
              p-3 rounded-lg
              ${isDark 
                ? 'bg-neutral-800/50 border border-neutral-700' 
                : 'bg-white border border-gray-200'
              }
            `}
          >
            {/* Purpose Header */}
            <div className={`font-semibold text-sm mb-2 ${isDark ? 'text-neutral-200' : 'text-gray-800'}`}>
              {purpose}
            </div>

            {/* Anomalies for this purpose */}
            <div className="space-y-2">
              {anomalies.map((anomaly, idx) => (
                <div 
                  key={idx}
                  className={`
                    p-2 rounded border-l-4
                    ${anomaly.severity === 'critical' 
                      ? 'border-l-red-500 bg-red-50/50 dark:bg-red-900/10' 
                      : anomaly.severity === 'high'
                      ? 'border-l-orange-500 bg-orange-50/50 dark:bg-orange-900/10'
                      : 'border-l-yellow-500 bg-yellow-50/50 dark:bg-yellow-900/10'
                    }
                  `}
                >
                  {/* Asset Info */}
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <AlertCircle className={`w-4 h-4 flex-shrink-0 ${getSeverityColor(anomaly.severity)}`} />
                      <span className={`font-medium text-xs ${isDark ? 'text-neutral-200' : 'text-gray-800'}`}>
                        {anomaly.asset.name}
                      </span>
                    </div>
                    <span className={`text-xs font-medium ${isDark ? 'text-neutral-400' : 'text-gray-600'}`}>
                      {formatCurrency(anomaly.asset.current_value || anomaly.asset.initial_value || 0)}
                    </span>
                  </div>

                  {/* Issue Message */}
                  <p className={`text-xs mb-1 ${getSeverityColor(anomaly.severity)}`}>
                    <strong>Issue:</strong> {anomaly.message}
                  </p>

                  {/* Explanation */}
                  <p className={`text-xs mb-1 ${isDark ? 'text-neutral-400' : 'text-gray-600'}`}>
                    <strong>Why:</strong> {anomaly.explanation}
                  </p>

                  {/* Recommendation */}
                  <p className={`text-xs ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>
                    <strong>Recommendation:</strong> {anomaly.recommendation}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Note */}
      <div className={`
        mt-3 pt-3 border-t text-xs
        ${isDark 
          ? 'border-neutral-700 text-neutral-400' 
          : 'border-gray-200 text-gray-600'
        }
      `}>
        <p>
          <strong>Note:</strong> Proper asset allocation ensures your investments align with their intended purpose and time horizon. 
          Review these recommendations to optimize your portfolio strategy.
        </p>
      </div>
    </div>
  );
};

export default AllocationAnomalyWriteup;
