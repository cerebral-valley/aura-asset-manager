"""
Aura Asset Manager - FastAPI Backend Application
Main entry point for the FastAPI application.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1 import auth, dashboard, assets, transactions, insurance

# Create FastAPI application instance
app = FastAPI(
    title="Aura Asset Manager API",
    description="Backend API for the Aura Personal Asset Manager",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Debug: Log CORS configuration
print(f"🌐 CORS Configuration:")
print(f"   Allowed Origins: {settings.ALLOWED_ORIGINS}")
print(f"   Environment: {settings.ENVIRONMENT}")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["authentication"])
app.include_router(dashboard.router, prefix="/api/v1/dashboard", tags=["dashboard"])
app.include_router(assets.router, prefix="/api/v1/assets", tags=["assets"])
app.include_router(transactions.router, prefix="/api/v1/transactions", tags=["transactions"])
app.include_router(insurance.router, prefix="/api/v1/insurance", tags=["insurance"])

@app.get("/")
async def root():
    """Root endpoint for health check."""
    return {"message": "Aura Asset Manager API is running"}

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "version": "1.0.0"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True if settings.ENVIRONMENT == "development" else False
    )

