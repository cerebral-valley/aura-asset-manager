/**
 * Asset Allocation Rules and Anomaly Detection
 * 
 * This module defines validation rules for proper asset allocation across
 * liquidity types and time horizons, and detects misallocations.
 */

/**
 * Allocation rules for liquid assets
 */
export const LIQUID_ASSET_RULES = {
  childrens_education: {
    allowedHorizons: ['long_term'],
    reason: "Children's education is a long-term goal requiring stable, growth-oriented investments"
  },
  speculation: {
    allowedHorizons: ['short_term'],
    reason: "Speculative investments should only be short-term to minimize risk exposure"
  },
  financial_security: {
    allowedHorizons: ['long_term'],
    reason: "Financial security requires long-term stability and compound growth"
  },
  hyper_growth: {
    allowedHorizons: ['long_term'],
    reason: "Hyper growth strategies need long-term horizons to realize full potential"
  },
  retirement_fund: {
    allowedHorizons: ['long_term'],
    reason: "Retirement planning demands long-term investment strategies"
  },
  emergency_fund: {
    allowedHorizons: ['short_term'],
    reason: "Emergency funds must be immediately accessible for urgent needs"
  },
  growth: {
    allowedHorizons: ['short_term', 'medium_term', 'long_term'],
    reason: "Growth investments can span any time horizon based on strategy"
  }
};

/**
 * Allocation rules for illiquid assets
 */
export const ILLIQUID_ASSET_RULES = {
  // Illiquid assets should NEVER be short-term
  _general: {
    forbiddenHorizons: ['short_term'],
    reason: "Illiquid assets cannot provide short-term liquidity by definition"
  },
  childrens_education: {
    allowedHorizons: ['long_term'],
    reason: "Children's education requires long-term planning, even in illiquid assets"
  },
  speculation: {
    allowedHorizons: ['medium_term', 'long_term'],
    reason: "Speculative illiquid assets need time to mature and find buyers"
  },
  financial_security: {
    allowedHorizons: ['long_term'],
    reason: "Financial security through illiquid assets requires long-term commitment"
  },
  hyper_growth: {
    allowedHorizons: ['long_term'],
    reason: "Hyper growth in illiquid markets needs extended time horizons"
  },
  retirement_fund: {
    allowedHorizons: ['long_term'],
    reason: "Retirement investments in illiquid assets must be long-term"
  },
  emergency_fund: {
    allowedHorizons: [], // No valid horizons - should never be illiquid
    reason: "Emergency funds must NEVER be in illiquid assets - they need immediate accessibility"
  },
  growth: {
    allowedHorizons: ['medium_term', 'long_term'],
    reason: "Growth strategies in illiquid assets require medium to long-term horizons"
  }
};

/**
 * Time horizon labels for human-readable messages
 */
const TIME_HORIZON_LABELS = {
  short_term: 'Short Term (< 1 year)',
  medium_term: 'Medium Term (1-3 years)',
  long_term: 'Long Term (> 3 years)'
};

/**
 * Asset purpose labels for human-readable messages
 */
const PURPOSE_LABELS = {
  childrens_education: "Children's Education",
  speculation: "Speculation",
  financial_security: "Financial Security",
  hyper_growth: "Hyper Growth",
  retirement_fund: "Retirement Fund",
  emergency_fund: "Emergency Fund",
  growth: "Growth"
};

/**
 * Detect anomalies in asset allocation
 * 
 * @param {Array} assets - Array of assets to check
 * @param {boolean} isLiquid - Whether checking liquid or illiquid assets
 * @returns {Array} Array of anomaly objects with details
 */
export const detectAllocationAnomalies = (assets, isLiquid) => {
  const anomalies = [];
  const rules = isLiquid ? LIQUID_ASSET_RULES : ILLIQUID_ASSET_RULES;

  // Filter assets by liquidity
  const filteredAssets = assets.filter(asset => asset.liquid_assets === isLiquid);

  filteredAssets.forEach(asset => {
    const purpose = asset.asset_purpose;
    const horizon = asset.time_horizon;

    if (!purpose || !horizon) return; // Skip assets without purpose or horizon

    // Check general rule for illiquid assets (no short-term allowed)
    if (!isLiquid && horizon === 'short_term') {
      anomalies.push({
        asset,
        severity: 'critical',
        type: 'time_horizon_violation',
        message: `${asset.name} is allocated as Short Term in illiquid assets`,
        explanation: 'Illiquid assets cannot provide short-term liquidity by definition. This asset should be moved to Medium or Long Term, or converted to a liquid asset.',
        recommendation: 'Change time horizon to Medium Term or Long Term, or convert to liquid asset if short-term access is needed'
      });
    }

    // Check purpose-specific rules
    const rule = rules[purpose];
    if (rule) {
      // Check if horizon is allowed for this purpose
      if (rule.allowedHorizons && !rule.allowedHorizons.includes(horizon)) {
        const purposeLabel = PURPOSE_LABELS[purpose] || purpose;
        const horizonLabel = TIME_HORIZON_LABELS[horizon] || horizon;
        const allowedLabels = rule.allowedHorizons.map(h => TIME_HORIZON_LABELS[h] || h).join(', ');

        anomalies.push({
          asset,
          severity: rule.allowedHorizons.length === 0 ? 'critical' : 'high',
          type: 'mismatched_horizon',
          message: `${asset.name} (${purposeLabel}) is incorrectly allocated to ${horizonLabel}`,
          explanation: rule.reason,
          recommendation: rule.allowedHorizons.length > 0 
            ? `This asset should be reallocated to: ${allowedLabels}`
            : `This asset should not exist in ${isLiquid ? 'liquid' : 'illiquid'} assets with this purpose`
        });
      }

      // Check forbidden horizons
      if (rule.forbiddenHorizons && rule.forbiddenHorizons.includes(horizon)) {
        const purposeLabel = PURPOSE_LABELS[purpose] || purpose;
        const horizonLabel = TIME_HORIZON_LABELS[horizon] || horizon;

        anomalies.push({
          asset,
          severity: 'critical',
          type: 'forbidden_horizon',
          message: `${asset.name} (${purposeLabel}) cannot be ${horizonLabel}`,
          explanation: rule.reason,
          recommendation: 'Reallocate to an allowed time horizon or reconsider the asset purpose'
        });
      }
    }
  });

  return anomalies;
};

/**
 * Generate a human-readable writeup of anomalies
 * 
 * @param {Array} anomalies - Array of anomaly objects
 * @param {boolean} isLiquid - Whether checking liquid or illiquid assets
 * @returns {Object} Writeup object with summary and details
 */
export const generateAnomalyWriteup = (anomalies, isLiquid) => {
  if (anomalies.length === 0) {
    return {
      hasPerfectAllocation: true,
      summary: '✓ Perfect Allocation',
      message: `All ${isLiquid ? 'liquid' : 'illiquid'} assets are properly allocated according to their purpose and time horizon.`,
      details: []
    };
  }

  // Group anomalies by severity
  const critical = anomalies.filter(a => a.severity === 'critical');
  const high = anomalies.filter(a => a.severity === 'high');
  const medium = anomalies.filter(a => a.severity === 'medium');

  const summary = `⚠ ${anomalies.length} Allocation ${anomalies.length === 1 ? 'Issue' : 'Issues'} Detected`;
  
  let message = '';
  if (critical.length > 0) {
    message += `${critical.length} critical ${critical.length === 1 ? 'issue' : 'issues'}`;
  }
  if (high.length > 0) {
    message += `${message ? ', ' : ''}${high.length} high-priority ${high.length === 1 ? 'issue' : 'issues'}`;
  }
  if (medium.length > 0) {
    message += `${message ? ', ' : ''}${medium.length} medium-priority ${medium.length === 1 ? 'issue' : 'issues'}`;
  }
  message += ` found in your ${isLiquid ? 'liquid' : 'illiquid'} asset allocation.`;

  // Group anomalies by purpose for better organization
  const anomaliesByPurpose = {};
  anomalies.forEach(anomaly => {
    const purpose = anomaly.asset.asset_purpose;
    if (!anomaliesByPurpose[purpose]) {
      anomaliesByPurpose[purpose] = [];
    }
    anomaliesByPurpose[purpose].push(anomaly);
  });

  const details = Object.entries(anomaliesByPurpose).map(([purpose, purposeAnomalies]) => ({
    purpose: PURPOSE_LABELS[purpose] || purpose,
    anomalies: purposeAnomalies
  }));

  return {
    hasPerfectAllocation: false,
    summary,
    message,
    details,
    criticalCount: critical.length,
    highCount: high.length,
    mediumCount: medium.length
  };
};

/**
 * Get severity color for UI display
 */
export const getSeverityColor = (severity) => {
  switch (severity) {
    case 'critical':
      return 'text-red-600 dark:text-red-400';
    case 'high':
      return 'text-orange-600 dark:text-orange-400';
    case 'medium':
      return 'text-yellow-600 dark:text-yellow-400';
    default:
      return 'text-gray-600 dark:text-gray-400';
  }
};

/**
 * Get severity badge color for UI display
 */
export const getSeverityBadgeColor = (severity) => {
  switch (severity) {
    case 'critical':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    case 'high':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
  }
};
