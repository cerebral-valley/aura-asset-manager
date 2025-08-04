from sqlalchemy import Column, String, Numeric, Date, Boolean, Integer, DateTime, Text, JSON, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid

from app.core.database import Base

class Annuity(Base):
    __tablename__ = "annuities"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    
    # Basic Information
    contract_number = Column(String(100))
    product_name = Column(String(255), nullable=False)
    provider_company = Column(String(255), nullable=False)
    
    # Annuity Classification
    annuity_type = Column(String(50), nullable=False)
    
    # Purchase Details
    purchase_date = Column(Date, nullable=False)
    initial_premium = Column(Numeric(18, 2), nullable=False)
    additional_premiums_allowed = Column(Boolean, default=False)
    funding_type = Column(String(50))
    
    # Financial Terms
    guaranteed_rate = Column(Numeric(5, 4))
    current_rate = Column(Numeric(5, 4))
    participation_rate = Column(Numeric(5, 4))
    cap_rate = Column(Numeric(5, 4))
    floor_rate = Column(Numeric(5, 4))
    
    # Accumulation Phase
    accumulation_value = Column(Numeric(18, 2), default=0)
    cash_surrender_value = Column(Numeric(18, 2), default=0)
    surrender_charge_rate = Column(Numeric(5, 4))
    surrender_period_years = Column(Integer)
    free_withdrawal_percentage = Column(Numeric(5, 2), default=10.00)
    
    # Payout Phase
    annuitization_date = Column(Date)
    payout_option = Column(String(50))
    payout_frequency = Column(String(20))
    payout_amount = Column(Numeric(18, 2))
    guaranteed_period_years = Column(Integer)
    
    # Beneficiary Information
    primary_beneficiary = Column(String(255))
    primary_beneficiary_percentage = Column(Numeric(5, 2), default=100.00)
    contingent_beneficiary = Column(String(255))
    death_benefit_type = Column(String(50))
    death_benefit_amount = Column(Numeric(18, 2))
    
    # Riders and Features
    living_benefit_rider = Column(Boolean, default=False)
    long_term_care_rider = Column(Boolean, default=False)
    income_rider = Column(Boolean, default=False)
    enhanced_death_benefit = Column(Boolean, default=False)
    cost_of_living_adjustment = Column(Boolean, default=False)
    rider_fees_annual = Column(Numeric(18, 2), default=0)
    
    # Tax Information
    tax_qualification = Column(String(50))
    tax_deferral_status = Column(Boolean, default=True)
    
    # Performance Tracking
    underlying_index = Column(String(100))
    performance_tracking = Column(JSON, default={})
    
    # Contract Status
    contract_status = Column(String(50), default='active')
    
    # Additional Details
    notes = Column(Text)
    documents = Column(JSON, default={})
    
    # Audit Fields
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    contributions = relationship("AnnuityContribution", back_populates="annuity", cascade="all, delete-orphan")
    valuations = relationship("AnnuityValuation", back_populates="annuity", cascade="all, delete-orphan")


class AnnuityContribution(Base):
    __tablename__ = "annuity_contributions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    annuity_id = Column(UUID(as_uuid=True), ForeignKey('annuities.id', ondelete='CASCADE'), nullable=False)
    user_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    contribution_date = Column(Date, nullable=False)
    amount = Column(Numeric(18, 2), nullable=False)
    contribution_type = Column(String(50))
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    annuity = relationship("Annuity", back_populates="contributions")


class AnnuityValuation(Base):
    __tablename__ = "annuity_valuations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    annuity_id = Column(UUID(as_uuid=True), ForeignKey('annuities.id', ondelete='CASCADE'), nullable=False)
    user_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    valuation_date = Column(Date, nullable=False)
    accumulation_value = Column(Numeric(18, 2), nullable=False)
    cash_surrender_value = Column(Numeric(18, 2), nullable=False)
    guaranteed_value = Column(Numeric(18, 2))
    market_value = Column(Numeric(18, 2))
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    annuity = relationship("Annuity", back_populates="valuations")
