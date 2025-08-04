// Comprehensive Annuity Types and Configuration

export const ANNUITY_TYPES = {
  // Immediate Annuities
  'immediate_fixed': {
    label: 'Immediate Fixed Annuity',
    category: 'immediate',
    description: 'Provides fixed payments that begin immediately',
    icon: '💰'
  },
  'immediate_variable': {
    label: 'Immediate Variable Annuity',
    category: 'immediate',
    description: 'Variable payments based on investment performance, begins immediately',
    icon: '📈'
  },
  'immediate_indexed': {
    label: 'Immediate Indexed Annuity',
    category: 'immediate',
    description: 'Returns tied to market index, payments begin immediately',
    icon: '📊'
  },
  'single_premium_immediate': {
    label: 'Single Premium Immediate Annuity (SPIA)',
    category: 'immediate',
    description: 'Single lump sum payment, immediate income stream',
    icon: '⚡'
  },

  // Deferred Annuities
  'deferred_fixed': {
    label: 'Deferred Fixed Annuity',
    category: 'deferred',
    description: 'Fixed growth during accumulation, payments begin later',
    icon: '🏦'
  },
  'deferred_variable': {
    label: 'Deferred Variable Annuity',
    category: 'deferred',
    description: 'Investment-based growth, flexible payment options',
    icon: '📉'
  },
  'deferred_indexed': {
    label: 'Deferred Indexed Annuity',
    category: 'deferred',
    description: 'Returns linked to market index with downside protection',
    icon: '🛡️'
  },
  'multi_year_guaranteed': {
    label: 'Multi-Year Guaranteed Annuity (MYGA)',
    category: 'deferred',
    description: 'Guaranteed interest rate for multiple years',
    icon: '✅'
  },

  // Specialized Annuities
  'structured': {
    label: 'Structured Annuity',
    category: 'specialized',
    description: 'Defined outcome with upside potential and downside buffer',
    icon: '🏗️'
  },
  'qualified_longevity': {
    label: 'Qualified Longevity Annuity Contract (QLAC)',
    category: 'specialized',
    description: 'Deferred income for retirement, special tax treatment',
    icon: '🎯'
  },
  'charitable_gift': {
    label: 'Charitable Gift Annuity',
    category: 'specialized',
    description: 'Provides income while supporting charitable causes',
    icon: '❤️'
  }
};

export const ANNUITY_CATEGORIES = {
  immediate: {
    label: 'Immediate Annuities',
    description: 'Begin payments within one year of purchase',
    color: '#10B981'
  },
  deferred: {
    label: 'Deferred Annuities',
    description: 'Accumulate value before beginning payments',
    color: '#3B82F6'
  },
  specialized: {
    label: 'Specialized Annuities',
    description: 'Unique features for specific needs',
    color: '#8B5CF6'
  }
};

export const FUNDING_TYPES = {
  'single_premium': {
    label: 'Single Premium',
    description: 'One-time lump sum payment'
  },
  'flexible_premium': {
    label: 'Flexible Premium',
    description: 'Multiple payments allowed over time'
  },
  'lump_sum': {
    label: 'Lump Sum',
    description: 'Single large payment at purchase'
  }
};

export const PAYOUT_OPTIONS = {
  'life_only': {
    label: 'Life Only',
    description: 'Payments for life, no survivor benefits'
  },
  'life_with_period_certain': {
    label: 'Life with Period Certain',
    description: 'Payments for life with guaranteed minimum period'
  },
  'joint_and_survivor': {
    label: 'Joint and Survivor',
    description: 'Payments continue to surviving spouse'
  },
  'fixed_period': {
    label: 'Fixed Period',
    description: 'Payments for a specific number of years'
  },
  'fixed_amount': {
    label: 'Fixed Amount',
    description: 'Specific payment amount until funds exhausted'
  },
  'systematic_withdrawal': {
    label: 'Systematic Withdrawal',
    description: 'Regular withdrawals while maintaining principal'
  }
};

export const PAYOUT_FREQUENCIES = {
  'monthly': { label: 'Monthly', multiplier: 12 },
  'quarterly': { label: 'Quarterly', multiplier: 4 },
  'semi-annually': { label: 'Semi-Annually', multiplier: 2 },
  'annually': { label: 'Annually', multiplier: 1 }
};

export const DEATH_BENEFIT_TYPES = {
  'return_of_premium': {
    label: 'Return of Premium',
    description: 'Returns original premium amount'
  },
  'account_value': {
    label: 'Account Value',
    description: 'Current accumulated value'
  },
  'guaranteed_minimum': {
    label: 'Guaranteed Minimum',
    description: 'Guaranteed minimum death benefit'
  },
  'enhanced': {
    label: 'Enhanced Death Benefit',
    description: 'Enhanced benefit with additional features'
  }
};

export const TAX_QUALIFICATIONS = {
  'qualified': {
    label: 'Qualified',
    description: 'Funded with pre-tax dollars (401k, IRA, etc.)'
  },
  'non_qualified': {
    label: 'Non-Qualified',
    description: 'Funded with after-tax dollars'
  },
  'roth': {
    label: 'Roth',
    description: 'Tax-free growth and distributions'
  },
  'traditional_ira': {
    label: 'Traditional IRA',
    description: 'Tax-deferred growth, taxable distributions'
  }
};

export const CONTRACT_STATUSES = {
  'active': {
    label: 'Active',
    description: 'Contract is active and accumulating',
    color: '#10B981'
  },
  'annuitized': {
    label: 'Annuitized',
    description: 'Converting to income payments',
    color: '#3B82F6'
  },
  'surrendered': {
    label: 'Surrendered',
    description: 'Contract has been surrendered',
    color: '#EF4444'
  },
  'death_claim': {
    label: 'Death Claim',
    description: 'Processing death benefit claim',
    color: '#6B7280'
  },
  'matured': {
    label: 'Matured',
    description: 'Contract has reached maturity',
    color: '#8B5CF6'
  }
};

export const CONTRIBUTION_TYPES = {
  'regular': {
    label: 'Regular Premium',
    description: 'Scheduled premium payment'
  },
  'additional': {
    label: 'Additional Premium',
    description: 'Extra contribution beyond regular'
  },
  'rollover': {
    label: 'Rollover',
    description: 'Transfer from retirement account'
  },
  'transfer': {
    label: 'Transfer',
    description: 'Transfer from another annuity'
  }
};

// Helper functions
export const getAnnuityTypeInfo = (type) => {
  return ANNUITY_TYPES[type] || { label: type, category: 'unknown', description: '', icon: '❓' };
};

export const getAnnuityCategoryInfo = (category) => {
  return ANNUITY_CATEGORIES[category] || { label: category, description: '', color: '#6B7280' };
};

export const getAnnuityTypesByCategory = () => {
  const result = {};
  Object.entries(ANNUITY_TYPES).forEach(([key, value]) => {
    if (!result[value.category]) {
      result[value.category] = [];
    }
    result[value.category].push({ value: key, ...value });
  });
  return result;
};

export const formatAnnuityValue = (value) => {
  if (!value) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(value);
};

export const formatPercentage = (value) => {
  if (!value) return '0.00%';
  return `${(value * 100).toFixed(2)}%`;
};

export const calculateAnnualizedReturn = (initialValue, currentValue, years) => {
  if (!initialValue || !currentValue || !years || years <= 0) return 0;
  return Math.pow(currentValue / initialValue, 1 / years) - 1;
};
