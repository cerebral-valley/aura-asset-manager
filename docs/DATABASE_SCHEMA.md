# Aura Asset Manager - Database Schema Design

This document outlines the design of the PostgreSQL database schema for the Aura Asset Manager application. The schema is designed to be robust, flexible, and scalable, supporting various asset types, detailed transaction logging, and comprehensive insurance management. It will be hosted on Supabase.

## Core Principles

- **Normalization**: Minimize data redundancy and improve data integrity.
- **Flexibility**: Accommodate diverse asset types with varying characteristics.
- **Auditability**: Maintain a clear and immutable history of all transactions.
- **Security**: Integrate with Supabase's authentication and row-level security features.

## Table Definitions

### 1. `users` Table
Stores user authentication and profile information. This table will be managed primarily by Supabase Auth, but we include it for completeness and to store user-specific preferences like their chosen theme.

| Column Name | Data Type | Constraints | Description |
| :---------- | :-------- | :---------- | :---------- |
| `id`        | `UUID`    | `PRIMARY KEY` | Unique identifier for the user (from Supabase Auth) |
| `email`     | `TEXT`    | `NOT NULL`, `UNIQUE` | User's email address |
| `created_at`| `TIMESTAMPTZ` | `DEFAULT NOW()` | Timestamp of user creation |
| `updated_at`| `TIMESTAMPTZ` | `DEFAULT NOW()` | Last update timestamp |
| `theme`     | `TEXT`    | `DEFAULT 'sanctuary_builder'` | User's chosen UI theme (e.g., 'sanctuary_builder', 'growth_chaser', 'empire_builder') |

### 2. `assets` Table
Stores information about each individual asset owned by a user. This table is designed to be flexible, allowing for different asset types.

| Column Name | Data Type | Constraints | Description |
| :---------- | :-------- | :---------- | :---------- |
| `id`        | `UUID`    | `PRIMARY KEY`, `DEFAULT GEN_RAND_UUID()` | Unique identifier for the asset |
| `user_id`   | `UUID`    | `NOT NULL`, `FOREIGN KEY (users.id)` | The user who owns this asset |
| `name`      | `TEXT`    | `NOT NULL` | User-defined name for the asset (e.g., 



| `asset_type`| `TEXT`    | `NOT NULL` | Categorization of the asset (e.g., 'real_estate', 'stock', 'gold', 'cash', 'other') |
| `description`| `TEXT`    | `NULL` | Optional detailed description of the asset |
| `purchase_date`| `DATE`    | `NULL` | Date the asset was acquired |
| `initial_value`| `NUMERIC(18, 2)` | `NULL` | Value of the asset at the time of acquisition |
| `current_value`| `NUMERIC(18, 2)` | `NULL` | Most recently updated value of the asset |
| `quantity`  | `NUMERIC(18, 4)` | `NULL` | Quantity of the asset (e.g., shares, ounces, units). Can be fractional. |
| `unit_of_measure`| `TEXT`    | `NULL` | Unit for quantity (e.g., 'shares', 'oz', 'sqft', 'units') |
| `metadata`  | `JSONB`   | `NULL` | Flexible JSON field for asset-specific characteristics (e.g., address for real estate, ticker for stock, purity for gold) |
| `created_at`| `TIMESTAMPTZ` | `DEFAULT NOW()` | Timestamp of asset creation |
| `updated_at`| `TIMESTAMPTZ` | `DEFAULT NOW()` | Last update timestamp |

### 3. `transactions` Table
Records all financial events related to assets. This table provides an immutable audit trail of changes to asset values and quantities.

| Column Name | Data Type | Constraints | Description |
| :---------- | :-------- | :---------- | :---------- |
| `id`        | `UUID`    | `PRIMARY KEY`, `DEFAULT GEN_RAND_UUID()` | Unique identifier for the transaction |
| `user_id`   | `UUID`    | `NOT NULL`, `FOREIGN KEY (users.id)` | The user who performed the transaction |
| `asset_id`  | `UUID`    | `NOT NULL`, `FOREIGN KEY (assets.id)` | The asset involved in the transaction |
| `transaction_type`| `TEXT`    | `NOT NULL` | Type of transaction (e.g., 'purchase', 'sale', 'value_update', 'transfer', 'adjustment') |
| `transaction_date`| `TIMESTAMPTZ` | `NOT NULL` | Date and time the transaction occurred |
| `amount`    | `NUMERIC(18, 2)` | `NULL` | Monetary amount involved in the transaction (e.g., sale price, purchase cost) |
| `quantity_change`| `NUMERIC(18, 4)` | `NULL` | Change in quantity (positive for purchase, negative for sale) |
| `notes`     | `TEXT`    | `NULL` | Optional notes about the transaction |
| `metadata`  | `JSONB`   | `NULL` | Flexible JSON field for transaction-specific details (e.g., fees, counterparty) |
| `created_at`| `TIMESTAMPTZ` | `DEFAULT NOW()` | Timestamp of transaction record creation |

### 4. `insurance_policies` Table
Stores details about each insurance policy a user holds, focusing on coverage value.

| Column Name | Data Type | Constraints | Description |
| :---------- | :-------- | :---------- | :---------- |
| `id`        | `UUID`    | `PRIMARY KEY`, `DEFAULT GEN_RAND_UUID()` | Unique identifier for the insurance policy |
| `user_id`   | `UUID`    | `NOT NULL`, `FOREIGN KEY (users.id)` | The user who owns this policy |
| `policy_name`| `TEXT`    | `NOT NULL` | User-defined name for the policy (e.g., 'Family Legacy Shield') |
| `policy_type`| `TEXT`    | `NOT NULL` | Type of insurance (e.g., 'life', 'health', 'auto', 'home', 'loan') |
| `provider`  | `TEXT`    | `NULL` | Insurance provider company name |
| `policy_number`| `TEXT`    | `NULL` | Policy number from the provider |
| `coverage_amount`| `NUMERIC(18, 2)` | `NOT NULL` | The monetary value of the coverage |
| `premium_amount`| `NUMERIC(18, 2)` | `NULL` | The cost of the premium |
| `premium_frequency`| `TEXT`    | `NULL` | How often the premium is paid (e.g., 'monthly', 'annually') |
| `start_date`| `DATE`    | `NULL` | Policy start date |
| `end_date`  | `DATE`    | `NULL` | Policy end date or expiration date |
| `renewal_date`| `DATE`    | `NULL` | Next renewal date for the policy |
| `notes`     | `TEXT`    | `NULL` | Optional notes about the policy |
| `metadata`  | `JSONB`   | `NULL` | Flexible JSON field for policy-specific details |
| `created_at`| `TIMESTAMPTZ` | `DEFAULT NOW()` | Timestamp of policy record creation |
| `updated_at`| `TIMESTAMPTZ` | `DEFAULT NOW()` | Last update timestamp |

## Relationships

- `users` 1:M `assets`: One user can own many assets.
- `users` 1:M `transactions`: One user can perform many transactions.
- `users` 1:M `insurance_policies`: One user can have many insurance policies.
- `assets` 1:M `transactions`: One asset can have many associated transactions.

## Supabase Integration Notes

- **Authentication**: Supabase will handle user registration and login. The `users` table will likely be populated automatically by Supabase Auth, with `id` matching `auth.users.id`.
- **Row-Level Security (RLS)**: RLS policies will be crucial to ensure users can only access and modify their own data (`user_id` column).
- **Realtime**: Supabase Realtime can be leveraged for instant updates on the frontend (e.g., dashboard changes after a transaction).
- **Functions**: Supabase Functions (Edge Functions) could be used for complex calculations or triggers, though initial business logic will reside in the Python backend.

This schema provides a solid foundation for the Aura application, ensuring data integrity and flexibility for future enhancements.

