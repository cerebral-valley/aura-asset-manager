# Aura Asset Manager - Database Schema Design

This document outlines the current PostgreSQL database schema for the Aura Asset Manager application hosted on Supabase. The schema is designed to be robust, flexible, and scalable, supporting various asset types, detailed transaction logging, comprehensive insurance management, and annuities with advanced strategic portfolio management capabilities.

**Last Updated**: December 27, 2025  
**Database**: Supabase PostgreSQL 17.4.1.057  
**Project ID**: buuyvrysvjwqqfoyfbdr  
**Environment**: Production (Active/Healthy)  
**Schema Version**: 3.0 - Strategic Asset Management  

## Core Principles

- **Normalization**: Minimize data redundancy and improve data integrity.
- **Flexibility**: Accommodate diverse asset types with varying characteristics.
- **Auditability**: Maintain a clear and immutable history of all transactions.
- **Security**: Integrate with Supabase's authentication and row-level security features.
- **Multi-tenancy**: All tables include `user_id` foreign key for data isolation.

## Extensions Used

- `uuid-ossp` (v1.1): UUID generation functions
- `pgcrypto` (v1.3): Cryptographic functions  
- `pg_stat_statements` (v1.11): Query performance tracking
- `pg_graphql` (v1.5.11): GraphQL API support
- `supabase_vault` (v0.3.1): Secure storage extension

## Table Definitions

### 1. `users` Table

**Purpose**: Stores user authentication and comprehensive profile information  
**Rows**: 0 | **RLS Enabled**: Yes

| Column Name | Data Type | Constraints | Default | Description |
| :---------- | :-------- | :---------- | :------ | :---------- |
| `id` | `UUID` | PRIMARY KEY | `uuid_generate_v4()` | Unique identifier (Supabase Auth) |
| `email` | `TEXT` | NOT NULL, UNIQUE | - | User's email address |
| `created_at` | `TIMESTAMPTZ` | NULLABLE | `now()` | Account creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | NULLABLE | `now()` | Last update timestamp |
| `theme` | `TEXT` | NULLABLE | `'sanctuary_builder'` | UI theme preference |
| `first_name` | `VARCHAR` | NULLABLE | - | User's first name |
| `last_name` | `VARCHAR` | NULLABLE | - | User's last name |
| `recovery_email` | `VARCHAR` | NULLABLE | - | Alternative email for recovery |
| `country` | `VARCHAR` | NULLABLE | - | Country of residence |
| `currency` | `VARCHAR` | NULLABLE | `'USD'` | Preferred currency |
| `date_format` | `VARCHAR` | NULLABLE | `'MM/DD/YYYY'` | Preferred date format |
| `dark_mode` | `BOOLEAN` | NULLABLE | `false` | Dark mode preference |
| `last_login_at` | `TIMESTAMPTZ` | NULLABLE | - | Last login timestamp |
| `marital_status` | `TEXT` | NULLABLE | - | CHECK: single, married, divorced, widowed, separated |
| `gender` | `TEXT` | NULLABLE | - | CHECK: male, female, other, prefer_not_to_say |
| `date_of_birth` | `DATE` | NULLABLE | - | User's birth date |
| `children` | `INTEGER` | NULLABLE | `0` | Number of children |
| `dependents` | `INTEGER` | NULLABLE | `0` | Number of dependents |
| `annual_income` | `NUMERIC` | NULLABLE | - | Annual income amount |
| `tax_paid_last_year` | `NUMERIC` | NULLABLE | - | Tax amount from previous year |
| `city` | `VARCHAR` | NULLABLE | - | City of residence |
| `pin` | `VARCHAR` | NULLABLE | - | Postal/PIN code |
| `state` | `VARCHAR` | NULLABLE | - | State/province |
| `nationality` | `VARCHAR` | NULLABLE | - | User's nationality |
| `phone_number` | `VARCHAR` | NULLABLE | - | Contact phone number |
| `occupation` | `TEXT` | NULLABLE | - | CHECK: employed, self_employed, unemployed, retired, student, homemaker, other |
| `pin_code` | `VARCHAR` | NULLABLE | - | Alternative PIN code field |
| `risk_appetite` | `VARCHAR` | NULLABLE | - | CHECK: Low, Moderate, High |
| `partner` | `BOOLEAN` | NULLABLE | `false` | Has partner/spouse |
| `partner_name` | `VARCHAR` | NULLABLE | - | Partner's name |
| `elderly_dependents` | `BOOLEAN` | NULLABLE | `false` | Has elderly dependents |
| `children_age_groups` | `TEXT[]` | NULLABLE | `'{}'` | Array of children's age groups |
| `emergency_contact_name` | `VARCHAR` | NULLABLE | - | Emergency contact name |
| `emergency_contact_phone` | `VARCHAR` | NULLABLE | - | Emergency contact phone |
| `user_code` | `VARCHAR` | NULLABLE, UNIQUE | - | Unique user identification code |

### 2. `assets` Table

**Purpose**: Stores information about each individual asset owned by a user with comprehensive strategic classification  
**Rows**: 26 | **RLS Enabled**: Yes

| Column Name | Data Type | Constraints | Default | Description |
| :---------- | :-------- | :---------- | :------ | :---------- |
| `id` | `UUID` | PRIMARY KEY | `uuid_generate_v4()` | Unique identifier for the asset |
| `user_id` | `UUID` | NOT NULL, FK(users.id) | - | The user who owns this asset |
| `name` | `TEXT` | NOT NULL | - | User-defined name for the asset |
| `asset_type` | `TEXT` | NOT NULL | - | Asset categorization (real_estate, stock, gold, cash, etc.) |
| `description` | `TEXT` | NULLABLE | - | Optional detailed description |
| `purchase_date` | `DATE` | NULLABLE | - | Date the asset was acquired |
| `initial_value` | `NUMERIC` | NULLABLE | - | Value at acquisition |
| `current_value` | `NUMERIC` | NULLABLE | - | Most recently updated value |
| `quantity` | `NUMERIC` | NULLABLE | - | Quantity of the asset (fractional allowed) |
| `unit_of_measure` | `TEXT` | NULLABLE | - | Unit for quantity (shares, oz, sqft, units) |
| `metadata` | `JSONB` | NULLABLE | - | Asset-specific characteristics (address, ticker, etc.) |
| `created_at` | `TIMESTAMPTZ` | NULLABLE | `now()` | Asset creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | NULLABLE | `now()` | Last update timestamp |
| `asset_metadata` | `TEXT` | NULLABLE | - | Additional text metadata |
| `annuity_type` | `TEXT` | NULLABLE | - | CHECK: fixed, variable, indexed, immediate, deferred |
| `purchase_amount` | `NUMERIC` | NULLABLE | - | Amount paid for asset |
| `guaranteed_rate` | `NUMERIC` | NULLABLE | - | Guaranteed return rate |
| `accumulation_phase_end` | `DATE` | NULLABLE | - | End date of accumulation phase |
| `has_payment_schedule` | `BOOLEAN` | NULLABLE | `false` | Has associated payment schedule |
| `modified_at` | `TIMESTAMPTZ` | NULLABLE | - | Last modification timestamp |
| `liquid_assets` | `BOOLEAN` | NULLABLE | `false` | Asset is liquid/easily convertible to cash |
| `is_selected` | `BOOLEAN` | NULLABLE | `false` | Asset is currently selected in UI |
| `time_horizon` | `TEXT` | NULLABLE | - | CHECK: short_term, medium_term, long_term |
| `asset_purpose` | `TEXT` | NULLABLE | - | CHECK: Growth, Income, Capital Preservation, Speculation, Hedge, Legacy |

**Strategic Classification Fields**:
- **time_horizon**: Investment time frame (short_term: 0-2 years, medium_term: 2-10 years, long_term: 10+ years)
- **asset_purpose**: Strategic role of the asset in portfolio (Growth, Income, Capital Preservation, Speculation, Hedge, Legacy)
- **liquid_assets**: Indicates whether the asset can be easily converted to cash within days

### 3. `transactions` Table

**Purpose**: Records all financial events and asset changes with comprehensive transaction types  
**Rows**: 11+ | **RLS Enabled**: Yes

| Column Name | Data Type | Constraints | Default | Description |
| :---------- | :-------- | :---------- | :------ | :---------- |
| `id` | `UUID` | PRIMARY KEY | `uuid_generate_v4()` | Unique identifier for the transaction |
| `user_id` | `UUID` | NOT NULL, FK(users.id) | - | User who performed the transaction |
| `asset_id` | `UUID` | NOT NULL, FK(assets.id) | - | Asset involved in the transaction |
| `transaction_type` | `TEXT` | NOT NULL | - | Type (purchase, sale, value_update, update_quantity_units, update_description_properties, etc.) |
| `transaction_date` | `TIMESTAMPTZ` | NOT NULL | - | Date and time of transaction |
| `amount` | `NUMERIC` | NULLABLE | - | Monetary amount involved |
| `quantity_change` | `NUMERIC` | NULLABLE | - | Change in quantity (+ purchase, - sale) |
| `notes` | `TEXT` | NULLABLE | - | Optional transaction notes |
| `metadata` | `JSONB` | NULLABLE | - | Transaction-specific details (fees, etc.) |
| `created_at` | `TIMESTAMPTZ` | NULLABLE | `now()` | Transaction record creation |
| `transaction_metadata` | `JSONB` | NULLABLE | `'{}'` | Additional transaction metadata |
| `asset_name` | `TEXT` | NULLABLE | - | Denormalized asset name |
| `asset_type` | `TEXT` | NULLABLE | - | Denormalized asset type |
| `acquisition_value` | `NUMERIC` | NULLABLE | - | Asset acquisition value |
| `current_value` | `NUMERIC` | NULLABLE | - | Asset current value at transaction time |
| `quantity` | `NUMERIC` | NULLABLE | - | Asset quantity at transaction time |
| `unit_of_measure` | `TEXT` | NULLABLE | - | Unit of measure at transaction time |
| `asset_description` | `TEXT` | NULLABLE | - | Asset description at transaction time |
| `custom_properties` | `TEXT` | NULLABLE | - | Custom asset properties |
| `modified_at` | `TIMESTAMPTZ` | NULLABLE | - | Last modification timestamp |

**Enhanced Transaction Types**:
- **purchase**: Acquiring new assets or adding to existing holdings
- **sale**: Disposing of assets (partial or complete)
- **value_update**: Updating current market values without buying/selling
- **transfer**: Moving assets between accounts or locations
- **update_quantity_units**: Stock splits, dividend reinvestments, corporate actions
- **update_description_properties**: Modifying asset metadata or characteristics
- **income**: Recording dividends, rent, interest, or other asset-generated income

### 4. `insurance_policies` Table
**Purpose**: Stores details about insurance policies and coverage  
**Rows**: 1 | **RLS Enabled**: Yes

| Column Name | Data Type | Constraints | Default | Description |
| :---------- | :-------- | :---------- | :------ | :---------- |
| `id` | `UUID` | PRIMARY KEY | `uuid_generate_v4()` | Unique identifier for the policy |
| `user_id` | `UUID` | NOT NULL, FK(users.id) | - | User who owns this policy |
| `policy_name` | `TEXT` | NOT NULL | - | User-defined policy name |
| `policy_type` | `TEXT` | NOT NULL | - | Type of insurance (life, health, auto, etc.) |
| `provider` | `TEXT` | NULLABLE | - | Insurance provider company |
| `policy_number` | `TEXT` | NULLABLE | - | Policy number from provider |
| `coverage_amount` | `NUMERIC` | NOT NULL | - | Monetary value of coverage |
| `premium_amount` | `NUMERIC` | NULLABLE | - | Cost of the premium |
| `premium_frequency` | `TEXT` | NULLABLE | - | Payment frequency (monthly, annually) |
| `start_date` | `DATE` | NULLABLE | - | Policy start date |
| `end_date` | `DATE` | NULLABLE | - | Policy end/expiration date |
| `renewal_date` | `DATE` | NULLABLE | - | Next renewal date |
| `notes` | `TEXT` | NULLABLE | - | Optional policy notes |
| `metadata` | `JSONB` | NULLABLE | - | Policy-specific details |
| `created_at` | `TIMESTAMPTZ` | NULLABLE | `now()` | Policy record creation |
| `updated_at` | `TIMESTAMPTZ` | NULLABLE | `now()` | Last update timestamp |
| `status` | `TEXT` | NULLABLE | `'active'` | Policy status |
| `has_annuity_benefit` | `BOOLEAN` | NULLABLE | `false` | Has annuity benefit feature |
| `cash_value` | `NUMERIC` | NULLABLE | - | Current cash value |
| `death_benefit` | `NUMERIC` | NULLABLE | - | Death benefit amount |
| `has_payment_schedule` | `BOOLEAN` | NULLABLE | `false` | Has payment schedule |
| `modified_at` | `TIMESTAMPTZ` | NULLABLE | - | Last modification timestamp |

### 5. `payment_schedules` Table
**Purpose**: Manages payment schedules for assets and insurance  
**Rows**: 0 | **RLS Enabled**: Yes

| Column Name | Data Type | Constraints | Default | Description |
| :---------- | :-------- | :---------- | :------ | :---------- |
| `id` | `UUID` | PRIMARY KEY | `uuid_generate_v4()` | Unique identifier |
| `user_id` | `UUID` | NOT NULL, FK(users.id) | - | User who owns the schedule |
| `related_id` | `UUID` | NOT NULL | - | ID of related asset/policy |
| `related_type` | `TEXT` | NOT NULL | - | CHECK: asset, insurance_policy |
| `schedule_type` | `TEXT` | NOT NULL | - | CHECK: payment_out, payment_in, premium |
| `amount` | `NUMERIC` | NOT NULL | - | Payment amount |
| `frequency` | `TEXT` | NOT NULL | - | CHECK: monthly, quarterly, semi-annually, annually |
| `start_date` | `DATE` | NOT NULL | - | Schedule start date |
| `end_date` | `DATE` | NULLABLE | - | Schedule end date |
| `next_payment_date` | `DATE` | NULLABLE | - | Next payment due date |
| `total_payments_made` | `INTEGER` | NULLABLE | `0` | Count of completed payments |
| `total_amount_paid` | `NUMERIC` | NULLABLE | `0` | Total amount paid to date |
| `is_active` | `BOOLEAN` | NULLABLE | `true` | Schedule is active |
| `metadata` | `JSONB` | NULLABLE | `'{}'` | Schedule-specific details |
| `created_at` | `TIMESTAMPTZ` | NULLABLE | `now()` | Record creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | NULLABLE | `now()` | Last update timestamp |

### 6. `feedback` Table
**Purpose**: Stores user feedback and support requests  
**Rows**: 0 | **RLS Enabled**: Yes

| Column Name | Data Type | Constraints | Default | Description |
| :---------- | :-------- | :---------- | :------ | :---------- |
| `feedback_id` | `UUID` | PRIMARY KEY | `uuid_generate_v4()` | Unique identifier |
| `user_id` | `UUID` | NULLABLE, FK(users.id) | - | User who submitted feedback |
| `feedback_text` | `TEXT` | NOT NULL | - | Feedback content (max 2500 chars) |
| `feedback_date` | `TIMESTAMPTZ` | NOT NULL | `now()` | Submission timestamp |

### 7. `countries` Table
**Purpose**: Reference table for country data  
**Rows**: 59 | **RLS Enabled**: Yes

| Column Name | Data Type | Constraints | Default | Description |
| :---------- | :-------- | :---------- | :------ | :---------- |
| `id` | `UUID` | PRIMARY KEY | `uuid_generate_v4()` | Unique identifier |
| `name` | `VARCHAR` | NOT NULL | - | Country name |
| `code` | `VARCHAR` | NOT NULL, UNIQUE | - | Country code |
| `created_at` | `TIMESTAMPTZ` | NULLABLE | `now()` | Record creation timestamp |

### 8. `annuities` Table
**Purpose**: Comprehensive annuity product management  
**Rows**: 0 | **RLS Enabled**: Yes

| Column Name | Data Type | Constraints | Default | Description |
| :---------- | :-------- | :---------- | :------ | :---------- |
| `id` | `UUID` | PRIMARY KEY | `uuid_generate_v4()` | Unique identifier |
| `user_id` | `UUID` | NOT NULL, FK(users.id) | - | User who owns the annuity |
| `contract_number` | `VARCHAR` | NULLABLE | - | Contract number |
| `product_name` | `VARCHAR` | NOT NULL | - | Annuity product name |
| `provider_company` | `VARCHAR` | NULLABLE | - | Insurance/financial company |
| `annuity_type` | `VARCHAR` | NULLABLE | - | Type of annuity |
| `purchase_date` | `DATE` | NULLABLE | - | Date of purchase |
| `initial_premium` | `NUMERIC` | NULLABLE | - | Initial premium paid |
| `additional_premiums_allowed` | `BOOLEAN` | NULLABLE | `false` | Can add more premiums |
| `funding_type` | `VARCHAR` | NULLABLE | - | How annuity is funded |
| `guaranteed_rate` | `NUMERIC` | NULLABLE | - | Guaranteed return rate |
| `current_rate` | `NUMERIC` | NULLABLE | - | Current return rate |
| `participation_rate` | `NUMERIC` | NULLABLE | - | Market participation rate |
| `cap_rate` | `NUMERIC` | NULLABLE | - | Maximum return cap |
| `floor_rate` | `NUMERIC` | NULLABLE | - | Minimum return floor |
| `accumulation_value` | `NUMERIC` | NULLABLE | - | Current accumulated value |
| `cash_surrender_value` | `NUMERIC` | NULLABLE | - | Cash value if surrendered |
| `surrender_charge_rate` | `NUMERIC` | NULLABLE | - | Early surrender penalty rate |
| `surrender_period_years` | `INTEGER` | NULLABLE | - | Years with surrender charges |
| `free_withdrawal_percentage` | `NUMERIC` | NULLABLE | - | Free withdrawal limit |
| `annuitization_date` | `DATE` | NULLABLE | - | When payments begin |
| `payout_option` | `VARCHAR` | NULLABLE | - | Type of payout selected |
| `payout_frequency` | `VARCHAR` | NULLABLE | - | Payment frequency |
| `payout_amount` | `NUMERIC` | NULLABLE | - | Payment amount |
| `guaranteed_period_years` | `INTEGER` | NULLABLE | - | Guaranteed payment period |
| `primary_beneficiary` | `VARCHAR` | NULLABLE | - | Primary beneficiary name |
| `primary_beneficiary_percentage` | `NUMERIC` | NULLABLE | - | Primary beneficiary percentage |
| `contingent_beneficiary` | `VARCHAR` | NULLABLE | - | Contingent beneficiary name |
| `death_benefit_type` | `VARCHAR` | NULLABLE | - | Type of death benefit |
| `death_benefit_amount` | `NUMERIC` | NULLABLE | - | Death benefit amount |
| `living_benefit_rider` | `BOOLEAN` | NULLABLE | `false` | Has living benefit rider |
| `long_term_care_rider` | `BOOLEAN` | NULLABLE | `false` | Has LTC rider |
| `income_rider` | `BOOLEAN` | NULLABLE | `false` | Has income rider |
| `enhanced_death_benefit` | `BOOLEAN` | NULLABLE | `false` | Has enhanced death benefit |
| `cost_of_living_adjustment` | `BOOLEAN` | NULLABLE | `false` | Has COLA adjustment |
| `rider_fees_annual` | `NUMERIC` | NULLABLE | - | Annual rider fees |
| `tax_qualification` | `VARCHAR` | NULLABLE | - | Tax qualification status |
| `tax_deferral_status` | `VARCHAR` | NULLABLE | - | Tax deferral status |
| `underlying_index` | `VARCHAR` | NULLABLE | - | Index for indexed annuities |
| `performance_tracking` | `TEXT` | NULLABLE | - | Performance tracking details |
| `contract_status` | `VARCHAR` | NULLABLE | `'active'` | Current contract status |
| `notes` | `TEXT` | NULLABLE | - | Additional notes |
| `documents` | `JSONB` | NULLABLE | `'[]'` | Associated documents |
| `created_at` | `TIMESTAMP` | NULLABLE | `now()` | Record creation timestamp |
| `updated_at` | `TIMESTAMP` | NULLABLE | `now()` | Last update timestamp |

## Relationships & Foreign Keys

### Primary Relationships
- **users** 1:M **assets**: One user can own multiple assets
- **users** 1:M **transactions**: One user can have multiple transactions  
- **users** 1:M **insurance_policies**: One user can have multiple policies
- **users** 1:M **payment_schedules**: One user can have multiple schedules
- **users** 1:M **feedback**: One user can submit multiple feedback entries
- **users** 1:M **annuities**: One user can own multiple annuities
- **assets** 1:M **transactions**: One asset can have multiple transactions

### Foreign Key Constraints
- `assets.user_id` → `users.id`
- `transactions.user_id` → `users.id`
- `transactions.asset_id` → `assets.id`
- `insurance_policies.user_id` → `users.id`
- `payment_schedules.user_id` → `users.id`
- `feedback.user_id` → `users.id` (nullable)
- `annuities.user_id` → `users.id`

## Data Integrity & Constraints

### Check Constraints

- **users.marital_status**: single, married, divorced, widowed, separated
- **users.gender**: male, female, other, prefer_not_to_say  
- **users.occupation**: employed, self_employed, unemployed, retired, student, homemaker, other
- **users.risk_appetite**: Low, Moderate, High
- **assets.annuity_type**: fixed, variable, indexed, immediate, deferred
- **assets.time_horizon**: short_term, medium_term, long_term
- **assets.asset_purpose**: Growth, Income, Capital Preservation, Speculation, Hedge, Legacy
- **payment_schedules.related_type**: asset, insurance_policy
- **payment_schedules.schedule_type**: payment_out, payment_in, premium
- **payment_schedules.frequency**: monthly, quarterly, semi-annually, annually
- **feedback.feedback_text**: LENGTH <= 2500 characters

### Unique Constraints
- **users.email**: Unique across all users
- **users.user_code**: Unique user identification code
- **countries.code**: Unique country codes

## Supabase Integration Features

### Row-Level Security (RLS)
**All tables have RLS enabled** to ensure users can only access their own data via `user_id` filtering.

### Authentication Integration
- **users.id** matches Supabase Auth `auth.users.id`
- JWT tokens validated via Supabase service key
- Automatic user creation on first login

### Real-time Capabilities
- Dashboard updates via Supabase Realtime subscriptions
- Live asset value updates
- Transaction notifications

### Edge Functions
- Complex calculations and business logic
- Scheduled tasks (payment reminders, etc.)
- Third-party API integrations

## Performance Considerations

### Indexes
- Primary keys (UUID) are automatically indexed
- Foreign key columns should have indexes for join performance
- Consider indexes on frequently queried columns (asset_type, transaction_date, etc.)

### Data Types
- **NUMERIC**: Used for financial amounts (no precision specified for flexibility)
- **JSONB**: Efficient storage and querying of flexible metadata
- **UUID**: Distributed system-friendly primary keys
- **TIMESTAMPTZ**: Timezone-aware timestamps

### Optimization Notes
- Denormalized fields in transactions table improve query performance
- JSONB columns allow flexible schema evolution
- Boolean flags enable efficient filtering

## 🚨 KEYWORD CONFLICT ANALYSIS

### Python Reserved Words & Builtin Conflicts
**CRITICAL ISSUES FOUND:**

1. **`id`** - Present in ALL tables as primary key
   - **Risk**: Medium - Common Python builtin function
   - **Impact**: Can shadow `id()` builtin function in Python code
   - **Recommendation**: Use `record.id` or `obj.id` instead of bare `id`

2. **`type`** - Present as suffixes in multiple columns
   - `asset_type`, `transaction_type`, `policy_type`, `annuity_type`, etc.
   - **Risk**: Medium - Python builtin `type()` function
   - **Impact**: No direct conflict (suffixed), but be cautious in variable naming

3. **`input`** - Not present but worth noting for future columns
   - **Risk**: High if added - Python builtin function

### JavaScript Reserved Words Conflicts
**ISSUES FOUND:**

1. **`class`** - Not present in current schema ✅
2. **`function`** - Not present in current schema ✅  
3. **`const`** - Not present in current schema ✅
4. **`let`** - Not present in current schema ✅
5. **`var`** - Not present in current schema ✅

**POTENTIAL FUTURE CONCERNS:**

- Column names ending in `_class` (e.g., `asset_class`) would be safe
- Avoid bare keywords like `class`, `function`, `return`, `new`, `this`

### SQL Reserved Words Conflicts  
**ISSUES FOUND:**

1. **`user`** - Present in table name `users` (pluralized - SAFE)
2. **`date`** - Present in multiple column names with prefixes (SAFE)
   - `purchase_date`, `start_date`, `end_date`, etc.
3. **`status`** - Present in `insurance_policies.status`
   - **Risk**: Medium - SQL reserved word
   - **Impact**: Must be quoted in raw SQL: `"status"`
4. **`code`** - Present in `countries.code` and `users.user_code`  
   - **Risk**: Low - Not typically reserved, but contextual

### Backend/ORM Considerations (SQLAlchemy)

**SAFE PATTERNS:**
- All column names work well with SQLAlchemy ORM
- Underscore naming convention is Python-friendly
- No conflicts with SQLAlchemy reserved attributes

**RECOMMENDATIONS:**
1. **Keep current naming** - No critical conflicts requiring immediate changes
2. **Be cautious with `id`** - Use qualified references (`user.id`, `asset.id`)
3. **Quote `status` in raw SQL** when necessary
4. **Future column naming** - Avoid bare reserved words (class, function, return, new, etc.)
5. **Use prefixes/suffixes** for potentially conflicting names

### Programming Language Specific Notes

**Python Best Practices:**
```python
# ✅ GOOD - Qualified access
user_id = user.id  
asset_type = asset.asset_type

# ❌ AVOID - Bare 'id' variable
id = get_user_id()  # Shadows builtin id()
```

**JavaScript Best Practices:**  
```javascript
// ✅ GOOD - Object property access
const userId = user.id;
const assetType = asset.asset_type;

// ✅ SAFE - No reserved word conflicts in current schema
```

**SQL Best Practices:**
```sql
-- ✅ GOOD - Quote reserved words when necessary  
SELECT "status", policy_name FROM insurance_policies;

-- ✅ GOOD - Most columns are safe
SELECT id, user_id, asset_type FROM assets;
```

## Conclusion

The current database schema is **well-designed** with minimal keyword conflicts. The most significant consideration is the ubiquitous use of `id` as primary keys, which requires careful variable naming in Python code to avoid shadowing the builtin `id()` function.

**Overall Assessment**: ✅ **SAFE TO USE** - No critical conflicts requiring immediate schema changes.

---

*This document is automatically updated from the live Supabase database schema. Last sync: September 26, 2025*

