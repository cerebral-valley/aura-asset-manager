"""
Aura Asset Manager - FastAPI Backend Application
Main entry point for the FastAPI application.
Updated: July 25, 2025 - CORS Fix Deployment + Cache Invalidation Fix
"""

import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration

# Initialize Sentry for backend error tracking
sentry_sdk.init(
    dsn="https://27a3645cd8e778c6be27cf19eca40635@o4510169956679680.ingest.de.sentry.io/4510172314665040",
    integrations=[
        FastApiIntegration(),
        SqlalchemyIntegration(),
    ],
    # Set tracesSampleRate to 1.0 to capture 100%
    # of transactions for performance monitoring.
    traces_sample_rate=1.0,
    # Set profiles_sample_rate to 1.0 to profile 100%
    # of sampled transactions.
    # We recommend adjusting this value in production.
    profiles_sample_rate=1.0,
    environment="production",
)

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.api.v1 import auth, dashboard, assets, transactions, insurance, transaction_create, user_settings, feedback, profile, goals
# TODO: Re-enable after fixing metadata column name issue
# from app.api.v1 import payment_schedules

# Create FastAPI application instance
app = FastAPI(
    title="Aura Asset Manager API",
    description="Backend API for the Aura Personal Asset Manager",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Custom validation exception handler for debugging
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    print(f"🚨 Validation Error Details:")
    print(f"   URL: {request.url}")
    print(f"   Method: {request.method}")
    print(f"   Headers: {dict(request.headers)}")
    
    body_content = None
    try:
        body = await request.body()
        body_content = body.decode() if body else None
        print(f"   Body: {body_content}")
    except Exception as e:
        print(f"   Body read error: {e}")
    
    print(f"   Validation errors: {exc.errors()}")
    print(f"   Full exception: {exc}")
    
    # Return the default FastAPI validation error response
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors(), "body": body_content}
    )

# Debug: Log CORS configuration
print(f"🌐 CORS Configuration:")
print(f"   Allowed Origins: {settings.ALLOWED_ORIGINS}")
print(f"   Environment: {settings.ENVIRONMENT}")

# Configure CORS with dynamic origin checking for Vercel
def is_allowed_origin(origin: str) -> bool:
    """Check if origin is allowed, including dynamic Vercel URLs."""
    if not origin:
        return False
    
    # Check exact matches first
    if origin in settings.ALLOWED_ORIGINS:
        return True
    
    # Allow Vercel preview deployments
    import re
    vercel_patterns = [
        r'https://aura-asset-manager.*\.vercel\.app$',
        r'https://.*--aura-asset-manager.*\.vercel\.app$'
    ]
    
    for pattern in vercel_patterns:
        if re.match(pattern, origin):
            return True
    
    return False

# Get dynamic allowed origins - SECURE: No wildcard origins
def get_allowed_origins():
    """Get allowed origins including dynamic Vercel preview deployments."""
    base_origins = settings.ALLOWED_ORIGINS.copy()
    
    # Add specific Vercel domains for production
    additional_vercel_domains = [
        "https://www.aura-asset-manager.vercel.app"
    ]
    
    for domain in additional_vercel_domains:
        if domain not in base_origins:
            base_origins.append(domain)
    
    print(f"🔒 SECURE CORS: Using explicit origins: {base_origins}")
    return base_origins

# SECURE CORS configuration
origins = get_allowed_origins()
print(f"🔒 CORS: Adding middleware with secure origins: {origins}")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["Authorization", "Content-Type", "Accept", "Origin", 
                   "X-Requested-With", "Content-Length"],
    expose_headers=["Content-Length"],
    max_age=600,  # Cache preflight requests for 10 minutes
)

# Enhanced debugging for CORS/Auth errors + CSP Security Headers
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    """Add security headers including CSP for Sentry integration."""
    method = request.method
    path = str(request.url.path)
    response = await call_next(request)
    
    # Add Content Security Policy (CSP) headers
    # This allows Sentry integration while maintaining security
    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; "
        "connect-src 'self' "
        "https://*.sentry.io "
        "https://o4510169956679680.ingest.de.sentry.io "
        "https://aura-asset-manager-production.up.railway.app "
        "https://api.supabase.com "
        "https://buuyvrysvjwqqfoyfbdr.supabase.co; "
        "img-src 'self' data: https:; "
        "script-src 'self' 'unsafe-inline'; "
        "style-src 'self' 'unsafe-inline'; "
        "font-src 'self' data:; "
        "frame-ancestors 'none'; "
        "base-uri 'self';"
    )
    
    # Additional security headers
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
    
    # HSTS in production
    if settings.ENVIRONMENT == "production":
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    
    return response

# Include API routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["authentication"])
app.include_router(dashboard.router, prefix="/api/v1/dashboard", tags=["dashboard"])
app.include_router(assets.router, prefix="/api/v1/assets", tags=["assets"])
app.include_router(transactions.router, prefix="/api/v1/transactions", tags=["transactions"])
app.include_router(transaction_create.router, prefix="/api/v1/transaction_create", tags=["transaction-create"])
app.include_router(insurance.router, prefix="/api/v1/insurance", tags=["insurance"])
app.include_router(user_settings.router, prefix="/api/v1/user-settings", tags=["user-settings"])
app.include_router(profile.router, prefix="/api/v1/profile", tags=["profile"])
app.include_router(goals.router, prefix="/api/v1/goals", tags=["goals"])
# TODO: Re-enable after fixing metadata column name issue
# app.include_router(payment_schedules.router, prefix="/api/v1/payment-schedules", tags=["payment-schedules"])
app.include_router(feedback.router, prefix="/api/v1", tags=["feedback"])

@app.get("/")
async def root():
    """Root endpoint for health check."""
    return {"message": "Aura Asset Manager API is running"}

@app.get("/cors-debug")
async def cors_debug():
    """Debug endpoint to check CORS configuration."""
    return {
        "allowed_origins": settings.ALLOWED_ORIGINS,
        "environment": settings.ENVIRONMENT,
        "is_production": settings.is_production,
        "message": "CORS Debug Info"
    }

# Sentry Tunnel Endpoint - Routes Sentry requests through backend to avoid CORS
@app.post("/api/v1/sentry-tunnel")
async def sentry_tunnel(request: Request):
    """
    Sentry tunnel to avoid CORS issues and ad-blocker blocking.
    Forwards Sentry envelope data from frontend to Sentry's ingestion API.
    """
    import httpx
    
    try:
        # Get the raw request body (Sentry envelope format)
        envelope_data = await request.body()
        
        # Sentry ingestion URL from your DSN
        sentry_dsn_host = "https://o4510169956679680.ingest.de.sentry.io"
        sentry_project_id = "4510172314665040"
        tunnel_url = f"{sentry_dsn_host}/api/{sentry_project_id}/envelope/"
        
        # Forward the request to Sentry with proper headers
        headers = {
            "Content-Type": "application/x-sentry-envelope",
            "User-Agent": request.headers.get("user-agent", ""),
        }
        
        # Forward to Sentry's ingestion API
        async with httpx.AsyncClient() as client:
            response = await client.post(
                tunnel_url,
                content=envelope_data,
                headers=headers,
                timeout=10.0
            )
            
        # Return success response to frontend
        return JSONResponse(
            status_code=response.status_code,
            content={"status": "forwarded", "sentry_status": response.status_code}
        )
        
    except Exception as e:
        print(f"Sentry tunnel error: {e}")
        return JSONResponse(
            status_code=500,
            content={"error": "Tunnel failed", "detail": str(e)}
        )

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "version": "1.0.0"}

if __name__ == "__main__":
    import os
    import uvicorn
    # Change directory to backend before running uvicorn
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    if settings.ENVIRONMENT == "development":
        uvicorn.run(
            "main:app",
            host="0.0.0.0",
            port=8000,
            reload=True
        )
    else:
        uvicorn.run(
            "main:app",
            host="0.0.0.0",
            port=8000
        )

