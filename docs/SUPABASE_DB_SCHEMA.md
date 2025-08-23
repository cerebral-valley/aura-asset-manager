---
title: Supabase Database Schema Reference
description: Aura Asset Manager - Supabase DB Schema
---

# Supabase Database Schema Reference

## Table: assets
| Column           | Type                    | Description                                 |
|------------------|------------------------|---------------------------------------------|
| id               | uuid                    | Primary key                                 |
| user_id          | uuid                    | FK to users                                 |
| name             | text                    | Asset name                                  |
| asset_type       | text                    | Type of asset                               |
| description      | text                    | Description                                 |
| purchase_date    | date                    | Purchase date                               |
| initial_value    | numeric                 | Initial value                               |
| current_value    | numeric                 | Current value                               |
| quantity         | numeric                 | Quantity                                    |
| unit_of_measure  | text                    | Unit of measure                             |
| metadata         | jsonb                   | Metadata                                    |
| asset_metadata   | text                    | Asset metadata                              |
| annuity_type     | text                    | Annuity type                                |
| purchase_amount  | numeric                 | Purchase amount                             |
| guaranteed_rate  | numeric                 | Guaranteed rate                             |
| accumulation_phase_end | date               | Accumulation phase end                      |
| has_payment_schedule   | boolean            | Has payment schedule                        |
| created_at       | timestamptz             | Creation timestamp                          |
| updated_at       | timestamptz             | Last update timestamp                       |
| modified_at      | timestamptz             | Last modification timestamp (NEW)           |

## Table: transactions
| Column           | Type                    | Description                                 |
|------------------|------------------------|---------------------------------------------|
| id               | uuid                    | Primary key                                 |
| user_id          | uuid                    | FK to users                                 |
| asset_id         | uuid                    | FK to assets                                |
| transaction_type | text                    | Transaction type                            |
| transaction_date | timestamptz             | Transaction date                            |
| amount           | numeric                 | Amount                                      |
| quantity_change  | numeric                 | Quantity change                             |
| notes            | text                    | Notes                                       |
| metadata         | jsonb                   | Metadata                                    |
| transaction_metadata | jsonb                | Transaction metadata                        |
| asset_name       | text                    | Asset name                                  |
| asset_type       | text                    | Asset type                                  |
| acquisition_value| numeric                 | Acquisition value                           |
| current_value    | numeric                 | Current value                               |
| quantity         | numeric                 | Quantity                                    |
| unit_of_measure  | text                    | Unit of measure                             |
| asset_description| text                    | Asset description                           |
| custom_properties| text                    | Custom properties                           |
| created_at       | timestamptz             | Creation timestamp                          |
| modified_at      | timestamptz             | Last modification timestamp (NEW)           |

## Table: insurance_policies
| Column           | Type                    | Description                                 |
|------------------|------------------------|---------------------------------------------|
| id               | uuid                    | Primary key                                 |
| user_id          | uuid                    | FK to users                                 |
| policy_name      | text                    | Policy name                                 |
| policy_type      | text                    | Policy type                                 |
| provider         | text                    | Provider                                    |
| policy_number    | text                    | Policy number                               |
| coverage_amount  | numeric                 | Coverage amount                             |
| premium_amount   | numeric                 | Premium amount                              |
| premium_frequency| text                    | Premium frequency                           |
| start_date       | date                    | Start date                                  |
| end_date         | date                    | End date                                    |
| renewal_date     | date                    | Renewal date                                |
| notes            | text                    | Notes                                       |
| metadata         | jsonb                   | Metadata                                    |
| status           | text                    | Status                                      |
| has_annuity_benefit | boolean               | Has annuity benefit                         |
| cash_value       | numeric                 | Cash value                                  |
| death_benefit    | numeric                 | Death benefit                               |
| has_payment_schedule | boolean              | Has payment schedule                        |
| created_at       | timestamptz             | Creation timestamp                          |
| updated_at       | timestamptz             | Last update timestamp                       |
| modified_at      | timestamptz             | Last modification timestamp (NEW)           |

---

> This document is auto-generated for future reference. Columns marked (NEW) were added for tracking modification timestamps.
