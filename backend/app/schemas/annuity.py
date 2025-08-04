from typing import Optional, Dict, Any, List
from pydantic import BaseModel, validator
from datetime import date, datetime
from decimal import Decimal

class AnnuityContributionBase(BaseModel):
    contribution_date: date
    amount: Decimal
    contribution_type: Optional[str] = 'regular'
    notes: Optional[str] = None

    @validator('amount')
    def validate_amount(cls, v):
        if v <= 0:
            raise ValueError('amount must be greater than 0')
        return v

    @validator('contribution_type')
    def validate_contribution_type(cls, v):
        valid_types = ['regular', 'additional', 'rollover', 'transfer']
        if v and v not in valid_types:
            raise ValueError(f'contribution_type must be one of: {", ".join(valid_types)}')
        return v

class AnnuityContributionCreate(AnnuityContributionBase):
    annuity_id: str

class AnnuityContribution(AnnuityContributionBase):
    id: str
    annuity_id: str
    user_id: str
    created_at: datetime

    class Config:
        from_attributes = True

class AnnuityValuationBase(BaseModel):
    valuation_date: date
    accumulation_value: Decimal
    cash_surrender_value: Decimal
    guaranteed_value: Optional[Decimal] = None
    market_value: Optional[Decimal] = None
    notes: Optional[str] = None

    @validator('accumulation_value', 'cash_surrender_value')
    def validate_amounts(cls, v):
        if v < 0:
            raise ValueError('values cannot be negative')
        return v

class AnnuityValuationCreate(AnnuityValuationBase):
    annuity_id: str

class AnnuityValuation(AnnuityValuationBase):
    id: str
    annuity_id: str
    user_id: str
    created_at: datetime

    class Config:
        from_attributes = True

class AnnuityBase(BaseModel):
    # Basic Information
    contract_number: Optional[str] = None
    product_name: str
    provider_company: str
    
    # Annuity Classification
    annuity_type: str
    
    # Purchase Details
    purchase_date: date
    initial_premium: Decimal
    additional_premiums_allowed: Optional[bool] = False
    funding_type: Optional[str] = None
    
    # Financial Terms
    guaranteed_rate: Optional[Decimal] = None
    current_rate: Optional[Decimal] = None
    participation_rate: Optional[Decimal] = None
    cap_rate: Optional[Decimal] = None
    floor_rate: Optional[Decimal] = None
    
    # Accumulation Phase
    accumulation_value: Optional[Decimal] = 0
    cash_surrender_value: Optional[Decimal] = 0
    surrender_charge_rate: Optional[Decimal] = None
    surrender_period_years: Optional[int] = None
    free_withdrawal_percentage: Optional[Decimal] = 10.00
    
    # Payout Phase
    annuitization_date: Optional[date] = None
    payout_option: Optional[str] = None
    payout_frequency: Optional[str] = None
    payout_amount: Optional[Decimal] = None
    guaranteed_period_years: Optional[int] = None
    
    # Beneficiary Information
    primary_beneficiary: Optional[str] = None
    primary_beneficiary_percentage: Optional[Decimal] = 100.00
    contingent_beneficiary: Optional[str] = None
    death_benefit_type: Optional[str] = None
    death_benefit_amount: Optional[Decimal] = None
    
    # Riders and Features
    living_benefit_rider: Optional[bool] = False
    long_term_care_rider: Optional[bool] = False
    income_rider: Optional[bool] = False
    enhanced_death_benefit: Optional[bool] = False
    cost_of_living_adjustment: Optional[bool] = False
    rider_fees_annual: Optional[Decimal] = 0
    
    # Tax Information
    tax_qualification: Optional[str] = None
    tax_deferral_status: Optional[bool] = True
    
    # Performance Tracking
    underlying_index: Optional[str] = None
    performance_tracking: Optional[Dict[str, Any]] = {}
    
    # Contract Status
    contract_status: Optional[str] = 'active'
    
    # Additional Details
    notes: Optional[str] = None
    documents: Optional[Dict[str, Any]] = {}

    @validator('annuity_type')
    def validate_annuity_type(cls, v):
        valid_types = [
            'immediate_fixed', 'immediate_variable', 'immediate_indexed',
            'deferred_fixed', 'deferred_variable', 'deferred_indexed',
            'structured', 'multi_year_guaranteed', 'single_premium_immediate',
            'qualified_longevity', 'charitable_gift'
        ]
        if v not in valid_types:
            raise ValueError(f'annuity_type must be one of: {", ".join(valid_types)}')
        return v

    @validator('funding_type')
    def validate_funding_type(cls, v):
        if v and v not in ['lump_sum', 'flexible_premium', 'single_premium']:
            raise ValueError('funding_type must be one of: lump_sum, flexible_premium, single_premium')
        return v

    @validator('payout_option')
    def validate_payout_option(cls, v):
        valid_options = [
            'life_only', 'life_with_period_certain', 'joint_and_survivor',
            'fixed_period', 'fixed_amount', 'systematic_withdrawal'
        ]
        if v and v not in valid_options:
            raise ValueError(f'payout_option must be one of: {", ".join(valid_options)}')
        return v

    @validator('payout_frequency')
    def validate_payout_frequency(cls, v):
        if v and v not in ['monthly', 'quarterly', 'semi-annually', 'annually']:
            raise ValueError('payout_frequency must be one of: monthly, quarterly, semi-annually, annually')
        return v

    @validator('death_benefit_type')
    def validate_death_benefit_type(cls, v):
        valid_types = ['return_of_premium', 'account_value', 'guaranteed_minimum', 'enhanced']
        if v and v not in valid_types:
            raise ValueError(f'death_benefit_type must be one of: {", ".join(valid_types)}')
        return v

    @validator('tax_qualification')
    def validate_tax_qualification(cls, v):
        valid_types = ['qualified', 'non_qualified', 'roth', 'traditional_ira']
        if v and v not in valid_types:
            raise ValueError(f'tax_qualification must be one of: {", ".join(valid_types)}')
        return v

    @validator('contract_status')
    def validate_contract_status(cls, v):
        valid_statuses = ['active', 'annuitized', 'surrendered', 'death_claim', 'matured']
        if v and v not in valid_statuses:
            raise ValueError(f'contract_status must be one of: {", ".join(valid_statuses)}')
        return v

    @validator('initial_premium')
    def validate_initial_premium(cls, v):
        if v <= 0:
            raise ValueError('initial_premium must be greater than 0')
        return v

class AnnuityCreate(AnnuityBase):
    pass

class AnnuityUpdate(BaseModel):
    # Basic Information
    contract_number: Optional[str] = None
    product_name: Optional[str] = None
    provider_company: Optional[str] = None
    
    # Financial Terms
    guaranteed_rate: Optional[Decimal] = None
    current_rate: Optional[Decimal] = None
    participation_rate: Optional[Decimal] = None
    cap_rate: Optional[Decimal] = None
    floor_rate: Optional[Decimal] = None
    
    # Accumulation Phase
    accumulation_value: Optional[Decimal] = None
    cash_surrender_value: Optional[Decimal] = None
    
    # Payout Phase
    annuitization_date: Optional[date] = None
    payout_option: Optional[str] = None
    payout_frequency: Optional[str] = None
    payout_amount: Optional[Decimal] = None
    
    # Beneficiary Information
    primary_beneficiary: Optional[str] = None
    primary_beneficiary_percentage: Optional[Decimal] = None
    contingent_beneficiary: Optional[str] = None
    death_benefit_type: Optional[str] = None
    death_benefit_amount: Optional[Decimal] = None
    
    # Riders and Features
    living_benefit_rider: Optional[bool] = None
    long_term_care_rider: Optional[bool] = None
    income_rider: Optional[bool] = None
    enhanced_death_benefit: Optional[bool] = None
    cost_of_living_adjustment: Optional[bool] = None
    rider_fees_annual: Optional[Decimal] = None
    
    # Performance Tracking
    underlying_index: Optional[str] = None
    performance_tracking: Optional[Dict[str, Any]] = None
    
    # Contract Status
    contract_status: Optional[str] = None
    
    # Additional Details
    notes: Optional[str] = None
    documents: Optional[Dict[str, Any]] = None

class Annuity(AnnuityBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime
    
    # Related data
    contributions: Optional[List[AnnuityContribution]] = []
    valuations: Optional[List[AnnuityValuation]] = []

    class Config:
        from_attributes = True

# Summary schemas for dashboard/reporting
class AnnuitySummary(BaseModel):
    id: str
    product_name: str
    provider_company: str
    annuity_type: str
    initial_premium: Decimal
    current_value: Decimal
    purchase_date: date
    contract_status: str

    class Config:
        from_attributes = True

class AnnuityPortfolioSummary(BaseModel):
    total_annuities: int
    total_premiums_paid: Decimal
    total_current_value: Decimal
    total_gain_loss: Decimal
    annuities_by_type: Dict[str, int]
    annuities_by_status: Dict[str, int]
