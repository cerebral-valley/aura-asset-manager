import { useState, useMemo } from 'react'
import { validateDateOfBirth, validatePhoneNumber } from '../utils/profileUtils.js'

const getCreditScoreRange = (provider) => {
  if (provider === 'cibil') {
    return { min: 300, max: 900 }
  }
  return { min: 300, max: 850 }
}

export const useProfileValidation = (profile) => {
  const [fieldErrors, setFieldErrors] = useState({})
  const [touchedFields, setTouchedFields] = useState({})

  const validateField = (fieldName, value) => {
    let validation = { valid: true, message: '' }

    switch (fieldName) {
      case 'date_of_birth':
        validation = validateDateOfBirth(value)
        break
      case 'phone_number':
        if (value && !validatePhoneNumber(value)) {
          validation = { valid: false, message: 'Please enter a valid phone number (at least 10 digits)' }
        }
        break
      case 'first_name':
        if (value && value.trim().length < 2) {
          validation = { valid: false, message: 'First name must be at least 2 characters' }
        }
        break
      case 'last_name':
        if (value && value.trim().length < 2) {
          validation = { valid: false, message: 'Last name must be at least 2 characters' }
        }
        break
      case 'children':
      case 'dependents':
        if (value && (isNaN(value) || parseInt(value) < 0)) {
          validation = { valid: false, message: 'Must be a positive number' }
        }
        break
      case 'pin_code':
        if (value && !/^\d{5,6}$/.test(value.replace(/\s/g, ''))) {
          validation = { valid: false, message: 'Please enter a valid PIN/ZIP code' }
        }
        break
      case 'annual_income':
        if (value && (isNaN(value) || parseFloat(value) < 0)) {
          validation = { valid: false, message: 'Annual income must be a positive number' }
        }
        break
      case 'credit_score_value': {
        if (value) {
          const { min, max } = getCreditScoreRange(profile.credit_score_provider)
          const numericValue = parseInt(value, 10)
          if (isNaN(numericValue)) {
            validation = { valid: false, message: 'Please enter a valid credit score' }
          } else if (numericValue < min || numericValue > max) {
            validation = { valid: false, message: `Score must be between ${min} and ${max}` }
          }
        }
        break
      }
      case 'credit_score_last_checked': {
        if (value) {
          const selectedDate = new Date(value)
          const today = new Date()
          if (selectedDate > today) {
            validation = { valid: false, message: 'Last checked date cannot be in the future' }
          }
        }
        break
      }
      case 'credit_score_provider':
        if (profile.credit_score_value && !value) {
          validation = { valid: false, message: 'Select a score type when providing a credit score' }
        }
        break
      default:
        break
    }

    return validation
  }

  const handleFieldBlur = (fieldName, value) => {
    setTouchedFields(prev => ({ ...prev, [fieldName]: true }))
    const validation = validateField(fieldName, value)
    
    if (!validation.valid) {
      setFieldErrors(prev => ({ ...prev, [fieldName]: validation.message }))
    } else {
      setFieldErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[fieldName]
        return newErrors
      })
    }
  }

  const handleFieldChange = (fieldName, value) => {
    // Clear error immediately if field becomes valid
    if (touchedFields[fieldName]) {
      const validation = validateField(fieldName, value)
      if (validation.valid && fieldErrors[fieldName]) {
        setFieldErrors(prev => {
          const newErrors = { ...prev }
          delete newErrors[fieldName]
          return newErrors
        })
      }
    }
  }

  const getFieldError = (fieldName) => {
    return touchedFields[fieldName] ? fieldErrors[fieldName] : null
  }

  const hasFieldError = (fieldName) => {
    return touchedFields[fieldName] && !!fieldErrors[fieldName]
  }

  const isFormValid = useMemo(() => {
    return Object.keys(fieldErrors).length === 0
  }, [fieldErrors])

  return {
    handleFieldBlur,
    handleFieldChange,
    getFieldError,
    hasFieldError,
    isFormValid,
    fieldErrors,
    touchedFields
  }
}
