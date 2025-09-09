import React, { useState } from 'react'
import { Input } from '../ui/input.jsx'
import { Button } from '../ui/button.jsx'
import { Eye, EyeOff } from 'lucide-react'
import { maskEmail, maskPhone } from '../../utils/profileUtils.js'

const SensitiveInput = ({ 
  id, 
  value, 
  onChange, 
  onBlur,
  placeholder, 
  type = 'email', // 'email' or 'phone'
  disabled = false,
  className = '',
  error = null
}) => {
  const [isRevealed, setIsRevealed] = useState(false)

  const getMaskedValue = () => {
    if (!value) return ''
    return type === 'email' ? maskEmail(value) : maskPhone(value)
  }

  const displayValue = isRevealed ? value : getMaskedValue()

  const toggleReveal = () => {
    setIsRevealed(!isRevealed)
  }

  return (
    <div className="relative">
      <Input
        id={id}
        value={displayValue}
        onChange={isRevealed ? onChange : () => {}} // Only allow editing when revealed
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled || !isRevealed}
        className={`pr-10 ${error ? 'border-red-500' : ''} ${className}`}
        readOnly={!isRevealed}
      />
      {!disabled && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full w-10 px-0 hover:bg-transparent flex items-center justify-center"
          onClick={toggleReveal}
        >
          {isRevealed ? (
            <EyeOff className="h-4 w-4 text-muted-foreground" />
          ) : (
            <Eye className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>
      )}
      {error && (
        <p className="text-sm text-red-600 mt-1">{error}</p>
      )}
      {!isRevealed && !disabled && (
        <p className="text-xs text-muted-foreground mt-1">
          Click the eye icon to reveal and edit
        </p>
      )}
    </div>
  )
}

export default SensitiveInput
