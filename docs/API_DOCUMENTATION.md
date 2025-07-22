# Aura Asset Manager - API Documentation

This document provides comprehensive documentation for the Aura Asset Manager REST API. The API is built using FastAPI and provides endpoints for managing users, assets, transactions, and insurance policies.

## Base URL and Authentication

### Base URL
```
Production: https://your-domain.com/api/v1
Development: http://localhost:8000/api/v1
```

### Authentication
The API uses Bearer token authentication with JWT tokens provided by Supabase Auth. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

All endpoints except health checks require authentication. Tokens are obtained through Supabase authentication flow in the frontend application.

## Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "data": {...},
  "message": "Success message (optional)"
}
```

### Error Response
```json
{
  "detail": "Error description",
  "error_code": "ERROR_CODE (optional)"
}
```

## Authentication Endpoints

### Get Current User Profile
```http
GET /auth/me
```

Returns the current authenticated user's profile information.

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "theme": "sanctuary_builder",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### Update User Profile
```http
PUT /auth/me
```

Updates the current user's profile information.

**Request Body:**
```json
{
  "theme": "empire_builder"
}
```

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "theme": "empire_builder",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T12:00:00Z"
}
```

## Dashboard Endpoints

### Get Dashboard Summary
```http
GET /dashboard/summary
```

Returns comprehensive dashboard data including net worth, insurance coverage, asset allocation, and recent transactions.

**Response:**
```json
{
  "net_worth": 150000.00,
  "total_insurance_coverage": 500000.00,
  "asset_allocation": [
    {
      "name": "Real Estate",
      "value": 100000.00
    },
    {
      "name": "Stocks",
      "value": 30000.00
    },
    {
      "name": "Cash",
      "value": 20000.00
    }
  ],
  "recent_transactions": [
    {
      "id": "uuid",
      "asset_name": "Apple Inc.",
      "transaction_type": "purchase",
      "amount": 5000.00,
      "date": "2024-01-15T10:30:00Z"
    }
  ],
  "user_theme": "sanctuary_builder"
}
```

## Asset Endpoints

### Get All Assets
```http
GET /assets
```

Returns a list of all assets owned by the current user.

**Query Parameters:**
- `asset_type` (optional): Filter by asset type
- `sort_by` (optional): Sort field (name, current_value, created_at)
- `sort_order` (optional): asc or desc

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Family Home",
    "asset_type": "real_estate",
    "current_value": 350000.00,
    "quantity": 1,
    "unit_of_measure": "property"
  }
]
```

### Get Single Asset
```http
GET /assets/{asset_id}
```

Returns detailed information about a specific asset.

**Response:**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "name": "Family Home",
  "asset_type": "real_estate",
  "description": "Our primary residence",
  "purchase_date": "2020-06-15",
  "initial_value": 300000.00,
  "current_value": 350000.00,
  "quantity": 1,
  "unit_of_measure": "property",
  "metadata": {
    "address": "123 Main Street",
    "square_feet": 2000,
    "bedrooms": 3,
    "bathrooms": 2
  },
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### Create Asset
```http
POST /assets
```

Creates a new asset for the current user.

**Request Body:**
```json
{
  "name": "Apple Inc. Stock",
  "asset_type": "stock",
  "description": "Technology stock investment",
  "purchase_date": "2024-01-15",
  "initial_value": 5000.00,
  "current_value": 5000.00,
  "quantity": 100,
  "unit_of_measure": "shares",
  "metadata": {
    "ticker": "AAPL",
    "exchange": "NASDAQ"
  }
}
```

**Response:**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "name": "Apple Inc. Stock",
  "asset_type": "stock",
  "description": "Technology stock investment",
  "purchase_date": "2024-01-15",
  "initial_value": 5000.00,
  "current_value": 5000.00,
  "quantity": 100,
  "unit_of_measure": "shares",
  "metadata": {
    "ticker": "AAPL",
    "exchange": "NASDAQ"
  },
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

### Update Asset
```http
PUT /assets/{asset_id}
```

Updates an existing asset.

**Request Body:**
```json
{
  "current_value": 5500.00,
  "description": "Updated description"
}
```

### Delete Asset
```http
DELETE /assets/{asset_id}
```

Deletes an asset and all associated transactions.

**Response:**
```json
{
  "message": "Asset deleted successfully"
}
```

## Transaction Endpoints

### Get All Transactions
```http
GET /transactions
```

Returns all transactions for the current user, ordered by creation date (newest first).

**Query Parameters:**
- `asset_id` (optional): Filter by specific asset
- `transaction_type` (optional): Filter by transaction type
- `limit` (optional): Limit number of results
- `offset` (optional): Pagination offset

**Response:**
```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "asset_id": "uuid",
    "transaction_type": "purchase",
    "transaction_date": "2024-01-15T10:30:00Z",
    "amount": 5000.00,
    "quantity_change": 100,
    "notes": "Initial stock purchase",
    "metadata": {
      "broker": "Example Broker",
      "fees": 9.99
    },
    "created_at": "2024-01-15T10:30:00Z",
    "asset_name": "Apple Inc. Stock",
    "asset_type": "stock"
  }
]
```

### Get Asset Transactions
```http
GET /transactions/asset/{asset_id}
```

Returns all transactions for a specific asset.

### Create Transaction
```http
POST /transactions
```

Creates a new transaction and automatically updates the associated asset.

**Request Body:**
```json
{
  "asset_id": "uuid",
  "transaction_type": "purchase",
  "transaction_date": "2024-01-15T10:30:00Z",
  "amount": 5000.00,
  "quantity_change": 100,
  "notes": "Initial stock purchase",
  "metadata": {
    "broker": "Example Broker",
    "fees": 9.99
  }
}
```

**Transaction Types:**
- `purchase`: Acquiring new assets or adding to existing holdings
- `sale`: Disposing of assets (partial or complete)
- `value_update`: Updating current market value without buying/selling
- `transfer`: Moving assets between accounts
- `adjustment`: Administrative corrections

### Update Transaction
```http
PUT /transactions/{transaction_id}
```

Updates an existing transaction.

### Delete Transaction
```http
DELETE /transactions/{transaction_id}
```

Deletes a transaction.

## Insurance Endpoints

### Get All Insurance Policies
```http
GET /insurance
```

Returns all insurance policies for the current user.

**Response:**
```json
[
  {
    "id": "uuid",
    "policy_name": "Family Life Insurance",
    "policy_type": "life",
    "coverage_amount": 500000.00,
    "renewal_date": "2024-12-31"
  }
]
```

### Get Single Insurance Policy
```http
GET /insurance/{policy_id}
```

Returns detailed information about a specific insurance policy.

**Response:**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "policy_name": "Family Life Insurance",
  "policy_type": "life",
  "provider": "Example Insurance Co.",
  "policy_number": "POL-123456789",
  "coverage_amount": 500000.00,
  "premium_amount": 150.00,
  "premium_frequency": "monthly",
  "start_date": "2023-01-01",
  "end_date": null,
  "renewal_date": "2024-12-31",
  "notes": "Term life insurance policy",
  "metadata": {
    "beneficiaries": ["Spouse", "Children"],
    "term_length": "20 years"
  },
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-01-01T00:00:00Z"
}
```

### Create Insurance Policy
```http
POST /insurance
```

Creates a new insurance policy.

**Request Body:**
```json
{
  "policy_name": "Home Insurance",
  "policy_type": "home",
  "provider": "Example Insurance Co.",
  "policy_number": "HOME-987654321",
  "coverage_amount": 350000.00,
  "premium_amount": 1200.00,
  "premium_frequency": "annually",
  "start_date": "2024-01-01",
  "renewal_date": "2024-12-31",
  "notes": "Homeowner's insurance policy",
  "metadata": {
    "property_address": "123 Main Street",
    "deductible": 1000.00
  }
}
```

**Policy Types:**
- `life`: Life insurance policies
- `health`: Health insurance coverage
- `auto`: Vehicle insurance
- `home`: Property insurance
- `loan`: Loan protection insurance
- `other`: Other types of coverage

### Update Insurance Policy
```http
PUT /insurance/{policy_id}
```

Updates an existing insurance policy.

### Delete Insurance Policy
```http
DELETE /insurance/{policy_id}
```

Deletes an insurance policy.

## Error Codes

The API uses standard HTTP status codes and may include specific error codes in the response:

### HTTP Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `422`: Validation Error
- `500`: Internal Server Error

### Custom Error Codes
- `ASSET_NOT_FOUND`: Requested asset does not exist
- `TRANSACTION_INVALID`: Transaction data is invalid
- `INSUFFICIENT_QUANTITY`: Attempting to sell more than owned
- `POLICY_NOT_FOUND`: Insurance policy does not exist
- `USER_NOT_AUTHORIZED`: User lacks permission for requested action

## Rate Limiting

The API implements rate limiting to prevent abuse:
- 100 requests per minute per user for general endpoints
- 10 requests per minute for write operations (POST, PUT, DELETE)
- Rate limit headers are included in responses:
  - `X-RateLimit-Limit`: Request limit per window
  - `X-RateLimit-Remaining`: Requests remaining in current window
  - `X-RateLimit-Reset`: Time when rate limit resets

## Data Validation

### Asset Validation
- Asset names must be 1-200 characters
- Asset types must be from predefined list
- Monetary values must be non-negative
- Quantities must be positive for most asset types

### Transaction Validation
- Transaction dates cannot be in the future
- Sale quantities cannot exceed current holdings
- Monetary amounts must be positive for purchases
- Asset must exist and belong to the user

### Insurance Validation
- Coverage amounts must be positive
- Premium amounts must be non-negative
- Dates must be valid and logical (start before end)
- Policy names must be unique per user

## Pagination

List endpoints support pagination using offset and limit parameters:

```http
GET /assets?limit=20&offset=40
```

Paginated responses include metadata:
```json
{
  "data": [...],
  "pagination": {
    "total": 150,
    "limit": 20,
    "offset": 40,
    "has_next": true,
    "has_previous": true
  }
}
```

## Filtering and Sorting

Many endpoints support filtering and sorting:

### Filtering
```http
GET /assets?asset_type=stock&current_value_min=1000
```

### Sorting
```http
GET /transactions?sort_by=transaction_date&sort_order=desc
```

This API documentation provides comprehensive coverage of all available endpoints and their usage. For additional examples and interactive testing, visit the automatically generated API documentation at `/docs` when running the backend server.

