"""
Aura Asset Manager - FastAPI Backend Application
Main entry point for the FastAPI application.
Updated: July 25, 2025 - CORS Fix Deployment + Cache Invalidation Fix
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.api.v1 import auth, dashboard, assets, transactions, insurance, transaction_create, annuities, user_settings, feedback, profile, targets
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

# Get dynamic allowed origins - Fixed for Railway deployment
def get_allowed_origins():
    """Get allowed origins including dynamic ones."""
    base_origins = settings.ALLOWED_ORIGINS.copy()
    
    # For Railway deployment, always allow Vercel domains
    # Add specific Vercel domains to ensure CORS works
    vercel_domains = [
        "https://aura-asset-manager.vercel.app",
        "https://aura-asset-manager-git-main-cerebral-valley.vercel.app",
        "https://aura-asset-manager-cerebral-valley.vercel.app",
        # Add explicit www and non-www versions to be safe
        "https://www.aura-asset-manager.vercel.app"
    ]
    
    # Also allow all origins in development/testing to debug CORS issues
    # Remove this in production after testing
    if settings.ENVIRONMENT.lower() != "production":
        all_origins_allowed = True
        if all_origins_allowed:
            print("⚠️ WARNING: All origins allowed for debugging!")
            return ["*"]  # Allow all origins for testing
    
    for domain in vercel_domains:
        if domain not in base_origins:
            base_origins.append(domain)
    
    # Also allow wildcard for Vercel preview deployments
    print(f"🌐 Final CORS origins: {base_origins}")
    return base_origins

# Enhanced CORS configuration with debugging
origins = get_allowed_origins()
print(f"🔒 CORS: Adding middleware with origins: {origins}")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["Authorization", "Content-Type", "Accept", "Origin", "X-Requested-With", "Content-Length"],
    expose_headers=["Content-Length"],
    max_age=600,  # Cache preflight requests for 10 minutes
)

# Enhanced debugging for CORS/Auth errors
@app.middleware("http")
async def log_requests(request: Request, call_next):
    path = request.url.path
    method = request.method
    if '/targets/liquid-assets' in path:
        print(f"🔍 DEBUG REQUEST: {method} {path}")
        print(f"🔍 Headers: {dict(request.headers)}")
    response = await call_next(request)
    if '/targets/liquid-assets' in path:
        print(f"🔍 DEBUG RESPONSE: {response.status_code} for {method} {path}")
        print(f"🔍 Response Headers: {dict(response.headers)}")
    return response

# Include API routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["authentication"])
app.include_router(dashboard.router, prefix="/api/v1/dashboard", tags=["dashboard"])
app.include_router(assets.router, prefix="/api/v1/assets", tags=["assets"])
app.include_router(transactions.router, prefix="/api/v1/transactions", tags=["transactions"])
app.include_router(transaction_create.router, prefix="/api/v1/transaction_create", tags=["transaction-create"])
app.include_router(insurance.router, prefix="/api/v1/insurance", tags=["insurance"])
app.include_router(annuities.router, prefix="/api/v1/annuities", tags=["annuities"])
app.include_router(targets.router, prefix="/api/v1/targets", tags=["targets"])
app.include_router(user_settings.router, prefix="/api/v1/user-settings", tags=["user-settings"])
app.include_router(profile.router, prefix="/api/v1/profile", tags=["profile"])
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

