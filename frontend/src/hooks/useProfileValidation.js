import { useState, useMemo } from 'react'
import { validateDateOfBirth, validatePhoneNumber } from '@/utils/profileUtils'

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
