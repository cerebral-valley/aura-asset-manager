import React, { useState, useEffect } from 'react';
import { Button } from './button';
import { X, DollarSign, Calendar, Target } from 'lucide-react';

const GoalModal = ({
  isOpen,
  onClose,
  onSubmit,
  goal = null,
  goalType = 'custom', // 'net_worth' or 'custom'
  isLoading = false
}) => {
  const [formData, setFormData] = useState({
    title: '',
    target_amount: '',
    target_date: '',
    description: ''
  });
  
  const [errors, setErrors] = useState({});

  // Initialize form when goal prop changes
  useEffect(() => {
    if (goal) {
      setFormData({
        title: goal.title || '',
        target_amount: goal.target_amount ? goal.target_amount.toString() : '',
        target_date: goal.target_date || '',
        description: goal.description || ''
      });
    } else {
      setFormData({
        title: goalType === 'net_worth' ? 'Net Worth Goal' : '',
        target_amount: '',
        target_date: '',
        description: ''
      });
    }
    setErrors({});
  }, [goal, goalType, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    // Title validation
    if (!formData.title.trim()) {
      newErrors.title = 'Goal title is required';
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Goal title must be at least 3 characters';
    } else if (formData.title.trim().length > 100) {
      newErrors.title = 'Goal title must be less than 100 characters';
    }

    // Target amount validation
    if (!formData.target_amount) {
      newErrors.target_amount = 'Target amount is required';
    } else {
      const amount = parseFloat(formData.target_amount);
      if (isNaN(amount) || amount <= 0) {
        newErrors.target_amount = 'Target amount must be a positive number';
      } else if (amount > 10000000000) { // 10 billion limit
        newErrors.target_amount = 'Target amount must be less than $10 billion';
      }
    }

    // Target date validation (optional but if provided must be valid)
    if (formData.target_date) {
      const targetDate = new Date(formData.target_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time for accurate date comparison
      
      if (targetDate < today) {
        newErrors.target_date = 'Target date must be in the future';
      }
    }

    // Description validation (optional but limited)
    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Prepare goal data
    const goalData = {
      goal_type: goalType,
      title: formData.title.trim(),
      target_amount: parseFloat(formData.target_amount),
      target_date: formData.target_date || null,
      description: formData.description.trim() || null
    };

    onSubmit(goalData);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  const isNetWorthGoal = goalType === 'net_worth';
  const modalTitle = goal 
    ? `Edit ${isNetWorthGoal ? 'Net Worth' : 'Custom'} Goal`
    : `Create ${isNetWorthGoal ? 'Net Worth' : 'Custom'} Goal`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Target className={`w-6 h-6 ${isNetWorthGoal ? 'text-green-600' : 'text-purple-600'}`} />
            <h2 className="text-xl font-semibold">{modalTitle}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            disabled={isLoading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Goal Title */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Goal Title {isNetWorthGoal && <span className="text-gray-500">(Net Worth Goal)</span>}
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 ${
                errors.title ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder={isNetWorthGoal ? 'Net Worth Goal' : 'e.g., Buy a house, Vacation fund, Emergency savings'}
              disabled={isLoading || (isNetWorthGoal && !goal)} // Disable for new net worth goals
              required
            />
            {errors.title && (
              <p className="text-red-600 text-sm mt-1">{errors.title}</p>
            )}
          </div>

          {/* Target Amount */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Target Amount
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="number"
                step="0.01"
                min="0"
                max="10000000000"
                value={formData.target_amount}
                onChange={(e) => handleInputChange('target_amount', e.target.value)}
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 ${
                  errors.target_amount ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="e.g., 50000"
                disabled={isLoading}
                required
              />
            </div>
            {errors.target_amount && (
              <p className="text-red-600 text-sm mt-1">{errors.target_amount}</p>
            )}
          </div>

          {/* Target Date */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Target Date <span className="text-gray-500">(Optional)</span>
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="date"
                value={formData.target_date}
                onChange={(e) => handleInputChange('target_date', e.target.value)}
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 ${
                  errors.target_date ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                disabled={isLoading}
                min={new Date().toISOString().split('T')[0]} // Minimum date is today
              />
            </div>
            {errors.target_date && (
              <p className="text-red-600 text-sm mt-1">{errors.target_date}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Description <span className="text-gray-500">(Optional)</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 resize-none ${
                errors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="Add any additional details about this goal..."
              rows={3}
              maxLength={500}
              disabled={isLoading}
            />
            <div className="flex justify-between items-center mt-1">
              {errors.description && (
                <p className="text-red-600 text-sm">{errors.description}</p>
              )}
              <p className="text-gray-500 text-xs ml-auto">
                {formData.description.length}/500 characters
              </p>
            </div>
          </div>

          {/* Goal Type Info */}
          {isNetWorthGoal && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
              <p className="text-sm text-green-800 dark:text-green-200">
                <strong>Net Worth Goal:</strong> This goal tracks your overall financial net worth across all assets.
                You can only have one net worth goal at a time.
              </p>
            </div>
          )}

          {!isNetWorthGoal && (
            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3">
              <p className="text-sm text-purple-800 dark:text-purple-200">
                <strong>Custom Goal:</strong> Create specific financial objectives like buying a house, 
                vacation fund, or emergency savings. You can have up to 5 custom goals.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className={`flex-1 ${isNetWorthGoal ? 'bg-green-600 hover:bg-green-700' : 'bg-purple-600 hover:bg-purple-700'}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  {goal ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                goal ? 'Update Goal' : 'Create Goal'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GoalModal;