/**
 * Insurance Data Aggregation Utilities
 * Provides functions to calculate insurance metrics for exports and analysis
 */

// Policy type categories for grouping
export const INSURANCE_CATEGORIES = {
  'Health': ['Health', 'Medical', 'Dental', 'Vision', 'Health Insurance'],
  'Life': ['Life', 'Term Life', 'Whole Life', 'Universal Life', 'Life Insurance'],
  'Auto': ['Auto', 'Car', 'Vehicle', 'Motorcycle', 'Auto Insurance'],
  'Home': ['Home', 'Homeowners', 'Property', 'Renters', 'Condo', 'Home Insurance'],
  'Business': ['Business', 'Commercial', 'Professional', 'Liability', 'Business Insurance'],
  'Other': ['Other', 'Travel', 'Pet', 'Umbrella', 'Disability', 'Personal']
};

/**
 * Matches a policy type to its category
 */
export const matchesPolicyCategory = (policyType, category) => {
  if (!policyType) return false;
  
  const categoryTypes = INSURANCE_CATEGORIES[category] || [];
  const normalizedPolicyType = policyType.toLowerCase().trim();
  
  return categoryTypes.some(type => 
    normalizedPolicyType.includes(type.toLowerCase()) ||
    type.toLowerCase().includes(normalizedPolicyType)
  );
};

/**
 * Aggregates insurance policies by type similar to Assets aggregateByType
 */
export const aggregateInsuranceByType = (policies = []) => {
  const result = {};
  
  // Initialize all categories
  Object.keys(INSURANCE_CATEGORIES).forEach(category => {
    result[category] = {
      count: 0,
      totalCoverage: 0,
      totalAnnualPremium: 0,
      policies: []
    };
  });

  // Process each policy
  policies.forEach(policy => {
    if (!policy) return;

    // Convert values to numbers
    const coverageAmount = parseFloat(policy.coverage_amount) || 0;
    const premiumAmount = parseFloat(policy.premium_amount) || 0;
    
    // Calculate annual premium based on frequency
    let annualPremium = 0;
    if (policy.premium_frequency && premiumAmount > 0) {
      const frequency = policy.premium_frequency.toLowerCase();
      switch (frequency) {
        case 'monthly':
          annualPremium = premiumAmount * 12;
          break;
        case 'quarterly':
          annualPremium = premiumAmount * 4;
          break;
        case 'semi-annually':
        case 'semi-annual':
          annualPremium = premiumAmount * 2;
          break;
        case 'annually':
        case 'annual':
        default:
          annualPremium = premiumAmount;
          break;
      }
    }

    // Find matching category
    let categorized = false;
    for (const [category] of Object.entries(INSURANCE_CATEGORIES)) {
      if (matchesPolicyCategory(policy.policy_type, category)) {
        result[category].count += 1;
        result[category].totalCoverage += coverageAmount;
        result[category].totalAnnualPremium += annualPremium;
        result[category].policies.push({
          ...policy,
          annualPremium,
          coverageAmount
        });
        categorized = true;
        break;
      }
    }

    // If no category matched, put in 'Other'
    if (!categorized) {
      result['Other'].count += 1;
      result['Other'].totalCoverage += coverageAmount;
      result['Other'].totalAnnualPremium += annualPremium;
      result['Other'].policies.push({
        ...policy,
        annualPremium,
        coverageAmount
      });
    }
  });

  return result;
};

/**
 * Calculates insurance totals
 */
export const calculateInsuranceTotals = (policies = []) => {
  let totalCoverage = 0;
  let totalAnnualPremium = 0;
  let totalMonthlyPremium = 0;

  policies.forEach(policy => {
    if (!policy) return;

    // Coverage amount
    const coverageAmount = parseFloat(policy.coverage_amount) || 0;
    totalCoverage += coverageAmount;

    // Premium calculations
    const premiumAmount = parseFloat(policy.premium_amount) || 0;
    
    if (policy.premium_frequency && premiumAmount > 0) {
      const frequency = policy.premium_frequency.toLowerCase();
      let annualPremium = 0;
      
      switch (frequency) {
        case 'monthly':
          annualPremium = premiumAmount * 12;
          totalMonthlyPremium += premiumAmount;
          break;
        case 'quarterly':
          annualPremium = premiumAmount * 4;
          totalMonthlyPremium += premiumAmount / 3;
          break;
        case 'semi-annually':
        case 'semi-annual':
          annualPremium = premiumAmount * 2;
          totalMonthlyPremium += premiumAmount / 6;
          break;
        case 'annually':
        case 'annual':
        default:
          annualPremium = premiumAmount;
          totalMonthlyPremium += premiumAmount / 12;
          break;
      }
      
      totalAnnualPremium += annualPremium;
    }
  });

  return {
    totalCoverage,
    totalAnnualPremium,
    totalMonthlyPremium
  };
};

/**
 * Creates detailed insurance breakdown for exports
 */
export const createDetailedInsuranceBreakdown = (aggregateByType) => {
  const breakdown = [];
  
  Object.entries(aggregateByType).forEach(([category, data]) => {
    if (data.count > 0) {
      breakdown.push({
        category,
        count: data.count,
        totalCoverage: data.totalCoverage,
        totalAnnualPremium: data.totalAnnualPremium,
        averageCoverage: data.totalCoverage / data.count,
        averageAnnualPremium: data.totalAnnualPremium / data.count,
        policies: data.policies
      });
    }
  });

  // Sort by total coverage descending
  breakdown.sort((a, b) => b.totalCoverage - a.totalCoverage);
  
  return breakdown;
};

/**
 * Calculates protection ratios and risk metrics
 */
export const calculateProtectionMetrics = (policies = []) => {
  const totals = calculateInsuranceTotals(policies);
  const aggregated = aggregateInsuranceByType(policies);
  
  // Calculate coverage ratios by type
  const coverageDistribution = {};
  Object.entries(aggregated).forEach(([category, data]) => {
    if (data.totalCoverage > 0) {
      coverageDistribution[category] = {
        coverage: data.totalCoverage,
        percentage: totals.totalCoverage > 0 ? (data.totalCoverage / totals.totalCoverage) * 100 : 0,
        premiumPercentage: totals.totalAnnualPremium > 0 ? (data.totalAnnualPremium / totals.totalAnnualPremium) * 100 : 0
      };
    }
  });

  // Risk assessment based on coverage gaps
  const riskFactors = {
    hasHealthCoverage: aggregated.Health.count > 0,
    hasLifeCoverage: aggregated.Life.count > 0,
    hasAutoCoverage: aggregated.Auto.count > 0,
    hasHomeCoverage: aggregated.Home.count > 0,
    lowCoverageTypes: []
  };

  // Identify potential coverage gaps
  Object.entries(aggregated).forEach(([category, data]) => {
    if (data.count === 0 && ['Health', 'Life', 'Auto', 'Home'].includes(category)) {
      riskFactors.lowCoverageTypes.push(category);
    }
  });

  // Calculate cost efficiency (coverage per premium dollar)
  const costEfficiency = totals.totalAnnualPremium > 0 ? 
    totals.totalCoverage / totals.totalAnnualPremium : 0;

  return {
    totals,
    coverageDistribution,
    riskFactors,
    costEfficiency,
    portfolioHealth: {
      totalPolicies: policies.length,
      categoriesCovered: Object.values(aggregated).filter(cat => cat.count > 0).length,
      averagePremiumPerPolicy: policies.length > 0 ? totals.totalAnnualPremium / policies.length : 0,
      averageCoveragePerPolicy: policies.length > 0 ? totals.totalCoverage / policies.length : 0
    }
  };
};

/**
 * Prepares chart data for visualization
 */
export const prepareInsuranceChartData = (aggregateByType) => {
  const chartData = [];
  const pieData = [];
  
  Object.entries(aggregateByType).forEach(([category, data]) => {
    if (data.count > 0) {
      chartData.push({
        name: category,
        coverage: data.totalCoverage,
        premium: data.totalAnnualPremium,
        count: data.count
      });
      
      pieData.push({
        name: category,
        value: data.totalCoverage,
        count: data.count
      });
    }
  });

  return { chartData, pieData };
};
