import React, { useState } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { 
  ANNUITY_TYPES, 
  FUNDING_TYPES, 
  PAYOUT_OPTIONS, 
  PAYOUT_FREQUENCIES,
  DEATH_BENEFIT_TYPES,
  TAX_QUALIFICATIONS,
  getAnnuityTypesByCategory
} from '../../constants/annuityTypes';

const AnnuityForm = ({ annuity = null, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    // Basic Information
    contract_number: annuity?.contract_number || '',
    product_name: annuity?.product_name || '',
    provider_company: annuity?.provider_company || '',
    
    // Annuity Classification
    annuity_type: annuity?.annuity_type || '',
    
    // Purchase Details
    purchase_date: annuity?.purchase_date || new Date().toISOString().split('T')[0],
    initial_premium: annuity?.initial_premium || '',
    additional_premiums_allowed: annuity?.additional_premiums_allowed || false,
    funding_type: annuity?.funding_type || '',
    
    // Financial Terms
    guaranteed_rate: annuity?.guaranteed_rate || '',
    current_rate: annuity?.current_rate || '',
    participation_rate: annuity?.participation_rate || '',
    cap_rate: annuity?.cap_rate || '',
    floor_rate: annuity?.floor_rate || '',
    
    // Accumulation Phase
    accumulation_value: annuity?.accumulation_value || '',
    cash_surrender_value: annuity?.cash_surrender_value || '',
    surrender_charge_rate: annuity?.surrender_charge_rate || '',
    surrender_period_years: annuity?.surrender_period_years || '',
    free_withdrawal_percentage: annuity?.free_withdrawal_percentage || 10.00,
    
    // Payout Phase
    annuitization_date: annuity?.annuitization_date || '',
    payout_option: annuity?.payout_option || '',
    payout_frequency: annuity?.payout_frequency || '',
    payout_amount: annuity?.payout_amount || '',
    guaranteed_period_years: annuity?.guaranteed_period_years || '',
    
    // Beneficiary Information
    primary_beneficiary: annuity?.primary_beneficiary || '',
    primary_beneficiary_percentage: annuity?.primary_beneficiary_percentage || 100.00,
    contingent_beneficiary: annuity?.contingent_beneficiary || '',
    death_benefit_type: annuity?.death_benefit_type || '',
    death_benefit_amount: annuity?.death_benefit_amount || '',
    
    // Riders and Features
    living_benefit_rider: annuity?.living_benefit_rider || false,
    long_term_care_rider: annuity?.long_term_care_rider || false,
    income_rider: annuity?.income_rider || false,
    enhanced_death_benefit: annuity?.enhanced_death_benefit || false,
    cost_of_living_adjustment: annuity?.cost_of_living_adjustment || false,
    rider_fees_annual: annuity?.rider_fees_annual || '',
    
    // Tax Information
    tax_qualification: annuity?.tax_qualification || '',
    tax_deferral_status: annuity?.tax_deferral_status !== false,
    
    // Performance Tracking
    underlying_index: annuity?.underlying_index || '',
    
    // Additional Details
    notes: annuity?.notes || ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const annuityTypesByCategory = getAnnuityTypesByCategory();

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Required fields
    if (!formData.product_name.trim()) newErrors.product_name = 'Product name is required';
    if (!formData.provider_company.trim()) newErrors.provider_company = 'Provider company is required';
    if (!formData.annuity_type) newErrors.annuity_type = 'Annuity type is required';
    if (!formData.purchase_date) newErrors.purchase_date = 'Purchase date is required';
    if (!formData.initial_premium || parseFloat(formData.initial_premium) <= 0) {
      newErrors.initial_premium = 'Initial premium must be greater than 0';
    }
    
    // Beneficiary percentage validation
    if (formData.primary_beneficiary_percentage && 
        (parseFloat(formData.primary_beneficiary_percentage) < 0 || parseFloat(formData.primary_beneficiary_percentage) > 100)) {
      newErrors.primary_beneficiary_percentage = 'Percentage must be between 0 and 100';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // Clean and format data
      const submitData = { ...formData };
      
      // Convert empty strings to null for optional fields
      Object.keys(submitData).forEach(key => {
        if (submitData[key] === '') {
          submitData[key] = null;
        }
      });
      
      // Convert numeric fields
      const numericFields = [
        'initial_premium', 'guaranteed_rate', 'current_rate', 'participation_rate',
        'cap_rate', 'floor_rate', 'accumulation_value', 'cash_surrender_value',
        'surrender_charge_rate', 'surrender_period_years', 'free_withdrawal_percentage',
        'payout_amount', 'guaranteed_period_years', 'primary_beneficiary_percentage',
        'death_benefit_amount', 'rider_fees_annual'
      ];
      
      numericFields.forEach(field => {
        if (submitData[field] !== null && submitData[field] !== '') {
          submitData[field] = parseFloat(submitData[field]);
        }
      });
      
      await onSubmit(submitData);
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors({ submit: 'Failed to save annuity. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto">
        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
            <CardTitle className="text-xl font-bold">
              {annuity ? 'Edit Annuity' : 'Add New Annuity'}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="product_name">Product Name *</Label>
                    <Input
                      id="product_name"
                      value={formData.product_name}
                      onChange={(e) => handleInputChange('product_name', e.target.value)}
                      placeholder="e.g., Secure Income Annuity"
                      className={errors.product_name ? 'border-red-500' : ''}
                    />
                    {errors.product_name && (
                      <p className="text-red-500 text-sm mt-1">{errors.product_name}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="provider_company">Provider Company *</Label>
                    <Input
                      id="provider_company"
                      value={formData.provider_company}
                      onChange={(e) => handleInputChange('provider_company', e.target.value)}
                      placeholder="e.g., Metropolitan Life"
                      className={errors.provider_company ? 'border-red-500' : ''}
                    />
                    {errors.provider_company && (
                      <p className="text-red-500 text-sm mt-1">{errors.provider_company}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="contract_number">Contract Number</Label>
                    <Input
                      id="contract_number"
                      value={formData.contract_number}
                      onChange={(e) => handleInputChange('contract_number', e.target.value)}
                      placeholder="Optional contract number"
                    />
                  </div>
                </div>
              </div>

              {/* Annuity Type */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Annuity Type</h3>
                <div>
                  <Label htmlFor="annuity_type">Annuity Type *</Label>
                  <select
                    id="annuity_type"
                    value={formData.annuity_type}
                    onChange={(e) => handleInputChange('annuity_type', e.target.value)}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md ${errors.annuity_type ? 'border-red-500' : ''}`}
                  >
                    <option value="">Select annuity type...</option>
                    {Object.entries(annuityTypesByCategory).map(([category, types]) => (
                      <optgroup key={category} label={category.charAt(0).toUpperCase() + category.slice(1)}>
                        {types.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.icon} {type.label}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                  {errors.annuity_type && (
                    <p className="text-red-500 text-sm mt-1">{errors.annuity_type}</p>
                  )}
                </div>
              </div>

              {/* Purchase Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Purchase Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="purchase_date">Purchase Date *</Label>
                    <Input
                      id="purchase_date"
                      type="date"
                      value={formData.purchase_date}
                      onChange={(e) => handleInputChange('purchase_date', e.target.value)}
                      className={errors.purchase_date ? 'border-red-500' : ''}
                    />
                    {errors.purchase_date && (
                      <p className="text-red-500 text-sm mt-1">{errors.purchase_date}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="initial_premium">Initial Premium *</Label>
                    <Input
                      id="initial_premium"
                      type="number"
                      step="0.01"
                      value={formData.initial_premium}
                      onChange={(e) => handleInputChange('initial_premium', e.target.value)}
                      placeholder="0.00"
                      className={errors.initial_premium ? 'border-red-500' : ''}
                    />
                    {errors.initial_premium && (
                      <p className="text-red-500 text-sm mt-1">{errors.initial_premium}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="funding_type">Funding Type</Label>
                    <select
                      id="funding_type"
                      value={formData.funding_type}
                      onChange={(e) => handleInputChange('funding_type', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select funding type...</option>
                      {Object.entries(FUNDING_TYPES).map(([value, info]) => (
                        <option key={value} value={value}>{info.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="additional_premiums_allowed"
                    checked={formData.additional_premiums_allowed}
                    onCheckedChange={(checked) => handleInputChange('additional_premiums_allowed', checked)}
                  />
                  <Label htmlFor="additional_premiums_allowed">Additional premiums allowed</Label>
                </div>
              </div>

              {/* Financial Terms */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Financial Terms</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="guaranteed_rate">Guaranteed Rate (%)</Label>
                    <Input
                      id="guaranteed_rate"
                      type="number"
                      step="0.0001"
                      value={formData.guaranteed_rate}
                      onChange={(e) => handleInputChange('guaranteed_rate', e.target.value)}
                      placeholder="e.g., 0.0325 for 3.25%"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="current_rate">Current Rate (%)</Label>
                    <Input
                      id="current_rate"
                      type="number"
                      step="0.0001"
                      value={formData.current_rate}
                      onChange={(e) => handleInputChange('current_rate', e.target.value)}
                      placeholder="e.g., 0.0375 for 3.75%"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="participation_rate">Participation Rate (%)</Label>
                    <Input
                      id="participation_rate"
                      type="number"
                      step="0.0001"
                      value={formData.participation_rate}
                      onChange={(e) => handleInputChange('participation_rate', e.target.value)}
                      placeholder="For indexed annuities"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="cap_rate">Cap Rate (%)</Label>
                    <Input
                      id="cap_rate"
                      type="number"
                      step="0.0001"
                      value={formData.cap_rate}
                      onChange={(e) => handleInputChange('cap_rate', e.target.value)}
                      placeholder="Maximum return"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="floor_rate">Floor Rate (%)</Label>
                    <Input
                      id="floor_rate"
                      type="number"
                      step="0.0001"
                      value={formData.floor_rate}
                      onChange={(e) => handleInputChange('floor_rate', e.target.value)}
                      placeholder="Minimum return guarantee"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="underlying_index">Underlying Index</Label>
                    <Input
                      id="underlying_index"
                      value={formData.underlying_index}
                      onChange={(e) => handleInputChange('underlying_index', e.target.value)}
                      placeholder="e.g., S&P 500"
                    />
                  </div>
                </div>
              </div>

              {/* Tax Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Tax Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="tax_qualification">Tax Qualification</Label>
                    <select
                      id="tax_qualification"
                      value={formData.tax_qualification}
                      onChange={(e) => handleInputChange('tax_qualification', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select qualification...</option>
                      {Object.entries(TAX_QUALIFICATIONS).map(([value, info]) => (
                        <option key={value} value={value}>{info.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex items-center space-x-2 pt-6">
                    <Checkbox
                      id="tax_deferral_status"
                      checked={formData.tax_deferral_status}
                      onCheckedChange={(checked) => handleInputChange('tax_deferral_status', checked)}
                    />
                    <Label htmlFor="tax_deferral_status">Tax-deferred status</Label>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Additional Information</h3>
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Additional notes about this annuity..."
                    rows={3}
                  />
                </div>
              </div>

              {/* Error Display */}
              {errors.submit && (
                <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-md">
                  <AlertCircle className="h-4 w-4" />
                  <span>{errors.submit}</span>
                </div>
              )}

              {/* Form Actions */}
              <div className="flex justify-end space-x-4 pt-6 border-t">
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {annuity ? 'Update Annuity' : 'Create Annuity'}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnnuityForm;
