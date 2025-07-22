# Aura Asset Manager - Development Setup Guide

This comprehensive guide will walk you through setting up the Aura Asset Manager application for local development. The application consists of a React frontend, Python FastAPI backend, and PostgreSQL database hosted on Supabase.

## Prerequisites

Before beginning the setup process, ensure you have the following software installed on your development machine:

### Required Software

**Node.js and pnpm**: The frontend application requires Node.js version 18 or higher. We recommend using pnpm as the package manager for better performance and disk space efficiency. You can install Node.js from the official website and then install pnpm globally using `npm install -g pnpm`.

**Python**: The backend application requires Python 3.11 or higher. Ensure you have Python installed with pip package manager. You can verify your Python installation by running `python --version` in your terminal.

**Git**: Version control is essential for managing the codebase. Install Git from the official website if it's not already available on your system.

**Code Editor**: While any text editor will work, we recommend Visual Studio Code with the following extensions for the best development experience: Python, ES7+ React/Redux/React-Native snippets, Tailwind CSS IntelliSense, and Prettier.

### Supabase Account Setup

The application uses Supabase as the backend-as-a-service platform for authentication and database management. You'll need to create a Supabase account and set up a new project before proceeding with the local setup.

Navigate to the Supabase website and create a free account if you don't already have one. Once logged in, create a new project by clicking the "New Project" button. Choose an organization, provide a project name (such as "aura-asset-manager"), set a secure database password, and select a region closest to your location for optimal performance.

After creating the project, you'll need to gather several important configuration values. In your Supabase dashboard, navigate to the "Settings" section and then to "API". Here you'll find your Project URL and the anon/public API key. Additionally, go to the "Database" section to find your database connection string. Keep these values secure as you'll need them for both the frontend and backend configuration.

## Database Setup

The first step in setting up the application is configuring the PostgreSQL database schema in your Supabase project.

### Schema Installation

Navigate to the Supabase dashboard for your project and go to the "SQL Editor" section. Here you'll execute the database schema that defines all the tables and relationships needed for the Aura application.

Copy the contents of the `database/schema.sql` file from the project repository. This file contains the complete database schema including tables for users, assets, transactions, and insurance policies. Paste the SQL code into the Supabase SQL editor and execute it by clicking the "Run" button.

The schema includes several important features that are worth understanding. Row Level Security (RLS) policies are automatically configured to ensure that users can only access their own data. This is crucial for maintaining data privacy and security in a multi-user application. The schema also includes indexes for optimal query performance and triggers for automatically updating timestamp fields.

After executing the schema, you should see four main tables in your database: users, assets, transactions, and insurance_policies. Each table includes appropriate foreign key relationships and constraints to maintain data integrity.

### Verification

To verify that the schema was installed correctly, navigate to the "Table Editor" in your Supabase dashboard. You should see all four tables listed, and you can click on each one to view its structure. The tables should be empty initially, which is expected for a fresh installation.

## Backend Setup

The Python FastAPI backend serves as the API layer between the frontend application and the Supabase database. Setting up the backend involves installing dependencies, configuring environment variables, and starting the development server.

### Environment Configuration

Navigate to the `backend` directory in your project and create a new file named `.env`. This file will contain all the sensitive configuration values needed for the backend to connect to your Supabase database and provide API services.

Copy the contents of the `.env.example` file and update the values with your actual Supabase configuration. The `SUPABASE_URL` should be set to your project URL from the Supabase dashboard. The `SUPABASE_KEY` should be set to your anon/public API key. The `SUPABASE_SERVICE_KEY` should be set to your service role key, which you can find in the same API settings section.

The `DATABASE_URL` should be constructed using your Supabase database connection details. It follows the format: `postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres`. Replace the placeholders with your actual project reference and database password.

Generate a secure secret key for JWT token signing by running `python -c "import secrets; print(secrets.token_urlsafe(32))"` and use the output as your `SECRET_KEY` value. The `ALLOWED_ORIGINS` should include your frontend URL, typically `http://localhost:3000` for local development.

### Dependency Installation

With the environment configured, install the Python dependencies using pip. It's recommended to use a virtual environment to isolate the project dependencies from your system Python installation.

Create a virtual environment by running `python -m venv venv` in the backend directory. Activate the virtual environment using `source venv/bin/activate` on macOS/Linux or `venv\Scripts\activate` on Windows. Then install the dependencies using `pip install -r requirements.txt`.

The requirements file includes all necessary packages including FastAPI for the web framework, SQLAlchemy for database operations, Supabase client libraries, and various utility packages for authentication and data validation.

### Starting the Backend Server

Once dependencies are installed and the environment is configured, you can start the backend development server. Run `python main.py` from the backend directory. The server should start on port 8000 and display startup messages indicating successful initialization.

You can verify the backend is working correctly by navigating to `http://localhost:8000/docs` in your web browser. This will display the automatically generated API documentation provided by FastAPI. You should see all the available endpoints organized by category: authentication, dashboard, assets, transactions, and insurance.

## Frontend Setup

The React frontend provides the user interface for the Aura application. It's built using modern React patterns with hooks, context for state management, and Tailwind CSS for styling.

### Environment Configuration

Navigate to the `frontend` directory and create a `.env.local` file. This file contains the environment variables needed for the frontend to connect to both Supabase for authentication and your backend API for data operations.

Copy the contents of the `.env.example` file and update the values. Set `VITE_SUPABASE_URL` to your Supabase project URL and `VITE_SUPABASE_ANON_KEY` to your anon/public API key. Set `VITE_API_BASE_URL` to `http://localhost:8000/api/v1` to point to your local backend server.

### Dependency Installation

Install the frontend dependencies using pnpm. Run `pnpm install` from the `frontend` directory. This will install all necessary packages including React, the Supabase client, Axios for API calls, and various UI components and styling libraries.

The project uses several key libraries that enhance the development experience and user interface. Tailwind CSS provides utility-first styling, shadcn/ui provides pre-built accessible components, Lucide React provides icons, and Recharts provides data visualization components.

### Starting the Frontend Start the frontend development server by running `pnpm run dev` from the `frontend` directory. The development server will start on port 3000 and automatically open your default web browser to display the application.

The development server includes hot module replacement, which means changes to your code will be reflected immediately in the browser without requiring a full page refresh. This significantly speeds up the development process.

## Testing the Complete Setup

With both the backend and frontend servers running, you can now test the complete application setup to ensure everything is working correctly.

### User Registration and Authentication

Navigate to `http://localhost:3000` in your web browser. You should see the Aura login screen with options to sign in or sign up. Create a new account by clicking "Don't have an account? Sign up" and providing an email address and password.

Supabase will handle the authentication process, including sending a confirmation email if email confirmation is enabled in your project settings. Once you've confirmed your email (if required), you should be able to sign in and access the main dashboard.

### Dashboard Functionality

After signing in, you should see the Aura dashboard with sections for your net worth, insurance coverage, and asset allocation. Initially, these will show zero values since no data has been entered yet. The dashboard should display without errors and show the appropriate theme-based language based on your user preferences.

### API Connectivity

Open your browser's developer tools and navigate to the Network tab. Refresh the dashboard page and observe the network requests. You should see successful API calls to your backend server for dashboard data, indicating that the frontend is correctly communicating with the backend.

## Troubleshooting Common Issues

During the setup process, you may encounter several common issues. Here are solutions to the most frequently encountered problems.

### Database Connection Issues

If the backend fails to start with database connection errors, verify that your `DATABASE_URL` is correctly formatted and that your Supabase project is active. Check that the database password in the connection string matches the password you set when creating the Supabase project.

### Authentication Problems

If users cannot sign up or sign in, check that your Supabase project has the correct authentication settings enabled. In the Supabase dashboard, navigate to Authentication > Settings and ensure that "Enable email confirmations" is configured according to your needs. Also verify that your frontend environment variables match your Supabase project configuration.

### CORS Errors

If you see Cross-Origin Resource Sharing (CORS) errors in the browser console, ensure that your backend `ALLOWED_ORIGINS` environment variable includes your frontend URL. The backend is configured to accept requests from the origins listed in this variable.

### Port Conflicts

If either server fails to start due to port conflicts, you can modify the ports used by each service. For the backend, change the port in `main.py`. For the frontend, you can specify a different port using `pnpm run dev --port 3001`.

This completes the development setup for the Aura Asset Manager application. With both servers running and properly configured, you're ready to begin development or testing of the application features.

