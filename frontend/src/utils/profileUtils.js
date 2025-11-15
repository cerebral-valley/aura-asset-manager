/**
 * Profile validation and formatting utilities
 */

// Phone number formatting utility
export const formatPhoneNumber = (value) => {
  // Remove all non-digit characters
  const digits = value.replace(/\D/g, '');
  
  // Apply formatting based on length
  if (digits.length <= 3) {
    return digits;
  } else if (digits.length <= 6) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  } else if (digits.length <= 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  } else {
    // For numbers longer than 10 digits, assume country code
    return `+${digits.slice(0, digits.length - 10)} (${digits.slice(-10, -7)}) ${digits.slice(-7, -4)}-${digits.slice(-4)}`;
  }
};

// Phone number validation
export const validatePhoneNumber = (value) => {
  const digits = value.replace(/\D/g, '');
  return digits.length >= 10;
};

// Date validation - cannot be in future
export const validateDateOfBirth = (date) => {
  if (!date) return true; // Optional field
  const selectedDate = new Date(date);
  const today = new Date();
  
  // Check if date is in the future
  if (selectedDate > today) {
    return { valid: false, message: "Date of birth cannot be in the future" };
  }
  
  // Check if date is reasonable (not too far in the past)
  const minDate = new Date();
  minDate.setFullYear(minDate.getFullYear() - 120);
  if (selectedDate < minDate) {
    return { valid: false, message: "Please enter a valid date of birth" };
  }
  
  return { valid: true };
};

// Email masking utility
export const maskEmail = (email) => {
  if (!email) return '';
  const [localPart, domain] = email.split('@');
  if (localPart.length <= 3) {
    return `${localPart.charAt(0)}***@${domain}`;
  }
  return `${localPart.slice(0, 2)}***${localPart.slice(-1)}@${domain}`;
};

// Phone masking utility
export const maskPhone = (phone) => {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length <= 4) {
    return '***-****';
  }
  return `***-***-${digits.slice(-4)}`;
};

// Calculate profile completion percentage
export const calculateProfileCompletion = (profile) => {
  const requiredFields = [
    'first_name',
    'last_name',
    'date_of_birth',
    'phone_number',
    'city',
    'country',
    'occupation',
    'risk_appetite'
  ];
  
  const optionalFields = [
    'marital_status',
    'gender',
    'children',
    'dependents',
    'state',
    'pin_code',
    'nationality',
    'annual_income',
    'credit_score_value'
  ];
  
  const allFields = [...requiredFields, ...optionalFields];
  
  let filledCount = 0;
  let totalWeight = 0;
  
  // Required fields have weight of 2
  requiredFields.forEach(field => {
    totalWeight += 2;
    if (profile[field] && profile[field].toString().trim() !== '') {
      filledCount += 2;
    }
  });
  
  // Optional fields have weight of 1
  optionalFields.forEach(field => {
    totalWeight += 1;
    if (profile[field] && profile[field].toString().trim() !== '') {
      filledCount += 1;
    }
  });
  
  const percentage = Math.round((filledCount / totalWeight) * 100);
  
  return {
    percentage,
    filledCount: requiredFields.filter(field => 
      profile[field] && profile[field].toString().trim() !== ''
    ).length + optionalFields.filter(field => 
      profile[field] && profile[field].toString().trim() !== ''
    ).length,
    totalCount: allFields.length,
    requiredMissing: requiredFields.filter(field => 
      !profile[field] || profile[field].toString().trim() === ''
    ),
    missingFields: allFields.filter(field => 
      !profile[field] || profile[field].toString().trim() === ''
    )
  };
};

// Get profile completion status for gamification
export const getProfileCompletionStatus = (percentage) => {
  if (percentage >= 90) {
    return {
      status: 'complete',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      borderColor: 'border-green-300',
      message: 'Profile Complete! 🎉',
      emoji: '🎉'
    };
  } else if (percentage >= 70) {
    return {
      status: 'almost-complete',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      borderColor: 'border-blue-300',
      message: 'Almost there! 🚀',
      emoji: '🚀'
    };
  } else if (percentage >= 50) {
    return {
      status: 'halfway',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      borderColor: 'border-yellow-300',
      message: 'Halfway done! 💪',
      emoji: '💪'
    };
  } else {
    return {
      status: 'getting-started',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      borderColor: 'border-orange-300',
      message: 'Getting started! 🌱',
      emoji: '🌱'
    };
  }
};
