# Aura Asset Manager - File Structure

This document provides a comprehensive overview of the project's file structure and organization.

## Root Directory Structure

```
aura-asset-manager/
├── README.md                    # Main project overview
├── .gitignore                   # Git ignore rules
├── docker-compose.yml           # Docker orchestration for development
├── frontend/                    # React (Vite) application
├── backend/                     # Python FastAPI application
├── database/                    # Database schemas and migrations
└── docs/                        # Project documentation
```

## Frontend Directory Structure

```
frontend/
├── package.json                 # Node.js dependencies and scripts
├── pnpm-lock.yaml               # Locked dependency versions (pnpm)
├── vite.config.js               # Vite configuration
├── tailwind.config.js           # Tailwind CSS configuration
├── postcss.config.js            # PostCSS configuration
├── .env.example                 # Environment variables template
├── .env.local                   # Local environment variables (for development)
├── public/                      # Static assets
│   ├── favicon.ico
│   └── vite.svg
├── src/                         # Source code
│   ├── main.jsx                 # Entry point for the React app
│   ├── App.jsx                  # Main App component
│   ├── App.css                  # Global app styles (includes Tailwind imports)
│   ├── index.css                # Base styles
│   ├── assets/                  # Static assets like images
│   │   └── react.svg
│   ├── components/              # Reusable UI components
│   │   ├── auth/                # Authentication components
│   │   │   └── LoginForm.jsx
│   │   ├── layout/              # Layout components
│   │   │   ├── AppLayout.jsx
│   │   │   └── AppLayout.css
│   │   ├── dashboard/           # Dashboard-specific components
│   │   │   ├── ValueDisplayCard.jsx
│   │   │   ├── AssetAllocationChart.jsx
│   │   │   └── RecentTransactions.jsx
│   │   └── ui/                  # shadcn/ui components
│   │       ├── button.jsx
│   │       ├── card.jsx
│   │       ├── input.jsx
│   │       ├── label.jsx
│   │       ├── alert.jsx
│   │       └── ... (other shadcn/ui components)
│   ├── hooks/                   # Custom React hooks
│   │   ├── useAuth.js
│   │   └── use-mobile.js
│   ├── lib/                     # Utility functions and configurations
│   │   ├── api.js               # Axios API client configuration
│   │   ├── supabase.js          # Supabase client configuration
│   │   └── utils.js             # General utility functions
│   ├── pages/                   # Main application pages
│   │   └── Dashboard.jsx
│   └── services/                # API service functions
│       ├── assets.js            # Asset-related API calls
│       ├── dashboard.js         # Dashboard API calls
│       ├── insurance.js         # Insurance API calls
│       └── transactions.js      # Transaction API calls
```

## Backend Directory Structure

```
backend/
├── requirements.txt            # Python dependencies
├── .env                       # Environment variables
├── .env.example               # Environment variables template
├── Dockerfile                 # Docker configuration
├── main.py                    # FastAPI application entry point
├── app/                       # Application source code
│   ├── __init__.py
│   ├── core/                  # Core application configuration
│   │   ├── __init__.py
│   │   ├── config.py          # Application settings
│   │   ├── database.py        # Database connection
│   │   └── security.py        # Security utilities
│   ├── models/                # Database models
│   │   ├── __init__.py
│   │   ├── user.py            # User model
│   │   ├── asset.py           # Asset model
│   │   ├── transaction.py     # Transaction model
│   │   └── insurance.py       # Insurance model
│   ├── schemas/               # Pydantic schemas for API
│   │   ├── __init__.py
│   │   ├── user.py            # User schemas
│   │   ├── asset.py           # Asset schemas
│   │   ├── transaction.py     # Transaction schemas
│   │   └── insurance.py       # Insurance schemas
│   ├── api/                   # API route handlers
│   │   ├── __init__.py
│   │   ├── deps.py            # Dependencies
│   │   └── v1/                # API version 1
│   │       ├── __init__.py
│   │       ├── auth.py        # Authentication endpoints
│   │       ├── dashboard.py   # Dashboard endpoints
│   │       ├── assets.py      # Asset endpoints
│   │       ├── transactions.py # Transaction endpoints
│   │       └── insurance.py   # Insurance endpoints
│   ├── services/              # Business logic services
│   │   ├── __init__.py
│   │   # (Future: asset_service.py, transaction_service.py, etc.)
│   └── utils/                 # Utility functions
│       ├── __init__.py
│       # (Future: calculations.py, validators.py, etc.)
├── tests/                     # Test files
│   ├── __init__.py
│   # (Future: test_assets.py, test_transactions.py, etc.)
└── alembic/                   # Database migrations
    ├── alembic.ini
    ├── env.py
    └── versions/
```

## Database Directory Structure

```
database/
├── schema.sql                 # Complete database schema
├── seed_data.sql             # Sample data for development (future)
├── migrations/               # Database migration scripts (future)
│   ├── 001_initial_schema.sql
│   └── ...
└── docs/                     # Database documentation (future)
    ├── ERD.md                # Entity Relationship Diagram
    └── SCHEMA_GUIDE.md       # Schema documentation
```

## Documentation Directory Structure

```
docs/
├── PROJECT_OVERVIEW.md       # High-level project description
├── FILE_STRUCTURE.md         # This file
├── SETUP_GUIDE.md           # Development setup instructions
├── DEPLOYMENT_GUIDE.md      # Production deployment guide
├── USER_GUIDE.md            # End-user documentation
├── API_DOCUMENTATION.md     # Backend API reference
├── DATABASE_SCHEMA.md       # Database design documentation
├── TODO.md                  # Development roadmap and tasks
```

## Key Configuration Files

### Frontend Configuration
- `package.json`: Defines Node.js dependencies, scripts, and project metadata
- `vite.config.js`: Vite build tool configuration
- `tailwind.config.js`: Tailwind CSS configuration for styling
- `.env.local`: Local environment variables for development

### Backend Configuration
- `requirements.txt`: Python package dependencies for production
- `main.py`: FastAPI application entry point and configuration
- `.env`: Environment variables for database connection and API keys

### Database Configuration
- `schema.sql`: Complete PostgreSQL database schema definition

This file structure is designed to support scalable development, clear separation of concerns, and easy maintenance. Each directory serves a specific purpose and contains related files organized logically for efficient development workflow.


